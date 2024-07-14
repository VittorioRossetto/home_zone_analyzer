import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom'; 
import './css/survey.css';

const Menu = () => {
    const navigate = useNavigate(); 
    const hostName = 'http://localhost:30001'; // Change to 'http://localhost:9000' if running locally or 'http://backend:9000' if running in Docker


    // Function to handle the slider change event
    const handleSliderChange = (event) => {
        const sliderId = event.target.id;
        const sliderValue = event.target.value;
        const valueElement = document.getElementById(`${sliderId}-value`);
        valueElement.textContent = sliderValue;
    }

    // Fetch the POI data when the component mounts
    useEffect(() => {
        fetch(hostName + '/data/api/poi_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
    }, []);

    // Add event listeners to the sliders when the component mounts
    useEffect(() => {
        // Get all the sliders
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.addEventListener('input', handleSliderChange);
        });
        return () => {
            // Remove event listeners when the component unmounts
            sliders.forEach(slider => {
                slider.removeEventListener('input', handleSliderChange);
            });
        };
    }, []);

    // Function to get the count for a key
    const getCountForKey = (key) => {
        switch (key) {
            case "Biblioteca":
                return 1;
            case "Eventi e spettacoli":
                return 1;
            case "Scuola":
                return 1;
            case "Struttura sanitaria":
                return 2;
            case "Area verde":
                return 1;
            case "Casa di quartiere":
                return 1;
            case "Area Ortiva":
                return 1;
            case "Pista Ciclopedonale":
                return 1;
            case "Rastrelliera bici":
                return 3;
            case "Servizio extrascolastico":
                return 1;
            case "Zona pedonale":
                return 1;
            case "Aree di parcheggio":
                return 4;
            case "Parcheggi dotati di colonnine elettriche":
                return 1;
            case "Sport e fitness":
                return 1;
            case "Risorse sociali":
                return 1;
            case "Fermate Tper":
                return 2;
            case "Area Wi-Fi":
                return 1;
            case "Stazione ferroviaria":
                return 1;
            default:
                return 0;
        }
    }

    // Function to handle the form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        // Get the form data
        const form = document.getElementById("survey-form");
        const formData = new FormData(form);
        // Convert form data to JSON
        const jsonData = {};
        // Iterate over the form data and add it to the JSON object
        for (let [key, value] of formData.entries()) {
            jsonData[key] = { value: parseInt(value, 10), count: getCountForKey(key) };
        }
        //console.log(jsonData); // Uncomment to see the JSON data

        // Send the JSON data to the backend
        fetch(hostName + '/data/api/survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })

        // Redirect to the map page with the JSON data as state
        navigate('/map', { state: jsonData });
        // Reset the form
        form.reset();
    }

    const retrieveLastPreferences = async () => {
        // Fetch the last preferences from the backend
        const response = await fetch(hostName + '/data/api/survey');
        const data = await response.json();
        // create a JSON object with the last preferences
        const jsonData = {};
        for (let key in data[0]) {
            if (key !== 'id') {
                jsonData[key] = { value: parseInt(data[0][key], 10), count: getCountForKey(key) };
            }
        }
        //console.log(jsonData); // Uncomment to see the JSON data
        // Redirect to the map page with the JSON data as state
        navigate('/map', { state: jsonData });
    }


    return (
        <div className="dropdown">
            <h1>Home Zone Analyzer</h1>
            <p>Questo questionario ti permetterà di esprimere la tua opinione riguardo le caratteristiche del tuo vicinato. Utilizza il pulsante per utilizzare le ultime preferenze inserite.</p>
            <button onClick={retrieveLastPreferences}>Recupera le ultime preferenze</button>
            <form id="survey-form" onSubmit={handleSubmit}>
                <label htmlFor="slider-Biblioteca">Quanto è importante la presenza di una biblioteca nel vicinato:</label>
                <input type="range" id="slider-Biblioteca" name="Biblioteca" min="0" max="5" defaultValue="0" />
                <span id="slider-Biblioteca-value">0</span>

                <label htmlFor="slider-EventiSpettacoli">Quanto è importante avere eventi o spettacoli regolari nel vicinato:</label>
                <input type="range" id="slider-EventiSpettacoli" name="Eventi e spettacoli" min="0" max="5" defaultValue="0" />
                <span id="slider-EventiSpettacoli-value">0</span>

                <label htmlFor="slider-Scuola">Quanto è importante la presenza di una scuola di buon livello nel vicinato:</label>
                <input type="range" id="slider-Scuola" name="Scuola" min="0" max="5" defaultValue="0" />
                <span id="slider-Scuola-value">0</span>

                <label htmlFor="slider-StrutturaSanitaria">Quanto è importante la presenza di almeno due strutture sanitarie nel vicinato:</label>
                <input type="range" id="slider-StrutturaSanitaria" name="Struttura sanitaria" min="0" max="5" defaultValue="0" />
                <span id="slider-StrutturaSanitaria-value">0</span>

                <label htmlFor="slider-AreaVerde">Quanto è importante la presenza di aree verdi nel vicinato:</label>
                <input type="range" id="slider-AreaVerde" name="Area verde" min="0" max="5" defaultValue="0" />
                <span id="slider-AreaVerde-value">0</span>

                <label htmlFor="slider-CasaDiQuartiere">Quanto è importante la presenza di una casa di quartiere nel vicinato:</label>
                <input type="range" id="slider-CasaDiQuartiere" name="Casa di quartiere" min="0" max="5" defaultValue="0" />
                <span id="slider-CasaDiQuartiere-value">0</span>

                <label htmlFor="slider-AreaOrtiva">Quanto è importante la presenza di un'area ortiva nel vicinato:</label>
                <input type="range" id="slider-AreaOrtiva" name="Area Ortiva" min="0" max="5" defaultValue="0" />
                <span id="slider-AreaOrtiva-value">0</span>

                <label htmlFor="slider-PistaCiclopedonale">Quanto è importante la presenza di una pista ciclopedonale nel vicinato:</label>
                <input type="range" id="slider-PistaCiclopedonale" name="Pista Ciclopedonale" min="0" max="5" defaultValue="0" />
                <span id="slider-PistaCiclopedonale-value">0</span>

                <label htmlFor="slider-RastrellieraBici">Quanto è importante la presenza di almeno tre rastrelliere per bici nel vicinato:</label>
                <input type="range" id="slider-RastrellieraBici" name="Rastrelliera bici" min="0" max="5" defaultValue="0" />
                <span id="slider-RastrellieraBici-value">0</span>

                <label htmlFor="slider-ServizioExtrascolastico">Quanto è importante la presenza di servizi extrascolastici nel vicinato:</label>
                <input type="range" id="slider-ServizioExtrascolastico" name="Servizio extrascolastico" min="0" max="5" defaultValue="0" />
                <span id="slider-ServizioExtrascolastico-value">0</span>

                <label htmlFor="slider-ZonaPedonale">Quanto è importante la presenza di zone pedonali nel vicinato:</label>
                <input type="range" id="slider-ZonaPedonale" name="Zona pedonale" min="0" max="5" defaultValue="0" />
                <span id="slider-ZonaPedonale-value">0</span>

                <label htmlFor="slider-AreeDiParcheggio">Quanto è importante la presenza di almeno quattro aree di parcheggio nel vicinato:</label>
                <input type="range" id="slider-AreeDiParcheggio" name="Aree di parcheggio" min="0" max="5" defaultValue="0" />
                <span id="slider-AreeDiParcheggio-value">0</span>

                <label htmlFor="slider-ParcheggiColonnineElettriche">Quanto è importante la presenza di parcheggi con colonnine elettriche nel vicinato:</label>
                <input type="range" id="slider-ParcheggiColonnineElettriche" name="Parcheggi dotati di colonnine elettriche" min="0" max="5" defaultValue="0" />
                <span id="slider-ParcheggiColonnineElettriche-value">0</span>

                <label htmlFor="slider-SportEFitness">Quanto è importante la presenza di strutture per sport e fitness nel vicinato:</label>
                <input type="range" id="slider-SportEFitness" name="Sport e fitness" min="0" max="5" defaultValue="0" />
                <span id="slider-SportEFitness-value">0</span>

                <label htmlFor="slider-RisorseSociali">Quanto è importante la presenza di risorse sociali nel vicinato:</label>
                <input type="range" id="slider-RisorseSociali" name="Risorse sociali" min="0" max="5" defaultValue="0" />
                <span id="slider-RisorseSociali-value">0</span>

                <label htmlFor="slider-FermateTper">Quanto è importante la presenza di almeno due fermate del trasporto pubblico (Tper) nel vicinato:</label>
                <input type="range" id="slider-FermateTper" name="Fermate Tper" min="0" max="5" defaultValue="0" />
                <span id="slider-FermateTper-value">0</span>

                <label htmlFor="slider-AreaWiFi">Quanto è importante la presenza di due aree Wi-Fi nel vicinato:</label>
                <input type="range" id="slider-AreaWiFi" name="Area Wi-Fi" min="0" max="5" defaultValue="0" />
                <span id="slider-AreaWiFi-value">0</span>

                <label htmlFor="slider-StazioneFerroviaria">Quanto è importante la presenza di una stazione ferroviaria nel vicinato:</label>
                <input type="range" id="slider-StazioneFerroviaria" name="Stazione ferroviaria" min="0" max="5" defaultValue="0" />
                <span id="slider-StazioneFerroviaria-value">0</span>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}
export default Menu;