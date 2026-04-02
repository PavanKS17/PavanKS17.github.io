import { VertexAI } from '@google-cloud/vertexai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 1. Parse the JSON credentials from Vercel
    const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);

    // 2. Handle Vercel's newline escaping in the private key
    const privateKey = credentials.private_key.replace(/\\n/g, '\n');

    // 3. Initialize Vertex AI with direct authentication
    const vertex_ai = new VertexAI({
      project: credentials.project_id,
      location: 'us-central1', // Ensure this matches where you want to route requests
      googleAuthOptions: {
        credentials: {
          client_email: credentials.client_email,
          private_key: privateKey, 
        }
      }
    });

    // 4. Instantiate the Gemini model via Vertex
    const generativeModel = vertex_ai.getGenerativeModel({
      model: 'gemini-1.5-pro', // or 'gemini-1.5-flash' for faster, lighter tasks
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // 5. Generate content
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const streamingResp = await generativeModel.generateContentStream(request);
    const response = await streamingResp.response;
    
    // Extract the text from the response
    const textResponse = response.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: textResponse });

  } catch (error) {
    console.error('Vertex AI Error:', error);
    return res.status(500).json({ error: 'Failed to generate response from Vertex AI' });
  }
}