/* eslint-disable require-jsdoc */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const admin = require("firebase-admin");
const {setGlobalOptions} = require("firebase-functions");
const {HttpsError, onCall, onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

admin.initializeApp();

const db = admin.firestore();
const USERS_COLLECTION = "users";
const CARDS_COLLECTION = "cards";
const TRANSACTIONS_COLLECTION = "transactions";
const GMAIL_MESSAGES_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
const GMAIL_PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile";
const DEFAULT_GMAIL_QUERY = [
  "newer_than:30d",
  "(tarjeta OR compra OR consumo OR cargo OR VISA OR Mastercard OR soles)",
].join(" ");

exports.helloControlCash = onRequest((request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  logger.info("helloControlCash called", {
    method: request.method,
    structuredData: true,
  });

  response.status(200).json({
    ok: true,
    message: "ControlCash Functions funcionando.",
    timestamp: new Date().toISOString(),
  });
});

exports.importGmailCreditCardTransactions = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "Debes iniciar sesion para importar correos de Gmail.",
    );
  }

  const accessToken = readRequiredString(request.data, "accessToken");
  const maxResults = readMaxResults(request.data);
  const customQuery = readOptionalString(request.data, "query");
  const query = customQuery || DEFAULT_GMAIL_QUERY;
  const uid = request.auth.uid;

  try {
    await assertGmailMatchesAuthenticatedUser(accessToken, request.auth.token);

    const [messages, cards] = await Promise.all([
      listGmailMessages(accessToken, query, maxResults),
      listUserCards(uid),
    ]);

    const result = {
      imported: 0,
      skipped: 0,
      scanned: messages.length,
      errors: [],
    };

    for (const message of messages) {
      try {
        const gmailMessage = await getGmailMessage(accessToken, message.id);
        const parsedTransaction = parseCreditCardTransaction(gmailMessage);

        if (!parsedTransaction) {
          result.skipped += 1;
          continue;
        }

        const matchedCard = matchCard(parsedTransaction, cards);

        if (!matchedCard) {
          result.skipped += 1;
          result.errors.push(
              `Correo ${message.id}: no se encontro una tarjeta compatible.`,
          );
          continue;
        }

        const isDuplicate = await transactionExists(uid, message.id);

        if (isDuplicate) {
          result.skipped += 1;
          continue;
        }

        await createCardPurchase(uid, {
          ...parsedTransaction,
          cardId: matchedCard.id,
          gmailMessageId: message.id,
        });

        result.imported += 1;
      } catch (error) {
        result.skipped += 1;
        result.errors.push(
            `Correo ${message.id}: ${error.message || "no se pudo procesar"}.`,
        );
        logger.warn("Gmail message import failed", {
          error: error.message,
          messageId: message.id,
          uid,
        });
      }
    }

    logger.info("Gmail import completed", {
      imported: result.imported,
      scanned: result.scanned,
      skipped: result.skipped,
      uid,
    });

    return result;
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error("Gmail import failed", {
      error: error.message,
      uid,
    });

    throw new HttpsError(
        "internal",
        error.message || "No se pudieron importar correos de Gmail.",
    );
  }
});

function readRequiredString(data, field) {
  const value = data && data[field];

  if (!value || typeof value !== "string") {
    throw new HttpsError("invalid-argument", `${field} es obligatorio.`);
  }

  return value;
}

function readOptionalString(data, field) {
  const value = data && data[field];

  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function readMaxResults(data) {
  const value = Number(data && data.maxResults);

  if (!Number.isFinite(value)) {
    return 10;
  }

  return Math.min(Math.max(Math.trunc(value), 1), 25);
}

async function listGmailMessages(accessToken, query, maxResults) {
  const url = new URL(GMAIL_MESSAGES_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(maxResults));

  const response = await fetchGmail(accessToken, url);
  const payload = await response.json();

  return Array.isArray(payload.messages) ? payload.messages : [];
}

async function getGmailMessage(accessToken, messageId) {
  const url = new URL(`${GMAIL_MESSAGES_URL}/${encodeURIComponent(messageId)}`);
  url.searchParams.set("format", "full");

  const response = await fetchGmail(accessToken, url);

  return response.json();
}

async function fetchGmail(accessToken, url) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new HttpsError(
        "permission-denied",
        "Gmail rechazo el acceso. Vuelve a iniciar sesion con Google.",
    );
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gmail respondio con HTTP ${response.status}: ${details}`);
  }

  return response;
}

async function assertGmailMatchesAuthenticatedUser(accessToken, authToken) {
  const expectedEmail = normalizeEmail(authToken && authToken.email);

  if (!expectedEmail) {
    return;
  }

  const response = await fetchGmail(accessToken, new URL(GMAIL_PROFILE_URL));
  const profile = await response.json();
  const gmailEmail = normalizeEmail(profile.emailAddress);

  if (gmailEmail && gmailEmail !== expectedEmail) {
    throw new HttpsError(
        "permission-denied",
        "El Gmail autorizado no coincide con tu usuario de ControlCash.",
    );
  }
}

async function listUserCards(uid) {
  const snapshot = await db
      .collection(USERS_COLLECTION)
      .doc(uid)
      .collection(CARDS_COLLECTION)
      .where("isActive", "==", true)
      .get();

  return snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }));
}

async function transactionExists(uid, gmailMessageId) {
  const snapshot = await db
      .collection(USERS_COLLECTION)
      .doc(uid)
      .collection(TRANSACTIONS_COLLECTION)
      .where("gmailMessageId", "==", gmailMessageId)
      .limit(1)
      .get();

  return !snapshot.empty;
}

async function createCardPurchase(uid, transaction) {
  await db
      .collection(USERS_COLLECTION)
      .doc(uid)
      .collection(TRANSACTIONS_COLLECTION)
      .add({
        type: "card_purchase",
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        categoryId: null,
        accountId: null,
        destinationAccountId: null,
        cardId: transaction.cardId,
        paymentMethod: "credit",
        currency: transaction.currency,
        gmailMessageId: transaction.gmailMessageId,
        gmailImportedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
}

function parseCreditCardTransaction(message) {
  const headers = getHeaders(message);
  const text = [
    headers.subject,
    headers.from,
    decodePayloadText(message.payload),
  ].join("\n");
  const amount = extractAmount(text);

  if (!amount) {
    return null;
  }

  return {
    amount: amount.value,
    currency: amount.currency,
    date: extractTransactionDate(text, headers.date, message.internalDate),
    description: extractDescription(text, headers.subject),
    lookupText: normalizeLookupText(text),
  };
}

function getHeaders(message) {
  const headers = message && message.payload && message.payload.headers;
  const headerMap = Array.isArray(headers) ? headers : [];

  return {
    date: getHeaderValue(headerMap, "date"),
    from: getHeaderValue(headerMap, "from"),
    subject: getHeaderValue(headerMap, "subject"),
  };
}

function getHeaderValue(headers, headerName) {
  const header = headers.find(
      (item) => String(item.name || "").toLowerCase() === headerName,
  );

  return header ? String(header.value || "") : "";
}

function decodePayloadText(payload) {
  if (!payload) {
    return "";
  }

  const ownText = decodeBody(payload.body && payload.body.data);
  const childText = Array.isArray(payload.parts) ?
    payload.parts.map(decodePayloadText).join("\n") :
    "";

  if (payload.mimeType === "text/html") {
    return stripHtml(`${ownText}\n${childText}`);
  }

  return `${ownText}\n${childText}`;
}

function decodeBody(data) {
  if (!data) {
    return "";
  }

  const normalizedData = data.replace(/-/g, "+").replace(/_/g, "/");

  return Buffer.from(normalizedData, "base64").toString("utf8");
}

function stripHtml(value) {
  return value
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&");
}

function extractAmount(text) {
  const patterns = [
    /\b(S\/\.?|PEN|SOLES?)\s*([0-9][0-9.,]*)/i,
    /\b(US\$|USD|\$)\s*([0-9][0-9.,]*)/i,
    /\b([0-9][0-9.,]*)\s*(S\/\.?|PEN|SOLES?|USD|US\$|\$)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match) {
      continue;
    }

    const firstTokenIsNumber = /^[0-9]/.test(match[1]);
    const rawAmount = firstTokenIsNumber ? match[1] : match[2];
    const rawCurrency = firstTokenIsNumber ? match[2] : match[1];
    const value = normalizeAmount(rawAmount);

    if (value > 0) {
      return {
        currency: normalizeCurrency(rawCurrency),
        value,
      };
    }
  }

  return null;
}

function normalizeAmount(value) {
  const cleanValue = String(value).replace(/[^\d.,]/g, "");
  const hasDecimalComma = cleanValue.includes(",") && !cleanValue.includes(".");
  const decimalSeparator = hasDecimalComma ?
    "," :
    ".";
  const normalizedValue = decimalSeparator === "," ?
    cleanValue.replace(/\./g, "").replace(",", ".") :
    cleanValue.replace(/,/g, "");

  return Number(normalizedValue);
}

function normalizeCurrency(value) {
  return /US|\$|USD/i.test(value) ? "USD" : "PEN";
}

function extractTransactionDate(text, headerDate, internalDate) {
  const dateMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);

  if (dateMatch) {
    const day = dateMatch[1].padStart(2, "0");
    const month = dateMatch[2].padStart(2, "0");
    const year = normalizeYear(dateMatch[3]);

    return `${year}-${month}-${day}`;
  }

  const timestamp = Number(internalDate);
  const fallbackDate = Number.isFinite(timestamp) ?
    new Date(timestamp) :
    new Date(headerDate);

  if (Number.isNaN(fallbackDate.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return fallbackDate.toISOString().slice(0, 10);
}

function normalizeYear(value) {
  if (value.length === 2) {
    return `20${value}`;
  }

  return value;
}

function extractDescription(text, subject) {
  const normalizedLines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  const merchantLine = normalizedLines.find((line) =>
    /\b(comercio|establecimiento|consumo en|compra en)\b/i.test(line),
  );
  const source = merchantLine || subject || "Compra con tarjeta";
  const description = source
      .replace(/\s+/g, " ")
      .replace(/^(comercio|establecimiento)\s*:?\s*/i, "")
      .trim();

  return description.slice(0, 180) || "Compra con tarjeta";
}

function matchCard(transaction, cards) {
  if (cards.length === 1) {
    return cards[0];
  }

  return cards.find((card) => {
    const terms = [card.name, card.bank]
        .map(normalizeLookupText)
        .filter(Boolean);

    return terms.some((term) => transaction.lookupText.includes(term));
  });
}

function normalizeLookupText(value) {
  return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}
