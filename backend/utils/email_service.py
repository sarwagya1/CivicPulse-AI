"""
CivicPulse AI — Email Notification Service
============================================
Sends professional HTML confirmation emails upon successful civic grievance submission.
Styled with a clean, trustworthy, light civic design matching the CivicPulse AI website.

Configured via environment variables:
- SMTP_HOST (e.g. smtp.gmail.com)
- SMTP_PORT (e.g. 587)
- SMTP_USER (e.g. alerts@civicpulse.gov.in)
- SMTP_PASSWORD (e.g. app-specific password)
- SMTP_FROM (optional, defaults to SMTP_USER)
- SMTP_USE_TLS (default True)

If SMTP is unconfigured or unreachable, email delivery fails gracefully without
interfering with grievance registration.
"""

import os
import smtplib
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Ensure backend .env is always loaded regardless of execution context or CWD
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if _ENV_PATH.exists():
    load_dotenv(_ENV_PATH)


def build_grievance_email_content(
    citizen_name: str,
    grievance_id: str,
    tracking_token: str,
    department: str,
    location: str,
    description: str,
    severity_level: str,
    estimated_resolution: str,
    portal_name: str = "Relevant Government Department",
    helpline: str = "1800-11-4000",
) -> tuple[str, str]:
    """
    Constructs the plain-text and HTML versions of the grievance confirmation email.
    Uses light, high-contrast civic styling aligned with the redesigned website.
    """
    # Plain text version for non-HTML email clients
    text_content = f"""CivicPulse AI — Grievance Registration Confirmation
===================================================

Dear {citizen_name or 'Citizen'},

Your civic grievance has been successfully registered on the CivicPulse AI triage platform.

GRIEVANCE DETAILS:
------------------
• Grievance ID:          {grievance_id}
• Tracking Token:        {tracking_token}
• Assigned Department:   {department}
• Reported Location:     {location}
• Assessed Severity:     {severity_level}
• Expected Resolution:   {estimated_resolution}
• Competent Authority:   {portal_name}
• Official Helpline:     {helpline}

REPORTED ISSUE:
---------------
"{description}"

HOW TO TRACK YOUR GRIEVANCE:
----------------------------
Visit http://localhost:5173/grievance and enter your Tracking Token: {tracking_token}
to inspect live progress, SLA countdown, and departmental triage updates.

OFFICIAL SUBMISSION NOTE:
-------------------------
CivicPulse AI is an independent automated triage and SLA monitoring system. You can also file
directly with the competent government authority using the official portal links provided on your dashboard.

---
CivicPulse AI • Built for NITroFORGE Hackathon • Real Gov APIs • No Mock Data
"""

    # High-contrast, WCAG-compliant severity badge styling (matches website)
    severity_styles = {
        "CRITICAL": {
            "bg": "#fee2e2",
            "text": "#991b1b",
            "border": "#fca5a5",
        },
        "HIGH": {
            "bg": "#ffedd5",
            "text": "#9a3412",
            "border": "#fdba74",
        },
        "MEDIUM": {
            "bg": "#fef9c3",
            "text": "#854d0e",
            "border": "#fde047",
        },
        "LOW": {
            "bg": "#dcfce7",
            "text": "#166534",
            "border": "#86efac",
        },
    }
    sev_style = severity_styles.get(severity_level.upper(), {
        "bg": "#e0f2fe",
        "text": "#0369a1",
        "border": "#bae6fd",
    })

    # Clean, table-based, mobile-responsive HTML template matching the new civic website
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CivicPulse AI — Grievance Registration Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 35px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);">
          
          <!-- Top Civic Service Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px; border-bottom: 2px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 21px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                            CivicPulse
                          </span>
                        </td>
                        <td style="vertical-align: middle; padding-left: 6px;">
                          <span style="background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 11px; font-weight: 800; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                            AI
                          </span>
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 3px;">
                      Citizen Governance Intelligence • Grievance Triage
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                      Registered ✓
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; color: #0f172a; margin: 0 0 12px 0; font-weight: 800; letter-spacing: -0.3px;">
                Grievance Registration Confirmation
              </h1>
              
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Dear <strong style="color: #0f172a;">{citizen_name or 'Citizen'}</strong>,<br>
                Your civic complaint has been registered in the CivicPulse AI triage system. It has been classified by urgency, assigned an SLA resolution timeline, and routed to the competent municipal authority.
              </p>

              <!-- Highlighted ID & Tracking Token Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 26px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-right: 1px solid #e2e8f0;" width="50%">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                      Grievance ID
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-top: 4px;">
                      {grievance_id}
                    </div>
                  </td>
                  <td style="padding: 16px 20px; background-color: #f0f9ff;" width="50%">
                    <div style="font-size: 11px; text-transform: uppercase; color: #0369a1; font-weight: 700; letter-spacing: 0.5px;">
                      Tracking Token
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #0284c7; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-top: 4px;">
                      {tracking_token}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Detailed Triage Summary Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="10" border="0" style="font-size: 13px; margin-bottom: 24px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600; padding-left: 0;" width="38%">
                    Assigned Department:
                  </td>
                  <td style="color: #0f172a; font-weight: 700; padding-right: 0;">
                    {department}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600; padding-left: 0;">
                    Reported Location:
                  </td>
                  <td style="color: #334155; font-weight: 500; padding-right: 0;">
                    {location}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600; padding-left: 0;">
                    Assessed Severity:
                  </td>
                  <td style="padding-right: 0;">
                    <span style="background-color: {sev_style['bg']}; color: {sev_style['text']}; border: 1px solid {sev_style['border']}; padding: 3px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px; display: inline-block;">
                      {severity_level}
                    </span>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600; padding-left: 0;">
                    Expected Resolution:
                  </td>
                  <td style="color: #0f172a; font-weight: 700; padding-right: 0;">
                    {estimated_resolution}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600; padding-left: 0;">
                    Competent Authority:
                  </td>
                  <td style="color: #0369a1; font-weight: 700; padding-right: 0;">
                    {portal_name}
                  </td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600; padding-left: 0;">
                    Official Helpline:
                  </td>
                  <td style="color: #0f172a; font-weight: 800; padding-right: 0;">
                    {helpline}
                  </td>
                </tr>
              </table>

              <!-- Reported Issue Quote Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0284c7; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px;">
                      Reported Issue:
                    </div>
                    <div style="font-size: 13px; color: #334155; font-style: italic; line-height: 1.6;">
                      &ldquo;{description}&rdquo;
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Primary Action CTA Button (Matching Website .btn-primary) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 20px 0;">
                    <a href="http://localhost:5173/grievance" target="_blank" style="background-color: #0369a1; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 6px rgba(3, 105, 161, 0.25);">
                      Track Grievance Live ↗
                    </a>
                    <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
                      Or enter token <strong style="color: #0369a1; font-family: ui-monospace, SFMono-Regular, monospace;">{tracking_token}</strong> on the Grievance Portal.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Official Escalation Advisory Box (GOV.UK style notice) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-top: 15px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #166534; line-height: 1.5;">
                    <strong style="color: #14532d;">Official Procedure Notice:</strong> This complaint is registered in CivicPulse AI for SLA benchmark tracking. To lodge a formal legally binding petition, use the official portal ({portal_name}) or cite this tracking token on CPGRAMS (<a href="https://pgportal.gov.in/" target="_blank" style="color: #15803d; font-weight: 700;">pgportal.gov.in</a>).
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <strong style="color: #334155;">CivicPulse AI Notification Service</strong><br>
                    Automated confirmation dispatched for your civic issue. CivicPulse AI operates on real government open APIs and HuggingFace models to democratize public administration. No mock values used.
                    <div style="margin-top: 6px; color: #94a3b8; font-size: 10px;">
                      CivicPulse AI is an independent civic technology platform built for NITroFORGE. Not an official government website.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return text_content, html_content


def send_grievance_confirmation_email(
    to_email: str,
    citizen_name: str,
    grievance_id: str,
    tracking_token: str,
    department: str,
    location: str,
    description: str,
    severity_level: str,
    estimated_resolution: str,
    portal_name: str = "Relevant Government Department",
    helpline: str = "1800-11-4000",
) -> tuple[bool, str]:
    """
    Sends a confirmation email for a registered grievance.
    Returns (success: bool, status_message: str).
    Never raises an exception — handles all network/auth errors gracefully.
    """
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip().replace(" ", "")
    smtp_from = os.getenv("SMTP_FROM", "").strip() or smtp_user or "notifications@civicpulse.gov.in"
    smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").lower() in ["true", "1", "yes"]

    if not smtp_host:
        return False, "SMTP server not configured in backend environment (SMTP_HOST is empty)."

    text_content, html_content = build_grievance_email_content(
        citizen_name=citizen_name,
        grievance_id=grievance_id,
        tracking_token=tracking_token,
        department=department,
        location=location,
        description=description,
        severity_level=severity_level,
        estimated_resolution=estimated_resolution,
        portal_name=portal_name,
        helpline=helpline,
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"CivicPulse AI: Grievance Registered [{grievance_id}]"
    msg["From"] = f"CivicPulse AI <{smtp_from}>"
    msg["To"] = to_email

    msg.attach(MIMEText(text_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=12) as server:
            if smtp_use_tls:
                server.starttls()
            if smtp_user and smtp_password:
                try:
                    server.login(smtp_user, smtp_password)
                except Exception as auth_err:
                    # Fallback to smtp_from if different from smtp_user
                    if smtp_from and smtp_from != smtp_user and "@" in smtp_from:
                        try:
                            server.login(smtp_from, smtp_password)
                        except Exception:
                            raise auth_err
                    else:
                        raise auth_err
            server.send_message(msg)
        return True, f"Confirmation email successfully delivered to {to_email}."
    except Exception as e:
        return False, f"SMTP delivery failed: {str(e)}"
