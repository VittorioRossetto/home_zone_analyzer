var mapOptions = {
    center: L.latLng(44.4937544, 11.3409058),
    zoom: 14
}

var map = L.map('map', mapOptions);

// Create a menu control
var menuControl = L.control({
    position: 'topleft'
});

// Add content to the menu
menuControl.onAdd = function(map) {
    var menuContainer = L.DomUtil.create('div', 'menu-container');
    menuContainer.innerHTML = '<h3>Menu</h3><ul><li>Option 1</li><li>Option 2</li><li>Option 3</li></ul>';
    return menuContainer;
};

// Add the menu control to the map
menuControl.addTo(map);

var popup = L.popup();

function onMapClick(e) {
    L.marker(e.latlng).addTo(map);

    fetch('./punti.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(e.latlng),
        mode: 'cors'
    })
    .then(response => {
        if (response.ok) {
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