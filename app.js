require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectToMongoDB = require('./config/db.connection.js');
const app = express();
const passport = require('passport'); 

connectToMongoDB(process.env.MONGODB_URI).then(()=>{
    console.log('Mongoose connected!');
})

app.use(passport.initialize());

const vehicleRoutes = require('./routes/vehicle.routes.js');
const userRoutes = require('./routes/user.routes.js');
const complaintRoutes = require('./routes/complaint.routes.js');
const rideRoutes = require('./routes/ride.routes.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set correct MIME type for manifest.json
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Set correct MIME type for service worker
app.get('/service-worker.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, 'public', 'service-worker.js'));
});

app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));

app.use('/', userRoutes);
app.use('/vehicle',vehicleRoutes);
app.use('/ride',rideRoutes);
app.use('/help',complaintRoutes);

app.use(express.static(path.join(__dirname, "public"), { 
    setHeaders: (res, path) => {
        res.status(200);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

module.exports = app;