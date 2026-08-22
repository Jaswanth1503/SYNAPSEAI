import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

async function testPhase5Step3() {
  console.log('=== TESTING PHASE 5 STEP 3: RECOMMENDATION ENGINE ===\n');

  try {
    const randomEmail = `recs_qa_${Date.now()}@synapse.ai`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      fullName: 'Recs Student',
      email: randomEmail,
      password: 'password123',
      role: 'student',
    });
    const token = regRes.data.data.accessToken || regRes.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('[1/1] Testing GET /api/v1/analytics/recommendations...');
    const res = await axios.get(`${API_BASE}/analytics/recommendations`, { headers });
    console.log('  -> Total Recommendations Returned:', res.data.data.recommendations.length);
    console.log('  -> Top Recommendation Title:', res.data.data.recommendations[0].title);
    console.log('  -> Rationale:', res.data.data.recommendations[0].rationale);

    console.log('\n==================================================');
    console.log(' SUCCESS: PHASE 5 STEP 3 RECOMMENDATIONS QA PASSED!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('QA FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase5Step3();
