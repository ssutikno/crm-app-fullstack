require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const leadsRoutes = require('./routes/leads');
const rolesRoutes = require('./routes/roles');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const dealsRoutes = require('./routes/deals');
const productsRoutes = require('./routes/products');
const dealStagesRoutes = require('./routes/dealStages');
const customersRoutes = require('./routes/customers');
const quotesRoutes = require('./routes/quotes');
const tasksRoutes = require('./routes/tasks');
const usersRoutes = require('./routes/users');
const productRequestsRoutes = require('./routes/productRequests');
const profileRoutes = require('./routes/profile'); // Import the new profile route
const analyticsRoutes = require('./routes/analytics');

app.use('/api/leads', leadsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/deal-stages', dealStagesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/product-requests', productRequestsRoutes);
app.use('/api/profile', profileRoutes); // Use the new profile route
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});