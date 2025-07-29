import cors from "cors";
import { ENV_VARS } from "../config/envVars.ts";

const configureCors = () => {
  return cors({
    //origin -> this will tell that which origins you want user can access your api
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5000",
        "http://localhost:5173", // Add your frontend URL
        ENV_VARS.FRONTEND_URL,   // Add 
        "https://yourcustomdomain.com", //production domain
      ];

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true); //giving permission so that req can be allowed
      } else {
        callback(new Error("Not allowed by cors"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Version"],
    exposedHeaders: ["X-Total-Count", "Content-Range"],
    credentials: true, //enable support for cookies,
    preflightContinue: false,
    maxAge: 600, // cache pre flight responses for 10 mins  (600 seconds) -> avoid sending options requests multiple times
    optionsSuccessStatus: 204,
  });
};

export { configureCors };