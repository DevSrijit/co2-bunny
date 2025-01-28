'use client'

import { Calculator, Loader2 } from "lucide-react"
import { useState } from "react"
import { AnalysisResult } from "@/types/api"
import { api } from '@/lib/api'

type IndividualResults = {
  dataTransfer?: any
  energySource?: any
  traffic?: any
}

export default function AnalyzePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [individualResults, setIndividualResults] = useState<IndividualResults>({})
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const url = formData.get('url') as string
    const annualPageViews = Number(formData.get('pageViews'))

    try {
      // Fetch individual analyses
      const [dataTransfer, energySource, traffic] = await Promise.all([
        api.getDataTransfer(url),
        api.getEnergySource(url),
        api.getTrafficImpact(url, annualPageViews)
      ])

      setIndividualResults({
        dataTransfer,
        energySource,
        traffic
      })

      // Fetch comprehensive analysis
      const data = await api.calculateImpact(url, annualPageViews)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-2">
          <Calculator className="size-8" />
          <h1 className="text-3xl font-bold">Website Carbon Calculator</h1>
        </div>
        
        <div className="w-full max-w-4xl rounded-lg border p-8 bg-card shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="url" className="font-medium">
                Website URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                placeholder="https://example.com"
                className="rounded-md border px-4 py-2 bg-background"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="pageViews" className="font-medium">
                Annual Page Views
              </label>
              <input
                type="number"
                id="pageViews"
                name="pageViews"
                placeholder="100000"
                min="1"
                className="rounded-md border px-4 py-2 bg-background"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Calculate Carbon Footprint'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-md bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          {individualResults.dataTransfer && (
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-semibold">Individual Analyses</h2>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Data Transfer Analysis */}
                <div className="rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Data Transfer Impact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border bg-card/50">
                      <h4 className="font-medium text-muted-foreground">Transfer Size</h4>
                      <p className="text-2xl font-semibold">
                        {individualResults.dataTransfer.data_transfer_kb.toFixed(2)} KB
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card/50">
                      <h4 className="font-medium text-muted-foreground">Energy Used</h4>
                      <p className="text-2xl font-semibold">
                        {individualResults.dataTransfer.energy_used_kwh.toFixed(4)} kWh
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card/50">
                      <h4 className="font-medium text-muted-foreground">Green Rating</h4>
                      <p className="text-2xl font-semibold">
                        {individualResults.dataTransfer.green_rating}/100
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cleaner than {individualResults.dataTransfer.cleanerThan} of tested websites
                      </p>
                    </div>
                  </div>
                </div>

                {/* Energy Source Analysis */}
                <div className="rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Hosting Impact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-card/50">
                      <h4 className="font-medium text-muted-foreground">Hosting Type</h4>
                      <p className="text-2xl font-semibold">
                        {individualResults.energySource.green_hosting ? '🌱 Green' : '⚡ Standard'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Provider: {individualResults.energySource.provider}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card/50">
                      <h4 className="font-medium text-muted-foreground">Carbon Savings</h4>
                      <p className="text-2xl font-semibold">
                        {individualResults.energySource.carbon_savings_grams} g CO₂
                      </p>
                    </div>
                  </div>
                </div>

                {/* Traffic Analysis */}
                <div className="rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Traffic Impact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-card/50">
                      <h4 className="font-medium text-muted-foreground">Per View Impact</h4>
                      <p className="text-2xl font-semibold">
                        {individualResults.traffic.carbon_per_view_grams} g CO₂
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card/50">
                      <h4 className="font-medium text-muted-foreground">Annual Impact</h4>
                      <p className="text-2xl font-semibold">
                        {individualResults.traffic.total_annual_emissions_kg} kg CO₂
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Based on {individualResults.traffic.annual_page_views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-semibold">Comprehensive Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card/50">
                  <h3 className="font-medium text-muted-foreground">Data Transfer</h3>
                  <p className="text-2xl font-semibold">{result.dataTransferKB.toFixed(2)} KB</p>
                </div>

                <div className="p-4 rounded-lg border bg-card/50">
                  <h3 className="font-medium text-muted-foreground">Energy Usage</h3>
                  <p className="text-2xl font-semibold">{result.energyUsedKWh.toFixed(4)} kWh</p>
                </div>

                <div className="p-4 rounded-lg border bg-card/50">
                  <h3 className="font-medium text-muted-foreground">Carbon Emissions</h3>
                  <p className="text-2xl font-semibold">{result.carbonEmissionsG} g CO₂</p>
                </div>

                <div className="p-4 rounded-lg border bg-card/50">
                  <h3 className="font-medium text-muted-foreground">Hosting</h3>
                  <p className="text-2xl font-semibold">
                    {result.greenHosting ? '🌱 Green' : '⚡ Standard'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Provider: {result.provider}
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-card/50 md:col-span-2">
                  <h3 className="font-medium text-muted-foreground">Annual Impact</h3>
                  <p className="text-2xl font-semibold">
                    {result.totalAnnualEmissionsKg.toFixed(2)} kg CO₂
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {result.annualPageViews.toLocaleString()} annual page views
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}