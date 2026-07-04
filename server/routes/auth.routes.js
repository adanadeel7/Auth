import express from 'express'
import { Login,Logout,Register } from '../controller/auth.controller.js';
const authrouter = express.Router(); 

authrouter.post('/register', Register)
authrouter.post('/login', Login)
authrouter.post('/logout', Logout)


export default authrouter
