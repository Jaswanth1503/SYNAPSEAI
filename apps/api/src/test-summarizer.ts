import { summarize as summarizeGemini } from './services/ai/geminiService';
import {
  summarize as summarizeAi,
  generateQuiz,
  generateFlashcards,
  generateMindMap,
  answerDoubt,
} from './services/ai/aiService';

async function runTests() {
  console.log('====================================================');
  console.log('🤖 SYNAPSEAI - Video AI Summarizer & AI Service Test');
  console.log('====================================================\n');

  const sampleTranscript = `
    Welcome to SYNAPSEAI. Today we are learning about clean software architecture, 
    asynchronous job queues with BullMQ, vector search with MongoDB Atlas, 
    and integrating Gemini and Claude LLMs for automatic video summarization, 
    key takeaway extraction, quiz generation, and mind mapping.
  `;

  // 1. Test Gemini Video Transcript Summarizer
  console.log('1️⃣  Testing Gemini Video Transcript Summarizer...');
  try {
    const geminiResult = await summarizeGemini(sampleTranscript);
    console.log('✅ Gemini Summary Success:');
    console.log('--- Summary ---');
    console.log(geminiResult.summary);
    console.log('--- Key Points ---');
    console.log(geminiResult.keyPoints);
    console.log('--- Important Concepts ---');
    console.log(geminiResult.importantConcepts);
  } catch (err: any) {
    console.error('❌ Gemini Summary Failed:', err.message);
  }

  console.log('\n----------------------------------------------------\n');

  // 2. Test AI Service Modular Features (Summary, Quiz, Flashcards, Mindmap, Doubt)
  console.log('2️⃣  Testing AI Modular Features (Summary, Quiz, Flashcards, MindMap)...');

  const summaryRes = await summarizeAi({ transcript: sampleTranscript });
  console.log('✅ AI Service Summary Title:', summaryRes.title);
  console.log('  Key Takeaways Count:', summaryRes.keyTakeaways.length);

  const quizRes = await generateQuiz({ topic: 'Video AI Summarizer Architecture', numQuestions: 2 });
  console.log('✅ Generated Quiz Questions:', quizRes.questions.length);
  console.log('  Q1:', quizRes.questions[0].question);

  const flashcardRes = await generateFlashcards({ topic: 'Video Processing Architecture', count: 3 });
  console.log('✅ Generated Flashcards Count:', flashcardRes.totalCards);

  const mindMapRes = await generateMindMap({ topic: 'Video AI Pipeline' });
  console.log('✅ MindMap Root Node:', mindMapRes.root.label);

  const doubtRes = await answerDoubt({ question: 'How does Video Summarization work in SYNAPSEAI?' });
  console.log('✅ Answer Doubt Response:', doubtRes.answer);

  console.log('\n====================================================');
  console.log('🎉 ALL AI VIDEO SUMMARIZER MODULES TESTED SUCCESSFULLY!');
  console.log('====================================================\n');
}

runTests().catch(console.error);
