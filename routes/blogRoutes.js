const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadTeamImage.js");
// const {createTeamMember, getTeamMembers, deleteTeamMember} = require("../controllers/teamController");
// const { createService, getService, deleteService } = require("../controllers/serviceboxController.js");
const { protect, allowRoles } = require("../middleware/authMiddleware.js");
const { createBlog, deleteBlog, getBlog } = require("../controllers/blogController.js");


router.post("/",  protect,allowRoles("admin"), upload.single("image"), createBlog);

router.get("/",getBlog);
router.delete("/:id", protect,allowRoles("admin"), deleteBlog);

module.exports = router;

