import express from "express"
import { registerHandler,loginHandler,verifyEmailHandler,logoutHandler,refreshHandler } from "../controllers/auth.controllers.js"

const authRouter = express.Router()

authRouter.post('/register', registerHandler)
authRouter.post('/login', loginHandler)
authRouter.get('/verify-email',verifyEmailHandler)
authRouter.post('/refresh', refreshHandler)
authRouter.post('/logout',logoutHandler)

export default authRouter