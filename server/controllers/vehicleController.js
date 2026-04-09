import Vehicle from '../models/Vehicle.js';
import Customer from '../models/Customer.js';
import { getIO } from '../server.js';
import { isValidRegistrationNumber, isValidVehicleYear } from '../utils/validators.js';

export const addVehicle = async (req, res) => {
  try {
    let { customerId, registrationNumber, model, year } = req.body;

    if (req.user.role === 'customer') {
        let customerProfile = await Customer.findOne({ 
            email: { $regex: new RegExp("^" + req.user.email + "$", "i") } 
        });

        // If profile doesn't exist, create it automatically (Fallback)
        if (!customerProfile) {
            customerProfile = await Customer.create({
                name: req.user.name,
                email: req.user.email.toLowerCase().trim(),
                phone: 'Not Provided' // Default as it's required in some schemas
            });
        }
        customerId = customerProfile._id;
    }

    if (req.user.role === 'admin' && !customerId) {
        return res.status(400).json({ message: 'Please select a customer for this vehicle' });
    }

    // --- VALIDATIONS ---
    if (!registrationNumber || !registrationNumber.trim()) {
        return res.status(400).json({ message: 'Registration number is required' });
    }
    const cleanRegNo = registrationNumber.toUpperCase().trim();
    
    if (!model || !model.trim()) {
        return res.status(400).json({ message: 'Vehicle model is required' });
    }
    
    if (!year) {
        return res.status(400).json({ message: 'Manufacturing year is required' });
    }

    const existingVehicle = await Vehicle.findOne({ registrationNumber: cleanRegNo });
    if (existingVehicle) {
        return res.status(400).json({ message: `Vehicle with registration number ${cleanRegNo} already exists` });
    }

    const vehicle = await Vehicle.create({
      customerId,
      registrationNumber: cleanRegNo,
      model: model.trim(),
      year: Number(year),
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id).populate('customerId');

    const io = getIO();
    if (io) {
        io.emit('vehicle:created', populatedVehicle);
    }

    res.status(201).json(populatedVehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding vehicle', error: error.message });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
        const customerProfile = await Customer.findOne({ 
            email: { $regex: new RegExp("^" + req.user.email + "$", "i") } 
        });
        if (customerProfile) {
            query = { customerId: customerProfile._id };
        } else {
            return res.status(200).json([]);
        }
    }
    const vehicles = await Vehicle.find(query).populate('customerId');
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('customerId');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle', error: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if (updates.registrationNumber) {
        updates.registrationNumber = updates.registrationNumber.toUpperCase().trim();
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('customerId');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const io = getIO();
    if (io) {
        io.emit('vehicle:updated', vehicle);
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Error updating vehicle', error: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const io = getIO();
    if (io) {
        io.emit('vehicle:deleted', req.params.id);
    }

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
  }
};
