import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

async function runPhase4QA() {
  console.log('=== PHASE 4 CAREER MODULE QA TEST SUITE ===\n');

  try {
    // 1. Authenticate / Register a test user
    console.log('[1/6] Registering Test Student for Token...');
    const randomEmail = `career_qa_${Date.now()}@synapse.ai`;
    const registerRes = await axios.post(`${API_BASE}/auth/register`, {
      fullName: 'Career QA Student',
      email: randomEmail,
      password: 'password123',
      role: 'student',
    });
    const token = registerRes.data.data.accessToken || registerRes.data.data.token;
    console.log('  -> Registered user & obtained token successfully.');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test Skill Gap Analytics Endpoint
    console.log('\n[2/6] Testing GET /api/v1/analytics/skills/gap...');
    const gapRes = await axios.get(`${API_BASE}/analytics/skills/gap?roleId=fullstack_ai`, { headers });
    console.log('  -> Skill Gap Match:', gapRes.data.data.overallMatchPercentage + '%');
    console.log('  -> Total Requirements Evaluated:', gapRes.data.data.skillBreakdown.length);

    // 3. Test Personalized Career Roadmap Endpoint
    console.log('\n[3/6] Testing GET /api/v1/analytics/career/roadmap...');
    const roadmapRes = await axios.get(`${API_BASE}/analytics/career/roadmap?roleId=fullstack_ai`, { headers });
    console.log('  -> Total Milestones:', roadmapRes.data.data.totalMilestones);
    console.log('  -> Estimated Weeks:', roadmapRes.data.data.estimatedWeeks);
    console.log('  -> Phase 1 Title:', roadmapRes.data.data.roadmapMilestones[0].phaseTitle);

    // 4. Test AI Resume Tailor & ATS Scoring Endpoint
    console.log('\n[4/6] Testing POST /api/v1/resumes/tailor...');
    const tailorRes = await axios.post(
      `${API_BASE}/resumes/tailor`,
      {
        rawResumeText: 'Developed Express Node endpoints and MongoDB collections with Redis job queue workers.',
        targetCompany: 'Google',
        targetRole: 'Senior Full Stack AI Engineer',
      },
      { headers }
    );
    console.log('  -> ATS Match Score:', tailorRes.data.data.atsScore + '%');
    console.log('  -> Missing Keywords:', tailorRes.data.data.missingKeywords.join(', '));
    console.log('  -> Google XYZ Bullets:', tailorRes.data.data.tailoredBullets.length);

    // 5. Test AI Mock Interview Flow (Start & Answer)
    console.log('\n[5/6] Testing POST /api/v1/interviews/start & /answer...');
    const startRes = await axios.post(
      `${API_BASE}/interviews/start`,
      { role: 'Full Stack AI Engineer', category: 'Technical' },
      { headers }
    );
    const interviewId = startRes.data.data.interviewId;
    const initialQuestion = startRes.data.data.question.questionText;
    console.log('  -> Interview Started ID:', interviewId);
    console.log('  -> Initial Question:', initialQuestion);

    const answerRes = await axios.post(
      `${API_BASE}/interviews/answer`,
      {
        interviewId,
        answerText: 'In Node.js, process memory includes V8 heap and off-heap allocations, while threads in worker threads share memory via SharedArrayBuffer.',
      },
      { headers }
    );
    console.log('  -> Evaluation Score:', answerRes.data.data.score + '%');
    console.log('  -> AI Feedback:', answerRes.data.data.feedback);

    // 6. Test Placement & Job Application Tracker Endpoints
    console.log('\n[6/6] Testing GET & POST /api/v1/jobs/applications...');
    const createJobRes = await axios.post(
      `${API_BASE}/jobs/applications`,
      {
        companyName: 'Meta AI',
        roleTitle: 'Lead RAG Systems Engineer',
        status: 'Interview',
        matchScore: 94,
      },
      { headers }
    );
    console.log('  -> Created Application:', createJobRes.data.data.companyName, '-', createJobRes.data.data.roleTitle);

    const getJobsRes = await axios.get(`${API_BASE}/jobs/applications`, { headers });
    console.log('  -> Total Job Applications Tracked:', getJobsRes.data.data.metrics.totalTracked);
    console.log('  -> Applications Interviewing:', getJobsRes.data.data.metrics.totalInterview);

    console.log('\n==================================================');
    console.log(' SUCCESS: ALL 6 PHASE 4 CAREER ENDPOINTS PASSED QA!');
    console.log('==================================================\n');
  } catch (error: any) {
    console.error('\n QA TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
}

runPhase4QA();
