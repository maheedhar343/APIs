/**
 * WebHook Example (Node.js)
 * ----------------------------
 * Part A: A WebHook RECEIVER using Express (like an e-commerce store
 *          listening for Stripe payment events).
 * Part B: A script simulating the EVENT SOURCE (Stripe) sending the webhook.
 *
 * Install dependencies:
 *   npm install express axios
 */

const crypto = require("crypto");
const WEBHOOK_SECRET = "whsec_shared_secret_example"; // shared secret with the event source

function computeSignature(payloadBody, secret) {
  return crypto.createHmac("sha256", secret).update(payloadBody).digest("hex");
}

// ---------------------------------------------------------------------------
// PART A: WEBHOOK RECEIVER (Express) — this runs on YOUR server
// ---------------------------------------------------------------------------
const express = require("express");

function startReceiver() {
  const app = express();
  // Keep raw body available for signature verification
  app.use(express.raw({ type: "application/json" }));

  app.post("/webhooks/stripe", (req, res) => {
    const signature = req.headers["x-signature"] || "";
    const expectedSignature = computeSignature(req.body, WEBHOOK_SECRET);

    const valid = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
    if (!valid) return res.status(401).json({ error: "Invalid signature" });

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment_succeeded") {
      const { order_id } = event.data;
      console.log(`Order ${order_id} marked as PAID. Triggering shipping workflow...`);
    }

    // Must respond quickly, or the sender will retry the delivery
    res.status(200).json({ received: true });
  });

  app.listen(5000, () => console.log("WebHook receiver listening on port 5000"));
}

// ---------------------------------------------------------------------------
// PART B: SIMULATED EVENT SOURCE (e.g., Stripe) sending the webhook
// ---------------------------------------------------------------------------
const axios = require("axios");

async function sendWebhookEvent() {
  const payload = {
    id: "evt_1PabcXYZ123",
    event: "payment_succeeded",
    created: Math.floor(Date.now() / 1000),
    data: { order_id: 123, amount: 2500, currency: "INR" },
  };
  const payloadBody = Buffer.from(JSON.stringify(payload));
  const signature = computeSignature(payloadBody, WEBHOOK_SECRET);

  const response = await axios.post("http://localhost:5000/webhooks/stripe", payloadBody, {
    headers: { "Content-Type": "application/json", "X-Signature": signature },
  });
  console.log("Receiver responded:", response.status, response.data);
}

// Run receiver: node javascript_example.js receiver
// Run sender:   node javascript_example.js sender
const mode = process.argv[2];
if (mode === "receiver") startReceiver();
else if (mode === "sender") sendWebhookEvent();

module.exports = { startReceiver, sendWebhookEvent };
