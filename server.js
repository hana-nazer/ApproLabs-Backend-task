const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const dbConfig = require('./config/dbConfig')
const userRouter = require('./routes/userRoute')

app.use(express.json())
app.use(cors())
app.use('/',userRouter)

const port = process.env.PORT || 3000;

app.listen(port,() => {
    console.log(`server is running in the port ${port}`);
  });


  module.exports = app;
