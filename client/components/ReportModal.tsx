import { useEffect, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Trophy, Clock, Zap, Target, MessageSquare, Share2, Download } from "lucide-react";

export default function ReportModal({ data, onClose }: { data: any, onClose: () => void }) {
  const { report, stats } = data;
  const [show, setShow] = useState(false);

  useEffect(() => setShow(true), []);

  if (!report) return null; // Safety check

  const chartData = [
    { subject: 'Technical', A: report.radar.technical, fullMark: 10 },
    { subject: 'Communication', A: report.radar.communication, fullMark: 10 },
    { subject: 'Focus', A: report.radar.focus, fullMark: 10 },
    { subject: 'Speed', A: report.radar.speed, fullMark: 10 },
    { subject: 'Leadership', A: report.radar.leadership, fullMark: 10 },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`}>
      <div className="bg-white text-black w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: SUMMARY & SCORE */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-8 flex flex-col items-center">
            
            {/* AVATAR & INFO */}
            <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3">DS</div>
                <h2 className="font-bold text-xl text-slate-800">Candidate Report</h2>
                <p className="text-slate-500 text-sm">Senior Software Engineer</p>
            </div>

            {/* OVERALL SCORE GAUGE */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="transparent" />
                    <circle cx="80" cy="80" r="70" stroke={report.overall_score > 80 ? "#16a34a" : "#ca8a04"} strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * report.overall_score) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-slate-800">{report.overall_score}</span>
                    <span className="text-xs uppercase font-bold text-slate-400">Score</span>
                </div>
            </div>

            {/* BADGES */}
            <div className="w-full space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Earned Badges</h3>
                {report.badges.map((badge: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-bold text-slate-700">{badge}</span>
                    </div>
                ))}
            </div>

             {/* ACTIONS */}
             <div className="mt-auto w-full pt-8 flex gap-2">
                <button className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-bold flex items-center justify-center gap-2"><Download size={16}/> PDF</button>
                <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold flex items-center justify-center gap-2" onClick={onClose}><Share2 size={16}/> Share</button>
            </div>
        </div>

        {/* RIGHT COLUMN: DETAILED METRICS */}
        <div className="flex-1 p-8 bg-white">
            
            {/* NARRATIVE */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Performance Summary</h3>
                <p className="text-slate-600 italic leading-relaxed border-l-4 border-blue-500 pl-4">
                    "{report.narrative}"
                </p>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                
                {/* RADAR CHART */}
                <div className="h-64 relative -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                            <Radar name="Candidate" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-0 right-0 text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Visual Breakdown</div>
                </div>

                {/* KEY STATS */}
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Zap size={16} className="text-blue-500"/> Technical Accuracy</span>
                            <span className="text-sm font-bold text-slate-900">{report.radar.technical}/10</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${report.radar.technical * 10}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><MessageSquare size={16} className="text-green-500"/> Communication</span>
                            <span className="text-sm font-bold text-slate-900">{report.radar.communication}/10</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${report.radar.communication * 10}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Target size={16} className="text-purple-500"/> Focus</span>
                            <span className="text-sm font-bold text-slate-900">{report.radar.focus}/10</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${report.radar.focus * 10}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FEEDBACK LISTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h4 className="text-sm font-bold text-green-800 uppercase tracking-wide mb-3">Key Strengths</h4>
                    <ul className="space-y-2">
                        {report.feedback.strengths.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wide mb-3">Areas for Growth</h4>
                    <ul className="space-y-2">
                        {report.feedback.weaknesses.map((w: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-orange-900">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                                {w}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}