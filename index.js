const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));

const authRouter = require('./routes/auth');
const bankRouter = require('./routes/bank');
const tokenRouter = require('./routes/tokens');
const transactionRouter = require('./routes/transactions');

app.use('/auth', authRouter);
app.use('/bank', bankRouter);
app.use('/token', tokenRouter);
app.use('/transactions', transactionRouter)


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
