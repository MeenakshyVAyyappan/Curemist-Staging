import type { VercelRequest, VercelResponse } from "@vercel/node";

const RESEND_API = "https://api.resend.com/emails";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, phone, subject, message, captchaToken } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // ReCAPTCHA Verification
    const reCaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!reCaptchaSecret) {
        console.error("[api/contact] RECAPTCHA_SECRET_KEY missing in environment");
    } else if (!captchaToken) {
        return res.status(400).json({ error: "Captcha verification required" });
    } else {
        try {
            const verifyResp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${reCaptchaSecret}&response=${captchaToken}`,
            });
            const verifyJson = await verifyResp.json();
            if (!verifyJson.success) {
                return res.status(403).json({ error: "Captcha verification failed" });
            }
        } catch (err: any) {
            console.error("[api/contact] Captcha verify failed:", err);
        }
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
        return res.status(500).json({ error: "RESEND_API_KEY is not configured" });
    }

    const ownerEmail = process.env.CONTACT_RECIPIENT_EMAIL || "contact@altuspharma.in";
    const fromAddress = process.env.RESEND_FROM_EMAIL || `Contact Form <no-reply@${ownerEmail.split("@")[1]}>`;

    const html = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || "-"}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <hr />
    <p>${message.replace(/\n/g, "<br />")}</p>
  `;

    try {
        const resp = await fetch(RESEND_API, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: fromAddress,
                to: [ownerEmail],
                subject: `New contact form: ${subject}`,
                html,
            }),
        });

        if (!resp.ok) {
            const text = await resp.text();
            return res.status(502).json({ error: "Resend API error", details: text });
        }

        return res.json({ ok: true });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message || "unknown" });
    }
}
