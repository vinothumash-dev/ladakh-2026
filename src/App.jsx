import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import ZANSKAR_GPX from "./zanskar-gpx.js";
import {
  Mountain, MapPin, Moon, Star, AlertTriangle, Fuel, Wifi, Heart,
  ChevronDown, Route, ArrowUpDown, Navigation, Shield, Compass,
  Tent, Home, Plane, Droplets, Wind, Waves, ChevronRight, ArrowUp,
  X, ChevronLeft, Camera,
} from "lucide-react";

// ─── THEME COLORS ─────────────────────────────────────────────────────────────
const THEMES = {
  "sahyadri-2023": { accent: "#059669", bg: "#05966918", border: "#05966933" },
  "sahyadri-2024": { accent: "#0891b2", bg: "#0891b218", border: "#0891b233" },
  "zanskar-2025":  { accent: "#7c3aed", bg: "#7c3aed18", border: "#7c3aed33" },
  "ladakh-2026":   { accent: "#e11d48", bg: "#e11d4818", border: "#e11d4833" },
};

// ─── PHOTO MAPS ───────────────────────────────────────────────────────────────
// Key = stop name, value = array of { file, caption }
// Replace placeholders by renaming your photo to the matching number.
const PHOTOS = {
  "sahyadri-2023": {
    "Gokarna": [
      { file: "1.JPG", caption: "Murudeshwar Temple" },
    ],
    "Goa": [
      { file: "2.jpg", caption: "Butterfly Beach" },
    ],
    "Amboli": [
      { file: "3.jpg", caption: "Amboli Waterfalls" },
    ],
    "Mahad": [
      { file: "4.JPG", caption: "Mahabaleshwar viewpoint" },
    ],
    "Bhagad": [
      { file: "5.JPG", caption: "Nanemachi Waterfalls" },
      { file: "6.png", caption: "Kumbhe Waterfalls" },
      { file: "7.JPG", caption: "Devkund Waterfalls" },
    ],
  },
  "sahyadri-2024": {
    "Bhandardara": [
      { file: "1.jpg", caption: "Bhandardara lake & dam" },
      { file: "2.jpg", caption: "Vasundhara Waterfalls" },
    ],
    "Malshej Ghat": [
      { file: "3.jpg",  caption: "Malshej Ghat viewpoint" },
      { file: "4.jpg",  caption: "Aadrai Jungle Trail" },
      { file: "5.JPG",  caption: "Kalu Top View Trek" },
      { file: "6.jpg",  caption: "Kalu Waterfall Base Trek" },
    ],
    "Lonavala": [
      { file: "7.jpg",  caption: "Ghat Road" },
      { file: "8.jpg",  caption: "Kataldhar Waterfalls" },
      { file: "13.jpg", caption: "Lonavala" },
    ],
    "Bhagad": [
      { file: "9.jpg",  caption: "Devkund Waterfalls" },
      { file: "10.jpg", caption: "Nanemachi Waterfalls" },
      { file: "11.jpg", caption: "Kumbhe Waterfalls" },
      { file: "12.jpg", caption: "Savlya Ghat Viewpoint" },
    ],
  },
  "zanskar-2025": {
    "Kargil": [
      { file: "1.jpg",  caption: "Sonamarg (en route)" },
      { file: "2.JPG",  caption: "Dras Valley" },
    ],
    "Leh": [
      { file: "3.jpg",  caption: "Leh" },
      { file: "4.JPG",  caption: "Lamayuru · Padum (en route)" },
    ],
    "Padum": [
      { file: "5.jpg",  caption: "Sir Sir La" },
      { file: "6.jpg",  caption: "Singe La" },
      { file: "7.jpg",  caption: "Padum" },
    ],
    "Tandi": [
      { file: "8.jpg",  caption: "Padum · Darcha (en route)" },
      { file: "9.jpg",  caption: "Shinku La" },
      { file: "10.png", caption: "Gonbo Rangjon" },
      { file: "11.jpg", caption: "Tandi" },
    ],
    "Kaza": [
      { file: "12.jpg", caption: "Keylong (en route)" },
      { file: "13.jpg", caption: "Spiti River" },
      { file: "14.jpg", caption: "Spiti Valley" },
      { file: "17.jpg", caption: "Chicham Bridge" },
    ],
    "Losar": [
      { file: "18.jpg", caption: "Losar" },
      { file: "15.jpg",  caption: "Chenab River" },
      { file: "16.jpg",  caption: "Chenab River" }
    ],
    "Hudan Bhatori": [
      { file: "19.jpg",  caption: "Rashil" },
      { file: "20.jpg",  caption: "Hudan Bhatori" },
      { file: "21.jpeg", caption: "Hudan Bhatori" },
    ],
    "Kishtwar": [
      { file: "22.jpg",  caption: "Pangi Valley" },
      { file: "23.jpg", caption: "Kishtwar" },
    ],
    "Srinagar": [
      { file: "24.JPG", caption: "The End" },
    ],
  },
};

// ─── SAHYADRI 2023 ────────────────────────────────────────────────────────────
const SAHYADRI_2023 = {
  id: "sahyadri-2023",
  name: "Sahyadri 2023",
  route: "Mangalore → Pune",
  dates: "16–22 Sep 2023",
  tagline: "Coast to Cloud Forest · 7 days",
  nights: 6,
  distance: "~900 km",
  highlights: "5 waterfalls · 4 states · Coastal + Ghats",
  stops: [
    { num: 1, name: "Gokarna",  date: "16 Sep", nights: "1N", stay: "Guesthouse in Gokarna",  enroute: ["Murudeshwar Temple"], note: null },
    { num: 2, name: "Goa",      date: "17 Sep", nights: "1N", stay: "Hotel in Goa",           enroute: ["Butterfly Beach"],    note: null },
    { num: 3, name: "Amboli",   date: "18 Sep", nights: "1N", stay: "Stay in Amboli",         enroute: ["Amboli Waterfalls"],  note: null },
    { num: 4, name: "Mahad",    date: "19 Sep", nights: "1N", stay: "Stay in Mahad",          enroute: ["Mahabaleshwar"],      note: null },
    { num: 5, name: "Bhagad",   date: "20–21 Sep", nights: "2N", stay: "Bhagad camp / homestay",
      enroute: ["Nanemachi Waterfalls (Day 1)", "Kumbhe Waterfalls (Day 1)", "Devkund Waterfalls (Day 2)"], note: null },
    { num: 6, name: "Pune",     date: "22 Sep", nights: "Arrival", stay: "End of trip", enroute: [], note: null },
  ],
  attractions: [
    { name: "Murudeshwar Temple",  type: "Temple",       day: "Day 1 en route" },
    { name: "Butterfly Beach",     type: "Beach",        day: "Day 2 en route" },
    { name: "Amboli Waterfalls",   type: "Waterfall",    day: "Day 3 en route" },
    { name: "Mahabaleshwar",       type: "Hill Station", day: "Day 4 en route" },
    { name: "Nanemachi Waterfalls",type: "Waterfall",    day: "Day 5" },
    { name: "Kumbhe Waterfalls",   type: "Waterfall",    day: "Day 5" },
    { name: "Devkund Waterfalls",  type: "Waterfall",    day: "Day 6" },
  ],
};

// ─── SAHYADRI 2024 ────────────────────────────────────────────────────────────
const SAHYADRI_2024 = {
  id: "sahyadri-2024",
  name: "Sahyadri 2024",
  route: "Mumbai → Mumbai",
  dates: "21–29 Sep 2024",
  tagline: "Monsoon Loop · 9 days",
  nights: 8,
  distance: "~700 km",
  highlights: "6 waterfalls · Jungle trails · Full Sahyadri circuit",
  stops: [
    { num: 1, name: "Bhandardara", date: "21 Sep", nights: "1N", stay: "Stay in Bhandardara",
      enroute: ["Vasundhara Waterfalls"], note: null },
    { num: 2, name: "Malshej Ghat", date: "22–23 Sep", nights: "2N", stay: "Stay at Malshej Ghat",
      enroute: ["Aadrai Jungle Trail (Day 2)", "Kalu Top View Trek (Day 2)", "Kalu Waterfall Base Trek (Day 2)"], note: null },
    { num: 3, name: "Lonavala", date: "24 Sep", nights: "1N", stay: "Stay in Lonavala",
      enroute: ["Ghat Road (en route)", "Kataldhar Waterfalls (en route)"], note: null },
    { num: 4, name: "Bhagad", date: "25–28 Sep", nights: "4N", stay: "Bhagad camp / homestay",
      enroute: ["Devkund Waterfalls (Day 2)", "Nanemachi Waterfalls + Kumbhe Waterfalls (Day 3)", "Savlya Ghat Viewpoint (Day 4)"], note: null },
    { num: 5, name: "Mumbai", date: "29 Sep", nights: "Return", stay: "End of trip", enroute: [], note: null },
  ],
  attractions: [
    { name: "Vasundhara Waterfalls",    type: "Waterfall",        day: "Day 1" },
    { name: "Aadrai Jungle Trail",      type: "Trek",             day: "Day 3" },
    { name: "Kalu Top View Trek",       type: "Trek",             day: "Day 3" },
    { name: "Kalu Waterfall Base Trek", type: "Waterfall + Trek", day: "Day 3" },
    { name: "Ghat Road",               type: "Scenic Drive",     day: "Day 4 en route" },
    { name: "Kataldhar Waterfalls",     type: "Waterfall",        day: "Day 4 en route" },
    { name: "Devkund Waterfalls",       type: "Waterfall",        day: "Day 6" },
    { name: "Nanemachi Waterfalls",     type: "Waterfall",        day: "Day 7" },
    { name: "Kumbhe Waterfalls",        type: "Waterfall",        day: "Day 7" },
    { name: "Savlya Ghat Viewpoint",    type: "Viewpoint",        day: "Day 8" },
  ],
};

// ─── ZANSKAR 2025 ─────────────────────────────────────────────────────────────
const ZANSKAR_2025 = {
  id: "zanskar-2025",
  name: "Zanskar 2025",
  route: "Srinagar → Srinagar",
  dates: "2025",
  tagline: "Kashmir to Spiti · The Great Zanskar Loop · 1,884 km",
  nights: 9,
  distance: "1,884 km",
  highlights: "5 passes · 6 valleys · 7 rivers",
  stops: [
    { num: 1, name: "Kargil",        nights: "1N",     alt: "~2,676m", valley: "Dras Valley",    river: "Dras River",           stay: "Hotel in Kargil",        passes: [{ name: "Zoji La", alt: "3,528m" }], passNote: null, note: null,      visited: ["Sonamarg (en route)", "Dras Valley"] },
    { num: 2, name: "Leh",           nights: "1N",     alt: "3,524m",  valley: "—",              river: "Indus River",           stay: "Hotel in Leh",           passes: [], passNote: "NH1 through Suru Valley", note: null,                              visited: ["Leh Palace", "Shanti Stupa", "Indus Valley"] },
    { num: 3, name: "Padum",         nights: "1N",     alt: "~3,657m", valley: "Zanskar Valley", river: "Suru + Zanskar Rivers", stay: "Guesthouse in Padum",    passes: [{ name: "Sir Sir La", alt: "~4,800m" }, { name: "Singe La", alt: "~5,090m" }], passNote: "Via Lamayuru → Sir Sir La → Singe La", note: null, visited: ["Lamayuru (en route)", "Sir Sir La", "Singe La", "Padum", "Gonbo Rangjon"] },
    { num: 4, name: "Tandi",         nights: "1N",     alt: "~2,700m", valley: "Chenab Valley",  river: "Tsarap River",          stay: "Stay in Tandi",          passes: [{ name: "Shinku La", alt: "5,091m" }], passNote: null, note: null,          visited: ["Shinku La", "Padum–Darcha stretch", "Tandi"] },
    { num: 5, name: "Kaza",          nights: "1N",     alt: "~3,800m", valley: "Spiti Valley",   river: "Spiti River",           stay: "Guesthouse in Kaza",     passes: [], passNote: "Lahaul valley road into Spiti", note: null,                      visited: ["Keylong (en route)", "Spiti River", "Spiti Valley", "Chicham Bridge"] },
    { num: 6, name: "Losar",         nights: "1N",     alt: "~4,079m", valley: "Spiti Valley",   river: "Spiti River",           stay: "Stay in Losar",          passes: [{ name: "Kunzum La", alt: "4,590m" }], passNote: null, note: null,          visited: ["Losar village"] },
    { num: 7, name: "Hudan Bhatori", nights: "1N",     alt: "~2,800m", valley: "Pangi Valley",   river: "Chenab River",          stay: "Remote village stay",    passes: [], passNote: "Pangi Valley road — one of India's most remote", note: "Sister hill range to Sural Bhatori. Extremely remote — limited facilities.", visited: ["Rashil", "Chenab River", "Pangi Valley", "Hudan Bhatori"] },
    { num: 8, name: "Kishtwar",      nights: "1N",     alt: "~1,680m", valley: "Chenab Valley",  river: "Chenab River",          stay: "Hotel in Kishtwar",      passes: [], passNote: null, note: null,                                                  visited: ["Kishtwar"] },
    { num: 9, name: "Srinagar",      nights: "Return", alt: "~1,585m", valley: "Kashmir Valley", river: "Jhelum River",          stay: "End of trip",            passes: [], passNote: null, note: null,                                                  visited: [] },
  ],
  passes: [
    { name: "Zoji La",    alt: 3528, display: "3,528m", feet: "11,575ft", leg: "Srinagar → Kargil" },
    { name: "Sir Sir La", alt: 4800, display: "~4,800m",feet: "~15,748ft",leg: "Leh → Padum (via Lamayuru)" },
    { name: "Singe La",   alt: 5090, display: "~5,090m",feet: "~16,699ft",leg: "Leh → Padum" },
    { name: "Shinku La",  alt: 5091, display: "5,091m", feet: "16,703ft", leg: "Padum → Tandi" },
    { name: "Kunzum La",  alt: 4590, display: "4,590m", feet: "15,059ft", leg: "Losar → Hudan Bhatori" },
  ],
  valleys: ["Dras", "Suru", "Zanskar", "Spiti", "Pangi", "Chenab"],
  rivers:  ["Dras", "Suru", "Indus", "Zanskar", "Tsarap", "Spiti", "Chenab"],
};

// ─── LADAKH 2026 ──────────────────────────────────────────────────────────────
const LADAKH_STOPS = [
  { num: 1, name: "Leh",    date: "3 Oct",     nights: "Arrival",   alt: "3,524m",  sleep: "Hotel in Leh",   activities: "Arrive, rest, acclimatise. Leh Palace, Shanti Stupa, Hall of Fame. Collect all permits (ILP for Nubra, Pangong, Hanle, Karzok/Chumur) from DC office.", passes: [], passNote: null, notes: ["Spend day collecting permits. No exertion on day 1."] },
  { num: 2, name: "Diskit", date: "4–5 Oct",   nights: "1N",        alt: "3,072m",  sleep: "Guesthouse or camp in Diskit / Hunder", activities: "Diskit Monastery, 106ft Maitreya Buddha statue, Hunder sand dunes, Bactrian camel safari.", passes: [{ name: "Khardung La", alt: "5,359m" }], passNote: null, notes: ["Fill fuel fully at Diskit — last reliable petrol pump for days."] },
  { num: 3, name: "Merak",  date: "5–6 Oct",   nights: "1N",        alt: "~4,350m", sleep: "Village homestay — book via driver in advance, very basic", activities: "Pangong south shore walk, nomadic Changpa culture, raw lake views beyond Spangmik.", passes: [], passNote: "No high pass — Shyok valley road via Khalsar → Agham → Durbuk → Tangtse", notes: ["Indians only beyond Merak. Foreigners not permitted."] },
  { num: 4, name: "Rhongo", date: "6–7 Oct",   nights: "1N",        alt: "~4,200m", sleep: "Basic homestay", activities: "Rest after brutal Merak–Chusul dirt track. Indus valley views. Optional Mig La recce with driver.", passes: [{ name: "Chusul La", alt: "~4,350m" }, { name: "Rezang La", alt: "~4,650m" }, { name: "Tsaga La", alt: "4,635m" }], passNote: null, notes: ["Dirt track Merak→Chusul. Army checkposts throughout. Submit photography equipment at Loma checkpoint.", "Mig La contingency: if army permits civilian access, detour Rhongo → Likaru → Mig La 5,913m → Fukche → Hanle is possible — confirm in Leh."] },
  { num: 5, name: "Hanle",  date: "7–9 Oct",   nights: "2N",        alt: "4,300m",  sleep: "Padma Homestay recommended — book in advance. BSNL network only.", activities: "Night 1 — rest, stargazing (one of Asia's darkest skies, Milky Way visible), Hanle Monastery. Day 2 — Umling La loop: Hanle → Photi La 5,524m → Nurbu La ~5,400m → Umling La 5,799m (world's 2nd highest motorable road) → back to Hanle (~216km full day).", passes: [], passNote: "Direct road from Rhongo via Loma junction (~48km, 1hr)", notes: ["No ATMs in Hanle — carry sufficient cash.", "Carry oxygen cylinder. Max 15 min at Umling La summit. Acclimatise first night fully before attempting Umling La."] },
  { num: 6, name: "Karzok", date: "9–10 Oct",  nights: "1N",        alt: "4,522m",  label: "Tso Moriri", sleep: "Hotel or homestay in Karzok village", activities: "Walk on Tso Moriri shore, Korzok Monastery (17th century), bar-headed geese and black-necked cranes still present in October.", passes: [{ name: "Namashang La", alt: "~4,800m" }], passNote: "Route: Hanle → Loma → Nyoma → Mahe → Sumdo → Namashang La → Karzok (~150km).", notes: [] },
  { num: 7, name: "Thukje", date: "10–11 Oct", nights: "1N",        alt: "~4,100m", sleep: "Basic guesthouse — decompression night before Leh", activities: "Thukje Monastery, Indus River valley views, relative warmth after high altitude days.", passes: [{ name: "Polo Kongka La", alt: "~4,900m" }, { name: "Taglang La", alt: "5,328m" }], passNote: "Route: Karzok → Sumdo → Polo Kongka La → Tso Kar → Debring → Taglang La → Rumtse → Pang → Thukje (~145km)", notes: ["Sumdo–Polo Kongka La road extremely rough. Taglang La can have early snow in October."] },
  { num: 8, name: "Leh",    date: "11–12 Oct", nights: "Departure", alt: "3,524m",  sleep: "Hotel in Leh", activities: "Thiksey Monastery, Shey Palace en route from Thukje. Leh market for souvenirs. Rest.", passes: [], passNote: "NH3 → Upshi → NH1 Indus valley road — smooth, no major pass (~200km, 4–5hrs)", notes: [] },
];

const LADAKH_PASSES = [
  { name: "Khardung La",   alt: 5359, display: "5,359m", feet: "17,582ft", leg: "Leh → Diskit",           type: "high" },
  { name: "Chusul La",     alt: 4350, display: "~4,350m",feet: "~14,272ft",leg: "Merak → Rhongo",         type: "default" },
  { name: "Rezang La",     alt: 4650, display: "~4,650m",feet: "~15,256ft",leg: "Merak → Rhongo",         type: "default" },
  { name: "Tsaga La",      alt: 4635, display: "4,635m", feet: "15,207ft", leg: "Merak → Rhongo",         type: "default" },
  { name: "Mig La",        alt: 5913, display: "5,913m", feet: "19,400ft", leg: "Rhongo → Hanle (contingency)", type: "record", note: "World's highest motorable road*" },
  { name: "Photi La",      alt: 5524, display: "5,524m", feet: "18,124ft", leg: "Hanle → Umling La loop", type: "high" },
  { name: "Nurbu La",      alt: 5400, display: "~5,400m",feet: "~17,717ft",leg: "Hanle → Umling La loop", type: "default" },
  { name: "Umling La",     alt: 5799, display: "5,799m", feet: "19,024ft", leg: "Hanle → Umling La loop", type: "record", note: "World's 2nd highest motorable road" },
  { name: "Namashang La",  alt: 4800, display: "~4,800m",feet: "~15,748ft",leg: "Hanle → Karzok",         type: "default" },
  { name: "Polo Kongka La",alt: 4900, display: "~4,900m",feet: "~16,076ft",leg: "Karzok → Thukje",        type: "default" },
  { name: "Taglang La",    alt: 5328, display: "5,328m", feet: "17,480ft", leg: "Karzok → Thukje",        type: "high" },
];

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(26px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
function Lightbox({ photos, startIndex, tripId, stopName, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const [loaded, setLoaded] = useState(false);
  const { accent } = THEMES[tripId];
  const photo = photos[idx];
  const basePath = `${import.meta.env.BASE_URL}images/${tripId}/`;

  const prev = useCallback(() => { setLoaded(false); setIdx(i => (i - 1 + photos.length) % photos.length); }, [photos.length]);
  const next = useCallback(() => { setLoaded(false); setIdx(i => (i + 1) % photos.length); }, [photos.length]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose, prev, next]);

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.96)", backdropFilter: "blur(16px)", zIndex: 9999 }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
        style={{ background: "#ffffff18", border: "1px solid #ffffff22" }}
        onClick={onClose}
      >
        <X size={18} color="#fff" />
      </button>

      {/* Location + counter */}
      <div className="absolute top-5 left-5 z-10">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: accent }}>{stopName}</p>
        <p className="text-white font-medium text-sm mt-0.5">{photo.caption}</p>
        <p className="text-xs mt-1" style={{ color: "#64748b" }}>{idx + 1} / {photos.length}</p>
      </div>

      {/* Prev arrow */}
      {photos.length > 1 && (
        <button
          className="absolute left-4 md:left-8 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
          style={{ background: "#ffffff12", border: "1px solid #ffffff20" }}
          onClick={e => { e.stopPropagation(); prev(); }}
        >
          <ChevronLeft size={22} color="#fff" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative flex items-center justify-center"
        style={{ maxWidth: "min(90vw, 1100px)", maxHeight: "85vh", width: "100%" }}
        onClick={e => e.stopPropagation()}
      >
        <img
          key={photo.file}
          src={`${basePath}${photo.file}`}
          alt={photo.caption}
          onLoad={() => setLoaded(true)}
          className="rounded-xl object-contain"
          style={{
            maxWidth: "100%",
            maxHeight: "85vh",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "scale(1)" : "scale(0.97)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
            boxShadow: `0 0 80px ${accent}22`,
          }}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${accent} transparent transparent transparent` }} />
          </div>
        )}
      </div>

      {/* Next arrow */}
      {photos.length > 1 && (
        <button
          className="absolute right-4 md:right-8 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
          style={{ background: "#ffffff12", border: "1px solid #ffffff20" }}
          onClick={e => { e.stopPropagation(); next(); }}
        >
          <ChevronRight size={22} color="#fff" />
        </button>
      )}

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {photos.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setLoaded(false); setIdx(i); }}
              className="rounded-full transition-all duration-300"
              style={{ width: i === idx ? 20 : 6, height: 6, background: i === idx ? accent : "#ffffff44" }} />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

// ─── PHOTO THUMBNAIL ──────────────────────────────────────────────────────────
function PhotoThumb({ src, caption, color, onClick }) {
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={status === "ok" ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 relative rounded-xl overflow-hidden"
      style={{
        width: 220, height: 148,
        scrollSnapAlign: "start",
        cursor: status === "ok" ? "pointer" : "default",
        background: "#0f1117",
        border: `1px solid ${status === "error" ? "#2a2e3d" : "#1e2230"}`,
      }}
    >
      {/* Image */}
      <img
        src={src}
        alt=""
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          opacity: status === "ok" ? 1 : 0,
          transform: hovered && status === "ok" ? "scale(1.06)" : "scale(1)",
          filter: hovered && status === "ok" ? "brightness(1.08)" : "brightness(1)",
          transition: "transform 0.45s ease, filter 0.45s ease, opacity 0.3s ease",
        }}
      />

      {/* Loading shimmer */}
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(90deg, #1e2230 0%, #2a2e3d 50%, #1e2230 100%)" }} />
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Camera size={20} style={{ color: "#2a2e3d" }} />
          <p className="text-xs text-center px-3" style={{ color: "#374151" }}>Photo missing<br />Re-upload file</p>
        </div>
      )}

      {/* Caption overlay — always slightly visible at bottom, stronger on hover */}
      {status === "ok" && (
        <div
          className="absolute inset-0 flex items-end"
          style={{
            background: hovered
              ? "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)"
              : "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
            transition: "background 0.35s ease",
          }}
        >
          <p className="text-white text-xs px-3 pb-2.5 leading-snug font-medium w-full" style={{ opacity: hovered ? 1 : 0.85, transition: "opacity 0.3s" }}>
            {caption}
          </p>
        </div>
      )}

      {/* Expand icon on hover */}
      {status === "ok" && hovered && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: `${color}dd`, boxShadow: `0 0 8px ${color}88` }}>
          <Camera size={12} color="#fff" />
        </div>
      )}
    </button>
  );
}

// ─── PHOTO STRIP ──────────────────────────────────────────────────────────────
function PhotoStrip({ tripId, stopName, color }) {
  const photos = PHOTOS[tripId]?.[stopName];
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (!photos || photos.length === 0) return null;
  const basePath = `${import.meta.env.BASE_URL}images/${tripId}/`;

  return (
    <>
      <div className="mt-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Camera size={13} style={{ color }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            {photos.length} photo{photos.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Horizontal scroll strip */}
        <div
          className="flex gap-3 overflow-x-auto"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: 4,
          }}
        >
          {photos.map((p, i) => (
            <PhotoThumb
              key={p.file}
              src={`${basePath}${p.file}`}
              caption={p.caption}
              color={color}
              onClick={() => setLightboxIdx(i)}
            />
          ))}
        </div>
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          startIndex={lightboxIdx}
          tripId={tripId}
          stopName={stopName}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

// ─── STARFIELD + MOUNTAIN SVG ─────────────────────────────────────────────────
function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, stars = [];
    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * canvas.offsetWidth, y: Math.random() * canvas.offsetHeight * 0.7,
        r: Math.random() * 1.4 + 0.3, a: Math.random(), spd: Math.random() * 0.007 + 0.002, ph: Math.random() * Math.PI * 2,
      }));
    }
    function draw(t) {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      stars.forEach(s => {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * s.spd + s.ph));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${tw * s.a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    resize(); raf = requestAnimationFrame(draw); window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

function MountainSVG() {
  return (
    <div className="absolute bottom-0 left-0 w-full" style={{ zIndex: 1, height: "38%" }}>
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,400 L0,280 Q60,220 120,260 Q180,200 240,230 Q320,140 400,200 Q440,170 500,210 Q560,120 640,180 Q700,90 760,160 Q820,80 880,140 Q940,60 1020,130 Q1080,70 1140,120 Q1200,90 1280,160 Q1340,110 1400,180 L1440,150 L1440,400 Z" fill="#1a1a2e" opacity="0.7"/>
        <path d="M0,400 L0,320 Q80,270 160,300 Q240,240 340,280 Q400,220 480,270 Q560,190 660,250 Q740,170 820,230 Q900,160 980,220 Q1060,170 1140,200 Q1220,160 1300,210 Q1360,180 1440,220 L1440,400 Z" fill="#12121f" opacity="0.85"/>
        <path d="M0,400 L0,350 Q100,310 200,340 Q300,290 420,330 Q520,280 620,320 Q720,270 840,310 Q940,280 1060,320 Q1160,290 1260,330 Q1340,300 1440,340 L1440,400 Z" fill="#0f1117"/>
      </svg>
    </div>
  );
}

// ─── PORTFOLIO HERO ───────────────────────────────────────────────────────────
const TRIP_CARDS = [
  { id: "sahyadri-2023", year: "'23", name: "Sahyadri 2023", route: "Mangalore → Pune",   km: "~900 km",  nights: 6, tag: "Coast + Ghats" },
  { id: "sahyadri-2024", year: "'24", name: "Sahyadri 2024", route: "Mumbai → Mumbai",     km: "~700 km",  nights: 8, tag: "Monsoon Loop" },
  { id: "zanskar-2025",  year: "'25", name: "Zanskar 2025",  route: "Srinagar → Srinagar", km: "1,884 km", nights: 9, tag: "5 Passes · 6 Valleys" },
  { id: "ladakh-2026",   year: "'26", name: "Ladakh 2026",   route: "Leh → Leh",           km: "~1,400 km",nights: 8, tag: "UPCOMING · 11 Passes", upcoming: true },
];

function PortfolioHero() {
  return (
    <section id="home" className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: "100vh", background: "linear-gradient(180deg,#050810 0%,#0f1117 100%)" }}>
      <Starfield />
      <MountainSVG />
      <div className="relative text-center px-6 pt-20 pb-16" style={{ zIndex: 2 }}>
        <Reveal><p className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "#e11d48" }}>Vinoth · Road Trip Chronicles</p></Reveal>
        <Reveal delay={0.1}><h1 className="font-bold" style={{ fontSize: "clamp(2.8rem,7vw,6rem)", lineHeight: 1.08, color: "#f1f1f1" }}>4 Trips.<br /><span style={{ color: "#e11d48" }}>One Obsession.</span></h1></Reveal>
        <Reveal delay={0.2}><p className="mt-5 text-base max-w-lg mx-auto" style={{ color: "#64748b" }}>Sahyadri '23 · Sahyadri '24 · Zanskar '25 · Ladakh '26</p></Reveal>
        <Reveal delay={0.3}>
          <div className="flex justify-center gap-8 mt-8 flex-wrap">
            {[{ label: "Total KMs", value: "~4,984" }, { label: "Total Nights", value: "31" }, { label: "Passes", value: "16" }].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold" style={{ color: "#f1f1f1" }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.42}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 max-w-4xl mx-auto">
            {TRIP_CARDS.map(t => {
              const th = THEMES[t.id];
              return (
                <a key={t.id} href={`#${t.id}`}
                  className="rounded-xl p-4 text-left transition-all duration-300 hover:scale-105"
                  style={{ background: t.upcoming ? th.bg : "#181b25", border: `1px solid ${t.upcoming ? th.border : "#1e2230"}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: th.bg, color: th.accent, border: `1px solid ${th.border}` }}>{t.year}</span>
                    {t.upcoming && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#e11d48", color: "#fff" }}>UPCOMING</span>}
                  </div>
                  <p className="font-bold mt-2 text-sm" style={{ color: "#f1f1f1" }}>{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{t.route}</p>
                  <p className="text-xs mt-2 font-medium" style={{ color: th.accent }}>{t.tag}</p>
                  <p className="text-xs mt-1.5" style={{ color: "#374151" }}>{t.km} · {t.nights}N</p>
                </a>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function TripHeader({ id, name, route, dates, tagline, nights, distance, highlights, color, bg, border }) {
  return (
    <div id={id} className="w-full py-20 px-4" style={{ background: "#0b0e15", borderTop: `2px solid ${border}` }}>
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: bg, color, border: `1px solid ${border}` }}>{name}</span>
            <span className="text-xs" style={{ color: "#475569" }}>{dates}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#f1f1f1" }}>{route}</h2>
          <p className="text-lg mt-3" style={{ color }}>{tagline}</p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="flex flex-wrap gap-8 mt-8">
            {[{ l: "Distance", v: distance }, { l: "Nights", v: `${nights}N` }, { l: "Highlights", v: highlights }].map(s => (
              <div key={s.l}>
                <p className="text-xl font-bold" style={{ color: "#f1f1f1" }}>{s.v}</p>
                <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function SLabel({ color, children }) {
  return <p className="text-xs tracking-[0.3em] uppercase mb-2 font-semibold" style={{ color }}>{children}</p>;
}

function Warning({ text }) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3" style={{ background: "#92400e12", border: "1px solid #92400e33" }}>
      <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />
      <p className="text-xs" style={{ color: "#fbbf24" }}>{text}</p>
    </div>
  );
}

// ─── JUMP NAV ─────────────────────────────────────────────────────────────────
const JUMP_LINKS = [
  { id: "sahyadri-2023", label: "Sahyadri '23" },
  { id: "sahyadri-2024", label: "Sahyadri '24" },
  { id: "zanskar-2025",  label: "Zanskar '25"  },
  { id: "ladakh-2026",   label: "Ladakh '26"   },
];

function TripJumpStrip({ currentId }) {
  return (
    <div className="w-full py-4 px-4 overflow-x-auto" style={{ background: "#080b11", borderBottom: "1px solid #1e2230" }}>
      <div className="flex items-center gap-2 min-w-max mx-auto w-fit">
        <a href="#home" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
          style={{ background: "#1e2230", color: "#64748b", border: "1px solid #2a2e3d" }}>
          <ArrowUp size={11} /> All Trips
        </a>
        <span style={{ color: "#1e2230" }}>|</span>
        {JUMP_LINKS.map(l => {
          const th = THEMES[l.id];
          const active = l.id === currentId;
          return (
            <a key={l.id} href={`#${l.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
              style={{ background: active ? th.accent : th.bg, color: active ? "#fff" : th.accent, border: `1px solid ${active ? th.accent : th.border}` }}>
              {l.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function NextTripButton({ nextId }) {
  if (!nextId) return null;
  const th = THEMES[nextId];
  const label = JUMP_LINKS.find(l => l.id === nextId)?.label;
  return (
    <div className="w-full py-10 flex justify-center" style={{ background: "#080b11" }}>
      <a href={`#${nextId}`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
        style={{ background: th.bg, color: th.accent, border: `1px solid ${th.border}` }}>
        Next: {label} <ChevronRight size={16} />
      </a>
    </div>
  );
}

// ─── SAHYADRI STOP CARD ───────────────────────────────────────────────────────
function SahyadriStop({ stop, tripId, color, bg, border }) {
  const isEnd = stop.nights === "Arrival" || stop.nights === "Return";
  const hasPhotos = PHOTOS[tripId]?.[stop.name]?.length > 0;
  return (
    <Reveal className="relative pl-10 md:pl-16 pb-10">
      <div className="absolute left-0 md:left-4 top-2 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: color, boxShadow: `0 0 10px ${color}55` }}>
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3" style={{ borderBottom: "1px solid #1e2230" }}>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl font-bold" style={{ color }}>{String(stop.num).padStart(2, "0")}</span>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#f1f1f1" }}>{stop.name}</h3>
              {stop.date && <p className="text-xs" style={{ color: "#64748b" }}>{stop.date}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEnd && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: bg, color, border: `1px solid ${border}` }}>
                <Moon size={11} /> {stop.nights}
              </span>
            )}
            {hasPhotos && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{ background: "#ffffff08", color: "#64748b", border: "1px solid #2a2e3d" }}>
                <Camera size={11} /> {PHOTOS[tripId][stop.name].length}
              </span>
            )}
          </div>
        </div>
        <div className="p-4 md:p-5 space-y-3">
          {stop.enroute.length > 0 && (
            <div className="flex items-start gap-3">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color }} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color }}>Visited</p>
                <div className="flex flex-wrap gap-2">
                  {stop.enroute.map(e => (
                    <span key={e} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                      style={{ background: bg, color, border: `1px solid ${border}` }}>
                      <Droplets size={10} /> {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Home size={14} className="flex-shrink-0" style={{ color: "#475569" }} />
            <p className="text-sm" style={{ color: "#94a3b8" }}>{stop.stay}</p>
          </div>
          {stop.note && <Warning text={stop.note} />}

          {/* ── Photo strip ── */}
          <PhotoStrip tripId={tripId} stopName={stop.name} color={color} />
        </div>
      </div>
    </Reveal>
  );
}

function SahyadriSection({ data, nextId }) {
  const { accent: color, bg, border } = THEMES[data.id];
  return (
    <>
      <TripJumpStrip currentId={data.id} />
      <TripHeader id={data.id} name={data.name} route={data.route} dates={data.dates}
        tagline={data.tagline} nights={data.nights} distance={data.distance}
        highlights={data.highlights} color={color} bg={bg} border={border} />

      {/* Timeline */}
      <div className="w-full py-16 px-4" style={{ background: "#0f1117" }}>
        <div className="max-w-2xl mx-auto">
          <Reveal className="mb-10">
            <SLabel color={color}>Itinerary</SLabel>
            <h3 className="text-2xl font-bold" style={{ color: "#f1f1f1" }}>Stop by Stop</h3>
          </Reveal>
          <div className="relative">
            <div className="absolute left-2 md:left-6 top-0 bottom-0 w-px"
              style={{ background: `linear-gradient(180deg,${color}00,${color},${color},${color}00)` }} />
            {data.stops.map(s => (
              <SahyadriStop key={s.num} stop={s} tripId={data.id} color={color} bg={bg} border={border} />
            ))}
          </div>
        </div>
      </div>

      {/* Attractions */}
      <div className="w-full py-16 px-4" style={{ background: "#0b0e15" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-10">
            <SLabel color={color}>Highlights</SLabel>
            <h3 className="text-2xl font-bold" style={{ color: "#f1f1f1" }}>Places Visited</h3>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {data.attractions.map((a, i) => (
              <Reveal key={a.name} delay={i * 0.04}>
                <div className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.04]"
                  style={{ background: "#181b25", border: "1px solid #1e2230" }}>
                  <Droplets size={18} className="mb-2" style={{ color }} />
                  <p className="text-sm font-semibold" style={{ color: "#f1f1f1" }}>{a.name}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color }}>{a.type}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{a.day}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <NextTripButton nextId={nextId} />
    </>
  );
}

// ─── ZANSKAR STOP CARD ────────────────────────────────────────────────────────
function ZanskarStop({ stop, color, bg, border }) {
  const isReturn = stop.nights === "Return";
  const hasPhotos = PHOTOS["zanskar-2025"]?.[stop.name]?.length > 0;
  return (
    <Reveal className="relative pl-10 md:pl-16 pb-10">
      <div className="absolute left-0 md:left-4 top-2 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: color, boxShadow: `0 0 10px ${color}55` }}>
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3" style={{ borderBottom: "1px solid #1e2230" }}>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl font-bold" style={{ color }}>{String(stop.num).padStart(2, "0")}</span>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#f1f1f1" }}>{stop.name}</h3>
              <p className="text-xs" style={{ color: "#64748b" }}>{stop.alt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: "#1e2230", color: "#94a3b8", border: "1px solid #2a2e3d" }}>
              <Mountain size={10} /> {stop.alt}
            </span>
            {!isReturn && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{ background: bg, color, border: `1px solid ${border}` }}>
                <Moon size={10} /> {stop.nights}
              </span>
            )}
            {hasPhotos && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{ background: "#ffffff08", color: "#64748b", border: "1px solid #2a2e3d" }}>
                <Camera size={11} /> {PHOTOS["zanskar-2025"][stop.name].length}
              </span>
            )}
          </div>
        </div>
        <div className="p-4 md:p-5 space-y-3">
          {(stop.passes.length > 0 || stop.passNote) && (
            <div className="flex items-start gap-3">
              <Mountain size={14} className="mt-0.5 flex-shrink-0" style={{ color }} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color }}>Passes</p>
                {stop.passes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1.5">
                    {stop.passes.map(p => (
                      <span key={p.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                        style={{ background: bg, color, border: `1px solid ${border}` }}>
                        {p.name} {p.alt}
                      </span>
                    ))}
                  </div>
                )}
                {stop.passNote && <p className="text-xs italic" style={{ color: "#64748b" }}>{stop.passNote}</p>}
              </div>
            </div>
          )}
          {stop.visited?.length > 0 && (
            <div className="flex items-start gap-3">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color }} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color }}>Visited</p>
                <div className="flex flex-wrap gap-2">
                  {stop.visited.map(v => (
                    <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                      style={{ background: bg, color, border: `1px solid ${border}` }}>
                      <MapPin size={10} /> {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Waves size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#475569" }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#475569" }}>Valley · River</p>
              <p className="text-sm" style={{ color: "#94a3b8" }}>{stop.valley} · {stop.river}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Home size={14} className="flex-shrink-0" style={{ color: "#374151" }} />
            <p className="text-sm" style={{ color: "#94a3b8" }}>{stop.stay}</p>
          </div>
          {stop.note && <Warning text={stop.note} />}

          {/* ── Photo strip ── */}
          <PhotoStrip tripId="zanskar-2025" stopName={stop.name} color={color} />
        </div>
      </div>
    </Reveal>
  );
}

// ─── ZANSKAR MAP STOPS ────────────────────────────────────────────────────────
// Correct chronological order: Srinagar → Kargil → Leh → Padum → Tandi → Kaza → Losar → Hudan Bhatori → Kishtwar → Srinagar
// GPX indices from new GPX file (sampled every 38th point → 1,285 coords)
const ZANSKAR_MAP_STOPS = [
  { num:"S",  name:"Srinagar",      nights:"Start", lat:34.084, lng:74.797, gpxIdx:0,    ele:"1,585 m", valley:"Kashmir Valley",  passes:[], visited:["Dal Lake","Srinagar city"],              photos:[{f:"24.JPG",c:"Srinagar"}] },
  { num:"01", name:"Kargil",        nights:"1N",    lat:34.558, lng:76.124, gpxIdx:110,  ele:"2,676 m", valley:"Suru Valley",     passes:[], visited:["Sonamarg (en route)","Dras Valley"],     photos:[{f:"1.jpg",c:"Sonamarg"},{f:"2.JPg",c:"Dras Valley"}] },
  { num:"02", name:"Leh",           nights:"1N",    lat:34.152, lng:77.576, gpxIdx:268,  ele:"3,524 m", valley:"Indus Valley",    passes:[], visited:["Leh Palace","Shanti Stupa","Indus Valley"], photos:[{f:"3.jpg",c:"Leh"}] },
  { num:"03", name:"Padum",         nights:"2N",    lat:33.462, lng:76.932, gpxIdx:464,  ele:"3,657 m", valley:"Zanskar Valley",  passes:[{n:"Sir Sir La",a:"4,800 m"},{n:"Singe La",a:"5,059 m"}], visited:["Lamayuru (en route)","Sir Sir La","Singe La","Padum","Gonbo Rangjon"], photos:[{f:"4.JPg",c:"Lamayuru"},{f:"5.jpg",c:"Sir Sir La"},{f:"6.jpg",c:"Singe La"},{f:"7.jpg",c:"Padum"},{f:"10.png",c:"Gonbo Rangjon"}] },
  { num:"04", name:"Tandi",         nights:"1N",    lat:32.534, lng:76.967, gpxIdx:605,  ele:"2,594 m", valley:"Lahaul Valley",   passes:[{n:"Shinku La",a:"5,091 m"}], visited:["Shinku La","Padum-Darcha","Tandi"], photos:[{f:"8.jpg",c:"Padum-Darcha"},{f:"9.jpg",c:"Shinku La"},{f:"11.jpg",c:"Tandi"}] },
  { num:"05", name:"Kaza",          nights:"2N",    lat:32.229, lng:78.067, gpxIdx:704,  ele:"3,800 m", valley:"Spiti Valley",    passes:[], visited:["Keylong (en route)","Spiti River","Spiti Valley","Chicham Bridge"], photos:[{f:"12.jpg",c:"Keylong"},{f:"13.jpg",c:"Spiti River"},{f:"14.jpg",c:"Spiti Valley"},{f:"17.jpg",c:"Chicham Bridge"}] },
  { num:"06", name:"Losar",         nights:"1N",    lat:32.440, lng:77.748, gpxIdx:737,  ele:"4,079 m", valley:"Upper Spiti",     passes:[{n:"Kunzum La",a:"4,590 m"}], visited:["Losar village"], photos:[{f:"18.jpg",c:"Losar"}] },
  { num:"07", name:"Hudan Bhatori", nights:"1N",    lat:32.880, lng:76.470, gpxIdx:938,  ele:"~2,200 m",valley:"Pangi Valley",   passes:[], visited:["Rashil","Chenab River","Pangi Valley","Hudan Bhatori"], photos:[{f:"15.jpg",c:"Chenab River"},{f:"16.jpg",c:"Chenab River"},{f:"19.jpg",c:"Rashil"},{f:"20.jpg",c:"Hudan Bhatori"},{f:"21.jpeg",c:"Hudan Bhatori"},{f:"22.jpg",c:"Pangi Valley"}] },
  { num:"08", name:"Kishtwar",      nights:"1N",    lat:33.313, lng:75.773, gpxIdx:1029, ele:"1,672 m", valley:"Chenab Valley",   passes:[], visited:["Kishtwar town"], photos:[{f:"23.jpg",c:"Kishtwar"}] },
  { num:"E",  name:"Srinagar",      nights:"End",   lat:34.065, lng:74.790, gpxIdx:1284, ele:"1,585 m", valley:"Kashmir Valley",  passes:[], visited:["Journey complete"], photos:[] },
];

// Pre-compute route slices once at module level for performance
const ROUTE_SLICES = ZANSKAR_MAP_STOPS.map(s => ZANSKAR_GPX.slice(0, s.gpxIdx + 1));

// ─── HIGH PASSES (nearest GPX point to actual summit) ────────────────────────
const ZANSKAR_PASSES = [
  { name: "Zojila Pass", alt: "3,528 m", gpxIdx: 56,  lat: 34.28137, lng: 75.471   },
  { name: "Sir Sir La",  alt: "4,800 m", gpxIdx: 424, lat: 33.89771, lng: 76.84444 },
  { name: "Singe La",    alt: "5,059 m", gpxIdx: 446, lat: 33.74393, lng: 76.85684 },
  { name: "Shinku La",   alt: "5,091 m", gpxIdx: 518, lat: 33.17812, lng: 77.17328 },
  { name: "Kunzum La",   alt: "4,590 m", gpxIdx: 693, lat: 32.42308, lng: 77.65755 },
];

// ─── ZANSKAR MAP SECTION ──────────────────────────────────────────────────────
function ZanskarMapSection({ color }) {
  const wrapRef     = useRef(null);
  const mapElRef    = useRef(null);
  const lmapRef     = useRef(null);
  const routeRef    = useRef(null);
  const dotRef      = useRef(null);
  const labelRef    = useRef(null);
  const cardRef     = useRef(null);
  const stopIdxRef  = useRef(0);
  const wheelAccRef = useRef(0);
  const inViewRef   = useRef(false);
  const txRef       = useRef(0);       // touch start X
  const moveEndRef  = useRef(null);    // unused (kept for future use)
  const mapReadyRef = useRef(false);   // true once the first stop is positioned
  const exitAccRef  = useRef(0);       // counts scroll events at map edges before releasing page
  const passElsRef  = useRef([]);      // DOM refs for the 5 pass marker overlays

  // React state: content + opacity only. left/top set via DOM refs (never in JSX style).
  const [activeStop, setActiveStop]   = useState(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [lbSrc, setLbSrc]             = useState(null);

  const basePath = `${import.meta.env.BASE_URL}images/zanskar-2025/`;

  // Static-map updateForStop — map never moves (tiles load once, zero flicker).
  // Dot/card/label are position:fixed using viewport coords from getBoundingClientRect.
  // mapReadyRef is set true on first call to unlock scroll navigation.
  const updateForStop = useCallback((si) => {
    const L = window.L;
    if (!L || !lmapRef.current || !mapElRef.current || !routeRef.current) return;
    const stop = ZANSKAR_MAP_STOPS[si];
    if (!stop) return;

    try { routeRef.current.setLatLngs(ROUTE_SLICES[si]); } catch(_) {}

    // Container-local → viewport-absolute for position:fixed overlays
    const px   = lmapRef.current.latLngToContainerPoint([stop.lat, stop.lng]);
    const rect = mapElRef.current.getBoundingClientRect();
    const mapW = rect.width;
    const mapH = rect.height;
    const vx   = rect.left + px.x;
    const vy   = rect.top  + px.y;

    const isMobile = mapW < 640;
    const cardW    = isMobile ? Math.min(270, mapW - 24) : 300;
    const GAP      = 18;
    const onLeft   = !isMobile && px.x > mapW / 2;
    const cx = isMobile
      ? rect.left + Math.max(8, Math.min(mapW - cardW - 8, px.x - cardW / 2))
      : onLeft ? vx - GAP - cardW : vx + GAP;
    const cy = Math.min(Math.max(vy - 100, rect.top + 8), rect.top + mapH - 280);

    if (dotRef.current)   { dotRef.current.style.left   = vx + "px"; dotRef.current.style.top   = vy + "px"; }
    if (labelRef.current) { labelRef.current.style.left = vx + "px"; labelRef.current.style.top = (vy + 14) + "px"; }
    if (cardRef.current)  { cardRef.current.style.left  = cx + "px"; cardRef.current.style.top  = cy + "px"; cardRef.current.style.width = cardW + "px"; }

    // Position + light-up pass markers based on whether route has reached each pass
    ZANSKAR_PASSES.forEach((pass, pi) => {
      const el = passElsRef.current[pi];
      if (!el) return;
      const ppx = lmapRef.current.latLngToContainerPoint([pass.lat, pass.lng]);
      el.style.left    = (rect.left + ppx.x) + "px";
      el.style.top     = (rect.top  + ppx.y) + "px";
      const crossed        = stop.gpxIdx >= pass.gpxIdx;
      el.style.opacity     = crossed ? "1" : "0.28";
      el.style.filter      = crossed ? "none" : "grayscale(1)";
      el.style.transform   = crossed ? "translate(-50%,-100%) scale(1)" : "translate(-50%,-100%) scale(0.82)";
      el.style.animation   = crossed ? "passBob 3s ease-in-out infinite" : "none";
    });

    setActiveStop(stop);
    setCardVisible(true);
    mapReadyRef.current = true; // first call unlocks scroll navigation
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Map init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let timer;

    function go() {
      stopIdxRef.current  = 0;
      wheelAccRef.current = 0;
      exitAccRef.current  = 0;
      mapReadyRef.current = false;
      clearTimeout(timer);
      timer = setTimeout(() => updateForStop(0), 350);
    }

    function initMap() {
      if (!mapElRef.current) return;
      const L = window.L;

      if (lmapRef.current) {
        lmapRef.current.invalidateSize();
        go();
        return;
      }

      const m = L.map(mapElRef.current, {
        zoomControl: false, attributionControl: false,
        dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false, keyboard: false,
        preferCanvas: true, // Canvas renderer — far faster for large polylines
      });
      // No tile layers — pure dark canvas, zero flicker, zero grid lines

      // Fit to the full route — map never moves after this, tiles load once
      m.fitBounds(L.polyline(ZANSKAR_GPX).getBounds(), { padding: [60, 60] });

      // Ghost route (full circuit, faint) + animated progress route
      L.polyline(ZANSKAR_GPX, { color, weight: 2, opacity: 0.18, dashArray: "5,4" }).addTo(m);
      routeRef.current = L.polyline([], { color, weight: 3.5, opacity: 0.95 }).addTo(m);

      // Waypoint markers
      ZANSKAR_MAP_STOPS.forEach((s, i) => {
        const isEnd = i === 0 || i === ZANSKAR_MAP_STOPS.length - 1;
        L.circleMarker([s.lat, s.lng], {
          radius: isEnd ? 6 : 5, color: "#fff", weight: 1.5,
          fillColor: isEnd ? "#e11d48" : color, fillOpacity: 1,
        }).addTo(m);
      });

      lmapRef.current = m;
      go();
    }

    if (window.L) {
      initMap();
    } else {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css"; link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
        // Make Leaflet container transparent so our dark bg shows through
        const s = document.createElement("style");
        s.id = "leaflet-bg-override";
        s.textContent = ".leaflet-container { background: transparent !important; }";
        document.head.appendChild(s);
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => clearTimeout(timer);
  }, [updateForStop]);

  // ── Wheel (desktop) + touch (mobile) navigation ───────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([e]) => { inViewRef.current = e.intersectionRatio >= 0.85; },
      { threshold: [0, 0.85, 1] }
    );
    observer.observe(el);

    const onWheel = (e) => {
      // Block scroll until map is visible AND the first stop has been positioned
      if (!inViewRef.current || !lmapRef.current || !mapReadyRef.current) return;

      const dir    = e.deltaY > 0 ? 1 : -1;
      const si     = stopIdxRef.current;
      const atLast  = dir > 0 && si >= ZANSKAR_MAP_STOPS.length - 1;
      const atFirst = dir < 0 && si <= 0;

      if (atLast || atFirst) {
        // Buffer 5 scroll events at the edge before releasing page scroll
        exitAccRef.current += 1;
        if (exitAccRef.current <= 5) {
          e.preventDefault(); // still trap – user must scroll 5× more to leave
          return;
        }
        exitAccRef.current = 0;
        setCardVisible(false); // clear card/label before handing back page scroll
        return;
      }

      exitAccRef.current = 0; // moved away from edge – reset exit counter
      e.preventDefault();
      wheelAccRef.current += dir;
      if (Math.abs(wheelAccRef.current) >= 3) { // 3 scroll events per stop
        const newSi = Math.max(0, Math.min(ZANSKAR_MAP_STOPS.length - 1, si + (wheelAccRef.current > 0 ? 1 : -1)));
        wheelAccRef.current = 0;
        stopIdxRef.current  = newSi;
        updateForStop(newSi);
      }
    };

    const onTouchStart = (e) => { txRef.current = e.touches[0].clientX; };
    const onTouchEnd   = (e) => {
      if (!mapReadyRef.current) return;
      const dx = e.changedTouches[0].clientX - txRef.current;
      if (Math.abs(dx) < 40) return;
      const dir   = dx < 0 ? 1 : -1;
      const newSi = Math.max(0, Math.min(ZANSKAR_MAP_STOPS.length - 1, stopIdxRef.current + dir));
      if (newSi !== stopIdxRef.current) { stopIdxRef.current = newSi; updateForStop(newSi); }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend",   onTouchEnd);
      observer.disconnect();
    };
  }, [updateForStop]);

  const TOTAL = ZANSKAR_MAP_STOPS.length;

  return (
    <>
      <style>{`
        @keyframes mapBob{0%{transform:rotate(45deg) translateY(-2px)}100%{transform:rotate(45deg) translateY(3px)}}
        @keyframes dotPulse{0%,100%{box-shadow:0 0 0 5px ${color}33,0 0 18px ${color}99}50%{box-shadow:0 0 0 9px ${color}1a,0 0 30px ${color}66}}
        @keyframes passBob{0%,100%{transform:translate(-50%,-100%) scale(1) translateY(0px)}50%{transform:translate(-50%,-100%) scale(1) translateY(-3px)}}
      `}</style>

      {/* Wrapper — 100svh (mobile-safe); wheel events trapped while navigating stops */}
      <div ref={wrapRef} style={{ position: "relative", height: "100svh", overflow: "hidden", background: "#0b0e15" }}>

        {/* Leaflet map */}
        <div ref={mapElRef} style={{ width: "100%", height: "100%", background: "#0d1117" }} />

        {/* Glowing dot — position:fixed escapes Leaflet's stacking context.
            left/top set via ref using viewport coords from getBoundingClientRect */}
        <div ref={dotRef} style={{
          position: "fixed", zIndex: 9901,
          width: 16, height: 16, borderRadius: "50%",
          background: color, border: "2.5px solid #fff",
          animation: "dotPulse 2s ease infinite",
          transform: "translate(-50%,-50%)",
          transition: "left .45s cubic-bezier(.4,0,.2,1), top .45s cubic-bezier(.4,0,.2,1), opacity .3s",
          opacity: cardVisible ? 1 : 0,
          pointerEvents: "none",
        }} />

        {/* Stop name label — position:fixed, viewport coords */}
        <div ref={labelRef} style={{
          position: "fixed", zIndex: 9902,
          transform: "translateX(-50%)",
          fontSize: 11, fontWeight: 700, color: "#f0f0f0",
          textShadow: "0 1px 6px rgba(0,0,0,0.95)",
          background: "rgba(0,0,0,0.58)",
          padding: "2px 8px", borderRadius: 99,
          whiteSpace: "nowrap", pointerEvents: "none",
          opacity: cardVisible ? 1 : 0,
          transition: "left .45s cubic-bezier(.4,0,.2,1), top .45s cubic-bezier(.4,0,.2,1), opacity .3s",
        }}>
          {activeStop?.name}
        </div>

        {/* Info card — position:fixed, viewport coords */}
        <div ref={cardRef} style={{
          position: "fixed", zIndex: 9903, width: 300,
          background: "rgba(12,14,24,0.86)",
          border: `1px solid rgba(124,58,237,0.4)`,
          borderRadius: 14,
          opacity: cardVisible ? 1 : 0,
          transition: "left .45s cubic-bezier(.4,0,.2,1), top .45s cubic-bezier(.4,0,.2,1), opacity .3s",
          boxShadow: "0 8px 32px rgba(0,0,0,0.65)",
          pointerEvents: cardVisible ? "auto" : "none",
        }}>
          {activeStop && (
            <>
              {/* Header */}
              <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #1e2230", display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1, minWidth: 30 }}>{activeStop.num}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f1f1" }}>{activeStop.name}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{activeStop.ele} · {activeStop.valley}</div>
                </div>
                <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 99, background: `${color}18`, color, border: `1px solid ${color}33`, flexShrink: 0 }}>{activeStop.nights}</span>
              </div>
              {/* Body */}
              <div style={{ padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                {activeStop.passes?.length > 0 && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>⛰️</span>
                    <div>
                      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".12em", color, marginBottom: 4 }}>Passes</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {activeStop.passes.map(p => (
                          <span key={p.n} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, color: "#94a3b8", border: "1px solid #2a2e3d" }}>{p.n} · {p.a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeStop.visited?.length > 0 && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>📍</span>
                    <div>
                      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".12em", color, marginBottom: 4 }}>Visited</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {activeStop.visited.map(v => (
                          <span key={v} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: `${color}12`, color, border: `1px solid ${color}2e` }}>{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Photos removed — shown in the Timeline view instead */}
              </div>
            </>
          )}
        </div>

        {/* ⛰ Pass markers — position:fixed, lit when route has crossed them */}
        {ZANSKAR_PASSES.map((pass, pi) => (
          <div
            key={pass.name}
            ref={el => { passElsRef.current[pi] = el; }}
            style={{
              position: "fixed", zIndex: 9900,
              pointerEvents: "none",
              transform: "translate(-50%,-100%) scale(0.82)",
              transition: "left .45s cubic-bezier(.4,0,.2,1), top .45s cubic-bezier(.4,0,.2,1), opacity .5s, transform .4s, filter .5s",
              opacity: 0,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
            }}
          >
            {/* Pin label */}
            <div style={{
              background: "rgba(10,12,22,0.82)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 7,
              padding: "4px 7px 3px",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", gap: 5,
              boxShadow: "0 3px 12px rgba(0,0,0,0.7)",
            }}>
              <span style={{ fontSize: 13, lineHeight: 1 }}>⛰️</span>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#e2e8f0", lineHeight: 1.3, whiteSpace: "nowrap", letterSpacing: ".02em" }}>{pass.name}</div>
                <div style={{ fontSize: 8, color: "#94a3b8", lineHeight: 1.2, letterSpacing: ".04em" }}>{pass.alt}</div>
              </div>
            </div>
            {/* Stem */}
            <div style={{ width: 1.5, height: 7, background: "rgba(255,255,255,0.35)" }} />
            {/* Dot */}
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", boxShadow: "0 0 4px #fff8" }} />
          </div>
        ))}

        {/* ‹ Prev / Next › buttons — visible on all screens, essential on mobile */}
        {(() => {
          const btnBase = {
            position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 9910,
            background: "rgba(12,14,24,0.78)", border: `1px solid ${color}44`,
            color: "#f1f1f1", borderRadius: "50%",
            width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 18px rgba(0,0,0,0.55)",
            transition: "opacity .2s, background .2s",
            userSelect: "none",
          };
          const isFirst = !activeStop || activeStop === ZANSKAR_MAP_STOPS[0];
          const isLast  = !activeStop || activeStop === ZANSKAR_MAP_STOPS[ZANSKAR_MAP_STOPS.length - 1];
          const nav = (dir) => {
            const si = Math.max(0, Math.min(ZANSKAR_MAP_STOPS.length - 1, stopIdxRef.current + dir));
            if (si !== stopIdxRef.current) { stopIdxRef.current = si; updateForStop(si); }
          };
          return (
            <>
              <button onClick={() => nav(-1)} aria-label="Previous stop"
                style={{ ...btnBase, left: 12, opacity: isFirst ? 0.25 : 0.85, pointerEvents: isFirst ? "none" : "auto" }}>‹</button>
              <button onClick={() => nav(1)}  aria-label="Next stop"
                style={{ ...btnBase, right: 12, opacity: isLast  ? 0.25 : 0.85, pointerEvents: isLast  ? "none" : "auto" }}>›</button>
            </>
          );
        })()}

        {/* Progress pill */}
        {activeStop && (
          <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 9910, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748b", background: "rgba(15,17,23,0.85)", padding: "5px 16px", borderRadius: 99, border: "1px solid #1e2230", whiteSpace: "nowrap" }}>
            <span style={{ color, fontWeight: 700 }}>{stopIdxRef.current + 1}</span>
            <span>/</span>
            <span>{TOTAL}</span>
            <span style={{ width: 1, height: 10, background: "#1e2230", display: "inline-block" }} />
            <span style={{ color: "#94a3b8" }}>{activeStop.name}</span>
          </div>
        )}

        {/* ── Begin Journey CTA — shown only at the first stop ── */}
        <div style={{
          position: "absolute", bottom: "12%", left: "50%",
          transform: "translateX(-50%)", zIndex: 9910,
          textAlign: "center", pointerEvents: "none",
          opacity: activeStop?.num === "S" ? 1 : 0,
          transition: "opacity .6s",
        }}>
          <div style={{ fontSize: 9, letterSpacing: ".35em", textTransform: "uppercase", color, fontWeight: 700, marginBottom: 8 }}>
            Zanskar Circuit · 2025
          </div>
          <div style={{ fontSize: 17, color: "#f1f1f1", fontWeight: 700, marginBottom: 4 }}>
            Travel the route
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 18 }}>
            <span className="hidden sm:inline">Scroll</span>
            <span className="sm:hidden">Swipe</span>
            {" "}through {ZANSKAR_MAP_STOPS.length - 2} stops &nbsp;·&nbsp; use ‹ › buttons on mobile
          </div>
          {/* Bouncing chevron */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10,
                borderRight: `2px solid ${color}`, borderBottom: `2px solid ${color}`,
                transform: "rotate(45deg)",
                opacity: 1 - i * 0.3,
                animation: `mapBob .8s ease ${i * 0.15}s infinite alternate`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lbSrc && createPortal(
        <div onClick={() => setLbSrc(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <button onClick={() => setLbSrc(null)} style={{ position: "absolute", top: 18, right: 22, background: "none", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", opacity: .6 }}>✕</button>
          <img src={lbSrc.src} alt={lbSrc.cap} onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "88vh", borderRadius: 12, objectFit: "contain" }} />
          <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: "#94a3b8", background: "rgba(15,17,23,0.85)", padding: "5px 16px", borderRadius: 99, whiteSpace: "nowrap" }}>{lbSrc.cap}</div>
        </div>,
        document.body
      )}
    </>
  );
}

function ZanskarSection() {
  const d = ZANSKAR_2025;
  const { accent: color, bg, border } = THEMES["zanskar-2025"];
  // Default: timeline. User clicks "Map" to see the interactive route map.
  const [view, setView] = useState("timeline");
  const mapWrapRef = useRef(null);

  // When switching TO map, scroll so the map fills the viewport (route fully visible)
  useEffect(() => {
    if (view === "map" && mapWrapRef.current) {
      // Small delay lets the map DOM mount before scrolling
      const t = setTimeout(() => {
        mapWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [view]);

  const handleToggle = (key) => setView(key);

  return (
    <>
      <TripJumpStrip currentId="zanskar-2025" />
      <TripHeader id="zanskar-2025" name={d.name} route={d.route} dates={d.dates}
        tagline={d.tagline} nights={d.nights} distance={d.distance}
        highlights={d.highlights} color={color} bg={bg} border={border} />
      <div className="w-full py-12 px-4" style={{ background: "#0f1117" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <Reveal>
            <div className="rounded-xl p-5" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
              <div className="flex items-center gap-2 mb-4"><Wind size={16} style={{ color }} /><p className="text-sm font-semibold" style={{ color }}>Valleys Traversed</p></div>
              <div className="flex flex-wrap gap-2">{d.valleys.map(v => <span key={v} className="px-3 py-1 rounded-full text-sm" style={{ background: bg, color, border: `1px solid ${border}` }}>{v}</span>)}</div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-xl p-5" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
              <div className="flex items-center gap-2 mb-4"><Waves size={16} style={{ color }} /><p className="text-sm font-semibold" style={{ color }}>Rivers Followed</p></div>
              <div className="flex flex-wrap gap-2">{d.rivers.map(r => <span key={r} className="px-3 py-1 rounded-full text-sm" style={{ background: "#1e2230", color: "#94a3b8", border: "1px solid #2a2e3d" }}>{r}</span>)}</div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Map / Timeline toggle ── */}
      <div className="w-full py-4 px-4" style={{ background: "#0f1117", borderTop: "1px solid #1e2230" }}>
        <div className="max-w-4xl mx-auto flex justify-center">
          <div className="inline-flex rounded-xl overflow-hidden" style={{ border: `1px solid ${border}`, background: "#181b25" }}>
            {[["timeline","☰  Timeline"],["map","🗺  Map"]].map(([key, label]) => (
              <button key={key} onClick={() => handleToggle(key)}
                className="px-5 py-2 text-sm font-semibold transition-colors"
                style={{
                  background: view === key ? color : "transparent",
                  color: view === key ? "#fff" : "#64748b",
                  border: "none", cursor: "pointer",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map view — ref used to auto-scroll into position on toggle ── */}
      {view === "map" && (
        <div ref={mapWrapRef}>
          <ZanskarMapSection color={color} />
        </div>
      )}

      {/* ── Timeline view ── */}
      {view === "timeline" && (
        <div className="w-full py-16 px-4" style={{ background: "#0f1117" }}>
          <div className="max-w-4xl mx-auto">
            <Reveal className="mb-10">
              <SLabel color={color}>Route</SLabel>
              <h3 className="text-2xl font-bold" style={{ color: "#f1f1f1" }}>Stop by Stop</h3>
            </Reveal>
            <div className="relative">
              <div className="absolute left-2 md:left-6 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, ${color}33, ${color}88 30%, ${color}88 70%, ${color}22)` }} />
              {d.stops.map((stop, i) => (
                <ZanskarStop key={stop.name + i} stop={stop} color={color} bg={bg} border={border} />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="w-full py-16 px-4" style={{ background: "#0f1117" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-10"><SLabel color={color}>High Altitude</SLabel><h3 className="text-2xl font-bold" style={{ color: "#f1f1f1" }}>5 Passes Crossed</h3></Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...d.passes].sort((a, b) => b.alt - a.alt).map((p, i) => (
              <Reveal key={p.name} delay={i * 0.07}>
                <div className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.03]" style={{ background: "#181b25", border: `1px solid ${border}` }}>
                  <Mountain size={18} className="mb-3" style={{ color }} />
                  <p className="font-bold" style={{ color: "#f1f1f1" }}>{p.name}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color }}>{p.display}</p>
                  <p className="text-xs mb-2" style={{ color: "#64748b" }}>{p.feet}</p>
                  <p className="text-xs" style={{ color: "#475569" }}>{p.leg}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <NextTripButton nextId="ladakh-2026" />
    </>
  );
}

// ─── LADAKH SECTION ───────────────────────────────────────────────────────────
function LadakhStop({ stop }) {
  const color = "#e11d48";
  const isEnd = stop.nights === "Arrival" || stop.nights === "Departure";
  const Icon = isEnd ? Plane : stop.nights === "2N" ? Tent : Home;
  return (
    <Reveal className="relative pl-10 md:pl-16 pb-10">
      <div className="absolute left-0 md:left-4 top-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: color, boxShadow: "0 0 12px #e11d4866" }}>
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3" style={{ borderBottom: "1px solid #1e2230" }}>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl font-bold" style={{ color }}>{String(stop.num).padStart(2, "0")}</span>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#f1f1f1" }}>
                {stop.name}{stop.label && <span className="font-normal text-sm ml-2" style={{ color: "#64748b" }}>({stop.label})</span>}
              </h3>
              <p className="text-xs" style={{ color: "#64748b" }}>{stop.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "#1e2230", color: "#94a3b8", border: "1px solid #2a2e3d" }}><Mountain size={10} /> {stop.alt}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: stop.nights === "2N" ? "#e11d4818" : "#7c3aed18", color: stop.nights === "2N" ? "#e11d48" : "#7c3aed", border: `1px solid ${stop.nights === "2N" ? "#e11d4833" : "#7c3aed33"}` }}>
              <Moon size={10} /> {stop.nights}
            </span>
          </div>
        </div>
        <div className="p-4 md:p-5 space-y-3">
          <div className="flex items-start gap-3"><Icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#7c3aed" }} /><div><p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7c3aed" }}>Sleep</p><p className="text-sm" style={{ color: "#cbd5e1" }}>{stop.sleep}</p></div></div>
          <div className="flex items-start gap-3"><Compass size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#0ea5e9" }} /><div><p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#0ea5e9" }}>Activities</p><p className="text-sm" style={{ color: "#cbd5e1" }}>{stop.activities}</p></div></div>
          <div className="flex items-start gap-3">
            <Mountain size={14} className="mt-0.5 flex-shrink-0" style={{ color }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color }}>Passes</p>
              {stop.passes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stop.passes.map(p => (
                    <span key={p.name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                      style={{ background: p.name === "Mig La" ? "#92400e22" : "#e11d4818", color: p.name === "Mig La" ? "#fbbf24" : "#fb7185", border: `1px solid ${p.name === "Mig La" ? "#92400e44" : "#e11d4833"}` }}>
                      {p.name} {p.alt}{p.name === "Mig La" && "*"}
                    </span>
                  ))}
                </div>
              ) : <p className="text-sm italic" style={{ color: "#64748b" }}>{stop.passNote || "None"}</p>}
              {stop.passes.length > 0 && stop.passNote && <p className="text-xs mt-1.5 italic" style={{ color: "#64748b" }}>{stop.passNote}</p>}
            </div>
          </div>
          {stop.notes.map((n, i) => <Warning key={i} text={n} />)}
        </div>
      </div>
    </Reveal>
  );
}

function LadakhSection() {
  const [sortByAlt, setSortByAlt] = useState(false);
  const sorted = sortByAlt ? [...LADAKH_PASSES].sort((a, b) => b.alt - a.alt) : LADAKH_PASSES;
  const color = "#e11d48", bg = "#e11d4818", border = "#e11d4833";
  return (
    <>
      <TripJumpStrip currentId="ladakh-2026" />
      <div id="ladakh-2026" className="w-full py-20 px-4" style={{ background: "#0b0e15", borderTop: `2px solid ${border}` }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: bg, color, border: `1px solid ${border}` }}>Ladakh 2026</span>
              <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: color, color: "#fff" }}>UPCOMING</span>
              <span className="text-xs" style={{ color: "#475569" }}>3–12 Oct 2026</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#f1f1f1" }}>Leh → Leh</h2>
            <p className="text-lg mt-3" style={{ color }}>11 passes. 2 world records. 9 days.</p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {[{ icon: Route, label: "Distance", value: "~1,400 km" }, { icon: Mountain, label: "Highest Point", value: "Mig La 5,913m*", sub: "Umling La 5,799m if closed" }, { icon: Moon, label: "Nights", value: "8" }, { icon: Navigation, label: "Passes", value: "11" }].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
                    <Icon size={22} className="mx-auto mb-2" style={{ color }} />
                    <p className="text-lg font-bold" style={{ color: "#f1f1f1" }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{s.label}</p>
                    {s.sub && <p className="text-xs mt-0.5 italic" style={{ color: "#475569" }}>{s.sub}</p>}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
      <div className="w-full py-16 px-4" style={{ background: "#0f1117" }}>
        <div className="max-w-2xl mx-auto">
          <Reveal className="mb-10"><SLabel color={color}>The Route</SLabel><h3 className="text-2xl font-bold" style={{ color: "#f1f1f1" }}>Day-by-Day Itinerary</h3></Reveal>
          <div className="relative">
            <div className="absolute left-2 md:left-6 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg,${color}00,${color},${color},${color}00)` }} />
            {LADAKH_STOPS.map(s => <LadakhStop key={s.num} stop={s} />)}
          </div>
        </div>
      </div>
      <div className="w-full py-16 px-4" style={{ background: "#0b0e15" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-6"><SLabel color={color}>High Altitude</SLabel><h3 className="text-2xl font-bold" style={{ color: "#f1f1f1" }}>All 11 Passes</h3></Reveal>
          <div className="flex justify-center mb-8">
            <button onClick={() => setSortByAlt(v => !v)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105" style={{ background: "#1e2230", color: "#94a3b8", border: "1px solid #2a2e3d" }}>
              <ArrowUpDown size={13} />{sortByAlt ? "Sort by route order" : "Sort by altitude"}
            </button>
          </div>
          <div className="flex justify-center gap-4 flex-wrap mb-6">
            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#fbbf24" }}><Star size={11} /> World record</span>
            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#fb7185" }}><Mountain size={11} /> High / challenging</span>
            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#64748b" }}>● Standard</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((p, i) => {
              const pbg = p.type === "record" ? "#92400e15" : p.type === "high" ? "#e11d4812" : "#181b25";
              const pbd = p.type === "record" ? "#92400e44" : p.type === "high" ? "#e11d4833" : "#1e2230";
              const pac = p.type === "record" ? "#fbbf24" : p.type === "high" ? "#fb7185" : "#94a3b8";
              return (
                <Reveal key={p.name} delay={i * 0.05}>
                  <div className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.03]" style={{ background: pbg, border: `1px solid ${pbd}` }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm" style={{ color: "#f1f1f1" }}>{p.name}{p.name === "Mig La" && <span style={{ color: "#fbbf24" }}>*</span>}</h4>
                      {p.type === "record" && <Star size={14} style={{ color: "#fbbf24" }} />}
                      {p.type === "high" && <Mountain size={14} style={{ color: "#fb7185" }} />}
                    </div>
                    <p className="text-xl font-bold mb-0.5" style={{ color: pac }}>{p.display}</p>
                    <p className="text-xs mb-2" style={{ color: "#64748b" }}>{p.feet}</p>
                    <p className="text-xs" style={{ color: "#475569" }}>{p.leg}</p>
                    {p.note && <p className="text-xs mt-2 italic font-medium" style={{ color: pac }}>{p.note}</p>}
                  </div>
                </Reveal>
              );
            })}
          </div>
          <p className="text-center text-xs mt-8 italic" style={{ color: "#475569" }}>* Mig La access subject to army clearance — confirm on ground in Leh</p>
        </div>
      </div>
      <div className="w-full py-16 px-4" style={{ background: "#0f1117" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-10"><SLabel color={color}>Be Prepared</SLabel><h3 className="text-2xl font-bold" style={{ color: "#f1f1f1" }}>Practical Info</h3></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: "Permits",      c: "#7c3aed", text: "ILP required for Nubra, Pangong, Hanle, Karzok/Chumur — collect from DC office Leh on Day 1." },
              { icon: Fuel,   title: "Fuel",         c: "#f59e0b", text: "Fill at Leh and Diskit (last pump). Carry extra jerry can from Diskit onwards." },
              { icon: Wifi,   title: "Connectivity", c: "#0ea5e9", text: "Airtel/Jio postpaid works most of Nubra and Shyok. BSNL only in Hanle. No network at Tso Moriri." },
              { icon: Heart,  title: "Health",       c: "#ef4444", text: "Carry oxygen cylinders from Leh. AMS risk above 4,500m. Max 15 min at Umling La. Acclimatise 1 full day in Leh before driving." },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 0.1}>
                  <div className="rounded-xl p-5 h-full" style={{ background: "#181b25", border: "1px solid #1e2230" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: p.c + "18" }}><Icon size={18} style={{ color: p.c }} /></div>
                      <h4 className="font-bold" style={{ color: "#f1f1f1" }}>{p.title}</h4>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{p.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { label: "Home",         href: "#home",          color: "#64748b" },
    { label: "Sahyadri '23",href: "#sahyadri-2023", color: THEMES["sahyadri-2023"].accent },
    { label: "Sahyadri '24",href: "#sahyadri-2024", color: THEMES["sahyadri-2024"].accent },
    { label: "Zanskar '25", href: "#zanskar-2025",  color: THEMES["zanskar-2025"].accent },
    { label: "Ladakh '26",  href: "#ladakh-2026",   color: THEMES["ladakh-2026"].accent },
  ];
  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
      style={{ background: scrolled ? "#0f1117ee" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid #1e2230" : "1px solid transparent" }}>
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <a href="#home" className="text-sm font-bold tracking-wide" style={{ color: "#e11d48" }}>ROAD TRIPS</a>
        <div className="hidden md:flex items-center gap-5">
          {links.map(l => <a key={l.href} href={l.href} className="text-xs tracking-wider uppercase transition-opacity duration-200 opacity-60 hover:opacity-100" style={{ color: l.color }}>{l.label}</a>)}
        </div>
        <div className="flex md:hidden items-center gap-2">
          {[["#sahyadri-2023","'23"],["#sahyadri-2024","'24"],["#zanskar-2025","'25"],["#ladakh-2026","'26"]].map(([href, yr], i) => {
            const c = Object.values(THEMES)[i].accent;
            return <a key={href} href={href} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: c + "22", color: c }}>{yr}</a>;
          })}
        </div>
      </div>
    </nav>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="w-full py-12 px-4 text-center" style={{ background: "#0f1117", borderTop: "1px solid #1e2230" }}>
      <p className="text-sm font-semibold" style={{ color: "#f1f1f1" }}>Road Trip Chronicles · Vinoth</p>
      <p className="text-xs mt-2" style={{ color: "#475569" }}>Sahyadri '23 · Sahyadri '24 · Zanskar '25 · Ladakh '26</p>
      <p className="text-xs mt-3 italic" style={{ color: "#374151" }}>Ladakh '26 · Mig La access subject to army clearance — confirm on ground in Leh</p>
      <div className="flex justify-center gap-2 mt-6">
        {[Mountain, Star, MapPin, Droplets, Waves].map((Icon, i) => <Icon key={i} size={13} style={{ color: "#1e2230" }} />)}
      </div>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.body.style.background = "#0f1117";
    document.body.style.margin = "0";
  }, []);
  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", color: "#e2e8f0", background: "#0f1117", minHeight: "100vh" }}>
      <Nav />
      <PortfolioHero />
      <SahyadriSection data={SAHYADRI_2023} nextId="sahyadri-2024" />
      <SahyadriSection data={SAHYADRI_2024} nextId="zanskar-2025" />
      <ZanskarSection />
      <LadakhSection />
      <Footer />
    </div>
  );
}
