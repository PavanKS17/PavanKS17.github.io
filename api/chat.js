import { VertexAI } from '@google-cloud/vertexai';

export default async function handler(req, res) {
  // --- CORS SECURITY PROTOCOL ---
  // 1. Explicitly allow your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', 'https://pavanks17.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle the Browser "Preflight" Check
  // Browsers automatically send an 'OPTIONS' ping before sending data to see if it's allowed.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- END CORS ---

  // Only allow POST requests for actual chat data
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, message, text, input } = req.body;
    const finalPrompt = prompt || message || text || input;

    if (!finalPrompt) {
      console.error("Received an invalid body:", req.body);
      return res.status(400).json({ 
        error: 'No text received. Make sure frontend sends JSON with a "message" key.',
        receivedBody: req.body 
      });
    }

    const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);
    const privateKey = credentials.private_key.replace(/\\n/g, '\n');

    const vertex_ai = new VertexAI({
      project: credentials.project_id,
      location: 'us-central1', 
      googleAuthOptions: {
        credentials: {
          client_email: credentials.client_email,
          private_key: privateKey, 
        }
      }
    });

    const generativeModel = vertex_ai.getGenerativeModel({
      model: 'gemini-2.5-flash', 
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const request = {
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
    };

    const streamingResp = await generativeModel.generateContentStream(request);
    const response = await streamingResp.response;
    
    const textResponse = response.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: textResponse });

  } catch (error) {
    console.error('Vertex AI Error:', error);
    return res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
}