import express from "express";
import {updateProfilePic,updateName, login, logout, signup,getUserById,getAllUsers,getNewUsers, getCountUser,UpdateActiveStatus, } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import adminProtectRoute from "../middleware/verifyAdmin.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get('/user/:id', getUserById);
router.get('/users', adminProtectRoute, getAllUsers);
router.get('/new-users',adminProtectRoute, getNewUsers);
router.get('/userCount', getCountUser);
router.put('/updateStatus/:id', UpdateActiveStatus)
router.put('/user/profile-pic',protectRoute, updateProfilePic);
router.put('/user/name',protectRoute, updateName);

export default router;
