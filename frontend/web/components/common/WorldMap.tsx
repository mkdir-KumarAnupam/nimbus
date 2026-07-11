"use client";

export default function HeroBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">

            {/* Ambient gradients */}
            <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[160px]" />

            <div className="absolute right-[-150px] top-20 h-[450px] w-[450px] rounded-full bg-cyan-400/10 blur-[150px]" />

            <div className="absolute bottom-[-180px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-sky-400/10 blur-[180px]" />

            <svg
                viewBox="0 0 1600 900"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
            >
                <defs>

                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                        <stop offset="50%" stopColor="#2563eb" stopOpacity=".18" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>

                </defs>

                {/* Flight Routes */}

                <path
                    id="route-1"
                    d="M240 330 C520 120 930 120 1220 310"
                    stroke="url(#routeGradient)"
                    strokeWidth="2"
                    fill="none"
                />

                <path
                    id="route-2"
                    d="M520 640 C760 520 920 520 1120 650"
                    stroke="url(#routeGradient)"
                    strokeWidth="2"
                    fill="none"
                />

                {/* City Nodes */}

                <g opacity=".15">

                    <circle cx="240" cy="330" r="5" fill="#2563eb" />
                    <text x="220" y="315" className="fill-slate-400 text-[18px]">
                        London
                    </text>

                    <circle cx="730" cy="150" r="5" fill="#2563eb" />
                    <text x="695" y="135" className="fill-slate-400 text-[18px]">
                        Delhi
                    </text>

                    <circle cx="1220" cy="310" r="5" fill="#2563eb" />
                    <text x="1235" y="300" className="fill-slate-400 text-[18px]">
                        Tokyo
                    </text>

                    <circle cx="520" cy="640" r="5" fill="#2563eb" />
                    <text x="475" y="625" className="fill-slate-400 text-[18px]">
                        Paris
                    </text>

                    <circle cx="1120" cy="650" r="5" fill="#2563eb" />
                    <text x="1135" y="635" className="fill-slate-400 text-[18px]">
                        Dubai
                    </text>

                </g>

                {/* Moving aircraft particles */}

                <circle r="4" fill="#2563eb">
                    <animateMotion
                        dur="9s"
                        repeatCount="indefinite"
                        rotate="auto"
                    >
                        <mpath href="#route-1" />
                    </animateMotion>
                </circle>

                <circle r="4" fill="#2563eb">
                    <animateMotion
                        begin="2s"
                        dur="11s"
                        repeatCount="indefinite"
                        rotate="auto"
                    >
                        <mpath href="#route-2" />
                    </animateMotion>
                </circle>

            </svg>
        </div>
    );
}