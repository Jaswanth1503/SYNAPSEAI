import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

async function testPhase5Step1() {
  console.log('=== TESTING PHASE 5 STEP 1: AI FLASHCARDS ===\n');
  try {
    const randomEmail = `flashcards_qa_${Date.now()}@synapse.ai`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      fullName: 'Flashcards Student',
      email: randomEmail,
      password: 'password123',
      role: 'student',
    });
    const token = regRes.data.data.accessToken || regRes.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('[1/3] Testing GET /api/v1/flashcards...');
    const getRes = await axios.get(`${API_BASE}/flashcards`, { headers });
    console.log('  -> Initial Flashcards Retreived:', getRes.data.data.flashcards.length);

    console.log('\n[2/3] Testing POST /api/v1/flashcards/generate/:videoId...');
    const genRes = await axios.post(`${API_BASE}/flashcards/generate/test_video_101`, {}, { headers });
    console.log('  -> AI Flashcards Generated:', genRes.data.data.flashcards.length);
    console.log('  -> Sample Question:', genRes.data.data.flashcards[0].front);
    console.log('  -> Sample Answer:', genRes.data.data.flashcards[0].back);

    console.log('\n[3/3] Testing POST /api/v1/flashcards (Manual Creation)...');
    const createRes = await axios.post(
      `${API_BASE}/flashcards`,
      {
        front: 'What is WebSockets event-driven architecture?',
        back: 'Bi-directional persistent full-duplex TCP communication between client and server.',
      },
      { headers }
    );
    console.log('  -> Created Flashcard ID:', createRes.data.data.flashcard._id);

    console.log('\n==================================================');
    console.log(' SUCCESS: PHASE 5 STEP 1 FLASHCARDS QA PASSED!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('QA FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase5Step1();
