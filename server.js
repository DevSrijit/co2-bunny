import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

dotenv.config();
const app = express();
const prisma = new PrismaClient();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/impact/data-transfer", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send({ error: "URL is required" });

  try {
    const response = await axios.get(
      `https://api.websitecarbon.com/site?url=srijit.co`
    );
    const { adjustedBytes, energy, co2 } = response.data.statistics;
    const { rating, cleanerThan } = response.data;

    res.json({
      url,
      data_transfer_kb: adjustedBytes / 1024,
      energy_used_kwh: energy,
      carbon_emissions_grams: co2,
      green_rating: rating,
      cleanerThan: `${cleanerThan}%`,
    });
  } catch (error) {
    res.status(500).send({ error: "Error fetching data transfer impact" });
  }
});

app.get("/api/impact/energy-source", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send({ error: "URL is required" });

  try {
    const response = await axios.get(
      `https://api.thegreenwebfoundation.org/greencheck/${url}`
    );
    const { green, hosted_by, supporting_documents } = response.data;

    res.json({
      url,
      green_hosting: green,
      provider: hosted_by || "Unknown",
      carbon_savings_grams: green ? 10.0 : 0.0,
      sustainability_report:
        supporting_documents || "No sustainability report available",
    });
  } catch (error) {
    res.status(500).send({ error: "Error fetching energy source data" });
  }
});

app.get("/api/impact/traffic", async (req, res) => {
  const { url, annualPageViews } = req.query;
  if (!url || !annualPageViews)
    return res
      .status(400)
      .send({ error: "URL and annualPageViews are required" });

  try {
    const carbonPerView = 0.3; // Calculate dynamically in future using data-transfer impact.
    const totalEmissions = (carbonPerView * annualPageViews) / 1000;

    res.json({
      url,
      annual_page_views: parseInt(annualPageViews),
      carbon_per_view_grams: carbonPerView,
      total_annual_emissions_kg: totalEmissions,
    });
  } catch (error) {
    res.status(500).send({ error: "Error calculating traffic impact" });
  }
});

app.post("/api/impact/calculate", async (req, res) => {
  const { url, annualPageViews } = req.body;
  if (!url || !annualPageViews)
    return res
      .status(400)
      .send({ error: "URL and annualPageViews are required" });

  try {
    const dataTransferResponse = await axios.get(
      `${process.env.host}/api/impact/data-transfer?url=${url}`
    );
    const energySourceResponse = await axios.get(
      `${process.env.host}/api/impact/energy-source?url=${url}`
    );
    const trafficResponse = await axios.get(
      `${process.env.host}/api/impact/traffic?url=${url}&annualPageViews=${annualPageViews}`
    );

    const totalEmissionsKg =
      trafficResponse.data.total_annual_emissions_kg -
      energySourceResponse.data.carbon_savings_grams / 1000;

    const analysis = await prisma.websiteAnalysis.create({
      data: {
        url,
        dataTransferKB: dataTransferResponse.data.data_transfer_kb,
        energyUsedKWh: dataTransferResponse.data.energy_used_kwh,
        carbonEmissionsG: dataTransferResponse.data.carbon_emissions_grams,
        greenHosting: energySourceResponse.data.green_hosting,
        provider: energySourceResponse.data.provider,
        annualPageViews,
        carbonPerViewG: trafficResponse.data.carbon_per_view_grams,
        totalAnnualEmissionsKg: totalEmissionsKg,
      },
    });

    res.json(analysis);
  } catch (error) {
    res.status(500).send({ error: "Error calculating total impact" });
  }
});
