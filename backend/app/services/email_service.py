"""
ORANGE Platform — Transactional Email Service
Powered by Resend (or SendGrid as backup).
"""

import httpx
import logging
from app.config import get_settings

logger = logging.getLogger("orange.email")

TEMPLATES = {
    "welcome": {
        "subject": "Καλωσήρθατε στην ORANGE! 🟠",
        "body": """
            <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; background: #1a1714; color: #e8e0d4; padding: 40px; border-radius: 16px;">
                <img src="https://oranged.gr/logo.svg" alt="ORANGE" style="width: 120px; margin-bottom: 24px;" />
                <h1 style="font-size: 24px; color: #c7ad67; margin-bottom: 16px;">Καλωσήρθατε, {name}!</h1>
                <p style="font-size: 14px; line-height: 1.8; color: #a09888;">
                    Ο λογαριασμός σας στην ORANGE δημιουργήθηκε επιτυχώς. Είστε έτοιμοι να:
                </p>
                <ul style="font-size: 14px; line-height: 2; color: #a09888; padding-left: 20px;">
                    <li>📄 Ψηφιοποιήσετε έγγραφα με OCR</li>
                    <li>🌐 Μεταφράσετε κείμενα σε 30+ γλώσσες</li>
                    <li>🎧 Δημιουργήσετε audiobooks</li>
                    <li>🔒 Αποθηκεύσετε αρχεία ασφαλώς</li>
                </ul>
                <a href="https://app.oranged.gr" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #9d742e, #c7ad67); color: #1a1714; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 20px;">
                    Ξεκινήστε Τώρα →
                </a>
                <hr style="border: none; border-top: 1px solid #3a3228; margin: 32px 0;" />
                <p style="font-size: 11px; color: #6a6058;">
                    © 2026 ORANGE · Θεόδωρος Στογιάννου · Φλώρινα, Ελλάδα
                </p>
            </div>
        """,
    },
    "invoice": {
        "subject": "ORANGE — Τιμολόγιο #{invoice_id}",
        "body": """
            <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; background: #1a1714; color: #e8e0d4; padding: 40px; border-radius: 16px;">
                <img src="https://oranged.gr/logo.svg" alt="ORANGE" style="width: 120px; margin-bottom: 24px;" />
                <h1 style="font-size: 20px; color: #c7ad67;">Τιμολόγιο</h1>
                <p style="font-size: 14px; color: #a09888;">
                    Πλάνο: <strong style="color: #e8e0d4;">{plan}</strong><br/>
                    Ποσό: <strong style="color: #e8e0d4;">€{amount}</strong><br/>
                    Περίοδος: {period}
                </p>
                <a href="{invoice_url}" style="display: inline-block; padding: 10px 24px; background: #2c2620; border: 1px solid #3a3228; color: #c7ad67; text-decoration: none; border-radius: 8px; font-size: 13px; margin-top: 16px;">
                    Δείτε το Τιμολόγιο →
                </a>
            </div>
        """,
    },
    "usage_warning": {
        "subject": "ORANGE — Πλησιάζετε το όριο χρήσης ⚠️",
        "body": """
            <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; background: #1a1714; color: #e8e0d4; padding: 40px; border-radius: 16px;">
                <img src="https://oranged.gr/logo.svg" alt="ORANGE" style="width: 120px; margin-bottom: 24px;" />
                <h1 style="font-size: 20px; color: #f39c12;">⚠️ Προειδοποίηση Χρήσης</h1>
                <p style="font-size: 14px; color: #a09888; line-height: 1.8;">
                    Έχετε χρησιμοποιήσει το <strong style="color: #f39c12;">{percentage}%</strong> 
                    του ορίου <strong>{service}</strong> για αυτό   τον μήνα.
                </p>
                <p style="font-size: 14px; color: #a09888;">
                    Χρήση: {used} / {limit} {unit}
                </p>
                <a href="https://app.oranged.gr/settings/billing" style="display: inline-block; padding: 10px 24px; background: linear-gradient(135deg, #9d742e, #c7ad67); color: #1a1714; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; margin-top: 16px;">
                    Αναβάθμιση Πλάνου →
                </a>
            </div>
        """,
    },
}


class EmailService:
    """Transactional email service via Resend."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.resend_api_key
        self.from_email = "ORANGE <noreply@oranged.gr>"

    async def send(
        self,
        to: str,
        template: str,
        variables: dict,
    ) -> bool:
        """Send a transactional email."""
        if template not in TEMPLATES:
            logger.error(f"Unknown email template: {template}")
            return False

        tmpl = TEMPLATES[template]
        subject = tmpl["subject"].format(**variables)
        html = tmpl["body"].format(**variables)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": self.from_email,
                        "to": [to],
                        "subject": subject,
                        "html": html,
                    },
                )

                if response.status_code == 200:
                    logger.info(f"Email sent: {template} → {to}")
                    return True
                else:
                    logger.error(f"Email failed: {response.status_code} {response.text}")
                    return False

        except Exception as e:
            logger.error(f"Email error: {e}")
            return False