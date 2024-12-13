"use strict";

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

app.post("/getTour", async (req, res) => {
    try {
        const paramMap = req.body;
        // const apiKey = "NWC5IH1wJhM4KxzFvU8Au4ZpOxQssp0I8hdy8n2Y5sTOID1Tn98w54srF9y8BFjA";
        const dataApi = "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-aixdfyh/endpoint/data/v1/action/findOne";
        
        const headers = {
            "Content-Type": "application/json",
            "api-key": paramMap.apiKey
        };

        delete paramMap.apiKey;

        // Make the API request using axios
        const response = await axios.post(dataApi, paramMap, { headers });

        // Send the response data back to the client
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(error.status).json({ error: "Failed to fetch data" });
    }
});

module.exports = app;
