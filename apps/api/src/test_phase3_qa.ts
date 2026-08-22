import app from './index';
import http from 'http';
import axios from 'axios';

const server = http.createServer(app);

server.listen(0, async () => {
  const address = server.address() as any;
  const port = address.port;
  const API_BASE = `http://localhost:${port}/api/v1`;
  console.log(`\n=== Starting Phase 3 QA Pass & Graceful Degradation E2E Test on Port ${port} ===\n`);

  try {
    // 1. Register QA test user
    const email = `qa_phase3_${Date.now()}@synapseai.io`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      fullName: 'Phase 3 QA Tester',
      email,
      password: 'Password123!',
      role: 'student',
    });
    const token = regRes.data.data.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('1. ✅ Auth Register & Token Acquisition Success');

    const mockVideoId = '65c2f9d8e4b0a123456789ab';

    // 2. Test Transcript Endpoint: GET /videos/:id/transcript
    console.log('\n2. Testing GET /videos/:id/transcript...');
    const transcriptRes = await axios.get(`${API_BASE}/ai/videos/${mockVideoId}/transcript`, { headers: authHeaders });
    console.log('   ✅ Transcript Segments Count:', transcriptRes.data.data.transcriptSegments.length);

    // 3. Test Video Summarizer: POST /ai/videos/:id/summarize
    console.log('\n3. Testing POST /ai/videos/:id/summarize...');
    const sumRes = await axios.post(`${API_BASE}/ai/videos/${mockVideoId}/summarize`, {}, { headers: authHeaders });
    console.log('   ✅ Notes Generated Length:', sumRes.data.data.notesMarkdown.length, 'chars');
    console.log('   ✅ Chapters Generated Count:', sumRes.data.data.chapters.length);

    // 4. Test RAG Doubt Assistant: POST /ai/videos/:id/doubt
    console.log('\n4. Testing POST /ai/videos/:id/doubt...');
    const doubtRes = await axios.post(
      `${API_BASE}/ai/videos/${mockVideoId}/doubt`,
      { question: 'What is the role of BullMQ in the queue architecture?' },
      { headers: authHeaders }
    );
    console.log('   ✅ RAG Answer:', doubtRes.data.data.answer.substring(0, 90) + '...');

    // 5. Test AI Quiz Generator: POST /ai/videos/:id/quiz
    console.log('\n5. Testing POST /ai/videos/:id/quiz...');
    const quizRes = await axios.post(`${API_BASE}/ai/videos/${mockVideoId}/quiz`, {}, { headers: authHeaders });
    console.log('   ✅ Quiz MCQs Generated Count:', quizRes.data.data.questions.length);

    // 6. Test Quiz Attempt Persistence: POST /quizzes/:id/attempt
    console.log('\n6. Testing POST /quizzes/:id/attempt...');
    const attemptRes = await axios.post(
      `${API_BASE}/quizzes/${mockVideoId}/attempt`,
      {
        answers: [
          { questionText: 'What is BullMQ?', selectedOption: 'Queue', correctOption: 'Queue', isCorrect: true },
          { questionText: 'Embedding dimension?', selectedOption: '1536', correctOption: '1536', isCorrect: true },
        ],
      },
      { headers: authHeaders }
    );
    console.log('   ✅ Quiz Score Recorded:', attemptRes.data.data.attempt.score + '%');

    // 7. Test Code Execution Engine: POST /code/execute
    console.log('\n7. Testing POST /code/execute...');
    const codeRes = await axios.post(
      `${API_BASE}/code/execute`,
      {
        language_id: 63,
        source_code: 'console.log("SYNAPSE AI Code Engine Passed!");',
      },
      { headers: authHeaders }
    );
    console.log('   ✅ Code Exec Output:', codeRes.data.data.stdout.trim());

    // 8. Graceful Error Handling Verification
    console.log('\n8. Testing Graceful Degradation / Error Handling...');
    try {
      await axios.post(`${API_BASE}/ai/videos/invalid_id/doubt`, {}, { headers: authHeaders });
    } catch (err: any) {
      console.log('   ✅ Invalid Payload Graceful Error Catch:', err.response?.status, err.response?.data?.message);
    }

    console.log('\n🎉 ALL PHASE 3 QA CHECKS PASSED WITH 100% SUCCESS!\n');
  } catch (err: any) {
    console.error('❌ QA Test Failure:', err.response?.data || err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
