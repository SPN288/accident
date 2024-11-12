require('dotenv').config()
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

// // Define the Schema and Model for sensor data
// const sensorDataSchema = new mongoose.Schema({
//     mobileNumber: { type: String, unique: true },
//     latitude: Number,
//     longitude: Number,
//     speed: Number,
//     accelX: Number,
//     accelY: Number,
//     accelZ: Number,
//     gyroX: Number,
//     gyroY: Number,
//     gyroZ: Number
// });

// const SensorData = mongoose.model("SensorData", sensorDataSchema);

// // Endpoint to handle sensor data upload
// app.post("/upload_sensor_data", async (req, res) => {
//     console.log("Received data:", req.body);  // Log received data
//     const { mobileNumber, latitude, longitude, speed, accelX, accelY, accelZ, gyroX, gyroY, gyroZ } = req.body;

//     try {
//         // Find the document by mobile number and update it, or create a new one if it doesn't exist
//         await SensorData.findOneAndUpdate(
//             { mobileNumber },
//             { mobileNumber, latitude, longitude, speed, accelX, accelY, accelZ, gyroX, gyroY, gyroZ },
//             { upsert: true, new: true }
//         );
//         res.status(200).send("Data updated successfully");
//     } catch (error) {
//         res.status(500).send("Error updating data");
//         console.error("Database Error:", error);
//     }
// });


const sensorDataSchema = new mongoose.Schema({
    mobileNumber: { type: String, required: true }, // Make mobile number required
    latitude: Number,
    longitude: Number,
    speed: Number,
    accelX: Number,
    accelY: Number,
    accelZ: Number,
    gyroX: Number,
    gyroY: Number,
    gyroZ: Number,
    timestamp: { type: Date, default: Date.now } // Add a timestamp for each entry
  });
  
  const SensorData = mongoose.model("SensorData", sensorDataSchema);
  
  // Endpoint to handle sensor data upload
  app.post("/upload_sensor_data", async (req, res) => {
    console.log("Received data:", req.body); // Log received data
    const { mobileNumber, latitude, longitude, speed, accelX, accelY, accelZ, gyroX, gyroY, gyroZ } = req.body;
  
    try {
      // Create a new document for each data point
      const newSensorData = new SensorData({
        mobileNumber,
        latitude,
        longitude,
        speed,
        accelX,
        accelY,
        accelZ,
        gyroX,
        gyroY,
        gyroZ,
      });
  
      await newSensorData.save();
      res.status(201).send("Data saved successfully"); // Use status code 201 for created resources
    } catch (error) {
      res.status(500).send("Error saving data");
      console.error("Database Error:", error);
    }
  });
  async function deleteOldData() {
    const threshold = Date.now() - 3000; // Current time minus 5 seconds
    try {
      await SensorData.deleteMany({ timestamp: { $lt: threshold } });
      console.log("Old data deleted successfully!");
    } catch (error) {
      console.error("Error deleting old data:", error);
    }
  }
  
  // Start the interval to delete old data every second
  setInterval(deleteOldData, 1000); // 1000 milliseconds = 1 second

const port = 1000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});