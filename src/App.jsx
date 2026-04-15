import { useState, useEffect, useRef } from "react";
import {
  Mountain,
  MapPin,
  Moon,
  Star,
  AlertTriangle,
  Fuel,
  Wifi,
  Heart,
  ChevronDown,
  Route,
  ArrowUpDown,
  Navigation,
  Sunrise,
  Shield,
  Compass,
  Clock,
  Camera,
  Tent,
  Home,
  Plane,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Total Distance", value: "~1,400 km", icon: Route },
  { label: "Highest Point", value: "Mig La 5,913m*", sub: "Umling La 5,799m if closed", icon: Mountain },
  { label: "Nights on Road", value: "8", icon: Moon },
  { label: "Passes Crossed", value: "11", icon: Navigation },
];

const STOPS = [
  {
    num: 1, name: "Leh", date: "3 Oct", nights: "Arrival", alt: "3,524m",
    sleep: "Hotel in Leh",
    activities: "Arrive, rest, acclimatise. Leh Palace, Shanti Stupa, Hall of Fame. Collect all permits (ILP for Nubra, Pangong, Hanle, Karzok/Chumur) from DC office.",
    passes: [],
    notes: ["Spend day collecting permits. No exertion on day 1."],
  },
  {
    num: 2, name: "Diskit", date: "4–5 Oct", nights: "1N", alt: "3,072m",
    sleep: "Guesthouse or camp in Diskit / Hunder",
    activities: "Diskit Monastery, 106ft Maitreya Buddha statue, Hunder sand dunes, Bactrian camel safari.",
    passes: [{ name: "Khardung La", alt: "5,359m" }],
    notes: ["Fill fuel fully at Diskit — last reliable petrol pump for days."],
  },
  {
    num: 3, name: "Merak", date: "5–6 Oct", nights: "1N", alt: "~4,350m",
    sleep: "Village homestay — book via driver in advance, very basic",
    activities: "Pangong south shore walk, nomadic Changpa culture, raw lake views beyond Spangmik.",
    passes: [],
    passNote: "No high pass — Shyok valley road via Khalsar → Agham → Durbuk → Tangtse",
    notes: ["Indians only beyond Merak. Foreigners not permitted."],
  },
  {
    num: 4, name: "Rhongo", date: "6–7 Oct", nights: "1N", alt: "~4,200m",
    sleep: "Basic homestay",
    activities: "Rest after brutal Merak–Chusul dirt track. Indus valley views. Optional Mig La recce with driver.",
    passes: [
      { name: "Chusul La", alt: "~4,350m" },
      { name: "Rezang La", alt: "~4,650m" },
      { name: "Tsaga La", alt: "4,635m" },
    ],
    notes: [
      "Dirt track Merak→Chusul. Army checkposts throughout. Submit photography equipment at Loma checkpoint.",
      "Mig La contingency: if army permits civilian access, detour Rhongo → Likaru → Mig La 5,913m (world's highest motorable road) → Fukche → Hanle is possible — confirm in Leh.",
    ],
  },
  {
    num: 5, name: "Hanle", date: "7–9 Oct", nights: "2N", alt: "4,300m",
    sleep: "Padma Homestay recommended — book in advance. BSNL network only.",
    activities: "Night 1 — rest, stargazing (one of Asia's darkest skies, Milky Way visible), Hanle Monastery. Day 2 — Umling La loop: Hanle → Photi La 5,524m → Nurbu La ~5,400m → Umling La 5,799m (world's 2nd highest motorable road) → back to Hanle (~216km full day).",
    passes: [],
    passNote: "Direct road from Rhongo via Loma junction (~48km, 1hr)",
    notes: [
      "No ATMs in Hanle — carry sufficient cash.",
      "Carry oxygen cylinder. Max 15 min at Umling La summit. Acclimatise first night fully before attempting Umling La.",
    ],
  },
  {
    num: 6, name: "Karzok", date: "9–10 Oct", nights: "1N", alt: "4,522m",
    label: "Tso Moriri",
    sleep: "Hotel or homestay in Karzok village — more options than Hanle",
    activities: "Walk on Tso Moriri shore, Korzok Monastery (17th century), bar-headed geese and black-necked cranes still present in October.",
    passes: [{ name: "Namashang La", alt: "~4,800m" }],
    passNote: "Route: Hanle → Loma → Nyoma → Mahe → Sumdo → Namashang La → Karzok (~150km). Last 50km Sumdo→Karzok is rough dirt track.",
    notes: [],
  },
  {
    num: 7, name: "Thukje", date: "10–11 Oct", nights: "1N", alt: "~4,100m",
    sleep: "Basic guesthouse — decompression night before Leh",
    activities: "Thukje Monastery, Indus River valley views, relative warmth after high altitude days.",
    passes: [
      { name: "Polo Kongka La", alt: "~4,900m" },
      { name: "Taglang La", alt: "5,328m" },
    ],
    passNote: "Route: Karzok → Sumdo → Polo Kongka La → Tso Kar lake → Debring → Taglang La → Rumtse → Pang → Thukje (~145km)",
    notes: ["Sumdo–Polo Kongka La road extremely rough. Taglang La can have early snow in October."],
  },
  {
    num: 8, name: "Leh", date: "11–12 Oct", nights: "Departure", alt: "3,524m",
    sleep: "Hotel in Leh",
    activities: "Thiksey Monastery, Shey Palace en route from Thukje. Leh market for souvenirs. Rest.",
    passes: [],
    passNote: "NH3 → Upshi → NH1 Indus valley road — smooth, no major pass (~200km, 4–5hrs)",
    notes: [],
  },
];

const ALL_PASSES = [
  { name: "Khardung La", alt: 5359, display: "5,359m", feet: "17,582ft", leg: "Leh → Diskit", type: "high" },
  { name: "Chusul La", alt: 4350, display: "~4,350m", feet: "~14,272ft", leg: "Merak → Rhongo", type: "default" },
  { name: "Rezang La", alt: 4650, display: "~4,650m", feet: "~15,256ft", leg: "Merak → Rhongo", type: "default" },
  { name: "Tsaga La", alt: 4635, display: "4,635m", feet: "15,207ft", leg: "Merak → Rhongo", type: "default" },
  { name: "Mig La", alt: 5913, display: "5,913m", feet: "19,400ft", leg: "Rhongo → Hanle (contingency)", type: "record", note: "World's highest motorable road*" },
  { name: "Photi La", alt: 5524, display: "5,524m", feet: "18,124ft", leg: "Hanle → Umling La loop", type: "high" },
  { name: "Nurbu La", alt: 5400, display: "~5,400m", feet: "~17,717ft", leg: "Hanle → Umling La loop", type: "default" },
  { name: "Umling La", alt: 5799, display: "5,799m", feet: "19,024ft", leg: "Hanle → Umling La loop", type: "record", note: "World's 2nd highest motorable road" },
  { name: "Namashang La", alt: 4800, display: "~4,800m", feet: "~15,748ft", leg: "Hanle → Karzok", type: "default" },
  { name: "Polo Kongka La", alt: 4900, display: "~4,900m", feet: "~16,076ft", leg: "Karzok → Thukje", type: "default" },
  { name: "Taglang La", alt: 5328, display: "5,328m", feet: "17,480ft", leg: "Karzok → Thukje", type: "high" },
];

// ─── HOOKS ───────────────────────────────────────────────────────────────────

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealDiv({ children, className = "", delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── STARFIELD BACKGROUND ────────────────────────────────────────────────────

function Starfield() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let stars = [];

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      init();
    }

    function init() {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.65,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.008 + 0.002,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function draw(t) {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle * s.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

// ─── MOUNTAIN SILHOUETTE ─────────────────────────────────────────────────────

function MountainSilhouette() {
  return (
    <div className="absolute bottom-0 left-0 w-full" style={{ zIndex: 1, height: "40%" }}>
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,400 L0,280 Q60,220 120,260 Q180,200 240,230 Q320,140 400,200 Q440,170 500,210 Q560,120 640,180 Q700,90 760,160 Q820,80 880,140 Q940,60 1020,130 Q1080,70 1140,120 Q1200,90 1280,160 Q1340,110 1400,180 L1440,150 L1440,400 Z" fill="#1a1a2e" opacity="0.7" />
        <path d="M0,400 L0,320 Q80,270 160,300 Q240,240 340,280 Q400,220 480,270 Q560,190 660,250 Q740,170 820,230 Q900,160 980,220 Q1060,170 1140,200 Q1220,160 1300,210 Q1360,180 1440,220 L1440,400 Z" fill="#12121f" opacity="0.85" />
        <path d="M0,400 L0,350 Q100,310 200,340 Q300,290 420,330 Q520,280 620,320 Q720,270 840,310 Q940,280 1060,320 Q1160,290 1260,330 Q1340,300 1440,340 L1440,400 Z" fill="#0f1117" />
      </svg>
    </div>
  );
}

// ─── HERO SECTION ────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="hero" className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: "100vh", background: "linear-gradient(180deg, #070b14 0%, #0f1117 100%)" }}>
      <Starfield />
      <MountainSilhouette />
      <div className="relative text-center px-6" style={{ zIndex: 2 }}>
        <RevealDiv>
          <p className="text-sm tracking-[0.35em] uppercase mb-4" style={{ color: "#e11d48" }}>An Expedition Beyond the Ordinary</p>
        </RevealDiv>
        <RevealDiv delay={0.15}>
          <h1 className="font-bold tracking-tight" style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 1.05, color: "#f1f1f1" }}>
            Ladakh <span style={{ color: "#e11d48" }}>2026</span>
          </h1>
        </RevealDiv>
        <RevealDiv delay={0.3}>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
            Leh · Diskit · Merak · Rhongo · Hanle · Karzok · Thukje · Leh
          </p>
        </RevealDiv>
        <RevealDiv delay={0.45}>
          <p className="mt-3 text-base" style={{ color: "#64748b" }}>3 Oct – 12 Oct 2026</p>
        </RevealDiv>
        <RevealDiv delay={0.6}>
          <p className="mt-8 text-xl md:text-2xl font-semibold" style={{ color: "#e2e8f0" }}>
            11 passes. 2 world records. 9 days.
          </p>
        </RevealDiv>
        <RevealDiv delay={0.75}>
          <a href="#stats" className="inline-flex items-center gap-2 mt-12 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105" style={{ background: "#e11d48", color: "#fff" }}>
            Explore the route <ChevronDown size={16} />
          </a>
        </RevealDiv>
      </div>
    </section>
  );
}

// ─── STAT CARDS ──────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <section id="stats" className="w-full py-16 px-4" style={{ background: "#0f1117" }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <RevealDiv key={s.label} delay={i * 0.1} className="rounded-xl p-6 text-center" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
              <Icon size={28} className="mx-auto mb-3" style={{ color: "#e11d48" }} />
              <p className="text-2xl font-bold" style={{ color: "#f1f1f1" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>{s.label}</p>
              {s.sub && <p className="text-xs mt-1 italic" style={{ color: "#475569" }}>{s.sub}</p>}
            </RevealDiv>
          );
        })}
      </div>
    </section>
  );
}

// ─── ITINERARY TIMELINE ──────────────────────────────────────────────────────

function AltBadge({ alt }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#1e2230", color: "#94a3b8", border: "1px solid #2a2e3d" }}>
      <Mountain size={12} /> {alt}
    </span>
  );
}

function NightBadge({ nights }) {
  const color = nights === "2N" ? "#e11d48" : nights === "1N" ? "#7c3aed" : "#0ea5e9";
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: color + "18", color, border: `1px solid ${color}44` }}>
      <Moon size={12} /> {nights}
    </span>
  );
}

function PassChip({ name, alt }) {
  const isMigLa = name === "Mig La";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: isMigLa ? "#92400e22" : "#e11d4818", color: isMigLa ? "#fbbf24" : "#fb7185", border: `1px solid ${isMigLa ? "#92400e44" : "#e11d4833"}` }}>
      {name} {alt}{isMigLa && "*"}
    </span>
  );
}

function StopCard({ stop }) {
  const isFirst = stop.num === 1;
  const isLast = stop.num === 8;
  const IconChoice = isFirst ? Plane : isLast ? Plane : stop.nights === "2N" ? Tent : Home;

  return (
    <RevealDiv className="relative pl-10 md:pl-16 pb-12">
      {/* Timeline dot */}
      <div className="absolute left-0 md:left-4 top-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#e11d48", boxShadow: "0 0 12px #e11d4866" }}>
        <div className="w-2 h-2 rounded-full" style={{ background: "#fff" }} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
        {/* Header */}
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-3" style={{ borderBottom: "1px solid #1e2230" }}>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl font-bold" style={{ color: "#e11d48" }}>
              {String(stop.num).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "#f1f1f1" }}>
                {stop.name}
                {stop.label && <span className="font-normal text-sm ml-2" style={{ color: "#64748b" }}>({stop.label})</span>}
              </h3>
              <p className="text-sm" style={{ color: "#64748b" }}>{stop.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <AltBadge alt={stop.alt} />
            <NightBadge nights={stop.nights} />
          </div>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <IconChoice size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#7c3aed" }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7c3aed" }}>Sleep</p>
              <p className="text-sm" style={{ color: "#cbd5e1" }}>{stop.sleep}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Compass size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#0ea5e9" }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#0ea5e9" }}>Activities</p>
              <p className="text-sm" style={{ color: "#cbd5e1" }}>{stop.activities}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mountain size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#e11d48" }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#e11d48" }}>Passes to get here</p>
              {stop.passes.length > 0 ? (
                <div className="flex flex-wrap gap-2">{stop.passes.map((p) => <PassChip key={p.name} name={p.name} alt={p.alt} />)}</div>
              ) : stop.passNote ? (
                <p className="text-sm italic" style={{ color: "#64748b" }}>{stop.passNote}</p>
              ) : (
                <p className="text-sm italic" style={{ color: "#475569" }}>Flight / road in — none</p>
              )}
              {stop.passes.length > 0 && stop.passNote && (
                <p className="text-xs mt-2 italic" style={{ color: "#64748b" }}>{stop.passNote}</p>
              )}
            </div>
          </div>

          {stop.notes.length > 0 && stop.notes.map((note, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: "#92400e12", border: "1px solid #92400e33" }}>
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />
              <p className="text-sm" style={{ color: "#fbbf24" }}>{note}</p>
            </div>
          ))}
        </div>
      </div>
    </RevealDiv>
  );
}

function Itinerary() {
  return (
    <section id="itinerary" className="w-full py-20 px-4" style={{ background: "#0b0e15" }}>
      <div className="max-w-3xl mx-auto">
        <RevealDiv className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "#e11d48" }}>The Route</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#f1f1f1" }}>Day-by-Day Itinerary</h2>
        </RevealDiv>
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-2 md:left-6 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, #e11d4800, #e11d48, #e11d48, #e11d4800)" }} />
          {STOPS.map((s) => <StopCard key={s.num} stop={s} />)}
        </div>
      </div>
    </section>
  );
}

// ─── PASSES SECTION ──────────────────────────────────────────────────────────

function PassCard({ pass }) {
  const bg = pass.type === "record" ? "#92400e15" : pass.type === "high" ? "#e11d4812" : "#181b25";
  const border = pass.type === "record" ? "#92400e44" : pass.type === "high" ? "#e11d4833" : "#1e2230";
  const altColor = pass.type === "record" ? "#fbbf24" : pass.type === "high" ? "#fb7185" : "#94a3b8";

  return (
    <div className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.03]" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="font-bold text-base" style={{ color: "#f1f1f1" }}>
          {pass.name}
          {pass.name === "Mig La" && <span style={{ color: "#fbbf24" }}>*</span>}
        </h4>
        {pass.type === "record" && <Star size={16} style={{ color: "#fbbf24" }} />}
        {pass.type === "high" && <Mountain size={16} style={{ color: "#fb7185" }} />}
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ color: altColor }}>{pass.display}</p>
      <p className="text-xs mb-3" style={{ color: "#64748b" }}>{pass.feet}</p>
      <p className="text-xs" style={{ color: "#475569" }}>{pass.leg}</p>
      {pass.note && (
        <p className="text-xs mt-2 font-medium italic" style={{ color: pass.type === "record" ? "#fbbf24" : "#fb7185" }}>{pass.note}</p>
      )}
    </div>
  );
}

function PassesSection() {
  const [sortByAlt, setSortByAlt] = useState(false);
  const sorted = sortByAlt ? [...ALL_PASSES].sort((a, b) => b.alt - a.alt) : ALL_PASSES;

  return (
    <section id="passes" className="w-full py-20 px-4" style={{ background: "#0f1117" }}>
      <div className="max-w-5xl mx-auto">
        <RevealDiv className="text-center mb-6">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "#e11d48" }}>High Altitude</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#f1f1f1" }}>All 11 Passes</h2>
        </RevealDiv>
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setSortByAlt(!sortByAlt)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ background: "#1e2230", color: "#94a3b8", border: "1px solid #2a2e3d" }}
          >
            <ArrowUpDown size={14} />
            {sortByAlt ? "Sort by route order" : "Sort by altitude"}
          </button>
        </div>
        <div className="flex justify-center gap-4 flex-wrap mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#fbbf24" }}><Star size={12} /> World record</span>
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#fb7185" }}><Mountain size={12} /> High / challenging</span>
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>● Standard</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((p, i) => (
            <RevealDiv key={p.name} delay={i * 0.05}>
              <PassCard pass={p} />
            </RevealDiv>
          ))}
        </div>
        <p className="text-center text-xs mt-8 italic" style={{ color: "#475569" }}>
          * Mig La access subject to army clearance — confirm on ground in Leh
        </p>
      </div>
    </section>
  );
}

// ─── PRACTICAL INFO ──────────────────────────────────────────────────────────

const PRACTICAL = [
  {
    icon: Shield, title: "Permits", color: "#7c3aed",
    text: "ILP required for Nubra, Pangong, Hanle, Karzok/Chumur — collect from DC office Leh on Day 1.",
  },
  {
    icon: Fuel, title: "Fuel", color: "#f59e0b",
    text: "Fill at Leh and Diskit (last pump). Carry extra jerry can from Diskit onwards.",
  },
  {
    icon: Wifi, title: "Connectivity", color: "#0ea5e9",
    text: "Airtel/Jio postpaid works most of Nubra and Shyok. BSNL only in Hanle. No network at Tso Moriri.",
  },
  {
    icon: Heart, title: "Health", color: "#ef4444",
    text: "Carry oxygen cylinders from Leh. AMS risk above 4,500m. Max 15 min at Umling La. Acclimatise 1 full day in Leh before driving.",
  },
];

function PracticalInfo() {
  return (
    <section id="info" className="w-full py-20 px-4" style={{ background: "#0b0e15" }}>
      <div className="max-w-5xl mx-auto">
        <RevealDiv className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "#e11d48" }}>Be Prepared</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#f1f1f1" }}>Practical Info</h2>
        </RevealDiv>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRACTICAL.map((p, i) => {
            const Icon = p.icon;
            return (
              <RevealDiv key={p.title} delay={i * 0.1}>
                <div className="rounded-xl p-6 h-full" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: p.color + "18" }}>
                      <Icon size={20} style={{ color: p.color }} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: "#f1f1f1" }}>{p.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{p.text}</p>
                </div>
              </RevealDiv>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="w-full py-10 px-4 text-center" style={{ background: "#0f1117", borderTop: "1px solid #1e2230" }}>
      <p className="text-lg font-semibold" style={{ color: "#f1f1f1" }}>
        Ladakh <span style={{ color: "#e11d48" }}>2026</span> · Oct 3–12
      </p>
      <p className="text-xs mt-3 italic" style={{ color: "#475569" }}>
        Mig La access subject to army clearance — confirm on ground in Leh
      </p>
      <div className="flex justify-center gap-1 mt-6">
        {[Mountain, Star, MapPin].map((Icon, i) => (
          <Icon key={i} size={14} style={{ color: "#2a2e3d" }} />
        ))}
      </div>
    </footer>
  );
}

// ─── NAV BAR ─────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label: "Route", href: "#stats" },
    { label: "Itinerary", href: "#itinerary" },
    { label: "Passes", href: "#passes" },
    { label: "Info", href: "#info" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-3 transition-all duration-300"
      style={{
        zIndex: 50,
        background: scrolled ? "#0f1117ee" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #1e2230" : "1px solid transparent",
      }}
    >
      <a href="#hero" className="text-sm font-bold tracking-wide" style={{ color: "#e11d48" }}>
        LADAKH '26
      </a>
      <div className="flex items-center gap-5">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="text-xs tracking-wider uppercase transition-colors duration-200 hover:text-white" style={{ color: "#64748b" }}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function LadakhTrip() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.body.style.background = "#0f1117";
    document.body.style.margin = "0";
    return () => { document.documentElement.style.scrollBehavior = ""; };
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", color: "#e2e8f0", background: "#0f1117", minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <StatsBar />
      <Itinerary />
      <PassesSection />
      <PracticalInfo />
      <Footer />
    </div>
  );
}