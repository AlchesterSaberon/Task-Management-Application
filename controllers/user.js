const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const auth = require("../auth.js");

module.exports.registration = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        
        if (existingUser) {
            return res.status(409).send({ error: "Email already registered" });
        }

        if (typeof req.body.firstName !== "string") {
            return res.status(400).send({ error: "First Name invalid" });
        } else if (typeof req.body.lastName !== "string") {
            return res.status(400).send({ error: "Last Name invalid" });
        } else if (!req.body.email.includes("@")) {
            return res.status(400).send({ error: "Email invalid" });
        } else if (req.body.password.length < 8) {
            return res.status(400).send({ error: "Password must be at least 8 characters" });
        } else if (typeof req.body.isAdmin !== "boolean") {
            return res.status(400).send({ error: "isAdmin must be a boolean value" });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                isAdmin: req.body.isAdmin
            });
            await newUser.save();
            return res.status(201).send({ message: "Registered Successfully" });
        }
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).send({ error: "Server Error" });
    }
};

module.exports.login = async (req, res) => {
    try {
        // Validate the request body
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({ error: "Email and password are required" });
        }

        if (!req.body.email.includes("@")) {
            return res.status(400).send({ error: "Invalid email format" });
        }

        // Find the user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            // Don't reveal whether the email exists or not
            return res.status(401).send({ error: "Invalid email or password" });
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            // Don't reveal whether the password is incorrect
            return res.status(401).send({ error: "Invalid email or password" });
        }

        // If authentication is successful, create and return an access token
        const accessToken = auth.createAccessToken(user);
        return res.status(200).send({ access: accessToken });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).send({ error: "Server Error" });
    }
};

module.exports.details = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find user by ID
        const user = await User.findById(userId);

        // If user not found, return 404 error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.password = undefined;

        // Return user details without password
        return res.status(200).json({ user });
    } catch (err) {
        // Log and handle errors
        console.error("Error in fetching user profile", err);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

module.exports.changePassword = async (req, res) => {
    try {
        const newPassword = req.body.password;
        const userId = req.user.id;

        // Find user by ID
        const user = await User.findById(userId);

        // If user not found, return 404 error
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate new password (e.g., minimum length)
        if (newPassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Return success message
        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        // Log and handle errors
        console.error("Error in changing password: ", error);
        return res.status(500).json({ error: "Failed to update password" });
    }
};

module.exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        // Find user by ID
        const user = await User.findById(userId);

        // If user not found, return 404 error
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify user's password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        // If password is incorrect, return 401 Unauthorized error
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Delete the user
        await User.deleteOne({ _id: userId });

        // Return success message
        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        // Log and handle errors
        console.error("Error in deleting account: ", error);
        return res.status(500).json({ error: "Failed to delete account" });
    }
};
