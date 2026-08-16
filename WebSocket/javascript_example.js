/**
 * WebSocket Example (Node.js + Browser)
 * ----------------------------------------
 * Part A: A WebSocket chat server using the `ws` library, broadcasting
 *          messages from any client to all other connected clients.
 * Part B: A browser-native WebSocket client (runs in any modern browser,
 *          no library needed — WebSocket is a Web API).
 *
 * Install dependency (server only):
 *   npm install ws
 */

// ---------------------------------------------------------------------------
// PART A: WEBSOCKET SERVER (Node.js, using `ws`)
// ---------------------------------------------------------------------------
const WebSocket = require("ws");

function startServer() {
  const wss = new WebSocket.Server({ port: 8765 });
  console.log("WebSocket chat server running on ws://localhost:8765");

  wss.on("connection", (socket) => {
    console.log(`Client joined. Total clients: ${wss.clients.size}`);

    socket.on("message", (message) => {
      // Broadcast to every OTHER connected client
      wss.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    });

    socket.on("close", () => {
      console.log(`Client left. Total clients: ${wss.clients.size}`);
    });
  });
}

// ---------------------------------------------------------------------------
// PART B: WEBSOCKET CLIENT (Browser-native — paste into browser console
// or a <script> tag; `WebSocket` is a built-in Web API, no import needed)
// ---------------------------------------------------------------------------
function runBrowserClient(username = "Alice") {
  const socket = new WebSocket("ws://localhost:8765");

  socket.addEventListener("open", () => {
    console.log("Connected to chat server");
    socket.send(`${username}: Hello everyone!`);
    setTimeout(() => socket.send(`${username}: How's it going?`), 2000);
  });

  // Server pushes messages to us at any time — no polling needed
  socket.addEventListener("message", (event) => {
    console.log(`[Received] ${event.data}`);
  });

  socket.addEventListener("close", () => console.log("Disconnected"));
}

// Run server:  node javascript_example.js server
// Run client:  paste runBrowserClient() into a browser console
const mode = process.argv[2];
if (mode === "server") startServer();

module.exports = { startServer, runBrowserClient };
