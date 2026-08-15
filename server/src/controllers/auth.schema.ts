import {z} from 'zod'


const registerSchema = z.object({
    email : z.email(), 
    password: z.string().min(6), 
    name: z.string().min(3), 
})


export default registerSchema