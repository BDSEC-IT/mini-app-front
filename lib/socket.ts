// Real-time data service using polling instead of WebSockets
// This avoids XHR poll errors since the server doesn't support Socket.IO

class RealTimeService {
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false
  private lastUpdateTime: Date | null = null
  private isInitialized = false
  private callbacks: {
    tradingData?: (data: any) => void
    stockUpdate?: (data: any) => void
  } = {}

  // Start polling for real-time updates
  startPolling(intervalMs: number = 5000) { // Reduced interval to 5 seconds for testing
    if (this.isPolling) {
      return
    }

    this.isPolling = true

    // Don't fetch immediately, wait for the first interval
    this.pollingInterval = setInterval(() => {
      this.fetchLatestData()
    }, intervalMs)
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isPolling = false
  }

  // Fetch latest data from API
  private async fetchLatestData() {
    try {
      // Import fetchAllStocks dynamically to avoid circular dependencies
      const { fetchAllStocks } = await import('./api')
      const response = await fetchAllStocks()
      
      if (response.success && response.data) {
        const currentTime = new Date()
        
        // Only trigger updates if we have new data or it's been a while
        if (!this.lastUpdateTime || 
            currentTime.getTime() - this.lastUpdateTime.getTime() > 2000) { // Increased to 2 seconds
            
          this.lastUpdateTime = currentTime
          
          // Trigger trading data update callback
          if (this.callbacks.tradingData) {
            this.callbacks.tradingData(response.data)
          } else {
          }
          
          // Trigger individual stock updates
          if (this.callbacks.stockUpdate) {
            response.data.forEach((stock: any) => {
              this.callbacks.stockUpdate!(stock)
            })
          } else {
          }
        } else {
        }
      } else {
      }
    } catch (error) {
      console.error('❌ Error fetching real-time data:', error)
      // Don't stop polling on error, just log it
    }
  }

  // Listen for trading data updates
  onTradingDataUpdate(callback: (data: any) => void) {
    this.callbacks.tradingData = callback
  }
  // Listen for stock updates
  onStockUpdate(callback: (data: any) => void) {
    this.callbacks.stockUpdate = callback
  }

  // Get connection status (always true for polling)
  getConnectionStatus() {
    return this.isPolling
  }

  // Simulate socket-like interface for compatibility
  connect() {
    // Don't start polling immediately, just mark as initialized
    this.isInitialized = true
    return {
      on: (event: string, callback: () => void) => {
        if (event === 'connect') {
          // Simulate immediate connection
          setTimeout(callback, 100)
        }
      },
      disconnect: () => this.stopPolling()
    }
  }

  // Join trading room (start polling when ready)
  joinTradingRoom() {
    if (this.isInitialized && !this.isPolling) {
      // Start polling with a delay to avoid conflicts with initial data loading
      setTimeout(() => {
        this.startPolling()
      }, 2000) // Wait 2 seconds before starting polling
    }
  }

  // Disconnect (stop polling)
  disconnect() {
    this.stopPolling()
    this.isInitialized = false
  }
}

// Create singleton instance
const realTimeService = new RealTimeService()

export default realTimeService 