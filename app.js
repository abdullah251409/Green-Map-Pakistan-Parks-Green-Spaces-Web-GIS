// GreenMap Pakistan: parks and green spaces from OpenStreetMap via Overpass API.
const map = L.map("map").setView([33.635, 73.08], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);
const markerLayer = L.featureGroup().addTo(map);
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const areaFilter = document.getElementById("area-filter");
const resetButton = document.getElementById("reset-button");
const statusMessage = document.getElementById("status-message");
const resultCount = document.getElementById("result-count");
let allFeatures = [];

function setStatus(message, isError=false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}
function norm(value) { return String(value || "").toLowerCase().trim(); }
function getFeatureType(tags={}) {
  if (tags.leisure === "park") return "park";
  if (tags.leisure === "garden") return "garden";
  if (tags.leisure === "playground") return "playground";
  if (tags.leisure === "recreation_ground" || tags.landuse === "recreation_ground") return "recreation_ground";
  if (tags.leisure === "nature_reserve") return "nature_reserve";
  return "other";
}
function typeLabel(type) {
  return ({park:"Park",garden:"Garden",playground:"Playground",recreation_ground:"Recreation ground",nature_reserve:"Nature reserve",other:"Other green space"})[type] || "Green space";
}
// This is an approximate educational split, not an official administrative boundary.
function areaFor(lat) { return lat >= 33.60 ? "islamabad" : "rawalpindi"; }
function coordsFor(element) {
  if (element.type === "node" && Number.isFinite(element.lat) && Number.isFinite(element.lon)) return [element.lat, element.lon];
  if (element.center && Number.isFinite(element.center.lat) && Number.isFinite(element.center.lon)) return [element.center.lat, element.center.lon];
  return null;
}
function popupFor(feature) {
  const tags = feature.tags || {};
  const content = document.createElement("div");
  const title = document.createElement("p");
  title.className = "popup-title";
  title.textContent = tags.name || "Unnamed green space";
  content.appendChild(title);
  const rows = [
    ["Type", typeLabel(feature.greenType)],
    ["Address", [tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ")],
    ["Access", tags.access], ["Website", tags.website], ["Phone", tags.phone]
  ].filter(([,v]) => Boolean(v));
  rows.forEach(([label,value]) => {
    const p = document.createElement("p"); p.className = "popup-row";
    p.textContent = `${label}: ${value}`; content.appendChild(p);
  });
  const link = document.createElement("a");
  link.href = `https://www.openstreetmap.org/${feature.type}/${feature.id}`;
  link.target = "_blank"; link.rel = "noopener noreferrer";
  link.textContent = "View on OpenStreetMap"; content.appendChild(link);
  return content;
}
function matches(feature) {
  const q = norm(searchInput.value), selectedType = typeFilter.value, selectedArea = areaFilter.value;
  const name = norm((feature.tags || {}).name);
  return (selectedType === "all" || feature.greenType === selectedType) &&
    (selectedArea === "both" || feature.studyArea === selectedArea) &&
    (!q || name.includes(q) || norm(typeLabel(feature.greenType)).includes(q));
}
function renderFeatures() {
  markerLayer.clearLayers();
  const visible = allFeatures.filter(matches);
  visible.forEach(feature => {
    const [lat,lon] = feature.coordinates;
    L.circleMarker([lat,lon], {radius:7,color:"#1d6035",weight:1.5,fillColor:"#55a66a",fillOpacity:.88})
      .bindPopup(popupFor(feature)).addTo(markerLayer);
  });
  resultCount.textContent = `${visible.length} green spaces shown`;
  if (visible.length) setStatus(`Showing ${visible.length} matching features. Some features may have incomplete names or attributes.`);
  else if (allFeatures.length) setStatus("No features match the current search and filters. Try changing your selections.");
}
async function loadGreenSpaces() {
  setStatus("Loading parks and green spaces from the Overpass API…");
  resultCount.textContent = "Loading data…";
  const bbox = "33.40,72.85,33.85,73.30"; // south, west, north, east
  const query = `[out:json][timeout:25];(
    nwr["leisure"~"^(park|garden|playground|recreation_ground|nature_reserve)$"](${bbox});
    nwr["landuse"~"^(recreation_ground|grass|meadow)$"](${bbox});
    nwr["natural"~"^(wood|grassland)$"](${bbox});
  );out center tags;`;
  const endpoints = ["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:"data="+encodeURIComponent(query)});
      if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.elements)) throw new Error("Unexpected API response format");
      const seen = new Set();
      allFeatures = payload.elements.map(element => {
        const coordinates = coordsFor(element); if (!coordinates) return null;
        const key = `${element.type}/${element.id}`; if (seen.has(key)) return null; seen.add(key);
        return {id:element.id,type:element.type,tags:element.tags||{},coordinates,greenType:getFeatureType(element.tags||{}),studyArea:areaFor(coordinates[0])};
      }).filter(Boolean);
      renderFeatures();
      if (markerLayer.getBounds().isValid()) map.fitBounds(markerLayer.getBounds().pad(.08),{maxZoom:13});
      return;
    } catch (error) { lastError = error; }
  }
  allFeatures = []; markerLayer.clearLayers(); resultCount.textContent = "Data unavailable";
  setStatus(`Could not retrieve data from the Overpass API. Check your internet connection and try again later. ${lastError ? lastError.message : ""}`,true);
}
[searchInput,typeFilter,areaFilter].forEach(control => {
  control.addEventListener("input",renderFeatures);
  control.addEventListener("change",renderFeatures);
});
resetButton.addEventListener("click",() => {
  searchInput.value=""; typeFilter.value="all"; areaFilter.value="both"; renderFeatures();
});
loadGreenSpaces();
