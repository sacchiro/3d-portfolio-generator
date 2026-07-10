// Secure Vercel API Endpoint: /api/generate-summary
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const profile = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // Hidden securely in your cloud hosting settings

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing API Key setting on server environment.' });
    }

    // Instruction instructions to prevent template responses
    const systemInstruction = `
      You are an elite portfolio optimizer. Your job is to analyze the user's raw profile context and output a fully personalized professional summary and matching industry skills array.
      
      CRITICAL INSTRUCTIONS:
      - NEVER use predefined templates or predictable opening phrases like "Dedicated and detail-driven..." or "Results-oriented...".
      - Analyze their true industry: adapt your entire vocabulary to match their profession (e.g., if they are a Makeup Artist, use design, aesthetics, and texture terms; if they are a Software Engineer, use system architecture terms).
      - Seamlessly interweave their specific personal introductions and project titles naturally into sentences.
      - Return your result strictly in raw JSON format with exactly two properties: "summary" (a 2-3 sentence organic paragraph) and "skills" (a comma-separated string of exactly 6-8 industry-specific advanced skills matching their exact profile). Do not wrap the JSON in markdown code blocks.
    `;

    const userPrompt = `
      User Profile Context data:
      - Name: ${profile.name}
      - Profession: ${profile.profession}
      - Introduction: ${profile.aboutMe}
      - Projects built: ${JSON.stringify(profile.projects || [])}
    `;

    // Make the backend connection request directly to Google's live AI servers
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const apiData = await apiResponse.json();
    
    // Parse the data and send it back to your extension.js frontend
    const textOutput = apiData.candidates[0].content.parts[0].text;
    const parsedPayload = JSON.parse(textOutput);

    return res.status(200).json(parsedPayload);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate context asset mapping." });
  }
}