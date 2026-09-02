import express from "express"
import { registerHandler,loginHandler,verifyEmailHandler } from "../controllers/auth.controllers.js"

const authRouter = express.Router()

authRouter.post('/register', registerHandler)
authRouter.post('/login', loginHandler)
authRouter.get('/verify-email',verifyEmailHandler)

export default authRouter