// Test script za M2M API endpointi
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testM2MEndpoints() {
  console.log('🧪 Testiranje M2M API endpointa...\n');

  try {
    // Test 1: new-round (bez tokena - trebao bi vratiti 401)
    console.log('1. Testiranje /new-round (bez tokena)...');
    try {
      await axios.post(`${BASE_URL}/new-round`);
      console.log('❌ Očekivao 401, dobio 200');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Dobio 401 kako i treba (bez tokena)');
      } else {
        console.log(`❌ Neočekivani status: ${error.response?.status}`);
      }
    }

    // Test 2: close (bez tokena - trebao bi vratiti 401)
    console.log('\n2. Testiranje /close (bez tokena)...');
    try {
      await axios.post(`${BASE_URL}/close`);
      console.log('❌ Očekivao 401, dobio 200');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Dobio 401 kako i treba (bez tokena)');
      } else {
        console.log(`❌ Neočekivani status: ${error.response?.status}`);
      }
    }

    // Test 3: store-results (bez tokena - trebao bi vratiti 401)
    console.log('\n3. Testiranje /store-results (bez tokena)...');
    try {
      await axios.post(`${BASE_URL}/store-results`, { numbers: [1, 2, 3, 4, 5, 6] });
      console.log('❌ Očekivao 401, dobio 200');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Dobio 401 kako i treba (bez tokena)');
      } else {
        console.log(`❌ Neočekivani status: ${error.response?.status}`);
      }
    }

    console.log('\n🎯 Svi testovi završeni!');
    console.log('\n📝 Napomena: Za potpuno testiranje trebate:');
    console.log('   1. Konfigurirati Auth0');
    console.log('   2. Dobiti M2M token');
    console.log('   3. Testirati s valjanim tokenom');

  } catch (error) {
    console.error('❌ Greška u testiranju:', error.message);
  }
}

// Pokreni testove
testM2MEndpoints();

