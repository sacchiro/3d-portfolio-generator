// Secure Vercel API Endpoint: /api/generate-summary
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const profile = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing API Key setting on server environment.' });
    }

    const systemInstruction = `
      You are an elite portfolio optimizer. Analyze the user's raw profile context and output a personalized professional summary and matching industry skills.
      
      CRITICAL INSTRUCTIONS:
      - Return your result strictly in valid JSON format with exactly two properties: "summary" and "skills".
      - "summary" must be a 2-3 sentence paragraph.
      - "skills" must be a comma-separated string of exactly 6-8 skills.
      - Do not include any explanation, markdown, or backticks.
    `;

    const userPrompt = `
      User Profile Context data:
      - Name: ${profile.name || "Anonymous"}
      - Profession: ${profile.profession || "Professional"}
      - Introduction: ${profile.aboutMe || ""}
      - Projects built: ${JSON.stringify(profile.projects || [])}
    `;

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!apiResponse.ok) {
      return res.status(500).json({ error: "Google AI server rejected the request." });
    }

    const apiData = await apiResponse.json();
    
    if (!apiData.candidates || !apiData.candidates[0]?.content?.parts?.[0]?.text) {
      return res.status(500).json({ error: "AI network returned an empty payload layout." });
    }

    let textOutput = apiData.candidates[0].content.parts[0].text.trim();
    
    // BULLETPROOF FIX: Strip markdown code blocks if the AI accidentally added them
    if (textOutput.startsWith("```")) {
      textOutput = textOutput.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    // Safely parse the cleaned text
    const parsedPayload = JSON.parse(textOutput);

    return res.status(200).json({
      summary: parsedPayload.summary || "",
      skills: parsedPayload.skills || ""
    });

  } catch (err) {
    console.error("Vercel Function Error:", err);
    return res.status(500).json({ error: "Failed to parse AI response safely." });
  }
}