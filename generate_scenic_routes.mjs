import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const builderPath = path.join(__dirname, "build_roadtrip_attractions.mjs");
const outputPath = path.join(__dirname, "outputs", "northern_states_roadtrip", "scenic_roads_routes.json");

function extractScenicRoads(source) {
  const start = source.indexOf("const scenicRoads = [");
  const end = source.indexOf("];", start);
  if (start < 0 || end < 0) throw new Error("Could not find scenicRoads array.");
  const block = source.slice(start + "const scenicRoads = ".length, end + 1);
  return Function(`"use strict"; return (${block});`)();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRoute(road) {
  const coords = road[7].map(([lat, lon]) => `${lon},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&continue_straight=false`;
  const response = await fetch(url, { headers: { "User-Agent": "CodexRoadtripPlanner/1.0" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const payload = await response.json();
  const route = payload.routes?.[0]?.geometry?.coordinates;
  if (!Array.isArray(route) || route.length < road[7].length) throw new Error("No usable route geometry returned.");
  return route.map(([lon, lat]) => [Number(lat.toFixed(6)), Number(lon.toFixed(6))]);
}

async function main() {
  const source = await fs.readFile(builderPath, "utf8");
  const roads = extractScenicRoads(source);
  const routes = {};
  const failures = [];
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  for (const road of roads) {
    const key = `${road[0]}|${road[1]}`;
    try {
      const geometry = await fetchRoute(road);
      routes[key] = {
        state: road[0],
        name: road[1],
        points: geometry.length,
        geometry,
        source: "OSRM public routing service generated from planner waypoints",
      };
      console.log(`OK ${key}: ${geometry.length} points`);
    } catch (error) {
      failures.push({ state: road[0], name: road[1], error: error.message });
      console.log(`FAIL ${key}: ${error.message}`);
    }
    await sleep(450);
  }

  await fs.writeFile(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), routes, failures }, null, 2), "utf8");
  console.log(`Wrote ${outputPath}`);
  if (failures.length) {
    console.log(`Failures: ${failures.length}`);
  }
}

await main();
