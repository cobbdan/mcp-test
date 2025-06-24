const http = require('http');

// Configuration
const host = 'localhost';
const port = 3000;

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('Starting lorem ipsum tool tests...');
  
  try {
    // Test 1: Check if the tool is registered
    console.log('\nTest 1: Checking if lorem ipsum tool is registered');
    const toolsResponse = await makeRequest({
      host,
      port,
      path: '/tools',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status code: ${toolsResponse.statusCode}`);
    const loremIpsumTool = toolsResponse.data.find(tool => tool.name === 'loremIpsum');
    
    if (loremIpsumTool) {
      console.log('✅ Lorem ipsum tool is registered');
      console.log(`Description: ${loremIpsumTool.description}`);
      console.log(`Parameters: ${loremIpsumTool.parameters.length}`);
    } else {
      console.log('❌ Lorem ipsum tool is NOT registered');
    }
    
    // Test 2: Execute with default parameters (1 paragraph)
    console.log('\nTest 2: Execute with default parameters (1 paragraph)');
    const defaultResponse = await makeRequest({
      host,
      port,
      path: '/execute/loremIpsum',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {});
    
    console.log(`Status code: ${defaultResponse.statusCode}`);
    console.log(`Paragraphs returned: ${defaultResponse.data.paragraphs}`);
    console.log('Result:');
    console.log(defaultResponse.data.result);
    
    // Test 3: Execute with custom parameters (3 paragraphs)
    console.log('\nTest 3: Execute with custom parameters (3 paragraphs)');
    const customResponse = await makeRequest({
      host,
      port,
      path: '/execute/loremIpsum',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      paragraphs: 3
    });
    
    console.log(`Status code: ${customResponse.statusCode}`);
    console.log(`Paragraphs returned: ${customResponse.data.paragraphs}`);
    console.log('Result:');
    console.log(customResponse.data.result);
    
    // Test 4: Test parameter validation (requesting too many paragraphs)
    console.log('\nTest 4: Test parameter validation (requesting too many paragraphs)');
    const validationResponse = await makeRequest({
      host,
      port,
      path: '/execute/loremIpsum',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      paragraphs: 10,
      maxParagraphs: 4
    });
    
    console.log(`Status code: ${validationResponse.statusCode}`);
    console.log(`Paragraphs returned: ${validationResponse.data.paragraphs}`);
    console.log(`Requested: 10, Max allowed: 4, Actual returned: ${validationResponse.data.paragraphs}`);
    
    console.log('\nAll tests completed!');
    
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

// Make sure the server is running before executing tests
console.log('Please make sure the MCP server is running on port 3000');
console.log('Run the server with: node server.js');
console.log('Then run this test with: node test-lorem-ipsum.js');

// Uncomment to run tests automatically
runTests();