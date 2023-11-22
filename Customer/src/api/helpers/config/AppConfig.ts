import dotenv from "dotenv";

dotenv.config();

const env = (key: any, defaultValue = null) => {
  return process.env[key] || defaultValue;
};

const Config = {
  API_PREFIX: process.env.API_PREFIX,
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  SESSION_SECRET: process.env.SESSION_SECRET_KEY,
  MONGO_URI: process.env.MONGO_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXP,
  REF_TOKEN: process.env.REFRESH_TOKEN,
  REF_EXPIRY: process.env.REF_EXP,
};

export default Object.freeze(Config);
