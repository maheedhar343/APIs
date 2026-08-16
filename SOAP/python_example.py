"""
SOAP Client Example (Python)
----------------------------
Demonstrates calling a SOAP web service (Fund Transfer) using the `zeep` library,
which reads the WSDL contract and auto-generates a callable client.

Install dependency:
    pip install zeep --break-system-packages
"""

from zeep import Client
from zeep.exceptions import Fault

WSDL_URL = "https://bank.example.com/soap/fundtransfer?wsdl"  # points to sample.wsdl in production


def transfer_funds(from_account: str, to_account: str, amount: float, currency: str = "INR"):
    """Calls the SOAP TransferFunds operation and returns the transaction result."""
    client = Client(wsdl=WSDL_URL)

    try:
        # zeep builds the SOAP Envelope + Body automatically based on the WSDL schema
        response = client.service.TransferFunds(
            fromAccount=from_account,
            toAccount=to_account,
            amount=amount,
            currency=currency,
        )
        return {
            "transaction_id": response.transactionId,
            "status": response.status,
        }
    except Fault as fault:
        # SOAP Faults are raised as exceptions by zeep
        return {"error": str(fault)}


if __name__ == "__main__":
    result = transfer_funds(
        from_account="ACC10023344",
        to_account="ACC99887766",
        amount=2500.00,
        currency="INR",
    )
    print("Transfer result:", result)

    # Example manual request without zeep, using raw XML + requests (for learning purposes)
    import requests

    raw_soap_envelope = """<?xml version="1.0"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="http://bank.example.com/fundtransfer">
      <soap:Body>
        <tns:TransferRequest>
          <tns:fromAccount>ACC10023344</tns:fromAccount>
          <tns:toAccount>ACC99887766</tns:toAccount>
          <tns:amount>2500.00</tns:amount>
          <tns:currency>INR</tns:currency>
        </tns:TransferRequest>
      </soap:Body>
    </soap:Envelope>"""

    headers = {"Content-Type": "text/xml; charset=utf-8",
               "SOAPAction": "http://bank.example.com/fundtransfer/TransferFunds"}

    # response = requests.post("https://bank.example.com/soap/fundtransfer",
    #                           data=raw_soap_envelope, headers=headers)
    # print(response.text)
