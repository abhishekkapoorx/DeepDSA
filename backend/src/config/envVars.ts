import { config } from "dotenv";
import { cleanEnv, port, str } from "envalid";
config({ path: ".env.local" });

const env = cleanEnv(process.env, {
  MONGO_URI: str(),
  PORT: port(),
  NODE_ENV: str({ default: "development" }),
  FRONTEND_URL: str({ default: "http://localhost:5173" }),
});

export const ENV_VARS = {
  MONGO_URI: env.MONGO_URI,
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,
  FRONTEND_URL: env.FRONTEND_URL,
};