import Stripe from 'stripe';
import Invoice from '../models/Invoice.js';
import JobCard from '../models/JobCard.js';

// Controller to handle Stripe Checkout session creation
export const createCheckoutSession = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
        return res.status(400).json({ message: 'Invoice ID is required' });
    }

    // 1. Initialize Stripe with the correct secret key from .env
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // 2. Find the invoice to get the amount
    const invoice = await Invoice.findById(invoiceId).populate('jobCardId');
    if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
    }

    // Prevent double payment
    if (invoice.paymentStatus === 'Paid') {
        return res.status(400).json({ message: 'This invoice has already been paid' });
    }

    // 3. Ensure amount is a valid positive number (Stripe minimum is $0.50 = 50 cents)
    const totalAmount = invoice.totalAmount || 0;
    const amountInCents = Math.round(totalAmount * 100);
    if (amountInCents < 50) {
        return res.status(400).json({ message: 'Invoice amount is too low for payment processing (minimum $0.50)' });
    }

    // 4. Create the Stripe Checkout Session
    const origin = req.headers.origin || process.env.CLIENT_URL;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BayManager Garage Service',
              description: `Service Invoice #${invoiceId.toString().slice(-8).toUpperCase()}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard/invoices?success=true&invoiceId=${invoiceId}&jobCardId=${invoice.jobCardId?._id || invoice.jobCardId || ''}`,
      cancel_url: `${origin}/dashboard/invoices?canceled=true`,
    });

    // 5. Return the redirect URL
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ message: 'Payment initialization failed', error: error.message });
  }
};
