import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv(override=True)

router = APIRouter(tags=["Auth & Users"])

RESET_TOKEN_EXPIRE_MINUTES = 15


def _build_email_message(to_email: str, name: str, reset_link: str, mail_from: str, mail_from_name: str) -> MIMEMultipart:
    text_body = f"""Hi {name},

We received a request to reset your FocusNest password.
Click the link below to set a new password:
{reset_link}

This link is valid for 15 minutes.
If you didn't request this, you can safely ignore this email.

FocusNest • Student Productivity Platform"""

    html_body = f"""
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#f8faff;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:32px;">&#127919;</span>
        <h2 style="color:#4f46e5;margin:8px 0 0;">FocusNest</h2>
      </div>
      <h3 style="color:#1e293b;">Password Reset Request</h3>
      <p style="color:#475569;">Hi <strong>{name}</strong>,</p>
      <p style="color:#475569;">
        We received a request to reset your FocusNest password.
        Click the button below to set a new password.
        This link is valid for <strong>15 minutes</strong>.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{reset_link}"
           style="background:#4f46e5;color:#fff;padding:14px 32px;border-radius:8px;
                  text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color:#94a3b8;font-size:13px;">
        If you didn't request this, you can safely ignore this email — your password won't change.
      </p>
      <p style="color:#94a3b8;font-size:12px;">
        Or copy this link into your browser:<br/>
        <a href="{reset_link}" style="color:#6366f1;">{reset_link}</a>
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
      <p style="color:#cbd5e1;font-size:12px;text-align:center;">
        &copy; FocusNest &middot; Student Productivity Platform
      </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your FocusNest password"
    msg["From"] = f"{mail_from_name} <{mail_from}>"
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    return msg


def _get_smtp_config():
    load_dotenv(override=True)
    mail_user = os.getenv("MAIL_USERNAME", "").strip().strip("\"'")
    mail_pass = os.getenv("MAIL_PASSWORD", "").strip().strip("\"'")
    mail_from = (os.getenv("MAIL_FROM") or mail_user).strip().strip("\"'")
    mail_from_name = os.getenv("MAIL_FROM_NAME", "FocusNest").strip().strip("\"'")
    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com").strip().strip("\"'")
    try:
        mail_port = int(os.getenv("MAIL_PORT", "465"))
    except ValueError:
        mail_port = 465
    return mail_user, mail_pass, mail_from, mail_from_name, mail_server, mail_port


def _send_via_smtp(mail_server: str, mail_port: int, mail_user: str, mail_pass: str,
                   mail_from: str, to_email: str, msg: MIMEMultipart):
    """Try SSL first (port 465), then fall back to STARTTLS (port 587)."""
    errors = []

    # Attempt 1: SMTP_SSL on port 465
    try:
        print(f"[Email Service] Trying SMTP_SSL on {mail_server}:465...")
        with smtplib.SMTP_SSL(mail_server, 465, timeout=20) as server:
            server.login(mail_user, mail_pass)
            server.sendmail(mail_from, [to_email], msg.as_string())
        print(f"[Email Service] ✅ Sent via SSL:465 to {to_email}")
        return True
    except Exception as e:
        errors.append(f"SSL:465 → {e}")
        print(f"[Email Service] ⚠️ SSL:465 failed: {e}")

    # Attempt 2: STARTTLS on port 587
    try:
        print(f"[Email Service] Trying STARTTLS on {mail_server}:587...")
        with smtplib.SMTP(mail_server, 587, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(mail_user, mail_pass)
            server.sendmail(mail_from, [to_email], msg.as_string())
        print(f"[Email Service] ✅ Sent via STARTTLS:587 to {to_email}")
        return True
    except Exception as e:
        errors.append(f"STARTTLS:587 → {e}")
        print(f"[Email Service] ⚠️ STARTTLS:587 failed: {e}")

    print(f"[Email Service] ❌ All SMTP attempts failed for {to_email}: {errors}")
    return False


def _send_reset_email(email: str, name: str, token: str):
    mail_user, mail_pass, mail_from, mail_from_name, mail_server, mail_port = _get_smtp_config()
    frontend_url = os.getenv("FRONTEND_URL", "https://student-planner-dashboard-lemon.vercel.app").rstrip("/")
    reset_link = f"{frontend_url}/reset-password?token={token}"

    if not mail_user or not mail_pass:
        print(f"[Email Service] ⚠️ MAIL_USERNAME or MAIL_PASSWORD not set — cannot send email.")
        print(f"[Email Service] Reset link for {email}: {reset_link}")
        return

    msg = _build_email_message(email, name, reset_link, mail_from, mail_from_name)
    _send_via_smtp(mail_server, mail_port, mail_user, mail_pass, mail_from, email, msg)


@router.get("/auth/smtp-status")
def get_smtp_status():
    mail_user, mail_pass, mail_from, mail_from_name, mail_server, mail_port = _get_smtp_config()
    return {
        "is_configured": bool(mail_user and mail_pass),
        "mail_username_set": bool(mail_user),
        "mail_password_set": bool(mail_pass),
        "mail_username_preview": f"{mail_user[:3]}***@{mail_user.split('@')[-1]}" if "@" in mail_user else (mail_user[:3] + "***" if mail_user else ""),
        "mail_server": mail_server,
        "mail_port": mail_port,
        "frontend_url": os.getenv("FRONTEND_URL", "https://student-planner-dashboard-lemon.vercel.app")
    }


@router.post("/auth/test-smtp")
def test_smtp(db: Session = Depends(get_db)):
    """Debug endpoint: sends a test email using current SMTP config. Remove in production."""
    mail_user, mail_pass, mail_from, mail_from_name, mail_server, mail_port = _get_smtp_config()

    if not mail_user or not mail_pass:
        return {"success": False, "error": "MAIL_USERNAME or MAIL_PASSWORD not configured"}

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "FocusNest SMTP Test"
    msg["From"] = f"{mail_from_name} <{mail_from}>"
    msg["To"] = mail_user
    msg.attach(MIMEText("This is a test email from FocusNest backend. SMTP is working!", "plain", "utf-8"))

    ok = _send_via_smtp(mail_server, mail_port, mail_user, mail_pass, mail_from, mail_user, msg)
    if ok:
        return {"success": True, "message": f"Test email sent to {mail_user}"}
    return {"success": False, "error": "All SMTP connection attempts failed. Check Render logs for details."}


# ── Auth endpoints ────────────────────────────────────────────────────────────

@router.post("/auth/register", response_model=schemas.Token)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    user = models.User(
        name=data.name,
        email=data.email,
        bio="",
        hashed_password=auth.hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth.create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/auth/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = auth.create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/auth/forgot-password")
async def forgot_password(
    data: schemas.ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    SAFE_MSG = {"message": "If that email is registered, a password reset link has been sent."}

    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        return SAFE_MSG

    # Invalidate all previous unused tokens for this user
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == False,  # noqa: E712
    ).update({"used": True})
    db.commit()

    # Create new token valid for 15 minutes
    raw_token = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    reset_token = models.PasswordResetToken(
        token=raw_token,
        user_id=user.id,
        expires_at=expires_at,
        used=False,
    )
    db.add(reset_token)
    db.commit()

    try:
        _send_reset_email(user.email, user.name, raw_token)
    except Exception as e:
        print(f"[Email Service] Error in forgot_password email dispatch: {e}")

    return SAFE_MSG


@router.post("/auth/reset-password")
def reset_password(
    data: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    INVALID = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="This reset link is invalid or has expired."
    )

    record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == data.token
    ).first()

    if not record or record.used:
        raise INVALID

    now_utc = datetime.now(timezone.utc)
    expires = record.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if now_utc > expires:
        record.used = True
        db.commit()
        raise INVALID

    record.user.hashed_password = auth.hash_password(data.new_password)
    record.used = True
    db.commit()

    return {"message": "Password reset successfully. You can now log in with your new password."}


# ── User profile endpoints ────────────────────────────────────────────────────

@router.get("/users/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.patch("/users/me", response_model=schemas.UserOut)
def update_profile(
    data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if data.name is not None:
        current_user.name = data.name
    if data.bio is not None:
        current_user.bio = data.bio
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/users/me/password")
def change_password(
    data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not auth.verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    current_user.hashed_password = auth.hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
