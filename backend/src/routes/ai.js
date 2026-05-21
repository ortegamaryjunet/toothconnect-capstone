const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.post('/analyze', requireRole('patient'), async (req, res) => {
  const { concern, services } = req.body;

  if (!concern || !String(concern).trim()) {
    return res.status(400).json({ message: 'Please describe your concern.' });
  }

  if (!Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ message: 'Services list is required.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: 'AI analysis is not available at this time.' });
  }

  const serviceList = services
    .map(s => `- ID: ${s.id}, Name: "${s.name}", Duration: ${s.duration_min} min`)
    .join('\n');

  const systemPrompt = `You are a dental triage assistant for Smile Empress Dental Hub. Analyze patient concerns and recommend the most appropriate clinic service. You must ONLY recommend services from the provided list.`;

  const today = new Date().toISOString().slice(0, 10);

  const userPrompt = `Today's date: ${today}
Patient concern: "${String(concern).trim()}"

Available clinic services:
${serviceList}

Analyze the concern and respond with ONLY a valid JSON object (no markdown, no extra text):
{
  "interpreted_concern": "<1-2 sentence summary of what the patient is experiencing>",
  "suggested_service_id": <number — must be one of the IDs listed above>,
  "suggested_service_name": "<exact service name from the list above>",
  "urgency_level": "<low|moderate|high|emergency>",
  "estimated_duration_min": <number>,
  "confidence_score": <number 0-100>,
  "safety_note": "<brief safety note or empty string>",
  "needs_staff_review": <true|false>,
  "preferred_date": "<YYYY-MM-DD or null — only if patient mentioned a specific date or relative day like 'tomorrow', 'this Friday'>",
  "preferred_time": "<HH:MM in 24-hour format or null — only if patient mentioned a specific time like '3 PM', '10 AM'; must be between 10:00 and 19:00>"
}

Rules:
- suggested_service_id must be exactly one of the IDs listed above.
- If confidence < 60 or mapping is unclear, choose the Consultation service if available, otherwise the first service, and set needs_staff_review to true.
- urgency_level: "emergency" = severe pain or facial swelling, "high" = significant pain, "moderate" = noticeable discomfort, "low" = routine or cosmetic.
- estimated_duration_min should match the chosen service duration unless clinically different.
- For preferred_date: resolve relative terms using today's date. "tomorrow" = next calendar day, "this Friday" = the coming Friday, etc. Set null if no date was mentioned.
- For preferred_time: only set if the patient explicitly stated a time. Clamp to 10:00–19:00 range. Set null if no time was mentioned.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[ai] OpenAI error:', errData);
      return res.status(502).json({ message: 'AI analysis failed. Please try again.' });
    }

    const data = await response.json();
    const raw = (data.choices?.[0]?.message?.content || '').trim();

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      console.error('[ai] Failed to parse OpenAI response:', raw);
      return res.status(502).json({ message: 'AI returned an unexpected response. Please try again.' });
    }

    // Ensure the suggested service is actually in the provided list
    const matched = services.find(s => Number(s.id) === Number(result.suggested_service_id));
    if (!matched) {
      const fallback =
        services.find(s => String(s.name).toLowerCase().includes('consult')) || services[0];
      result.suggested_service_id = fallback.id;
      result.suggested_service_name = fallback.name;
      result.needs_staff_review = true;
      result.confidence_score = Math.min(Number(result.confidence_score) || 0, 50);
    }

    return res.json(result);
  } catch (err) {
    console.error('[ai] analyze error:', err.message);
    return res.status(502).json({ message: 'AI analysis failed. Please try again.' });
  }
});

module.exports = router;
