import express from "express";
import cors from "cors";

import imageRoutes from './routes/image.routes.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/image", imageRoutes);


export default app;