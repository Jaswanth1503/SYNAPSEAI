import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

async function testPhase5Step2() {
  console.log('=== TESTING PHASE 5 STEP 2: REACT FLOW AI MIND MAP GENERATOR ===\n');

  try {
    const randomEmail = `mindmap_qa_${Date.now()}@synapse.ai`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      fullName: 'MindMap Student',
      email: randomEmail,
      password: 'password123',
      role: 'student',
    });
    const token = regRes.data.data.accessToken || regRes.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('[1/1] Testing POST /api/v1/ai/mindmap/:videoId...');
    const res = await axios.post(`${API_BASE}/ai/mindmap/test_video_202`, {}, { headers });
    console.log('  -> Mind Map Video ID:', res.data.data.videoId);
    console.log('  -> Total Hierarchical Nodes Returned:', res.data.data.nodes.length);
    console.log('  -> Root Concept:', res.data.data.nodes[0].label);
    console.log('  -> Sub-concept:', res.data.data.nodes[1].label);

    console.log('\n==================================================');
    console.log(' SUCCESS: PHASE 5 STEP 2 MIND MAP QA PASSED!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('QA FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase5Step2();
