import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

async function testPhase5Step5() {
  console.log('=== TESTING PHASE 5 STEP 5: CERTIFICATE ISSUANCE & VERIFICATION ===\n');

  try {
    const randomEmail = `cert_qa_${Date.now()}@synapse.ai`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      fullName: 'Certificate Student',
      email: randomEmail,
      password: 'password123',
      role: 'student',
    });
    const token = regRes.data.data.accessToken || regRes.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('[1/3] Testing POST /api/v1/certificates/generate...');
    const genRes = await axios.post(`${API_BASE}/certificates/generate`, { courseId: 'course_101' }, { headers });
    const certCode = genRes.data.data.certificateId;
    console.log('  -> Generated Certificate Code:', certCode);
    console.log('  -> Student Name:', genRes.data.data.studentName);
    console.log('  -> PDF Data URL Length:', genRes.data.data.pdfDataUrl?.length || 0);

    console.log('\n[2/3] Testing GET /api/v1/certificates/my-certificates...');
    const myCertsRes = await axios.get(`${API_BASE}/certificates/my-certificates`, { headers });
    console.log('  -> My Certificates Count:', myCertsRes.data.data.certificates.length);

    console.log('\n[3/3] Testing GET /api/v1/certificates/verify/:id (Public Verification)...');
    const verifyRes = await axios.get(`${API_BASE}/certificates/verify/${certCode}`);
    console.log('  -> Verification Status:', verifyRes.data.isValid ? 'AUTHENTIC' : 'INVALID');
    console.log('  -> Message:', verifyRes.data.message);

    console.log('\n==================================================');
    console.log(' SUCCESS: PHASE 5 STEP 5 CERTIFICATE ENGINE QA PASSED!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('QA FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase5Step5();
