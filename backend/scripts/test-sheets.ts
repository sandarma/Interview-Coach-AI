import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ override: true });

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.CLIENT_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = (process.env.CLIENT_SERVICE_ACCOUNT_KEY || "").replace(
  /\\n/g,
  "\n",
);

if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error(
    "Missing env vars. Ensure GOOGLE_SHEET_ID, CLIENT_SERVICE_ACCOUNT_EMAIL, and CLIENT_SERVICE_ACCOUNT_KEY are set in backend/.env",
  );
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

async function main() {
  // 1. Get sheet metadata to see all tabs
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetNames = meta.data.sheets?.map(
    (s) => s.properties?.title ?? "(unnamed)",
  );
  console.log("Sheet tabs:", sheetNames);
  console.log("");

  // 2. Read first 3 rows from the first tab
  const firstTab = sheetNames?.[0] ?? "Sheet1";
  console.log(`Reading first 3 rows from tab: "${firstTab}"\n`);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${firstTab}'!A1:Z3`,
  });

  const rows = res.data.values ?? [];

  if (rows.length === 0) {
    console.log("No data found.");
    return;
  }

  rows.forEach((row, i) => {
    console.log(`Row ${i + 1}:`, row);
  });
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
