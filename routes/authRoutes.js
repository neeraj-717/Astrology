const express = require("express");
// const { register, getProtectedData } = require("../controllers/adminController");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { login, register, getProfile, getAllUsers } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login",((req,res, next)=>{console.log("hello login"); next()}), login);
router.get("/profile", protect, getProfile);
router.get("/users", protect, allowRoles('admin'), getAllUsers);

module.exports = router;
