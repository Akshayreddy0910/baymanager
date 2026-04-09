import JobCard from '../models/JobCard.js';
import Booking from '../models/Booking.js';
import { sendEmail } from '../config/mailer.js';
import { getIO } from '../server.js'; // Import IO for real-time sync

// Controller for admins to create a new job card for a mechanic
export const createJobCard = async (req, res) => {
  try {
    const { bookingId, mechanicId, tasks } = req.body;

    const required = ['bookingId', 'mechanicId', 'tasks'];
    for (let i = 0; i < required.length; i++) {
        if (!req.body[required[i]]) {
            return res.status(400).json({ message: `Missing required data: ${required[i]}` });
        }
    }

    const jobCard = await JobCard.create({
      bookingId,
      mechanicId,
      tasks,
    });

    // Populate for the real-time update
    const populatedJobCard = await JobCard.findById(jobCard._id)
      .populate({
          path: 'bookingId',
          populate: { path: 'vehicleId customerId' }
      })
      .populate('mechanicId', 'name email');

    // REAL-TIME: Emit event for admin and staff dashboards
    const io = getIO();
    if (io) {
        io.emit('jobCard:created', populatedJobCard);
    }

    res.status(201).json(populatedJobCard);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job card', error: error.message });
  }
};

export const getAllJobCards = async (req, res) => {
  try {
    const jobCards = await JobCard.find({})
      .populate({
          path: 'bookingId',
          populate: { path: 'vehicleId customerId' }
      })
      .populate('mechanicId', 'name email');
    
    res.status(200).json(jobCards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job cards', error: error.message });
  }
};

export const getMyJobCards = async (req, res) => {
  try {
    const jobCards = await JobCard.find({ mechanicId: req.user._id })
      .populate({
          path: 'bookingId',
          populate: { path: 'vehicleId' }
      });
      
    res.status(200).json(jobCards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my job cards', error: error.message });
  }
};

export const updateJobCardStatus = async (req, res) => {
  try {
    const { status, tasks } = req.body;

    const jobCard = await JobCard.findById(req.params.id);

    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    if (req.user.role === 'staff' && jobCard.mechanicId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this job card' });
    }

    const oldStatus = jobCard.status;
    if (status) jobCard.status = status;
    if (tasks) jobCard.tasks = tasks;

    await jobCard.save();

    // Fetch again with full population for the live update
    const updatedJobCard = await JobCard.findById(req.params.id)
      .populate({
          path: 'bookingId',
          populate: { path: 'vehicleId customerId' }
      })
      .populate('mechanicId', 'name email');

    // REAL-TIME: Emit update event
    const io = getIO();
    if (io) {
        io.emit('jobCard:updated', updatedJobCard);
    }

    // --- AUTOMATION LOGIC (Sync Booking Status + Email) ---
    if (status && status !== oldStatus) {
        try {
            const fullBooking = updatedJobCard.bookingId;
            if (fullBooking) {
                // 1. Map JobCard status to Booking status
                // We keep them identical for better visibility
                await Booking.findByIdAndUpdate(fullBooking._id, { status: status });
                
                // 2. REAL-TIME: Emit booking:updated event
                if (io) {
                    const freshBooking = await Booking.findById(fullBooking._id).populate('vehicleId customerId');
                    io.emit('booking:updated', freshBooking);
                }
            }

            // 3. SPECIAL CASE: Completion Email
            if (status === 'Completed' && oldStatus !== 'Completed') {
                if (fullBooking && fullBooking.customerId?.email) {
                    const htmlContent = `
                        <div style="font-family: sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 15px; border: 1px solid #e5e7eb;">
                            <h2 style="color: #059669;">Service Completed! ✅</h2>
                            <p>Hi <strong>${fullBooking.customerId.name}</strong>,</p>
                            <p>Great news! The service for your <strong>${fullBooking.vehicleId.model}</strong> has been finished.</p>
                            <hr style="border: none; border-top: 1px solid #d1d5db; margin: 20px 0;" />
                            <p>Our team has completed all the assigned tasks. You can now view your dashboard to check the details and finalize the invoice.</p>
                            <p style="font-size: 12px; color: #6b7280;">See you soon at the garage!</p>
                        </div>
                    `;
                    await sendEmail(fullBooking.customerId.email, "Service Completed - BayManager", htmlContent);
                }
            }
        } catch (autoErr) {
             console.error("Status Sync Automation Failed:", autoErr.message);
        }
    }

    res.status(200).json(updatedJobCard);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job card', error: error.message });
  }
};

export const deleteJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findByIdAndDelete(req.params.id);

    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    // REAL-TIME: Emit deletion event
    const io = getIO();
    if (io) {
        io.emit('jobCard:deleted', req.params.id);
    }

    res.status(200).json({ message: 'Job card deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job card', error: error.message });
  }
};
