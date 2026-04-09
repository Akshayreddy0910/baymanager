import Customer from '../models/Customer.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { getIO } from '../server.js';

// Controller to add a new customer and automatically create a login account
export const addCustomer = async (req, res) => {
  try {
    const io = getIO();
    const { name, phone, email, address, password } = req.body;

    const required = ['name', 'phone', 'email', 'password'];
    for (let i = 0; i < required.length; i++) {
        const field = required[i];
        if (!req.body[field]) {
            return res.status(400).json({ message: `Missing required field: ${field}` });
        }
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
        return res.status(400).json({ message: "A user with this email already exists" });
    }

    const customerExists = await Customer.findOne({ email: normalizedEmail });
    if (customerExists) {
        return res.status(400).json({ message: "Customer with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = await Customer.create({
      name,
      phone,
      email: normalizedEmail,
      address,
    });

    try {
        await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "customer"
        });
    } catch (userError) {
        await Customer.findByIdAndDelete(customer._id);
        return res.status(500).json({ message: "Failed to create login account. Customer creation rolled back.", error: userError.message });
    }

    if (io) {
        io.emit("customer:created", customer);
    }

    res.status(201).json({ 
        customer: customer, 
        message: "Customer added and login account created successfully" 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error adding customer', error: error.message });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const oldEmail = customer.email;
    const { name, phone, email, address, password } = req.body;

    // 1. Update Customer Record
    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    
    if (email) {
        customer.email = email.toLowerCase().trim();
    }
    
    await customer.save();

    // 2. Synchronize with User Record (Credentials)
    const user = await User.findOne({ email: oldEmail });
    if (user) {
        if (name) user.name = name;
        if (email) user.email = email.toLowerCase().trim();
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
    }

    // Real-time notification for updates
    const io = getIO();
    if (io) {
        io.emit("customer:updated", customer);
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const emailToDelete = customer.email;

    // 1. Delete Customer Profile
    await Customer.findByIdAndDelete(req.params.id);

    // 2. Delete Associated Login Account
    await User.findOneAndDelete({ email: emailToDelete });

    const io = getIO();
    if (io) {
        io.emit("customer:deleted", req.params.id);
    }

    res.status(200).json({ message: 'Customer and associated login account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
};
