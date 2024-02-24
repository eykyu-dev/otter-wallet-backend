const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRouter = require('./routes/auth');

app.use('/auth', authRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
