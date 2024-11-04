import express from "express";
import { GetAllAuthors, GetMyProfile, login,logout,register } from "../controllers/UserController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/Auth.js";

const router =express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/MyProfile", isAuthenticated,  GetMyProfile);
router.get("/Authors", GetAllAuthors);

export default router;