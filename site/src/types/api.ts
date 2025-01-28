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