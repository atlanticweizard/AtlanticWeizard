import crypto from "crypto";

const PAYU_MODE = process.env.PAYU_MODE || "TEST";
const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || "";
const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || "";

const PAYU_TEST_URL = "https://test.payu.in/_payment";
const PAYU_PROD_URL = "https://secure.payu.in/_payment";

export function getPayuUrl(): string {
  return PAYU_MODE === "LIVE" ? PAYU_PROD_URL : PAYU_TEST_URL;
}

export function generateTxnId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(4).toString("hex");
  return `AW${timestamp}${randomPart}`.toUpperCase();
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${timestamp}-${randomPart}`;
}

export interface PayuPaymentParams {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export function generatePayuHash(params: PayuPaymentParams): string {
  const hashString = [
    PAYU_MERCHANT_KEY,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",
    params.udf2 || "",
    params.udf3 || "",
    params.udf4 || "",
    params.udf5 || "",
    "",
    "",
    "",
    "",
    "",
    PAYU_MERCHANT_SALT,
  ].join("|");

  return crypto.createHash("sha512").update(hashString).digest("hex");
}

export function verifyPayuResponseHash(params: Record<string, string>): boolean {
  const {
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    status,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    additionalCharges = "",
    hash: receivedHash,
  } = params;

  let hashString: string;

  if (additionalCharges) {
    hashString = [
      PAYU_MERCHANT_SALT,
      status,
      "",
      "",
      "",
      "",
      "",
      udf5,
      udf4,
      udf3,
      udf2,
      udf1,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      PAYU_MERCHANT_KEY,
    ].join("|");
  } else {
    hashString = [
      PAYU_MERCHANT_SALT,
      status,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      udf5,
      udf4,
      udf3,
      udf2,
      udf1,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      PAYU_MERCHANT_KEY,
    ].join("|");
  }

  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
  return calculatedHash.toLowerCase() === receivedHash?.toLowerCase();
}

export function buildPayuForm(
  params: PayuPaymentParams,
  hash: string
): Record<string, string> {
  return {
    key: PAYU_MERCHANT_KEY,
    txnid: params.txnid,
    amount: params.amount,
    productinfo: params.productinfo,
    firstname: params.firstname,
    email: params.email,
    phone: params.phone,
    surl: params.surl,
    furl: params.furl,
    hash: hash,
    udf1: params.udf1 || "",
    udf2: params.udf2 || "",
    udf3: params.udf3 || "",
    udf4: params.udf4 || "",
    udf5: params.udf5 || "",
  };
}
