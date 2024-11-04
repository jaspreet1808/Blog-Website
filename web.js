import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { DBConnection } from "./database/DBConnection.js";
import { errorMiddleware } from "./middlewares/Error.js";
import UserRouter from "./Routes/UserRouter.js";
import BlogRouter from "./Routes/BlogRouter.js";
import fileUpload from "express-fileupload";

const web=express();
dotenv.config({ path:"./config/config.env"});

web.use(
    cors({
        origin:[],
        methods:["GET","PUT","DELETE","POST"],
        credentials: true,
    })
);

web.use(cookieParser());
web.use(express.json());
web.use(express.urlencoded({extended: true}));
web.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
})
);
web.use("/api/v1/User",UserRouter);
web.use("/api/v1/Blog",BlogRouter);


DBConnection();

web.use(errorMiddleware);
export default web;