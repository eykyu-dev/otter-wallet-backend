// mongo.js

const mongoose = require('mongoose');
const connection = 'mongodb+srv://testuser:Password123@cluster0.6pa4w8m.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(connection)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

module.exports = mongoose;
