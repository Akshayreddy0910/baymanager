import mongoose from 'mongoose';

// Definition of the Customer Schema for storing customer records
const customerSchema = new mongoose.Schema(
  {
    // Full name of the customer
    name: {
      type: String,
      required: true,
    },
    // Primary contact phone number
    phone: {
      type: String,
      required: true,
    },
    // Customer's email address for billing and communication
    email: {
      type: String,
      required: true,
    },
    // Physical address of the customer
    address: {
      type: String,
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create the Customer model and export it as the default module
const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
