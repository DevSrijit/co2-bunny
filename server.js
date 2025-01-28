import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import cors from "cors";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Add CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://co2bunny.srijit.co'], // Add your frontend URLs
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  // Permanent redirect (301) to indicate this is the canonical URL
  res.status(301).redirect("https://co2bunny.srijit.co");
});

app.get("/api/impact/data-transfer", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send({ error: "URL is required" });

  try {
    const response = await axios.get(
      `https://api.websitecarbon.com/site?url=${url}`
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

  // Convert to number and validate
  const annualViews = Number(annualPageViews);
  if (isNaN(annualViews) || annualViews < 0)
    return res.status(400).send({ error: "Invalid annualPageViews value" });

  try {
    // Check for existing analysis first
    const existingAnalysis = await prisma.websiteAnalysis.findFirst({
      where: {
        url,
        annualPageViews: annualViews,
        createdAt: {
          // Consider analyses within last 24 hours as current
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingAnalysis) {
      return res.json({
        ...existingAnalysis,
        message: "Using cached analysis from database",
      });
    }

    // Proceed with new analysis if no recent entry exists
    const dataTransferResponse = await axios.get(
      `${process.env.host}/api/impact/data-transfer?url=${url}`
    );
    const energySourceResponse = await axios.get(
      `${process.env.host}/api/impact/energy-source?url=${url}`
    );
    const trafficResponse = await axios.get(
      `${process.env.host}/api/impact/traffic?url=${url}&annualPageViews=${annualViews}`
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
        annualPageViews: annualViews,
        carbonPerViewG: trafficResponse.data.carbon_per_view_grams,
        totalAnnualEmissionsKg: totalEmissionsKg,
      },
    });

    res.json({ ...analysis, message: "New analysis created" });
  } catch (error) {
    console.error("Calculation Error:", error);
    res.status(500).send({
      error: "Error calculating total impact",
      details: error.message,
    });
  }
});

app.get("/api/analyses", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  } else {
    try {
      const analyses = await prisma.websiteAnalysis.findMany({
        where: url ? { url: url.toString() } : undefined,
        orderBy: { createdAt: "desc" },
      });

      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).send({ error: "Error fetching historical analyses" });
    }
  }
});

app.get("/api/analyses/recent", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Default to 10 entries

  try {
    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Limit must be a number between 1 and 100",
      });
    }

    const recentAnalyses = await prisma.websiteAnalysis.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    res.json(recentAnalyses);
  } catch (error) {
    console.error("Error fetching recent analyses:", error);
    res.status(500).json({ error: "Error fetching recent analyses" });
  }
});
