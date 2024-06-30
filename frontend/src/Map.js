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
  const [colonnine, setColonnine] = useState('');
  const [bagni, setBagni] = useState('');
  const [attrezzature, setAttrezzature] = useState('');
  const [fermateBus, setFermateBus] = useState('');
  const [wifi, setWifi] = useState('');
  const [farmacie, setFarmacie] = useState('');
  const [sgambamenti, setSgambamenti] = useState('');
  const [teatri, setTeatri] = useState('');
  const [parchi, setParchi] = useState('');
  const [poi, setPoi] = useState('');
  const [selectedMarkers, setSelectedMarkers] = useState([])
  const areaCenter = useRef('')
  const [areas, setAreas] = useState([]);
  const switchVal = useRef(false)
  const drawing = useRef(false)


  async function fetchGeoJsonFiles(path, color) {
    // Return the promise chain so the caller can use the eventual data
    try {
      const response = await fetch(path);
      const data = await response.json();
      var layer = L.geoJSON(data, {
        pointToLayer: function (feature_1, latlng) {
          return L.circleMarker(latlng, {
            radius: 3,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        }
      });
      return layer;
    } catch (error) {
      console.error('Error fetching geojson file:', error);
      throw error; // Re-throw the error to ensure the caller can handle it
    }
  }
  
  async function fetchPoIData(path) {
    try {
      const response = await fetch(path);
      const data = await response.json();
      const layer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          let color;
          switch (feature.properties.tipologia_punto_di_interesse) {
            case "Biblioteca":
              color = "purple";
              break;
            case "Musei, Gallerie, Luoghi e Teatri storici":
              color = "orange";
              break;
            case "Evento":
              color = "pink";
              break;
            case "Scuola":
              color = "yellow";
              break;
            case "Struttura sanitaria":
              color = "brown";
              break;
            case "Area verde":
              color = "lightgreen";
              break;
            case "Casa di quartiere":
              color = "lightblue";
              break;
            case "Area Ortiva":
              color = "darkgreen";
              break;
            default:
              color = "gray";
              break;
            }
          return L.circleMarker(latlng, {
            radius: 3,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        }
      });
      return layer;
    } catch (error) {
      console.error('Error fetching PoI geojson file:', error);
      throw error;
    }
  }

  useEffect(() => {
    console.log(selectedMarkers);
  }, [selectedMarkers]);

  const onMapClick = (e) => {
    const temp = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: "red",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
      }).addTo(map.current);    
    setSelectedMarkers(prevMarkers => [...prevMarkers,  temp]);

    popup
      .setLatLng(e.latlng)
      .setContent("You clicked the map at " + e.latlng.toString())
      .openOn(map.current);
    console.log("You clicked the map at " + e.latlng.toString());
  }

  const draw = (e) => {
    if(!drawing.current) {
      drawing.current = true;
      areaCenter.current = e.latlng
      console.log('start drawing at: ' + e.latlng)
    }
    else{
      console.log('center: ' + areaCenter.current + 'now: ' + e.latlng)
      const radius = e.latlng.distanceTo(areaCenter.current);
      const newCircle = L.circle(areaCenter.current, { radius }).addTo(map.current);
      setAreas(prevAreas => [...prevAreas, newCircle]);
      drawing.current = false;
      console.log('stop drawing at: ' + e.latlng)
    }
  }

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new L.Map(mapContainer.current, mapOptions);

    const baseLayer = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map.current);
    if(switchVal.current)
      map.current.on('click', onMapClick);
    else{
      //map.current.off('click');
      map.current.on('click', draw);
    }
  }, [mapOptions]);

  useEffect(() => {
    fetchGeoJsonFiles('/geojson/colonnine-elettriche.geojson', 'blue').then(data => setColonnine(data));
    fetchGeoJsonFiles('/geojson/bagni-pubblici.geojson', 'green').then(data => setBagni(data));
    fetchGeoJsonFiles('/geojson/attrezzature_ludiche_ginniche_sportive.geojson', 'red').then(data => setAttrezzature(data));
    fetchGeoJsonFiles('/geojson/tper-fermate-autobus.geojson', 'orange').then(data => setFermateBus(data));
    fetchGeoJsonFiles('/geojson/bolognawifi-elenco-hot-spot.geojson', 'purple').then(data => setWifi(data));
    fetchGeoJsonFiles('/geojson/farmacie.geojson', 'yellow').then(data => setFarmacie(data));
    fetchGeoJsonFiles('/geojson/sgambatura_cani.geojson', 'pink').then(data => setSgambamenti(data));
    fetchGeoJsonFiles('/geojson/teatri-cinema-teatri.geojson', 'brown').then(data => setTeatri(data));
    fetchGeoJsonFiles('/geojson/carta-tecnica-comunale-toponimi-parchi-e-giardini.geojson', 'gray').then(data => setParchi(data));  
    fetchPoIData('/geojson/PoI_complete.geojson', 'black').then(data => setPoi(data));
  }, []);

  const handleCheckboxChange = (e, data) => {
    if (e.target.checked) {
      console.log('Adding data to map:', data);
      data.addTo(map.current);
    } else {
      console.log('Removing data from map:', data);
      map.current.removeLayer(data);
    }
  };

  const flushMarkers = () => {
    selectedMarkers.forEach(marker => {
      map.current.removeLayer(marker);
    });
    setSelectedMarkers([]);
  }

  const handleSwitchMode = () => {
    switchVal.current = !switchVal.current
    console.log(switchVal)
  }

  return (
    <>
      <div className="map-wrap">
        <div ref={mapContainer} className="map" />
      </div>

      <button onClick={() => flushMarkers() }>Clear Markers</button>

      <div className="switch">
        <label>
          <input type="checkbox" onChange={() => handleSwitchMode()} />
          <span className="slider"></span>
          <span className="switch-label">Left</span>
        </label>
        <label>
          <span className="switch-label">Right</span>
          <span className="slider"></span>
        </label>
      </div>

      <div className="legend">
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, colonnine)} />
          Colonnine
        </label>
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, bagni)} />
          Bagni
        </label>
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, attrezzature)} />
          Attrezzature Sportive
        </label>
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, fermateBus)} />
          Fermate Bus
        </label>
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, wifi)} />
          Wifi
        </label>
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, farmacie)} />
          Farmacie
        </label>
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, sgambamenti)} />
          Sgambamenti
        </label>
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, teatri)} />
          Teatri
        </label>
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, parchi)} />
          Parchi
        </label>
        <label>
          <input type="checkbox" onChange={(e) => handleCheckboxChange(e, poi)} />
          PoI
        </label>
      </div>
    </>
  );
}

export default Map;