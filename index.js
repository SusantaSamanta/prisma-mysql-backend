import express from "express";
import { attendanceRoutes } from "./routes/attendanceRoutes.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import 'dotenv/config';

import path from "path";
import { fileURLToPath } from "url";


const app = express();


app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


app.get('/', rateLimiter, (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});
app.use("/api",attendanceRoutes);

const port = process.env.PORT || 3001;
app.listen(port, "0.0.0.0", () => {
    console.log(`server : http://localhost:${port}/`); 
})