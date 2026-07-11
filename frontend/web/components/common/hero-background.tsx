"use client";

export default function HeroBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#FAFAFA]">


            <div
                className="absolute inset-0 flex items-center justify-center opacity-[0.3] scale-110"
                aria-hidden="true"
                style={{

                    maskImage:

                        "radial-gradient(circle at center, black 35%, transparent 100%)",

                    WebkitMaskImage:

                        "radial-gradient(circle at center, black 35%, transparent 100%)",

                }}
            >
                <img
                    src="/img.png"
                    alt=""
                    className="h-auto w-[92%] max-w-[1700px] select-none object-contain"
                    draggable={false}
                />
            </div>



            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_60%)]" />

            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(0,0,0,.8) 1px, transparent 1px)",
                    backgroundSize: "6px 6px",
                }}
            />




            <svg
                viewBox="0 0 1400 900"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
            >
                <defs>
                    <linearGradient id="routeBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>

                    <linearGradient id="routeSky" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>


                <path
                    d="M100 800 C400 300 900 -100 1500 200"
                    stroke="#E2E8F0"
                    strokeWidth=".6"
                />

                <path
                    d="M-100 300 C300 700 800 1000 1400 600"
                    stroke="#E2E8F0"
                    strokeWidth=".6"
                />

                <path
                    d="M1200 1000 C1300 600 1100 200 1500 -100"
                    stroke="#E2E8F0"
                    strokeWidth=".6"
                />


                <path
                    d="M100 800 C400 300 900 -100 1500 200"
                    stroke="url(#routeBlue)"
                    strokeWidth="2"
                    strokeDasharray="140 1800"
                    strokeLinecap="round"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        values="1940;-140"
                        dur="18s"
                        repeatCount="indefinite"
                    />
                </path>

                <path
                    d="M-100 300 C300 700 800 1000 1400 600"
                    stroke="url(#routeSky)"
                    strokeWidth="2"
                    strokeDasharray="120 1800"
                    strokeLinecap="round"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        values="-120;1920"
                        dur="24s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>
    );
}