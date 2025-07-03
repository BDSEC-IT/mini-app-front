#!/usr/bin/env node

/**
 * Script to kill processes using a specific port
 * Usage: node scripts/kill-port.js [port]
 * Default port: 3110
 */

const { execSync } = require('child_process');
const os = require('os');

// Get port from command line arguments or use default
const port = process.argv[2] || 3110;

try {
  console.log(`Looking for processes using port ${port}...`);
  
  let command;
  
  // Different commands based on OS
  if (os.platform() === 'win32') {
    // Windows
    command = `netstat -ano | findstr :${port}`;
    const output = execSync(command).toString();
    
    // Parse the output to find process IDs
    const lines = output.split('\n').filter(line => line.includes('LISTENING'));
    if (lines.length === 0) {
      console.log(`No process found using port ${port}.`);
      process.exit(0);
    }
    
    // Extract process ID from the last column
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const processId = parts[parts.length - 1];
      
      if (processId) {
        console.log(`Found process ${processId} using port ${port}. Killing it...`);
        execSync(`taskkill /F /PID ${processId}`);
        console.log(`Process ${processId} has been terminated.`);
      }
    }
  } else {
    // macOS/Linux - use a simpler approach
    try {
      const output = execSync(`lsof -i :${port} -t`).toString().trim();
      if (!output) {
        console.log(`No process found using port ${port}.`);
        process.exit(0);
      }
      
      // There might be multiple processes
      const processIds = output.split('\n').filter(Boolean);
      
      for (const pid of processIds) {
        console.log(`Found process ${pid} using port ${port}. Killing it...`);
        execSync(`kill -9 ${pid}`);
        console.log(`Process ${pid} has been terminated.`);
      }
    } catch (e) {
      // If lsof doesn't find anything, it will exit with code 1
      if (e.status === 1 && !e.stdout.toString().trim()) {
        console.log(`No process found using port ${port}.`);
        process.exit(0);
      } else {
        throw e;
      }
    }
  }
  
  console.log(`Port ${port} has been freed.`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  if (error.stdout) {
    console.log(`Output: ${error.stdout.toString()}`);
  }
  process.exit(1);
} 