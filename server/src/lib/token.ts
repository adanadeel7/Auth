import jwt from 'jsonwebtoken'


export function createAccessToken(
    userId : string, 
    role : "user" | "admin", 
    tokenVersion : number
) { 

    const payload = {sub : userId, role, tokenVersion}

    
    const jwt_Secret = process.env.JWT_ACCESS_SECRET
    return jwt.sign(payload, jwt_Secret!, {
        expiresIn : '30m'
    })
}


export function createRefreshToken(
    userId : string, 
    tokenVersion : number) { 
        const payload = {sub : userId, tokenVersion}
        const jwt_Secret = process.env.JWT_ACCESS_SECRET

        return jwt.sign(payload, jwt_Secret!, {
        expiresIn : '7d'
    })

    }


export function verifyRefreshToken(token : string) { 
    return jwt.verify(token,process.env.JWT_ACCESS_SECRET! ) as { 
        sub : string; 
        tokenVersion : number; 
    }
}