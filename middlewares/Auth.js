import { CatchAsyncErrors } from "../middlewares/CatchAsyncErrors.js";
import { User } from "../models/UserSchema.js";
import ErrorHandler from "../middlewares/Error.js";
import jwt from "jsonwebtoken";

//Authentication
export const isAuthenticated = CatchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;
    if(!token) {
        return next(new ErrorHandler("User is not Authenticated!", 400));
    }
    const Decoded = jwt.verify(token, process.env.JWT_Secret_Key);

    req.user = await User.findById(Decoded.id);

    next();
});

//Authorization
export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.Role)) {
            return next(
                new ErrorHandler(
                    `User with this role (${req.user.Role}) not allowed to access this resource`
                )
            );
 
        }
        next();
    };
};