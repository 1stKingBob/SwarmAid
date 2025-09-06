// 1. Initialize Leaflet map (Sydney coordinates)
const map = L.map('map').setView([-33.8688, 151.2093], 13);

// 2. Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 3. Depot marker (volunteers start here)
const depot = [-33.868, 151.209];
L.marker(depot).addTo(map).bindPopup("Depot: Volunteer Base");

// 4. Shelters array
const shelters = [];

// 5. Add shelter on map click
map.on('click', function(e) {
  const marker = L.circleMarker(e.latlng, {
    radius: 8,
    color: "red",
    fillColor: "red",
    fillOpacity: 0.9
  }).addTo(map).bindPopup("Shelter (needs aid)");

  shelters.push({
    coords: e.latlng,
    marker: marker,
    needs: 5,       // number of volunteers required
    received: 0     // volunteers delivered
  });
});

// 6. Volunteers (ants) array
let volunteers = [];

// 7. Spawn ants (variable size = amount of aid)
function spawnAnts(num) {
  volunteers = [];
  for (let i = 0; i < num; i++) {
    const aidAmount = Math.ceil(Math.random() * 3); // 1–3 units of aid per ant

    const marker = L.circleMarker(depot, {
      radius: 4 + aidAmount,       // bigger radius = more aid
      color: "#3b2e2e",            // ant color
      fillColor: "#3b2e2e",
      fillOpacity: 1
    }).addTo(map);

    const target = shelters[i % shelters.length]; // evenly assign shelters
    volunteers.push({ marker, target, arrived: false, aid: aidAmount });
  }
}

// 8. Animate ants with slight wiggle
function moveAnts() {
  volunteers.forEach(v => {
    if (v.arrived) return;

    const current = v.marker.getLatLng();
    const target = v.target.coords;

    // Linear interpolation toward target
    let lat = current.lat + (target.lat - current.lat) * 0.02;
    let lng = current.lng + (target.lng - current.lng) * 0.02;

    // Small random wiggle for ant-like movement
    lat += (Math.random() - 0.5) * 0.0005;
    lng += (Math.random() - 0.5) * 0.0005;

    v.marker.setLatLng([lat, lng]);

    // Check if arrived
    if (map.distance([lat, lng], target) < 15) {
      v.arrived = true;
      v.marker.setStyle({ color: "#555", fillColor: "#555" });
      v.marker.bindPopup(`Delivered ${v.aid} aid`).openPopup();

      // Update shelter
      v.target.received += v.aid;
      if (v.target.received >= v.target.needs) {
        v.target.marker.setStyle({ color: "green", fillColor: "green" });
        v.target.marker.bindPopup("Shelter: Aid Fulfilled");
      }
    }
  });

  // Continue animation if any ants remain
  if (volunteers.some(v => !v.arrived)) {
    requestAnimationFrame(moveAnts);
  } else {
    document.getElementById("status").textContent = "✅ All volunteers dispatched!";
  }
}

// 9. Dispatch button listener
document.getElementById("dispatch").addEventListener("click", function() {
  if (shelters.length === 0) {
    alert("Please add at least one shelter by clicking on the map.");
    return;
  }

  const numVolunteers = parseInt(prompt("Enter number of ants (volunteers):", "10")) || 10;
  document.getElementById("status").textContent = `🚚 Dispatching ${numVolunteers} ants...`;
  spawnAnts(numVolunteers);
  moveAnts();
});
