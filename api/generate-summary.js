// Secure Vercel API Endpoint: /api/generate-summary
const https = require('https');

module.exports = async function handler(req, res) {
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
      You are an elite portfolio optimizer. Your job is to analyze the user's raw profile context and output a fully personalized professional summary and matching industry skills array.
      
      CRITICAL INSTRUCTIONS:
      - NEVER use predefined templates or predictable opening phrases like "Dedicated and detail-driven..." or "Results-oriented...".
      - Analyze their true industry: adapt your entire vocabulary to match their profession (e.g., if they are a Makeup Artist, use design, aesthetics, and texture terms).
      - Return your result strictly in raw JSON format with exactly two properties: "summary" (a 2-3 sentence paragraph) and "skills" (a comma-separated string of exactly 6-8 skills). Do not wrap in markdown code blocks.
    `;

    const userPrompt = `
      User Profile Context data:
      - Name: ${profile.name || "Anonymous"}
      - Profession: ${profile.profession || "Professional"}
      - Introduction: ${profile.aboutMe || ""}
      - Projects built: ${JSON.stringify(profile.projects || [])}
    `;

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { responseMimeType: "application/json" }
    });

    // Make request using native node https module to guarantee zero dependency failures
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const apiData = await new Promise((resolve, reject) => {
      const apiReq = https.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => data += chunk);
        apiRes.on('end', () => resolve(JSON.parse(data)));
      });

      apiReq.on('error', (e) => reject(e));
      apiReq.write(postData);
      apiReq.end();
    });

    if (!apiData.candidates || !apiData.candidates[0]?.content?.parts?.[0]?.text) {
      console.error("Gemini Error Payload:", apiData);
      return res.status(500).json({ error: "AI network returned an empty context payload layout." });
    }

    const textOutput = apiData.candidates[0].content.parts[0].text;
    const parsedPayload = JSON.parse(textOutput.trim());

    return res.status(200).json({
      summary: parsedPayload.summary || "",
      skills: parsedPayload.skills || ""
    });

  } catch (err) {
    console.error("Vercel Serverless Function Crash Logs:", err);
    return res.status(500).json({ error: "Failed to generate context asset mapping." });
  }
};