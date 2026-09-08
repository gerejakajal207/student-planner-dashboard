import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db

import httpx
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv(override=True)

router = APIRouter(tags=["Auth & Users"])

RESET_TOKEN_EXPIRE_MINUTES = 15


def _get_email_content(name: str, reset_link: str):
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
    return text_body, html_body


def _send_via_brevo(api_key: str, mail_from: str, mail_from_name: str, to_email: str, name: str, subject: str, html_content: str, text_content: str) -> bool:
    """Send transactional email via Brevo HTTP API (Port 443 HTTPS - Works on Render Free Tier)."""
    try:
        print(f"[Email Service] Sending via Brevo API (HTTPS port 443) to {to_email}...")
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json"
        }
        payload = {
            "sender": {"name": mail_from_name, "email": mail_from},
            "to": [{"email": to_email, "name": name or to_email}],
            "subject": subject,
            "htmlContent": html_content,
            "textContent": text_content
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code in (200, 201):
                print(f"[Email Service] ✅ Successfully sent via Brevo HTTP API to {to_email}")
                return True
            else:
                print(f"[Email Service] ❌ Brevo API returned {resp.status_code}: {resp.text}")
                return False
    except Exception as e:
        print(f"[Email Service] ❌ Brevo HTTP error: {e}")
        return False


def _send_via_resend(api_key: str, mail_from: str, mail_from_name: str, to_email: str, subject: str, html_content: str, text_content: str) -> bool:
    """Send transactional email via Resend HTTP API (Port 443 HTTPS - Works on Render Free Tier)."""
    try:
        print(f"[Email Service] Sending via Resend API (HTTPS port 443) to {to_email}...")
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        sender_email = mail_from if ("@" in mail_from and not mail_from.endswith("@gmail.com")) else "onboarding@resend.dev"
        payload = {
            "from": f"{mail_from_name} <{sender_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
            "text": text_content
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code in (200, 201):
                print(f"[Email Service] ✅ Successfully sent via Resend HTTP API to {to_email}")
                return True
            else:
                print(f"[Email Service] ❌ Resend API returned {resp.status_code}: {resp.text}")
                return False
    except Exception as e:
        print(f"[Email Service] ❌ Resend HTTP error: {e}")
        return False


def _send_via_smtp(mail_server: str, mail_port: int, mail_user: str, mail_pass: str,
                   mail_from: str, to_email: str, subject: str, text_body: str, html_body: str) -> bool:
    """Fallback to direct SMTP (Note: Render Free Tier blocks outbound SMTP ports 25, 465, 587)."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"FocusNest <{mail_from}>"
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    # Attempt 1: Port 465 (SSL)
    try:
        print(f"[Email Service] Trying SMTP_SSL on {mail_server}:465...")
        with smtplib.SMTP_SSL(mail_server, 465, timeout=5) as server:
            server.login(mail_user, mail_pass)
            server.sendmail(mail_from, [to_email], msg.as_string())
        print(f"[Email Service] ✅ Sent via SSL:465 to {to_email}")
        return True
    except Exception as e:
        print(f"[Email Service] ⚠️ SSL:465 failed (likely Render port block): {e}")

    # Attempt 2: Port 587 (STARTTLS)
    try:
        print(f"[Email Service] Trying STARTTLS on {mail_server}:587...")
        with smtplib.SMTP(mail_server, 587, timeout=5) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(mail_user, mail_pass)
            server.sendmail(mail_from, [to_email], msg.as_string())
        print(f"[Email Service] ✅ Sent via STARTTLS:587 to {to_email}")
        return True
    except Exception as e:
        print(f"[Email Service] ⚠️ STARTTLS:587 failed (likely Render port block): {e}")

    return False


def _send_reset_email(email: str, name: str, token: str):
    load_dotenv(override=True)
    frontend_url = os.getenv("FRONTEND_URL", "https://student-planner-dashboard-lemon.vercel.app").rstrip("/")
    reset_link = f"{frontend_url}/reset-password?token={token}"

    print(f"\n==================================================")
    print(f"[Email Service] 🔑 PASSWORD RESET REQUESTED FOR: {email}")
    print(f"[Email Service] 🔗 RESET LINK: {reset_link}")
    print(f"==================================================\n")

    text_body, html_body = _get_email_content(name, reset_link)
    subject = "Reset your FocusNest password"

    # Priority 1: Brevo HTTP API (recommended for Render free tier)
    brevo_key = os.getenv("BREVO_API_KEY", "").strip().strip("\"'")
    mail_user = os.getenv("MAIL_USERNAME", "").strip().strip("\"'")
    mail_pass = os.getenv("MAIL_PASSWORD", "").strip().strip("\"'")
    mail_from = (os.getenv("MAIL_FROM") or mail_user or "focusnest.auth@gmail.com").strip().strip("\"'")
    mail_from_name = os.getenv("MAIL_FROM_NAME", "FocusNest").strip().strip("\"'")

    if brevo_key:
        if _send_via_brevo(brevo_key, mail_from, mail_from_name, email, name, subject, html_body, text_body):
            return True

    # Priority 2: Resend HTTP API
    resend_key = os.getenv("RESEND_API_KEY", "").strip().strip("\"'")
    if resend_key:
        if _send_via_resend(resend_key, mail_from, mail_from_name, email, subject, html_body, text_body):
            return True

    # Priority 3: Direct SMTP fallback (works on localhost / paid cloud)
    if mail_user and mail_pass:
        mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com").strip().strip("\"'")
        try:
            mail_port = int(os.getenv("MAIL_PORT", "465"))
        except ValueError:
            mail_port = 465

        if _send_via_smtp(mail_server, mail_port, mail_user, mail_pass, mail_from, email, subject, text_body, html_body):
            return True

    print(f"[Email Service] ⚠️ Notice: Direct SMTP is blocked on Render free tier. To enable instant email delivery, set BREVO_API_KEY or RESEND_API_KEY in Render environment variables.")
    return False


@router.get("/auth/smtp-status")
def get_smtp_status():
    load_dotenv(override=True)
    mail_user = os.getenv("MAIL_USERNAME", "").strip().strip("\"'")
    mail_pass = os.getenv("MAIL_PASSWORD", "").strip().strip("\"'")
    brevo_key = os.getenv("BREVO_API_KEY", "").strip().strip("\"'")
    resend_key = os.getenv("RESEND_API_KEY", "").strip().strip("\"'")

    active_provider = "none"
    if brevo_key:
        active_provider = "brevo_api (HTTPS 443 - Recommended for Render)"
    elif resend_key:
        active_provider = "resend_api (HTTPS 443)"
    elif mail_user and mail_pass:
        active_provider = "smtp_direct (Note: Render Free Tier blocks SMTP ports 25, 465, 587)"

    return {
        "active_provider": active_provider,
        "brevo_configured": bool(brevo_key),
        "resend_configured": bool(resend_key),
        "smtp_configured": bool(mail_user and mail_pass),
        "mail_username_preview": f"{mail_user[:3]}***@{mail_user.split('@')[-1]}" if "@" in mail_user else (mail_user[:3] + "***" if mail_user else ""),
        "render_notice": "Render free tier blocks SMTP ports 25, 465, 587. Adding BREVO_API_KEY (free at brevo.com) uses HTTPS port 443 which is never blocked.",
        "frontend_url": os.getenv("FRONTEND_URL", "https://student-planner-dashboard-lemon.vercel.app")
    }


@router.post("/auth/test-smtp")
def test_smtp():
    """Diagnostic endpoint to test email delivery."""
    load_dotenv(override=True)
    target = os.getenv("MAIL_USERNAME", "focusnest.auth@gmail.com").strip().strip("\"'")
    success = _send_reset_email(target, "Test Admin", "test-token-12345")
    return {
        "attempted_recipient": target,
        "success": success,
        "notice": "Check Render Dashboard -> Logs for the complete delivery trace or direct reset link."
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

    # Dispatch email asynchronously in background so response is immediate
    background_tasks.add_task(_send_reset_email, user.email, user.name, raw_token)

    return SAFE_MSG


@router.get("/auth/dev/latest-reset-link")
def get_latest_reset_link(email: str, db: Session = Depends(get_db)):
    """Helper to retrieve the latest valid reset link for an email (Useful during development/testing)."""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token_record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == False
    ).order_by(models.PasswordResetToken.id.desc()).first()

    if not token_record:
        raise HTTPException(status_code=404, detail="No active reset token found")

    frontend_url = os.getenv("FRONTEND_URL", "https://student-planner-dashboard-lemon.vercel.app").rstrip("/")
    return {
        "email": email,
        "reset_link": f"{frontend_url}/reset-password?token={token_record.token}",
        "expires_at": token_record.expires_at
    }


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
