"""
WebHook Example (Python)
--------------------------
Part A: A WebHook RECEIVER using Flask (like an e-commerce store listening
         for Stripe payment events).
Part B: A script simulating the EVENT SOURCE (Stripe) sending the webhook.

Install dependencies:
    pip install flask requests --break-system-packages
"""

import hashlib
import hmac
import time

# ---------------------------------------------------------------------------
# PART A: WEBHOOK RECEIVER (Flask) — this runs on YOUR server
# ---------------------------------------------------------------------------
from flask import Flask, request, jsonify

app = Flask(__name__)

WEBHOOK_SECRET = "whsec_shared_secret_example"  # shared secret with the event source


def verify_signature(payload_body: bytes, signature_header: str, secret: str) -> bool:
    """Recomputes the HMAC signature and compares it to the header sent by
    the event source, proving the request wasn't forged by a third party."""
    expected_signature = hmac.new(secret.encode(), payload_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_signature, signature_header)


@app.route("/webhooks/stripe", methods=["POST"])
def stripe_webhook_receiver():
    signature = request.headers.get("X-Signature", "")
    payload_body = request.get_data()

    if not verify_signature(payload_body, signature, WEBHOOK_SECRET):
        return jsonify({"error": "Invalid signature"}), 401

    event = request.get_json()

    if event["event"] == "payment_succeeded":
        order_id = event["data"]["order_id"]
        # Update order status in the database, trigger shipping, etc.
        print(f"Order {order_id} marked as PAID. Triggering shipping workflow...")

    # Must respond quickly with 200 OK, or the sender will retry the delivery
    return jsonify({"received": True}), 200


# ---------------------------------------------------------------------------
# PART B: SIMULATED EVENT SOURCE (e.g., Stripe) sending the webhook
# ---------------------------------------------------------------------------
import json
import requests

RECEIVER_URL = "http://localhost:5000/webhooks/stripe"


def send_webhook_event():
    payload = {
        "id": "evt_1PabcXYZ123",
        "event": "payment_succeeded",
        "created": int(time.time()),
        "data": {"order_id": 123, "amount": 2500, "currency": "INR"},
    }
    payload_body = json.dumps(payload).encode()
    signature = hmac.new(WEBHOOK_SECRET.encode(), payload_body, hashlib.sha256).hexdigest()

    response = requests.post(
        RECEIVER_URL,
        data=payload_body,
        headers={"Content-Type": "application/json", "X-Signature": signature},
    )
    print("Receiver responded:", response.status_code, response.json())


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "receiver":
        app.run(port=5000, debug=True)
    else:
        # Run the receiver first (python python_example.py receiver),
        # then in a second terminal: python python_example.py sender
        send_webhook_event()
