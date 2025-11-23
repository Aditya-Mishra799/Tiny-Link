import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { addURL, inActivateURL, getUserURLs, getURL, getURLStats } from "../controllers/url.controller.js";
const router = express.Router();
router.use(requireAuth)
router.post("/", addURL);
router.get("/", getUserURLs);
router.get("/:id", getURL);
router.delete("/:id", inActivateURL);
export default router;