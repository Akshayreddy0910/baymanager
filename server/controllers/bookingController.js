import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';
import { sendEmail } from '../config/mailer.js';
import { getIO } from '../server.js';

// Controller to get service type distribution using aggregation
export const getServiceTypeDistribution = async (req, res) => {
    try {
        const pipeline = [
            { $group: { _id: '$serviceType', value: { $sum: 1 } } },
            { $project: { _id: 0, name: '$_id', value: 1 } }
        ];
        const stats = await Booking.aggregate(pipeline);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching distribution stats', error: error.message });
    }
};

// Controller for customers to view only their own bookings
export const getMyBookings = async (req, res) => {
  try {
    const customerProfile = await Customer.findOne({ email: req.user.email });
    if (!customerProfile) {
        return res.status(200).json([]);
    }

    const bookings = await Booking.find({ customerId: customerProfile._id })
      .populate('vehicleId')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your bookings', error: error.message });
  }
};

// Controller to create a new service booking
export const createBooking = async (req, res) => {
  try {
    const { customerId, vehicleId, serviceType, bookingDate } = req.body;

    const booking = await Booking.create({
      customerId,
      vehicleId,
      serviceType,
      bookingDate,
    });

    const populatedBooking = await Booking.findById(booking._id)
        .populate('customerId')
        .populate('vehicleId');

    const io = getIO();
    if (io) {
        io.emit('booking:created', populatedBooking);
    }

    try {
        const customer = populatedBooking.customerId;
        if (customer && customer.email) {
            const htmlContent = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Booking Confirmed! 🚗</h2>
                    <p>Hello <strong>${customer.name}</strong>,</p>
                    <p>Your service booking has been successfully recorded.</p>
                    <hr />
                    <p><strong>Service Type:</strong> ${serviceType}</p>
                    <p><strong>Appointment Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</p>
                    <hr />
                    <p>Thank you for choosing BayManager!</p>
                </div>
            `;
            // Sending in background to prevent UI hanging on slow SMTP/network
            sendEmail(customer.email, "Booking Confirmed - BayManager", htmlContent);
        }
    } catch (mailErr) {
        console.error("Notification Error:", mailErr.message);
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('customerId')
      .populate('vehicleId');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId')
      .populate('vehicleId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ message: 'Please provide a new status' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, runValidators: true }
    ).populate('customerId').populate('vehicleId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const io = getIO();
    if (io) {
        io.emit('booking:updated', booking);
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const io = getIO();
    if (io) {
        io.emit('booking:deleted', req.params.id);
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
};
