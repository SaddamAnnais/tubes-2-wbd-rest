import * as dotenv from "dotenv";

dotenv.config();
export const SoapConfig: { url: string; key: string } = {
  url: process.env.SOAP_URL,
  key: process.env.SOAP_KEY,
};
