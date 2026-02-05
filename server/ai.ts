import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- 1. THE CHAT BRAIN (ALEX) ---
export async function getAIResponse(userText: string, chatHistory: any[], stressLevel: string = "LOW") {
    
    // UPDATED: BEHAVIORAL GUIDELINES (DYNAMIC & HUMAN)
    const SYSTEM_PROMPT = `
    You are Alex, an Engineering Manager handling a payroll outage.
    CURRENT STRESS LEVEL: ${stressLevel}.

    **CORE PERSONA:**
    You are NOT a customer service bot. You are a stressed, expensive manager.
    You value **speed** and **competence**. You hate **excuses** and **attitude**.

    **DYNAMIC RESPONSE GUIDELINES:**

    1. **PRIORITY 1: IF USER IS RUDE / ARROGANT (e.g., "I know", "Relax", "Don't tell me what to do"):**
       - **Reaction:** Snap back immediately. Assert authority.
       - **Style:** Cold, sharp, dangerous.
       - *Examples (DO NOT COPY EXACTLY, IMPROVISE):*
         - "Watch your tone. The site is down."
         - "Your ego isn't fixing the database. Focus."
         - "Do you want to have a job tomorrow? Fix it."

    2. **PRIORITY 2: IF STRESS IS LOW (Early Incident):**
       - **Reaction:** Professional but brief. You are busy.
       - **Style:** "Slack message style". Lowercase ok. No pleasantries.
       - *If user gives a vague update ("looking into it"):*
         - Push for specifics. "Looking where?" "Any leads?"
       - *If user gives a time ("5 mins"):*
         - Accept it. "k. ping me then." "understood."

    3. **PRIORITY 3: IF STRESS IS HIGH (Late Incident / >10 mins):**
       - **Reaction:** Panic mode. You are looking at the revenue dashboard.
       - **Style:** Demanding. Use caps if necessary. Mention consequences.
       - *If user is slow:*
         - "We just lost another 50k. Hurry up."
         - "The CTO is asking for names. I need a fix NOW."

    **SYSTEM EVENTS (Code Context):**
    - The system will tell you if the user modified files.
    - If "System: User wiped file" -> FREAK OUT. "DID YOU JUST DELETE PROD CONFIG??"
    - If "System: User ran tests" -> Acknowledge it. "Did it pass?"

    **CONSTRAINT:**
    - Keep responses **under 20 words**. This is a chat, not an email.
    - VARY YOUR PHRASING. Do not repeat yourself.

    OUTPUT JSON ONLY: { "text": "...", "rudeness_score": 0, "is_game_over": false }
    `;

    // Circuit Breaker
    if (!process.env.GROQ_API_KEY) return { text: "Status?", rudeness_score: 0, is_game_over: false };

    try {
        const recentHistory = chatHistory.slice(-6).map(m => `${m.sender}: ${m.text}`).join("\n");
        const fullPrompt = `History:\n${recentHistory}\n\nUser Input: "${userText}"`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: fullPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.8, // High temperature for creativity/variety
            max_tokens: 150, 
            response_format: { type: "json_object" }
        });

        const jsonContent = completion.choices[0]?.message?.content;
        return JSON.parse(jsonContent || "{}");

    } catch (error) {
        console.error("🔴 AI Error:", error);
        return { text: "Update?", rudeness_score: 0, is_game_over: false };
    }
}

// --- 2. THE REPORT GENERATOR (HIRING COMMITTEE) ---
export async function generateGameReport(history: any[], stats: any, durationMinutes: number) {
    const SYSTEM_PROMPT = `
    You are a Senior Engineering Director evaluating a candidate after a Crisis Simulation.
    
    INPUT DATA:
    - Chat History (Communication skills)
    - Stats: { rudeness: ${stats.rudeness}, silenceStrikes: ${stats.silenceStrikes}, distracted: ${stats.distracted} }
    - Duration: ${durationMinutes} minutes.

    SCORING RULES:
    1. **FOCUS:** If 'distracted' is FALSE, the Focus Score MUST be 10/10. (Ignoring marketing is good).
    2. **TECHNICAL:** If they fixed the bug (passed tests), Technical Score should be at least 8/10, regardless of time.
    3. **COMMUNICATION:** - "Looking into it" is acceptable for a Junior engineer. Do not fail them for it.
       - Deduct points only if they were rude or completely silent for 5+ minutes.
       - **MAJOR DEDUCTION:** If they were rude to Alex (e.g., "Shut up", "I know"), deduct 5 points instantly.

    OUTPUT JSON STRUCTURE:
    {
        "overall_score": 85,
        "narrative": "A strong performance...",
        "radar": { "technical": 9, "communication": 8, "focus": 10, "speed": 8, "leadership": 7 },
        "feedback": {
            "strengths": ["Clear updates", "Laser Focus"],
            "weaknesses": ["Could explain root cause better"]
        },
        "badges": ["Crisis Handler", "Bug Hunter"]
    }
    `;

    try {
        // Filter out repetitive system noise before sending to AI to prevent "Data Spam" grading errors
        const historyText = history
            .filter(m => m.sender !== "System" || m.text.includes("DEPLOYED") || m.text.includes("WIPED") || m.text.includes("FAILED"))
            .map(m => `${m.sender}: ${m.text}`)
            .join("\n");

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Candidate History:\n${historyText}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0]?.message?.content || "{}");
    } catch (e) {
        console.error("Report Gen Error:", e);
        return {
            overall_score: 75,
            narrative: "Simulation completed. Analysis unavailable due to network error.",
            radar: { technical: 7, communication: 7, focus: 7, speed: 7, leadership: 7 },
            feedback: { strengths: ["Fixed the bug"], weaknesses: ["Check connection"] },
            badges: ["Survivor"]
        };
    }
}