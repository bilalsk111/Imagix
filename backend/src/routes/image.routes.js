import express from "express";
import { generateImage, enhancePromptOnly } from "../controller/image.controller.js";

const router = express.Router();

router.post("/generate", generateImage);
router.post("/enhance", enhancePromptOnly);

export default router;