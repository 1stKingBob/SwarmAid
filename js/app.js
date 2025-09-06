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

// 5. Volunteers (ants) array
let volunteers = [];

// 6. Flag for adding shelter
let addingShelter = false;

// 7. Add Shelter button behavior
document.getElementById("add-shelter").addEventListener("click", () => {
  addingShelter = true;
  alert("Click on the map to place a shelter!");
});

// 8. Map click handler for placing shelter
map.on('click', function(e) {
  if (!addingShelter) return;

  const marker = L.circleMarker(e.latlng, {
    radius: 8,
    color: "red",
    fillColor: "red",
    fillOpacity: 0.9
  }).addTo(map).bindPopup("Shelter (needs aid)");

  shelters.push({
    coords: e.latlng,
    marker: marker,
    needs: 5,       // volunteers needed
    received: 0     // aid received
  });

  addingShelter = false;
});

// 9. Function to spawn ants with variable size
function spawnAnts(num) {
  volunteers = [];

  for (let i = 0; i < num; i++) {
    const aidAmount = Math.ceil(Math.random() * 3); // 1-3 units of aid
    const size = 10 + aidAmount * 4; // bigger ants for more aid

    const antIcon = L.icon({
      iconUrl: 'js/ant-icon.jpg',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });

    const marker = L.marker(depot, { icon: antIcon }).addTo(map);

    const target = shelters[i % shelters.length]; // evenly assign shelters
    volunteers.push({ marker, target, arrived: false, aid: aidAmount });
  }
}

// 10. Animate ants with wiggle movement
function moveAnts() {
  volunteers.forEach(v => {
    if (v.arrived) return;

    const current = v.marker.getLatLng();
    const target = v.target.coords;

    let lat = current.lat + (target.lat - current.lat) * 0.02;
    let lng = current.lng + (target.lng - current.lng) * 0.02;

    // Add small random wiggle
    lat += (Math.random() - 0.5) * 0.0005;
    lng += (Math.random() - 0.5) * 0.0005;

    v.marker.setLatLng([lat, lng]);

    if (map.distance([lat, lng], target) < 15) {
      v.arrived = true;
      v.marker.bindPopup(`Delivered ${v.aid} aid`).openPopup();

      // Update shelter
      v.target.received += v.aid;
      if (v.target.received >= v.target.needs) {
        v.target.marker.setStyle({ color: "green", fillColor: "green" });
        v.target.marker.bindPopup("Shelter: Aid Fulfilled");
      }
    }
  });

  if (volunteers.some(v => !v.arrived)) {
    requestAnimationFrame(moveAnts);
  } else {
    document.getElementById("status").textContent = "✅ All ants dispatched!";
  }
}

// 11. Dispatch button listener
document.getElementById("dispatch").addEventListener("click", function() {
  if (shelters.length === 0) {
    alert("Please add at least one shelter first!");
    return;
  }

  const numVolunteers = parseInt(prompt("Enter number of ants (volunteers):", "10")) || 10;
  document.getElementById("status").textContent = `🚚 Dispatching ${numVolunteers} ants...`;
  spawnAnts(numVolunteers);
  moveAnts();
});


