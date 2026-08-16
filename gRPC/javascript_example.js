/**
 * gRPC Example (Node.js)
 * ------------------------
 * Part A: A gRPC server implementing LocationService (server-streaming RPC).
 * Part B: A gRPC client that consumes the live location stream.
 *
 * Install dependencies:
 *   npm install @grpc/grpc-js @grpc/proto-loader
 *
 * Unlike statically-generated stubs, @grpc/proto-loader loads service.proto
 * dynamically at runtime — no separate codegen step needed in Node.js.
 */

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "./service.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const rideshareProto = grpc.loadPackageDefinition(packageDefinition).rideshare;

// ---------------------------------------------------------------------------
// PART A: gRPC SERVER
// ---------------------------------------------------------------------------
function getLiveLocation(call) {
  // Server-streaming RPC handler: call.write() pushes multiple messages
  const simulatedCoords = [
    { lat: 17.385, lng: 78.4867 },
    { lat: 17.3855, lng: 78.4872 },
    { lat: 17.386, lng: 78.488 },
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i >= simulatedCoords.length) {
      clearInterval(interval);
      call.end(); // close the stream
      return;
    }
    const { lat, lng } = simulatedCoords[i++];
    call.write({
      trip_id: call.request.trip_id,
      latitude: lat,
      longitude: lng,
      timestamp_epoch_ms: Date.now(),
    });
  }, 1000); // simulate a real-time GPS ping every second
}

function startServer() {
  const server = new grpc.Server();
  server.addService(rideshareProto.LocationService.service, {
    GetLiveLocation: getLiveLocation,
  });
  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log("gRPC server running on port 50051");
  });
}

// ---------------------------------------------------------------------------
// PART B: gRPC CLIENT
// ---------------------------------------------------------------------------
function runClient() {
  const client = new rideshareProto.LocationService(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  const call = client.GetLiveLocation({ trip_id: "trip-9981" });

  // Server-streaming: 'data' event fires for each LocationUpdate pushed
  call.on("data", (update) => {
    console.log(`Driver at (${update.latitude}, ${update.longitude}) @ ${update.timestamp_epoch_ms}`);
  });
  call.on("end", () => console.log("Stream ended."));
}

// Run server: node javascript_example.js server
// Run client: node javascript_example.js client
const mode = process.argv[2];
if (mode === "server") startServer();
else if (mode === "client") runClient();

module.exports = { startServer, runClient };
