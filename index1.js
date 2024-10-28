const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// MongoDB URL (replace with your connection string)
const mongoURI = 'mongodb+srv://satya288:hellomini@spnweb.2nt6szt.mongodb.net/?retryWrites=true&w=majority&appName=spnweb';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define a schema for sensor data
const sensorSchema = new mongoose.Schema({
    mobileNumber: String,
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Accident detection thresholds
const ACCEL_THRESHOLD = 50;  // m/s²
const GYRO_THRESHOLD = 5;    // rad/s
const SPEED_THRESHOLD = 20;  // m/s (72 km/h)

app.post('/upload_sensor_data', async (req, res) => {
    const {
        mobileNumber, latitude, longitude, speed,
        accelX, accelY, accelZ, gyroX, gyroY, gyroZ,
        magnetoX, magnetoY, magnetoZ, proximity, light
    } = req.body;

    let accidentDetected = false;

    // Calculate total acceleration and total rotational velocity
    const totalAcceleration = Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);
    const totalGyro = Math.sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);

    // Accident detection logic
    if (totalAcceleration > ACCEL_THRESHOLD && totalGyro > GYRO_THRESHOLD && speed == 0) {
        accidentDetected = true;
    }

    // Create a new sensor data entry
    const newSensorData = new SensorData({
        mobileNumber,
        latitude,
        longitude,
        speed,
        accelX, accelY, accelZ,
        gyroX, gyroY, gyroZ,
        magnetoX, magnetoY, magnetoZ,
        proximity, light,
        accidentDetected
    });

    // Save sensor data to MongoDB
    try {
        await newSensorData.save();
        res.status(200).json({
            message: 'Data received successfully',
            accidentDetected: accidentDetected
        });
        console.log(`Data from ${mobileNumber} received. Accident Detected: ${accidentDetected}`);
    } catch (error) {
        res.status(500).json({ message: 'Error saving data to database' });
    }
});

// Start the server
const PORT = env.process.PORT|| 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
