export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    
    // Securely pull the API key from Vercel's environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    // The Persona Training
    const systemInstruction = `You are an autonomous AI clone of Srinivasa Pavan Kancharla. You speak in the third person about Pavan in a professional, confident, and slightly sarcastic engineering tone. 
    Key facts: He is a Full-Stack ML Engineer. He specializes in MedTech, Vision Transformers, and Agentic AI. He builds production-grade infrastructure (AWS, Docker, FastAPI). He is currently training for a 15-mile run and was nationally ranked in Para Badminton in India. Keep answers concise and punchy.`;

    try {
        // Direct call to the Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: { text: systemInstruction } },
                contents: [{ role: 'user', parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error.message);

        const reply = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'AI Clone is currently rebooting. Try again later.' });
    }
}
