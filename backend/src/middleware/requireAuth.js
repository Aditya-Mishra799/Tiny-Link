import { verifyAccessToken } from "../utils/jwt.js"
import ApiError from "../utils/ApiError.js"
const requireAuth = (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        throw new ApiError(401, "Access token missing", "TOKEN_MISSING")
    }
    try {
        const payload = verifyAccessToken(token)
        console.log("payload", payload)
        if (!payload || !payload?.userId) {
            throw new ApiError(401, "You are unauthorized, please login.", "UNAUTHORIZED")
        }
        req.user = { id: payload?.userId }
        console.log(req.user)
        next()
    } catch (error) {
        console.log("auth error", "in catch")
        next(error)
    }

}
export default requireAuth