import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

// ─── NOTE: tambahkan di main.jsx atau index.js ─────────────────────────────
// import 'leaflet/dist/leaflet.css'

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
  {
    provinsi: "Kep. Bangka Belitung",
    sem1: 956833,
    sem2: 992426,
    penduduk: 15697,
  },
  { provinsi: "Kep. Riau", sem1: 832410, sem2: 870738, penduduk: 22431 },
  { provinsi: "DKI Jakarta", sem1: 852768, sem2: 897768, penduduk: 106697 },
  { provinsi: "Jawa Barat", sem1: 547752, sem2: 575499, penduduk: 511639 },
  { provinsi: "Jawa Tengah", sem1: 537812, sem2: 570870, penduduk: 38565 },
  { provinsi: "DI. Yogyakarta", sem1: 626363, sem2: 649331, penduduk: 38027 },
  { provinsi: "Jawa Timur", sem1: 558029, sem2: 585020, penduduk: 42352 },
  { provinsi: "Banten", sem1: 684232, sem2: 715288, penduduk: 126413 },
  { provinsi: "Bali", sem1: 607847, sem2: 642986, penduduk: 44882 },
  {
    provinsi: "Nusa Tenggara Barat",
    sem1: 556846,
    sem2: 575856,
    penduduk: 58153,
  },
  {
    provinsi: "Nusa Tenggara Timur",
    sem1: 549607,
    sem2: 563052,
    penduduk: 58286,
  },
  { provinsi: "Kalimantan Barat", sem1: 622882, sem2: 652220, penduduk: 5835 },
  {
    provinsi: "Kalimantan Tengah",
    sem1: 654066,
    sem2: 683664,
    penduduk: 28795,
  },
  {
    provinsi: "Kalimantan Selatan",
    sem1: 650675,
    sem2: 684567,
    penduduk: 43721,
  },
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

// Lookup data dengan key LOWERCASE untuk pencocokan case-insensitive
const DATA_LOOKUP = {};
RAW_DATA.forEach((d) => {
  DATA_LOOKUP[d.provinsi.toLowerCase()] = d;
});

// Alias tambahan untuk nama GeoJSON yang berbeda (semua LOWERCASE)
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
  // cek alias dulu
  const aliased = GEO_ALIASES[lower] || lower;
  return DATA_LOOKUP[aliased] ? aliased : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const fmt = (n) => n?.toLocaleString("id-ID") ?? "-";
const fmtRp = (n) => `Rp ${fmt(n)}`;

// Warna choropleth (light-mode-friendly)
function getMapColor(sem2) {
  if (!sem2) return "#e2e8f0";
  if (sem2 >= 900000) return "#0369a1"; // sky-700
  if (sem2 >= 800000) return "#0284c7"; // sky-600
  if (sem2 >= 700000) return "#059669"; // emerald-600
  if (sem2 >= 600000) return "#10b981"; // emerald-500
  if (sem2 >= 500000) return "#34d399"; // emerald-400
  return "#6ee7b7"; // emerald-300
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════
function StatCard({ label, value, sub, borderColor, iconBg, icon }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2 border-t-4"
      style={{ borderTopColor: borderColor }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION HEADER
// ═══════════════════════════════════════════════════════════════════════════
function SectionHeader({ title, subtitle, accent = "#0ea5e9" }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-1 h-8 rounded-full flex-shrink-0"
        style={{ background: accent }}
      />
      <div>
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVINCE DETAIL PANEL (tampil di samping peta saat diklik)
// ═══════════════════════════════════════════════════════════════════════════
function ProvincePanel({ data, onClose }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
          🗺️
        </div>
        <p className="text-sm font-semibold text-slate-500">Pilih Provinsi</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Klik atau hover pada wilayah peta untuk melihat detail data provinsi.
        </p>
      </div>
    );
  }

  const kenaikan = data.sem2 - data.sem1;
  const pctKenaikan = ((kenaikan / data.sem1) * 100).toFixed(2);

  const rows = [
    { label: "Sem. 1 (Maret 2025)", value: fmtRp(data.sem1), color: "#0ea5e9" },
    {
      label: "Sem. 2 (September 2025)",
      value: fmtRp(data.sem2),
      color: "#10b981",
    },
    { label: "Kenaikan", value: `+${fmtRp(kenaikan)}`, color: "#f59e0b" },
    { label: "Perubahan (%)", value: `+${pctKenaikan}%`, color: "#8b5cf6" },
    {
      label: "Penduduk",
      value: `${fmt(data.penduduk)} ribu`,
      color: "#ef4444",
    },
  ];

  // mini bar untuk visualisasi kecil
  const maxSem = Math.max(data.sem1, data.sem2);

  return (
    <div className="flex flex-col h-full">
      {/* Header panel */}
      <div className="flex items-start justify-between p-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-sky-500 uppercase tracking-wider">
            Provinsi Dipilih
          </span>
          <h3 className="text-base font-bold text-slate-800 mt-0.5 leading-tight">
            {data.provinsi}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors text-xs flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>

      {/* Mini comparison bar */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-400 mb-2">Garis Kemiskinan</p>
        <div className="space-y-2">
          {[
            { label: "Sem. 1", val: data.sem1, color: "#0ea5e9" },
            { label: "Sem. 2", val: data.sem2, color: "#10b981" },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">{label}</span>
                <span className="font-mono font-semibold" style={{ color }}>
                  {fmtRp(val)}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(val / maxSem) * 100}%`,
                    background: color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data rows */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {rows.map(({ label, value, color }) => (
          <div
            key={label}
            className="flex items-center justify-between py-2 border-b border-slate-50"
          >
            <span className="text-xs text-slate-500">{label}</span>
            <span className="text-xs font-bold font-mono" style={{ color }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="p-3 bg-slate-50 rounded-b-2xl">
        <p className="text-xs text-slate-400 text-center">
          Klik provinsi lain untuk membandingkan
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAP SECTION — menggunakan useRef untuk layer control, tanpa re-key GeoJSON
// ═══════════════════════════════════════════════════════════════════════════
function MapSection({ geoData, selectedKey, onSelect }) {
  const geoJsonRef = useRef(null);
  const selectedRef = useRef(selectedKey);

  useEffect(() => {
    selectedRef.current = selectedKey;
  }, [selectedKey]);

  const getStyle = useCallback((feature) => {
    const props = feature?.properties || {};
    const rawName =
      props.state || props.name || props.Propinsi || props.NAME_1 || "";
    const key = resolveGeoName(rawName);
    const d = key ? DATA_LOOKUP[key] : null;
    const isSelected = key === selectedRef.current;

    return {
      fillColor: d ? getMapColor(d.sem2) : "#e2e8f0",
      fillOpacity: isSelected ? 1 : 0.72,
      color: isSelected ? "#1e3a5f" : "#94a3b8",
      weight: isSelected ? 2.5 : 0.6,
      opacity: 1,
    };
  }, []); // stabil — baca dari ref

  const onEachFeature = useCallback(
    (feature, layer) => {
      const props = feature?.properties || {};
      const rawName =
        props.state || props.name || props.Propinsi || props.NAME_1 || "";
      const key = resolveGeoName(rawName);
      const d = key ? DATA_LOOKUP[key] : null;

      layer.on({
        click: () => {
          if (!key) return;
          const next = key === selectedRef.current ? null : key;
          onSelect(next ? DATA_LOOKUP[next] : null, next);
        },
        mouseover: (e) => {
          e.target.setStyle({
            weight: 2,
            color: "#0369a1",
            fillOpacity: 0.9,
          });
          e.target.bringToFront();
        },
        mouseout: (e) => {
          if (geoJsonRef.current) {
            geoJsonRef.current.resetStyle(e.target);
          }
        },
      });

      if (d) {
        layer.bindTooltip(
          `<div style="
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          min-width: 190px;
        ">
          <div style="font-weight:700;color:#1e293b;margin-bottom:8px;font-size:13px;border-bottom:1px solid #f1f5f9;padding-bottom:6px;">
            ${d.provinsi}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px;">
            <span style="color:#64748b;">Sem. 1 (Mar)</span>
            <span style="color:#0ea5e9;font-weight:600;">Rp ${fmt(d.sem1)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px;">
            <span style="color:#64748b;">Sem. 2 (Sep)</span>
            <span style="color:#10b981;font-weight:600;">Rp ${fmt(d.sem2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;">
            <span style="color:#64748b;">Penduduk</span>
            <span style="color:#8b5cf6;font-weight:600;">${fmt(d.penduduk)} ribu</span>
          </div>
        </div>`,
          { sticky: true, opacity: 1, className: "informasik-tooltip" },
        );
      }
    },
    [onSelect],
  );

  // Update style semua layer ketika selectedKey berubah — TANPA re-key GeoJSON
  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.eachLayer((layer) => {
      const feature = layer.feature;
      if (!feature) return;
      const props = feature.properties || {};
      const rawName =
        props.state || props.name || props.Propinsi || props.NAME_1 || "";
      const key = resolveGeoName(rawName);
      const d = key ? DATA_LOOKUP[key] : null;
      const isSelected = key === selectedKey;
      layer.setStyle({
        fillColor: d ? getMapColor(d.sem2) : "#e2e8f0",
        fillOpacity: isSelected ? 1 : 0.72,
        color: isSelected ? "#1e3a5f" : "#94a3b8",
        weight: isSelected ? 2.5 : 0.6,
      });
    });
  }, [selectedKey]);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
      style={{ height: 420 }}
    >
      <MapContainer
        center={[-2.5, 118]}
        zoom={4.5}
        style={{ height: "100%", width: "100%", background: "#f0f9ff" }}
        zoomControl={true}
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution=""
        />
        {geoData && (
          <GeoJSON
            ref={geoJsonRef}
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHART TOOLTIPS
// ═══════════════════════════════════════════════════════════════════════════
function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs"
      style={{ minWidth: 200 }}
    >
      <p className="font-bold text-slate-700 mb-2 pb-2 border-b border-slate-100">
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-3 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono font-semibold text-slate-700">
            Rp {fmt(p.value)}
          </span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between">
          <span className="text-slate-400">Kenaikan</span>
          <span className="font-mono font-semibold text-emerald-600">
            +{fmt(payload[1].value - payload[0].value)}
          </span>
        </div>
      )}
    </div>
  );
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs"
      style={{ minWidth: 190 }}
    >
      <p className="font-bold text-slate-700 mb-2">{d.provinsi}</p>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-slate-400">Garis Kemiskinan</span>
        <span className="font-mono text-sky-600 font-semibold">
          Rp {fmt(d.sem2)}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Penduduk</span>
        <span className="font-mono text-emerald-600 font-semibold">
          {fmt(d.penduduk)} rb
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVINCE TABLE
// ═══════════════════════════════════════════════════════════════════════════
function ProvinceTable({ selectedKey, onSelect }) {
  const [sortKey, setSortKey] = useState("sem2");
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    let d = [...RAW_DATA];
    if (search)
      d = d.filter((r) =>
        r.provinsi.toLowerCase().includes(search.toLowerCase()),
      );
    d.sort((a, b) => {
      const valA = sortKey === "kenaikan" ? a.sem2 - a.sem1 : a[sortKey];
      const valB = sortKey === "kenaikan" ? b.sem2 - b.sem1 : b[sortKey];
      if (typeof valA === "string")
        return sortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      return sortDir === "asc" ? valA - valB : valB - valA;
    });
    return d;
  }, [sortKey, sortDir, search]);

  const cols = [
    { key: "provinsi", label: "Provinsi", align: "left" },
    { key: "sem1", label: "Sem. 1 (Mar)", align: "right" },
    { key: "sem2", label: "Sem. 2 (Sep)", align: "right" },
    { key: "kenaikan", label: "Kenaikan", align: "right" },
    { key: "penduduk", label: "Penduduk (rb)", align: "right" },
  ];

  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          placeholder="🔍  Cari provinsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm" style={{ minWidth: 640 }}>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {cols.map(({ key, label, align }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                  style={{ textAlign: align }}
                  onClick={() => toggleSort(key)}
                >
                  {label}{" "}
                  <span
                    className="text-slate-300"
                    style={{ color: sortKey === key ? "#0ea5e9" : undefined }}
                  >
                    {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sorted.map((row, i) => {
              const key = row.provinsi.toLowerCase();
              const isSelected = key === selectedKey;
              const kenaikan = row.sem2 - row.sem1;
              return (
                <tr
                  key={row.provinsi}
                  onClick={() =>
                    onSelect(isSelected ? null : row, isSelected ? null : key)
                  }
                  className="cursor-pointer transition-colors"
                  style={{
                    background: isSelected
                      ? "#eff6ff"
                      : i % 2 === 0
                        ? "#fff"
                        : "#fafafa",
                    borderLeft: isSelected
                      ? "3px solid #0ea5e9"
                      : "3px solid transparent",
                  }}
                >
                  <td
                    className="px-4 py-2.5 font-semibold"
                    style={{ color: isSelected ? "#0369a1" : "#334155" }}
                  >
                    {row.provinsi}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-sky-600">
                    {fmt(row.sem1)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-600">
                    {fmt(row.sem2)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-amber-600">
                    +{fmt(kenaikan)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-violet-600">
                    {fmt(row.penduduk)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-right">
        Menampilkan {sorted.length} dari {RAW_DATA.length} provinsi
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR NAV ITEM
// ═══════════════════════════════════════════════════════════════════════════
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
      style={{
        background: active ? "#eff6ff" : "transparent",
        color: active ? "#0369a1" : "#64748b",
      }}
    >
      <span className="text-base w-5 text-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAP LEGEND
// ═══════════════════════════════════════════════════════════════════════════
function MapLegend() {
  const items = [
    { color: "#6ee7b7", label: "< 500K" },
    { color: "#34d399", label: "500–600K" },
    { color: "#10b981", label: "600–700K" },
    { color: "#059669", label: "700–800K" },
    { color: "#0284c7", label: "800–900K" },
    { color: "#0369a1", label: "> 900K" },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
      <span className="text-xs text-slate-400 font-medium w-full">
        Garis Kemiskinan Sem. 2 (Rp):
      </span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ background: item.color }}
          />
          <span className="text-xs text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [geoData, setGeoData] = useState(null);
  const [selectedData, setSelectedData] = useState(null); // full data object
  const [selectedKey, setSelectedKey] = useState(null); // lowercase key
  const [activeSection, setActiveSection] = useState("peta");
  const [chartPage, setChartPage] = useState(0);
  const CHART_PAGE_SIZE = 10;

  // Load GeoJSON
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => console.warn("Gagal memuat GeoJSON peta."));
  }, []);

  // Callback dari map atau tabel
  const handleSelect = useCallback((dataObj, key) => {
    setSelectedData(dataObj);
    setSelectedKey(key);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const maxProv = RAW_DATA.reduce((a, b) => (a.sem2 > b.sem2 ? a : b));
    const minProv = RAW_DATA.reduce((a, b) => (a.sem2 < b.sem2 ? a : b));
    const avg = Math.round(
      RAW_DATA.reduce((s, b) => s + b.sem2, 0) / RAW_DATA.length,
    );
    const totalPop = RAW_DATA.reduce((s, b) => s + b.penduduk, 0);
    return { maxProv, minProv, avg, totalPop };
  }, []);

  // Bar chart data
  const totalPages = Math.ceil(RAW_DATA.length / CHART_PAGE_SIZE);
  const barData = useMemo(() => {
    const sorted = [...RAW_DATA].sort((a, b) => b.sem2 - a.sem2);
    const start = chartPage * CHART_PAGE_SIZE;
    return sorted.slice(start, start + CHART_PAGE_SIZE).map((d) => ({
      name: d.provinsi.length > 11 ? d.provinsi.slice(0, 11) + "…" : d.provinsi,
      fullName: d.provinsi,
      "Sem. 1": d.sem1,
      "Sem. 2": d.sem2,
    }));
  }, [chartPage]);

  // Scatter data
  const scatterData = useMemo(
    () => RAW_DATA.map((d) => ({ ...d, x: d.penduduk, y: d.sem2, z: 8 })),
    [],
  );

  // Kenaikan data
  const kenaikanData = useMemo(
    () =>
      [...RAW_DATA]
        .map((d) => ({
          name:
            d.provinsi.length > 12 ? d.provinsi.slice(0, 12) + "…" : d.provinsi,
          kenaikan: d.sem2 - d.sem1,
        }))
        .sort((a, b) => b.kenaikan - a.kenaikan),
    [],
  );

  const navItems = [
    { key: "peta", icon: "🗺️", label: "Peta Interaktif" },
    { key: "semester", icon: "📊", label: "Perbandingan Semester" },
    { key: "korelasi", icon: "🔗", label: "Korelasi Data" },
    { key: "kenaikan", icon: "📈", label: "Kenaikan Garis" },
    { key: "tabel", icon: "📋", label: "Tabel Lengkap" },
  ];

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "#f1f5f9",
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .leaflet-container { font-family: 'DM Sans', sans-serif !important; }
        .informasik-tooltip .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-tooltip-pane .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          SIDEBAR KIRI — FIXED
      ══════════════════════════════════════════════════════ */}
      <aside
        className="fixed top-0 left-0 h-screen flex flex-col z-40"
        style={{
          width: 240,
          background: "#fff",
          borderRight: "1px solid #e2e8f0",
          boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #10b981)",
              }}
            >
              IF
            </div>
            <div>
              <h1 className="font-black text-slate-800 text-base leading-tight tracking-tight">
                In-Formasik
              </h1>
              <p className="text-xs text-slate-400 leading-tight">
                Data Kemiskinan 2025
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Navigasi
          </p>
          {navItems.map(({ key, icon, label }) => (
            <NavItem
              key={key}
              icon={icon}
              label={label}
              active={activeSection === key}
              onClick={() => setActiveSection(key)}
            />
          ))}
        </div>

        {/* Sidebar stats ringkasan */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Statistik Kunci
          </p>
          {[
            {
              label: "Tertinggi",
              val: stats.maxProv.provinsi,
              color: "#0ea5e9",
            },
            {
              label: "Terendah",
              val: stats.minProv.provinsi,
              color: "#10b981",
            },
            {
              label: "Provinsi",
              val: `${RAW_DATA.length} wilayah`,
              color: "#8b5cf6",
            },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">{label}</span>
              <span
                className="text-xs font-bold truncate ml-2"
                style={{ color, maxWidth: 120 }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>

        {/* Footer sidebar */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <p className="text-xs text-slate-400">© 2025 BPS Indonesia</p>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT — offset by sidebar width
      ══════════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col"
        style={{ marginLeft: 240, minWidth: 0 }}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {navItems.find((n) => n.key === activeSection)?.icon}{" "}
              {navItems.find((n) => n.key === activeSection)?.label}
            </h2>
            <p className="text-xs text-slate-400">
              Dashboard Kemiskinan & Kependudukan Indonesia
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
              34 Provinsi
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              Data 2025
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* ── STAT CARDS (selalu tampil) ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Garis Tertinggi"
              value={`Rp ${(stats.maxProv.sem2 / 1000).toFixed(0)}K`}
              sub={stats.maxProv.provinsi}
              borderColor="#0ea5e9"
              iconBg="#eff6ff"
              icon="🏆"
            />
            <StatCard
              label="Garis Terendah"
              value={`Rp ${(stats.minProv.sem2 / 1000).toFixed(0)}K`}
              sub={stats.minProv.provinsi}
              borderColor="#10b981"
              iconBg="#ecfdf5"
              icon="📉"
            />
            <StatCard
              label="Rata-rata Nasional"
              value={`Rp ${(stats.avg / 1000).toFixed(0)}K`}
              sub="Sem. 2 per kapita/bulan"
              borderColor="#8b5cf6"
              iconBg="#f5f3ff"
              icon="📊"
            />
            <StatCard
              label="Total Populasi"
              value={`${(stats.totalPop / 1000).toFixed(1)}M`}
              sub="dalam ribuan jiwa"
              borderColor="#f59e0b"
              iconBg="#fffbeb"
              icon="👥"
            />
          </div>

          {/* ══════════════════════════════════════════════════════
              SECTION: PETA
          ══════════════════════════════════════════════════════ */}
          {activeSection === "peta" && (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "1fr 280px" }}
            >
              {/* Peta */}
              <div
                className="bg-white rounded-2xl shadow-sm p-5"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <SectionHeader
                  title="Peta Sebaran Garis Kemiskinan Indonesia"
                  subtitle="Hover untuk info cepat · Klik untuk detail provinsi di panel kanan"
                  accent="#0ea5e9"
                />
                <MapSection
                  geoData={geoData}
                  selectedKey={selectedKey}
                  onSelect={handleSelect}
                />
                <MapLegend />
              </div>

              {/* Panel detail provinsi */}
              <div
                className="bg-white rounded-2xl shadow-sm flex flex-col"
                style={{ border: "1px solid #e2e8f0", minHeight: 480 }}
              >
                <ProvincePanel
                  data={selectedData}
                  onClose={() => handleSelect(null, null)}
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION: PERBANDINGAN SEMESTER
          ══════════════════════════════════════════════════════ */}
          {activeSection === "semester" && (
            <div
              className="bg-white rounded-2xl shadow-sm p-5"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <SectionHeader
                title="Perbandingan Garis Kemiskinan: Semester 1 vs Semester 2"
                subtitle="Garis kemiskinan per kapita/bulan (Rp), diurutkan dari tertinggi"
                accent="#0ea5e9"
              />
              {/* Legend */}
              <div className="flex gap-6 mb-4">
                {[
                  { color: "#0ea5e9", label: "Semester 1 (Maret)" },
                  { color: "#10b981", label: "Semester 2 (September)" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ background: color }}
                    />
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setChartPage((p) => Math.max(0, p - 1))}
                    disabled={chartPage === 0}
                    className="px-3 py-1 rounded-lg text-xs border transition-colors"
                    style={{
                      background: chartPage === 0 ? "#f8fafc" : "#eff6ff",
                      color: chartPage === 0 ? "#94a3b8" : "#0369a1",
                      borderColor: chartPage === 0 ? "#e2e8f0" : "#bae6fd",
                    }}
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-slate-400">
                    {chartPage + 1}/{totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setChartPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={chartPage === totalPages - 1}
                    className="px-3 py-1 rounded-lg text-xs border transition-colors"
                    style={{
                      background:
                        chartPage === totalPages - 1 ? "#f8fafc" : "#eff6ff",
                      color:
                        chartPage === totalPages - 1 ? "#94a3b8" : "#0369a1",
                      borderColor:
                        chartPage === totalPages - 1 ? "#e2e8f0" : "#bae6fd",
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={barData}
                  margin={{ top: 4, right: 16, left: 40, bottom: 64 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                    angle={-38}
                    textAnchor="end"
                    height={72}
                  />
                  <YAxis
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    content={<BarTooltip />}
                    cursor={{ fill: "rgba(14,165,233,0.05)" }}
                  />
                  <Bar
                    dataKey="Sem. 1"
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="Sem. 2"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION: KORELASI
          ══════════════════════════════════════════════════════ */}
          {activeSection === "korelasi" && (
            <div
              className="bg-white rounded-2xl shadow-sm p-5"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <SectionHeader
                title="Korelasi: Garis Kemiskinan vs Jumlah Penduduk"
                subtitle="Setiap titik = 1 provinsi · X: Penduduk (ribu) · Y: Garis Kemiskinan Sem. 2 (Rp)"
                accent="#8b5cf6"
              />
              <ResponsiveContainer width="100%" height={420}>
                <ScatterChart
                  margin={{ top: 10, right: 30, left: 40, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Penduduk"
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}M` : `${v}rb`
                    }
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                    label={{
                      value: "Jumlah Penduduk (ribu jiwa)",
                      position: "insideBottom",
                      offset: -18,
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Garis Kemiskinan"
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Garis Kemiskinan (Rp)",
                      angle: -90,
                      position: "insideLeft",
                      offset: -20,
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                  />
                  <ZAxis dataKey="z" range={[70, 70]} />
                  <RechartsTooltip
                    content={<ScatterTooltip />}
                    cursor={{ fill: "rgba(139,92,246,0.05)" }}
                  />
                  <Scatter
                    data={scatterData}
                    fill="#8b5cf6"
                    fillOpacity={0.65}
                    stroke="#7c3aed"
                    strokeWidth={1}
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-2">
                Catatan: Jawa Barat (511.639 ribu) tampil sebagai outlier jauh
                di sisi kanan
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION: KENAIKAN
          ══════════════════════════════════════════════════════ */}
          {activeSection === "kenaikan" && (
            <div
              className="bg-white rounded-2xl shadow-sm p-5"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <SectionHeader
                title="Kenaikan Garis Kemiskinan Sem. 1 → Sem. 2 per Provinsi"
                subtitle="Diurutkan dari kenaikan terbesar. Satuan: Rupiah"
                accent="#f59e0b"
              />
              <ResponsiveContainer
                width="100%"
                height={Math.max(500, kenaikanData.length * 28 + 60)}
              >
                <BarChart
                  data={kenaikanData}
                  layout="vertical"
                  margin={{ top: 0, right: 60, left: 130, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={125}
                  />
                  <RechartsTooltip
                    formatter={(v) => [fmtRp(v), "Kenaikan"]}
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "#334155",
                    }}
                    cursor={{ fill: "rgba(245,158,11,0.07)" }}
                  />
                  <Bar
                    dataKey="kenaikan"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={16}
                    label={{
                      position: "right",
                      formatter: (v) => `+${(v / 1000).toFixed(0)}K`,
                      fill: "#94a3b8",
                      fontSize: 10,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION: TABEL
          ══════════════════════════════════════════════════════ */}
          {activeSection === "tabel" && (
            <div
              className="bg-white rounded-2xl shadow-sm p-5"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <SectionHeader
                title="Tabel Ringkasan Data Seluruh Provinsi"
                subtitle="Klik baris untuk menyorot · Klik header kolom untuk mengurutkan"
                accent="#10b981"
              />

              {/* Detail panel inline jika ada yang dipilih */}
              {selectedData && (
                <div
                  className="mb-5 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 sm:items-center"
                  style={{ background: "#eff6ff", border: "1px solid #bae6fd" }}
                >
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-1">
                      Provinsi Dipilih
                    </p>
                    <h3 className="text-lg font-bold text-slate-800">
                      {selectedData.provinsi}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                    {[
                      {
                        label: "Sem. 1",
                        val: fmtRp(selectedData.sem1),
                        color: "#0ea5e9",
                      },
                      {
                        label: "Sem. 2",
                        val: fmtRp(selectedData.sem2),
                        color: "#10b981",
                      },
                      {
                        label: "Kenaikan",
                        val: `+${fmtRp(selectedData.sem2 - selectedData.sem1)}`,
                        color: "#f59e0b",
                      },
                      {
                        label: "Penduduk",
                        val: `${fmt(selectedData.penduduk)} rb`,
                        color: "#8b5cf6",
                      },
                    ].map(({ label, val, color }) => (
                      <div
                        key={label}
                        className="bg-white rounded-xl p-2.5 text-center shadow-sm"
                      >
                        <p className="text-xs text-slate-400 mb-1">{label}</p>
                        <p
                          className="text-xs font-bold font-mono"
                          style={{ color }}
                        >
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSelect(null, null)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
                  >
                    Tutup ✕
                  </button>
                </div>
              )}

              <ProvinceTable
                selectedKey={selectedKey}
                onSelect={handleSelect}
              />
            </div>
          )}
        </main>

        <footer className="px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200">
          In-Formasik · Sumber: BPS Indonesia 2025 · Garis Kemiskinan &
          Kependudukan
        </footer>
      </div>
    </div>
  );
}
