// importing required modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const port = process.env.PORT || 3000;
const taskRoutes = require('./routes/taskRoutes');
const listRoutes = require('./routes/listRoutes');

// createing an express application
const app = express();

// middleware
app.use(cors({
    origin: 'http://localhost:3000',

}));
app.use(express.json());

app.use((req, res, next ) => {
    console.log(req.method, req.url);
    next();
})

// Mount routers at different endpoints
app.use('/api/tasks', taskRoutes);
app.use('/api/lists', listRoutes);

//connecting to the database
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
    }) 
    .catch((err) => {
        console.log(err);
        console.log('Could not connect to the database');
    })


