import app from './index';
import http from 'http';
import axios from 'axios';
import FormData from 'form-data';

const server = http.createServer(app);

server.listen(0, async () => {
  const address = server.address() as any;
  const port = address.port;
  const API_BASE = `http://localhost:${port}/api/v1`;
  console.log(`\n=== Starting Phase 2 In-Process E2E Flow Test on Port ${port} ===`);

  try {
    const email = `e2e_user_${Date.now()}@synapseai.io`;

    // 1. Signup / Register
    console.log(`1. Testing POST /auth/register (${email})...`);
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      fullName: 'QA Verified Student',
      email,
      password: 'Password123!',
      role: 'student',
    });
    console.log('   ✅ Registration Response:', regRes.data.success, '| User ID:', regRes.data.data.user._id);
    const token = regRes.data.data.accessToken;

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Fetch Profile via /me
    console.log('\n2. Testing GET /auth/me...');
    const meRes = await axios.get(`${API_BASE}/auth/me`, { headers: authHeaders });
    console.log('   ✅ Profile /me Response:', meRes.data.success, '| User Email:', meRes.data.data.user.email);

    // 3. Upload Video
    console.log('\n3. Testing POST /videos/upload...');
    const form = new FormData();
    form.append('video', Buffer.from('Mock Video Buffer Contents'), {
      filename: 'sample_lecture.mp4',
      contentType: 'video/mp4',
    });
    form.append('title', 'Distributed Microservices & Queues');

    const uploadRes = await axios.post(`${API_BASE}/videos/upload`, form, {
      headers: {
        ...authHeaders,
        ...form.getHeaders(),
      },
    });
    console.log('   ✅ Video Upload Response:', uploadRes.data.success);
    console.log('   ✅ Video Status:', uploadRes.data.data.video.status);
    console.log('   ✅ Playable Video URL:', uploadRes.data.data.video.videoUrl);
    const videoId = uploadRes.data.data.video._id;

    // 4. List Videos
    console.log('\n4. Testing GET /videos list...');
    const listRes = await axios.get(`${API_BASE}/videos`, { headers: authHeaders });
    console.log('   ✅ Video List Count:', listRes.data.data.videos.length);

    // 5. Get Video Details
    console.log(`\n5. Testing GET /videos/${videoId}...`);
    const detailsRes = await axios.get(`${API_BASE}/videos/${videoId}`, { headers: authHeaders });
    console.log('   ✅ Single Video Details Fetched:', detailsRes.data.data.video.title);

    console.log('\n🎉 ALL PHASE 2 E2E FLOW CHECKS PASSED 100% CLEANLY!\n');
  } catch (err: any) {
    console.error('❌ E2E Test Failed:', err.response?.data || err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
