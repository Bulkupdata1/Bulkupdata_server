const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const fetch = (...args) => {
  console.log(
    "[Fetch Polyfill] Initializing node-fetch for server-side usage..."
  );
  return import("node-fetch").then(({ default: fetch }) => fetch(...args));
};
//08120710198, 08036774826, 08035767224, 09134270313, 08155237655, 08055232050
const router = express.Router();

const hardCodedToken = `eyJraWQiOiIwMDA1YzFmMC0xMjQ3LTRmNmUtYjU2ZC1jM2ZkZDVmMzhhOTIiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNjk3NyIsImlzcyI6Imh0dHBzOi8vcmVsb2FkbHkuYXV0aDAuY29tLyIsImh0dHBzOi8vcmVsb2FkbHkuY29tL3NhbmRib3giOmZhbHNlLCJodHRwczovL3JlbG9hZGx5LmNvbS9wcmVwYWlkVXNlcklkIjoiMjY5NzciLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhdWQiOiJodHRwczovL3RvcHVwcy1oczI1Ni5yZWxvYWRseS5jb20iLCJuYmYiOjE3NTM2MDAzODAsImF6cCI6IjI2OTc3Iiwic2NvcGUiOiJzZW5kLXRvcHVwcyByZWFkLW9wZXJhdG9ycyByZWFkLXByb21vdGlvbnMgcmVhZC10b3B1cHMtaGlzdG9yeSByZWFkLXByZXBhaWQtYmFsYW5jZSByZWFkLXByZXBhaWQtY29tbWlzc2lvbnMiLCJleHAiOjE3NTg3ODQzODAsImh0dHBzOi8vcmVsb2FkbHkuY29tL2p0aSI6IjdkZTcwZmNlLTRhOWQtNDI1MS1hM2M2LTI4ZjMzMTllYzQ0OCIsImlhdCI6MTc1MzYwMDM4MCwianRpIjoiYWVmMTI4ODgtZjRlNi00YmFjLWIxNDMtYTU4NWI4MWUwMTQ2In0.WPJhl6jrjY95i80DHxsmEV35L6zxYGL87_aWZBIVy1k`;
const ENVIRONMENT = process.env.NODE_ENV || "production"; // Default to sandbox if not set

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const WEB_URL = "http://localhost:5174"; // Development frontend URL
const WEB_URL_PROD = "http://localhost:5174"; // Production frontend URL (can be different)

// Log configuration values for debugging
console.log("[Config] ENVIRONMENT:", ENVIRONMENT);
console.log("[Config] WEB_URL:", WEB_URL);
console.log("[Config] WEB_URL_PROD:", WEB_URL_PROD);
// Only log first few characters of secret key for security
console.log(
  "[Config] PAYSTACK_SECRET_KEY (first 5 chars):",
  PAYSTACK_SECRET_KEY ? PAYSTACK_SECRET_KEY.substring(0, 5) : "N/A"
);

// Determine Reloadly base URL based on environment
// REMOVED MARKDOWN LINK SYNTAX HERE
const BASE_URL =
  ENVIRONMENT === "production"
    ? "https://topups.reloadly.com"
    : "https://topups-sandbox.reloadly.com";
console.log("[Config] BASE_URL:", BASE_URL);

// --- API Routes for Reloadly and Paystack Integration ---

// 1. Get Operators
// Fetches a list of operators, optionally including bundles and data plans.
router.get("/operators", async (req, res) => {
  console.log("[Route] GET /operators - Request received.");
  try {
    const url = new URL(`${BASE_URL}/operators`);
    // Add query parameters for filtering and pagination
    url.search = new URLSearchParams({
      includeBundles: "true",
      includeData: "true",
      suggestedAmountsMap: "value",
      size: "10", // Example: Get 10 operators per page
      page: "2", // Example: Get the second page of results
    }).toString();
    console.log("[API Call] Fetching operators from URL:", url.toString());

    const response = await fetch(url, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });
    console.log(
      "[API Response] Operators API response status:",
      response.status
    );

    const data = await response.json();
    console.log(
      "[API Response] Operators data received (first 100 chars):",
      JSON.stringify(data).substring(0, 100)
    );
    res.json(data);
    console.log("[Response] Sent operators data to client.");
  } catch (err) {
    console.error("[Error] GET /operators:", err.message);
    res.status(500).json({ error: err.message });
    console.log("[Response] Sent 500 error to client.");
  }
});

// 2. Get Operator by ID
// Retrieves details for a specific operator using its ID.
router.get("/operators/:id", async (req, res) => {
  console.log("[Route] GET /operators/:id - Request received.");
  console.log("[Request Params] Operator ID:", req.params.id);
  try {
    const fetchUrl = `${BASE_URL}/operators/${req.params.id}`;
    console.log("[API Call] Fetching operator by ID from URL:", fetchUrl);
    const response = await fetch(fetchUrl, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });
    console.log(
      "[API Response] Operator by ID API response status:",
      response.status
    );
    const data = await response.json();
    console.log(
      "[API Response] Operator data received (first 100 chars):",
      JSON.stringify(data).substring(0, 100)
    );
    res.json(data);
    console.log("[Response] Sent operator data to client.");
  } catch (err) {
    console.error("[Error] GET /operators/:id:", err.message);
    res.status(500).json({ error: err.message });
    console.log("[Response] Sent 500 error to client.");
  }
});

router.post("/operators/auto-detect/group/group", async (req, res) => {
  console.log("[Route] POST /operators/auto-detect - Request received.");

  let { numbers, countryCode } = req.body;
  console.log("[Request Body] Numbers:", numbers, "Country Code:", countryCode);
  if (!Array.isArray(numbers)) {
    numbers = [numbers];
    console.log("[Logic] 'numbers' was not an array, converted to:", numbers);
  }
  // --- END OF MODIFICATION ---

  if (numbers.length === 0) {
    return res.status(400).json({ error: "Numbers must be a non-empty array" });
  }

  // Handle Nigerian code specifically
  if (countryCode === "+234") {
    countryCode = "NG";
    console.log("[Logic] Country code changed from +234 to NG.");
  }

  // helper: make Reloadly API call for one phone
  const detectOperator = async (phone) => {
    try {
      const url = new URL(
        `${BASE_URL}/operators/auto-detect/phone/${phone}/countries/${countryCode}`
      );
      url.searchParams.append("suggestedAmountsMap", "true");

      console.log("[API Call] Auto-detect operator from URL:", url.toString());

      const response = await fetch(url, {
        headers: {
          Accept: "application/com.reloadly.topups-v1+json",
          Authorization: `Bearer ${hardCodedToken}`,
        },
      });

      console.log(`[API Response] Phone ${phone} - Status:`, response.status);

      if (!response.ok) {
        throw new Error(`Failed for ${phone}: ${response.statusText}`);
      }

      const data = await response.json();
      return { phone, success: true, data };
    } catch (err) {
      return { phone, success: false, error: err.message };
    }
  };

  // helper: process numbers in batches of 50
  const processInBatches = async (arr, batchSize = 100) => {
    let allResults = [];
    for (let i = 0; i < arr.length; i += batchSize) {
      const batch = arr.slice(i, i + batchSize);

      console.log(`[Batch] Processing numbers ${i + 1} to ${i + batch.length}`);

      const results = await Promise.allSettled(batch.map(detectOperator));

      const formattedResults = results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason }
      );

      allResults = allResults.concat(formattedResults);
    }
    return allResults;
  };

  try {
    const finalResults = await processInBatches(numbers, 100);

    res.json({ results: finalResults });
    console.log("[Response] Sent operator detection results:", finalResults);
  } catch (err) {
    console.error("[Error] POST /operators/auto-detect:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/operators/auto-detect/:phone/:countryCode", async (req, res) => {
  console.log(
    BASE_URL,
    "[Route] GET /operators/auto-detect/:phone/:countryCode - Request received."
  );
  let { phone, countryCode } = req.params;
  console.log(
    "[Request Params] Phone:",
    phone,
    "Country Code (initial):",
    countryCode
  );

  // Special handling for Nigerian country code to match Reloadly's expected format
  if (countryCode === "+234") {
    countryCode = "NG";
    console.log("[Logic] Country code changed from +234 to NG.");
  }

  try {
    const url = new URL(
      `${BASE_URL}/operators/auto-detect/phone/${phone}/countries/${countryCode}`
    );
    url.searchParams.append("suggestedAmountsMap", "true"); // Request suggested amounts
    console.log("[API Call] Auto-detect operator from URL:", url.toString());
    // const TRY =
    //   "https://topups-sandbox.reloadly.com/operators/auto-detect/phone/08120710198/countries/NG?suggestedAmountsMap=true&suggestedAmounts=true";

    const response = await fetch(url, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });
    console.log(
      "[API Response] Auto-detect API response status:",
      response.status
    );

    const data = await response.json();
    console.log(
      "[API Response] Auto-detect data received (first 100 chars):",
      JSON.stringify(data).substring(0, 100)
    );
    res.json(data);
    console.log("[Response] Sent auto-detected operator data to client.", data);
  } catch (err) {
    console.error("[Error] GET /operators/auto-detect:", err.message);
    res.status(500).json({ error: err.message });
    console.log("[Response] Sent 500 error to client.");
  }
});

// 4. Get Account Balance
// Retrieves the current balance of the Reloadly account.
router.get("/balance", async (req, res) => {
  console.log("[Route] GET /balance - Request received.");
  try {
    const fetchUrl = `${BASE_URL}/accounts/balance`;
    console.log("[API Call] Fetching account balance from URL:", fetchUrl);
    const response = await fetch(fetchUrl, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });
    console.log("[API Response] Balance API response status:", response.status);
    const data = await response.json();
    console.log(
      "[API Response] Account balance data received:",
      JSON.stringify(data)
    );
    res.json(data);
    console.log("[Response] Sent account balance data to client.");
  } catch (err) {
    console.error("[Error] GET /balance:", err.message);
    res.status(500).json({ error: err.message });
    console.log("[Response] Sent 500 error to client.");
  }
});

// 5. Make a Topup
// Sends a single top-up request to Reloadly.
router.post("/topup", async (req, res) => {
  console.log("[Route] POST /topup - Request received.");
  console.log("[Request Body] Topup payload:", JSON.stringify(req.body));
  try {
    const fetchUrl = `${BASE_URL}/topups`;
    console.log("[API Call] Making topup request to URL:", fetchUrl);
    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
      body: JSON.stringify(req.body),
    });
    console.log("[API Response] Topup API response status:", response.status);

    const data = await response.json();
    console.log(
      "[API Response] Topup response data received:",
      JSON.stringify(data)
    );
    res.json(data);
    console.log("[Response] Sent topup response data to client.");
  } catch (err) {
    console.error("[Error] POST /topup:", err.message);
    res.status(500).json({ error: err.message });
    console.log("[Response] Sent 500 error to client.");
  }
});

// 6. Get Topup Status by Transaction ID
// Checks the status of a specific top-up transaction.
router.get("/topups/:transactionId/status", async (req, res) => {
  console.log("[Route] GET /topups/:transactionId/status - Request received.");
  console.log("[Request Params] Transaction ID:", req.params.transactionId);
  try {
    const fetchUrl = `${BASE_URL}/topups/${req.params.transactionId}/status`;
    console.log("[API Call] Fetching topup status from URL:", fetchUrl);
    const response = await fetch(fetchUrl, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });
    console.log(
      "[API Response] Topup status API response status:",
      response.status
    );
    const data = await response.json();
    console.log(
      "[API Response] Topup status data received:",
      JSON.stringify(data)
    );
    res.json(data);
    console.log("[Response] Sent topup status data to client.");
  } catch (err) {
    console.error("[Error] GET /topups/:transactionId/status:", err.message);
    res.status(500).json({ error: err.message });
    console.log("[Response] Sent 500 error to client.");
  }
});

// 7. Get Topup Transaction by ID
// Retrieves full details for a top-up transaction from reports.

router.get("/transactions/all", async (req, res) => {
  console.log("[Route] GET /transactions/all - Request received.");

  try {
    // Extract optional query params
    const { countryCode, operatorId } = req.query;

    // Base URL
    let fetchUrl = `${BASE_URL}/topups/reports/transactions?size=200&page=1`;

    // Add optional filters if provided
    if (countryCode) fetchUrl += `&countryCode=${countryCode}`;
    if (operatorId) fetchUrl += `&operatorId=${operatorId}`;

    console.log("[API Call] Fetching transactions from URL:", fetchUrl);

    const response = await fetch(fetchUrl, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });

    console.log(
      "[API Response] Transactions API response status:",
      response.status
    );

    const data = await response.json();

    console.log(
      "[API Response] Transaction data received:",
      JSON.stringify(data)
    );

    res.json(data);

    console.log("[Response] Sent transaction data to client.");
  } catch (err) {
    console.error("[Error] GET /transactions/all:", err.message);
    res.status(500).json({ error: err.message });
    console.log("[Response] Sent 500 error to client.");
  }
});
router.get("/transactions/:transactionId", async (req, res) => {
  console.log("[Route] GET /transactions/:transactionId - Request received.");
  console.log("[Request Params] Transaction ID:", req.params.transactionId);
  try {
    const fetchUrl = `${BASE_URL}/topups/reports/transactions/${req.params.transactionId}`;
    console.log("[API Call] Fetching transaction by ID from URL:", fetchUrl);
    const response = await fetch(fetchUrl, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });
    console.log(
      "[API Response] Transaction by ID API response status:",
      response.status
    );
    const data = await response.json();
    console.log(
      "[API Response] Transaction data received:",
      JSON.stringify(data)
    );
    res.json(data);
    console.log("[Response] Sent transaction data to client.");
  } catch (err) {
    console.error("[Error] GET /transactions/:transactionId:", err.message);
    res.status(500).json({ error: err.message });
    console.log("[Response] Sent 500 error to client.");
  }
});

// 8. Create Paystack Payment
// Initializes a payment transaction with Paystack.
router.post("/create-paystack-payment", async (req, res) => {
  console.log("[Route] POST /create-paystack-payment - Request received.");
  const { amount, currency = "NGN", callback_url } = req.body;
  const email = `bulkupdata@gmail.com`; // Hardcoded email for payment initiation

  console.log(
    "[Request Body] Amount:",
    amount,
    "Currency:",
    currency,
    "Callback URL:",
    callback_url
  );

  // Validate required fields
  if (!amount || !callback_url) {
    console.log(
      "[Validation] Missing required fields: amount or callback_url."
    );
    return res
      .status(400)
      .json({ error: "Amount and callback_url are required." });
  }

  // Prepare payload for Paystack API
  const payload = {
    email,
    amount: amount * 100, // Convert amount to kobo (smallest currency unit)
    currency,
    callback_url,
  };
  console.log("[Paystack] Payment initialization payload:", payload);

  try {
    console.log("[API Call] Initializing Paystack transaction...");
    // REMOVED MARKDOWN LINK SYNTAX HERE
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, // Use Paystack secret key
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      "[API Response] Paystack initialization response status:",
      response.status
    );
    console.log(
      "[API Response] Paystack initialization data:",
      JSON.stringify(response.data)
    );

    const { reference, authorization_url } = response.data.data;
    console.log(
      "[Paystack] Checkout URL:",
      authorization_url,
      "Reference:",
      reference
    );

    // Send the Paystack checkout URL and reference back to the client
    res.status(200).json({
      checkout_url: authorization_url,
      reference, // Include reference for client-side use
    });
    console.log(
      "[Response] Sent Paystack checkout URL and reference to client."
    );
  } catch (error) {
    console.error("❌ Error creating Paystack payment:", error.message);
    if (error.response) {
      // Log detailed error response from Paystack if available
      console.error("❌ Paystack Error Response Data:", error.response.data);
      console.error(
        "❌ Paystack Error Response Status:",
        error.response.status
      );
    }
    const errorMessage =
      error.response?.data?.message || "Internal Server Error";
    res.status(500).json({ error: errorMessage });
    console.log(
      "[Response] Sent 500 error to client with message:",
      errorMessage
    );
  }
});

// 9. Main Top-up and Payment Verification Route (Combined Logic)
// This route handles verifying a Paystack payment and then
// processing multiple Reloadly top-up requests in parallel.
const Recharge = require("../models/Recharge"); // import the model

router.post("/main-topup/:ref", async (req, res) => {
  console.log("[Route] POST /main-topup/:ref - Request received.");
  const { ref: paymentRef } = req.params;
  const payloadArray = req.body;

  if (!paymentRef) {
    console.log("[Validation] Missing payment reference.");
    return res.status(400).json({ error: "Missing payment reference" });
  }

  if (!Array.isArray(payloadArray) || payloadArray.length === 0) {
    console.log("[Validation] Payload must be a non-empty array.");
    return res.status(400).json({ error: "Payload must be a non-empty array" });
  }

  try {
    // 1. Verify Paystack Payment
    console.log(`🔍 Verifying Paystack payment for reference: ${paymentRef}`);
    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${paymentRef}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = data.data;
    console.log("[Paystack Verification] Status:", paymentData.status);

    if (paymentData.status !== "success") {
      return res.redirect(
        `${WEB_URL_PROD}/recharge-failure?status=failure&ref=${paymentRef}`
      );
    }

    console.log(
      `✅ Paystack verified. Processing ${payloadArray?.length} top-ups in parallel.`
    );
    const results = await Promise.allSettled(
      payloadArray.map(async (payload) => {
        try {
          const retailDataAmount = payload?.retailDataAmount;
          const planType = payload?.planType;
          const network = payload?.network;
          const logoUrls = payload?.logoUrls;
          //logoUrls
          const timestamp = Date.now();
          payload.customIdentifier = `${uuidv4()}_${timestamp}`;

          console.log(payload, "payload");
          const finalPayload = {
            ...payload,
            retailDataAmount,
            planType,
            network,
            logoUrls,
          };

          const fetchUrl = `${BASE_URL}/topups-async`;
          const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/com.reloadly.topups-v1+json",
              Authorization: `Bearer ${hardCodedToken}`,
            },
            body: JSON.stringify(finalPayload),
          });

          const topupData = await response.json();

          if (!response.ok) {
            console.error(response, "responseerr");
            return { success: false, payload: finalPayload, topupData };
          }

          console.log(
            `[Reloadly Success] Top-up successful for${payload?.userId} ${finalPayload.customIdentifier}`
          );

          // ✅ Save to DB if there's a user token
          if (payload?.userId) {
            const recharge = new Recharge({
              userId: payload.userId,
              ...finalPayload,
              transactionId: topupData?.id || finalPayload.id, // map reloadly id
              status: topupData?.status || "pending",
            });

            await recharge.save();
            console.log(`[DB] Recharge stored for user ${payload.userId}`);
          }

          return { success: true, payload: finalPayload, topupData };
        } catch (err) {
          console.error(`[Error] Reloadly topup error:`, err.message);
          return { success: false, payload, error: err.message };
        }
      })
    );

    // 3. Normalize results
    const normalizedResults = results.map((r) =>
      r.status === "fulfilled" ? r.value : { success: false, error: r.reason }
    );

    return res.status(200).json({
      success: true,
      paymentRef,
      results: normalizedResults,
    });
  } catch (err) {
    console.error("❌ Error processing topup (main-topup route):", err.message);
    if (err.response) {
      console.error("❌ Downstream API Error:", err.response.data);
    }
    return res.status(500).json({ error: err.message || "Server error" });
  }
});
// 10. Verify Paystack Payment Status (Standalone Route)
// This route is typically hit by Paystack's callback URL to confirm payment status.
router.get("/verify-payment", async (req, res) => {
  console.log("[Route] GET /verify-payment - Request received.");
  const { reference, trxref } = req.query; // Get reference from query parameters
  console.log("[Request Query] Reference:", reference, "TRXREF:", trxref);

  // Use either 'reference' or 'trxref' as the payment reference
  const paymentRef = reference || trxref;
  console.log("[Payment Ref] Determined payment reference:", paymentRef);

  // Validate that a payment reference is present
  if (!paymentRef) {
    console.log(
      "[Validation] Missing payment reference (reference or trxref)."
    );
    return res.status(400).json({
      error: "Payment reference (reference or trxref) is required.",
    });
  }

  console.log(`🔍 Verifying payment for Reference: ${paymentRef}`);

  try {
    console.log("[API Call] Verifying Paystack payment...");
    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${paymentRef}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, // Use Paystack secret key
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      "[API Response] Paystack verification response data:",
      JSON.stringify(data)
    );

    const paymentData = data.data; // Extract payment data
    console.log("[Paystack Verification] Payment status:", paymentData.status);

    // Redirect to success/failure pages based on Paystack status
    if (paymentData.status !== "success") {
      console.log(
        "[Logic] Paystack payment not successful. Redirecting to failure page."
      );
      return res.redirect(
        `${WEB_URL_PROD}/payment-failure?status=failure&ref=${paymentRef}`
      );
    }

    console.log(
      "[Logic] Payment verified successfully. Sending success response."
    );
    // Respond to the client indicating successful payment verification
    return res.status(200).json({
      message: "Payment verified",
      status: 200,
      success: true,
    });
  } catch (error) {
    // Handle errors during Paystack verification
    console.error(
      "❌ Error verifying payment (verify-payment route):",
      error?.response?.data || error.message
    );
    if (error.response) {
      console.error("❌ Paystack Error Response Data:", error.response.data);
      console.error(
        "❌ Paystack Error Response Status:",
        error.response.status
      );
    }
    console.log(
      "[Logic] Error during payment verification. Redirecting to error page."
    );
    // Redirect to an error page in case of an exception during verification
    return res.redirect(`${WEB_URL_PROD}/payment-failure?status=error`);
  }
});

// ✅ GET: Get all recharges for a user
// ✅ GET: Get all recharges for a user
router.get(
  "/operators/recharges-fetch/recharge/by-user/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      console.log("➡️ Incoming request to fetch recharges for userId:", userId);

      const recharges = await Recharge.find({ userId }).sort({ createdAt: -1 });

      if (!recharges || recharges.length === 0) {
        console.log("⚠️ No recharges found for this user:", userId);
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "No recharges found for this user",
        });
      }

      console.log("✅ Sending recharges response for userId:", userId);
      return res.status(200).json({
        code: 200,
        status: "success",
        count: recharges.length,
        data: recharges,
      });
    } catch (err) {
      console.error(
        "❌ Error fetching recharges for user:",
        req.params.userId,
        err
      );
      return res.status(500).json({
        code: 500,
        status: "error",
        message: "Error fetching recharges",
      });
    }
  }
);

// New route to get all recharges
router.get("/recharges/all", async (req, res) => {
  try {
    const recharges = await Recharge.find({}); // Fetch all documents
    if (!recharges || recharges.length === 0) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "No recharges found",
      });
    }
    return res.status(200).json({
      code: 200,
      status: "success",
      count: recharges.length,
      data: recharges,
    });
  } catch (err) {
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Error fetching all recharges",
    });
  }
});

module.exports = router;
