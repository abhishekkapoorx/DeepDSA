import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import chalk from 'chalk';


import {requestLogger} from "./middleware/customMiddleware.ts"
import {createBasicRateLimiter} from "./middleware/rateLimiter.ts"
import {configureCors} from "./config/corsConfig.ts"
import routes from "./routes/index.ts";


import { ENV_VARS } from "./config/envVars.ts";
import { connectDB } from "./config/db.ts";

const app = express();
const PORT = ENV_VARS.PORT;
const __dirname = path.resolve();


app.use(configureCors())
// app.use(addTimeStamp);
app.use(requestLogger);
app.use(createBasicRateLimiter(50, 15 * 60 * 1000));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.get("/", (req, res) => {
    console.log('Health check hit');
    res.status(200).json({ success: true, message: 'Server is up and running!' });
});



app.use("/api", routes);




// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error(chalk.red(err.stack));
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Server Error",
        stack: ENV_VARS.NODE_ENV === "production" ? null : err.stack,
    });
});

// Serve static files in production
if (ENV_VARS.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(chalk.bgWhite("Server started at http://localhost:" + PORT));
    console.log(chalk.bgYellow.blue("Frontend started at " + ENV_VARS.FRONTEND_URL));

    connectDB().catch((err) => {
        console.error(chalk.bgRed.white("Database connection failed:"), err);
    });

});