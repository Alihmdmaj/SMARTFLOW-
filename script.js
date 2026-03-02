// 1. Map Initialization (Tangier Center)
const map = L.map('map', { 
    zoomControl: false,
    scrollWheelZoom: true, // Smooth Google-like zooming
    tap: true
}).setView([35.7595, -5.8340], 14);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© SmartFlow+ | Tangier Live Data'
}).addTo(map);

let activeLayers = [];
let userLoc = [35.7595, -5.8340]; 

// Auto-Location (Real-time tracking)
map.locate({setView: true, watch: true, maxZoom: 16});

map.on('locationfound', (e) => {
    userLoc = e.latlng;
    clearMap(); 
    L.circleMarker(userLoc, { 
        radius: 8, fillColor: "#00ff88", color: "#fff", weight: 3, fillOpacity: 1 
    }).addTo(map).bindPopup("Live Location: Tangier").openPopup();
});

// 2. Data & Constants
const parkingLots = [
    { name: "Parking Place des Nations", total: 120, left: 14, coords: [35.7645, -5.8110] },
    { name: "Tanger City Center", total: 500, left: 245, coords: [35.7725, -5.7920] },
    { name: "Marina Bay", total: 80, left: 0, coords: [35.7820, -5.8050] }
];

function clearMap() {
    activeLayers.forEach(layer => map.removeLayer(layer));
    activeLayers = [];
}

// 3. Routing + CO2 Analytics
function calculateBestRoute() {
    clearMap();
    const dest = [35.7720, -5.7950]; // Tanger Ville Station
    
    // Simulation Logic
    const distanceKm = 4.2;
    const standardCO2 = distanceKm * 120; // 120g per km (Standard)
    const trafficSurcharge = 1.45; // 45% more emissions in red traffic
    
    const co2Saved = Math.round((standardCO2 * trafficSurcharge) - standardCO2);

    // Draw Routes
    const redRoute = L.polyline([userLoc, [35.7680, -5.8050], dest], {color: '#ff4d4d', weight: 4, opacity: 0.5}).addTo(map);
    const bestRoute = L.polyline([userLoc, [35.7600, -5.8200], [35.7700, -5.8000], dest], {color: '#00ff88', weight: 8}).addTo(map);

    activeLayers.push(redRoute, bestRoute);
    map.fitBounds(bestRoute.getBounds());

    // Update the Sidebar with CO2 Info
    const list = document.getElementById('parking-list');
    list.innerHTML = `
        <div class="stats-card">
            <h3>🌱 Environmental Impact</h3>
            <p>By following the <b>SmartFlow+</b> route, you are avoiding heavy congestion in downtown Tangier.</p>
            <div class="co2-value">${co2Saved}g CO2</div>
            <p><small>Emissions prevented compared to standard route</small></p>
        </div>
        <hr>
        <p style="text-align:center">Scan for parking to see more info</p>
    `;
}

function showParking() {
    clearMap();
    const list = document.getElementById('parking-list');
    list.innerHTML = '<h3>Nearby Parking</h3>';

    parkingLots.forEach(lot => {
        const color = lot.left > 10 ? "#00ff88" : "#ff4d4d";
        const pMarker = L.circleMarker(lot.coords, {
            radius: 10, fillColor: color, color: "#fff", fillOpacity: 1
        }).addTo(map).bindPopup(`<b>${lot.name}</b>`);
        
        activeLayers.push(pMarker);

        const card = document.createElement('div');
        card.className = 'parking-card';
        card.innerHTML = `
            <strong>${lot.name}</strong>
            <p>${lot.left} spaces available</p>
            <div class="capacity-bar"><div class="capacity-fill" style="width:${(lot.left/lot.total)*100}%; background:${color}"></div></div>
        `;
        card.onclick = () => {
            map.flyTo(lot.coords, 17, { animate: true, duration: 1.5 });
            pMarker.openPopup();
            const nav = L.polyline([userLoc, lot.coords], {color: '#00ff88', dashArray: '10, 10'}).addTo(map);
            activeLayers.push(nav);
        };
        list.appendChild(card);
    });
}