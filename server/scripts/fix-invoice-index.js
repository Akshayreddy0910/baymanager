import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('invoices');
        
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));
        
        const hasIndex = indexes.some(i => i.name === 'invoiceNumber_1');
        if (hasIndex) {
            await collection.dropIndex('invoiceNumber_1');
            console.log('🗑️  Successfully dropped stale invoiceNumber_1 index');
        } else {
            console.log('ℹ️  invoiceNumber_1 index not found (already clean)');
        }
        
        const afterIndexes = await collection.indexes();
        console.log('Remaining indexes:', afterIndexes.map(i => i.name));
        
        await mongoose.disconnect();
        console.log('✅ Migration complete. Invoice creation should now work.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

run();
