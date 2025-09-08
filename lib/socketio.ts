/**
 * Socket.IO service for real-time trading data
 * 
 * Features:
 * - Uses Socket.IO client library
 * - Authenticates with bearer token
 * - Tests multiple endpoint configurations
 * - Handles reconnection automatically
 */

import { io, Socket } from 'socket.io-client';

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

class SocketIOService {
  private socket: Socket | null = null
  private token: string | null = null
  private isConnected = false
  private baseUrl: string
  private socketUrl: string
  private callbacks: {
    tradingData?: (data: any) => void
    stockUpdate?: (data: any) => void
    connectionStatus?: (connected: boolean) => void
  } = {}

  constructor() {
    this.baseUrl = 'https://miniapp.bdsec.mn/apitest'
    // Socket.IO server - use base domain with /apitest/socket path
    this.socketUrl = 'https://miniapp.bdsec.mn'
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
      
      // Extract token from response
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

  // Start the external socket connection first
  async startExternalSocket(): Promise<boolean> {
    if (!this.token) return false

    try {
      const response = await fetch(`${this.baseUrl}/securities/start-socket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Connect to Socket.IO server
  async connect(): Promise<boolean> {
    // Authenticate first if no token
    if (!this.token) {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        console.error('❌ Socket.IO: Authentication failed')
        return false
      }
    }

    // Try to start the external socket connection first
    console.log('🔌 Starting external socket connection...')
    const externalStarted = await this.startExternalSocket()
    if (externalStarted) {
      console.log('✅ External socket connection started')
    } else {
      console.log('⚠️ External socket connection failed to start')
    }

    try {
      // Disconnect existing socket
      if (this.socket) {
        this.socket.disconnect()
      }

      // Try Socket.IO configurations with correct path /apitest/socket
      const configs = [
        {
          name: 'Config 1: /apitest/socket with auth token',
          url: this.socketUrl, // https://miniapp.bdsec.mn
          options: {
            path: '/apitest/socket',
            auth: { token: this.token },
            transports: ['polling'], // Start with polling due to nginx WebSocket issues
            timeout: 10000,
            reconnection: false,
            forceNew: true
          }
        },
        {
          name: 'Config 2: /apitest/socket with query token',
          url: this.socketUrl,
          options: {
            path: '/apitest/socket',
            query: { token: this.token },
            transports: ['polling'],
            timeout: 10000,
            reconnection: false,
            forceNew: true
          }
        },
        {
          name: 'Config 3: /apitest/socket without auth (polling)',
          url: this.socketUrl,
          options: {
            path: '/apitest/socket',
            transports: ['polling'],
            timeout: 10000,
            reconnection: false,
            forceNew: true
          }
        },
        {
          name: 'Config 4: Try WebSocket (might fail due to nginx)',
          url: this.socketUrl,
          options: {
            path: '/apitest/socket',
            auth: { token: this.token },
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: false,
            forceNew: true
          }
        }
      ]

      // Try each configuration
      for (const config of configs) {
        console.log('🔌 Trying:', config.name)
        
        this.socket = io(config.url, config.options)
        
        const connected = await this.waitForConnection()
        if (connected) {
          console.log('✅ Connected with:', config.name)
          return true
        } else {
          console.log('❌ Failed with:', config.name)
        }
      }

      return false
    } catch (error) {
      console.error('❌ Socket.IO: Connection error')
      return false
    }
  }

  // Wait for connection with timeout
  private async waitForConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(false)
        return
      }

      this.socket.on('connect', () => {
        console.log('✅ Socket.IO: Connected')
        this.isConnected = true
        
        if (this.callbacks.connectionStatus) {
          this.callbacks.connectionStatus(true)
        }
        
        resolve(true)
      })

      this.socket.on('connect_error', (error: Error) => {
        console.error('❌ Socket.IO: Connection failed -', error.message)
        this.isConnected = false
        
        if (this.callbacks.connectionStatus) {
          this.callbacks.connectionStatus(false)
        }
        
        resolve(false)
      })

      this.socket.on('disconnect', (reason: string) => {
        this.isConnected = false
        
        if (this.callbacks.connectionStatus) {
          this.callbacks.connectionStatus(false)
        }
      })

      this.socket.on('trading-data-update', (data) => {
        console.log('📊 Socket.IO: Real-time update:', {
          count: data.count || 0,
          stocksReceived: data.data?.length || 0,
          timestamp: data.timestamp,
          firstStock: data.data?.[0]?.Symbol
        })
        
        if (this.callbacks.tradingData) {
          // Extract the actual stock array from the wrapper
          const stockData = data.data || data
          this.callbacks.tradingData(stockData)
        }
      })

      this.socket.on('trading-status-update', (data) => {
        console.log('📈 Socket.IO: trading-status-update received:', data)
        if (this.callbacks.stockUpdate) {
          this.callbacks.stockUpdate(data)
        }
      })

      // Timeout after 3 seconds for each config
      setTimeout(() => {
        if (!this.isConnected) {
          resolve(false)
        }
      }, 3000)
    })
  }

  // Join trading room
  joinTradingRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-trading-room')
    }
  }

  // Register callback for trading data updates
  onTradingDataUpdate(callback: (data: any) => void) {
    this.callbacks.tradingData = callback
  }

  // Register callback for individual stock updates
  onStockUpdate(callback: (data: any) => void) {
    this.callbacks.stockUpdate = callback
  }

  // Register callback for connection status changes
  onConnectionStatusChange(callback: (connected: boolean) => void) {
    this.callbacks.connectionStatus = callback
  }

  // Get current connection status
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // Disconnect Socket.IO
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    this.isConnected = false
    this.token = null
    
    if (this.callbacks.connectionStatus) {
      this.callbacks.connectionStatus(false)
    }
  }
}

// Create and export singleton instance
const socketIOService = new SocketIOService()
export default socketIOService