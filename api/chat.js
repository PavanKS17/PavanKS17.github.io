import { VertexAI } from '@google-cloud/vertexai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Accept multiple possible keys from the frontend payload
    const { prompt, message, text, input } = req.body;
    const finalPrompt = prompt || message || text || input;

    // 2. Error out gracefully if nothing matches, and log what was received
    if (!finalPrompt) {
      console.error("Received an invalid body:", req.body);
      return res.status(400).json({ 
        error: 'No text received. Make sure frontend sends JSON with a "prompt" key.',
        receivedBody: req.body 
      });
    }

    // 3. Parse the JSON credentials from Vercel
    const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);

    // 4. Handle Vercel's newline escaping in the private key
    const privateKey = credentials.private_key.replace(/\\n/g, '\n');

    // 5. Initialize Vertex AI with direct authentication
    const vertex_ai = new VertexAI({
      project: credentials.project_id,
      location: 'us-central1', // Ensure this matches your project's region
      googleAuthOptions: {
        credentials: {
          client_email: credentials.client_email,
          private_key: privateKey, 
        }
      }
    });

    // 6. Instantiate the Gemini model via Vertex
    const generativeModel = vertex_ai.getGenerativeModel({
      model: 'gemini-2.5-flash', // You can swap this to 'gemini-1.5-flash' if needed
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // 7. Generate content
    const request = {
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
    };

    const streamingResp = await generativeModel.generateContentStream(request);
    const response = await streamingResp.response;
    
    // 8. Extract the text from the response
    const textResponse = response.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: textResponse });

  } catch (error) {
    console.error('Vertex AI Error:', error);
    // Added error.message so Vercel logs tell you exactly what failed in GCP
    return res.status(500).json({ error: 'Failed to generate response from Vertex AI', details: error.message });
  }
}