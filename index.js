const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.route');
const authRoutes = require('./routes/auth.route');
const postRoutes = require('./routes/post.route');
const commentRoutes = require('./routes/comment.route');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO,{ dbName: process.env.DBNAME })
  .then(() => {
    console.log('MongoDb is connected');
  })
  .catch((err) => {
    console.log(err);
  });


const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5050;

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(PORT, () => {
 console.log(`Server listening on http://localhost:${PORT}`);
});