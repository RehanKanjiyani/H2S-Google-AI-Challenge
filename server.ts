import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { getAICoachFeedback, getAIDailyChallenges } from './server/gemini.ts';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware for incoming API payloads
  app.use(express.json());

  // 1. API endpoint for custom feedback
  app.post('/api/coach', async (req, res) => {
    try {
      const { logsSummary, userStats } = req.body;
      if (!logsSummary) {
        res.status(400).json({ error: 'logsSummary is required' });
        return;
      }
      const feedback = await getAICoachFeedback(logsSummary, userStats || '');
      res.json({ feedback });
    } catch (err: any) {
      console.error('Server error handling /api/coach:', err);
      res.status(500).json({ error: 'Failed to generate recommendations', details: err.message });
    }
  });

  // 2. API endpoint for custom eco challenges
  app.post('/api/challenge', async (req, res) => {
    try {
      const { highestCategory, completedIds } = req.body;
      const challenges = await getAIDailyChallenges(
        highestCategory || 'general',
        completedIds || []
      );
      res.json({ challenges });
    } catch (err: any) {
      console.error('Server error handling /api/challenge:', err);
      res.status(500).json({ error: 'Failed to generate eco challenges', details: err.message });
    }
  });

  // 3. Mount Vite middleware or static files depending on mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EcoTrack AI Server] running on http://127.0.0.1:${PORT} (Express + Vite)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to trigger EcoTrack AI server:', err);
});
