const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Remove this line:
// const fetch = require("node-fetch");

// Add this instead:
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const router = express.Router();

const hardCodedToken = `eyJraWQiOiI1N2JjZjNhNy01YmYwLTQ1M2QtODQ0Mi03ODhlMTA4OWI3MDIiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNjYwMCIsImlzcyI6Imh0dHBzOi8vcmVsb2FkbHktc2FuZGJveC5hdXRoMC5jb20vIiwiaHR0cHM6Ly9yZWxvYWRseS5jb20vc2FuZGJveCI6dHJ1ZSwiaHR0cHM6Ly9yZWxvYWRseS5jb20vcHJlcGFpZFVzZXJJZCI6IjI2NjAwIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXVkIjoiaHR0cHM6Ly90b3B1cHMtaHMyNTYtc2FuZGJveC5yZWxvYWRseS5jb20iLCJuYmYiOjE3NDg1MDUwMzQsImF6cCI6IjI2NjAwIiwic2NvcGUiOiJzZW5kLXRvcHVwcyByZWFkLW9wZXJhdG9ycyByZWFkLXByb21vdGlvbnMgcmVhZC10b3B1cHMtaGlzdG9yeSByZWFkLXByZXBhaWQtYmFsYW5jZSByZWFkLXByZXBhaWQtY29tbWlzc2lvbnMiLCJleHAiOjE3NDg1OTE0MzQsImh0dHBzOi8vcmVsb2FkbHkuY29tL2p0aSI6IjZjOThmOThjLThjZTUtNDYzYi1hZTI5LWFjNDFkOGQ0ODg1YSIsImlhdCI6MTc0ODUwNTAzNCwianRpIjoiY2E4YzFhOTUtMGJlMi00MjAxLTk0MzEtNzM2Y2ZhOGVhNWVhIn0.gUhBmgX9lXXmG3bmdh4kNaVoTvte3lEtAkjAnT4CGys`;
// const CLIENT_ID = process.env.RELOADLY_CLIENT_ID;
// const CLIENT_SECRET = process.env.RELOADLY_CLIENT_SECRET;
const ENVIRONMENT = process.env.RELOADLY_ENV || "sandbox";

const BASE_URL =
  ENVIRONMENT === "production"
    ? "https://topups.reloadly.com"
    : "https://topups-sandbox.reloadly.com";

// let accessToken = null;
// let tokenExpiry = null;

// function log(...args) {
//   console.log("[Reloadly]", ...args);
// }

router.get("/operators", async (req, res) => {
  try {
    //const token = await getAccessToken();
    const url = new URL(`${BASE_URL}/operators`);
    url.search = new URLSearchParams({
      includeBundles: "true",
      includeData: "true",
      suggestedAmountsMap: "value",
      size: "10",
      page: "2",
    }).toString();

    const response = await fetch(url, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 2. Get Operator by ID
router.get("/operators/:id", async (req, res) => {
  try {
    //const token = await getAccessToken();
    const response = await fetch(`${BASE_URL}/operators/${req.params.id}`, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 3. Auto-detect Operator
router.get("/operators/auto-detect/:phone/:countryCode", async (req, res) => {
  try {
    //const token = await getAccessToken();
    let { phone, countryCode } = req.params;

    if (countryCode === "+234") countryCode = "NG";

    const url = new URL(
      `${BASE_URL}/operators/auto-detect/phone/${phone}/countries/${countryCode}`
    );
    url.searchParams.append("suggestedAmountsMap", "true");

    const response = await fetch(url, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 4. Get Account Balance
router.get("/balance", async (req, res) => {
  try {
    //const token = await getAccessToken();
    const response = await fetch(`${BASE_URL}/accounts/balance`, {
      headers: {
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 5. Make a Topup
router.post("/topup", async (req, res) => {
  try {
    //const token = await getAccessToken();
    const response = await fetch(`${BASE_URL}/topups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 6. Get Topup Status by Transaction ID
router.get("/topups/:transactionId/status", async (req, res) => {
  try {
    //const token = await getAccessToken();
    const response = await fetch(
      `${BASE_URL}/topups/${req.params.transactionId}/status`,
      {
        headers: {
          Accept: "application/com.reloadly.topups-v1+json",
          Authorization: `Bearer ${hardCodedToken}`,
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 7. Get Topup Transaction by ID
router.get("/transactions/:transactionId", async (req, res) => {
  try {
    //const token = await getAccessToken();
    const response = await fetch(
      `${BASE_URL}/topups/reports/transactions/${req.params.transactionId}`,
      {
        headers: {
          Accept: "application/com.reloadly.topups-v1+json",
          Authorization: `Bearer ${hardCodedToken}`,
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

router.post("/create-paystack-payment", async (req, res) => {
  try {
    const { amount, currency = "NGN", callback_url } = req.body;
    //const email = `ceo@lukasdesignlab.com`;

    const email = `ibenemeikenna2021@gmail.com`;

    console.log(amount, currency);
    if (!amount || !callback_url) {
      return res
        .status(400)
        .json({ error: "email, amount, and callback_url are required." });
    }

    const payload = {
      email,
      amount: amount * 100,
      currency,
      callback_url,
    };

    // console.log(payload, "payloadpayload");
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { reference, authorization_url } = response.data.data;

    res.status(200).json({
      checkout_url: authorization_url,
      reference, // Include reference in the response
    });
  } catch (error) {
    console.error("Error creating Paystack payment:", error);
    const errorMessage =
      error.response?.data?.message || "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/main-topup/:ref", async (req, res) => {
  const { ref: paymentRef } = req.params;
  const payload = req.body;
  console.log(payload, "payload");

  if (!paymentRef) {
    return res.status(400).json({ error: "Missing payment reference" });
  }

  try {
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

    if (paymentData.status !== "success") {
      return res.redirect(
        `http://localhost:5173/recharge-failure?status=failure&ref=${paymentRef}`
      );
    }

    const timestamp = Date.now();
    const newIdentifier = `${uuidv4()}_${timestamp}`;
    payload.customIdentifier = newIdentifier;

    const response = await fetch(`${BASE_URL}/topups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/com.reloadly.topups-v1+json",
        Authorization: `Bearer ${hardCodedToken}`,
      },
      body: JSON.stringify(payload),
    });

    const topupData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(topupData);
    }

    return res.status(200).json({
      success: true,
      message: "Top-up successful",
      ref: paymentRef,
      amount: payload.amount,
      phone: payload.recipientPhone.number,
    });
  } catch (err) {
    console.error("Error processing topup:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

router.get("/verify-payment", async (req, res) => {
  try {
    const { reference, trxref } = req.query;

    const paymentRef = reference || trxref;

    if (!paymentRef) {
      return res.status(400).json({
        error: "Payment reference (reference or trxref) is required.",
      });
    }

    console.log(`🔍 Verifying payment for Reference: ${paymentRef}`);

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

    if (paymentData.status !== "success") {
      return res.redirect(
        `http://localhost:5173/payment-failure?status=failure&ref=${paymentRef}`
      );
    }

    return res.status(200).json({
      message: "Payment verified",
      status: 200,
      success: true,
    });

    // ✅ Redirect back to your React app
    // return res.redirect(
    //   `http://localhost:5173/payment-success?status=success&ref=${paymentRef}`
    // );
  } catch (error) {
    console.error(
      "❌ Error verifying payment:",
      error?.response?.data || error.message
    );
    return res.redirect(`http://localhost:5173/payment-failure?status=error`);
  }
});

module.exports = router;
