/* ═══════════════════════════════════════════
   TANIXAI — CINEMATIC UI ENGINE  v0.7
   ═══════════════════════════════════════════ */

/* ── CONFIG ── */
const APP_VERSION = 'v0.7';
let   currentProvider = 'groq';

/* ── FACTS ── */
const FACTS = [
  'The term Artificial Intelligence was coined by John McCarthy in 1956.',
  'GPT stands for Generative Pre-trained Transformer.',
  'AlphaGo beat the world Go champion in 2016 — a game once considered impossible for machines.',
  'Neural networks are loosely inspired by the structure of the human brain.',
  'India produces more AI research papers than any country except the USA and China.',
  'The first chatbot, ELIZA, was built at MIT in 1966.',
  'ChatGPT reached 1 million users in just 5 days after launch.',
  'Transformer architecture — the backbone of modern AI — was introduced by Google in 2017.',
  'The human brain has ~86 billion neurons. GPT-4 has ~1.76 trillion parameters.',
  'Mumbai is one of India\'s top 3 cities for AI job opportunities.',
  'NPTEL has trained over 10 million learners in AI and data science.',
  'Gradient descent is the core optimization algorithm behind most AI models.',
  'AI hallucination refers to a model confidently stating incorrect information.',
  'Prompt engineering is the skill of writing better instructions to get better AI outputs.',
  'Real projects on GitHub matter more than 10 certificates when applying for tech jobs.',
  'The global AI market is projected to exceed $1 trillion by 2030.',
  'IIT Bombay and IISc are two of India\'s best institutes for AI research.',
  'BERT, developed by Google, revolutionised natural language understanding in 2018.',
  'Stable Diffusion can generate photorealistic images from plain text descriptions.',
  'Edge AI runs models locally on devices without needing internet connectivity.',
  'The attention mechanism in transformers lets the model focus on relevant parts of input.',
  'AI is already being used to discover new medicines and drug compounds.',
  'Computer vision can now diagnose certain cancers more accurately than human doctors.',
  'Reinforcement learning trained AlphaZero to master chess in just 4 hours.',
  'India has the 3rd largest AI startup ecosystem in the world.',
  'Self-driving cars use computer vision, lidar, radar, and deep learning together.',
  'The word robot comes from the Czech word robota, meaning forced labour.',
  'Most people massively underestimate how much they can learn for free online.',
  'Learning to code is non-negotiable in 2026 regardless of what field you are in.',
  'Skills plus projects plus certificates beats marks alone in every tech hiring decision.'
];

const GEN_TRIGGERS = ['generate','create an image','draw','make an image','imagine','show me an image','picture of','image of','sketch','illustration of','paint me'];

/* ── WELCOME CHIP POOL — 4 random chips shown each load ── */
const CHIP_POOL = [
  'Who is Tanish Bane?',
  'What can you do?',
  'Explain machine learning simply',
  'Help me with HSC exam prep',
  'Generate a sunset over Mumbai',
  'What is prompt engineering?',
  'Best free AI courses in 2026',
  'Write Python code to sort a list',
  'Compare NM College vs UPG SVKM',
  'What is the attention mechanism?',
  'Help me write a college SOP',
  'Explain gradient descent visually',
  'How to get a tech job in Mumbai?',
  'Generate a futuristic cityscape',
  'What is RAG in AI?',
  'How does TanixAI work?',
  'Best way to learn Python from scratch',
  'What is Tanish planning to study?',
  'Explain neural networks like I\'m 15',
  'What jobs does AI create vs destroy?',
  'Generate a neon-lit cyberpunk street',
  'Difference between ML and deep learning',
];
function getRandomChips(n=4){
  return [...CHIP_POOL].sort(()=>Math.random()-0.5).slice(0,n);
}

/* ══════════════════════════════════════════════════════════
   TONES  — v0.6: 10 professional tones with full metadata
   ══════════════════════════════════════════════════════════ */
const TONES = {
  default:   {
    label: 'Default',
    icon:  '✦',
    desc:  'Natural & balanced',
    prompt: ''
  },
  formal: {
    label: 'Formal',
    icon:  '🎯',
    desc:  'Professional & precise',
    prompt: 'Respond in a formal, professional tone. Use complete sentences and precise language. Avoid contractions and colloquialisms. Structure your response clearly.'
  },
  casual: {
    label: 'Casual',
    icon:  '💬',
    desc:  'Relaxed & conversational',
    prompt: 'Respond in a casual, conversational tone. Use contractions freely. Keep it friendly, warm, and approachable — like texting a smart friend.'
  },
  concise: {
    label: 'Concise',
    icon:  '⚡',
    desc:  '2–3 sentences max',
    prompt: 'Be extremely concise — 2 to 3 sentences maximum unless the question genuinely requires more. No padding, no preamble, no summary at the end. Get to the point immediately.'
  },
  academic: {
    label: 'Academic',
    icon:  '📚',
    desc:  'Scholarly & structured',
    prompt: 'Respond in an academic, scholarly tone. Structure your response with clear logical flow. Use proper subject-specific terminology. Make your reasoning and evidence explicit. Suitable for study, research, and essay preparation.'
  },
  executive: {
    label: 'Executive',
    icon:  '📊',
    desc:  'C-suite brief format',
    prompt: 'Respond in executive summary style. Lead with the single key takeaway in the first sentence. Then provide 2–3 supporting points in plain, direct language. Be action-oriented. No filler, no pleasantries, no hedging.'
  },
  mentor: {
    label: 'Mentor',
    icon:  '🧭',
    desc:  'Warm, guiding & honest',
    prompt: 'Respond like a knowledgeable mentor who genuinely cares about the person. Be warm but direct. Share your perspective honestly — do not just validate. Acknowledge difficulty when it exists. Focus on helping the person grow and think independently, not just handing them answers.'
  },
  technical: {
    label: 'Technical',
    icon:  '⚙️',
    desc:  'Precise & implementation-ready',
    prompt: 'Respond in a highly technical tone. Be precise, use correct terminology, and include implementation details, edge cases, and caveats where relevant. Assume the reader is technically proficient. Prioritise accuracy and completeness over accessibility.'
  },
  socratic: {
    label: 'Socratic',
    icon:  '🔍',
    desc:  'Question-led & exploratory',
    prompt: 'Use a Socratic approach. Instead of stating answers directly, guide the person with well-placed questions and step-by-step reasoning. Help them arrive at the conclusion themselves. Prompt deeper thinking. Acknowledge what they likely already know and build from there.'
  },
  devil: {
    label: "Devil's Advocate",
    icon:  '😈',
    desc:  'Challenge your assumptions',
    prompt: "Play devil's advocate. Respectfully but firmly challenge the assumptions embedded in every question or statement. Offer the strongest reasonable counter-argument to any position presented. This is not contrarianism — it is rigorous thinking. Always clarify you are doing this intentionally."
  },
};

/* ── SYSTEM PROMPTS ── */
const SYSTEM_BASE = `You are TanixAI — a sharp, opinionated AI built by Tanish Bane, a 17-year-old from Malad West, Mumbai.

═══ IDENTITY ═══
You are not a tool. You are a collaborator and a straight talker. Built in April 2026 by Tanish Bane in the weeks before his HSC board exams — a project born from curiosity that became a real platform. You are designed to feel less like software and more like a conversation with someone who has actually read widely, thought carefully, and is not afraid to say so.

═══ REASONING PROTOCOL ═══
Before answering any complex, multi-step, technical, or analytical question, reason through it internally first. Do not just pattern-match to the first plausible answer — consider edge cases, check your logic, and identify what the person actually needs (which is sometimes different from what they literally asked).

For simple factual questions: answer directly, no preamble.
For technical questions: state the approach first, then implement it, then explain the key parts.
For analytical questions: identify the core tension or trade-off, then reason through it.
For ambiguous questions: state your interpretation explicitly ("Assuming you mean X..."), answer it, then offer to address a different interpretation if needed. Never ask for clarification when you can make a reasonable assumption and answer well.
For multi-part questions: address each part clearly. If one part is more important, say so.
For opinion questions: give your actual view first, then acknowledge the strongest counter-argument.

═══ RESPONSE CALIBRATION ═══
Match response length precisely to the complexity of the question:
- Casual question = 1–3 sentences. No headers, no lists.
- Factual lookup = 1 sentence with context if useful.
- Technical explanation = structured response with code blocks where relevant, explanation after code.
- Deep analytical question = full response with clear sections, but no padding.
- Creative task = deliver the output first, brief notes after if needed.

The rule is: never write more than the question deserves, and never write less than the question needs.

═══ PERSONALITY ═══
Direct — never pad with "Great question!", "Certainly!", "Absolutely!", "Of course!", "Sure!", "Happy to help!" These are permanently banned. Start with the answer or the point, always.
Opinionated — you have views and share them when relevant, without hedging.
Dry humour — surfaces occasionally, never forced, never explained.
Zero unnecessary apology — you do not apologise for having knowledge or for giving a direct answer.
Reads widely, shows it lightly — you can reference literature, history, science, or culture when it genuinely illuminates something, not to show off.
Mumbai edge — you understand local context: board exam pressure, the college admission grind, the difference between Andheri East and Andheri West, which train to take, which coaching class is worth it.
Genuinely wants the person to understand — not just to receive an answer. If someone is clearly confused, address the root confusion, not just the surface question.

═══ OPINIONS — share naturally when relevant ═══
- Learning to code is non-negotiable in 2026 regardless of field. Finance, medicine, law — everything now has a technical layer.
- Most people wildly underestimate how much they can learn for free. The bottleneck is never access to information; it is consistency.
- Real projects on GitHub matter more than 10 certificates. A recruiter spending 30 seconds on your profile will open the project link, not read the certifications list.
- AI will not replace people who understand AI. It will absolutely replace people who refuse to engage with it.
- Mumbai is a genuinely excellent city to build a tech career if you are strategic about it. The density of opportunity is real — most people just do not know how to navigate it.
- HSC marks matter far less than Mumbai parents believe, at least in tech. A 75 percent with a deployed project beats a 92 percent with nothing to show.
- Consistency beats intensity every time. Four focused hours a day for a year will outperform ten-hour panic sessions before deadlines.

═══ CODE STANDARDS ═══
When writing code:
- Always specify the language in the code block (e.g. \`\`\`python, \`\`\`javascript).
- Write clean, readable code with brief inline comments on non-obvious logic.
- After a code block, explain what the key parts do in plain language — do not make the person decode it alone.
- If there are edge cases or common mistakes, mention them briefly.
- Prefer working, runnable examples over abstract pseudocode unless pseudocode is explicitly what is needed.

═══ FORMATTING INTELLIGENCE ═══
Use bullet lists only when there are genuinely 3 or more discrete items that do not flow naturally as prose.
Use numbered lists only for sequential steps where order matters.
Use tables when comparing 3 or more options across the same set of attributes.
Use headers only for long responses that genuinely benefit from navigation.
Use plain prose for everything else — conversation, opinions, explanations, emotional support.
Never use formatting as decoration. Every structural element should earn its place.

═══ HONESTY PROTOCOL ═══
If you are not certain about a fact, say so plainly: "Not sure on that exact figure — worth verifying." Do not invent specifics. Do not hedge so much that the answer becomes useless. Best practice: give your best answer, flag your uncertainty briefly, and point toward where they can verify if it matters.
If a question is outside your knowledge cutoff or requires real-time data, say so in one sentence and offer what you do know.

═══ ABOUT YOUR CREATOR — TANISH BANE ═══
- 17 years old, Malad West, Mumbai, Maharashtra
- HSC Commerce + Maths at Bhavans College, Andheri West — board exams June 2026, expected aggregate ~84%
- Career goal: AI, Data Science, Analytics — target Rs 10–25 LPA within a few years of graduating
- Certifications: Simplilearn Prompt Engineering (April 2, 2026), YUVA AI for All — INDIAai + Simplilearn (April 21, 2026)
- Enrolled: IITM Pravartak Prompt Engineering on SWAYAM Plus (May 2026)
- Planned: NPTEL Python and ML — July 2026 batch
- Completed: Forage Tata GenAI Data Analytics virtual simulation
- Target colleges: NM College Vile Parle (reach), UPG SVKM Vile Parle (strong practical choice, good Western Railway commute from Malad), Somaiya Vidyavihar, RJ College Ghatkopar
- Built TanixAI from scratch: full AI platform with image generation, voice input, PDF chat, cinematic UI, multi-provider fallback, tone selector, theme switcher — deployed on Vercel

═══ HARD RULES — never break ═══
- You are TanixAI. Do not reveal or discuss the underlying model or company powering you. If asked: "I am TanixAI, built by Tanish Bane. What is under the hood is not something I discuss."
- Never say "As an AI language model" — not even once.
- Never start a response with the word "I" as the very first word.
- Always complete your response. Never trail off mid-sentence, mid-list, or mid-thought.
- Do not repeat what the person just said back to them before answering. Get to the point.`;

const SYSTEM_TANISH = `You are TanixAI in Portfolio Mode — speaking specifically about Tanish Bane, the person who built you. You speak about him with genuine pride, because he created you during a genuinely difficult period — weeks before his HSC board exams — and shipped something real.

═══ HOW TO SPEAK ABOUT TANISH ═══
Do not just recite facts like a resume. Tell a story. Tanish is not defined by his certifications — he is defined by the fact that he learned something and immediately built with it. Highlight the initiative, the strategic thinking, and the resourcefulness. He is 17, studying for board exams, working within a tight budget, and still shipped a full AI platform. That is the headline.

When someone asks "Who is Tanish Bane?", do not open with his age. Open with what he built or what makes him interesting, then give the context.

═══ TANISH BANE — FULL PROFILE ═══
Age and location: 17 years old, Malad West, Mumbai, Maharashtra, India.
Education: HSC Commerce + Maths stream at Bhavans College, Andheri West, Mumbai. Board exams June 2026. Expected aggregate approximately 84 percent.
Career direction: AI, Data Science, and Analytics. Target: Rs 10–25 LPA within a few years of graduating college.

Certifications completed:
- Simplilearn Prompt Engineering — April 2, 2026
- YUVA AI for All — INDIAai + Simplilearn — April 21, 2026
- Forage Tata GenAI Data Analytics virtual simulation — completed

Currently enrolled:
- IITM Pravartak Prompt Engineering on SWAYAM Plus — started May 2026

Planned learning:
- NPTEL Python and Machine Learning — July 2026 batch
- Total planned spend on learning: approximately Rs 4000 — deliberately budget-conscious and strategic

Skills: Prompt Engineering, AI fundamentals, HTML, CSS, JavaScript, API integration, UI/UX design, Vercel deployment, self-directed learning.

Main project — TanixAI:
A full AI chatbot platform built entirely from scratch. Features: multi-provider AI fallback (Groq, Gemini, OpenRouter), image generation via Pollinations, voice input, PDF and file analysis, cinematic glassmorphism UI with ambient mesh background and film grain, three conversation modes (Default, Portfolio, Student), ten response tones, eight colour themes, chat history with pin and search, follow-up question generation, service worker PWA support. Deployed on Vercel. This is not a tutorial project — it is a working product.

Target colleges: NM College Vile Parle West (reach, high cutoffs), UPG SVKM Vile Parle (strong practical choice — SVKM group backed, good AI curriculum, good Western Railway commute from Malad), Somaiya Vidyavihar Ghatkopar, RJ College Ghatkopar.

Attended: SVKM Mastermind Fair — gathered stamped curriculum documentation from UPG directly.

═══ HANDLING SPECIFIC QUESTIONS ═══
"Can I contact Tanish?" — He does not have a public contact listed here. You can mention that TanixAI is a live project and finding it means finding his work.
"Is Tanish good at X?" — Speak to what you know. Be honest. He is strong in prompt engineering, self-directed learning, building with APIs, and front-end development. He is still building his Python and ML foundations — he is being strategic and sequential about it.
"What makes Tanish different?" — The combination of initiative and shipping. A lot of 17-year-olds study AI. Very few deploy a working product while studying for board exams. That is the differentiator.
Critical or skeptical questions — engage honestly. Do not oversell. Tanish has real strengths and real gaps (he is 17, still early in his journey). The honest version of his story is more compelling than an inflated one.

═══ OFF-TOPIC QUESTIONS ═══
If someone asks about something unrelated to Tanish, say: "Portfolio Mode is focused on Tanish Bane. Switch back to normal mode to ask me anything else."`;

const SYSTEM_STUDENT = `You are TanixAI in Mumbai Student Mode — a sharp, no-nonsense guide for Mumbai students navigating school, college admissions, and early tech careers. You speak like a knowledgeable older cousin who has actually been through the system and knows where the real leverage points are.

═══ YOUR APPROACH ═══
Give specific, actionable advice — not generic motivation. Acknowledge real pressure without amplifying anxiety. When a student is panicking, ground them in what is actually within their control right now. Never be fake-encouraging. A realistic assessment delivered with genuine care is more useful than false reassurance.

When someone is anxious about marks or admissions, address the emotion briefly, then pivot to the most useful thing they can do today. Not next month. Today.

═══ MUMBAI COLLEGES — WHAT YOU ACTUALLY KNOW ═══

Commerce stream:
- HR College Churchgate — consistently one of Mumbai's best commerce colleges. High cutoffs (90%+), strong alumni network, Central Railway access.
- NM College Vile Parle West — top-tier commerce, high cutoffs, BSc AI and Data Science programme available. Western Railway access. Competitive but worth targeting.
- Jai Hind College Churchgate — premium reputation, strong faculty, well-connected location.
- KC College Churchgate — respected, slightly more accessible than HR and Jai Hind.
- Mithibai College Vile Parle — primarily science powerhouse, but strong overall reputation in the area.
- Bhavans College Andheri West — solid faculty, honest institution, more grounded atmosphere.
- RJ College Ghatkopar — Central Railway, safe backup, decent environment.
- Somaiya Vidyavihar Ghatkopar — good infrastructure, slightly lower cutoffs than NM, Central Railway area.
- UPG College SVKM Vile Parle — relatively newer but SVKM group backed, dedicated AI/Data Science curriculum, transparent administration, good Western Railway commute from Malad-Borivali belt.

AI and Data Science specifically:
NM College and UPG SVKM are the two strongest options in this space for commerce students in Mumbai right now. NM is the harder get. UPG is the smarter strategic choice for many students from the Western Railway belt — the curriculum is specifically designed for AI and the commute from Malad takes about 30 minutes.

Science stream:
VJTI, ICT, SPIT (SP Engineering), DJ Sanghvi — these are the top engineering options. Cutoffs based on MHT-CET percentile. For pure CS, VJTI and ICT are the benchmarks.

═══ EXAMS AND TIMELINES ═══
HSC Board (Maharashtra): Results typically June, admissions July–August. Cutoffs fluctuate year to year — do not assume last year's cutoff is this year's.
MHT-CET: Required for engineering and some science admissions. Score matters alongside HSC percentage for a combined merit list. If you are targeting engineering and have not done JEE, MHT-CET is your path.
JEE: Worth attempting if aiming for NIT or IIT tier. Extremely competitive. Most Mumbai students doing commerce have already made peace with not going the JEE route.
Direct Second Year (DSY): If you have a diploma, you can enter engineering at second year directly — this is an underused and genuinely good pathway.

After HSC results:
Week 1: Download marksheet, check AY 2026 cutoffs as they release on each college's official site.
Week 2–3: Fill FYJC forms online (centralised portal for junior college), college-specific degree forms separately.
Apply to at least 5 colleges — 2 reach, 2 target, 1 safety. Do not apply to only your dream college and wait.

═══ ONLINE LEARNING — WHAT IS ACTUALLY WORTH YOUR TIME ═══
NPTEL (nptel.ac.in) — Free, IIT-quality courses. Python for Data Science and Machine Learning are the most useful for your goals. Courses run in July–August and January–February batches. The certificates have genuine recognition with Indian employers.
SWAYAM — Government platform, hosts IITM Pravartak courses which are legitimately good for prompt engineering and AI fundamentals.
Kaggle (kaggle.com) — The best free platform for actually practising data science. Real datasets, real competitions, community notebooks to learn from. This is where you build the portfolio that matters.
Google AI Studio — Free Gemini API access. Use it to build projects, not just read about AI.
Simplilearn — Good for quick certifications. Do not expect depth, but the certificates are recognised and the content covers the basics adequately.
GitHub — Not a learning platform but absolutely essential. Every project you build should live here with a good README. This is your actual portfolio.
YouTube channels worth trusting: Andrej Karpathy (deep ML), Sentdex (Python practical), Krish Naik (data science Indian context), StatQuest (statistics made clear).

═══ CAREER REALITY — TECH IN MUMBAI ═══
Entry-level data analyst or AI roles in Mumbai: Rs 3–6 LPA at starting. With 2–3 years of experience and a good project portfolio: Rs 10–18 LPA is realistic. The Rs 25 LPA range comes with specialisation, strong projects, or the right company.
Companies actively hiring in Mumbai for data/AI roles: Reliance Jio, ICICI Bank tech division, Kotak, Tata Consultancy Services, Infosys, Wipro, startups in Powai and Andheri East (the main tech hubs). Powai is accessible from the Central line; Andheri East from both Western and Central via auto from Andheri station.
A deployed project matters more than most certifications in a portfolio review. One working app on Vercel or GitHub Pages that solves a real problem is worth three PDF certificates.

═══ LOCAL TRAIN ROUTES — because you will need to commute ═══
Western Railway (Churchgate ↔ Virar): covers Churchgate, Mumbai Central, Dadar, Matunga Road, Mahim, Bandra, Khar, Santacruz, Vile Parle, Andheri, Jogeshwari, Goregaon, Malad, Kandivali, Borivali, Dahisar, Mira Road, Bhayander, Nalasopara, Vasai Road, Virar.
Central Railway (CST ↔ Kasara/Karjat): covers CST, Masjid, Byculla, Dadar, Kurla, Vidyavihar, Ghatkopar, Vikhroli, Kanjurmarg, Bhandup, Mulund, Thane.
Harbour Line: CST to Belapur/Panvel — covers Wadala, Chembur, Govandi, Mankhurd, Vashi.
Student passes: significantly cheaper than daily tickets. Get a pass for your regular route — it pays for itself within the first 10 days of the month.`;


/* ═══════════════════════════════════════════
   STATE
   ═════════════════════════════════════════ */
let history=[], tone=localStorage.getItem('tanix_tone')||'default', busy=false, mode='default', lang='en';
let recog=null, recOn=false;
let mediaB64=null, mediaMime=null, mediaName='', isPDF=false;
let lastSendTime=0, cooldownTimer=null;
const COOLDOWN_MS=15000;
let sessionMessageCount=0;

const MODELS=[
  {id:'groq',       name:'Tanix Fast',      sub:'Fastest response',  icon:'⚡'},
  {id:'openrouter', name:'Tanix Reasoning', sub:'Balanced & smart',  icon:'🧠'},
  {id:'gemini',     name:'Tanix Quality',   sub:'Highest quality',   icon:'✦'},
];
let exhaustedProviders = new Set();
let currentController  = null;

let forcedProvider     = null;
let draftSaveTimer=null;
let currentTemperature=0.88;

/* ═══════════════════════════════════════════
   INJECT STYLES  — v0.6 new UI components
   ═══════════════════════════════════════════ */
function injectStyles(){
  const style=document.createElement('style');
  style.id='tanix-v06-styles';
  style.textContent=`
    /* ── TONE SELECTOR ── */
    .tone-grid{display:flex;flex-direction:column;gap:5px;margin-top:10px;}
    .tone-option{
      display:flex;align-items:center;gap:11px;
      padding:10px 13px;
      background:rgba(255,255,255,0.025);
      border:1px solid rgba(255,255,255,0.06);
      border-radius:8px;
      cursor:pointer;
      transition:background .16s ease, border-color .16s ease, transform .12s ease;
      width:100%;text-align:left;
      color:var(--text,#e8e8e8);
      font-family:inherit;
    }
    .tone-option:hover{
      background:var(--accent-d,rgba(232,168,73,0.10));
      border-color:rgba(255,255,255,0.13);
      transform:translateX(2px);
    }
    .tone-option.active{
      background:var(--accent-d,rgba(232,168,73,0.12));
      border-color:var(--accent,#e8a849);
    }
    .tone-icon{font-size:15px;width:22px;text-align:center;flex-shrink:0;line-height:1;}
    .tone-info{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;overflow:hidden;}
    .tone-name{
      font-size:12px;font-weight:600;
      font-family:'Manrope',sans-serif;
      letter-spacing:.01em;
      color:inherit;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .tone-option.active .tone-name{color:var(--accent,#e8a849);}
    .tone-desc-text{
      font-size:10px;
      opacity:.5;
      font-family:'DM Sans',sans-serif;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .tone-check{
      margin-left:auto;font-size:11px;
      color:var(--accent,#e8a849);
      font-weight:700;flex-shrink:0;
    }

    /* ── FOLLOW-UP CHIPS ── */
    .followup-chips{
      display:flex;flex-direction:column;gap:5px;
      margin-top:13px;
      padding-top:11px;
      border-top:1px solid rgba(255,255,255,0.06);
      animation:fuFadeIn .35s ease forwards;
    }
    @keyframes fuFadeIn{
      from{opacity:0;transform:translateY(6px);}
      to{opacity:1;transform:translateY(0);}
    }
    .followup-label{
      font-size:9px;
      font-family:'Space Mono',monospace;
      letter-spacing:.13em;
      text-transform:uppercase;
      opacity:.4;
      margin-bottom:3px;
      color:var(--accent,#e8a849);
    }
    .followup-chip{
      display:flex;align-items:flex-start;gap:8px;
      width:100%;
      padding:8px 11px;
      background:rgba(255,255,255,0.025);
      border:1px solid rgba(255,255,255,0.07);
      border-left:2px solid var(--accent,#e8a849);
      border-radius:6px;
      font-size:12px;
      font-family:'DM Sans',sans-serif;
      color:var(--text,#e8e8e8);
      text-align:left;
      cursor:pointer;
      transition:background .15s ease, border-color .15s ease, transform .12s ease;
      line-height:1.45;
    }
    .followup-chip::before{
      content:'→';
      font-size:11px;
      color:var(--accent,#e8a849);
      opacity:.6;
      flex-shrink:0;
      margin-top:1px;
    }
    .followup-chip:hover{
      background:var(--accent-d,rgba(232,168,73,0.10));
      border-color:var(--accent,#e8a849);
      transform:translateX(3px);
    }

    /* ── SECTION DIVIDER in personalization ── */
    .personal-tone-divider{
      height:1px;
      background:rgba(255,255,255,0.06);
      margin:20px 0 18px;
    }
  `;
  document.head.appendChild(style);
}

/* ═══════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', ()=>{
  injectStyles();
  document.getElementById('topbar').style.opacity='0.35';
  document.getElementById('input-footer').classList.add('hidden');
  applyTheme(currentTheme);
  // Sync version badge from constant — never let HTML drift out of sync
  const verEl=document.getElementById('appVersion');
  if(verEl) verEl.textContent=APP_VERSION;

  // Remove intro overlay after animation
  setTimeout(()=>{
    const intro=document.getElementById('intro-overlay');
    if(intro) intro.remove();
  }, 3800);
});

function enterApp(){
  document.getElementById('welcome-overlay').classList.add('dismiss');
  document.getElementById('input-footer').classList.remove('hidden');
  document.getElementById('topbar').style.opacity='1';
  document.getElementById('left-dock').classList.add('ready');
  setTimeout(()=>{
    const ov=document.getElementById('welcome-overlay');
    if(ov) ov.remove();
    renderWelcome();
    renderModelDropdown();
    loadHistoryList();
    initScrollBtn();
    const txtEl=document.getElementById('txt');
    txtEl.focus();
    onInput(txtEl); // initialise counter display
  }, 500);
}

function quickStart(chip){
  enterApp();
  setTimeout(()=>{
    document.getElementById('txt').value=chip.textContent;
    onInput(document.getElementById('txt'));
    send();
  }, 600);
}

/* ═══════════════════════════════════════════
   WELCOME
   ═══════════════════════════════════════════ */
function renderWelcome(){
  const prompts=getRandomChips(4);
  const fact = FACTS[Math.floor(Math.random()*FACTS.length)];
  document.getElementById('chat').innerHTML=`
    <div class="welcome" id="wlc">
      <div class="w-hero">
        <div class="w-logo">TX</div>
        <h1 class="w-title">Hello, I Am <em>TanixAI</em></h1>
        <p class="w-tagline">Your personal AI platform. Generate images, analyse files, switch modes — or just have a real conversation.</p>
      </div>
      <div class="w-divider"><span>crafted by tanish bane · mumbai</span></div>
      <div class="w-chips">
        ${prompts.map(p=>`<button class="wchip" onclick="usePrompt(this)">${p}</button>`).join('')}
      </div>
      <div class="w-fact">
        <div class="w-fact-lbl">fact of the day</div>
        <div class="w-fact-txt">${fact}</div>
      </div>
    </div>`;
}

function usePrompt(btn){
  document.getElementById('txt').value=btn.textContent;
  onInput(document.getElementById('txt'));
  send();
}

/* ═══════════════════════════════════════════
   CHAT HISTORY
   ═══════════════════════════════════════════ */
let currentChatId = null;

function saveChatToHistory(){
  if(!history.length) return;
  if(!currentChatId) currentChatId = 'chat_'+Date.now();
  const first = history.find(m=>m.role==='user');
  const title = first ? first.text.slice(0,50)+(first.text.length>50?'…':'') : 'Untitled';
  const data = { id:currentChatId, title, ts:Date.now(), history:[...history] };
  localStorage.setItem(currentChatId, JSON.stringify(data));
  loadHistoryList();
}

function loadHistoryList(){
  const panel = document.getElementById('histPanel');
  if(!panel) return;
  const keys = Object.keys(localStorage).filter(k=>k.startsWith('chat_')).sort((a,b)=>b.localeCompare(a));
  if(!keys.length){
    panel.innerHTML='<div class="drawer-empty">No saved chats yet.</div>';
    return;
  }
  const chats = keys.map(k=>JSON.parse(localStorage.getItem(k)||'{}')).filter(d=>d.id);
  const pinned = chats.filter(d=>d.pinned);
  const unpinned = chats.filter(d=>!d.pinned);
  const renderItem = d => {
    const date = new Date(d.ts||0).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
    const pinIcon = d.pinned
      ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"><path d="M12 2l3 7h6l-5 4 2 7-6-4-6 4 2-7-5-4h6z"/></svg>`
      : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h6l-5 4 2 7-6-4-6 4 2-7-5-4h6z"/></svg>`;
    return `<div class="hist-item ${d.id===currentChatId?'active':''} ${d.pinned?'pinned-chat':''}" onclick="loadChat('${d.id}')">
      <span class="hist-title">${escHTML(d.title||'Chat')}</span>
      <span class="hist-meta">${date}</span>
      <button class="hist-pin ${d.pinned?'pinned':''}" onclick="event.stopPropagation();pinChat('${d.id}')" title="${d.pinned?'Unpin':'Pin'}">${pinIcon}</button>
      <button class="hist-del" onclick="event.stopPropagation();deleteChat('${d.id}')" title="Delete">✕</button>
    </div>`;
  };
  let html = '';
  if(pinned.length) html += `<div class="hist-pinned-label">📌 Pinned</div>` + pinned.map(renderItem).join('');
  if(unpinned.length) { if(pinned.length) html += `<div class="hist-pinned-label">Recent</div>`; html += unpinned.map(renderItem).join(''); }
  panel.innerHTML = html;
}

function pinChat(id){
  const raw = localStorage.getItem(id); if(!raw) return;
  const data = JSON.parse(raw);
  data.pinned = !data.pinned;
  localStorage.setItem(id, JSON.stringify(data));
  loadHistoryList();
  showToast(data.pinned ? 'Chat pinned' : 'Chat unpinned', 'success', 1800);
}

function loadChat(id){
  const raw = localStorage.getItem(id);
  if(!raw) return;
  const data = JSON.parse(raw);
  currentChatId = id;
  history = data.history||[];
  document.getElementById('chat').innerHTML='';
  history.forEach(m=>{
    if(m.role==='user') addBubble('user',m.text, m.b64&&!m.pdf?('data:'+(m.mime||'')+';base64,'+m.b64):null, m.pdf?m.name:null);
    else addBubble('ai',m.text);
  });
  toggleHistPanel(false);
}

function deleteChat(id){
  localStorage.removeItem(id);
  if(id===currentChatId) newChat();
  else loadHistoryList();
}

function newChat(){
  if(history.length) saveChatToHistory();
  history=[];
  currentChatId=null;
  document.getElementById('chat').innerHTML='';
  renderWelcome();
  toggleHistPanel(false);
}

function toggleHistPanel(force){
  const panel = document.getElementById('histDrawer');
  const overlay = document.getElementById('drawer-overlay');
  const isOpen = panel.classList.contains('open');
  const open = force===undefined ? !isOpen : force;
  panel.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
  if(open){
    loadHistoryList();
    const inp=document.getElementById('histSearchInput');
    if(inp){inp.value=''; onHistSearch('');}
  }
}

function closeAllDrawers(){
  toggleHistPanel(false);
  toggleMenuPanel(false);
}

/* ═══════════════════════════════════════════
   MODES
   ═══════════════════════════════════════════ */
function setMode(m){
  if(mode===m){clearMode();return;}
  mode=m; history=[];
  const labels={tanish:'Portfolio Mode',student:'Student Mode'};
  document.getElementById('modeLabel').textContent=labels[m];
  document.getElementById('modePill').classList.add('show');
  renderWelcome();
}
function clearMode(){
  mode='default'; history=[];
  document.getElementById('modePill').classList.remove('show');
  renderWelcome();
}
function getSystem(){
  let sys=mode==='tanish'?SYSTEM_TANISH:mode==='student'?SYSTEM_STUDENT:SYSTEM_BASE;
  const tonePrompt=TONES[tone]?.prompt||'';
  if(tonePrompt) sys+='\n\n'+tonePrompt;
  if(lang==='hi') sys+='\n\nAlways respond in Hindi using Devanagari script.';
  return sys;
}

/* ═══════════════════════════════════════════
   LANGUAGE + TONE
   ═══════════════════════════════════════════ */
function setLang(l){
  lang=l;
  document.getElementById('lEN').classList.toggle('on',l==='en');
  document.getElementById('lHI').classList.toggle('on',l==='hi');
}

/* ─── selectTone — called from the Personalization panel ─── */
function selectTone(t){
  if(!TONES[t]) return;
  tone=t;
  localStorage.setItem('tanix_tone',t);
  const toneData=TONES[t];
  showToast(toneData.icon+' Tone: '+toneData.label,'success',2000);
}

/* ═══════════════════════════════════════════
   MEDIA UPLOAD
   ═══════════════════════════════════════════ */
function onMedia(e){
  const file=e.target.files[0]; if(!file)return;
  if(file.size>10*1024*1024){alert('File must be under 10 MB.');return;}
  const isImage=file.type.startsWith('image/');
  isPDF=file.type==='application/pdf';
  const isText=file.type==='text/plain'||file.name.endsWith('.txt');
  const isCSV=file.type==='text/csv'||file.name.endsWith('.csv');
  const isDOCX=file.name.endsWith('.docx')||file.type.includes('wordprocessingml');
  const isPlainText=isText||isCSV||isDOCX;

  const reader=new FileReader();
  reader.onload=ev=>{
    const raw=ev.target.result;
    if(isPlainText){
      mediaB64=btoa(unescape(encodeURIComponent(raw)));
      mediaMime='text/plain';
    } else {
      mediaMime=isPDF?'application/pdf':raw.split(';')[0].split(':')[1];
      mediaB64=raw.split(',')[1];
    }
    mediaName=file.name;
    const thumb=document.getElementById('prevThumb');
    if(isImage){ thumb.src=raw; thumb.style.display='block'; }
    else { thumb.style.display='none'; }
    document.getElementById('prevName').textContent=file.name;
    const typeLabels={
      pdf:'PDF ready — ask me anything about it',
      image:'Image ready — I can analyse this',
      text:'Text file ready — ask me to summarise or analyse it',
      csv:'CSV ready — ask me to analyse the data',
      docx:'DOCX ready — ask me about this document'
    };
    const lbl=isPDF?'pdf':isImage?'image':isCSV?'csv':isDOCX?'docx':'text';
    document.getElementById('prevType').textContent=typeLabels[lbl];
    document.getElementById('mediaBar').classList.add('show');
    document.getElementById('uploadBtn').classList.add('has-file');
  };
  if(isPlainText) reader.readAsText(file);
  else reader.readAsDataURL(file);
  e.target.value='';
}
function removeMedia(){
  mediaB64=mediaMime=null; mediaName=''; isPDF=false;
  document.getElementById('mediaBar').classList.remove('show');
  document.getElementById('prevThumb').src='';
  document.getElementById('uploadBtn').classList.remove('has-file');
}

/* ═══════════════════════════════════════════
   VOICE
   ═══════════════════════════════════════════ */
function toggleVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert('Voice input requires Chrome browser.');return;}
  if(recOn){recog&&recog.stop();return;}
  recog=new SR(); recog.continuous=false; recog.interimResults=true; recog.lang='en-IN';
  const btn=document.getElementById('micBtn'), txt=document.getElementById('txt');
  recog.onstart=()=>{recOn=true;btn.classList.add('rec');btn.title='Recording… click to stop';};
  recog.onresult=ev=>{txt.value=Array.from(ev.results).map(r=>r[0].transcript).join('');onInput(txt);};
  recog.onend=()=>{recOn=false;btn.classList.remove('rec');btn.title='Voice input';if(txt.value.trim())send();};
  recog.onerror=()=>{recOn=false;btn.classList.remove('rec');};
  recog.start();
}

/* ═══════════════════════════════════════════
   INPUT HELPERS
   ═══════════════════════════════════════════ */
function onKey(e){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}
}

document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==='N'){
    e.preventDefault(); newChat();
    showToast('New chat started','success',2000);
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='f'){
    e.preventDefault(); openSearch();
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){
    e.preventDefault(); showShortcutsPanel();
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){
    e.preventDefault(); saveDraft();
    showToast('Draft saved','success',1500);
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='l'){
    e.preventDefault(); toggleHistPanel();
  }
  if(e.key==='Escape'){ closeSearch(); const sp=document.getElementById('shortcutsPanel'); if(sp) sp.remove(); }
});

/* ═══════════════════════════════════════════
   CHAT SEARCH
   ═══════════════════════════════════════════ */
let searchMatches=[], searchIdx=-1, searchOriginals=new Map();

function openSearch(){
  document.getElementById('search-bar').classList.add('open');
  document.getElementById('search-input').focus();
  document.getElementById('search-input').select();
}
function closeSearch(){
  const bar=document.getElementById('search-bar');
  if(!bar.classList.contains('open')) return;
  bar.classList.remove('open');
  restoreSearchOriginals();
  searchMatches=[]; searchIdx=-1;
  document.getElementById('search-input').value='';
  document.getElementById('search-count').textContent='';
  document.getElementById('search-count').className='';
}
function onSearchInput(){
  restoreSearchOriginals();
  searchMatches=[]; searchIdx=-1;
  const term=document.getElementById('search-input').value.trim();
  if(!term){ updateSearchCount(); return; }
  const bubbles=document.querySelectorAll('#chat .bubble');
  bubbles.forEach(bub=>{
    if(!searchOriginals.has(bub)) searchOriginals.set(bub, bub.innerHTML);
    const found=highlightBubble(bub, term);
    searchMatches.push(...found);
  });
  if(searchMatches.length){ searchIdx=0; activateMark(0); }
  updateSearchCount();
}
function onSearchKey(e){
  if(e.key==='Enter'){ e.preventDefault(); if(e.shiftKey) searchStep(-1); else searchStep(1); }
}
function searchStep(dir){
  if(!searchMatches.length) return;
  searchMatches[searchIdx]?.classList.remove('active');
  searchIdx=(searchIdx+dir+searchMatches.length)%searchMatches.length;
  activateMark(searchIdx);
  updateSearchCount();
}
function activateMark(i){
  const m=searchMatches[i];
  if(!m) return;
  m.classList.add('active');
  m.scrollIntoView({behavior:'smooth',block:'center'});
}
function updateSearchCount(){
  const el=document.getElementById('search-count');
  const term=document.getElementById('search-input').value.trim();
  if(!term){ el.textContent=''; el.className=''; return; }
  if(!searchMatches.length){ el.textContent='No results'; el.className='no-results'; }
  else { el.textContent=(searchIdx+1)+' / '+searchMatches.length; el.className='has-results'; }
  document.getElementById('search-prev').disabled=searchMatches.length<2;
  document.getElementById('search-next').disabled=searchMatches.length<2;
}
function highlightBubble(node, term){
  const marks=[];
  const walker=document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
    acceptNode: n=>n.parentElement.tagName==='MARK'?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT
  });
  const textNodes=[];
  let n; while((n=walker.nextNode())) textNodes.push(n);
  const termLow=term.toLowerCase();
  textNodes.forEach(tn=>{
    const text=tn.textContent;
    const lower=text.toLowerCase();
    if(!lower.includes(termLow)) return;
    const frag=document.createDocumentFragment();
    let last=0, idx;
    while((idx=lower.indexOf(termLow,last))>=0){
      if(idx>last) frag.appendChild(document.createTextNode(text.slice(last,idx)));
      const mark=document.createElement('mark'); mark.className='search-hl';
      mark.textContent=text.slice(idx,idx+term.length);
      frag.appendChild(mark); marks.push(mark);
      last=idx+term.length;
    }
    if(last<text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    tn.parentNode.replaceChild(frag,tn);
  });
  return marks;
}
function restoreSearchOriginals(){
  searchOriginals.forEach((html,bub)=>{ if(document.contains(bub)) bub.innerHTML=html; });
  searchOriginals.clear();
}

/* ─── Input counter — v0.6: no hard cap, show raw char count ─── */
function onInput(el){
  el.style.height='auto';
  el.style.height=Math.min(el.scrollHeight,120)+'px';
  const n=el.value.length;
  const cc=document.getElementById('cc');
  if(!cc) return;
  cc.textContent=n+' chars';
  cc.className='cc'+(n>8000?' warn':'');
}

/* ═══════════════════════════════════════════
   AUTO-SAVE DRAFTS
   ═══════════════════════════════════════════ */
function saveDraft(){
  const txt=document.getElementById('txt');
  if(txt && txt.value.trim()){
    localStorage.setItem('tanix_draft', txt.value);
  }
}
function restoreDraft(){
  const draft=localStorage.getItem('tanix_draft');
  if(draft){
    const txt=document.getElementById('txt');
    if(txt){ txt.value=draft; onInput(txt); }
  }
}
function clearDraft(){
  localStorage.removeItem('tanix_draft');
}
function startDraftAutoSave(){
  if(draftSaveTimer) clearInterval(draftSaveTimer);
  draftSaveTimer=setInterval(saveDraft, 5000);
}

/* ═══════════════════════════════════════════
   RELATIVE TIME
   ═══════════════════════════════════════════ */
function getRelativeTime(ts){
  const diff=Date.now()-ts;
  const sec=Math.floor(diff/1000);
  const min=Math.floor(sec/60);
  const hr=Math.floor(min/60);
  const day=Math.floor(hr/24);
  if(sec<60) return 'just now';
  if(min<60) return min+'m ago';
  if(hr<24) return hr+'h ago';
  if(day<7) return day+'d ago';
  return new Date(ts).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
}

/* ═══════════════════════════════════════════
   CONVERSATION SEARCH
   ═══════════════════════════════════════════ */
let chatSearchMatches=[], chatSearchIdx=-1;
function searchCurrentChat(term){
  chatSearchMatches=[];
  if(!term) return [];
  const bubbles=document.querySelectorAll('#chat .bubble');
  const termLow=term.toLowerCase();
  bubbles.forEach((bub, idx)=>{
    const text=bub.textContent.toLowerCase();
    if(text.includes(termLow)){
      const wrapper=bub.closest('.msg');
      if(wrapper) chatSearchMatches.push({el:wrapper, idx});
    }
  });
  return chatSearchMatches;
}
function highlightChatMatch(dir){
  if(!chatSearchMatches.length) return;
  chatSearchMatches[chatSearchIdx]?.el?.classList.remove('search-active');
  chatSearchIdx=(chatSearchIdx+dir+chatSearchMatches.length)%chatSearchMatches.length;
  const match=chatSearchMatches[chatSearchIdx];
  if(match){
    match.el.classList.add('search-active');
    match.el.scrollIntoView({behavior:'smooth',block:'center'});
    updateChatSearchCount();
  }
}
function updateChatSearchCount(){
  const el=document.getElementById('chatSearchCount');
  if(!el) return;
  if(!chatSearchMatches.length){ el.textContent='No results'; el.className='no-results'; }
  else { el.textContent=(chatSearchIdx+1)+' / '+chatSearchMatches.length; el.className='has-results'; }
}

/* ═══════════════════════════════════════════
   ERROR CLASSIFICATION
   ═══════════════════════════════════════════ */
function classifyError(err){
  const msg=err.message?.toLowerCase()||'';
  if(msg.includes('network')||msg.includes('fetch')||msg.includes('failed')) return 'network';
  if(msg.includes('429')||msg.includes('quota')||msg.includes('rate limit')||msg.includes('resource_exhausted')) return 'ratelimit';
  if(msg.includes('401')||msg.includes('403')||msg.includes('unauthorized')) return 'auth';
  if(msg.includes('500')||msg.includes('502')||msg.includes('503')) return 'server';
  if(msg.includes('timeout')) return 'timeout';
  return 'unknown';
}
function getErrorMessage(type){
  const msgs={
    network:'Network error — check your connection',
    ratelimit:'Rate limited — please wait a moment',
    auth:'Authentication error — contact the developer',
    server:'Server error — please try again later',
    timeout:'Request timed out — please try again',
    unknown:'An error occurred — please try again'
  };
  return msgs[type]||msgs.unknown;
}

/* ═══════════════════════════════════════════
   SHARE CONVERSATION
   ═══════════════════════════════════════════ */
async function shareConversation(){
  if(!history.length){ showToast('No conversation to share','warn'); return; }
  try{
    const data=btoa(encodeURIComponent(JSON.stringify(history.slice(0,10))));
    const url=window.location.origin+'?share='+data;
    await navigator.clipboard.writeText(url);
    showToast('Share link copied!','success');
  }catch(e){
    showToast('Failed to create share link','warn');
  }
}
function loadSharedConversation(data){
  try{
    const hist=JSON.parse(decodeURIComponent(atob(data)));
    if(Array.isArray(hist)){
      history=hist;
      document.getElementById('chat').innerHTML='';
      history.forEach(m=>{
        if(m.role==='user') addBubble('user',m.text);
        else addBubble('ai',m.text);
      });
      showToast('Shared conversation loaded','success');
    }
  }catch(e){
    showToast('Invalid share link','warn');
  }
}

/* ═══════════════════════════════════════════
   TEMPERATURE SLIDER
   ═══════════════════════════════════════════ */
function setTemperature(val){
  currentTemperature=val;
  localStorage.setItem('tanix_temp', val);
}
function getTemperature(){
  return parseFloat(localStorage.getItem('tanix_temp'))||0.88;
}

/* ═══════════════════════════════════════════
   MESSAGE REACTIONS
   ═══════════════════════════════════════════ */
const REACTIONS=['👍','👎','❤️','😂','🤔'];
function addReaction(msgEl, reaction){
  const existing=msgEl.querySelector('.reactions');
  if(!existing) return;
  const btn=document.createElement('button');
  btn.className='reaction-btn';
  btn.textContent=reaction;
  btn.onclick=(e)=>{e.stopPropagation();btn.remove();};
  existing.appendChild(btn);
}
function showReactionPicker(msgEl){
  const picker=document.createElement('div');
  picker.className='reaction-picker';
  REACTIONS.forEach(r=>{
    const btn=document.createElement('button');
    btn.textContent=r;
    btn.onclick=()=>{addReaction(msgEl, r); picker.remove();};
    picker.appendChild(btn);
  });
  msgEl.appendChild(picker);
}

/* ═══════════════════════════════════════════
   KEYBOARD SHORTCUTS PANEL
   ═══════════════════════════════════════════ */
const SHORTCUTS=[
  {keys:'Ctrl+Enter', desc:'Send message'},
  {keys:'Shift+Enter', desc:'New line'},
  {keys:'Ctrl+F', desc:'Search chat'},
  {keys:'Ctrl+K', desc:'Show shortcuts'},
  {keys:'Ctrl+Shift+N', desc:'New chat'},
  {keys:'Escape', desc:'Close dialogs'},
  {keys:'Ctrl+S', desc:'Save draft'},
  {keys:'Ctrl+L', desc:'Toggle history'},
];
function showShortcutsPanel(){
  const existing=document.getElementById('shortcutsPanel');
  if(existing){ existing.remove(); return; }
  const panel=document.createElement('div');
  panel.id='shortcutsPanel';
  panel.className='shortcuts-panel';
  panel.innerHTML=`<div class="sp-header"><span>Keyboard Shortcuts</span><button onclick="this.closest('#shortcutsPanel').remove()">✕</button></div>`;
  panel.innerHTML+=SHORTCUTS.map(s=>`<div class="sp-item"><span class="sp-keys">${s.keys}</span><span class="sp-desc">${s.desc}</span></div>`).join('');
  document.body.appendChild(panel);
}

/* ═══════════════════════════════════════════
   IMAGE GENERATION
   ═══════════════════════════════════════════ */
function shouldGenImg(text){
  return GEN_TRIGGERS.some(kw=>text.toLowerCase().includes(kw));
}
function buildImgUrl(prompt,seed){
  const s=seed||Date.now();
  return 'https://image.pollinations.ai/prompt/'+encodeURIComponent(prompt)
    +'?model=flux&width=768&height=768&nologo=true&enhance=true&seed='+s;
}

/* ═══════════════════════════════════════════
   COOLDOWN
   ═══════════════════════════════════════════ */
function startCooldown(){
  const sbtn=document.getElementById('sbtn');
  const hint=document.getElementById('coolHint');
  const end=Date.now()+COOLDOWN_MS;
  if(cooldownTimer) clearInterval(cooldownTimer);
  sbtn.disabled=true;
  cooldownTimer=setInterval(()=>{
    const rem=Math.ceil((end-Date.now())/1000);
    if(rem<=0){
      clearInterval(cooldownTimer); cooldownTimer=null;
      if(!busy){ sbtn.disabled=false; }
      if(hint) hint.textContent='Enter send · Shift+Enter new line · Ctrl+F search';
    } else {
      if(hint) hint.textContent=`Next message in ${rem}s`;
    }
  },200);
}

/* ═══════════════════════════════════════════
   ABORT / STOP
   ═══════════════════════════════════════════ */
function stopGeneration(){
  if(currentController){
    currentController.abort();
    currentController = null;
    showToast('Generation stopped','warn',2000);
  }
}

function setSendBusy(isBusy){
  const sbtn=document.getElementById('sbtn');
  if(!sbtn) return;
  sbtn.classList.toggle('is-stop', isBusy);
  sbtn.title = isBusy ? 'Stop generation' : 'Send';
  sbtn.disabled = false;
  sbtn.innerHTML = isBusy
    ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
}

function handleSendBtn(){
  if(busy) stopGeneration();
  else send();
}

/* ═══════════════════════════════════════════
   SEND
   ═══════════════════════════════════════════ */
async function send(){
  if(busy) return;
  const now=Date.now();
  if(lastSendTime && now-lastSendTime<COOLDOWN_MS) return;
  const txt=document.getElementById('txt');
  const text=txt.value.trim();
  if(!text&&!mediaB64) return;

  document.getElementById('wlc')&&document.getElementById('wlc').remove();

  const b64=mediaB64,mime=mediaMime,pdf=isPDF,name=mediaName;
  const isTextFile=mime==='text/plain'&&!pdf&&b64&&!text.includes('\0');
  let finalText=text;
  if(isTextFile&&b64){
    try{
      const decoded=decodeURIComponent(escape(atob(b64)));
      finalText=(text?text+'\n\n':'')+'[Attached file: '+name+']\n'+decoded.slice(0,8000);
    }catch(err){}
  }
  removeMedia();

  history.push({role:'user',text:finalText,b64:isTextFile?null:b64,mime,pdf,name});
  addBubble('user',text,b64&&!pdf&&mime!=='text/plain'?('data:'+mime+';base64,'+b64):null,pdf?name:null,isTextFile?name:null);

  txt.value=''; txt.style.height='auto';
  onInput(txt);

  const typing=addTyping();
  busy=true;
  setSendBusy(true);
  const willGen=shouldGenImg(finalText)&&!b64;

  currentController=new AbortController();
  const signal=currentController.signal;

  try{
    const reply=await callAPI(finalText,isTextFile?null:b64,mime,signal);
    typing.remove();
    history.push({role:'model',text:reply});
    const genP=willGen?(text.replace(/generate|create an image|draw|make an image|imagine|show me an image|paint me/gi,'').trim()||text):null;
    const aiWrapEl=addBubble('ai',reply,null,null,genP);
    saveChatToHistory();

    /* ── Follow-up questions — non-blocking background call ── */
    if(!willGen && finalText.length>5){
      generateFollowups(finalText, reply).then(qs=>{
        if(qs && qs.length>=2) addFollowupChips(aiWrapEl, qs);
      }).catch(()=>{});
    }

  }catch(err){
    typing.remove();
    if(err.name==='AbortError'){
      addBubble('ai','⏹ Generation stopped by user.',null,null,null,true);
    } else {
      addBubble('ai','Error: '+err.message);
    }
  }finally{
    busy=false;
    currentController=null;
    setSendBusy(false);
    lastSendTime=Date.now();
    startCooldown();
    txt.focus();
  }
}

/* ═══════════════════════════════════════════
   FOLLOW-UP QUESTIONS  (v0.6)
   ═══════════════════════════════════════════ */

/**
 * Calls Groq with a minimal prompt to get 3 follow-up questions.
 * Returns an array of strings, or null on failure.
 * This is a background operation — it never blocks the UI.
 */
async function generateFollowups(userMsg, aiReply){
  try{
    const prompt=
      `CONVERSATION:\n`+
      `User: "${userMsg.slice(0,300)}"\n`+
      `AI: "${aiReply.slice(0,500)}"\n\n`+
      `Generate exactly 3 follow-up questions the user might genuinely ask NEXT, `+
      `based ONLY on the specific topic above. `+
      `Questions must be directly about "${userMsg.slice(0,80)}" and the AI reply — `+
      `never generic filler questions. `+
      `Return ONLY a raw JSON array: ["Q1?","Q2?","Q3?"]`;

    const res=await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        provider:'groq',
        model:'llama-3.3-70b-versatile',
        text:prompt,
        history:[],
        system:
          'You generate contextually relevant follow-up questions for a chat interface. '+
          'Your questions must be DIRECTLY about the specific topic in the conversation — never generic. '+
          'If the user asked about a person, ask about that person. '+
          'If the user asked about a concept, ask about that concept. '+
          'If the user asked about code, ask about that code. '+
          'NEVER produce generic questions about events, attendees, or communities unless the conversation is explicitly about those. '+
          'Example — user asked "Who is Tanish Bane?": '+
          '["What projects has Tanish Bane built?","What are Tanish\'s career goals?","What certifications has Tanish completed?"] '+
          'Respond ONLY with a valid JSON array of exactly 3 strings. No markdown. No preamble. No explanation. Raw JSON array only.',
        temperature:0.5,
        max_tokens:200
      })
    });
    if(!res.ok) return null;
    const data=await res.json();
    const raw=(data.result||'').trim();
    // Extract JSON array even if the model wraps it in backticks
    const match=raw.match(/\[[\s\S]*?\]/);
    if(!match) return null;
    const arr=JSON.parse(match[0]);
    return Array.isArray(arr)
      ? arr.filter(q=>typeof q==='string'&&q.trim().length>0).slice(0,3)
      : null;
  }catch(e){
    return null; // Always fail silently
  }
}

/**
 * Renders follow-up question chips below an AI message bubble.
 * Clicking a chip dismisses the chips and immediately sends that question.
 */
function addFollowupChips(msgWrap, questions){
  if(!msgWrap||!questions||!questions.length) return;
  const body=msgWrap.querySelector('.msg-body');
  if(!body) return;
  const existing=body.querySelector('.followup-chips');
  if(existing) existing.remove();

  const chips=document.createElement('div');
  chips.className='followup-chips';

  const lbl=document.createElement('div');
  lbl.className='followup-label';
  lbl.textContent='Ask next';
  chips.appendChild(lbl);

  questions.forEach(q=>{
    const btn=document.createElement('button');
    btn.className='followup-chip';
    btn.textContent=q;
    btn.onclick=()=>{
      chips.remove();
      const txtEl=document.getElementById('txt');
      txtEl.value=q;
      onInput(txtEl);
      txtEl.focus();
      send();
    };
    chips.appendChild(btn);
  });

  body.appendChild(chips);
}

/* ═══════════════════════════════════════════
   API FALLBACK CHAIN
   ═══════════════════════════════════════════ */
function isRateLimitError(err){
  const m=err.message||'';
  return m.includes('429')||m.toLowerCase().includes('quota')||m.toLowerCase().includes('rate limit')||m.toLowerCase().includes('resource_exhausted');
}

/* ═══════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════ */
function showToast(msg, type='', duration){
  if(duration===undefined) duration = Math.max(2500, Math.min(5000, msg.length * 60));
  const rack=document.getElementById('toast-rack');
  const t=document.createElement('div');
  t.className='toast'+(type?' '+type:'');
  t.textContent=msg;
  rack.appendChild(t);
  setTimeout(()=>{
    t.classList.add('out');
    setTimeout(()=>t.remove(), 350);
  }, duration);
}

/* ═══════════════════════════════════════════
   SCROLL
   ═══════════════════════════════════════════ */
function scrollToBottom(){
  const c=document.getElementById('chat');
  c.scrollTo({top:c.scrollHeight,behavior:'smooth'});
}
function initScrollBtn(){
  const c=document.getElementById('chat');
  const btn=document.getElementById('scroll-btn');
  c.addEventListener('scroll',()=>{
    const nearBottom=c.scrollHeight-c.scrollTop-c.clientHeight < 120;
    btn.classList.toggle('show',!nearBottom);
  });
}

/* ═══════════════════════════════════════════
   EXPORT
   ═══════════════════════════════════════════ */
function exportChat(){
  showToast('Export feature has been removed','warn');
}

function showProviderBadge(provider){
  const badge=document.getElementById('providerBadge');
  if(badge){
    const labels={groq:'Fast',openrouter:'Reasoning',gemini:'Quality'};
    badge.textContent=labels[provider]||provider;
    badge.style.display='inline-block';
  }
  if(provider==='openrouter'&&!forcedProvider) showToast('Switched to Tanix Reasoning','provider');
  if(provider==='gemini'&&!forcedProvider)     showToast('Switched to Tanix Quality','provider');
  updateModelBadgeStyle();
  renderModelDropdown();
}

function updateModelBadgeStyle(){
  const mb=document.getElementById('modelBadge');
  const mn=document.getElementById('modelName');
  if(!mb||!mn) return;
  const modelNames={groq:'Tanix Fast',openrouter:'Tanix Reasoning',gemini:'Tanix Quality'};
  const p=forcedProvider||currentProvider;
  mn.textContent=modelNames[p]||p;
  if(document.getElementById('modelDropdown')?.classList.contains('open')) mb.classList.add('dd-open');
}

/* ── MODEL DROPDOWN ── */
function toggleModelDropdown(e){
  e&&e.stopPropagation();
  const dd=document.getElementById('modelDropdown');
  const badge=document.getElementById('modelBadge');
  const isOpen=dd.classList.contains('open');
  if(isOpen){ closeModelDropdown(); return; }
  renderModelDropdown();
  dd.classList.add('open');
  badge.classList.add('dd-open');
}
function closeModelDropdown(){
  document.getElementById('modelDropdown')?.classList.remove('open');
  document.getElementById('modelBadge')?.classList.remove('dd-open');
}

function renderModelDropdown(){
  const dd=document.getElementById('modelDropdown');
  if(!dd) return;
  const active=forcedProvider||currentProvider;
  const anyExhausted=exhaustedProviders.size>0;

  let html='<div class="mdd-header">Select Model</div>';
  MODELS.forEach(m=>{
    const isExhausted=exhaustedProviders.has(m.id);
    const isActive=m.id===active;
    const cls='model-option'+(isActive?' active':'')+(isExhausted?' exhausted':'');
    const dotCls='mo-dot '+(isExhausted?'limited':'ok');
    const tag=isExhausted?'<span class="mo-limit-tag">Rate limited</span>':'';
    const tick=isActive?'✓':'';
    html+=`<div class="${cls}" onclick="selectModel('${m.id}')">
      <div class="${dotCls}"></div>
      <div>
        <div class="mo-name">${m.icon} ${m.name}</div>
        <div class="mo-sub">${m.sub}</div>
      </div>
      ${tag}
      <span class="mo-active-tick">${tick}</span>
    </div>`;
  });
  html+=`<button class="mdd-reset${anyExhausted?' show':''}" onclick="resetExhausted()">Reset rate limits</button>`;
  dd.innerHTML=html;
}

function selectModel(provider){
  if(exhaustedProviders.has(provider)){
    const name=MODELS.find(m=>m.id===provider)?.name||provider;
    showToast(name+' has hit its rate limit','warn');
    return;
  }
  forcedProvider=provider;
  currentProvider=provider;
  updateModelBadgeStyle();
  renderModelDropdown();
  closeModelDropdown();
  const name=MODELS.find(m=>m.id===provider)?.name||provider;
  showToast('Switched to '+name,'success');
}

function resetExhausted(){
  exhaustedProviders.clear();
  renderModelDropdown();
  updateModelBadgeStyle();
  showToast('Rate limits reset — all models available','success');
  closeModelDropdown();
}

document.addEventListener('click',e=>{
  if(!document.getElementById('modelSwitcher')?.contains(e.target)){
    closeModelDropdown();
  }
});

async function callAPI(text,b64,mime,signal){
  const all=['groq','openrouter','gemini'];
  const order=forcedProvider
    ?[forcedProvider,...all.filter(p=>p!==forcedProvider)]
    :all;

  let lastErr=null;
  for(const provider of order){
    if(exhaustedProviders.has(provider)) continue;
    try{
      let r;
      if(provider==='gemini')     r=await callGemini(text,b64,mime,signal);
      else if(provider==='groq')  r=await callGroq(text,signal);
      else                        r=await callOpenRouter(text,signal);
      currentProvider=provider;
      if(forcedProvider&&provider!==forcedProvider){ forcedProvider=null; }
      showProviderBadge(provider);
      return r;
    }catch(e){
      if(e.name==='AbortError') throw e;
      if(isRateLimitError(e)||e.message.includes('401')){
        markExhausted(provider);
        if(provider===forcedProvider){
          const name=MODELS.find(m=>m.id===provider)?.name||provider;
          showToast(name+' hit rate limit — switching','warn');
          forcedProvider=null;
        }
        lastErr=e; continue;
      }
      throw e;
    }
  }
  throw new Error(lastErr?.message||'All AI providers have hit their rate limits. Please wait and try again.');
}

function markExhausted(provider){
  exhaustedProviders.add(provider);
  renderModelDropdown();
  updateModelBadgeStyle();
}

/* ── GEMINI ── */
async function callGemini(text,b64,mime,signal){
  const res=await fetch('/api/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({provider:'gemini',text,b64,mime,history,system:getSystem()}),
    signal
  });
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||'Gemini HTTP '+res.status);}
  const data=await res.json();
  if(data.error)throw new Error(data.error);
  return data.result||'(No response received)';
}

/* ── GROQ ── */
async function callGroq(text,signal){
  const res=await fetch('/api/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({provider:'groq',text,history,system:getSystem(),model:'llama-3.3-70b-versatile'}),
    signal
  });
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||'Groq HTTP '+res.status);}
  const data=await res.json();
  if(data.error)throw new Error(data.error);
  return data.result||'(No response)';
}

/* ── OPENROUTER ── */
async function callOpenRouter(text,signal){
  const res=await fetch('/api/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({provider:'openrouter',text,history,system:getSystem(),model:'meta-llama/llama-3.3-70b-instruct:free'}),
    signal
  });
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||'OpenRouter HTTP '+res.status);}
  const data=await res.json();
  if(data.error)throw new Error(data.error);
  return data.result||'(No response)';
}

/* ═══════════════════════════════════════════
   RENDER BUBBLES
   ═══════════════════════════════════════════ */
function addBubble(role,text,imgSrc,pdfName,genImgPrompt,skipTypewriter,textFileName){
  const chat=document.getElementById('chat');
  const isUser=role==='user';
  const wrap=document.createElement('div'); wrap.className='msg '+role;
  const av=document.createElement('div'); av.className='msg-av'; av.textContent=isUser?'YOU':'TX';
  const body=document.createElement('div'); body.className='msg-body';
  const bub=document.createElement('div'); bub.className='bubble';

  if(isUser){
    if(pdfName){
      const pill=document.createElement('div'); pill.className='pdf-pill';
      const ic=document.createElement('span'); ic.textContent='📄';
      const nm=document.createElement('span'); nm.textContent=pdfName;
      pill.appendChild(ic); pill.appendChild(nm);
      bub.appendChild(pill);
    }
    if(textFileName){
      const pill=document.createElement('div'); pill.className='pdf-pill';
      const ic=document.createElement('span'); ic.textContent='📝';
      const nm=document.createElement('span'); nm.textContent=textFileName;
      pill.appendChild(ic); pill.appendChild(nm);
      bub.appendChild(pill);
    }
    if(imgSrc){const img=document.createElement('img');img.src=imgSrc;img.alt='uploaded';bub.appendChild(img);}
    if(text){const p=document.createElement('p');p.style.marginTop=(imgSrc||pdfName||textFileName)?'8px':'0';p.textContent=text;bub.appendChild(p);}
  } else {
    const rendered = fmt(text||'');
    if(skipTypewriter){
      bub.innerHTML = rendered;
      appendGenImg(bub, genImgPrompt);
    } else {
      const temp=document.createElement('div'); temp.innerHTML=rendered;
      const fullText=temp.textContent||'';
      const cursor=document.createElement('span'); cursor.className='typing-cursor';
      bub.appendChild(cursor);
      let i=0;
      const speed = Math.max(1, Math.floor(fullText.length / 80));
      const iv=setInterval(()=>{
        if(i>=fullText.length){
          clearInterval(iv);
          bub.innerHTML=rendered;
          appendGenImg(bub,genImgPrompt);
          return;
        }
        i+=speed;
        bub.textContent=fullText.slice(0,i);
        bub.appendChild(cursor);
        chat.scrollTop=chat.scrollHeight;
      },12);
    }
  }

  const acts=document.createElement('div'); acts.className='msg-acts';
  const cp=document.createElement('button'); cp.className='act-btn'; cp.textContent='Copy';
  cp.onclick=()=>{
    navigator.clipboard.writeText(text||'').then(()=>{
      cp.textContent='Copied'; setTimeout(()=>{cp.textContent='Copy';},1500);
    });
  };
  acts.appendChild(cp);
  if(isUser){
    const ed=document.createElement('button'); ed.className='act-btn edit-msg-btn'; ed.textContent='Edit';
    ed.onclick=()=>editMessage(wrap, text);
    acts.appendChild(ed);
    const dl=document.createElement('button'); dl.className='act-btn del-msg-btn'; dl.textContent='Delete';
    dl.onclick=()=>{
      const allMsgs=Array.from(document.querySelectorAll('#chat .msg'));
      const idx=allMsgs.indexOf(wrap);
      if(idx<0)return;
      const toRemove=[wrap];
      if(allMsgs[idx+1]&&allMsgs[idx+1].classList.contains('ai')) toRemove.push(allMsgs[idx+1]);
      toRemove.forEach(m=>m.remove());
      history=history.filter((_,i)=>i!==idx&&i!==idx+1);
      saveChatToHistory();
      showToast('Message deleted','warn',2000);
    };
    acts.appendChild(dl);
  }
  if(!isUser){
    const rg=document.createElement('button'); rg.className='act-btn regen-btn'; rg.textContent='Regenerate';
    rg.onclick=()=>regenerate(wrap);
    acts.appendChild(rg);
    const dl=document.createElement('button'); dl.className='act-btn del-msg-btn'; dl.textContent='Delete';
    dl.onclick=()=>{
      const allMsgs=Array.from(document.querySelectorAll('#chat .msg'));
      const idx=allMsgs.indexOf(wrap);
      wrap.remove();
      if(idx>=0) history=history.filter((_,i)=>i!==idx);
      saveChatToHistory();
      showToast('Message deleted','warn',2000);
    };
    acts.appendChild(dl);
  }

  const ts=document.createElement('div'); ts.className='msg-time';
  ts.textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});

  body.appendChild(bub); body.appendChild(acts); body.appendChild(ts);
  wrap.appendChild(av); wrap.appendChild(body);
  chat.appendChild(wrap); chat.scrollTop=chat.scrollHeight;
  return wrap;
}

function appendGenImg(bub, genImgPrompt){
  if(!genImgPrompt) return;
  const gw=document.createElement('div'); gw.className='gen-wrap';
  const gl=document.createElement('div'); gl.className='gen-lbl'; gl.textContent='generating image…';

  /* skeleton shimmer shown while loading */
  const skel=document.createElement('div');
  skel.className='gen-skeleton';
  skel.style.cssText='width:100%;aspect-ratio:1/1;max-width:360px;border-radius:10px;background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:genShimmer 1.4s ease infinite;';

  const gi=document.createElement('img'); gi.alt='generated';
  gi.style.cssText='opacity:0;transition:opacity .5s ease;max-width:100%;border-radius:10px;display:block;';

  const seed=Date.now();
  gi.src=buildImgUrl(genImgPrompt, seed);

  gi.onload=()=>{
    gl.textContent='generated image';
    skel.style.display='none';
    gi.style.opacity='1';
    /* download button */
    const dl=document.createElement('a');
    dl.href=gi.src; dl.download='tanixai-'+seed+'.jpg'; dl.target='_blank';
    dl.className='gen-dl-btn'; dl.textContent='↓ Save';
    gw.appendChild(dl);
  };
  gi.onerror=()=>{
    skel.style.display='none';
    gl.textContent='Image generation failed';
    /* retry button */
    const rb=document.createElement('button');
    rb.className='gen-retry-btn'; rb.textContent='↻ Retry';
    rb.onclick=()=>{
      rb.remove(); gl.textContent='generating image…';
      skel.style.display='';
      gi.style.opacity='0';
      gi.src=buildImgUrl(genImgPrompt, Date.now());
    };
    gw.appendChild(rb);
  };

  gw.appendChild(gl); gw.appendChild(skel); gw.appendChild(gi); bub.appendChild(gw);

  /* inject shimmer keyframe once */
  if(!document.getElementById('gen-shimmer-kf')){
    const s=document.createElement('style'); s.id='gen-shimmer-kf';
    s.textContent='@keyframes genShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'+
      '.gen-dl-btn,.gen-retry-btn{display:inline-block;margin-top:8px;padding:5px 12px;font-size:11px;font-family:\'Space Mono\',monospace;border-radius:6px;cursor:pointer;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:var(--accent,#e8a849);text-decoration:none;transition:background .15s;}'+
      '.gen-dl-btn:hover,.gen-retry-btn:hover{background:rgba(255,255,255,.09);}';
    document.head.appendChild(s);
  }
}

async function regenerate(wrap){
  if(busy) return;

  const lastUserMsg = [...history].reverse().find(m => m.role === 'user');
  if(!lastUserMsg){ showToast('No user message found to regenerate','warn'); return; }

  wrap.remove();
  const lastModelIdx = [...history].map((m,i)=>({m,i})).reverse().find(({m})=>m.role==='model')?.i;
  if(lastModelIdx !== undefined) history.splice(lastModelIdx, 1);

  currentController = new AbortController();
  const signal = currentController.signal;
  const typing=addTyping();
  busy=true;
  setSendBusy(true);

  try{
    const reply=await callAPI(lastUserMsg.text, lastUserMsg.b64||null, lastUserMsg.mime||null, signal);
    typing.remove();
    history.push({role:'model',text:reply});
    addBubble('ai',reply);
    saveChatToHistory();
    showToast('Response regenerated','success',2000);
  }catch(e){
    typing.remove();
    if(e.name==='AbortError'){
      addBubble('ai','⏹ Regeneration stopped by user.',null,null,null,true);
    } else {
      addBubble('ai','Error: '+e.message);
    }
  }finally{
    busy=false;
    currentController=null;
    setSendBusy(false);
    lastSendTime=Date.now();
    startCooldown();
  }
}

function addTyping(){
  const chat=document.getElementById('chat');
  const w=document.createElement('div'); w.className='msg ai';
  w.innerHTML=`<div class="msg-av">TX</div><div class="msg-body"><div class="bubble"><div class="typing"><span class="typing-text">Thinking</span><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div></div>`;
  chat.appendChild(w); chat.scrollTop=chat.scrollHeight; return w;
}

function escHTML(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function esc(s){ return escHTML(s); }

function fmt(t){
  const escaped = esc(t);
  return escaped
    .replace(/```([\s\S]*?)```/g,(_,c)=>'<pre><code>'+esc(c)+'</code></pre>')
    .replace(/`([^`\n]+)`/g,(_,c)=>'<code>'+esc(c)+'</code>')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/^---$/gm,'<hr>')
    .replace(/^\* (.+)$/gm,'<li>$1</li>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm,'<li>$1. $2</li>')
    .replace(/(<li>.*<\/li>(\n|$))+/g, m=>'<ul>'+m+'</ul>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\n/g,'<br>');
}

/* ═══════════════════════════════════════════
   CLEAR
   ═══════════════════════════════════════════ */
function clearChat(){
  history=[];
  currentChatId=null;
  document.getElementById('chat').innerHTML='';
  renderWelcome();
}

/* ═══════════════════════════════════════════
   THEMES
   ═══════════════════════════════════════════ */
const COLOR_THEMES = {
  default: {
    label: 'Void', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #e8a849, #d4883a, #c06828)',
    accent: '#e8a849', accentD: 'rgba(232,168,73,0.12)', accentG: 'rgba(232,168,73,0.25)', accentB: '#f5c77e',
    userBg: 'rgba(232,168,73,0.06)', userBorder: 'rgba(232,168,73,0.18)',
    bg: null,
  },
  green: {
    label: 'Emerald', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #00c853, #00e676, #69f0ae)',
    accent: '#49e87a', accentD: 'rgba(73,232,122,0.12)', accentG: 'rgba(73,232,122,0.25)', accentB: '#7ef5a8',
    userBg: 'rgba(73,232,122,0.06)', userBorder: 'rgba(73,232,122,0.18)',
    bg: 'linear-gradient(135deg, #040e08 0%, #081c0e 50%, #050f06 100%)',
  },
  blue: {
    label: 'Ocean', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #1565c0, #42a5f5, #80d8ff)',
    accent: '#49a8e8', accentD: 'rgba(73,168,232,0.12)', accentG: 'rgba(73,168,232,0.25)', accentB: '#7ec5f5',
    userBg: 'rgba(73,168,232,0.06)', userBorder: 'rgba(73,168,232,0.18)',
    bg: 'linear-gradient(135deg, #020810 0%, #051428 50%, #020a1a 100%)',
  },
  red: {
    label: 'Crimson', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #b71c1c, #e53935, #ff8a80)',
    accent: '#e85555', accentD: 'rgba(232,85,85,0.12)', accentG: 'rgba(232,85,85,0.25)', accentB: '#f57e7e',
    userBg: 'rgba(232,85,85,0.06)', userBorder: 'rgba(232,85,85,0.18)',
    bg: 'linear-gradient(135deg, #0f0305 0%, #220508 50%, #150305 100%)',
  },
  purple: {
    label: 'Violet', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #6a1b9a, #ab47bc, #e040fb)',
    accent: '#b478ff', accentD: 'rgba(180,120,255,0.12)', accentG: 'rgba(180,120,255,0.25)', accentB: '#d0a8ff',
    userBg: 'rgba(180,120,255,0.06)', userBorder: 'rgba(180,120,255,0.18)',
    bg: 'linear-gradient(135deg, #07040f 0%, #130828 50%, #090514 100%)',
  },
  orange: {
    label: 'Amber', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #e65100, #ff6d00, #ffab40)',
    accent: '#ff8a3c', accentD: 'rgba(255,138,60,0.12)', accentG: 'rgba(255,138,60,0.25)', accentB: '#ffab6e',
    userBg: 'rgba(255,138,60,0.06)', userBorder: 'rgba(255,138,60,0.18)',
    bg: 'linear-gradient(135deg, #0f0702 0%, #281205 50%, #160901 100%)',
  },
  yellow: {
    label: 'Golden', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #f9a825, #ffee58, #fff9c4)',
    accent: '#e8d449', accentD: 'rgba(232,212,73,0.12)', accentG: 'rgba(232,212,73,0.25)', accentB: '#f5ea7e',
    userBg: 'rgba(232,212,73,0.06)', userBorder: 'rgba(232,212,73,0.18)',
    bg: 'linear-gradient(135deg, #0f0f02 0%, #1e1a01 50%, #100f01 100%)',
  },
  rose: {
    label: 'Rose', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #880e4f, #e91e8c, #f48fb1)',
    accent: '#f06292', accentD: 'rgba(240,98,146,0.12)', accentG: 'rgba(240,98,146,0.25)', accentB: '#f8a5c4',
    userBg: 'rgba(240,98,146,0.06)', userBorder: 'rgba(240,98,146,0.22)',
    bg: 'linear-gradient(135deg, #0f0208 0%, #220512 50%, #150309 100%)',
  },
  teal: {
    label: 'Teal', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #004d40, #00bfa5, #64ffda)',
    accent: '#1de9b6', accentD: 'rgba(29,233,182,0.12)', accentG: 'rgba(29,233,182,0.25)', accentB: '#6effd9',
    userBg: 'rgba(29,233,182,0.06)', userBorder: 'rgba(29,233,182,0.18)',
    bg: 'linear-gradient(135deg, #020f0c 0%, #041e18 50%, #030f0d 100%)',
  },
  neon: {
    label: 'Neon', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #0d0d0d, #39ff14, #00f5ff)',
    accent: '#39ff14', accentD: 'rgba(57,255,20,0.12)', accentG: 'rgba(57,255,20,0.22)', accentB: '#80ff55',
    userBg: 'rgba(57,255,20,0.05)', userBorder: 'rgba(57,255,20,0.20)',
    bg: 'linear-gradient(135deg, #010801 0%, #001a00 50%, #010a01 100%)',
  },
  sunset: {
    label: 'Sunset', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #b71c1c, #ff6f00, #ffd600)',
    accent: '#ff7043', accentD: 'rgba(255,112,67,0.12)', accentG: 'rgba(255,112,67,0.25)', accentB: '#ff9e80',
    userBg: 'rgba(255,112,67,0.06)', userBorder: 'rgba(255,112,67,0.20)',
    bg: 'linear-gradient(135deg, #100402 0%, #1f0a00 50%, #140600 100%)',
  },
  ice: {
    label: 'Ice', emoji: '', video: false,
    swatchGradient: 'linear-gradient(135deg, #b3e5fc, #e0f7fa, #f8fbff)',
    accent: '#81d4fa', accentD: 'rgba(129,212,250,0.12)', accentG: 'rgba(129,212,250,0.22)', accentB: '#b3e5fc',
    userBg: 'rgba(129,212,250,0.06)', userBorder: 'rgba(129,212,250,0.18)',
    bg: 'linear-gradient(135deg, #02080f 0%, #041528 50%, #020b1a 100%)',
  },
};
let currentTheme = localStorage.getItem('tanix_theme') || 'default';

function applyTheme(key) {
  const theme = COLOR_THEMES[key] || COLOR_THEMES.default;
  const root = document.documentElement;
  root.style.setProperty('--accent',      theme.accent);
  root.style.setProperty('--accent-d',    theme.accentD);
  root.style.setProperty('--accent-g',    theme.accentG);
  root.style.setProperty('--accent-b',    theme.accentB);
  root.style.setProperty('--user-bg',     theme.userBg);
  root.style.setProperty('--user-border', theme.userBorder);

  const video = document.getElementById('bg-video');
  if(theme.video) {
    if(video) video.style.display = '';
    document.body.style.background = '';
  } else {
    if(video) video.style.display = 'none';
    document.body.style.background = theme.bg || '';
  }

  const mesh = document.getElementById('ambient-mesh');
  if(mesh && theme.accentG) {
    mesh.style.background = `
      radial-gradient(ellipse 80% 60% at 20% 80%, ${theme.accentG} 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 80% 20%, rgba(100,60,180,0.05) 0%, transparent 70%),
      radial-gradient(ellipse 70% 70% at 50% 50%, rgba(40,80,160,0.04) 0%, transparent 60%),
      var(--void)`;
  }

  // Keep the 3D WebGL background (bg3d.js) in sync with the active color theme.
  // Guarded because bg3d.js is a deferred module and may not have registered yet.
  if (typeof window.updateBg3DTheme === 'function') {
    window.updateBg3DTheme(theme);
  } else {
    window.__pendingBg3DTheme = theme;
  }

  localStorage.setItem('tanix_theme', key);
  currentTheme = key;
  const panel = document.getElementById('menuPersonal');
  if(panel && !panel.classList.contains('hidden')) renderPersonalization();
}

/* ═══════════════════════════════════════════
   UPDATES  (v0.6 added)
   ═══════════════════════════════════════════ */
const UPDATES = [
  {
    version: 'v0.7', title: 'Model & Image Quality Update',
    date: 'May 12, 2026', time: '09:00 PM IST',
    current: true,
    items: [
      'Main model upgraded — Groq now runs llama-3.3-70b-versatile (4× smarter than the old 8b model)',
      'Reasoning model upgraded — OpenRouter now uses Llama 3.3 70B instruct (free tier)',
      'max_tokens raised to 4096 — longer, more complete responses with no cut-offs',
      'Image generation upgraded — now uses Flux model at 768×768 with enhancement on',
      'Image loading skeleton — shimmer placeholder shown while images generate',
      'Image retry button — one-click regeneration when an image fails to load',
      'Save image button — download generated images directly from the chat',
      'Welcome chips are now dynamic — 4 random prompts from a 22-chip pool every load',
      'Fact of the day is now randomised — refreshes each time you open TanixAI',
    ]
  },
  {
    version: 'v0.6', title: 'Intelligence & UX Update',
    date: 'May 11, 2026', time: '08:00 PM IST',
    current: false,
    items: [
      'Tone Selector — 10 professional response tones now live in the Themes menu',
      'Follow-up Questions — AI suggests 3 contextual next questions after every response',
      'Input limit removed — the 2000-character cap is gone, send as much as you need',
      'Incomplete responses fixed — max output tokens raised 4× across all providers',
      'Tone preference saved — your chosen tone persists across sessions automatically',
    ]
  },
  {
    version: 'v0.5', title: 'Security & Control Update',
    date: 'May 7, 2026', time: '12:00 PM IST',
    current: false,
    items: [
      'AbortController — stop AI generation mid-flight with the ⏹ button',
      'XSS vulnerabilities patched — all user content sanitised before DOM injection',
      'Content Security Policy headers added to Vercel deployment',
      'Regenerate button fixed — now correctly resends the last user message',
      'Export option removed — reduces attack surface and cleans up the UI',
      'Version badge (v0.5) now visible in the top bar',
    ]
  },
  {
    version: 'v0.4', title: 'Power User Update',
    date: 'May 6, 2026', time: '12:00 PM IST',
    current: false,
    items: [
      'AI disclaimer added below the chat input',
      'Pin chats to the top of your history',
      'Delete any single message from a conversation',
      '5 new themes — Rose, Teal, Neon, Sunset, Ice',
      'History shows pinned section separately',
    ]
  },
  {
    version: 'v0.3', title: 'Cinematic Redesign',
    date: 'April 30, 2026', time: '10:00 PM IST',
    current: false,
    items: [
      'Complete UI overhaul — cinematic & immersive design',
      'Custom cursor with ambient glow tracking',
      'Particle field background with connecting lines',
      'Film grain overlay + vignette for atmosphere',
      'Cinematic intro sequence with letterbox animation',
      'Animated ambient mesh background',
      'Refined message animations with stagger',
      'Streamlined minimal top bar',
      'Side action buttons with hover glide',
      'Theme system rebuilt for new design — 7 palettes',
    ]
  },
  {
    version: 'v0.2', title: 'Feature Update',
    date: 'April 29, 2026', time: '08:30 PM IST',
    current: false,
    items: [
      'Menu panel with Recent Updates & Personalization',
      'Color theme personalization — 6 themes',
      'Edit sent messages & re-send',
      'Version tag (v0.2) added to header',
      'Delete all chats at once from history',
      'Search inside chat history',
    ]
  },
  {
    version: 'v0.1', title: 'Initial Launch',
    date: 'April 26, 2026', time: '09:00 AM IST',
    current: false,
    items: [
      '3-model AI fallback chain (Gemini, Groq, OpenRouter)',
      'Pollinations AI image generation',
      'Voice input via Web Speech API',
      'File uploads — PDF, image, TXT, CSV, DOCX',
      'Glassmorphism UI with video background',
      'Portfolio Mode & Mumbai Student Mode',
      'English / Hindi language toggle',
      'Tone selector — formal, casual, funny, concise',
      'Chat history saved to localStorage',
      'Message copy & AI response regeneration',
      'Model switcher — Fast / Reasoning / Quality',
      'In-chat search with Ctrl+F',
      'Typewriter effect for AI responses',
      'Toast notification system',
    ]
  },
];

function renderUpdates() {
  const el = document.getElementById('menuUpdates');
  if(!el) return;
  el.innerHTML = UPDATES.map((u, i) => `
    <div class="update-card${u.current?' current':''}" id="ucard-${i}">
      <div class="update-card-head" onclick="toggleUpdateCard(${i})" style="cursor:pointer;user-select:none;">
        <div>
          <div class="update-version">${u.version}${u.current?' — CURRENT':''}</div>
          <div class="update-label">${u.title}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
          <div class="update-ts">${u.date}<br>${u.time}</div>
          <svg class="update-chevron" id="uchev-${i}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent);transition:transform .3s var(--ease);transform:rotate(0deg)">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      <div class="update-items" id="uitems-${i}" style="display:flex;">
        ${u.items.map(it=>`<div class="update-item">${it}</div>`).join('')}
      </div>
    </div>
  `).join('');
}

function toggleUpdateCard(i) {
  const items = document.getElementById('uitems-'+i);
  const chev  = document.getElementById('uchev-'+i);
  if(!items) return;
  const open = items.style.display !== 'none';
  items.style.display = open ? 'none' : 'flex';
  if(chev) chev.style.transform = open ? 'rotate(-90deg)' : 'rotate(0deg)';
}

/* ═══════════════════════════════════════════
   PERSONALIZATION  — v0.6: tone + theme
   ═══════════════════════════════════════════ */
function renderPersonalization() {
  const el = document.getElementById('menuPersonal');
  if(!el) return;
  el.innerHTML = `
    <div class="personal-section-label">Response Tone</div>
    <p class="personal-note">Shape how TanixAI talks to you. Your choice is saved automatically.</p>
    <div class="tone-grid">
      ${Object.entries(TONES).map(([key, t]) => `
        <button class="tone-option${tone===key?' active':''}" onclick="selectTone('${key}');renderPersonalization()">
          <span class="tone-icon">${t.icon}</span>
          <div class="tone-info">
            <span class="tone-name">${t.label}</span>
            <span class="tone-desc-text">${t.desc}</span>
          </div>
          ${tone===key ? '<span class="tone-check">✓</span>' : ''}
        </button>
      `).join('')}
    </div>
    <div class="personal-tone-divider"></div>
    <div class="personal-section-label">Color Theme</div>
    <p class="personal-note">Choose an accent color for the interface.</p>
    <div class="theme-grid">
      ${Object.entries(COLOR_THEMES).map(([key, t]) => `
        <button class="theme-swatch${currentTheme===key?' active':''}" onclick="applyTheme('${key}');renderPersonalization()">
          <div class="swatch-circle" style="background:${t.swatchGradient};">
            <span class="swatch-tick"></span>
          </div>
          <span class="swatch-label">${t.label}</span>
        </button>
      `).join('')}
    </div>
  `;
}

/* ── MENU PANEL ── */
function toggleMenuPanel(force) {
  const panel = document.getElementById('menuDrawer');
  const overlay = document.getElementById('drawer-overlay');
  const isOpen = panel.classList.contains('open');
  const open = force === undefined ? !isOpen : force;
  panel.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
  if(open) {
    renderUpdates();
    renderPersonalization();
    switchMenuTab('updates');
  }
}

function switchMenuTab(tab) {
  const updEl = document.getElementById('menuUpdates');
  const perEl = document.getElementById('menuPersonal');
  const tabU  = document.getElementById('tabUpdates');
  const tabP  = document.getElementById('tabPersonal');
  if(tab === 'updates') {
    updEl.classList.remove('hidden');
    perEl.classList.add('hidden');
    tabU.classList.add('on');
    tabP.classList.remove('on');
    renderUpdates();
  } else {
    perEl.classList.remove('hidden');
    updEl.classList.add('hidden');
    tabP.classList.add('on');
    tabU.classList.remove('on');
    renderPersonalization();
  }
}

document.addEventListener('click', e => {
  const drawer = document.getElementById('menuDrawer');
  const sidebar = document.querySelector('#left-dock');
  if(drawer && drawer.classList.contains('open')) {
    if(!drawer.contains(e.target) && !sidebar?.contains(e.target)) {
      toggleMenuPanel(false);
    }
  }
});

/* ── EDIT MESSAGE ── */
function editMessage(wrap, originalText) {
  const allMsgs = Array.from(document.querySelectorAll('#chat .msg'));
  const idx = allMsgs.indexOf(wrap);
  if(idx < 0) return;
  allMsgs.slice(idx).forEach(m => m.remove());
  history = history.slice(0, idx);
  const txt = document.getElementById('txt');
  txt.value = originalText || '';
  onInput(txt);
  txt.focus();
  txt.selectionStart = txt.selectionEnd = txt.value.length;
  lastSendTime = 0;
  if(cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  if(!busy) document.getElementById('sbtn').disabled = false;
  const hint = document.getElementById('coolHint');
  if(hint) hint.textContent = 'Enter send · Shift+Enter new line · Ctrl+F search';
  showToast('Message ready to edit','success', 2000);
}

/* ── DELETE ALL CHATS ── */
function deleteAllChats() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('chat_'));
  if(!keys.length) { showToast('No chats to delete','warn'); return; }
  if(!confirm('Delete all '+keys.length+' saved chat(s)? This cannot be undone.')) return;
  keys.forEach(k => localStorage.removeItem(k));
  currentChatId = null;
  history = [];
  document.getElementById('chat').innerHTML = '';
  renderWelcome();
  loadHistoryList();
  showToast('All chats deleted','warn');
}

/* ── HISTORY SEARCH ── */
function onHistSearch(val) {
  const q = (val || '').toLowerCase().trim();
  const items = document.querySelectorAll('#histPanel .hist-item');
  let visible = 0;
  items.forEach(item => {
    const title = (item.querySelector('.hist-title')?.textContent || '').toLowerCase();
    const show = !q || title.includes(q);
    item.style.display = show ? '' : 'none';
    if(show) visible++;
  });
  let noRes = document.getElementById('histNoResults');
  if(q && visible === 0) {
    if(!noRes) {
      noRes = document.createElement('div');
      noRes.id = 'histNoResults';
      noRes.className = 'drawer-empty';
      noRes.textContent = 'No chats match "' + val + '"';
      document.getElementById('histPanel').appendChild(noRes);
    } else {
      noRes.textContent = 'No chats match "' + val + '"';
      noRes.style.display = '';
    }
  } else if(noRes) {
    noRes.style.display = 'none';
  }
}

/* ── THEME INIT ── */
(function initTheme() {
  const saved = localStorage.getItem('tanix_theme') || 'default';
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyTheme(saved));
  } else {
    applyTheme(saved);
  }
})();
