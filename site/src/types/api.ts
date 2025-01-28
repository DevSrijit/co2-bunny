interface EmissionsDetail {
  grams: number;
  litres: number;
}

interface CarbonEmissions {
  grid: EmissionsDetail;
  renewable: EmissionsDetail;
}

export interface AnalysisResult {
  id: string;
  url: string;
  dataTransferKB: number;
  energyUsedKWh: number;
  carbonEmissionsG: CarbonEmissions;
  greenHosting: boolean;
  provider: string;
  annualPageViews: number;
  totalAnnualEmissionsKg: number;
}

export interface DataTransferResult {
  url: string;
  data_transfer_kb: number;
  energy_used_kwh: number;
  carbon_emissions_grams: {
    grid: { grams: number; litres: number };
    renewable: { grams: number; litres: number };
  };
  green_rating: string;
  cleanerThan: string;
}

export interface EnergySourceResult {
  green_hosting: boolean;
  provider: string;
  carbon_savings_grams: number;
}

export interface TrafficResult {
  carbon_per_view_grams: number;
  total_annual_emissions_kg: number;
  annual_page_views: number;
}
