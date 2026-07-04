import express from "express"; 
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

dotenv.config()


const app = express()
const port = process.env.PORT || 8000

connectDB();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials : true
}))

app.get('/',(req,res) => {
    res.send("API Working")
})

app.listen(port, () => {
    console.log(`Server is Running at ${port}`)
})