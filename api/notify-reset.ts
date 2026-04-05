import type { VercelRequest, VercelResponse } from "@vercel/node";

const RESEND_API = "https://api.resend.com/emails";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Missing email" });

    const key = process.env.RESEND_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing RESEND_API_KEY" });

    const ownerEmail = process.env.CONTACT_RECIPIENT_EMAIL || "contact@altuspharma.in";

    const html = `
    <h2>Password reset requested</h2>
    <p>The following user requested a password reset: <strong>${email}</strong></p>
  `;

    try {
        const resp = await fetch(RESEND_API, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: process.env.RESEND_NOTIFY_FROM_EMAIL || `Notifications <no-reply@${ownerEmail.split("@")[1]}>`,
                to: [ownerEmail],
                subject: `Password reset requested: ${email}`,
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
