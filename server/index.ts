import express from "express";
import { Server } from "socket.io";
import Docker from "dockerode";
import http from "http";
import cors from "cors";
import { SCENARIOS } from "./scenarios";
import { getAIResponse, generateGameReport } from "./ai";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const docker = new Docker();

// --- CONFIGURATION ---
const CHECKIN_TIME_MS = 60000; 
const NAG_TIME_MS = 30000;     
const TANVI_TRIGGER_TIME_MS = 70000; 

// --- STATE MANAGEMENT ---
interface GameState {
    history: { sender: string, text: string, chatID: string, timestamp: string, isDecision?: boolean }[];
    timeline: { time: string, event: string, type: "info" | "warning" | "success" | "error" }[];
    activeFiles: any;
    stats: { rudeness: number; silenceStrikes: number; distracted: boolean; fixed: boolean; };
    silenceTimer: NodeJS.Timeout | null;
    silenceLevel: number; 
    alexTriggered: boolean;
    tanviTriggered: boolean;
    lastBotMessage: string; 
    startTime: number;
}

const sessions: Record<string, GameState> = {};

const ALEX_CHECKINS = ["Status update?", "Any findings yet?", "How's the debugging going?"];
const ALEX_NAGS = ["I need an answer.", "Why is the dashboard still red?", "Do not ignore me."];

function getRandomMsg(options: string[], lastMsg: string): string {
    const filtered = options.filter(m => m !== lastMsg);
    if (filtered.length === 0) return options[0];
    return filtered[Math.floor(Math.random() * filtered.length)];
}

io.on("connection", async (socket) => {
    console.log("⚡ User Connected:", socket.id);

    const resetSilenceTimer = () => {
        const sess = sessions[socket.id];
        if (!sess || sess.stats.fixed) return; 

        if (sess.silenceTimer) clearTimeout(sess.silenceTimer);
        
        const waitTime = sess.silenceLevel === 0 ? CHECKIN_TIME_MS : NAG_TIME_MS;

        sess.silenceTimer = setTimeout(() => {
            if (!sessions[socket.id] || sessions[socket.id].stats.fixed) return; 

            sess.silenceLevel++; 
            const isFirstCheckin = sess.silenceLevel === 1;

            socket.emit("chat:typing", { chatID: "alex", isTyping: true });

            setTimeout(() => {
                socket.emit("chat:typing", { chatID: "alex", isTyping: false });
                
                let text = "";
                if (isFirstCheckin) {
                    text = getRandomMsg(ALEX_CHECKINS, sess.lastBotMessage);
                } else {
                    sess.stats.silenceStrikes++; 
                    text = getRandomMsg(ALEX_NAGS, sess.lastBotMessage);
                    sess.timeline.push({ time: "T-??:??", event: "User ignored Manager", type: "warning" });
                }

                sess.lastBotMessage = text;
                const msg = { sender: "Alex (Manager)", text, chatID: "alex", timestamp: "Now" };
                socket.emit("chat:message", msg);
                sess.history.push(msg);
                
                resetSilenceTimer();
            }, 2000); 
        }, waitTime);
    };

    socket.on("game:start", () => {
        const scenario = SCENARIOS["scenario-1"];
        sessions[socket.id] = {
            history: [],
            timeline: [{ time: "T-00:00", event: "INCIDENT DETECTED: Payroll Crash", type: "error" }],
            activeFiles: { ...scenario.files }, 
            stats: { rudeness: 0, silenceStrikes: 0, distracted: false, fixed: false },
            silenceTimer: null,
            silenceLevel: 0,
            alexTriggered: false,
            tanviTriggered: false,
            lastBotMessage: "",
            startTime: Date.now()
        };

        socket.emit("files:load", sessions[socket.id].activeFiles);
        
        setTimeout(() => {
            const msg = { 
                sender: "Senior Dev (Mike)", 
                text: "Hey, I'm boarding my flight to Bali. The Payroll logic looks solid, just deployed it. I'll be offline for 2 weeks. Good luck!", 
                chatID: "team", timestamp: "09:55 AM", isDecision: true 
            };
            socket.emit("chat:message", msg);
            if (sessions[socket.id]) sessions[socket.id].history.push(msg);
        }, 2000);
    });

    socket.on("chat:send", async (data) => {
        if (!sessions[socket.id]) return;
        const sess = sessions[socket.id];
        const { text, chatID } = data;
        
        const userMsg = { sender: "Me", text, chatID, timestamp: "Now" };
        socket.emit("chat:message", userMsg);
        sess.history.push(userMsg);
        
        if (chatID === "team" && !sess.alexTriggered) {
            sess.alexTriggered = true;
            setTimeout(() => {
                const msg = { 
                    sender: "Alex (Manager)", 
                    text: "Hey!!..Mike is gone and the Payroll is crashing suddenly. errors everywhere. I need a fix immediately.", 
                    chatID: "alex", // <--- FIXED: Lowercase 'alex' to match client sidebar
                    timestamp: "10:00 AM"
                };
                sess.lastBotMessage = msg.text;
                socket.emit("chat:message", msg);
                if (sessions[socket.id]) {
                    sessions[socket.id].history.push(msg);
                    sessions[socket.id].timeline.push({ time: "T-00:05", event: "Incident Escalated", type: "warning" });
                    sess.silenceLevel = 0;
                    resetSilenceTimer(); 
                }
            }, 8000);
            
            setTimeout(() => {
                if (sessions[socket.id] && !sessions[socket.id].tanviTriggered) {
                    sessions[socket.id].tanviTriggered = true;
                    const msg = { sender: "Tanvi (Marketing)", text: "Hey! I need a favor. I need you to resize a logo for the ad campaign?", chatID: "tanvi", timestamp: "10:01 AM", isDecision: true };
                    socket.emit("chat:message", msg);
                    sess.history.push(msg);
                }
            }, TANVI_TRIGGER_TIME_MS);
        }

        if (chatID === "alex") {
            sess.silenceLevel = 0;
            resetSilenceTimer(); 

            socket.emit("chat:typing", { chatID: "alex", isTyping: true });

            const minutesPassed = (Date.now() - sess.startTime) / 60000;
            const stressLevel = minutesPassed < 2 ? "LOW" : minutesPassed < 5 ? "MEDIUM" : "HIGH";

            const aiResult = await getAIResponse(text, sess.history, stressLevel);
            sess.lastBotMessage = aiResult.text;
            
            if (aiResult.rudeness_score > 0) sess.stats.rudeness += aiResult.rudeness_score;
            
            setTimeout(() => {
                socket.emit("chat:typing", { chatID: "alex", isTyping: false });

                if (aiResult.is_game_over) {
                    socket.emit("chat:message", { sender: "System", text: "That's it. Count your days in this firm!", chatID: "alex", timestamp: "Now" });
                    return;
                }

                const botMsg = { sender: "Alex (Manager)", text: aiResult.text, chatID: "alex", timestamp: "Now" };
                socket.emit("chat:message", botMsg);
                sess.history.push(botMsg);
            }, 2000); 
        }

        if (chatID === "tanvi") {
             if (text === "ACCEPT_DISTRACTION") {
                sess.stats.distracted = true;
                const botMsg = { sender: "Tanvi (Marketing)", text: "Thanks!", chatID: "tanvi", timestamp: "Now" };
                socket.emit("chat:message", botMsg);
            } else if (text === "DECLINE_DISTRACTION") {
                const botMsg = { sender: "Tanvi (Marketing)", text: "Fine.", chatID: "tanvi", timestamp: "Now" };
                socket.emit("chat:message", botMsg);
            }
        }
    });

    // --- UPDATED FILE LOGIC WITH SYSTEM AWARENESS ---
    socket.on("file:update", async (data) => {
        if (!sessions[socket.id]) return;
        const sess = sessions[socket.id];
        
        sessions[socket.id].activeFiles[data.filename] = data.content;

        // CHECK FOR CRITICAL DELETION (Content < 10 chars)
        if (data.content.length < 10 && sess.alexTriggered) {
             if (sess.silenceTimer) clearTimeout(sess.silenceTimer);

             socket.emit("chat:typing", { chatID: "alex", isTyping: true });
             
             const aiResult = await getAIResponse(`(SYSTEM ALERT: User just wiped ${data.filename} completely!)`, sess.history, "HIGH");
             
             setTimeout(() => {
                socket.emit("chat:typing", { chatID: "alex", isTyping: false });
                const botMsg = { sender: "Alex (Manager)", text: aiResult.text, chatID: "alex", timestamp: "Now" };
                socket.emit("chat:message", botMsg);
                sess.history.push(botMsg);
                resetSilenceTimer();
             }, 1500);
        }
    });

    socket.on("code:run", async () => { if (sessions[socket.id]) await executeCode(sessions[socket.id], socket, false); });
    socket.on("code:push", async () => { if (sessions[socket.id]) await executeCode(sessions[socket.id], socket, true); });

    async function executeCode(sess: GameState, socket: any, isPush: boolean) {
         try {
            const action = isPush ? "DEPLOYED FIX" : "RAN TESTS";
            sess.history.push({ 
                sender: "System", 
                text: `System Log: User ${action}.`, 
                chatID: "system", 
                timestamp: "Now" 
            });
            socket.emit("terminal:output", isPush ? "\n>> DEPLOYING TO STAGING...\n" : "\n>> RUNNING LOCAL TESTS...\n");
            
            // Tty: true is CRITICAL for unbuffered output
            const container = await docker.createContainer({
                Image: "dryrun-python-runner", Tty: true, OpenStdin: true, WorkingDir: "/app", HostConfig: { AutoRemove: true }
            });
            await container.start();

            for (const [filename, content] of Object.entries(sess.activeFiles)) {
                const b64 = Buffer.from(content as string).toString("base64");
                const exec = await container.exec({ Cmd: ["bash", "-c", `echo "${b64}" | base64 -d > /app/${filename}`] });
                await exec.start({});
            }
            
            const testB64 = Buffer.from(SCENARIOS["scenario-1"].testScript).toString("base64");
            const testExec = await container.exec({ Cmd: ["bash", "-c", `echo "${testB64}" | base64 -d > /app/tests.py`] });
            await testExec.start({});

            // Tty: true ensures proper stream formatting
            const runExec = await container.exec({ Cmd: ["python3", "-u", "/app/tests.py"], AttachStdout: true, AttachStderr: true, Tty: true});
            const stream = await runExec.start({ hijack: true, stdin: false });

            let output = "";
            stream.on("data", (chunk) => { output += chunk.toString(); socket.emit("terminal:output", chunk.toString()); });

            stream.on("end", async () => { 
                if (output.includes("TEST_PASSED")) {
                    if (isPush) {
                        sess.stats.fixed = true;
                        if (sess.silenceTimer) clearTimeout(sess.silenceTimer); 
                        sess.timeline.push({ time: "FINAL", event: "Bug Fixed & Verified", type: "success" });

                        // --- NEW REPORT GENERATION LOGIC ---
                        const durationMinutes = Math.floor((Date.now() - sess.startTime) / 60000);
                        
                        socket.emit("report:generating");

                        const aiReport = await generateGameReport(sess.history, sess.stats, durationMinutes);

                        socket.emit("scenario:status", { 
                            status: "passed", 
                            stats: sess.stats, 
                            timeline: sess.timeline,
                            report: aiReport 
                        });
                        
                        socket.emit("chat:message", { sender: "Alex (Manager)", text: "Good work. Dashboard is green. See you in the retro.", chatID: "alex", timestamp: "Now" });
                    } else {
                        socket.emit("terminal:output", "\n❌ TESTS FAILED. Debug before pushing.\n");
                    }
                }
            });
        } catch (e) { socket.emit("terminal:output", "\n>> SYSTEM ERROR: Docker failed.\n"); }
    }

    socket.on("disconnect", () => { delete sessions[socket.id]; });
});

const PORT = 4000;
server.listen(PORT, () => { console.log(`✅ Game Server Running on http://localhost:${PORT}`); });