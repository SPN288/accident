const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const Alert= require('./models/alert');
const AmbAlert= require('./models/ambAlert');
const ambulanceSchema = new mongoose.Schema({
    hospitalID: Number,
    ambulanceId: [{ ID: Number, status: Boolean }],
  });
  const AmbulanceList = mongoose.model("ambulancelist", ambulanceSchema);
  
//   const alertSchema = new mongoose.Schema({
//     hospitalID: { type: String, required: true },
//     latitude: { type: Number, required: true },
//     longitude: { type: Number, required: true },
//     status: { type: Boolean, required: true },
//     timestamp: { type: Date, default: Date.now },
//     noOfBeds: { type: Number, required: true },
//   });
//   const Alert = mongoose.model("alert", alertSchema);
  
//   const ambAlertSchema = new mongoose.Schema({
//     ambulanceId: Number,
//     status: Boolean,
//     latitude: Number,
//     longitude: Number,
//   });
//   const AmbAlert = mongoose.model("ambAlert", ambAlertSchema);
  
  // Endpoint to add ambulance data
  router.post("/add-ambulance", async (req, res) => {
    try {
      const newAmbulance = new AmbulanceList(req.body);
      await newAmbulance.save();
      res.status(201).send("Ambulance data added");
    } catch (err) {
      res.status(400).send(err);
    }
  });
  
  // Endpoint to get all ambulance data
  router.get("/get-ambulance", async (req, res) => {
    try {
      const data = await AmbulanceList.find();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
  // Function to monitor alert collection every second
  setInterval(async () => {
    try {
      const alerts = await Alert.find({ status: true });
      for (const alert of alerts) {
        const { hospitalID, latitude, longitude, noOfBeds } = alert;
        
        const ambulanceData = await AmbulanceList.findOne({ hospitalID });
        if (ambulanceData) {
          const availableAmbulances = ambulanceData.ambulanceId.filter(a => a.status === true).slice(0, noOfBeds);
          
          for (const ambulance of availableAmbulances) {
            const newAmbAlert = new AmbAlert({
              ambulanceId: ambulance.ID,
              status: true,
              latitude,
              longitude,
            });
            await newAmbAlert.save();
          }
        }
      }
    } catch (error) {
      console.error("Error in alert monitoring:", error);
    }
  }, 1000);

module.exports = router;