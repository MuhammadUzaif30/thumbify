import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";

const fromSystem = process.env.CLOUDINARY_URL;
const fromFile = fs.existsSync(".env") ? dotenv.parse(fs.readFileSync(".env")).CLOUDINARY_URL : undefined;

const cloudOf = (u) => (u ? u.split("@")[1] : "(not set)");
console.log("cloud name in .env file      :", cloudOf(fromFile));
console.log("cloud name in system env var :", cloudOf(fromSystem));
if (fromSystem && fromFile && fromSystem !== fromFile) {
  console.log("\n>>> WARNING: your system has its own CLOUDINARY_URL that OVERRIDES .env. Your server uses the system one.\n");
}

const url = fromSystem || fromFile;
if (!url) { console.log("No CLOUDINARY_URL found anywhere."); process.exit(1); }

const [creds, cloud] = url.replace("cloudinary://", "").split("@");
const [key, secret = ""] = creds.split(":");
console.log("\nUSING cloud name :", cloud);
console.log("USING api key    :", key.slice(0, 4) + "..." + key.slice(-3), "(length " + key.length + ")");
console.log("secret length    :", secret.length, "(normally about 27)");

const timestamp = Math.floor(Date.now() / 1000);
const signature = crypto.createHash("sha1").update(`timestamp=${timestamp}${secret}`).digest("hex");
const body = new URLSearchParams({
  file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  api_key: key, timestamp: String(timestamp), signature,
});
try {
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body });
  console.log("\nRESULT:", r.status);
  console.log((await r.text()).replace(/"secure_url":"[^"]*"/, '"secure_url":"...ok..."').slice(0, 500));
} catch (e) { console.log("\nNetwork error:", e.message); }