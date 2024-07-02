import React, { useRef, useEffect, useState } from 'react';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import './css/map.css';

const Map = () => {
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
    const drawMode = useRef(false);
    const [selectedMarkers, setSelectedMarkers] = useState([]);
    const [poiData, setPoiData] = useState(null);

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

  const addMarker = (e) => {
    // Create a marker and add it to the map
    const temp = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: "red",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
      }).addTo(map.current);  
    // Add the marker to the selectedMarkers array  
    setSelectedMarkers(prevMarkers => [...prevMarkers,  temp]);

    // Create a popup and display it
    popup
      .setLatLng(e.latlng)
      .setContent("You clicked the map at " + e.latlng.toString())
      .openOn(map.current);
    console.log("You clicked the map at " + e.latlng.toString());
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
      const newCircle = L.circle(areaCenter.current, { radius }).addTo(map.current); // create the circle
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

    const baseLayer = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map.current);
      map.current.on('click', onMapClick);
  }, [mapOptions]);

    useEffect(() => {
        fetchPoIData('/geojson/PoI_complete.geojson', 'black').then(data => setPoiData(data));
    }, []);


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
                <div className="buttons">
                    <button onClick={flushMarkers}>Flush Markers</button>
                    <button onClick={flushAreas}>Flush Areas</button>
                </div>
            </div>
        </div>
    );
}
export default Map;