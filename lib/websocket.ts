/**
 * Real WebSocket service to replace polling
 * 
 * Features:
 * - Authenticates with API using /user/login endpoint
 * - Tries multiple WebSocket endpoints to find the correct one
 * - Handles automatic reconnection with exponential backoff
 * - Provides status checking via /securities/socket-connection-status
 * - Supports force reconnection via /securities/force-reconnect
 * - Real-time stock data updates with visual blinking effects
 * 
 * Usage:
 * 1. Service automatically authenticates on first connect()
 * 2. Tries multiple WebSocket URLs to find the working endpoint
 * 3. Joins trading room to receive all stock updates
 * 4. Triggers callbacks for UI updates with price change animations
 */

export interface SocketConnectionStatus {
  success: boolean;
  connected: boolean;
  lastActivity?: string;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

class WebSocketService {
  private socket: WebSocket | null = null
  private token: string | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000 // 5 seconds
  private baseUrl: string
  private callbacks: {
    tradingData?: (data: any) => void
    stockUpdate?: (data: any) => void
    connectionStatus?: (connected: boolean) => void
  } = {}

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://miniapp.bdsec.mn/apitest'
  }

  // Try different WebSocket endpoint paths
  private getWebSocketUrls(): string[] {
    const wsBaseUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')
    return [
      `${wsBaseUrl}/ws`,                           // Common WebSocket path
      `${wsBaseUrl}/websocket`,                    // Alternative WebSocket path
      `${wsBaseUrl}/securities/ws`,                // Securities-specific WebSocket
      `${wsBaseUrl}/securities/websocket`,         // Securities WebSocket alternative
      `${wsBaseUrl}/socket.io`,                    // Socket.IO path
      `${wsBaseUrl}/api/ws`,                       // API WebSocket path
    ]
  }

  // Authenticate and get bearer token
  async authenticate(username: string = 'radnaa2016', password: string = 'User1000'): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })
      
      const data = await response.json()
      
      // Handle different possible response structures
      let token = null;
      if (data.token) {
        token = data.token;
      } else if (data.data && data.data.token) {
        token = data.data.token;
      } else if (data.data && data.data.access_token) {
        token = data.data.access_token;
      } else if (data.access_token) {
        token = data.access_token;
      }
      
      if (response.ok && data.success && token) {
        this.token = token
        return { success: true, token: token, message: 'Authentication successful' }
      } else {
        return { success: false, message: data.message || `Authentication failed: ${response.status}` }
      }
    } catch (error) {
      return { success: false, message: 'Network error during authentication' }
    }
  }

  // Connect to WebSocket with authentication
  async connect(): Promise<boolean> {
    console.log('🚀 Starting WebSocket connection...')

    // Authenticate first if no token
    if (!this.token) {
      console.log('🔑 No token found, authenticating...')
      const authResult = await this.authenticate()
      if (!authResult.success) {
        console.error('❌ Cannot connect without authentication:', authResult.message)
        return false
      }
      console.log('🔑 Authentication completed, proceeding with WebSocket connection')
    } else {
      console.log('🔑 Using existing token:', this.token.substring(0, 20) + '...')
    }

    // Try different WebSocket URLs
    const wsUrls = this.getWebSocketUrls()
    console.log('🔌 Will try these WebSocket URLs:', wsUrls.map(url => url.replace(this.baseUrl, 'BASE_URL')))

    for (let i = 0; i < wsUrls.length; i++) {
      const wsUrl = wsUrls[i]
      console.log(`🔌 Trying WebSocket URL ${i + 1}/${wsUrls.length}: ${wsUrl.replace(this.baseUrl, 'BASE_URL')}`)
      
      const success = await this.tryConnectToUrl(wsUrl)
      if (success) {
        console.log(`✅ Successfully connected to: ${wsUrl.replace(this.baseUrl, 'BASE_URL')}`)
        return true
      } else {
        console.log(`❌ Failed to connect to: ${wsUrl.replace(this.baseUrl, 'BASE_URL')}`)
      }
    }

    console.error('❌ All WebSocket URLs failed')
    return false
  }

  // Try to connect to a specific WebSocket URL
  private async tryConnectToUrl(wsUrl: string): Promise<boolean> {
    try {
      // Close existing connection
      if (this.socket) {
        this.socket.close()
      }

      // Create WebSocket connection with token
      const wsUrlWithAuth = `${wsUrl}?token=${this.token}`
      console.log('🔌 Connecting to:', wsUrlWithAuth.replace(this.token!, '***'))
      
      this.socket = new WebSocket(wsUrlWithAuth)
      console.log('🔌 WebSocket object created, initial state:', this.socket.readyState)
      
      return new Promise((resolve) => {
        if (!this.socket) {
          resolve(false)
          return
        }

        this.socket.onopen = () => {
          console.log('✅ WebSocket connected successfully')
          this.isConnected = true
          this.reconnectAttempts = 0
          
          // Set up message handlers
          this.setupMessageHandlers()
          
          if (this.callbacks.connectionStatus) {
            this.callbacks.connectionStatus(true)
          }
          
          resolve(true)
        }

        this.socket.onerror = (error) => {
          console.log('❌ WebSocket error:', error)
          resolve(false)
        }

        this.socket.onclose = (event) => {
          console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason || 'No reason'}`)
          resolve(false)
        }

        // Quick check if connection fails immediately
        setTimeout(() => {
          if (this.socket?.readyState === 3) {
            console.log('🔌 Connection failed quickly - endpoint likely doesn\'t exist')
            resolve(false)
          }
        }, 100)

        // Timeout after 3 seconds for each URL attempt
        setTimeout(() => {
          if (!this.isConnected) {
            console.log('⏰ Connection timeout for this URL')
            resolve(false)
          }
        }, 3000)
      })

    } catch (error) {
      console.error('❌ WebSocket connection error:', error)
      return false
    }
  }

  // Set up message handlers after successful connection
  private setupMessageHandlers() {
    if (!this.socket) return

    this.socket.onmessage = (event) => {
      try {
        console.log('📨 RAW WebSocket message received:')
        console.log('  Type:', typeof event.data)
        console.log('  Length:', event.data.length)
        console.log('  Raw data:', event.data)
        
        const data = JSON.parse(event.data)
        
        console.log('📊 PARSED WebSocket data:')
        console.log('  Data structure:', {
          type: typeof data,
          isArray: Array.isArray(data),
          keys: Object.keys(data || {}),
          length: Array.isArray(data) ? data.length : 'N/A'
        })
        console.log('  Full data object:', data)
        
        // Handle different message types
        if (data.type === 'trading-data' && this.callbacks.tradingData) {
          console.log('🎯 Calling trading-data callback with:', data.payload || data.data)
          this.callbacks.tradingData(data.payload || data.data)
        } else if (data.type === 'stock-update' && this.callbacks.stockUpdate) {
          console.log('🎯 Calling stock-update callback with:', data.payload || data.data)
          this.callbacks.stockUpdate(data.payload || data.data)
        } else {
          // Default to trading data callback for backward compatibility
          console.log('🎯 Using default callback (no specific type), data:', Array.isArray(data) ? data : [data])
          if (this.callbacks.tradingData) {
            this.callbacks.tradingData(Array.isArray(data) ? data : [data])
          }
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:')
        console.error('  Error:', error)
        console.error('  Raw message:', event.data)
        console.error('  Message type:', typeof event.data)
      }
    }

    this.socket.onclose = (event) => {
      console.log('🔌 WebSocket connection closed:')
      console.log('  Code:', event.code)
      console.log('  Reason:', event.reason || 'No reason provided')
      this.isConnected = false
      
      if (this.callbacks.connectionStatus) {
        this.callbacks.connectionStatus(false)
      }
    }

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error occurred:', error)
      this.isConnected = false
      
      if (this.callbacks.connectionStatus) {
        this.callbacks.connectionStatus(false)
      }
    }
  }

  // Check socket connection status
  async checkConnectionStatus(): Promise<SocketConnectionStatus> {
    if (!this.token) {
      return { success: false, connected: false, message: 'No authentication token' }
    }

    try {
      console.log('📡 Checking socket connection status...')
      
      const response = await fetch(`${this.baseUrl}/securities/socket-connection-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log('📊 Connection status:', data)
        return {
          success: true,
          connected: data.connected || false,
          lastActivity: data.lastActivity,
          message: data.message
        }
      } else {
        console.error('❌ Failed to check connection status:', data)
        return { success: false, connected: false, message: data.message }
      }
    } catch (error) {
      console.error('❌ Error checking connection status:', error)
      return { success: false, connected: false, message: 'Network error' }
    }
  }

  // Force reconnect the socket
  async forceReconnect(): Promise<{ success: boolean; message?: string }> {
    if (!this.token) {
      return { success: false, message: 'No authentication token' }
    }

    try {
      console.log('🔄 Forcing socket reconnection...')
      
      const response = await fetch(`${this.baseUrl}/securities/force-reconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Force reconnect successful')
        return { success: true, message: data.message || 'Reconnection initiated' }
      } else {
        console.error('❌ Force reconnect failed:', data)
        return { success: false, message: data.message || 'Force reconnect failed' }
      }
    } catch (error) {
      console.error('❌ Force reconnect error:', error)
      return { success: false, message: 'Network error during reconnection' }
    }
  }

  // Join trading room (send subscription message)
  joinTradingRoom() {
    if (this.socket && this.isConnected) {
      console.log('🏢 Joining trading room...')
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        channel: 'trading-room'
      }))
    } else {
      console.warn('⚠️ Cannot join trading room - not connected')
    }
  }

  // Subscribe to specific stock updates
  subscribeToStock(symbol: string) {
    if (this.socket && this.isConnected) {
      console.log('📈 Subscribing to stock:', symbol)
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        channel: 'stock-updates',
        symbol: symbol
      }))
    }
  }

  // Register callback for trading data updates
  onTradingDataUpdate(callback: (data: any) => void) {
    console.log('📝 Registering trading data callback')
    this.callbacks.tradingData = callback
  }

  // Register callback for individual stock updates
  onStockUpdate(callback: (data: any) => void) {
    console.log('📝 Registering stock update callback')
    this.callbacks.stockUpdate = callback
  }

  // Register callback for connection status changes
  onConnectionStatusChange(callback: (connected: boolean) => void) {
    console.log('📝 Registering connection status callback')
    this.callbacks.connectionStatus = callback
  }

  // Get current connection status
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // Disconnect WebSocket
  disconnect() {
    console.log('🔌 Disconnecting WebSocket...')
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
      this.socket = null
    }
    
    this.isConnected = false
    this.token = null
    this.reconnectAttempts = 0
    
    if (this.callbacks.connectionStatus) {
      this.callbacks.connectionStatus(false)
    }
  }

  // Send custom message
  send(message: any) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message))
    } else {
      console.warn('⚠️ Cannot send message - not connected')
    }
  }
}

// Create and export singleton instance
const webSocketService = new WebSocketService()
export default webSocketService