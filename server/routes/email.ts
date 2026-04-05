import { Request, Response } from "express";

const RESEND_API = "https://api.resend.com/emails";

function getResendKeyFromEnv() {
  return process.env.RESEND_API_KEY || null;
}

export const contactHandler = async (req: Request, res: Response) => {
  // Allow an explicit header for local testing only: 'x-resend-api-key'
  const headerKey = (req.headers["x-resend-api-key"] as string) || null;
  const key = getResendKeyFromEnv() || headerKey;
  // Debug: log whether key is present (do not print full key in logs)
  try {
    if (key) {
      console.log("[email] RESEND_API_KEY present (last 4):", key.slice(-4));
    } else {
      console.log("[email] RESEND_API_KEY missing in process.env and no x-resend-api-key header provided");
    }
  } catch (e) {
    /* ignore logging errors */
  }
  if (!key) return res.status(500).json({ error: "Missing RESEND_API_KEY. Set RESEND_API_KEY in the server environment or include x-resend-api-key header for testing." });

  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const ownerEmail = process.env.CONTACT_RECIPIENT_EMAIL || "contact@altuspharma.in";
  // Allow configuring the 'from' address separately (use a Resend-verified sending address)
  const configuredFrom = process.env.RESEND_FROM_EMAIL || null;
  const headerFrom = (req.headers["x-resend-from"] as string) || null;
  const fromAddress = (() => {
    const chosen = configuredFrom || headerFrom;
    if (chosen) {
      if (chosen.includes("<") && chosen.includes(">")) return chosen;
      return `Contact Form <${chosen}>`;
    }
    return `Contact Form <no-reply@${ownerEmail.split("@")[1]}>`;
  })();

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
};

export const notifyResetHandler = async (req: Request, res: Response) => {
  const headerKey = (req.headers["x-resend-api-key"] as string) || null;
  const key = getResendKeyFromEnv() || headerKey;
  if (!key) return res.status(500).json({ error: "Missing RESEND_API_KEY. Set RESEND_API_KEY in the server environment or include x-resend-api-key header for testing." });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

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
};
