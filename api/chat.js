import { VertexAI } from '@google-cloud/vertexai';

export default async function handler(req, res) {
  // --- 1. CORS SECURITY PROTOCOL ---
  res.setHeader('Access-Control-Allow-Origin', 'https://pavanks17.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle the Browser "Preflight" Check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // --- 2. STATEFUL MEMORY LOGIC ---
    const { history, prompt, message, text, input } = req.body;
    let requestContents = [];

    // Decide if we use the history array or a single message
    if (history && Array.isArray(history) && history.length > 0) {
      requestContents = history;
    } else {
      const finalPrompt = prompt || message || text || input;
      if (!finalPrompt) {
        console.error("Received an invalid body:", req.body);
        return res.status(400).json({ 
          error: 'No input provided. Ensure body contains a "history" array or "message" string.',
          receivedBody: req.body 
        });
      }
      requestContents = [{ role: 'user', parts: [{ text: finalPrompt }] }];
    }

    // --- 3. VERTEX AI AUTHENTICATION ---
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

    // --- 4. MODEL & SYSTEM INSTRUCTIONS ---
    const generativeModel = vertex_ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: {
        role: 'system',
        parts: [{ 
          text: process.env.AI_SYSTEM_INSTRUCTION || "You are a helpful AI assistant." 
        }]
      },
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7, 
      },
    });

    // --- 5. GENERATE RESPONSE ---
    const request = {
      contents: requestContents, // Passes the history array to Gemini!
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
