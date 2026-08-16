"""
gRPC Example (Python)
------------------------
Part A: A gRPC server implementing LocationService (server-streaming RPC).
Part B: A gRPC client that consumes the live location stream.

Install dependencies:
    pip install grpcio grpcio-tools --break-system-packages

Before running, generate stub code from service.proto:
    python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. service.proto
This generates `service_pb2.py` and `service_pb2_grpc.py` (imported below).
"""

import time
import grpc

# These are auto-generated from service.proto via protoc (see command above)
# import service_pb2
# import service_pb2_grpc


# ---------------------------------------------------------------------------
# PART A: gRPC SERVER
# ---------------------------------------------------------------------------
class LocationServiceServicer:  # would normally inherit service_pb2_grpc.LocationServiceServicer
    """Implements the RPC methods defined in service.proto."""

    def GetLiveLocation(self, request, context):
        """Server-streaming RPC: yields multiple LocationUpdate messages."""
        simulated_coords = [
            (17.3850, 78.4867),  # Hyderabad coordinates, moving slightly each tick
            (17.3855, 78.4872),
            (17.3860, 78.4880),
        ]
        for lat, lng in simulated_coords:
            # yield service_pb2.LocationUpdate(
            #     trip_id=request.trip_id,
            #     latitude=lat,
            #     longitude=lng,
            #     timestamp_epoch_ms=int(time.time() * 1000),
            # )
            time.sleep(1)  # simulate real-time interval between GPS pings


def serve():
    server = grpc.server(__import__("concurrent.futures").futures.ThreadPoolExecutor(max_workers=10))
    # service_pb2_grpc.add_LocationServiceServicer_to_server(LocationServiceServicer(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    server.wait_for_termination()


# ---------------------------------------------------------------------------
# PART B: gRPC CLIENT
# ---------------------------------------------------------------------------
def run_client():
    with grpc.insecure_channel("localhost:50051") as channel:
        # stub = service_pb2_grpc.LocationServiceStub(channel)
        # request = service_pb2.TripRequest(trip_id="trip-9981")

        # Server-streaming call: iterate over responses as they arrive
        # for update in stub.GetLiveLocation(request):
        #     print(f"Driver at ({update.latitude}, {update.longitude}) @ {update.timestamp_epoch_ms}")
        pass


if __name__ == "__main__":
    # Run server in one process:  python python_example.py server
    # Run client in another:      python python_example.py client
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "server":
        serve()
    else:
        run_client()
