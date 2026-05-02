# In-Formasik — Dashboard Kemiskinan & Kependudukan Indonesia

Dashboard interaktif berbasis React untuk memvisualisasikan data kemiskinan dan kependudukan di 34 provinsi Indonesia.

---

## Stack Teknologi

- **React 18** — UI Framework
- **Tailwind CSS** — Styling utility-first
- **React-Leaflet** — Peta interaktif GeoJSON
- **Recharts** — Bar chart, Scatter chart, Line chart
- **Sora / DM Mono** — Google Fonts

---

## Instalasi & Setup

### 1. Buat proyek React baru

```bash
npm create vite@latest informasik -- --template react
cd informasik
```

### 2. Install dependencies

```bash
npm install
npm install recharts
npm install leaflet react-leaflet
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Konfigurasi Tailwind

Edit `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

Edit `src/index.css` (ganti isi dengan):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Tambahkan CSS Leaflet

Di `src/main.jsx`, tambahkan import:

```js
import "leaflet/dist/leaflet.css";
```

### 5. Salin komponen

Salin file `InFormasik.jsx` ke `src/App.jsx` (ganti isi file yang ada).

### 6. Jalankan

```bash
npm run dev
```

Buka `http://localhost:5173` di browser.

---

## Fitur Dashboard

| Fitur                    | Deskripsi                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Peta Interaktif**      | Peta choropleth Indonesia dengan warna berdasarkan garis kemiskinan Sem. 2. Hover/klik provinsi untuk detail. |
| **Stat Cards**           | Ringkasan: provinsi tertinggi, terendah, rata-rata nasional, total populasi                                   |
| **Bar Chart Semester**   | Perbandingan Sem. 1 vs Sem. 2 per provinsi, dengan paginasi 10 per halaman                                    |
| **Scatter Chart**        | Korelasi antara jumlah penduduk dan garis kemiskinan                                                          |
| **Horizontal Bar Chart** | Visualisasi kenaikan garis kemiskinan antar semester                                                          |
| **Tabel Interaktif**     | Sortir, pencarian, highlight provinsi yang dipilih                                                            |

---

## Sumber Data

- **Garis Kemiskinan**: BPS Indonesia, Maret & September 2025
- **Batas Provinsi (GeoJSON)**: https://github.com/ans-4175/peta-indonesia-geojson
- **Basemap**: CartoDB Dark (No Labels)

---

## Struktur Komponen

```
InFormasik (App)
├── Header (sticky, branding + badge)
├── StatCard[] (4 kartu ringkasan)
├── SelectedProvince (detail saat diklik)
├── MapSection (React-Leaflet + GeoJSON)
│   └── MapLegend
├── AnalysisTabs
│   ├── Tab: Perbandingan Semester (BarChart)
│   └── Tab: Korelasi Kemiskinan & Penduduk (ScatterChart)
├── ProvinceTable (sortable, searchable)
└── KenaikanChart (horizontal BarChart)
```

---

## Catatan Teknis

- Data provinsi di-hardcode langsung dalam file JSX untuk memastikan aplikasi berjalan tanpa backend.
- GeoJSON dimuat dari URL GitHub pada saat runtime (memerlukan koneksi internet).
- Mapping nama provinsi antara GeoJSON dan data CSV ada di objek `GEO_NAME_MAP`.
- Peta menggunakan tile layer CartoDB Dark yang tidak memerlukan API key.
