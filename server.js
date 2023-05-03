const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const dbConfig = require('./config/dbConfig')

app.use(express.json())
app.use(cors())

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server is running in the port ${port}`);
  });
