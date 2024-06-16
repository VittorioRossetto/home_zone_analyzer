var mapOptions = {
    center: L.latLng(44.4937544, 11.3409058),
    zoom: 14
}

var map = L.map('map', mapOptions);

var popup = L.popup();

// Funzione per aggiornare il valore mostrato degli slider
function updateSliderValue(sliderId, valueId) {
    document.getElementById(sliderId).addEventListener('input', function() {
        document.getElementById(valueId).textContent = this.value;
    });
}

// Aggiorna i valori per ciascuno slider
for (let i = 1; i <= 10; i++) {
    updateSliderValue(`slider-${i}`, `slider-${i}-value`);
}

// Gestione dell'invio del form
// Gestione dell'invio del form
document.getElementById('survey-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Raccogli i valori degli slider
    let formData = {};
    for (let i = 1; i <= 10; i++) {
        formData[`slider${i}`] = document.getElementById(`slider-${i}`).value;
    }

    // Invia i dati al backend con fetch
    fetch('http://localhost:9000/data/api/survey', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Survey submitted successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error submitting survey.');
    });
});

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

        if (response.ok) {
            response.json()
                .then(data => {
                    console.log('Response from server:', data);
                })
                .catch(error => {
                    console.error('Error parsing response:', error);
                });
            console.log('Coordinates written to punti.json');
        } else {
            console.log('Failed to write coordinates to punti.json');
        }
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