let map;
let marker;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 22.8046, lng: 86.2029 }, // Jamshedpur (Tata Steel HQ)
        zoom: 15,
    });
}

function trackBus() {
    const busNumber = document.getElementById("busNumber").value.trim();
    if (busNumber === "") {
        alert("Please enter a bus number");
        return;
    }

    // Dummy coordinates for demo (you can fetch from backend instead)
    const busLocations = {
        "101": { lat: 22.8046, lng: 86.2029 }, // Jamshedpur HQ
        "102": { lat: 22.7800, lng: 86.1500 },
        "103": { lat: 22.8200, lng: 86.2300 },
        "104": { lat: 22.7500, lng: 86.1800 },
    };

    const location = busLocations[busNumber] || { lat: 22.8046, lng: 86.2029 };

    if (marker) {
        marker.setMap(null); // remove old marker
    }

    marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Bus No: " + busNumber,
    });

    map.setCenter(location);
    map.setZoom(18);
}

// Load map when page loads
window.onload = initMap;