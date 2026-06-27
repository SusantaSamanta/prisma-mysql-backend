import express from "express";
import { attendanceRoutes } from "./routes/attendanceRoutes.js";

import path from "path";
import { fileURLToPath } from "url";


const app = express();


app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});
app.use("/api",attendanceRoutes);

app.listen(3000, () => {
    console.log(`server : http://localhost:${3000}/`);
})