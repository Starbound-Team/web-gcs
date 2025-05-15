# Web-Based Ground Control Station (Web-GCS) for ArduPilot SITL 🛰️

![StarBound Logo](./starbound_team_logo.svg)
**Developed with passion by StarBound – University of Thessaly Student Team, Volos, Greece.** 🇬🇷

This project is a web-based application designed to act as a simple Ground Control Station (GCS) for controlling ArduPilot vehicles running in the Software-In-The-Loop (SITL) simulator. It provides a user-friendly interface accessible from a web browser to monitor telemetry and send basic commands locally.

## ✨ Features

* **Connect/Disconnect:** Establish and close connection to a running ArduPilot SITL instance via UDP.
* **Real-time Telemetry (Basic):** Displays key vehicle information like:
    * Connection Status
    * Current Mode
    * Armed State
    * Latitude, Longitude, Altitude
    * Airspeed, Groundspeed, Heading
    * Battery Voltage (if available)
* **(In Progress/Planned):** Send basic MAVLink commands (Arm, Takeoff, RTL, Change Mode).
* **(Planned):** Interactive map display (using Leaflet.js) showing vehicle position.
* **(Planned):** Basic waypoint navigation (Click on map to set target, upload simple missions).

## 💻 Tech Stack

* **Backend:** Python 3, Flask, DroneKit, pymavlink
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (initially)
* **Communication:** REST API (Flask) & Polling (initial telemetry), WebSockets (planned)
* **Simulation:** ArduPilot SITL

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system (tested on Kali Linux):

1.  **Git:** For cloning the repository (`sudo apt update && sudo apt install git -y`).
2.  **Python 3:** (Version 3.8+ recommended) and `pip` (`sudo apt install python3 python3-pip -y`).
3.  **Python Virtual Environment:** (`sudo apt install python3-venv -y` or usually included with Python).
4.  **ArduPilot SITL:** You need a working ArduPilot SITL setup. Follow the official ArduPilot documentation: [Setting up SITL](https://ardupilot.org/dev/docs/setting-up-sitl-on-linux.html)
5.  **(Optional but Recommended):** Node.js and npm for potential future frontend development (`sudo apt install nodejs npm -y` or preferably use [NVM](https://github.com/nvm-sh/nvm)).

## 🚀 Getting Started

Follow these steps to set up and run the Web-GCS project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/MANRAF04/web-gcs.git
cd web-gcs
```

### 2. Setup Backend

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# Install required Python packages
pip install -r requirements.txt

# Go back to the root directory (optional, for next steps)
cd ..
```

### 3. Setup Frontend
Currently, the frontend consists of simple HTML, CSS, and JavaScript files. No build step is required yet.

## ▶️ Running the Application

You need **three** separate terminal windows open to run the full system: one for SITL, one for the backend server, and one for the frontend server.

1.  **Start ArduPilot SITL**
    * Open a **new terminal**.
    * Navigate to your ArduPilot directory (e.g., `~/ardupilot`).
    * Launch SITL (adjust vehicle type with `-v` and other options as needed):

        ```bash
        # Example for Copter in ~/ardupilot directory
        cd ~/ardupilot
        sim_vehicle.py -v ArduCopter --map --console
        ```
    * Wait for SITL to initialize completely (you should see GPS coordinates appearing). **Leave this terminal running.**

2.  **Start the Backend Server**
    * Open a **second terminal**
    * Navigate to the project's backend directory: `cd ~/web-gcs/backend`

    * Activate the virtual environment: `source venv/bin/activate`

    * Run the Flask application:
    ```bash
    python app.py
    ```

    *The backend server should start, typically on `http://127.0.0.1:5000`. **Leave this terminal running.**

3. **Start the Frontend Server**

    * Open a **third terminal.**

    * Navigate to the project's frontend directory: `cd ~/web-gcs/frontend`

    * Start Python's simple HTTP server to serve the HTML/JS/CSS files:
    ```bash
    python3 -m http.server 8000
    ```

    * This server will host the frontend on `http://localhost:8000`. **Leave this terminal running.**

4. **Access the Web GCS**

    Open your web browser (e.g., Firefox, Chrome).
    Navigate to `http://localhost:8000`.

## 🕹️ Usage

1.  Ensure SITL, the backend, and the frontend servers are all running.
2.  Click the **"Connect to SITL"** button in the web interface.
3.  Observe the **Status** section update. If successful, telemetry data should start appearing.
4.  Use the **"Get Status"** button to manually refresh telemetry (it also polls automatically).
5.  Use the **"Disconnect"** button to close the connection to the vehicle.
6.  *(Command buttons like Arm, Takeoff, RTL will be added in future updates).*
