const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        // process.env.MONGODB_URI to access the database from .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = connectDB;