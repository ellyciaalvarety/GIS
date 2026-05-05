import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis,
} from "recharts";
import { dataPendudukMiskin } from './dataKemiskinan';

// NOTE: tambahkan di main.jsx → import 'leaflet/dist/leaflet.css'

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════
const RAW_DATA = [
  { provinsi: "Aceh", sem1: 676247, sem2: 715103, penduduk: 56959 },
  { provinsi: "Sumatera Utara", sem1: 666546, sem2: 718220, penduduk: 159786 },
  { provinsi: "Sumatera Barat", sem1: 729806, sem2: 776517, penduduk: 59916 },
  { provinsi: "Riau", sem1: 713117, sem2: 747345, penduduk: 68924 },
  { provinsi: "Jambi", sem1: 664127, sem2: 713849, penduduk: 38117 },
  { provinsi: "Sumatera Selatan", sem1: 581702, sem2: 609044, penduduk: 90171 },
  { provinsi: "Bengkulu", sem1: 683820, sem2: 712003, penduduk: 21633 },
  { provinsi: "Lampung", sem1: 612451, sem2: 634062, penduduk: 96238 },
  { provinsi: "Kep. Bangka Belitung", sem1: 956833, sem2: 992426, penduduk: 15697 },
  { provinsi: "Kep. Riau", sem1: 832410, sem2: 870738, penduduk: 22431 },
  { provinsi: "DKI Jakarta", sem1: 852768, sem2: 897768, penduduk: 106697 },
  { provinsi: "Jawa Barat", sem1: 547752, sem2: 575499, penduduk: 511639 },
  { provinsi: "Jawa Tengah", sem1: 537812, sem2: 570870, penduduk: 38565 },
  { provinsi: "DI. Yogyakarta", sem1: 626363, sem2: 649331, penduduk: 38027 },
  { provinsi: "Jawa Timur", sem1: 558029, sem2: 585020, penduduk: 42352 },
  { provinsi: "Banten", sem1: 684232, sem2: 715288, penduduk: 126413 },
  { provinsi: "Bali", sem1: 607847, sem2: 642986, penduduk: 44882 },
  { provinsi: "Nusa Tenggara Barat", sem1: 556846, sem2: 575856, penduduk: 58153 },
  { provinsi: "Nusa Tenggara Timur", sem1: 549607, sem2: 563052, penduduk: 58286 },
  { provinsi: "Kalimantan Barat", sem1: 622882, sem2: 652220, penduduk: 5835 },
  { provinsi: "Kalimantan Tengah", sem1: 654066, sem2: 683664, penduduk: 28795 },
  { provinsi: "Kalimantan Selatan", sem1: 650675, sem2: 684567, penduduk: 43721 },
  { provinsi: "Kalimantan Timur", sem1: 866193, sem2: 897759, penduduk: 44784 },
  { provinsi: "Kalimantan Utara", sem1: 884970, sem2: 933675, penduduk: 7588 },
  { provinsi: "Sulawesi Utara", sem1: 530304, sem2: 557310, penduduk: 27405 },
  { provinsi: "Sulawesi Tengah", sem1: 624854, sem2: 664691, penduduk: 31898 },
  { provinsi: "Sulawesi Selatan", sem1: 477966, sem2: 514958, penduduk: 96613 },
  { provinsi: "Sulawesi Tenggara", sem1: 488171, sem2: 519411, penduduk: 288 },
  { provinsi: "Gorontalo", sem1: 495576, sem2: 519640, penduduk: 12564 },
  { provinsi: "Sulawesi Barat", sem1: 475488, sem2: 510846, penduduk: 15474 },
  { provinsi: "Maluku", sem1: 757600, sem2: 797060, penduduk: 19952 },
  { provinsi: "Maluku Utara", sem1: 662397, sem2: 692592, penduduk: 13917 },
  { provinsi: "Papua Barat", sem1: 831001, sem2: 868631, penduduk: 5965 },
  { provinsi: "Papua", sem1: 714365, sem2: 736720, penduduk: 10865 },
];

const GEOJSON_URL =
  "https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/refs/heads/master/indonesia-prov.geojson";

const DATA_LOOKUP = {};
RAW_DATA.forEach((d) => { DATA_LOOKUP[d.provinsi.toLowerCase()] = d; });

const GEO_ALIASES = {
  "kepulauan bangka belitung": "kep. bangka belitung",
  "kepulauan riau": "kep. riau",
  "daerah istimewa yogyakarta": "di. yogyakarta",
  "di yogyakarta": "di. yogyakarta",
  yogyakarta: "di. yogyakarta",
  "bangka belitung": "kep. bangka belitung",
  "irian jaya barat": "papua barat",
};

function resolveGeoName(rawName) {
  if (!rawName) return null;
  const lower = rawName.toLowerCase().trim();
  const aliased = GEO_ALIASES[lower] || lower;
  return DATA_LOOKUP[aliased] ? aliased : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const fmt = (n) => n?.toLocaleString("id-ID") ?? "-";
const fmtRp = (n) => `Rp ${fmt(n)}`;

function getMapColor(sem2) {
  if (!sem2) return "#e8edf5";
  if (sem2 >= 900000) return "#1a365d";
  if (sem2 >= 800000) return "#1e4a8a";
  if (sem2 >= 700000) return "#2563eb";
  if (sem2 >= 600000) return "#60a5fa";
  if (sem2 >= 500000) return "#93c5fd";
  return "#dbeafe";
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════════════
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --blue: #2563eb; --blue-light: #3b82f6; --blue-pale: #dbeafe;
    --green: #10b981; --amber: #f59e0b; --red: #ef4444; --accent: #6366f1;
    --white: #ffffff; --gray-50: #f8faff; --gray-100: #eef2f9;
    --gray-200: #dde4f0; --gray-400: #8896b3; --gray-600: #4a5578;
    --text: #0f1629; --text-muted: #6b7a9e;
    --border: rgba(37,99,235,0.12);
    --shadow-sm: 0 1px 3px rgba(15,22,41,0.06), 0 1px 2px rgba(15,22,41,0.04);
    --shadow-md: 0 4px 16px rgba(15,22,41,0.08), 0 1px 4px rgba(15,22,41,0.04);
    --radius-lg: 16px; --sidebar: 220px;
  }
  body { font-family: 'Sora', sans-serif; background: var(--gray-50); color: var(--text); -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--gray-400); }
  .leaflet-container { font-family: 'Sora', sans-serif !important; }
  .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(0.85); } }
  .fade-up { animation: fadeUp 0.35s ease both; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; font-size:13px; font-weight:500; color:var(--text-muted); cursor:pointer; border:none; background:transparent; width:100%; text-align:left; transition:background 0.15s,color 0.15s; }
  .nav-item:hover { background:var(--gray-100); color:var(--text); }
  .nav-item.active { background:var(--blue-pale); color:var(--blue); font-weight:600; }
  .nav-item .nav-icon { font-size:15px; width:18px; text-align:center; flex-shrink:0; }
  .card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); }
  .stat-card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px; box-shadow:var(--shadow-sm); position:relative; overflow:hidden; transition:box-shadow 0.2s,transform 0.2s; }
  .stat-card:hover { box-shadow:var(--shadow-md); transform:translateY(-1px); }
  .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--accent-color,var(--blue)); border-radius:var(--radius-lg) var(--radius-lg) 0 0; }
  .badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:600; letter-spacing:0.02em; }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; border:none; transition:all 0.15s; font-family:'Sora',sans-serif; }
  .btn-ghost { background:var(--gray-100); color:var(--text-muted); border:1px solid var(--border); }
  .btn-ghost:hover { background:var(--gray-200); color:var(--text); }
  .btn:disabled { opacity:0.4; cursor:not-allowed; }
  .data-table { width:100%; border-collapse:collapse; }
  .data-table th { padding:10px 14px; text-align:left; font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-muted); background:var(--gray-50); border-bottom:1px solid var(--border); cursor:pointer; user-select:none; transition:color 0.15s; }
  .data-table th:hover { color:var(--blue); }
  .data-table th.right,.data-table td.right { text-align:right; }
  .data-table td { padding:10px 14px; font-size:12.5px; border-bottom:1px solid var(--gray-50); transition:background 0.1s; }
  .data-table tr:hover td { background:var(--gray-50); }
  .data-table tr.selected td { background:#eff6ff; }
  .data-table tr.selected td:first-child { border-left:2px solid var(--blue); }
  .mono { font-family:'JetBrains Mono',monospace; font-size:12px; }
  .search-input { width:100%; padding:9px 14px 9px 36px; border:1px solid var(--border); border-radius:8px; font-size:13px; font-family:'Sora',sans-serif; background:var(--gray-50); color:var(--text); outline:none; transition:border-color 0.15s,box-shadow 0.15s; }
  .search-input:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(37,99,235,0.08); background:var(--white); }
  .search-wrap { position:relative; }
  .search-wrap .search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:14px; pointer-events:none; }
  .province-panel-inner { display:flex; flex-direction:column; height:100%; }
  .top-bar-item { height:32px; padding:0 10px; border-radius:6px; font-size:11px; font-weight:600; letter-spacing:0.03em; display:inline-flex; align-items:center; gap:5px; }
  .section-label { font-size:10.5px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted); margin-bottom:8px; }
  .mini-bar-wrap { height:5px; background:var(--gray-100); border-radius:3px; overflow:hidden; margin-top:5px; }
  .mini-bar-fill { height:100%; border-radius:3px; transition:width 0.5s ease; }
  .rank-item { display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--gray-50); }
  .rank-item:last-child { border-bottom:none; }
  .rank-num { width:20px; height:20px; border-radius:5px; background:var(--gray-100); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:var(--text-muted); flex-shrink:0; }
`;

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════
function StatCard({ label, value, sub, color = "#2563eb", icon, delay = 0 }) {
  return (
    <div className="stat-card fade-up" style={{ "--accent-color": color, animationDelay: `${delay}s` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", lineHeight: 1.1, marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAP SECTION — tooltip nama provinsi saja, warna biru
// ═══════════════════════════════════════════════════════════════════════════
function MapSection({ geoData, selectedKey, onSelect }) {
  const geoJsonRef = useRef(null);
  const selectedRef = useRef(selectedKey);

  useEffect(() => { selectedRef.current = selectedKey; }, [selectedKey]);

  const getStyle = useCallback((feature) => {
    const props = feature?.properties || {};
    const rawName = props.state || props.name || props.Propinsi || props.NAME_1 || "";
    const key = resolveGeoName(rawName);
    const d = key ? DATA_LOOKUP[key] : null;
    const isSelected = key === selectedRef.current;
    return {
      fillColor: d ? getMapColor(d.sem2) : "#e8edf5",
      fillOpacity: isSelected ? 1 : 0.78,
      color: isSelected ? "#0f1629" : "#c8d4eb",
      weight: isSelected ? 2 : 0.7,
      opacity: 1,
    };
  }, []);

  const onEachFeature = useCallback((feature, layer) => {
    const props = feature?.properties || {};
    const rawName = props.state || props.name || props.Propinsi || props.NAME_1 || "";
    const key = resolveGeoName(rawName);
    const d = key ? DATA_LOOKUP[key] : null;
    // Gunakan nama resmi dari data jika ada, fallback ke nama GeoJSON
    const displayName = d ? d.provinsi : rawName;

    layer.on({
      click: () => {
        if (!key) return;
        const next = key === selectedRef.current ? null : key;
        onSelect(next ? DATA_LOOKUP[next] : null, next);
      },
      mouseover: (e) => {
        // Tooltip: nama provinsi saja
        layer.bindTooltip(
          `<div style="font-family:'Sora',sans-serif;background:#fff;border:1px solid #dde4f0;border-radius:8px;padding:7px 13px;box-shadow:0 4px 16px rgba(15,22,41,0.1);font-size:13px;font-weight:700;color:#0f1629;white-space:nowrap;">${displayName}</div>`,
          { sticky: true, direction: "top", opacity: 1 }
        ).openTooltip();
        e.target.setStyle({ weight: 2, color: "#2563eb", fillOpacity: 1 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        layer.unbindTooltip();
        const isSelected = key === selectedRef.current;
        e.target.setStyle({
          weight: isSelected ? 2 : 0.7,
          color: isSelected ? "#0f1629" : "#c8d4eb",
          fillOpacity: isSelected ? 1 : 0.78,
        });
      },
    });
  }, [onSelect]);

  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.eachLayer((layer) => {
      const feature = layer.feature;
      if (!feature) return;
      const props = feature.properties || {};
      const rawName = props.state || props.name || props.Propinsi || props.NAME_1 || "";
      const key = resolveGeoName(rawName);
      const d = key ? DATA_LOOKUP[key] : null;
      const isSelected = key === selectedKey;
      layer.setStyle({
        fillColor: d ? getMapColor(d.sem2) : "#e8edf5",
        fillOpacity: isSelected ? 1 : 0.78,
        color: isSelected ? "#0f1629" : "#c8d4eb",
        weight: isSelected ? 2 : 0.7,
      });
    });
  }, [selectedKey]);

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", height: 420 }}>
      <MapContainer center={[-2.5, 118]} zoom={4.5} style={{ height: "100%", width: "100%", background: "#f0f6ff" }} zoomControl attributionControl={false} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
        {geoData && <GeoJSON ref={geoJsonRef} data={geoData} style={getStyle} onEachFeature={onEachFeature} />}
      </MapContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAP LEGEND — biru
// ═══════════════════════════════════════════════════════════════════════════
function MapLegend() {
  const items = [
    { color: "#dbeafe", label: "< 500K" },
    { color: "#93c5fd", label: "500–600K" },
    { color: "#60a5fa", label: "600–700K" },
    { color: "#2563eb", label: "700–800K" },
    { color: "#1e4a8a", label: "800–900K" },
    { color: "#1a365d", label: "> 900K" },
  ];
  return (
    <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: "8px 16px", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>SKALA (Rp):</span>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: color, border: "1px solid rgba(0,0,0,0.08)" }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVINCE PANEL — dengan total penduduk miskin
// ═══════════════════════════════════════════════════════════════════════════
function ProvincePanel({ data, onClose }) {
  if (!data) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 24, textAlign: "center", gap: 12 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🗺️</div>
      <p style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: 13 }}>Pilih Provinsi</p>
      <p style={{ fontSize: 12, color: "var(--gray-400)", lineHeight: 1.6 }}>Klik wilayah peta untuk melihat detail data provinsi.</p>
    </div>
  );

  const kenaikan = data.sem2 - data.sem1;
  const pctKenaikan = ((kenaikan / data.sem1) * 100).toFixed(2);
  const maxSem = Math.max(data.sem1, data.sem2);

  // Data penduduk miskin
  const miskinEntry = dataPendudukMiskin.find(
    d => d.provinsi.toLowerCase() === data.provinsi.toLowerCase()
  );
  const totalMiskin = miskinEntry ? miskinEntry.sem2 * 1000 : null;

  return (
    <div className="province-panel-inner">
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)", marginBottom: 4 }}>Provinsi Terpilih</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>{data.provinsi}</div>
        </div>
        <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--gray-100)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>✕</button>
      </div>

      {/* Mini bar garis kemiskinan */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Garis Kemiskinan</div>
        {[
          { label: "Sem. 1 (Maret)", val: data.sem1, color: "#2563eb" },
          { label: "Sem. 2 (September)", val: data.sem2, color: "#10b981" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{label}</span>
              <span style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color }}>{fmtRp(val)}</span>
            </div>
            <div className="mini-bar-wrap">
              <div className="mini-bar-fill" style={{ width: `${(val / maxSem) * 100}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Data rows */}
      <div style={{ padding: "14px 16px", flex: 1 }}>
        {[
          { label: "Kenaikan", value: `+${fmtRp(kenaikan)}`, color: "#f59e0b" },
          { label: "Perubahan", value: `+${pctKenaikan}%`, color: "#8b5cf6" },
          { label: "Penduduk", value: `${fmt(data.penduduk)} ribu jiwa`, color: "#2563eb" },
          ...(totalMiskin !== null
            ? [{ label: "Penduduk Miskin", value: `${fmt(totalMiskin)} jiwa`, color: "#ef4444" }]
            : [{ label: "Penduduk Miskin", value: "Data tidak tersedia", color: "var(--text-muted)" }]
          ),
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--gray-50)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 16px", background: "var(--gray-50)", borderTop: "1px solid var(--border)", borderRadius: "0 0 16px 16px" }}>
        <p style={{ fontSize: 11, color: "var(--gray-400)", textAlign: "center" }}>Klik provinsi lain untuk membandingkan</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BAR TOOLTIPS
// ═══════════════════════════════════════════════════════════════════════════
function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-md)", minWidth: 200, fontFamily: "'Sora',sans-serif" }}>
      <p style={{ fontWeight: 700, fontSize: 12.5, color: "var(--text)", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid var(--gray-100)" }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4, fontSize: 12 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "var(--text)" }}>Rp {fmt(p.value)}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: "var(--text-muted)" }}>Kenaikan</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: "#10b981" }}>+{fmt(payload[1].value - payload[0].value)}</span>
        </div>
      )}
    </div>
  );
}

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: "#fff", padding: "12px 16px", borderRadius: 8, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #eef2f9", minWidth: 180, fontFamily: "'Sora',sans-serif" }}>
      <p style={{ fontWeight: 700, color: "#1f2937", fontSize: 14, margin: "0 0 8px 0", paddingBottom: 8, borderBottom: "1px solid #eef2f9" }}>{d.name}</p>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>Garis Kemiskinan</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>Rp {d.y.toLocaleString('id-ID')}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>Penduduk</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>{d.x} Juta</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TABLE
// ═══════════════════════════════════════════════════════════════════════════
function ProvinceTable({ selectedKey, onSelect }) {
  const [sortKey, setSortKey] = useState("sem2");
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = useMemo(() => {
    let d = [...RAW_DATA];
    if (search) d = d.filter(r => r.provinsi.toLowerCase().includes(search.toLowerCase()));
    d.sort((a, b) => {
      const va = sortKey === "kenaikan" ? a.sem2 - a.sem1 : a[sortKey];
      const vb = sortKey === "kenaikan" ? b.sem2 - b.sem1 : b[sortKey];
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return d;
  }, [sortKey, sortDir, search]);

  const cols = [
    { key: "provinsi", label: "Provinsi", align: "left" },
    { key: "sem1", label: "Sem. 1 (Mar)", align: "right" },
    { key: "sem2", label: "Sem. 2 (Sep)", align: "right" },
    { key: "kenaikan", label: "Kenaikan", align: "right" },
    { key: "penduduk", label: "Penduduk", align: "right" },
    { key: "totalMiskin", label: "Total Miskin", align: "right" },
  ];

  return (
    <div>
      <div className="search-wrap" style={{ marginBottom: 14 }}>
        <span className="search-icon">🔍</span>
        <input className="search-input" type="text" placeholder="Cari provinsi..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                {cols.map(({ key, label, align }) => (
                  <th key={key} className={align === "right" ? "right" : ""} onClick={() => toggleSort(key)}>
                    {label} <span style={{ color: sortKey === key ? "var(--blue)" : "var(--gray-200)", marginLeft: 3 }}>
                      {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const key = row.provinsi.toLowerCase();
                const isSelected = key === selectedKey;
                const kenaikan = row.sem2 - row.sem1;
                const miskinData = dataPendudukMiskin.find(d => d.provinsi.toLowerCase() === key);
                const totalMiskin = miskinData ? (miskinData.sem2 * 1000).toLocaleString('id-ID') : "-";
                const formatPop = (row.penduduk / 10000).toFixed(1) + " Juta";
                return (
                  <tr key={row.provinsi} className={isSelected ? "selected" : ""} onClick={() => onSelect(isSelected ? null : row, isSelected ? null : key)} style={{ cursor: "pointer", background: i % 2 !== 0 && !isSelected ? "var(--gray-50)" : undefined }}>
                    <td style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? "var(--blue)" : "var(--text)" }}>{row.provinsi}</td>
                    <td className="right mono" style={{ color: "#2563eb" }}>{fmt(row.sem1)}</td>
                    <td className="right mono" style={{ color: "#10b981" }}>{fmt(row.sem2)}</td>
                    <td className="right mono" style={{ color: "#f59e0b" }}>+{fmt(kenaikan)}</td>
                    <td className="right mono" style={{ color: "#8b5cf6" }}>{formatPop}</td>
                    <td className="right mono" style={{ color: "#ef4444", fontWeight: "bold" }}>{totalMiskin}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "right" }}>
        {sorted.length} dari {RAW_DATA.length} provinsi
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION HEADER
// ═══════════════════════════════════════════════════════════════════════════
function SectionHeader({ title, subtitle, color = "var(--blue)" }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 3, height: 18, background: color, borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)" }}>{title}</h2>
      </div>
      {subtitle && <p style={{ fontSize: 12, color: "var(--text-muted)", paddingLeft: 13 }}>{subtitle}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════
function DashboardOverview({ stats, onNavigate }) {
  const top5High = useMemo(() => [...RAW_DATA].sort((a, b) => b.sem2 - a.sem2).slice(0, 5), []);
  const top5Low = useMemo(() => [...RAW_DATA].sort((a, b) => a.sem2 - b.sem2).slice(0, 5), []);
  const maxSem2 = Math.max(...RAW_DATA.map(d => d.sem2));

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="5 Garis Kemiskinan Tertinggi" subtitle="Sem. 2 (September 2025)" color="#2563eb" />
          {top5High.map((d, i) => (
            <div className="rank-item" key={d.provinsi}>
              <div className="rank-num" style={{ background: i === 0 ? "#dbeafe" : undefined, color: i === 0 ? "#2563eb" : undefined }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{d.provinsi}</div>
                <div className="mini-bar-wrap"><div className="mini-bar-fill" style={{ width: `${(d.sem2 / maxSem2) * 100}%`, background: "#2563eb" }} /></div>
              </div>
              <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "#2563eb", flexShrink: 0 }}>{(d.sem2 / 1000).toFixed(0)}K</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="5 Garis Kemiskinan Terendah" subtitle="Sem. 2 (September 2025)" color="#10b981" />
          {top5Low.map((d, i) => (
            <div className="rank-item" key={d.provinsi}>
              <div className="rank-num" style={{ background: i === 0 ? "#d1fae5" : undefined, color: i === 0 ? "#10b981" : undefined }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{d.provinsi}</div>
                <div className="mini-bar-wrap"><div className="mini-bar-fill" style={{ width: `${(d.sem2 / maxSem2) * 100}%`, background: "#10b981" }} /></div>
              </div>
              <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "#10b981", flexShrink: 0 }}>{(d.sem2 / 1000).toFixed(0)}K</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { key: "peta", icon: "🗺️", title: "Peta Interaktif", desc: "Visualisasi spasial seluruh provinsi" },
          { key: "semester", icon: "📊", title: "Perbandingan Semester", desc: "Bar chart Sem 1 vs Sem 2" },
          { key: "tabel", icon: "📋", title: "Tabel Lengkap", desc: "Sortir & cari seluruh data" },
        ].map(({ key, icon, title, desc }) => (
          <button key={key} onClick={() => onNavigate(key)} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12, background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "'Sora',sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [geoData, setGeoData] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [chartPage, setChartPage] = useState(0);
  const CHART_PAGE_SIZE = 10;

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(res => { if (!res.ok) throw new Error("Gagal ambil peta"); return res.json(); })
      .then(setGeoData)
      .catch(err => console.error("Error peta:", err));
  }, []);

  const handleSelect = useCallback((dataObj, key) => {
    setSelectedData(dataObj);
    setSelectedKey(key);
  }, []);

  const totalMiskinRibu = dataPendudukMiskin.reduce((total, item) => total + item.sem2, 0);
  const formatTotalMiskin = ((totalMiskinRibu * 1000) / 1000000).toFixed(1) + " Juta Jiwa";

  const stats = useMemo(() => {
    const maxProv = RAW_DATA.reduce((a, b) => a.sem2 > b.sem2 ? a : b);
    const minProv = RAW_DATA.reduce((a, b) => a.sem2 < b.sem2 ? a : b);
    const avg = Math.round(RAW_DATA.reduce((s, b) => s + b.sem2, 0) / RAW_DATA.length);
    const totalPop = RAW_DATA.reduce((s, b) => s + b.penduduk, 0);
    return { maxProv, minProv, avg, totalPop };
  }, []);

  const totalPages = Math.ceil(RAW_DATA.length / CHART_PAGE_SIZE);
  const barData = useMemo(() => {
    const sorted = [...RAW_DATA].sort((a, b) => b.sem2 - a.sem2);
    const start = chartPage * CHART_PAGE_SIZE;
    return sorted.slice(start, start + CHART_PAGE_SIZE).map(d => ({
      name: d.provinsi, fullName: d.provinsi,
      "Sem. 1": d.sem1, "Sem. 2": d.sem2,
    }));
  }, [chartPage]);

  const scatterData = useMemo(() => RAW_DATA.map(d => ({
    name: d.provinsi,
    x: Number((d.penduduk / 10000).toFixed(1)),
    y: d.sem2, z: 1,
  })), []);

  const kenaikanData = useMemo(() => [...RAW_DATA].map(d => ({
    name: d.provinsi.length > 14 ? d.provinsi.slice(0, 14) + "…" : d.provinsi,
    kenaikan: d.sem2 - d.sem1,
  })).sort((a, b) => b.kenaikan - a.kenaikan), []);

  const navItems = [
    { key: "overview", icon: "⊞", label: "Dashboard" },
    { key: "peta", icon: "◎", label: "Peta Interaktif" },
    { key: "semester", icon: "▦", label: "Perbandingan Semester" },
    { key: "korelasi", icon: "⟡", label: "Korelasi Data" },
    { key: "kenaikan", icon: "↑", label: "Kenaikan Garis" },
    { key: "tabel", icon: "≡", label: "Tabel Lengkap" },
  ];

  const currentNav = navItems.find(n => n.key === activeSection);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* ─── SIDEBAR ─── */}
        <aside style={{ width: "var(--sidebar)", position: "fixed", top: 0, left: 0, height: "100vh", background: "#fff", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 40 }}>
          <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>PD</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Portal Data</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.2, marginTop: 1 }}>Analisis Kemiskinan 2025</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
            <div className="section-label" style={{ paddingLeft: 4 }}>Menu Utama</div>
            {navItems.map(({ key, icon, label }) => (
              <button key={key} className={`nav-item ${activeSection === key ? "active" : ""}`} onClick={() => setActiveSection(key)}>
                <span className="nav-icon" style={{ fontSize: 14 }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div style={{ padding: "12px 12px 8px", borderTop: "1px solid var(--border)" }}>
            <div className="section-label">Statistik Kunci</div>
            {[
              { label: "Tertinggi", val: stats.maxProv.provinsi, color: "#2563eb" },
              { label: "Terendah", val: stats.minProv.provinsi, color: "#10b981" },
              { label: "Cakupan", val: `${RAW_DATA.length} provinsi`, color: "#8b5cf6" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 12px", background: "var(--gray-50)", borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 10.5, color: "var(--gray-400)" }}>© 2025 BPS Indonesia</p>
          </div>
        </aside>

        {/* ─── MAIN ─── */}
        <div style={{ marginLeft: "var(--sidebar)", width: "calc(100vw - var(--sidebar))", minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{currentNav?.label || "Dashboard"}</h1>
              <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1 }}>Statistik Terpadu Kesejahteraan Rakyat — Data Terkini: Sem 1 &amp; Sem 2 2025</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span className="top-bar-item badge" style={{ background: "#dbeafe", color: "#1e40af" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", animation: "pulse-dot 2s ease-in-out infinite", display: "inline-block" }} />
                34 Provinsi
              </span>
              <span className="top-bar-item badge" style={{ background: "#d1fae5", color: "#065f46" }}>Data 2025</span>
            </div>
          </header>

          <main style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* STAT CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
              <StatCard label="Garis Tertinggi" value={`Rp ${(stats.maxProv.sem2 / 1000).toFixed(0)}K`} sub={stats.maxProv.provinsi} color="#2563eb" icon="🏆" delay={0} />
              <StatCard label="Garis Terendah" value={`Rp ${(stats.minProv.sem2 / 1000).toFixed(0)}K`} sub={stats.minProv.provinsi} color="#10b981" icon="📉" delay={0.05} />
              <StatCard label="Rata-rata Nasional" value={`Rp ${(stats.avg / 1000).toFixed(0)}K`} sub="Per kapita/bulan (Sem. 2)" color="#8b5cf6" icon="📊" delay={0.1} />
              <StatCard label="Penduduk Miskin" value={formatTotalMiskin} sub="Nasional (Sem. 2)" color="#ef4444" icon="⚠️" delay={0.15} />
              <StatCard label="Total Populasi" value={`${(stats.totalPop / 10000).toFixed(1)} Juta`} sub="Jiwa keseluruhan" color="#f59e0b" icon="👥" delay={0.2} />
            </div>

            {activeSection === "overview" && (
              <div className="fade-up">
                <DashboardOverview stats={stats} onNavigate={setActiveSection} />
              </div>
            )}

            {activeSection === "peta" && (
              <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
                <div className="card" style={{ padding: 20 }}>
                  <SectionHeader
                    title="Peta Sebaran Garis Kemiskinan Indonesia"
                    subtitle="Hover untuk nama provinsi · Klik untuk detail di panel kanan"
                  />
                  <MapSection geoData={geoData} selectedKey={selectedKey} onSelect={handleSelect} />
                  <MapLegend />
                </div>
                <div className="card" style={{ minHeight: 480 }}>
                  <ProvincePanel data={selectedData} onClose={() => handleSelect(null, null)} />
                </div>
              </div>
            )}

            {activeSection === "semester" && (
              <div className="card fade-up" style={{ padding: 20 }}>
                <SectionHeader title="Perbandingan Garis Kemiskinan: Semester 1 vs Semester 2" subtitle="Garis kemiskinan per kapita/bulan (Rp), diurutkan dari tertinggi" />
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16, gap: 16 }}>
                  <div style={{ display: "flex", gap: 12, flex: 1 }}>
                    {[{ color: "#2563eb", label: "Semester 1 (Maret)" }, { color: "#10b981", label: "Semester 2 (September)" }].map(({ color, label }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button className="btn btn-ghost" onClick={() => setChartPage(p => Math.max(0, p - 1))} disabled={chartPage === 0}>← Prev</button>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)", minWidth: 50, textAlign: "center" }}>{chartPage + 1} / {totalPages}</span>
                    <button className="btn btn-ghost" onClick={() => setChartPage(p => Math.min(totalPages - 1, p + 1))} disabled={chartPage === totalPages - 1}>Next →</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={barData} margin={{ top: 4, right: 16, left: 40, bottom: 90 }} barGap={4} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f9" vertical={false} />
                    <XAxis dataKey="name" interval={0} tick={{ fill: "#8896b3", fontSize: 10, fontFamily: "Sora" }} axisLine={{ stroke: "#dde4f0" }} tickLine={false} angle={-38} textAnchor="end" height={100} />
                    <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "#8896b3", fontSize: 10, fontFamily: "Sora" }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<BarTooltip />} cursor={{ fill: "rgba(37,99,235,0.04)" }} />
                    <Bar dataKey="Sem. 1" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="Sem. 2" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeSection === "korelasi" && (
              <div className="card fade-up" style={{ padding: 20 }}>
                <SectionHeader title="Korelasi: Garis Kemiskinan vs Jumlah Penduduk" subtitle="Setiap titik = 1 provinsi · X: Penduduk (Juta Jiwa) · Y: Garis Kemiskinan Sem. 2 (Rp)" color="#8b5cf6" />
                <ResponsiveContainer width="100%" height={420}>
                  <ScatterChart margin={{ top: 10, right: 30, left: 40, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f9" />
                    <XAxis type="number" dataKey="x" name="Penduduk" tickFormatter={v => `${v} Juta`}
                      tick={{ fill: "#8896b3", fontSize: 10 }} axisLine={{ stroke: "#dde4f0" }} tickLine={false}
                      label={{ value: "Jumlah Penduduk (Juta Jiwa)", position: "insideBottom", offset: -18, fill: "#8896b3", fontSize: 11 }} />
                    <YAxis type="number" dataKey="y" name="Garis Kemiskinan" tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                      tick={{ fill: "#8896b3", fontSize: 10 }} axisLine={false} tickLine={false}
                      label={{ value: "Garis Kemiskinan (Rp)", angle: -90, position: "insideLeft", offset: -20, fill: "#8896b3", fontSize: 11 }} />
                    <ZAxis dataKey="z" range={[70, 70]} />
                    <RechartsTooltip content={<ScatterTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
                    <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.6} stroke="#4f46e5" strokeWidth={1} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeSection === "kenaikan" && (
              <div className="card fade-up" style={{ padding: 20 }}>
                <SectionHeader title="Kenaikan Garis Kemiskinan Sem. 1 → Sem. 2 per Provinsi" subtitle="Diurutkan dari kenaikan terbesar · Satuan: Rupiah" color="#f59e0b" />
                <ResponsiveContainer width="100%" height={Math.max(500, kenaikanData.length * 28 + 60)}>
                  <BarChart data={kenaikanData} layout="vertical" margin={{ top: 0, right: 70, left: 140, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f9" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "#8896b3", fontSize: 10 }} axisLine={{ stroke: "#dde4f0" }} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#4a5578", fontSize: 10.5 }} axisLine={false} tickLine={false} width={135} />
                    <RechartsTooltip formatter={v => [fmtRp(v), "Kenaikan"]} contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, fontFamily: "Sora" }} cursor={{ fill: "rgba(245,158,11,0.06)" }} />
                    <Bar dataKey="kenaikan" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={14}
                      label={{ position: "right", formatter: v => `+${(v / 1000).toFixed(0)}K`, fill: "#8896b3", fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeSection === "tabel" && (
              <div className="card fade-up" style={{ padding: 20 }}>
                <SectionHeader title="Tabel Ringkasan Data Seluruh Provinsi" subtitle="Klik baris untuk menyorot · Klik header kolom untuk mengurutkan" color="#10b981" />
                {selectedData && (
                  <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: "#eff6ff", border: "1px solid #bae6fd", display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>Dipilih</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{selectedData.provinsi}</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                      {[
                        { l: "Sem. 1", v: fmtRp(selectedData.sem1), c: "#2563eb" },
                        { l: "Sem. 2", v: fmtRp(selectedData.sem2), c: "#10b981" },
                        { l: "Kenaikan", v: `+${fmtRp(selectedData.sem2 - selectedData.sem1)}`, c: "#f59e0b" },
                        { l: "Penduduk", v: `${fmt(selectedData.penduduk)} rb`, c: "#8b5cf6" },
                      ].map(({ l, v, c }) => (
                        <div key={l} style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", textAlign: "center", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>{l}</div>
                          <div style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-ghost" onClick={() => handleSelect(null, null)} style={{ fontSize: 11 }}>Tutup ✕</button>
                  </div>
                )}
                <ProvinceTable selectedKey={selectedKey} onSelect={handleSelect} />
              </div>
            )}
          </main>

          <footer style={{ padding: "14px 24px", textAlign: "center", fontSize: 11.5, color: "var(--text-muted)", borderTop: "1px solid var(--border)", background: "#fff" }}>
            Portal Data · Sumber: BPS Indonesia 2025 · Garis Kemiskinan &amp; Kependudukan
          </footer>
        </div>
      </div>
    </>
  );
}