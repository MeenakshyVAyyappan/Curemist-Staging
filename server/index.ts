import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayOrderStatus } from "./routes/razorpay";
import { contactHandler, notifyResetHandler } from "./routes/email";
import { sendWhatsAppConfirmation } from "./routes/whatsapp";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Razorpay routes
  app.post("/api/create-razorpay-order", createRazorpayOrder);
  app.post("/api/verify-razorpay-payment", verifyRazorpayPayment);
  app.get("/api/admin/verify-razorpay-order/:order_id", getRazorpayOrderStatus);

  // Email endpoints (Resend)
  app.post("/api/contact", contactHandler);
  app.post("/api/notify-reset", notifyResetHandler);

  // WhatsApp endpoints
  app.post("/api/send-whatsapp-confirmation", sendWhatsAppConfirmation);

  return app;
}
