import axios from 'axios'

const API_BASE_URL = 'https://bunny.srijit.co/api'

export const api = {
  async calculateImpact(url: string, annualPageViews: number) {
    const { data } = await axios.post(`${API_BASE_URL}/impact/calculate`, {
      url,
      annualPageViews,
    })
    return data
  },

  async getDataTransfer(url: string) {
    const { data } = await axios.get(`${API_BASE_URL}/impact/data-transfer`, {
      params: { url },
    })
    return data
  },

  async getEnergySource(url: string) {
    const { data } = await axios.get(`${API_BASE_URL}/impact/energy-source`, {
      params: { url },
    })
    return data
  },

  async getTrafficImpact(url: string, annualPageViews: number) {
    const { data } = await axios.get(`${API_BASE_URL}/impact/traffic`, {
      params: { url, annualPageViews },
    })
    return data
  },

  async getAnalyses(url: string) {
    const { data } = await axios.get(`${API_BASE_URL}/analyses`, {
      params: { url },
    })
    return data
  },

  async getRecentAnalyses(limit = 10) {
    const { data } = await axios.get(`${API_BASE_URL}/analyses/recent`, {
      params: { limit },
    })
    return data
  },
}