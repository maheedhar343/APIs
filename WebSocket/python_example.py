"""
WebSocket Example (Python)
----------------------------
Part A: A WebSocket chat server using the `websockets` library, broadcasting
         messages from any client to all other connected clients.
Part B: A WebSocket client that connects and sends/receives messages.

Install dependency:
    pip install websockets --break-system-packages
"""

import asyncio
import websockets

# ---------------------------------------------------------------------------
# PART A: WEBSOCKET SERVER
# ---------------------------------------------------------------------------
CONNECTED_CLIENTS = set()


async def chat_handler(websocket):
    """Handles one connected client's lifetime: join, relay messages, leave."""
    CONNECTED_CLIENTS.add(websocket)
    print(f"Client joined. Total clients: {len(CONNECTED_CLIENTS)}")
    try:
        async for message in websocket:
            # Broadcast the received message to every OTHER connected client
            recipients = [c for c in CONNECTED_CLIENTS if c != websocket]
            if recipients:
                await asyncio.gather(*(client.send(message) for client in recipients))
    finally:
        CONNECTED_CLIENTS.remove(websocket)
        print(f"Client left. Total clients: {len(CONNECTED_CLIENTS)}")


async def run_server():
    async with websockets.serve(chat_handler, "localhost", 8765):
        print("WebSocket chat server running on ws://localhost:8765")
        await asyncio.Future()  # run forever


# ---------------------------------------------------------------------------
# PART B: WEBSOCKET CLIENT
# ---------------------------------------------------------------------------
async def run_client(username: str):
    uri = "ws://localhost:8765"
    async with websockets.connect(uri) as websocket:
        # Task 1: listen for incoming messages pushed by the server
        async def listen():
            async for message in websocket:
                print(f"[Received] {message}")

        listener_task = asyncio.create_task(listen())

        # Task 2: send a couple of demo messages
        await websocket.send(f"{username}: Hello everyone!")
        await asyncio.sleep(2)
        await websocket.send(f"{username}: How's it going?")

        await listener_task


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "server":
        asyncio.run(run_server())
    else:
        asyncio.run(run_client(username="Alice"))
