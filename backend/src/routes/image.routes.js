import express from "express";
import { generateImage, enhancePromptOnly } from "../controller/image.controller.js";

const router = express.Router();

// Single unified endpoint: handles optional enhance + generate
router.post("/generate", generateImage);

// Endpoint to only enhance prompt
router.post("/enhance", enhancePromptOnly);

export default router;