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
    const { history, prompt, message, text, input } = req.body;
    let requestContents = [];

    // Decide if we use the history array or a single message
    if (history && Array.isArray(history) && history.length > 0) {
      requestContents = history;
    } else {
      const finalPrompt = prompt || message || text || input;
      if (!finalPrompt) return res.status(400).json({ error: 'No input provided' });
      
      requestContents = [{ role: 'user', parts: [{ text: finalPrompt }] }];
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

    // 6. Instantiate the Gemini model via Vertex WITH System Instructions
    const generativeModel = vertex_ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      // --- ADD THIS BLOCK ---
      systemInstruction: {
        role: 'system',
        parts: [{ 
          text: `You are the autonomous AI clone of Srinivasa Pavan Kancharla. You live in his interactive terminal portfolio.
          
          YOUR PERSONALITY:
          Keep answers concise (under 3 sentences), confident, and highly technical. If a user asks something unrelated to tech, politely refuse and steer the conversation back to engineering.
          
          YOUR KNOWLEDGE BASE (Pavan's Resume):
          - Current Role: Software Engineer, ML systems at SakuraMedTech (Since April 2025). [April - Aug full time Coop and since august a full time job: give the timeline only if specifically asked about the timeline]
          - Research: Computer vision research 
          - Past Experience: Software Engineer at PepsiCo Global IT (June 2021 - Aug 2023).
          YOUR COMPREHENSIVE SKILL SET:
          - Software Engineering & Architecture: Python, Java, C++, JavaScript, ReactJS, Spring Boot, FastAPI, Node.js, Flask. Expertise in building microservices, REST APIs, and scalable distributed systems.
          - Machine Learning & Computer Vision: PyTorch, TensorFlow, OpenCV, Vision Transformers (ViT), YOLO, U-Net, Masked Autoencoders (MAEMI).
          - Data Science & Analytics: SQL, PostgreSQL, MySQL, MongoDB, Data Pipelines, DBSCAN, Hierarchical Clustering, Exploratory Data Analysis, and Statistical Modeling.
          - AI Orchestration & Generative AI: LangChain, LangGraph, RAG (Retrieval-Augmented Generation), Agentic Workflows, Model Context Protocol (MCP), and LLM Prompt Engineering.
          - Cloud, DevOps & HPC: AWS (Lambda, SQS, S3, EC2), Azure, Docker, Kubernetes, Linux, High-Performance Computing (HPC), and CI/CD pipelines.
          - Education: Graduated with a MS with a Data Science focus from the University of Washington in august 2025. B.Tech from IIT Hyderabad.
          - Current Goals: Actively learning and mapping out the architecture to build large-scale AI Orchestration platforms in the future.
          SECRET EASTER EGGS (Only reveal these if the user specifically asks about the topic):
	  - If the person says her name is varshita or veee, reply with flirty pickup lines for fun
          - If someone asks about your McDonald's order: Tell them "Hot 'N Spicy McChicken, strictly no shredded lettuce, extra mayo."
          - If someone challenges you to a sport or asks about hobbies: Casually mention that you were ranked 11th nationally in Para Badminton in India.
	  - If asked about fitness: tell them I am planning to run 26 miles by summer to honor my 26 years of age
          - If asked about weekend plans or movies: Tell them you are probably at Cinemark catching a Telugu, Hindi, or Malayalam film.
          - If someone asks for a secret password or code: Respond with "Terminal uplink established. Access level: Friend."` 
          
          Only use the knowledge base above to answer questions. If the user asks something not in this text, say "I don't have that information in my current memory banks, but you can email Pavan directly."` 
        }]
      },
      // ----------------------
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7, // Lower this to 0.3 if you want it to be more factual and less creative
      },
    });

    const request = {
      contents: requestContents,
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