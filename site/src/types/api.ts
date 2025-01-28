export interface AnalysisResult {
  id: string
  url: string
  dataTransferKB: number
  energyUsedKWh: number
  carbonEmissionsG: number
  greenHosting: boolean
  provider: string
  annualPageViews: number
  carbonPerViewG: number
  totalAnnualEmissionsKg: number
  createdAt: string
  message?: string
}