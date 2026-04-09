import api from './api.js';

// Service to handle all invoice-related API calls
export const getAllInvoices = async () => {
    // Fetches all invoices (Admin view)
    const response = await api.get('/invoices/all');
    return response.data;
};

export const getMyInvoices = async () => {
    // Fetches invoices belonging to the logged-in customer
    const response = await api.get('/invoices/my');
    return response.data;
};

export const createInvoice = async (data) => {
    const response = await api.post('/invoices', data);
    return response.data;
};

export const markAsPaid = async (id) => {
    // Standard function to update payment status in the database
    const response = await api.patch(`/payment/mark-paid/${id}`);
    return response.data;
};

// Stripe Integration: Function to start the checkout process
export const createCheckoutSession = async (invoiceId) => {
    // 1. Send the invoice ID to the backend to generate a Stripe URL
    const response = await api.post('/payment/create-checkout-session', { invoiceId });
    
    // 2. Return the Stripe-hosted checkout URL
    return response.data.url;
};
