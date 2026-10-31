/* ═══════════════════════════════════════════
   TANIXAI — SERVERLESS API PROXY
   Keys live here (server-side), never in the browser
   ═══════════════════════════════════════════ */

const ALLOWED_MIMES={
  'image/png':'png',
  'image/jpeg':'jpeg',
  'image/jpg':'jpg',
  'image/webp':'webp',
  'application/pdf':'pdf',
  'text/plain':'txt',
  'text/csv':'csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx'
};
const MAX_FILE_SIZE=10*1024*1024;

function validateFile(mime, size){
  if(!mime || !ALLOWED_MIMES[mime]) return 'File type not allowed';
  if(size && size>MAX_FILE_SIZE) return 'File too large (max 10MB)';
  return null;
}

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, text, b64, mime, history, system, model, temperature } = req.body;

  // Validate file upload — only when a file is actually attached
  if(mime || b64){
    const fileErr=validateFile(mime, b64?b64.length:0);
    if(fileErr) return res.status(400).json({ error: fileErr });
  }

  // Keys from Vercel Environment Variables — never exposed to browser
  const GROQ_KEY       = process.env.GROQ_API_KEY;
  const GEMINI_KEY     = process.env.GEMINI_API_KEY;
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

  try {
    let result = '';

    /* ── GROQ ── */
    if (provider === 'groq') {
      const msgs = (history || []).slice(-20).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text || ''
      }));
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + GROQ_KEY
        },
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: system }, ...msgs],
          max_tokens: 1024,
          temperature: temperature || 0.88
        })
      });
      if (!groqRes.ok) {
        const e = await groqRes.json().catch(() => ({}));
        throw new Error(e.error?.message || 'Groq HTTP ' + groqRes.status);
      }
      const groqData = await groqRes.json();
      result = groqData.choices?.[0]?.message?.content || '(No response)';

    /* ── GEMINI ── */
    } else if (provider === 'gemini') {
      const contents = [];
      for (const m of (history || []).slice(0, -1).slice(-20)) {
        const parts = [];
        if (m.text) parts.push({ text: m.text });
        if (m.b64) parts.push({ inline_data: { mime_type: m.mime, data: m.b64 } });
        if (parts.length) contents.push({ role: m.role === 'user' ? 'user' : 'model', parts });
      }
      const cur = [];
      if (text) cur.push({ text });
      if (b64) cur.push({ inline_data: { mime_type: mime, data: b64 } });
      contents.push({ role: 'user', parts: cur });

      const gemRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: system }] },
            contents,
            generationConfig: { temperature: 0.88, maxOutputTokens: 1024 }
          })
        }
      );
      if (!gemRes.ok) {
        const e = await gemRes.json().catch(() => ({}));
        throw new Error(e.error?.message || 'Gemini HTTP ' + gemRes.status);
      }
      const gemData = await gemRes.json();
      result = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '(No response received)';

    /* ── OPENROUTER ── */
    } else if (provider === 'openrouter') {
      const msgs = (history || []).slice(-20).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text || ''
      }));
      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENROUTER_KEY,
          'HTTP-Referer': 'https://tanixailive.vercel.app'
        },
        body: JSON.stringify({
          model: model || 'mistralai/mistral-7b-instruct',
          messages: [{ role: 'system', content: system }, ...msgs],
          max_tokens: 1024
        })
      });
      if (!orRes.ok) {
        const e = await orRes.json().catch(() => ({}));
        throw new Error(e.error?.message || 'OpenRouter HTTP ' + orRes.status);
      }
      const orData = await orRes.json();
      result = orData.choices?.[0]?.message?.content || '(No response)';

    } else {
      return res.status(400).json({ error: 'Unknown provider: ' + provider });
    }

    return res.status(200).json({ result });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
