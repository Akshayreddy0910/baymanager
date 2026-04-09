import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import JobCard from '../models/JobCard.js';
import Booking from '../models/Booking.js';
import { isValidCost, isValidObjectId } from '../utils/validators.js';

// Revenue Statistics
export const getRevenueStats = async (req, res) => {
  try {
    const totalRevenuePipeline = [
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ];
    const totalResult = await Invoice.aggregate(totalRevenuePipeline);
    const totalRevenue = totalResult.length > 0 ? totalResult[0].total : 0;

    const monthlyRevenuePipeline = [
      { $match: { paymentStatus: 'Paid' } },
      { $project: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' }, totalAmount: 1 } },
      { $group: { _id: { month: '$month', year: '$year' }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ];
    const monthlyStats = await Invoice.aggregate(monthlyRevenuePipeline);

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedStats = [];
    for (let i = 0; i < monthlyStats.length; i++) {
        const item = monthlyStats[i];
        formattedStats.push({ name: `${monthNames[item._id.month]} ${item._id.year}`, revenue: item.revenue });
    }

    res.status(200).json({ totalRevenue, monthlyStats: formattedStats });
  } catch (error) {
    res.status(500).json({ message: 'Error generating revenue reports', error: error.message });
  }
};

// Create a new invoice (Admin only)
export const createInvoice = async (req, res) => {
  try {
    const { jobCardId, serviceCost, laborCost } = req.body;

    // --- VALIDATIONS ---
    if (!jobCardId) {
        return res.status(400).json({ message: 'Please select a Job Card to bill against' });
    }
    if (!isValidObjectId(jobCardId)) {
        return res.status(400).json({ message: 'Invalid Job Card ID format' });
    }
    if (serviceCost === undefined || serviceCost === null || serviceCost === '') {
        return res.status(400).json({ message: 'Service cost is required' });
    }
    if (!isValidCost(serviceCost)) {
        return res.status(400).json({ message: 'Service cost must be a valid non-negative number' });
    }
    if (laborCost === undefined || laborCost === null || laborCost === '') {
        return res.status(400).json({ message: 'Labor cost is required' });
    }
    if (!isValidCost(laborCost)) {
        return res.status(400).json({ message: 'Labor cost must be a valid non-negative number' });
    }

    // Check the job card exists
    const jobCardExists = await JobCard.findById(jobCardId);
    if (!jobCardExists) {
        return res.status(404).json({ message: 'The selected Job Card does not exist' });
    }

    const sCost = Number(serviceCost);
    const lCost = Number(laborCost);
    const tAmount = sCost + lCost;

    const invoice = new Invoice({ jobCardId, serviceCost: sCost, laborCost: lCost, totalAmount: tAmount });
    await invoice.save();

    let populatedInvoice;
    try {
        populatedInvoice = await Invoice.findById(invoice._id).populate({
            path: 'jobCardId',
            populate: { path: 'bookingId', populate: { path: 'customerId' } }
        });
    } catch (popErr) {
        populatedInvoice = invoice;
    }

    try {
        const io = req.app.get('io');
        if (io) io.emit('invoice:created', populatedInvoice);
    } catch (ioErr) {}

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error: error.message });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({}).populate({
        path: 'jobCardId',
        populate: { path: 'bookingId', populate: { path: 'customerId' } }
    });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid invoice ID format' });
    }
    const invoice = await Invoice.findById(req.params.id).populate({
        path: 'jobCardId',
        populate: { path: 'bookingId' }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice', error: error.message });
  }
};

export const getMyInvoices = async (req, res) => {
  try {
    const customerProfile = await Customer.findOne({ email: req.user.email });
    if (!customerProfile) return res.status(200).json([]);

    const customerId = customerProfile._id;
    const allInvoices = await Invoice.find({}).populate({
      path: 'jobCardId',
      populate: { path: 'bookingId' }
    });

    let myInvoices = [];
    for (let i = 0; i < allInvoices.length; i++) {
        const inv = allInvoices[i];
        if (inv.jobCardId?.bookingId?.customerId?.toString() === customerId.toString()) {
            myInvoices.push(inv);
        }
    }

    res.status(200).json(myInvoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your invoices', error: error.message });
  }
};

export const markAsPaid = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId || req.params.id;

    if (!isValidObjectId(invoiceId)) {
        return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { paymentStatus: 'Paid' },
      { new: true }
    );

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const io = req.app.get('io');
    if (io) io.emit('payment:success', { invoiceId: invoice._id, amount: invoice.totalAmount });

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
};
