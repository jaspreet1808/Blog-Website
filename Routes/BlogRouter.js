import express from "express";
import { BlogPost, DeleteBlog, GetAllBlogs, GetMyBlogs, GetSingleBlog, UpdateBlog } from "../controllers/BlogController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/post",isAuthenticated, isAuthorized("Author"), BlogPost);
router.delete("/delete/:id",isAuthenticated, isAuthorized("Author"), DeleteBlog);
router.get("/allblogs", GetAllBlogs);
router.get("/singleblog/:id",isAuthenticated,GetSingleBlog);
router.get("/myblogs", isAuthenticated, isAuthorized("Author"), GetMyBlogs);
router.put("/update/:id", isAuthenticated, isAuthorized("Author"), UpdateBlog);
export default router;