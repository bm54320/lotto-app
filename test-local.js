// Simple test script for local development
const http = require('http');

const testEndpoint = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Testing Loto 6/45 Application...\n');

  try {
    // Test 1: Home page
    console.log('1. Testing home page...');
    const home = await testEndpoint('/');
    console.log(`   Status: ${home.status} (expected: 200)`);
    
    // Test 2: Ticket page (should 404 for invalid code)
    console.log('2. Testing ticket page with invalid code...');
    const ticket = await testEndpoint('/ticket/invalid-code');
    console.log(`   Status: ${ticket.status} (expected: 404)`);

    // Test 3: M2M endpoints without auth (should fail)
    console.log('3. Testing M2M endpoints without auth...');
    const newRound = await testEndpoint('/new-round', 'POST');
    console.log(`   /new-round Status: ${newRound.status} (expected: 401 or 403)`);
    
    const close = await testEndpoint('/close', 'POST');
    console.log(`   /close Status: ${close.status} (expected: 401 or 403)`);
    
    const storeResults = await testEndpoint('/store-results', 'POST', { numbers: [1,2,3,4,5,6] });
    console.log(`   /store-results Status: ${storeResults.status} (expected: 401 or 403)`);

    // Test 4: Ticket submission without auth (should fail)
    console.log('4. Testing ticket submission without auth...');
    const ticketSubmit = await testEndpoint('/tickets', 'POST', { 
      documentId: '123456789', 
      numbers: '1,2,3,4,5,6' 
    });
    console.log(`   Status: ${ticketSubmit.status} (expected: 401)`);

    console.log('\n✅ All tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up Auth0 configuration');
    console.log('2. Create .env file with proper values');
    console.log('3. Run: npm run dev');
    console.log('4. Test with authentication');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
  }
}

runTests();
