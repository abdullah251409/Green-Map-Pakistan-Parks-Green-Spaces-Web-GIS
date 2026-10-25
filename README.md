# GreenMap Pakistan — Parks & Green Spaces Web GIS

An API-based Web GIS application for exploring parks, gardens, playgrounds, recreation grounds, nature reserves and other mapped green spaces in Islamabad and Rawalpindi, Pakistan.

## Technologies
HTML5, CSS3, JavaScript, Leaflet.js, Overpass API, OpenStreetMap, JSON, Visual Studio Code, GitHub and optional GitHub Pages.

## Run locally
1. Extract the project folder.
2. Open it in Visual Studio Code.
3. Use the Live Server extension, or open `index.html` in a modern browser.
4. Ensure internet access is available so the map tiles, Leaflet library and Overpass API can load.

## Features
- Interactive map with zoom and pan
- API data retrieved using JavaScript `fetch()`
- JSON response processing
- Green-space markers and clickable attribute popups
- Search by name
- Filter by feature type and study area
- Loading and error messages
- OpenStreetMap attribution

## Data and limitations
Data is retrieved live from OpenStreetMap through the Overpass API. Coverage and attributes depend on community mapping. Some green spaces may be unnamed or have missing information. The Islamabad/Rawalpindi selector uses a simplified approximate geographic split for this educational project and is not an official administrative boundary. Overpass services may be temporarily unavailable or rate-limited.

## Attribution
Map tiles and data © OpenStreetMap contributors: https://www.openstreetmap.org/copyright
Overpass API: https://overpass-api.de/
