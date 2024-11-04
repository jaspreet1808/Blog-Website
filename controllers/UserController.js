import { CatchAsyncErrors } from "../middlewares/CatchAsyncErrors.js";
import ErrorHandler from "../middlewares/Error.js";
import { User } from "../models/UserSchema.js";
import { sendToken } from "../utils/JWTToken.js";
import cloudinary from 'cloudinary';

export const register = CatchAsyncErrors(async (req,res,next) => {
    if(!req.files || Object.keys(req.files).length == 0) {
        return next(new ErrorHandler("User Avatar Required!",400));
    }
    const { Avatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if(!allowedFormats.includes(Avatar.mimetype)) {
        return next(
            new ErrorHandler("Invalid File Type.Please provide your Avatar in png or jpg or webp format.", 400)
        );
    }
    const { Name,Email,Password,Mobile_Number,Role,Education } = req.body;
    if(!Name || !Email || !Password || !Mobile_Number || !Role || !Education || !Avatar) {
        return next(new ErrorHandler("Please fill all the details", 400));
    }
    let user = await User.findOne({ Email });
    if(user) {
        return next(new ErrorHandler("User Already Exists", 400));
    }

    const CloudinaryResponse = await cloudinary.uploader.upload(
        Avatar.tempFilePath
    );
    if(!CloudinaryResponse || CloudinaryResponse.error) {
        console.error("Cloudinary Error:", CloudinaryResponse.error || "Unknown Cloudinary Error!"
        );
    }

     user = await User.create({
        Name,
        Email,
        Password,
        Mobile_Number,
        Role,
        Education,
        Avatar: {
            public_id: CloudinaryResponse.public_id,
            url: CloudinaryResponse.secure_url,
        },
    });
    sendToken(user,200,"User Registered Successfully!",res);
});

export const login = CatchAsyncErrors(async (req, res, next) => {
    const { Email, Password, Role } = req.body;
    if(!Email || !Password || !Role) {
        return next(new ErrorHandler("Please Fill the details!",400));
    }
    const user = await User.findOne({Email}).select("+Password");
    if(!user)
    {
        return next(new ErrorHandler("Invalid Email or Password!",400));
    }
    const isPasswordMatched = await user.comparePassword(Password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password",400));
    }
    if(user.Role !== Role)
    {
        return next(new ErrorHandler(`User with provided Role (${Role}) not found`,400));
    }
    sendToken(user,200,"User Logged in Successfully!",res);
});

export const logout = CatchAsyncErrors((req, res, next) => {
    res.status(200).cookie("token","", {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    .json({
        success: true,
        message: "User Logged out Successfully!",
    });
});

export const GetMyProfile = CatchAsyncErrors((req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const GetAllAuthors = CatchAsyncErrors(async (req,res,next) => {
    const Authors = await User.find({ Role: "Author" });
    res.status(200).json ({
        success: true,
        Authors,
    });
});