const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Kripya naam, email aur password zaroori dalein." });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Yeh email pehle se register hai!" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user' 
        });
        res.status(201).json({
            message: "Account successfully create ho gaya! 🎉",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Registration fail ho gaya", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email aur Password dono zaroori hain" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User nahi mila! Kripya sahi email dalein." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Galat password! Dubara koshish karein." });
        }
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } 
        );
        return res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Login mein koi galti hui", error: error.message });
    }
};

module.exports = { createUser, loginUser };
