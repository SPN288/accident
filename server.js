const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB Atlas
const dbURI = 'mongodb+srv://satya288:hellomini@spnweb.2nt6szt.mongodb.net/?retryWrites=true&w=majority&appName=spnweb';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.log("Error: ", err));

// Define the Schema and Model for sensor data
const sensorDataSchema = new mongoose.Schema({
    mobileNumber: { type: String, unique: true },
    latitude: Number,
    longitude: Number,
    speed: Number,
    accelX: Number,
    accelY: Number,
    accelZ: Number,
    gyroX: Number,
    gyroY: Number,
    gyroZ: Number
});

const SensorData = mongoose.model("SensorData", sensorDataSchema);

// Endpoint to handle sensor data upload
app.post("/upload_sensor_data", async (req, res) => {
    const { mobileNumber, latitude, longitude, speed, accelX, accelY, accelZ, gyroX, gyroY, gyroZ } = req.body;

    try {
        // Find the document by mobile number and update it, or create a new one if it doesn't exist
        await SensorData.findOneAndUpdate(
            { mobileNumber },
            { mobileNumber, latitude, longitude, speed, accelX, accelY, accelZ, gyroX, gyroY, gyroZ },
            { upsert: true, new: true }
        );
        res.status(200).send("Data updated successfully");
    } catch (error) {
        res.status(500).send("Error updating data");
        console.error("Database Error:", error);
    }
});
const PORT = env.process.PORT|| 3000;
app.listen(PORT, () => {
    console.log("Server running on port 3000");
});
