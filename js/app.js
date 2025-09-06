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

// 6. Volunteers array
let volunteers = [];

// 7. Spawn volunteers
function spawnVolunteers(num) {
  volunteers = [];
  for (let i = 0; i < num; i++) {
    const marker = L.circleMarker(depot, {
      radius: 5,
      color: "green",
      fillColor: "green",
      fillOpacity: 1
    }).addTo(map);

    const target = shelters[i % shelters.length]; // evenly assign shelters
    volunteers.push({ marker, target, arrived: false });
  }
}

// 8. Animate volunteers
function moveVolunteers() {
  volunteers.forEach(v => {
    if (v.arrived) return;

    const current = v.marker.getLatLng();
    const target = v.target.coords;

    // linear interpolation toward target
    const lat = current.lat + (target.lat - current.lat) * 0.02;
    const lng = current.lng + (target.lng - current.lng) * 0.02;

    v.marker.setLatLng([lat, lng]);

    // Check if arrived
    if (map.distance([lat, lng], target) < 15) {
      v.arrived = true;
      v.marker.setStyle({ color: "blue", fillColor: "blue" });
      v.marker.bindPopup("Delivered Aid").openPopup();

      // Update shelter
      v.target.received++;
      if (v.target.received >= v.target.needs) {
        v.target.marker.setStyle({ color: "green", fillColor: "green" });
        v.target.marker.bindPopup("Shelter: Aid Fulfilled");
      }
    }
  });

  // Continue animation if volunteers remain
  if (volunteers.some(v => !v.arrived)) {
    requestAnimationFrame(moveVolunteers);
  } else {
    document.getElementById("status").textContent = "✅ All volunteers dispatched!";
  }
}

// 9. Button event listeners
document.getElementById("dispatch").addEventListener("click", function() {
  if (shelters.length === 0) {
    alert("Please add at least one shelter by clicking on the map.");
    return;
  }

  const numVolunteers = parseInt(prompt("Enter number of volunteers:", "10")) || 10;
  document.getElementById("status").textContent = `🚚 Dispatching ${numVolunteers} volunteers...`;
  spawnVolunteers(numVolunteers);
  moveVolunteers();
});
