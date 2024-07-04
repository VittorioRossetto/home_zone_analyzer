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
  const popup = L.popup();
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
          case "Area verde": return "navy";
          case "Casa di quartiere": return "fuchsia";
          case "Area Ortiva": return "aqua";
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
          poiData[type] = { layer: L.layerGroup([]), points: [] };
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
  
      return poiData; // Return the object containing all layers and points arrays
    } catch (error) {
      console.error('Error fetching PoI geojson file:', error);
      throw error;
    }
  }

  const setMarkerColor = (center, radius) => {
    if (poiData && poiData["Biblioteca"]) {
      if(sum(formData) == 0) return 'gray' // If no data is provided, return gray as default color
      let satisfaction = 0;
      // Iterate over the PoI data
      Object.keys(formData).forEach(key => {
        if (poiData[key] && Array.isArray(poiData[key].points) && formData[key] > 0) {
          // poiData[key] exists and is an array, now iterate over the points
          poiData[key].points.forEach(point => {
            if (center.distanceTo(point.coordinates) <= radius) {
              // If the point is within the radius, calculate the satisfaction
              satisfaction += formData[key];
              console.log("Satisfaction:", formData[key]);
              return;
            }
          });
        }
      });
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

  const addMarker = (e) => {
    // Create a marker and add it to the map
    const color = setMarkerColor(e.latlng, neighborhood.current);
    const marker = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
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
        fetchPoIData('/geojson/PoI_complete.geojson').then(data => setPoiData(data));
    }, []);

    useEffect(() => {
      if (poiData) {
        map.current.on('click', onMapClick); // Add the click event listener to the map only after the PoI data has been loaded
      }
    }, [poiData]);

    const handleCheckboxChange = (e, data) => {
        if (e.target.checked)
            data.addTo(map.current);
        else             
            map.current.removeLayer(data);
    };
    
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
        console.log("Value to use:", neighborhoodValue);
        neighborhood.current = neighborhoodValue;
        console.log("Neighborhood set to:", neighborhood.current);
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
                            <label htmlFor={type}>{type}</label>
                        </div>
                    ))}
                </div>
                <div>
                  <h4>Selection mode: {drawMode.current ? "Marker" : "Area"}</h4>
                  <button onClick={() => drawMode.current = !drawMode.current}>Switch</button>
                  <br/>
                </div>
                <div>
                  <label htmlFor="neighborhood">Neighborhood: </label>
                  <input type="text" id="neighborhood" name="neighborhood" placeholder={neighborhood.current}/>
                  <button onClick={handleNeighborhoodChange}>Set neighborhood</button>
                </div>
                <div className="buttons">
                    <button onClick={flushMarkers}>Flush Markers</button>
                    <button onClick={flushAreas}>Flush Areas</button>
                </div>
            </div>
            <div className='selected-list'>
                <h2>Selected Markers</h2>
                <ul>
                  {selectedMarkers.map((marker, index) => (
                    <React.Fragment key={index}>
                      <h4>Marker {index}</h4>
                      <li>{marker.getLatLng().toString()}</li>
                      <li>Satisfaction:</li>
                      <li style={{ color: marker.options.color.toString()}}> {marker.options.color.toString()}</li>
                      <button onClick={() => removeMarker(marker)}>Remove</button>
                    </React.Fragment>    
                  ))}
                </ul>
                <h2>Selected Areas</h2>
                <ul>
                    {areas.map((area, index) => (
                        <React.Fragment key={index}>
                          <h4>Area {index}</h4>
                          <li>{area.getLatLng().toString()} - {area.getRadius()}</li>
                          <li>Satisfaction:</li>
                          <li style={{ color: area.options.color.toString()}}> {area.options.color.toString()}</li>
                          <button onClick={() => removeArea(area)}>Remove</button>
                        </React.Fragment>
                    ))}
                </ul>
            </div>
        </div>
    );
}
export default Map;