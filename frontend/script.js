const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const takeoffButton = document.getElementById('takeoffButton');
// const statusDiv = document.getElementById('status');
const telemetryDataPre = document.getElementById('telemetryData');
const altitudeInput = document.getElementById('altitudeInput');

const backendUrl = 'http://127.0.0.1:5000'; // Your Flask backend URL

// --- Map Variables ---
let map = null;
let droneMarker = null;
let initialCenterSet = false; // Track if map centered on first fix
let flightPathCoordinates = []; // Array to store [lat, lon] points for the trail
let flightPathPolyline = null;  // Leaflet Polyline object
let altitude = 10; // Default value
// --- State Variables ---
let isConnected = false;
let statusInterval = null; // To hold the interval timer for fetching status

// --- Map Initialization ---
function initMap() {
    // Check if map is already initialized
    if (map) return;

    // Initialize the map - Start zoomed out, will center on first drone location
    // Using coordinates near Volos, Greece as a fallback center if needed later
    map = L.map('map', {
        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: [
          {
            text: 'Go to this point',
            callback: function(e) {
              const { lat, lng } = e.latlng;
              sendGoToCommand(lat, lng);
            }
          },
          {
            text: 'Add waypoint',
            callback: function(e) {
              // Add waypoint logic
            }
          },
          {
            text: 'Return to home',
            callback: function(e) {
              sendReturnToHome();
            }
          },
          '-', // Separator
          {
            text: 'Example Mission',
            callback: function(e) {
              sendExampleMission();
            }
          },
          {
            text: 'Center map here',
            callback: function(e) {
              map.panTo(e.latlng);
            }
          }
        ]
      }).setView([39.36, 22.94], 5); // Start relatively zoomed out

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    console.log("Map initialized");
}

// Toast notification helper
function showToast(message, type = 'info', duration = 3000) {
    // Set color based on type
    let background;
    switch(type) {
        case 'success': background = "#28a745"; break;
        case 'error': background = "#dc3545"; duration = 5000; break; // Longer duration for errors
        case 'warning': background = "#ffc107"; break;
        default: background = "#007bff"; // info
    }
    
    Toastify({
        text: message,
        duration: duration,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: background
        }
    }).showToast();
}

function sendGoToCommand(lat, lng) {
    if (altitudeInput && altitudeInput.value) {
        altitude = parseFloat(altitudeInput.value);
        if (isNaN(altitude) || altitude <= 0) {
            showToast("Invalid altitude value. Using default (10m).", "warning");
            altitude = 10;
        }
    }
    showToast("Sending go-to command...", "info");
    
    fetch(`${backendUrl}/api/goto`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng, altitude: altitude })
    })
    .then(response => {
        // Always try to parse the JSON first, even for error responses
        return response.json().then(data => {
            // If response is not ok, throw an error with the message from the server
            if (!response.ok) {
                throw new Error(data.message || `Server responded with status: ${response.status}`);
            }
            // If response is ok, return the data for the next .then()
            return data;
        });
    })
    .then(data => {
        if (data.status === 'success') {
            showToast("Vehicle moving to selected location", "success");
            
            // Add a marker at the target location
            L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'goto-marker',
                    html: '<i class="fas fa-crosshairs"></i>'
                })
            }).addTo(map);
        } else {
            showToast(`Command failed: ${data.message}`, "error");
        }
    })
    .catch(error => {
        console.error("Go-to fetch error:", error);
        showToast(`Error: ${error.message}`, "error");
    });
}

function sendTakeOff() {
    if (altitudeInput && altitudeInput.value) {
        altitude = parseFloat(altitudeInput.value);
        if (isNaN(altitude) || altitude <= 0) {
            showToast("Invalid altitude value. Using default (10m).", "warning");
            altitude = 10;
        }
    }
    showToast("Sending takeoff command...", "info");
    
    fetch(`${backendUrl}/api/takeoff`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({altitude: altitude})
    })
    .then(response => {
        // Always try to parse the JSON first, even for error responses
        return response.json().then(data => {
            // If response is not ok, throw an error with the message from the server
            if (!response.ok) {
                throw new Error(data.message || `Server responded with status: ${response.status}`);
            }
            // If response is ok, return the data for the next .then()
            return data;
        });
    })
    .then(data => {
        if (data.status === 'success') {
            showToast(data.message, "success");
        } else {
            showToast(`Command failed: ${data.message}`, "error");
        }
    })
    .catch(error => {
        console.error("Takeoff fetch error:", error);
        showToast(`Error: ${error.message}`, "error");
    });
}

function sendReturnToHome() {
    showToast("Sending return to home command...", "info");
    fetch(`${backendUrl}/api/rtl`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    }).then(response => {
        // Always try to parse the JSON first, even for error responses
        return response.json().then(data => {
            // If response is not ok, throw an error with the message from the server
            if (!response.ok) {
                throw new Error(data.message || `Server responded with status: ${response.status}`);
            }
            // If response is ok, return the data for the next .then()
            return data;
        });
    }
    ).then(data => {
        if (data.status === 'success') {
            showToast("Returning to home...", "success");
        } else {
            showToast(`Command failed: ${data.message}`, "error");
        }
    }
    ).catch(error => {
        console.error("Return to home fetch error:", error);
        showToast(`Error: ${error.message}`, "error");
    }
    );
}

function sendExampleMission() {
    showToast("Sending example mission...", "info");
    fetch(`${backendUrl}/api/example_mission`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    }).then(response => {
        // Always try to parse the JSON first, even for error responses
        return response.json().then(data => {
            // If response is not ok, throw an error with the message from the server
            if (!response.ok) {
                throw new Error(data.message || `Server responded with status: ${response.status}`);
            }
            // If response is ok, return the data for the next .then()
            return data;
        });
    }
    ).then(data => {
        if (data.status === 'success') {
            showToast("Mission started successfully", "success");
        } else {
            showToast(`Command failed: ${data.message}`, "error");
        }
    }
    ).catch(error => {
        console.error("Example mission fetch error:", error);
        showToast(`Error: ${error.message}`, "error");
    }
    );
}

// --- UI Update Functions ---
// function //updateStatus(message, isError = false) {
//     statusDiv.innerHTML = `<strong>Status:</strong> ${message}`;
//     statusDiv.style.color = isError ? 'red' : 'black';
// }

function updateTelemetry(data) {
    // Update Text Telemetry
    if (data && data.is_connected) {
        telemetryDataPre.innerHTML = `
    <table style="width:100%; color:#fff; background:rgba(22,37,80,0.7); border-radius:8px; border-collapse:separate; border-spacing:0 8px;">
        <tr><td><strong>Mode</strong></td><td class="telemetry-value">${data.mode}</td></tr>
        <tr><td><strong>Armed</strong></td><td class="telemetry-value">${data.armed}</td></tr>
        <tr><td><strong>Altitude</strong></td><td class="telemetry-value">${data.alt?.toFixed(5)} m</td></tr>
        <tr><td><strong>Airspeed</strong></td><td class="telemetry-value">${data.airspeed?.toFixed(5)}</td></tr>
        <tr><td><strong>Groundspeed</strong></td><td class="telemetry-value">${data.groundspeed?.toFixed(5)}</td></tr>
        <tr><td><strong>Heading</strong></td><td class="telemetry-value">${data.heading}</td></tr>
        <tr><td><strong>Battery</strong></td><td class="telemetry-value">${data.battery_voltage ? `${parseFloat(data.battery_voltage).toFixed(2)}V` : 'N/A'}</td></tr>
    </table>
`;
    } else {
        telemetryDataPre.textContent = 'Disconnected or no data available.';
    }

    if (map && data && data.is_connected) {
        const lat = data.lat;
        const lon = data.lon;

        if (typeof lat === 'number' && typeof lon === 'number') {
            const droneLatLng = [lat, lon];

            // Update Marker (existing logic)
            if (droneMarker) {
                droneMarker.setLatLng(droneLatLng);
            } else {
                droneMarker = L.marker(droneLatLng).addTo(map).bindPopup(`Drone Location`);
                console.log("Drone marker created at:", droneLatLng);
            }
            if (!initialCenterSet) {
                map.setView(droneLatLng, 17);
                initialCenterSet = true;
                console.log("Map centered on initial drone location.");
            }
             if (droneMarker) {
                 droneMarker.setPopupContent(`Drone Location<br>Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}<br>Alt: ${data.alt?.toFixed(2)}m | Mode: ${data.mode}`);
            }

            // ----> Start: Add point to flight path trail <----
            // Optional: Add a check to prevent adding points if the drone hasn't moved significantly
            const lastCoord = flightPathCoordinates.length > 0 ? flightPathCoordinates[flightPathCoordinates.length - 1] : null;
            // Simple check: Add if it's the first point or if lat/lon differs from the last point
            if (!lastCoord || lastCoord[0] !== lat || lastCoord[1] !== lon) {

                flightPathCoordinates.push(droneLatLng); // Add new coordinate to history

                if (flightPathPolyline) {
                    // If polyline exists, add the new point
                    flightPathPolyline.addLatLng(droneLatLng);
                } else {
                    // If polyline doesn't exist, create it (needs at least one point)
                    flightPathPolyline = L.polyline(flightPathCoordinates, {
                        color: 'blue',  // Trail color
                        weight: 3,       // Trail thickness
                        opacity: 0.7     // Trail opacity
                    }).addTo(map);
                    console.log("Flight path polyline created.");
                }
            }
            // ----> End: Add point to flight path trail <----

        } // End if valid lat/lon
    } // End if map and connected
}


function setUIConnected(connected) {
    isConnected = connected;
    // connectButton.disabled = connected;
    // disconnectButton.disabled = !connected;
    // statusButton.disabled = !connected;
    takeoffButton.disabled = !connected;
    // Enable/disable other command buttons here later

    if (connected) {
        // ----> Start: Clear previous flight path on new connection <----
        flightPathCoordinates = []; // Clear the history
        if (flightPathPolyline) {
            map.removeLayer(flightPathPolyline); // Remove old line from map
            flightPathPolyline = null;
        }
        // ----> End: Clear previous flight path <----

        //updateStatus('Connected');
        connectButton.hidden = true;
        disconnectButton.hidden = false;
        fetchStatus(); // Fetch immediately
        if (!statusInterval) {
            statusInterval = setInterval(fetchStatus, 100); // Poll every 2 seconds
        }
    } else {
        connectButton.hidden = false;
        disconnectButton.hidden = true;

        //updateStatus('Disconnected');
        updateTelemetry(null); // Clear telemetry text

        // Stop polling
        if (statusInterval) {
            clearInterval(statusInterval);
            statusInterval = null;
        }

        // Clean up map marker
        if (droneMarker) {
            map.removeLayer(droneMarker);
            droneMarker = null;
            console.log("Drone marker removed.");
        }

        // Remove all other L.Marker instances (e.g., go-to markers)
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
        initialCenterSet = false; // Reset centering flag

        // ----> Start: Clear flight path on disconnect <----
        flightPathCoordinates = []; // Clear the history
        if (flightPathPolyline) {
            map.removeLayer(flightPathPolyline); // Remove line from map
            flightPathPolyline = null;
        }
         // ----> End: Clear flight path <----

        // Optional: Reset map view to initial state on disconnect
        if (map) {
             map.setView([39.36, 22.94], 5); // Reset to initial wider view
        }
    }
}


// --- API Call Functions ---
async function connectToDrone() {
    //updateStatus('Attempting connection...');
    try {
        const response = await fetch(`${backendUrl}/api/connect`, { method: 'POST' });
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            setUIConnected(true);
        } else {
            //updateStatus(`Connection Failed: ${data.message}`, true);
            setUIConnected(false);
        }
    } catch (error) {
        console.error('Connection Error:', error);
        //updateStatus(`Connection Error: ${error.message}`, true);
        setUIConnected(false);
    }
}

function disconnectFromDrone() {
    //updateStatus('Disconnecting...');
    fetch(`${backendUrl}/api/disconnect`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                setUIConnected(false);
            } else {
                //updateStatus(`Disconnection Failed: ${data.message}`, true);
            }
        })
        .catch(error => {
            console.error('Disconnection Error:', error);
            //updateStatus(`Disconnection Error: ${error.message}`, true);
        });
}

async function fetchStatus() {
    console.log("SEEEND");

    try {
        const response = await fetch(`${backendUrl}/api/status`, { method: 'GET' });
        const result = await response.json();

        if (response.ok && result.status === 'success') {
            // Call updateTelemetry which now handles both text and map
            updateTelemetry(result.data);

            if (!result.data.is_connected) {
                console.warn("Backend reports vehicle disconnected.");
                setUIConnected(false);
                //updateStatus("Connection lost (reported by backend)", true);
            }
        } else {
            //updateStatus(`Error fetching status: ${result.message}`, true);
        }
    } catch (error) {
        console.error('Status Fetch Error:', error);
        //updateStatus(`Status Fetch Error: ${error.message}`, true);
        // If fetching fails, you might want to stop polling or indicate stale data
        // clearInterval(statusInterval); statusInterval = null; // Example: stop polling on error
    }
}

// --- Event Listeners ---
connectButton.addEventListener('click', connectToDrone);
disconnectButton.addEventListener('click', disconnectFromDrone);
takeoffButton.addEventListener('click', sendTakeOff); // Manual status fetch

// --- Initialization ---
// Ensure map is initialized after the DOM is ready
document.addEventListener('DOMContentLoaded', (event) => {
    initMap(); // Initialize the map
    setUIConnected(false); // Set initial UI state after map div exists
});