import express from "express";
import v1Routes from "./initialRoutes";
import { urlVersioning } from "../../middleware/apiVersioning.ts";

const router = express.Router();

router.use("/v1", urlVersioning("v1"), v1Routes);

export default router;