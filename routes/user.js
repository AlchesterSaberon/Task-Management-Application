const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.js");
const { verify, verifyAdmin } = require("../auth.js");

// User Registration
router.post("/register", userController.registration);
// User Login
router.post("/login", userController.login);
// User Details
router.get("/details", verify, userController.details);
// Update Password
router.patch("/update-password", verify, userController.changePassword);
// Delete account route
router.delete('/delete-account', verify, userController.deleteAccount);

module.exports = router;