const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.USER,
    host: 'localhost',
    database: process.env.DB,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

app.use((req, _res, next) => {
    req.pool = pool;
    next();
});

app.use('/api', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/profile'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/applications', require('./routes/applications'));

app.listen(process.env.SERVER_PORT, () => console.log('Server running'));