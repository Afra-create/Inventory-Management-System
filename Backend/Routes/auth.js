const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Users = require('../Models/Users');
const { fetchUser, JWT_SECRET } = require('../middleware/fetchUser');

// Fallback in-memory storage for users if MongoDB Atlas is disconnected
let localUsers = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

// 1. Register: POST /auth/register
router.post('/register', async (req, res) => {
    let success = false;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success, error: "Please provide name, email, and password." });
    }

    if (password.length < 5) {
        return res.status(400).json({ success, error: "Password must be at least 5 characters long." });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();

        if (isDbConnected()) {
            let existingUser = await Users.findOne({ email: normalizedEmail });
            if (existingUser) {
                return res.status(400).json({ success, error: "A user with this email already exists." });
            }

            const salt = await bcrypt.genSalt(10);
            const securePassword = await bcrypt.hash(password, salt);

            const user = await Users.create({
                name: name.trim(),
                email: normalizedEmail,
                password: securePassword
            });

            const payload = {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email
                }
            };

            const token = jwt.sign(payload, JWT_SECRET);
            success = true;
            return res.status(201).json({ success, token, user: payload.user });
        } else {
            let existingUser = localUsers.find(u => u.email === normalizedEmail);
            if (existingUser) {
                return res.status(400).json({ success, error: "A user with this email already exists." });
            }

            const salt = await bcrypt.genSalt(10);
            const securePassword = await bcrypt.hash(password, salt);

            const user = {
                _id: new mongoose.Types.ObjectId().toString(),
                name: name.trim(),
                email: normalizedEmail,
                password: securePassword
            };
            localUsers.push(user);

            const payload = {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            };

            const token = jwt.sign(payload, JWT_SECRET);
            success = true;
            return res.status(201).json({ success, token, user: payload.user });
        }
    } catch (err) {
        console.error("Register Error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Login: POST /auth/login
router.post('/login', async (req, res) => {
    let success = false;
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success, error: "Please enter both email and password." });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();

        if (isDbConnected()) {
            const user = await Users.findOne({ email: normalizedEmail });
            if (!user) {
                return res.status(400).json({ success, error: "Invalid email or password." });
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(400).json({ success, error: "Invalid email or password." });
            }

            const payload = {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email
                }
            };

            const token = jwt.sign(payload, JWT_SECRET);
            success = true;
            return res.status(200).json({ success, token, user: payload.user });
        } else {
            const user = localUsers.find(u => u.email === normalizedEmail);
            if (!user) {
                return res.status(400).json({ success, error: "Invalid email or password." });
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(400).json({ success, error: "Invalid email or password." });
            }

            const payload = {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            };

            const token = jwt.sign(payload, JWT_SECRET);
            success = true;
            return res.status(200).json({ success, token, user: payload.user });
        }
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Get User: GET /auth/getuser (Protected)
router.get('/getuser', fetchUser, async (req, res) => {
    try {
        if (isDbConnected()) {
            const user = await Users.findById(req.user.id).select("-password");
            return res.status(200).json({ success: true, user });
        } else {
            const user = localUsers.find(u => u._id === req.user.id);
            if (!user) {
                return res.status(404).json({ success: false, error: "User not found." });
            }
            const { password, ...userWithoutPassword } = user;
            return res.status(200).json({ success: true, user: userWithoutPassword });
        }
    } catch (err) {
        console.error("GetUser Error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;

