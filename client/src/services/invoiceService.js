import api from './api.js';

export const getAllInvoices = async () => {
    const response = await api.get('/invoices/all');
    return response.data;
};

export const getMyInvoices = async () => {
    const response = await api.get('/invoices/my');
    return response.data;
};

export const createInvoice = async (data) => {
    const response = await api.post('/invoices', data);
    return response.data;
};

export const markAsPaid = async (id) => {
    const response = await api.patch(`/payment/mark-paid/${id}`);
    return response.data;
};

export const createCheckoutSession = async (invoiceId) => {
    const response = await api.post('/payment/create-checkout-session', { invoiceId });
    
    return response.data.url;
};
