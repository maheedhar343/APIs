/**
 * SOAP Client Example (Node.js)
 * ------------------------------
 * Demonstrates calling a SOAP web service (Fund Transfer) using the `soap` npm package,
 * which parses the WSDL and generates callable methods automatically.
 *
 * Install dependency:
 *   npm install soap
 */

const soap = require("soap");

const WSDL_URL = "https://bank.example.com/soap/fundtransfer?wsdl"; // points to sample.wsdl in production

async function transferFunds(fromAccount, toAccount, amount, currency = "INR") {
  const client = await soap.createClientAsync(WSDL_URL);

  const args = { fromAccount, toAccount, amount, currency };

  try {
    // soap library builds the Envelope + Body automatically from the WSDL definition
    const [result] = await client.TransferFundsAsync(args);
    return {
      transactionId: result.transactionId,
      status: result.status,
    };
  } catch (err) {
    // SOAP Faults surface here
    return { error: err.message };
  }
}

(async () => {
  const result = await transferFunds("ACC10023344", "ACC99887766", 2500.0, "INR");
  console.log("Transfer result:", result);
})();

/* ------------------------------------------------------------------
   Manual raw-XML version using fetch/axios (for learning purposes),
   showing exactly what is sent over the wire.
------------------------------------------------------------------- */
const axios = require("axios");

async function rawSoapRequest() {
  const envelope = `<?xml version="1.0"?>
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
    </soap:Envelope>`;

  // const response = await axios.post(
  //   "https://bank.example.com/soap/fundtransfer",
  //   envelope,
  //   {
  //     headers: {
  //       "Content-Type": "text/xml; charset=utf-8",
  //       SOAPAction: "http://bank.example.com/fundtransfer/TransferFunds",
  //     },
  //   }
  // );
  // console.log(response.data);
}

module.exports = { transferFunds };
