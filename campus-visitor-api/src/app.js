const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const visitorsRoutes = require('./routes/visitors.routes');
const hostsRoutes = require('./routes/hosts.routes');
const visitsRoutes = require('./routes/visits.routes');
const logsRoutes = require('./routes/logs.routes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Campus Visitor API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorsRoutes);
app.use('/api/hosts', hostsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/logs', logsRoutes);

app.use(errorHandler);

module.exports = app;