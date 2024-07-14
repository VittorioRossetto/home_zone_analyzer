# Real Estate Decision Support System

## Introduction
This platform is designed to assist users in making informed decisions when purchasing properties. By leveraging spatial data and user preferences, it suggests optimal locations and provides insights into Points of Interest (PoIs) within the vicinity of these locations.

## Features
- **User Questionnaire**: A data collection module that identifies user preferences through a questionnaire. The questions pertain to the importance of the presence and density of various PoIs in the vicinity, with a rating system from 0 to 5. The questions cover at 20 types of PoIs, such as green areas, parking lots, and bus stops.

- **Map Visualization**: The platform allows users to add markers for properties of interest and draw geofences to delineate candidate areas. These elements can be managed interactively via a map interface.

- **PoI Filtering and Visualization**: Users can view and filter PoIs on the map based on their type, facilitating the analysis of the proximity of desired services.
- **Property and Area Ranking**: Using a ranking function based on the preferences expressed in the questionnaire and the presence of PoIs, the system assigns a score to each property and candidate area, displaying them with colored markers on the map.

- **Configurable Neighborhood Parameters**: The system allows for modifying the parameters that define the concept of a neighborhood, so the radius of a circular area, having a property as its center, directly from the dashboard.

- **Moran's I Index Calculation**: The platform calculates the Moran's I index between the average price of properties and other spatial data series related to PoIs, providing an analysis of the spatial distribution of prices.

- **Location Suggestions**: Based on user preferences and the presence of PoIs, the platform suggests optimal locations for purchasing a property.

- **Spatial Data Management**: All spatial data is saved and archived using a POSTGRES/POSTGIS database. All the data relative to PoI were imported from the OpenData portal of the City of Bologna.

- **Proximity Based on Travel Time**: In addition to linear distance, the system includes a mechanism to calculate the proximity of PoIs based on travel time using various modes of transportation, allowing users to filter PoIs reachable within predefined time intervals.transportation.

## Technologies Used
- **Back-end**: POSTGRES for spatial data management, Express.js for server-side logic.
- **Front-end**: Leaflet for mapping interfaces, React.js for responsive UI.
- **Containerization**: Docker for creating and managing containers, Kubernetes for orchestration.

## Getting Started (Docker)

### Prerequisites
- Docker
- Kubernetes
- Node.js

### Setup
1. **Clone the repository**:
    `git clone <repository-url>`
2. **Navigate to the project directory**:
    `cd home_zone_analyzer`

4. **Build and run the Docker containers on kubernetes**:
    `bash k8sbuilder.sh`

### Usage
After setting up the project, you can access the web interface at `http://<your node-ip>:30002`. Use the interface to specify your preferences and explore property suggestions.

## Getting Started (Local)
To run application locally, you have to change hostName to `http://localhost:9000` in both `./frontend/src/Map.js` and `./frontend/src/Menu.js`

### Prerequisites
- Node.js
- PostgreSQL

### Setup Backend
1. **Clone the repository**:
    `git clone <repository-url>`
2. **Navigate to the project directory**:
    `cd home_zone_analyzer`
3. **Navigate to the backend directory**:
    `cd backend`
4. **Install backend dependencies**:
    `npm install`
5. **Run backend**:
    `nodemon index`

### Setup frontend (Another prompt)
1. **Navigate to the frontend directory**:
    `cd home_zone_analyzer/frontend`
2. **install frontend dependencies**:
    `npm install`
3. **Run frontend**
    `npm start`

### Usage
After setting up the project, you can access the web interface at `http://localhost:3000`. Use the interface to specify your preferences and explore property suggestions.

### Further Informations
For a deep understanding of the platform and its functionalities check `ProjectReport.pdf`

### Acknowledgments
City of Bologna OpenData portal for providing the spatial data.

### Author
Vittorio Rossetto