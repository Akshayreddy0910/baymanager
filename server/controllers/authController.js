import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isValidEmail } from '../utils/validators.js';

// Controller function to handle new user registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // --- VALIDATIONS ---
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Full name is required' });
    }
    if (name.trim().length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }
    if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'customer',
    });

    // If the new user is a customer, create their Customer profile record immediately
    if (newUser.role === 'customer') {
        try {
            const Customer = (await import('../models/Customer.js')).default;
            await Customer.create({
                name: newUser.name,
                email: newUser.email,
                phone: phone || 'Not Provided'
            });
        } catch (customerErr) {
            console.error("Auto-Customer profile creation failed:", customerErr.message);
            // We don't fail registration here, but the user is created.
        }
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Controller function to handle user login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- VALIDATIONS ---
    if (!email || !email.trim()) {
        return res.status(400).json({ message: 'Email address is required' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your email and password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your email and password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};
