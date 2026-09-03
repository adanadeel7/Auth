import express from "express"
import { registerHandler,loginHandler,forgotPasswordHandler,verifyEmailHandler,logoutHandler,refreshHandler } from "../controllers/auth.controllers.js"

const authRouter = express.Router()

authRouter.post('/register', registerHandler)
authRouter.post('/login', loginHandler)
authRouter.get('/verify-email',verifyEmailHandler)
authRouter.post('/refresh', refreshHandler)
authRouter.post('/logout',logoutHandler)
authRouter.post('/forgot-password',forgotPasswordHandler)

export default authRouter