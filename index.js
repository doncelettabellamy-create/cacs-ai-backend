require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");
const app = express();
 app.use(cors({ origin: '*' }));
const PORT = 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("CACS AI Backend is running");
});

app.get("/status", (req, res) => {
  res.json({
    system: "CACS",
    status: "ACTIVE",
    time: new Date()
  });
});

app.get("/ai-check", async (req, res) => {
  try {
    const sampleData = {
      documents: {
        id: true,
        consent: false,
        medical: true
      }
    };

    const prompt = `
Analyze this participant compliance data.
Identify missing or risky items.
Do NOT assign final clearance status.

Data:
${JSON.stringify(sampleData)}

Return JSON format like this:
{
  "issues": [],
  "risk_level": "",
  "notes": ""
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ]
    });

 const rawText = response.choices[0].message.content;

const cleaned = rawText.replace(/```json|```/g, '').trim();

let parsed;

try {
  parsed = JSON.parse(cleaned);
} catch (e) {
  parsed = {
    issues: [],
    risk_level: 'unknown',
    notes: rawText
  };
}

res.json({ text: parsed.notes || JSON.stringify(parsed) });
   } catch (error) {
  console.error("AI route error:", error.message);
  res.status(500).json({
    error: "AI check failed"
  });
}
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
