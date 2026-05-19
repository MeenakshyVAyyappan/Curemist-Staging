import type { VercelRequest, VercelResponse } from "@vercel/node";

const BOTAMATION_API = "https://app.botamation.in/api/users";
const BOTAMATION_TOKEN = process.env.BOTAMATION_API_TOKEN || "1620383.qwIGDeyMtJ3JWrmKchPtiXiOsy2qDJLYRu1OBoxsiCzm5V";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    phone,
    firstName,
    orderId,
    productNames,
    totalQuantity,
    totalPrice,
    customerAddress,
  } = req.body;

  if (!phone || !firstName || !orderId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Format phone number with country code (assuming 10 digit Indian numbers)
    let phoneWithCountryCode = phone.length === 10 ? `91${phone}` : phone;
    // Remove '+' if it exists, as some WhatsApp APIs prefer numbers without it
    phoneWithCountryCode = phoneWithCountryCode.replace(/^\+/, '');

    const payload = {
      phone: phoneWithCountryCode,
      first_name: firstName,
      actions: [
        {
          action: "set_field_value",
          field_name: "Customer_Name",
          value: firstName,
        },
        {
          action: "set_field_value",
          field_name: "Order_ID",
          value: orderId,
        },
        {
          action: "set_field_value",
          field_name: "Product_Name",
          value: productNames || "CureMist",
        },
        {
          action: "set_field_value",
          field_name: "Quantity",
          value: String(totalQuantity || 1),
        },
        {
          action: "set_field_value",
          field_name: "Order_Amount",
          value: `₹${totalPrice || 0}`,
        },
        {
          action: "set_field_value",
          field_name: "Customer_Address",
          value: customerAddress || "Address not provided",
        },
        {
          action: "send_flow",
          flow_id: "1778930172368",
        },
      ],
    };

    const response = await fetch(BOTAMATION_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ACCESS-TOKEN": BOTAMATION_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[api/send-whatsapp-confirmation] Botamation API error:", errorText);
      return res.status(response.status).json({
        error: "Failed to send WhatsApp message",
        details: errorText,
      });
    }

    const data = await response.json();
    console.log("[api/send-whatsapp-confirmation] Success:", data);

    return res.json({ ok: true, message: "WhatsApp confirmation sent" });
  } catch (err: any) {
    console.error("[api/send-whatsapp-confirmation] Error:", err);
    return res.status(500).json({
      error: "Failed to send WhatsApp confirmation",
      details: err?.message || "Unknown error",
    });
  }
}
