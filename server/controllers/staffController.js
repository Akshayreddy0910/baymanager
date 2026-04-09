import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { getIO } from '../server.js';

// Get all users who have the 'staff' role
export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

// Create a new staff member
export const addStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation using a for loop
    const required = ['name', 'email', 'password'];
    for (let i = 0; i < required.length; i++) {
        if (!req.body[required[i]]) {
            return res.status(400).json({ message: `Missing field: ${required[i]}` });
        }
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
        return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staffMember = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'staff'
    });

    const staffData = staffMember.toObject();
    delete staffData.password;

    const io = getIO();
    if (io) {
        io.emit('staff:created', staffData);
    }

    res.status(201).json(staffData);
  } catch (error) {
    res.status(500).json({ message: 'Error adding staff', error: error.message });
  }
};

// Update existing staff details
export const updateStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') {
        return res.status(404).json({ message: 'Staff member not found' });
    }

    if (name) staff.name = name;
    if (email) staff.email = email.toLowerCase().trim();
    if (password) {
        const salt = await bcrypt.genSalt(10);
        staff.password = await bcrypt.hash(password, salt);
    }

    await staff.save();

    const updatedData = staff.toObject();
    delete updatedData.password;

    const io = getIO();
    if (io) {
        io.emit('staff:updated', updatedData);
    }

    res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff', error: error.message });
  }
};

// Remove a staff member
export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') {
        return res.status(404).json({ message: 'Staff member not found' });
    }

    // Since staff records are stored directly in the Users collection (filtered by role), 
    // deleting here removes the login account as well.
    await User.findByIdAndDelete(req.params.id);

    const io = getIO();
    if (io) {
        io.emit('staff:deleted', req.params.id);
    }

    res.status(200).json({ message: 'Staff member and their login access removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff', error: error.message });
  }
};
