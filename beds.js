const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const dbURI = 'mongodb+srv://satya288:hellomini@spnweb.2nt6szt.mongodb.net/?retryWrites=true&w=majority&appName=spnweb'; // Update with your MongoDB URI
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Beds Schema and Model
const bedsSchema = new mongoose.Schema({
  lat: Number,
  long: Number,
  mobile_number: { type: Number, unique: true },
  status: Boolean,
  no_of_beds: [Number],
});
const Beds = mongoose.model("Beds", bedsSchema);

// Accident Schema and Model
const accidentSchema = new mongoose.Schema({
  lat: Number,
  long: Number,
  mobile_number: Number,
  status: Boolean,
});
const Accident = mongoose.model("Accident", accidentSchema);

// Endpoint to check for accident status
app.get("/accident-status", async (req, res) => {
  try {
      const activeAccident = await Accident.findOne({ status: true });
      if (activeAccident) {
          res.status(200).json(activeAccident);
      } else {
          res.status(404).json({ message: "No active accidents found" });
      }
  } catch (error) {
      res.status(500).json({ error: "Error fetching accident status" });
  }
});

// Endpoint to post data to beds cluster
app.post("/beds", async (req, res) => {
  try {
      const { lat, long, mobile_number, status, no_of_beds } = req.body;

      const existingBeds = await Beds.findOne({ mobile_number });

      if (existingBeds) {
          existingBeds.no_of_beds.push(...no_of_beds);
          existingBeds.status = status;
          await existingBeds.save();
          return res.status(200).json({ message: "Beds updated successfully" });
      } else {
          const newBeds = new Beds({ lat, long, mobile_number, status, no_of_beds });
          await newBeds.save();
          return res.status(201).json({ message: "Beds data added successfully" });
      }
  } catch (error) {
      res.status(500).json({ error: "Error saving beds data" });
  }
});

// Endpoint to post data to Accident collection
app.post("/accidents", async (req, res) => {
  const { lat, long, mobile_number, status } = req.body;
  console.log(req.body)

  try {
    const newRecord = new Accident({ lat, long, mobile_number, status });
    await newRecord.save();
    res.status(201).json({ message: "Accident data added successfully", data: newRecord });
  } catch (error) {
    res.status(500).json({ message: "Error adding Accident data", error: error.message });
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////

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




// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
