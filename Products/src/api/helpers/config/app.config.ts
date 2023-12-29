import dotenv from "dotenv";

dotenv.config();

const env = (key: any, defaultValue = null) => {
  return process.env[key] || defaultValue;
};

export const AppConfig = {
    API_PREFIX: process.env.API_PREFIX,
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 3002,
    MONGO_URI: process.env.MONGO_URL,
}