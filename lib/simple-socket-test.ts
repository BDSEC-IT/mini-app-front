/**
 * Simple test using the exact code the backend developer provided
 */

import { io } from 'socket.io-client';

export function testBackendDevConfig() {
  const socket = io('https://miniapp.bdsec.mn', {
    path: '/apitest/socket',
    transports: ['polling', 'websocket'] // Polling first due to nginx WebSocket issues
  });

  socket.on('connect', () => {
    socket.emit('join-trading-room');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO test: Connection failed -', error.message);
  });

  socket.on('trading-data-update', (data) => {
  });

  socket.on('trading-status-update', (data) => {
  });

  // Test connection for 10 seconds
  setTimeout(() => {
    if (socket.connected) {
    } else {
    }
    socket.disconnect();
  }, 10000);

  return socket;
}