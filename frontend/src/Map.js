import React, { useRef, useEffect, useState } from 'react';
import "leaflet/dist/leaflet.css";
import { useLocation } from 'react-router-dom';
import L from "leaflet";
import './css/map.css';

const Map = () => {
  const location = useLocation();
  const formData = location.state;
  
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Coordinate of Bologna
  // eslint-disable-next-line
  const mapOptions = {
    center: L.latLng(44.4937544, 11.3409058),
    zoom: 14
  }

  const drawing = useRef(false);
  const areaCenter = useRef(null);
  const [areas, setAreas] = useState([]);
  const drawMode = useRef(true);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [poiData, setPoiData] = useState(null);
  const neighborhood = useRef(200);

  const [moransI, setMoransI] = useState(null);

  // Function to calculate the sum of the values in the form data
  function sum(formData) {
    return Object.values(formData).reduce((acc, current) => {
      if (typeof current.value === 'number') {
        return acc + current.value;
      }
      return acc;
    }, 0);
  }

  // useEffect to log the form data on mount
  useEffect(() => {
    if (!formData) return;
    //console.log('Form data received:', formData); // Uncomment to log the form data
  }, [formData]);


  // Function to fetch the PoI data from the server
  async function fetchPoIData(path) {
    try {
      const response = await fetch(path);
      const data = await response.json();

      // Check if data.features exists and is an array
      if (!data.features || !Array.isArray(data.features)) {
        console.error('data.features is undefined or not an array');
        return {};  // Return an empty object if the data is not in the expected format
      }

      const poiData = {}; // Object to hold layers and points arrays for each PoI type
  
      // Function to determine the color based on the PoI type
      const getColor = (type) => {
        switch (type) {
          case "Biblioteca": return "maroon";
          case "Musei, Gallerie, Luoghi e Teatri storici": return "lime";
          case "Evento":
          case "Eventi e spettacoli": return "teal";
          case "Scuola": return "silver";
          case "Struttura sanitaria": return "olive";
          case "Area verde": return "yellow";
          case "Casa di quartiere": return "fuchsia";
          case "Area Ortiva": return "brown";
          case "Pista Ciclopedonale": return "lightgray";
          case "Rastrelliera bici": return "darkgray";
          case "Servizio extrascolastico": return "blue";
          case "Zona pedonale": return "lightblue";
          case "Aree di parcheggio": return "darkblue";
          case "Parcheggi dotati di colonnine elettriche": return "cyan";
          case "Sport e fitness": return "green";
          case "Risorse sociali": return "lightgreen";
          case "Fermate Tper": return "orange";
          case "Area Wi-Fi": return "purple";
          case "Stazione ferroviaria": return "red";
          default: return "gray"; // Fallback color
        }
      };
  
      // Iterate over each feature in the data
      data.features.forEach((feature) => {
        const type = feature.properties.tipologia_punto_di_interesse;
        const color = getColor(type);
  
        // Initialize the data structure for this type if it doesn't exist
        if (!poiData[type]) {
          poiData[type] = { layer: L.layerGroup([]), points: [], color: color };
        }
  
        // Create a circle marker for this feature
        const marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          radius: 5,
          fillColor: color,
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
        marker.bindPopup(`<b>${feature.properties.nome_punto_di_interesse}</b><br>${feature.properties.tipologia_punto_di_interesse}<br>${feature.properties.nome_area}`);
  
        // Add the marker to the layer for this type
        poiData[type].layer.addLayer(marker);
  
        // Add the point to the points array for this type
        poiData[type].points.push({
          coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
          type: feature.properties.tipologia_punto_di_interesse,
          name: feature.properties.nome_punto_di_interesse,
          area: feature.properties.nome_area,
          min: [feature.properties['5_min'], feature.properties['10_min'], feature.properties['15_min']],
        });
      });
      //console.log("PoI data:", poiData); // Uncomment to log the PoI data
      return poiData; // Return the object containing all layers and points arrays
    } catch (error) {
      console.error('Error fetching PoI geojson file:', error);
      throw error;
    }
  }


  // Function to calculate the satisfaction for a given point
  const calculateSatisfactionForPoint = (center, radius) => {
    let satisfaction = 0;
    let typesWithinRadius = new Set(); // Track PoI types within the radius
  
    Object.keys(formData).forEach(key => {
      if (poiData[key] && Array.isArray(poiData[key].points) && formData[key].value > 0) {
        let count = 0; // Initialize the count for the PoI type
        poiData[key].points.forEach(point => {
          //console.log("Point:", point); // Uncomment to log the point
          if (center.distanceTo(point.coordinates) <= radius) {
            // If the point is within the radius, increment the count
            //console.log("Point within radius:", point); // Uncomment to log the point within the radius
            count += 1; // Increment the count for the PoI type
            if (count >= formData[key].count) {
              typesWithinRadius.add(key); // Add the PoI type to the set if the count is reached
            }
          }
        });
      }
    });
  
    // Add the formData value only once for each PoI type found within the radius
    typesWithinRadius.forEach(key => {
      satisfaction += formData[key].value;
      //console.log("Satisfaction:", satisfaction);
    });
  
    return satisfaction;
  };

  // Function to set the color of a marker based on the satisfaction
  const setMarkerColor = (center, radius) => {
    if (poiData && poiData["Biblioteca"]) {
      if(sum(formData) === 0) return {satisfaction: null, color: 'gray'} // If no data is provided, return gray as default color if no preference is set
      let satisfaction = calculateSatisfactionForPoint(center, radius);
      // Set the color based on the satisfaction percentage
      const satisfactionPercentage = satisfaction / sum(formData) * 100;
      let Markercolor
      if (satisfactionPercentage >= 75)  Markercolor = 'green';
      else if (satisfactionPercentage >= 50) Markercolor = 'yellow';
      else if (satisfactionPercentage >= 25) Markercolor = 'orange';
      else Markercolor = 'red'

      return {satisfaction: satisfactionPercentage, color: Markercolor}

    } else {
      console.error("No PoI data available");
    }
  };

  // Function to generate a grid of points around a center point with a given distance and density
  function generatePointsGrid(center, distance, density) {
    let points = [];
    const step = distance / density; // Adjust step based on density and distance
    for (let lat = center.lat - distance; lat <= center.lat + distance; lat += step) {
      // Calculate the maximum longitude difference at the current latitude
      const maxLngDiff = distance / Math.cos(lat * Math.PI / 180); // Convert degrees to radians
      for (let lng = center.lng - maxLngDiff; lng <= center.lng + maxLngDiff; lng += step) {
        let point = L.latLng(lat, lng);
        //L.circleMarker(point, { radius: 1, color: 'black' }).addTo(map.current); // Uncomment to visualize the grid
        points.push(point);
      }
    }  
    return points;
  }

  const findOptimalPosition = () => {
    const center = L.latLng(44.4937544, 11.3409058);
    const distance = 2863.6245952823815 / 111139; // Convert meters to degrees
    let optimalPosition = null;
    let highestSatisfaction = 0;
    const density = 100; // Granularity of the search grid (higher values increase computation time, but may yield better results)

    const points = generatePointsGrid(center, distance, density);

    // Iterate over each point in the grid
    points.forEach(point => {
      let satisfaction = calculateSatisfactionForPoint(point, neighborhood.current); // Calculate the satisfaction for the current point
      if (satisfaction > highestSatisfaction) { // Update the highest satisfaction and optimal position if needed
        //console.log("New highest satisfaction:", satisfaction);
        highestSatisfaction = satisfaction;
        optimalPosition = point;
      }
      if (satisfaction === sum(formData)) { // If the satisfaction is already maximum, break the loop
        //console.log("Optimal position found:", optimalPosition);
        return;
      }
    });

    // Add a marker to the optimal position
    const sat = setMarkerColor(optimalPosition, neighborhood.current);
    const marker = L.circleMarker(optimalPosition, {
      radius: 5,
      fillColor: sat.color,
      color: sat.color,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
      neighborhood: neighborhood.current,
      satisfaction: sat.satisfaction,
      price: null
    }).addTo(map.current); // Add the marker to the map
    setSelectedMarkers(prevMarkers => [...prevMarkers,  marker]); // Add the marker to the selectedMarkers array
    return marker; // Return the marker
  };

  // Function to create a new marker on click and add it to the map
  const addMarker = (e) => {
    // Create a marker and add it to the map
    const sat = setMarkerColor(e.latlng, neighborhood.current); // Choose color based on satisfaction given the neighborhood
    //console.log("Sat: ",sat) // Uncomment to log the satisfaction object

    const marker = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: sat.color,
          color: sat.color,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
          neighborhood: neighborhood.current,
          filteredPoints: [],
          satisfaction: sat.satisfaction,
          price: null,
      }).addTo(map.current);  

    // Add the marker to the selectedMarkers array  
    setSelectedMarkers(prevMarkers => [...prevMarkers,  marker]);
    
    // Create a popup and display it at the marker's position
    /*popup
      .setLatLng(e.latlng)
      .setContent("You clicked the map at " + e.latlng.toString())
      .openOn(map.current);
    console.log("You clicked the map at " + e.latlng.toString());*/ // Uncomment to display popup of click event
  }

  // Function to create a new area and add it to the map
  const addArea = (e) => {
    // if not drawing, start drawing
    if(!drawing.current) {
      drawing.current = true;
      areaCenter.current = e.latlng // save the center of the area
    }
    // if drawing, end drawing
    else{
      const radius = e.latlng.distanceTo(areaCenter.current); // calculate the radius of the area
      const sat = setMarkerColor(areaCenter.current, radius); // choose color based on center and radius
      const newCircle = L.circle(areaCenter.current, { radius: radius, color: sat.color, satisfaction: sat.satisfaction }).addTo(map.current); // create the circle with chosen color
      //console.log("Area:", newCircle); // Uncomment to log the area
      setAreas(prevAreas => [...prevAreas, newCircle]); // add the circle to the areas array
      drawing.current = false;
    }
  }

  // Function to handle the click event on the map
  const onMapClick = (e) => {
    if(drawMode.current)
      addMarker(e);
    else
      addArea(e);
  }

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    // Initialize the Leaflet map
    map.current = new L.Map(mapContainer.current, mapOptions);
    new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map.current);
       
  }, [mapOptions]);


  // Fetch the PoI data from the server when the component mounts
  useEffect(() => {
      fetchPoIData('http://localhost:9000/data/api/poi_data').then(data => setPoiData(data));
  }, []);

  // Add the click event listener to the map after the PoI data has been loaded
  useEffect(() => {
    if (poiData) {       
      map.current.on('click', onMapClick); // Add the click event listener to the map only after the PoI data has been loaded
    }
  // eslint-disable-next-line
  }, [poiData]);

  // Function to handle the checkbox change event and add or remove the corresponding PoI layer from the map
  const handleCheckboxChange = (e, data) => {
      if (e.target.checked)
          data.addTo(map.current);
      else             
          map.current.removeLayer(data);
  };

  // Function to flush the PoI data from the map and uncheck the corresponding checkboxes, currently not used
  const flushPoiData = () => {
      if (poiData) {
          Object.keys(poiData).forEach((type) => {
            // Remove layer from the map
            map.current.removeLayer(poiData[type].layer);
            // Uncheck the corresponding checkbox
            const checkbox = document.getElementById(`checkbox-${type}`);
            if (checkbox) {
                checkbox.checked = false;
            }
          });
      }
  }
  
  // Function to flush the selected markers from the map
  const flushMarkers = () => {
      selectedMarkers.forEach(marker => {
          map.current.removeLayer(marker);
      });
      setSelectedMarkers([]);
  }

  // Function to flush the selected areas from the map
  const flushAreas = () => {
      areas.forEach(area => {
          map.current.removeLayer(area);
      });
      setAreas([]);
  }

  // Function to handle the neighborhood change event
  const handleNeighborhoodChange = (e) => {
    e.preventDefault();
    // Get the value of the neighborhood input field
    const neighborhoodValue = document.getElementById("neighborhood").value;

    // Check if the inserted value is a number
    if (isNaN(neighborhoodValue)) {
      alert("Please insert a number"); // Show an alert if the value is not a number
      return;
    } else {
      neighborhood.current = neighborhoodValue;
    }
  };

  // Function to remove a marker from the map and the selectedMarkers array
  function removeMarker(markerToRemove) {
    // Remove the marker from the map
    map.current.removeLayer(markerToRemove);
  
    // Update the selectedMarkers state to exclude the removed marker
    setSelectedMarkers(currentMarkers =>
      currentMarkers.filter(marker => marker !== markerToRemove)
    );
  }

  // Function to remove an area from the map and the areas array
  function removeArea(areaToRemove) {
    // Assuming you have a reference to your map instance similar to markers
    map.current.removeLayer(areaToRemove);
  
    // Update the areas state to exclude the removed area
    setAreas(currentAreas =>
      currentAreas.filter(area => area !== areaToRemove)
    );
  }

  // Function to store a marker in the database
  const storeMarker = (marker) => {
    //console.log("Storing marker:", marker); // Uncomment to log the marker
    const latlng = marker.getLatLng();
    // Adjusted the markerData object to include only the necessary properties
    const markerData = {
      latitude: latlng.lat,
      longitude: latlng.lng,
      neighborhood: marker.options.neighborhood,
    };
    
    // Send a POST request to the server to store the marker data
    fetch('http://localhost:9000/data/api/lista_immobili', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(markerData),
    })
    .then(response => response.json())
    .then(data =>
      console.log('Success:', data))
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  // Function to store an area in the database
  const storeArea = (area) => {
    //console.log("Storing area:", area); // Uncomment to log the area
    const latlng = area.getLatLng();
    const radius = area.getRadius();
    // Adjusted the areaData object to include only the necessary properties
    const areaData = {
      latitude: latlng.lat,
      longitude: latlng.lng,
      radius: radius,
    };

    // Send a POST request to the server to store the area data
    fetch('http://localhost:9000/data/api/lista_aree', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(areaData),
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  // Function to retrieve markers from the database
  const retrieveMarkers = () => {
    // Fetch the markers from the server
    fetch('http://localhost:9000/data/api/lista_immobili')
    .then(response => response.json())
    .then(data => 
      data.forEach(marker => {
        const latlng = L.latLng(marker.latitude, marker.longitude); 
        const sat = setMarkerColor(latlng, marker.neighborhood); // Choose color based on satisfaction given the neighborhood
        const newMarker = L.circleMarker(latlng, {
          radius: 5,
          fillColor: sat.color,
          color: sat.color,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
          neighborhood: marker.neighborhood,
          filteredPoints: [],
          price: null,
          satisfaction: sat.satisfaction
        }).addTo(map.current);
        setSelectedMarkers(prevMarkers => [...prevMarkers,  newMarker]); // Add the marker to the selectedMarkers array
      }
    ))
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  // Function to retrieve areas from the database
  const retrieveAreas = () => {
    fetch('http://localhost:9000/data/api/lista_aree')
    .then(response => response.json())
    .then(data => 
      data.forEach(area => {
        const latlng = L.latLng(area.latitude, area.longitude);
        const sat = setMarkerColor(latlng, area.radius);
        const newArea = L.circle(latlng, { radius: area.radius, color: sat.color, satisfaction: sat.satisfaction }).addTo(map.current);
        setAreas(prevAreas => [...prevAreas, newArea]);
      }
    ))
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  // Function to get the travel time between two points using the Mapbox Directions API
  const getTravelTime = (startPoint, endPoint, mode) => {
    return new Promise((resolve, reject) => {
      const mapboxAccessToken = 'pk.eyJ1Ijoidml0dG9yaW8tcm9zc2V0dG8iLCJhIjoiY2x5Y3lrc25yMDBtZTJrczRhd2Rod3U5NyJ9.zgQtB-yBNlT-D00aQ4Agng';
      const startLatLng = startPoint.getLatLng();
      // Construct the URL for the Mapbox Directions API
      const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startLatLng.lng},${startLatLng.lat};${endPoint.coordinates[1]},${endPoint.coordinates[0]}?geometries=geojson&access_token=${mapboxAccessToken}`;

      // Fetch the travel time data from the API
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const durationInSeconds = data.routes[0].duration;
            const durationInMinutes = durationInSeconds / 60;
            //console.log(`Travel time: ${durationInMinutes.toFixed(2)} minutes`); // Uncomment to log the travel time in minutes
            resolve(durationInMinutes);
          } else {
            console.error('No routes found.');
            resolve(null); // Resolve with null if no routes found
          }
        })
        .catch(error => {
          console.error('Error:', error);
          reject(error);
        });
    });
  };

  // Function to implement a time filter based on the travel time from the marker to the important PoI points
  const handleTimeFilter = async (marker, time, mezzo) => {
    // Clear any previously filtered points
    removeFilteredPoints(marker);
    marker.options.filteredPoints = [];     
    
    if (isNaN(time)) {
      alert("Please insert a number"); // Show an alert if the value is not a number
      return;
    } else {
      if (poiData && formData) {
        // Iterate over each PoI type and its points
        for (const key of Object.keys(poiData)) {
          // Check if the PoI type exists in the formData and the relative value is greater than 0
          if (poiData[key] && Array.isArray(poiData[key].points) && formData[key].value && formData[key].value > 0) {
            // Iterate over each point
            for (const point of poiData[key].points) {
              // Get the travel time from the marker to the point
              const travelTime = await getTravelTime(marker, point, mezzo);
              //console.log("Travel time:", travelTime); // Uncomment to log the travel time
              // Check if the travel time is not null and less than or equal to the specified time
              if (travelTime !== null && travelTime <= time) {
                // Add the point to map
                const color = poiData[key].color;
                const newMarker = L.circleMarker(point.coordinates, {
                  radius: 5,
                  fillColor: color,
                  color: "#000",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
                }).addTo(map.current);
                // Add a popup with the name of the point and the travel time
                newMarker.bindPopup(`<b>${point.name}</b><br>${point.type}<br>${point.area}<br>${travelTime.toFixed(2)} min.`);
                // Add the marker to the filteredPoints array of the original marker using setSelectedMarkers to trigger a re-render
                marker.options.filteredPoints.push(newMarker);
                setSelectedMarkers(prevMarkers => [...prevMarkers]);
              }
            }
          }
        }
      }
    }
  };

  // Function to remove the filtered points from the map
  const removeFilteredPoints = (marker) => {
    marker.options.filteredPoints.forEach(filteredPoint => {
      map.current.removeLayer(filteredPoint);
    });
    marker.options.filteredPoints = [];
    setSelectedMarkers(prevMarkers => [...prevMarkers]);
  };


  // Function to calculate the Moran's I index
  const calculateMoransI = (e) => {
    e.preventDefault();
    const prices = []
    const proximities = []

    for (const marker of selectedMarkers) {
      if (marker.options.price !== null) {
        prices.push(marker.options.price);
        proximities.push(marker.options.satisfaction);
      }
    }

    const N = prices.length;
  
    // Calculate the mean of the prices
    const meanPrice = prices.reduce((a, b) => a + b, 0) / N;
  
    // Calculate deviations from the mean
    const deviations = prices.map(price => price - meanPrice);
  
    // Create the weight matrix based on proximity values
    const weightMatrix = Array.from({ length: N }, () => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i !== j) {
          // Weight as the product of normalized proximities
          weightMatrix[i][j] = (proximities[i] / 100) * (proximities[j] / 100);
        }
      }
    }
  
    // Calculate the numerator
    let numerator = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        numerator += weightMatrix[i][j] * deviations[i] * deviations[j];
      }
    }
  
    // Calculate the denominator
    const denominator = deviations.reduce((a, b) => a + b ** 2, 0);
  
    // Calculate S0 (sum of all weights)
    const S0 = weightMatrix.flat().reduce((a, b) => a + b, 0);
  
    // Calculate Moran's I index
    const res = (N / S0) * (numerator / denominator);
    //console.log("Moran's I index:", res); // Uncomment to log the Moran's I index
    setMoransI(res);
  }

  // Function to set price and trigger UI update
  const setPrice = (marker, price) => {
    if (isNaN(price)) {
      alert("Please insert a number"); // Show an alert if the value is not a number
      return;
    }
    marker.options.price = price;
    //console.log("Price set to:", price); // Uncomment to log the price
    // Update the selectedMarkers state to trigger a re-render
    setSelectedMarkers(prevMarkers => [...prevMarkers]);
  };

  return (
      <div>
          <div className="map-wrap">
              <div ref={mapContainer} className="map" />
          </div>
          <div className='menu'>
              <h1>Home Zone<br/>Analyzer</h1>
              <div className="poi-checkboxes">
                  {poiData && Object.keys(poiData).map((type, index) => (
                      <div key={index}>
                          <input type="checkbox" id={type} name={type} onChange={(e) => handleCheckboxChange(e, poiData[type].layer)} />
                          <label htmlFor={type}>
                            <span style={{ height: '10px', width: '10px', backgroundColor: poiData[type].color, borderRadius: '50%', display: 'inline-block', marginRight: '5px' }}></span>
                            {type}
                          </label>
                      </div>
                  ))}
              </div>
              <div>
                <h2 htmlFor="selectionMode">Selection mode:</h2>
                <select
                  id="selectionMode"
                  value={drawMode.current ? "Marker" : "Area"}
                  onChange={(e) => (drawMode.current = e.target.value === "Marker")}>
                  <option value="Marker">Marker</option>
                  <option value="Area">Area</option>
                </select>
                <br/>
              </div>
              <div>
                <h2 htmlFor="neighborhood">Neighborhood: </h2>
                <input type="text" id="neighborhood" name="neighborhood" placeholder={neighborhood.current}/>
                <button onClick={handleNeighborhoodChange}>Set neighborhood</button>
              </div>
              <div className="buttons">
                  <button onClick={flushMarkers}>Flush Markers</button>
                  <button onClick={flushAreas}>Flush Areas</button>
              </div>
              <button onClick={findOptimalPosition}>Find Optimal Position</button>
              <button onClick={retrieveMarkers}>Retrieve Markers</button>
              <button onClick={retrieveAreas}>Retrieve Areas</button>
              <button onClick={calculateMoransI}>Calculate Moran's I</button>
              {moransI !== null && <p>Moran's I index: {moransI}</p>}

          </div>
          <div className='selected-list'>
              <h2>Selected Markers</h2>
              <ul>
                {selectedMarkers.map((marker, index) => (
                  <React.Fragment key={index}>
                    <h4>Marker {index}</h4>
                    <li>{marker.getLatLng().toString()}</li>
                    <li>Neighborhood: {marker.options.neighborhood}</li>
                    <li>Satisfaction: <span style={{ color: marker.options.color.toString() }}>{marker.options.satisfaction.toString()}%</span></li>
                    <div>
                      <label htmlFor={`time-${index}`}>Tempo:</label>
                      <input placeholder='min.' type="text" id={`time-${index}`} name="time" />
                      <label htmlFor={`mezzo-${index}`}>Mezzo:</label>
                      <select id={`mezzo-${index}`} name="mezzo">
                        <option value="walking">Piedi</option>
                        <option value="driving">Auto</option>
                        <option value="cycling">Bici</option>
                      </select>
                      <button onClick={() => {
                        const timeElement = document.getElementById(`time-${index}`);
                        const mezzoElement = document.getElementById(`mezzo-${index}`);
                        const time = timeElement.value;
                        const mezzo = mezzoElement.value;
                        handleTimeFilter(marker, time, mezzo);
                      }}>Filter</button><br />
                      {marker.options.filteredPoints && marker.options.filteredPoints.length > 0 && (
                        <button onClick={() => removeFilteredPoints(marker)}>Remove Filtered</button>
                      )}
                    </div>
                    {marker.options.price !== null && (
                      <li>Price: {marker.options.price}</li>
                      )}
                    <input type="text" id={`price-${index}`} name="price" placeholder="Price" />
                    <button onClick={() => setPrice(marker, document.getElementById(`price-${index}`).value)}>Set Price</button>
                    <button onClick={() => removeMarker(marker)}>Remove</button>
                    <button onClick={() => storeMarker(marker)}>Store</button>
                  </React.Fragment>    
                ))}
              </ul>
              <h2>Selected Areas</h2>
              <ul>
                  {areas.map((area, index) => (
                      <React.Fragment key={index}>
                        <h4>Area {index}</h4>
                        <li>{area.getLatLng().toString()} - {area.getRadius()}</li>
                        <li>Satisfaction: <span style={{ color: area.options.color.toString() }}>{area.options.satisfaction.toString()}%</span></li>
                        <button onClick={() => removeArea(area)}>Remove</button>
                        <button onClick={() => storeArea(area)}>Store</button>
                      </React.Fragment>
                  ))}
              </ul>
          </div>
      </div>
  );
}
export default Map;