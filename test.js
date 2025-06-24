const http = require('http');

/**
 * Simple test client for the MCP server
 */
async function runTests() {
  console.log('Running MCP Server tests...');
  
  try {
    // Test 1: Check health endpoint
    console.log('\n--- Test 1: Health Check ---');
    const healthResponse = await makeRequest('GET', '/health');
    console.log('Health check response:', healthResponse);
    
    // Test 2: List tools (should include our built-in lorem ipsum tool)
    console.log('\n--- Test 2: List Tools ---');
    const toolsResponse = await makeRequest('GET', '/tools');
    console.log('Tools response:', toolsResponse);
    
    // Verify lorem ipsum tool is registered
    const loremIpsumTool = toolsResponse.find(tool => tool.name === 'loremIpsum');
    if (!loremIpsumTool) {
      throw new Error('Lorem ipsum tool not found in registered tools');
    }
    console.log('Lorem ipsum tool found:', loremIpsumTool.name);
    
    // Test 3: Execute lorem ipsum tool with default parameters
    console.log('\n--- Test 3: Execute Lorem Ipsum (Default) ---');
    const defaultResponse = await makeRequest('POST', '/execute/loremIpsum', {});
    console.log('Default lorem ipsum response:');
    console.log(defaultResponse.result);
    
    // Test 4: Execute lorem ipsum tool with custom parameters
    console.log('\n--- Test 4: Execute Lorem Ipsum (Custom) ---');
    const customResponse = await makeRequest('POST', '/execute/loremIpsum', {
      paragraphs: 2,
      minSentences: 2,
      maxSentences: 4
    });
    console.log('Custom lorem ipsum response:');
    console.log(customResponse.result);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

/**
 * Helper function to make HTTP requests to the MCP server
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
        } else {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Run the tests
console.log('Starting tests...');
console.log('Make sure the MCP server is running on port 3000');
console.log('Press Ctrl+C to cancel or wait 3 seconds to continue...');

setTimeout(() => {
  runTests().catch(console.error);
}, 3000);