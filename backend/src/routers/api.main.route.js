import express from "express";
import authRouter from "./auth.route.js";
import urlRouter from "./url.route.js";
const router = express.Router();

router.use("/auth", authRouter);
router.use("/links", urlRouter);
export default router;