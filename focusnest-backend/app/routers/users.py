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


def _send_reset_email(email: str, name: str, token: str):
    load_dotenv(override=True)
    frontend_url = os.getenv("FRONTEND_URL", "https://student-planner-dashboard-lemon.vercel.app").rstrip("/")
    reset_link = f"{frontend_url}/reset-password?token={token}"

    mail_user = os.getenv("MAIL_USERNAME", "").strip()
    mail_pass = os.getenv("MAIL_PASSWORD", "").strip()
    mail_from = os.getenv("MAIL_FROM", "").strip() or mail_user
    mail_from_name = os.getenv("MAIL_FROM_NAME", "FocusNest").strip()
    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com").strip()
    
    try:
        mail_port = int(os.getenv("MAIL_PORT", "587"))
    except ValueError:
        mail_port = 587

    if not mail_user or not mail_pass:
        print(f"[Email Service] ⚠️ Warning: MAIL_USERNAME or MAIL_PASSWORD not configured in server environment variables.")
        print(f"[Email Service] Password Reset Link for {email}: {reset_link}")
        return

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
    msg["To"] = email
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if mail_port == 465:
            with smtplib.SMTP_SSL(mail_server, 465, timeout=20) as server:
                server.login(mail_user, mail_pass)
                server.sendmail(mail_from, [email], msg.as_string())
        else:
            with smtplib.SMTP(mail_server, mail_port, timeout=20) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(mail_user, mail_pass)
                server.sendmail(mail_from, [email], msg.as_string())

        print(f"[Email Service] ✅ Successfully sent password reset email to {email}")
    except Exception as e:
        print(f"[Email Service] ❌ SMTP Error sending email to {email}: {e}")


@router.get("/auth/smtp-status")
def get_smtp_status():
    load_dotenv(override=True)
    mail_user = os.getenv("MAIL_USERNAME", "").strip()
    mail_pass = os.getenv("MAIL_PASSWORD", "").strip()
    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com").strip()
    mail_port = os.getenv("MAIL_PORT", "587").strip()
    
    return {
        "is_configured": bool(mail_user and mail_pass),
        "mail_username_set": bool(mail_user),
        "mail_password_set": bool(mail_pass),
        "mail_username_preview": f"{mail_user[:3]}***@{mail_user.split('@')[-1]}" if "@" in mail_user else (mail_user[:3] + "***" if mail_user else ""),
        "mail_server": mail_server,
        "mail_port": mail_port,
        "frontend_url": os.getenv("FRONTEND_URL", "https://student-planner-dashboard-lemon.vercel.app")
    }


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

    background_tasks.add_task(_send_reset_email, user.email, user.name, raw_token)

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
