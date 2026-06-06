# ✍️ PrithviSetu

A WebGL-powered universal place visualizer featuring interactive 3D globes, Leaflet maps, offline caching, and automated AI research reports.

---

[![Build Status](https://img.shields.io/github/actions/workflow/status/itsrkmahapatra/PrithviSetu/ci.yml?branch=main)](https://github.com/itsrkmahapatra/PrithviSetu/actions)
[![License](https://img.shields.io/github/license/itsrkmahapatra/PrithviSetu)](https://github.com/itsrkmahapatra/PrithviSetu/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/itsrkmahapatra/PrithviSetu/pulls)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/itsrkmahapatra/PrithviSetu/graphs/commit-activity)

---

## 🎨 Product Demo Visual
Check out our interactive demo in action:

![Product Demo Visual](./assets/demo.gif)

---

## ✨ Key Features
- 🌎 **Spinning 3D WebGL Globe**: Implements high-performance geographic projection and interaction.
- 🗺️ **Interactive 2D Map**: Fully responsive Leaflet map interface tracking area markers.
- 🤖 **AI Research Reports**: Automated 500-word geographical analysis summaries powered by Pollinations.AI.
- 🔌 **No-Key API Architecture**: Consumes Nominatim and Open-Meteo services without rate-limiting keys.
- 📴 **Offline Caching**: Caches map areas locally using localforage for fully offline functionality.

---

## 🚀 Quick Start
Clone the repository, install dependencies with legacy-peer-deps, and spin up the Vite development server.

---

## 💡 Usage Example
Here is how to get started programmatically:

```typescript
import Globe from 'react-globe.gl';

export default function RenderGlobe() {
  return (
    <Globe
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
    />
  );
}
```

---

## 🛠️ Technology Stack
- **Core Technologies:** TypeScript, React, Vite, Leaflet, cobe (3D Globe), react-globe.gl, TailwindCSS
- **Environment Support:** Cross-platform web browsers & local instances where applicable.

---

## 🤝 Contributing
Contributions are extremely welcome! Please check out [CONTRIBUTING.md](.github/CONTRIBUTING.md) for local setup and guidelines.

---

## 📜 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 📥 Download Application
- [🖥️ Windows Download (.exe)](https://github.com/itsrkmahapatra/PrithviSetu/releases/download/v1.0.0/PrithviSetu.exe)
- [📱 Android Download (.apk)](https://github.com/itsrkmahapatra/PrithviSetu/releases/download/v1.0.0/PrithviSetu.apk)
