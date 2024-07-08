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
  //const popup = L.popup();
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

  function sum( obj ) {
    // Function to sum all the values of an object
    var sum = 0;
    for( var el in obj ) {
      if( obj.hasOwnProperty( el ) ) {
        sum += parseFloat( obj[el] );
      }
    }
    return sum;
  }

  useEffect(() => {
    if (!formData) return;
    console.log('Form data received:', formData);
  }, [formData]);

  async function fetchPoIData(path) {
    try {
      const response = await fetch(path);
    const data = await response.json();

    // Check if data.features exists and is an array
    if (!data.features || !Array.isArray(data.features)) {
      console.error('data.features is undefined or not an array');
      return {}; // Return an empty object or handle the error as appropriate
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
      //console.log("PoI data:", poiData);
      return poiData; // Return the object containing all layers and points arrays
    } catch (error) {
      console.error('Error fetching PoI geojson file:', error);
      throw error;
    }
  }


  const calculateSatisfactionForPoint = (center, radius) => {
    let satisfaction = 0;

    Object.keys(formData).forEach(key => {
      if (poiData[key] && Array.isArray(poiData[key].points) && formData[key] > 0) {
        // poiData[key] exists and is an array, now iterate over the points
        poiData[key].points.forEach(point => {
          if (center.distanceTo(point.coordinates) <= radius) {
            // If the point is within the radius, calculate the satisfaction
            satisfaction += formData[key];
            // console.log("Satisfaction:", formData[key]);
            return;
          }
        });
      }
    });
    return satisfaction;
  }

  const setMarkerColor = (center, radius) => {
    if (poiData && poiData["Biblioteca"]) {
      if(sum(formData) === 0) return 'gray' // If no data is provided, return gray as default color
      let satisfaction = calculateSatisfactionForPoint(center, radius);
      // Set the color based on the satisfaction
      const satisfactionPercentage = satisfaction / sum(formData) * 100;
      if (satisfactionPercentage >= 75) return 'green';
      else if (satisfactionPercentage >= 50) return 'yellow';
      else if (satisfactionPercentage >= 25) return 'orange';
      else return 'red';

    } else {
      console.error("No PoI data available");
    }
  };

  // We generate a grid of points within a circle of a given radius around a center point 
  function generatePointsWithinCircle(center, radiusInDegrees, density) {
    let points = [];
    const step = radiusInDegrees / density; // Adjust step based on density and radius in degrees
    for (let lat = center.lat - radiusInDegrees; lat <= center.lat + radiusInDegrees; lat += step) {
      // Calculate the maximum longitude difference at the current latitude
      const maxLngDiff = radiusInDegrees / Math.cos(lat * Math.PI / 180);
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
    const radius = 2863.6245952823815 / 111139; // Convert meters to degrees
    let optimalPosition = null;
    let highestSatisfaction = 0;
    const density = 100; // Granularity of the search

    const points = generatePointsWithinCircle(center, radius, density);

    points.forEach(point => {
      let satisfaction = calculateSatisfactionForPoint(point, neighborhood.current);
      if (satisfaction > highestSatisfaction) {
        console.log("New highest satisfaction:", satisfaction);
        highestSatisfaction = satisfaction;
        optimalPosition = point;
      }
      if (satisfaction === sum(formData)) {
        console.log("Optimal position found:", optimalPosition);
        return;
      }
    });

    console.log("Optimal position:", optimalPosition);
    // Add a marker to the optimal position
    const color = setMarkerColor(optimalPosition, neighborhood.current);
    const marker = L.circleMarker(optimalPosition, {
      radius: 5,
      fillColor: color,
      color: color,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
      neighborhood: neighborhood.current
    }).addTo(map.current);
    setSelectedMarkers(prevMarkers => [...prevMarkers,  marker]);
    return marker;
  };

  const addMarker = (e) => {
    // Create a marker and add it to the map
    const color = setMarkerColor(e.latlng, neighborhood.current);
    const marker = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
          neighborhood: neighborhood.current,
          filteredPoints: []
      }).addTo(map.current);  

    console.log("Marker:", marker);
    // Add the marker to the selectedMarkers array  
    setSelectedMarkers(prevMarkers => [...prevMarkers,  marker]);
    
    // Create a popup and display it
    /*popup
      .setLatLng(e.latlng)
      .setContent("You clicked the map at " + e.latlng.toString())
      .openOn(map.current);
    console.log("You clicked the map at " + e.latlng.toString());*/
  }

  const addArea = (e) => {
    // if not drawing, start drawing
    if(!drawing.current) {
      drawing.current = true;
      areaCenter.current = e.latlng // save the center of the area
    }
    // if drawing, end drawing
    else{
      const radius = e.latlng.distanceTo(areaCenter.current); // calculate the radius of the area
      const color = setMarkerColor(areaCenter.current, radius); // choose color based on center and radius
      const newCircle = L.circle(areaCenter.current, { radius, color }).addTo(map.current); // create the circle with chosen color
      console.log("Area:", newCircle);
      setAreas(prevAreas => [...prevAreas, newCircle]); // add the circle to the areas array
      drawing.current = false;
    }
  }

  const onMapClick = (e) => {
    if(drawMode.current)
      addMarker(e);
    else
      addArea(e);
  }

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new L.Map(mapContainer.current, mapOptions);
    new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map.current); 
       
  }, [mapOptions]);

    useEffect(() => {
        fetchPoIData('http://localhost:9000/data/api/poi_data').then(data => setPoiData(data));
    }, []);

    useEffect(() => {
      if (poiData) {       
        map.current.on('click', onMapClick); // Add the click event listener to the map only after the PoI data has been loaded
      }
    // eslint-disable-next-line
    }, [poiData]);

    const handleCheckboxChange = (e, data) => {
        if (e.target.checked)
            data.addTo(map.current);
        else             
            map.current.removeLayer(data);
    };

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
    
    const flushMarkers = () => {
        selectedMarkers.forEach(marker => {
            map.current.removeLayer(marker);
        });
        setSelectedMarkers([]);
    }

    const flushAreas = () => {
        areas.forEach(area => {
            map.current.removeLayer(area);
        });
        setAreas([]);
    }

    const handleNeighborhoodChange = (e) => {
      e.preventDefault();
      const neighborhoodValue = document.getElementById("neighborhood").value;

      // Check if the inserted value is a number
      if (isNaN(neighborhoodValue)) {
        alert("Please insert a number");
        return;
      } else {
        neighborhood.current = neighborhoodValue;
      }
    };

    function removeMarker(markerToRemove) {
      // Remove the marker from the map
      map.current.removeLayer(markerToRemove);
    
      // Update the selectedMarkers state to exclude the removed marker
      setSelectedMarkers(currentMarkers =>
        currentMarkers.filter(marker => marker !== markerToRemove)
      );
    }

    function removeArea(areaToRemove) {
      // Assuming you have a reference to your map instance similar to markers
      map.current.removeLayer(areaToRemove);
    
      // Update the areas state to exclude the removed area
      setAreas(currentAreas =>
        currentAreas.filter(area => area !== areaToRemove)
      );
    }

    const storeMarker = (marker) => {
      // Assuming marker has properties like latitude and longitude
      // Adjust these property names based on your marker object's structure
      const latlng = marker.getLatLng();
      console.log("Storing marker:", marker);
      const markerData = {
        latitude: latlng.lat,
        longitude: latlng.lng,
        neighborhood: marker.options.neighborhood,
      };
    
      fetch('http://localhost:9000/data/api/lista_immobili', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(markerData),
      })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch((error) => {
        console.error('Error:', error);
      });
    }

    const storeArea = (area) => {
      // Assuming area has properties like latitude and longitude
      // Adjust these property names based on your area object's structure
      const latlng = area.getLatLng();
      const radius = area.getRadius();
      console.log("Storing area:", area);
      const areaData = {
        latitude: latlng.lat,
        longitude: latlng.lng,
        radius: radius,
      };
    
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

    const retrieveMarkers = () => {
      fetch('http://localhost:9000/data/api/lista_immobili')
      .then(response => response.json())
      .then(data => 
        data.forEach(marker => {
          const latlng = L.latLng(marker.latitude, marker.longitude);
          const color = setMarkerColor(latlng, neighborhood.current);
          const newMarker = L.circleMarker(latlng, {
            radius: 5,
            fillColor: color,
            color: color,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
            neighborhood: marker.neighborhood
          }).addTo(map.current);
          setSelectedMarkers(prevMarkers => [...prevMarkers,  newMarker]);
        }
      ))
      .catch((error) => {
        console.error('Error:', error);
      });
    }

    const retrieveAreas = () => {
      fetch('http://localhost:9000/data/api/lista_aree')
      .then(response => response.json())
      .then(data => 
        data.forEach(area => {
          const latlng = L.latLng(area.latitude, area.longitude);
          const color = setMarkerColor(latlng, area.radius);
          const newArea = L.circle(latlng, { radius: area.radius, color: color }).addTo(map.current);
          setAreas(prevAreas => [...prevAreas, newArea]);
        }
      ))
      .catch((error) => {
        console.error('Error:', error);
      });
    }

    // Adjusted getTravelTime to ensure it returns a promise that resolves with the duration
    const getTravelTime = (startPoint, endPoint, mode) => {
      return new Promise((resolve, reject) => {
        const mapboxAccessToken = 'pk.eyJ1Ijoidml0dG9yaW8tcm9zc2V0dG8iLCJhIjoiY2x5Y3lrc25yMDBtZTJrczRhd2Rod3U5NyJ9.zgQtB-yBNlT-D00aQ4Agng';
        const startLatLng = startPoint.getLatLng();
        const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startLatLng.lng},${startLatLng.lat};${endPoint.coordinates[1]},${endPoint.coordinates[0]}?geometries=geojson&access_token=${mapboxAccessToken}`;

        fetch(url)
          .then(response => response.json())
          .then(data => {
            if (data.routes && data.routes.length > 0) {
              const durationInSeconds = data.routes[0].duration;
              const durationInMinutes = durationInSeconds / 60;
              console.log(`Travel time: ${durationInMinutes.toFixed(2)} minutes`);
              resolve(durationInMinutes);
            } else {
              console.log('No routes found.');
              resolve(null); // Resolve with null if no routes found
            }
          })
          .catch(error => {
            console.error('Error:', error);
            reject(error);
          });
      });
    };

    // Adjusted handleTimeFilter to be async and await the result of getTravelTime
    const handleTimeFilter = async (marker, time, mezzo) => {
      // Clear any previously filtered points
      removeFilteredPoints(marker);
      marker.options.filteredPoints = [];     
      
      if (isNaN(time)) {
        alert("Please insert a number");
        return;
      } else {
        console.log("poiData:", poiData);
        console.log("formData:", formData);
        if (poiData && formData) {
          console.log("Filtering markers based on time and mezzo...");
          for (const key of Object.keys(poiData)) {
            if (poiData[key] && Array.isArray(poiData[key].points) && formData[key] && formData[key] > 0) {
              for (const point of poiData[key].points) {
                const travelTime = await getTravelTime(marker, point, mezzo);
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

    const removeFilteredPoints = (marker) => {
      marker.options.filteredPoints.forEach(filteredPoint => {
        map.current.removeLayer(filteredPoint);
      });
      marker.options.filteredPoints = [];
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
            </div>
            <div className='selected-list'>
                <h2>Selected Markers</h2>
                <ul>
                  {selectedMarkers.map((marker, index) => (
                    <React.Fragment key={index}>
                      <h4>Marker {index}</h4>
                      <li>{marker.getLatLng().toString()}</li>
                      <li>Neighborhood: {marker.options.neighborhood}</li>
                      <li>Satisfaction: <span style={{ color: marker.options.color.toString() }}>{marker.options.color.toString()}</span></li>
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
                          <li>Satisfaction: <span style={{ color: area.options.color.toString() }}>{area.options.color.toString()}</span></li>
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