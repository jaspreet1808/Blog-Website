export const sendToken = (user,statusCode,message,res) => {
    const token = user.getJWTToken();
    const options = {
        expiresIn: new Date(
            Date.now() + process.env.COOKIE_EXPIRE *24*60*60*1000 || "7d"
        ),
        httpOnly: true,
    };
    res.status(statusCode).cookie("token",token,options).json({
        success: true,
        user,
        message,
        token,
    });

};