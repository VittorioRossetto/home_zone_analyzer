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