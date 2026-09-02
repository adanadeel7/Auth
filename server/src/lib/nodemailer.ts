import nodemailer from "nodemailer"


export async function sendEmail(to : string, subject : string, html : string) {
    if (!process.env.BREVO_SMTP_HOST || 
        !process.env.BREVO_SMTP_PORT ||
        !process.env.BREVO_SMTP_USER || 
        !process.env.BREVO_SMTP_KEY ) { 
            console.log('Email envs are not avaliable')
            return 
        }

    const host = process.env.BREVO_SMTP_HOST
    const port = Number(process.env.BREVO_SMTP_PORT)
    const user = process.env.BREVO_SMTP_USER
    const password = process.env.BREVO_SMTP_KEY
    const from = process.env.EMAIL_FROM


    const transporter = nodemailer.createTransport({
        host,
        port,
        secure : false, 
        auth : { 
            user, 
            pass :password
        }
    })

    await transporter.sendMail({
        from, to,subject, html
    })
}