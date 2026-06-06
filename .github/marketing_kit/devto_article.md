# Building PrithviSetu: A WebGL 3D Globe and Mapping Hub in React

## The Problem
Developing mapping web applications often leads to high API costs (like Google Maps or Mapbox billing keys) or complex WebGL boilerplate if you want to integrate a 3D globe alongside a 2D interactive map. Caching maps for offline use adds another layer of complexity.

I wanted to build **PrithviSetu**:
1. An interactive WebGL 3D Globe for macroscopic views.
2. A detailed Leaflet-based 2D map for regional navigation.
3. Offline-first map caching capability using localforage.
4. Keyless geolocation and meteorological API integrations.

Here is how I did it.

## Architecture & Code Breakdown
PrithviSetu is built on React, TypeScript, Vite, Leaflet, and WebGL globes (powered by `react-globe.gl` and `cobe`).

The 3D Globe renders high-performance satellite textures using WebGL:

```tsx
import React, { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';

export function VisualGlobe() {
  const globeEl = useRef();
  
  useEffect(() => {
    // Spin the globe automatically
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.5;
  }, []);

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
    />
  );
}
```

The 2D map integrates Leaflet with **localforage** to cache retrieved tile images. This ensures that previously browsed map areas are available offline:

```typescript
import L from 'leaflet';
import localforage from 'localforage';

// Custom cached tile layer implementation
const OfflineTileLayer = L.TileLayer.extend({
  createTile(coords, done) {
    const tile = document.createElement('img');
    const url = this.getTileUrl(coords);
    const cacheKey = `tile-${coords.z}-${coords.x}-${coords.y}`;
    
    localforage.getItem(cacheKey).then((data) => {
      if (data) {
        tile.src = data;
        done(null, tile);
      } else {
        fetch(url).then(r => r.blob()).then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            localforage.setItem(cacheKey, reader.result);
            tile.src = reader.result;
            done(null, tile);
          };
          reader.readAsDataURL(blob);
        });
      }
    });
    return tile;
  }
});
```

We also integrated keyless APIs (Nominatim for location search and Open-Meteo for live atmospheric forecasts) to eliminate the requirement for API key configurations.

## Lessons Learned
1. **WebGL Canvas Optimization:** Running full 3D textures alongside active 2D Leaflet rendering can cause frame drops. Setting up lazy-loading to mount maps only when active resolved performance issues.
2. **Local Cache Limits:** Map tiles are heavy. We added simple index purging logic to localforage to ensure cache sizes do not exceed storage quotas.

## Check It Out!
PrithviSetu is open-source and ready for customization.
👉 [https://github.com/itsrkmahapatra/PrithviSetu](https://github.com/itsrkmahapatra/PrithviSetu)