const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadTeamImage.js");
// const {createTeamMember, getTeamMembers, deleteTeamMember} = require("../controllers/teamController");
const {protect, allowRoles } = require("../middleware/authMiddleware.js");
// const { createOurMember, getOurMembers, deleteOurMember } = require("../controllers/ourmemberController.js");
const { createProduct, getProducts, deleteProduct } = require("../controllers/productController.js");

// Routes
router.post("/", protect, allowRoles("admin"), upload.single("image"), createProduct);
router.get("/", getProducts);
router.delete("/:id", protect,allowRoles("admin"), deleteProduct);

module.exports = router;
