require('dotenv').config();
const mongoose = require('mongoose');

const connectToMongo = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.set("bufferCommands", false);
    await mongoose.connect(process.env.Mongo_url, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("Connected to MongoDB Atlas!");
  } catch (error) {
    console.error("MongoDB Atlas connection error:", error.message);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected!');
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB Atlas!');
});

module.exports = connectToMongo;