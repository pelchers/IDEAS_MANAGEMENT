#!/usr/bin/env node

/**
 * MCP Server Connection Tester
 *
 * Tests MCP server connectivity and validates configuration.
 *
 * Usage: node test-mcp-connection.js [server-name]
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration file locations
const CONFIG_PATHS = [
  '.mcp/config.json', // Project-level
  path.join(process.env.HOME || process.env.USERPROFILE, '.config/claude/mcp.json'), // User-level
];

// Find and load MCP configuration
function loadMcpConfig() {
  for (const configPath of CONFIG_PATHS) {
    if (fs.existsSync(configPath)) {
      console.log(`Loading config from: ${configPath}`);
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    }
  }
  throw new Error('No MCP configuration found. Checked:\n' + CONFIG_PATHS.join('\n'));
}

// Test server connection
async function testServer(serverName, serverConfig) {
  console.log(`\nTesting server: ${serverName}`);
  console.log('─'.repeat(50));

  // Validate configuration
  if (!serverConfig.command && !serverConfig.url) {
    console.error('❌ Invalid config: missing "command" or "url"');
    return false;
  }

  // For stdio transport
  if (serverConfig.command) {
    return await testStdioServer(serverName, serverConfig);
  }

  // For HTTP/SSE transport
  if (serverConfig.url) {
    return await testHttpServer(serverName, serverConfig);
  }

  return false;
}

// Test stdio-based server
async function testStdioServer(serverName, config) {
  console.log('Transport: stdio');
  console.log('Command:', config.command);
  console.log('Args:', config.args?.join(' ') || 'none');

  return new Promise((resolve) => {
    // Prepare environment
    const env = { ...process.env, ...config.env };

    // Spawn server process
    const serverProcess = spawn(config.command, config.args || [], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    let errorOutput = '';
    let timeout;

    // Collect output
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send initialization request
    const initRequest = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'mcp-test',
          version: '1.0.0',
        },
      },
    });

    serverProcess.stdin.write(initRequest + '\n');

    // Set timeout
    timeout = setTimeout(() => {
      console.log('❌ Timeout: No response after 5 seconds');
      serverProcess.kill();
      resolve(false);
    }, 5000);

    // Handle response
    serverProcess.stdout.on('data', (data) => {
      clearTimeout(timeout);

      try {
        const response = JSON.parse(data.toString());

        if (response.result) {
          console.log('✅ Server responded successfully');
          console.log('Server info:', response.result.serverInfo);
          console.log('Capabilities:', Object.keys(response.result.capabilities));
          serverProcess.kill();
          resolve(true);
        } else if (response.error) {
          console.log('❌ Server returned error:', response.error.message);
          serverProcess.kill();
          resolve(false);
        }
      } catch (e) {
        // Not JSON, might be partial response
      }
    });

    // Handle exit
    serverProcess.on('exit', (code) => {
      clearTimeout(timeout);

      if (code === 0) {
        console.log('✅ Server exited cleanly');
        resolve(true);
      } else if (code !== null) {
        console.log('❌ Server exited with code:', code);
        if (errorOutput) {
          console.log('Error output:', errorOutput);
        }
        resolve(false);
      }
    });

    // Handle errors
    serverProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.log('❌ Failed to start server:', error.message);

      if (error.code === 'ENOENT') {
        console.log(`Hint: Command "${config.command}" not found. Install it first.`);
      }

      resolve(false);
    });
  });
}

// Test HTTP/SSE-based server
async function testHttpServer(serverName, config) {
  console.log('Transport:', config.transport || 'http');
  console.log('URL:', config.url);

  try {
    const headers = config.headers || {};

    // Replace environment variables in headers
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const envVar = value.slice(2, -1);
        headers[key] = process.env[envVar] || value;
      }
    }

    // Make HTTP request
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'mcp-test',
            version: '1.0.0',
          },
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server responded successfully');
      console.log('Server info:', data.result?.serverInfo);
      console.log('Capabilities:', Object.keys(data.result?.capabilities || {}));
      return true;
    } else {
      console.log('❌ HTTP error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('MCP Server Connection Tester\n');

  try {
    // Load configuration
    const config = loadMcpConfig();

    if (!config.mcpServers || Object.keys(config.mcpServers).length === 0) {
      console.error('No MCP servers configured');
      process.exit(1);
    }

    // Test specific server or all servers
    const serverName = process.argv[2];
    let serversToTest = {};

    if (serverName) {
      if (!config.mcpServers[serverName]) {
        console.error(`Server "${serverName}" not found in configuration`);
        console.log('Available servers:', Object.keys(config.mcpServers).join(', '));
        process.exit(1);
      }
      serversToTest[serverName] = config.mcpServers[serverName];
    } else {
      serversToTest = config.mcpServers;
    }

    // Test each server
    const results = {};
    for (const [name, serverConfig] of Object.entries(serversToTest)) {
      results[name] = await testServer(name, serverConfig);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('Test Summary');
    console.log('='.repeat(50));

    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;

    for (const [name, success] of Object.entries(results)) {
      console.log(`${success ? '✅' : '❌'} ${name}`);
    }

    console.log(`\n${passed}/${total} servers passed`);

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { testServer, loadMcpConfig };

