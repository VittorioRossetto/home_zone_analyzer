### Home Zone Analyzer

This is a software platform for the management and processing of spatial data, specifically designed to provide recommendations for purchasing real estate in the city of Bologna. The platform comprises a back-end responsible for data management and a front-end offering an interactive interface for end users. The primary objective of the system is to analyze user preferences regarding the proximity and density of various Points of Interest (PoIs) and to provide targeted recommendations on areas and properties that best meet their needs.

The platform is structured around the following key modules:

1. **User Questionnaire**: A data collection module that identifies user preferences through a questionnaire. The questions pertain to the importance of the presence and density of various PoIs in the vicinity, with a rating system from 0 to 5. The questions cover at 20 types of PoIs, such as green areas, parking lots, and bus stops.

2. **Map Visualization**: The platform allows users to add markers for properties of interest and draw geofences to delineate candidate areas. These elements can be managed interactively via a map interface.

3. **PoI Filtering and Visualization**: Users can view and filter PoIs on the map based on their type, facilitating the analysis of the proximity of desired services.

4. **Property and Area Ranking**: Using a ranking function based on the preferences expressed in the questionnaire and the presence of PoIs, the system assigns a score to each property and candidate area, displaying them with colored markers on the map.

5. **Configurable Neighborhood Parameters**: The system allows for modifying the parameters that define the concept of a neighborhood, so the radius of a circular area, having a property as its center, directly from the dashboard.

6. **Moran's I Index Calculation**: The platform calculates the Moran's I index between the average price of properties and other spatial data series related to PoIs, providing an analysis of the spatial distribution of prices.

7. **Location Suggestions**: Based on user preferences and the presence of PoIs, the platform suggests optimal locations for purchasing a property.

8. **Spatial Data Management**: All spatial data is saved and archived using a POSTGRES/POSTGIS database. All the data relative to PoI were imported from the OpenData portal of the City of Bologna.

9. **Proximity Based on Travel Time**: In addition to linear distance, the system includes a mechanism to calculate the proximity of PoIs based on travel time using various modes of transportation, allowing users to filter PoIs reachable within predefined time intervals.

The technologies used for the development of the platform include POSTGRES/POSTGIS for spatial data management in the back-end, developed with Express.js, and Leaflet for the web interface development in the front-end, implemented with React.js. The various components of the system are developed within Docker containers and orchestrated using the Kubernetes framework.

This platform aims not only to facilitate the decision-making process for users seeking a property but also represents a powerful tool for spatial analysis, integrating advanced techniques for managing and visualizing geographic data.
