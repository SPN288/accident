const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 9000;

// Replace with your MongoDB Atlas connection string
const MONGODB_URI = "mongodb+srv://satya288:hellomini@spnweb.2nt6szt.mongodb.net/?retryWrites=true&w=majority&appName=spnweb";

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB Atlas"))
.catch((error) => console.error("MongoDB connection error:", error));

// Define data schema and model
const alertSchema = new mongoose.Schema({
    mobileNumber: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now },
    noOfBeds: { type: Number, required: true },
});

const Data = mongoose.model("alert", alertSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint to post data to alert databse for hospital alert
app.post("/postData", async (req, res) => {
    try {
        const { mobileNumber, latitude, longitude, status, noOfBeds } = req.body;
        const newData = new Data({ mobileNumber, latitude, longitude, status, noOfBeds });
        await newData.save();
        res.status(201).json({ message: "Data saved successfully!" });
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ error: "Failed to save data" });
    }
});

// Endpoint to check if any data has status === true
// app.get("/checkStatus", async (req, res) => {
//     try {
//         const result = await Data.findOne({ status: true }).select(
//             "mobileNumber latitude longitude noOfBeds timestamp"
//         );
//         if (result) {
//             res.status(200).json(result);
//         } else {
//             res.status(200).json(null); // No matching records
//         }
//     } catch (error) {
//         console.error("Error checking status:", error);
//         res.status(500).json({ error: "Failed to check status" });
//     }
// });
app.get("/checkStatus", async (req, res) => {
  try {
    const result = await Data.findOne({ status: true }).select(
      "mobileNumber latitude longitude noOfBeds timestamp"
    );

    if (result) {
      // Update the status to false after fetching the data
      await Data.updateOne({ _id: result._id }, { $set: { status: false } });

      res.status(200).json(result);
    } else {
      res.status(200).json(null); // No matching records
    }
  } catch (error) {
    console.error("Error checking status:", error);
    res.status(500).json({ error: "Failed to check status" });
  }
});

// Endpoint to update status
app.post("/updateStatus", async (req, res) => {
    try {
        const { _id } = req.body;
        await Data.findByIdAndUpdate(_id, { status: false });
        res.status(200).json({ message: "Status updated successfully!" });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ error: "Failed to update status" });
    }
});

// Endpoint to fetch all data
app.get("/getAllData", async (req, res) => {
    try {
        const allData = await Data.find();
        res.status(200).json(allData);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Hospital Schema and Model
const hospitalSchema = new mongoose.Schema({
    hospitalID: { type: Number, unique: true, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    total_of_available_beds: { type: Number, required: true },
    no_of_available_beds: { type: Number, required: true }
  });
  
  const Hospital = mongoose.model('Hospital', hospitalSchema);
  
  // Routes
  
  // Create and Add Hospital Data
  app.post('/hospital', async (req, res) => {
    try {
      const hospital = new Hospital(req.body);
      await hospital.save();
      res.status(201).json(hospital);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Find Hospital by hospitalID
  app.get('/hospital/:id', async (req, res) => {
    try {
      const hospital = await Hospital.findOne({ hospitalID: req.params.id });
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update no_of_available_beds by hospitalID
  app.patch('/hospital/:id', async (req, res) => {
    try {
      const { no_of_available_beds } = req.body;
      const hospital = await Hospital.findOneAndUpdate(
        { hospitalID: req.params.id },
        { $set: { no_of_available_beds } },
        { new: true }
      );
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});