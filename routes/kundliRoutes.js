const express = require("express");
const { generateKundli, getUserKundlis, getKundliById } = require("../controllers/kundliController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateKundli);
router.get("/", protect, getUserKundlis);
router.get("/:id", protect, getKundliById);

module.exports = router;