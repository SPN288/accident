const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// MongoDB connection
mongoose.connect('mongodb+srv://satya288:hellomini@spnweb.2nt6szt.mongodb.net/?retryWrites=true&w=majority&appName=spnweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Schema definition
const sensorSchema = new mongoose.Schema({
    mobileNumber: { type: String, unique: true },
    timestamp: { type: Date, default: Date.now },
    latitude: Number,
    longitude: Number,
    speed: Number,
    accelX: Number,
    accelY: Number,
    accelZ: Number,
    gyroX: Number,
    gyroY: Number,
    gyroZ: Number,
    magnetoX: Number,
    magnetoY: Number,
    magnetoZ: Number,
    proximity: Number,
    light: Number,
    accidentDetected: Boolean
});

const SensorData = mongoose.model('SensorData', sensorSchema);

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const ACCEL_THRESHOLD = 50;  // m/s²
const GYRO_THRESHOLD = 5;    // rad/s

// Update or insert sensor data
app.post('/upload_sensor_data', async (req, res) => {
    const { mobileNumber, latitude, longitude, speed, accelX, accelY, accelZ, gyroX, gyroY, gyroZ } = req.body;

    // Accident detection logic
    const totalAcceleration = Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2);
    const totalGyro = Math.sqrt(gyroX ** 2 + gyroY ** 2 + gyroZ ** 2);
    const accidentDetected = totalAcceleration > ACCEL_THRESHOLD && totalGyro > GYRO_THRESHOLD && speed === 0;

    // Upsert (update or insert) data by mobile number
    try {
        const sensorData = await SensorData.findOneAndUpdate(
            { mobileNumber: mobileNumber },
            { latitude, longitude, speed, accelX, accelY, accelZ, gyroX, gyroY, gyroZ, accidentDetected, timestamp: new Date() },
            { upsert: true, new: true }
        );

        // If accident detected, save and update alert page
        if (accidentDetected) {
            res.sendFile(path.join(__dirname, 'public', 'alert.html'), () => {
                console.log(`Accident detected for ${mobileNumber} at coordinates: ${latitude}, ${longitude}`);
            });
        } else {
            res.status(200).json({ message: 'Data updated successfully' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error saving data to database' });
    }
});

// Serve accident alert page
app.get('/alert', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'alert.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
