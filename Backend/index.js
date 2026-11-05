const connectToMongo = require('./db')
connectToMongo();

const express = require('express')
const app = express()
const port = process.env.PORT || 3001

const cors = require('cors')
const router = require('./Routes/router')
const authRouter = require('./Routes/auth')

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use(authRouter); // Also allow direct /login and /register
app.use(router);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server listening on port ${port}`)
})


