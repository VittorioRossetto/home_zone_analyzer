var mapOptions = {
    center: L.latLng(44.4937544, 11.3409058),
    zoom: 14
}

var geoJsonColonnine = {};

function fetchGeoJsonFiles(folderPath, color) {
    fetch(folderPath)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched geojson file:', data);
            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 3,
                        fillColor: color,
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error('Error fetching geojson file:', error);
        });
}

fetchGeoJsonFiles('geojson/colonnine-elettriche.geojson', 'green');
fetchGeoJsonFiles('geojson/bagni-pubblici.geojson', 'blue');
fetchGeoJsonFiles('geojson/attrezzature_ludiche_ginniche_sportive.geojson', 'red');
fetchGeoJsonFiles('geojson/tper-fermate-autobus', 'orange');
fetchGeoJsonFiles('geojson/bolognawifi-elenco-hot-spot', 'white');
fetchGeoJsonFiles('geojson/farmacie.geojson', 'black');
fetchGeoJsonFiles('geojson/sgambatura_cani.geojson', 'yellow');
fetchGeoJsonFiles('geojson/teatri-cinema-teatri.geojson', 'brown');
fetchGeoJsonFiles('geojson/carta-tecnica-comunale-toponimi-parchi-e-giardini.geojson', 'pink');


var map = L.map('map', mapOptions);

var popup = L.popup();



function onMapClick(e) {
    L.marker(e.latlng).addTo(map);

    fetch('http://localhost:9000/data/api/hello', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(e.latlng),
        mode: 'cors'
    })
    .then(response => {
        response.json()
            .then(data => {
                console.log('Response from server:', data);
            })
            .catch(error => {
                console.error('Error parsing response:', error);
            });
        
    })
    .catch(error => {
        console.error('Error writing coordinates to punti.json:', error);
    });

    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

var baseLayer = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map);