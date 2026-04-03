import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

function getRazorpayCredentials() {
  const RAZORPAY_KEY_ID =
    process.env.RAZORPAY_KEY_ID?.trim() ||
    process.env.VITE_RAZORPAY_KEY_ID?.trim() ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
    "";
  const RAZORPAY_KEY_SECRET =
    process.env.RAZORPAY_KEY_SECRET?.trim() ||
    process.env.VITE_RAZORPAY_KEY_SECRET?.trim() ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET?.trim() ||
    "";

  const missing: string[] = [];
  if (!RAZORPAY_KEY_ID) missing.push("RAZORPAY_KEY_ID");
  if (!RAZORPAY_KEY_SECRET) missing.push("RAZORPAY_KEY_SECRET");

  return { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, missing };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, missing } =
      getRazorpayCredentials();
    if (missing.length) {
      const message = `Payment gateway not configured. Missing env: ${missing.join(", ")}`;
      console.error(message);
      return res
        .status(500)
        .json({ verified: false, error: message });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ verified: false, error: "Missing required fields" });
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      return res.json({ verified: true });
    } else {
      return res
        .status(400)
        .json({ verified: false, error: "Invalid signature" });
    }
  } catch (err: any) {
    console.error("Razorpay verification error:", err);
    return res
      .status(500)
      .json({ verified: false, error: "Internal server error" });
  }
}
