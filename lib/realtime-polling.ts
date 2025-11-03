/**
 * Real-time polling service using working HTTPS APIs
 * 
 * Since Socket.IO has connection issues, this provides real-time-like updates
 * using the APIs that we know work:
 * - /securities/socket-status (for connection info)
 * - /securities/force-reconnect (for triggering updates)
 * - Regular stock data fetching with smart intervals
 */

import { BASE_URL, fetchAllStocks, type StockData } from './api'

export interface RealTimePollingService {
  connect(): Promise<boolean>
  joinTradingRoom(): void
  onTradingDataUpdate(callback: (data: StockData[]) => void): void
  onConnectionStatusChange(callback: (connected: boolean) => void): void
  disconnect(): void
  getConnectionStatus(): boolean
}

class RealTimePollingServiceImpl implements RealTimePollingService {
  private isConnected = false
  private intervalId: NodeJS.Timeout | null = null
  private token: string | null = null
  private baseUrl = BASE_URL
  private pollingInterval = 3000 // 3 seconds
  private callbacks: {
    tradingData?: (data: StockData[]) => void
    connectionStatus?: (connected: boolean) => void
  } = {}
  private lastDataHash: string | null = null

  async connect(): Promise<boolean> {
    // Get authentication token
    if (!this.token) {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        return false
      }
    }

    // Check server socket status
    await this.checkServerSocketStatus()

    // Start polling
    this.startPolling()
    this.isConnected = true
    
    if (this.callbacks.connectionStatus) {
      this.callbacks.connectionStatus(true)
    }
    
    return true
  }

  private async authenticate(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'radnaa2016', password: 'User1000' })
      })

      const data = await response.json()
      
      if (response.ok && data.success && data.data?.token) {
        this.token = data.data.token
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: 'Network error' }
    }
  }

  private async checkServerSocketStatus(): Promise<{
    success: boolean
    connectedClients?: number
    socketPath?: string
    message?: string
  }> {
    if (!this.token) return { success: false }

    try {
      const response = await fetch(`${this.baseUrl}/securities/socket-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        return {
          success: true,
          connectedClients: data.connectedClients,
          socketPath: data.socketPath,
          message: data.message
        }
      }
      
      return { success: false, message: data.message }
    } catch (error) {
      return { success: false, message: 'Network error' }
    }
  }

  private startPolling() {
    this.intervalId = setInterval(async () => {
      try {
        const data = await fetchAllStocks()
        
        if (data.success && data.data) {
          // Create a simple hash to detect changes
          const dataHash = JSON.stringify(data.data).substring(0, 100)
          
          if (this.lastDataHash !== dataHash) {
            this.lastDataHash = dataHash
            
            if (this.callbacks.tradingData) {
              this.callbacks.tradingData(data.data)
            }
          }
        }
      } catch (error) {
        // Silent error handling
      }
    }, this.pollingInterval)
  }

  joinTradingRoom() {
    // In polling mode, this just means we're actively polling
    // Could trigger a force-reconnect to ensure server is ready
    this.forceServerReconnect()
  }

  private async forceServerReconnect() {
    if (!this.token) return
    
    try {
      await fetch(`${this.baseUrl}/securities/force-reconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      })
    } catch (error) {
      // Silent error handling
    }
  }

  onTradingDataUpdate(callback: (data: StockData[]) => void) {
    this.callbacks.tradingData = callback
  }

  onConnectionStatusChange(callback: (connected: boolean) => void) {
    this.callbacks.connectionStatus = callback
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    this.isConnected = false
    this.token = null
    
    if (this.callbacks.connectionStatus) {
      this.callbacks.connectionStatus(false)
    }
  }
}

// Create and export singleton instance
const realTimePollingService = new RealTimePollingServiceImpl()
export default realTimePollingService