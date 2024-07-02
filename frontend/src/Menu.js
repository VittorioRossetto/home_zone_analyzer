import React, { useEffect } from "react";
import './css/survey.css';

const Menu = () => {

    const handleSliderChange = (event) => {
        const sliderId = event.target.id;
        const sliderValue = event.target.value;
        const valueElement = document.getElementById(`${sliderId}-value`);
        valueElement.textContent = sliderValue;
    }

    useEffect(() => {
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.addEventListener('input', handleSliderChange);
        });
        return () => {
            sliders.forEach(slider => {
                slider.removeEventListener('input', handleSliderChange);
            });
        };
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Get the form data
        const form = document.getElementById("survey-form");
        const formData = new FormData(form);
        // Convert form data to JSON
        const jsonData = {};
        for (let [key, value] of formData.entries()) {
            jsonData[key] = value;
        }
        // Do something with the JSON data
        console.log(jsonData);
        // Reset the form
        form.reset();
    }


    return (
        <div className="dropdown">
            <form id="survey-form" onSubmit={handleSubmit}>
                <label htmlFor="slider-1">Quanto è importante la presenza di una biblioteca nel vicinato:</label>
                <input type="range" id="slider-1" name="slider1" min="0" max="5" defaultValue="0" />
                <span id="slider-1-value">0</span>

                <label htmlFor="slider-2">Quanto è importante la presenza di almeno un museo o galleria nel vicinato:</label>
                <input type="range" id="slider-2" name="slider2" min="0" max="5" defaultValue="0" />
                <span id="slider-2-value">0</span>

                <label htmlFor="slider-3">Quanto è importante avere eventi o spettacoli regolari nel vicinato:</label>
                <input type="range" id="slider-3" name="slider3" min="0" max="5" defaultValue="0" />
                <span id="slider-3-value">0</span>

                <label htmlFor="slider-4">Quanto è importante la presenza di una scuola di buon livello nel vicinato:</label>
                <input type="range" id="slider-4" name="slider4" min="0" max="5" defaultValue="0" />
                <span id="slider-4-value">0</span>

                <label htmlFor="slider-5">Quanto è importante la presenza di una struttura sanitaria nel vicinato:</label>
                <input type="range" id="slider-5" name="slider5" min="0" max="5" defaultValue="0" />
                <span id="slider-5-value">0</span>

                <label htmlFor="slider-6">Quanto è importante la presenza di aree verdi nel vicinato:</label>
                <input type="range" id="slider-6" name="slider6" min="0" max="5" defaultValue="0" />
                <span id="slider-6-value">0</span>

                <label htmlFor="slider-7">Quanto è importante la presenza di una casa di quartiere nel vicinato:</label>
                <input type="range" id="slider-7" name="slider7" min="0" max="5" defaultValue="0" />
                <span id="slider-7-value">0</span>

                <label htmlFor="slider-8">Quanto è importante la presenza di un'area ortiva nel vicinato:</label>
                <input type="range" id="slider-8" name="slider8" min="0" max="5" defaultValue="0" />
                <span id="slider-8-value">0</span>

                <label htmlFor="slider-9">Quanto è importante la presenza di una pista ciclopedonale nel vicinato:</label>
                <input type="range" id="slider-9" name="slider9" min="0" max="5" defaultValue="0" />
                <span id="slider-9-value">0</span>

                <label htmlFor="slider-10">Quanto è importante la presenza di rastrelliere per bici nel vicinato:</label>
                <input type="range" id="slider-10" name="slider10" min="0" max="5" defaultValue="0" />
                <span id="slider-10-value">0</span>

                <label htmlFor="slider-11">Quanto è importante la presenza di servizi extrascolastici nel vicinato:</label>
                <input type="range" id="slider-11" name="slider11" min="0" max="5" defaultValue="0" />
                <span id="slider-11-value">0</span>

                <label htmlFor="slider-12">Quanto è importante la presenza di zone pedonali nel vicinato:</label>
                <input type="range" id="slider-12" name="slider12" min="0" max="5" defaultValue="0" />
                <span id="slider-12-value">0</span>

                <label htmlFor="slider-13">Quanto è importante la presenza di aree di parcheggio nel vicinato:</label>
                <input type="range" id="slider-13" name="slider13" min="0" max="5" defaultValue="0" />
                <span id="slider-13-value">0</span>

                <label htmlFor="slider-14">Quanto è importante la presenza di parcheggi con colonnine elettriche nel vicinato:</label>
                <input type="range" id="slider-14" name="slider14" min="0" max="5" defaultValue="0" />
                <span id="slider-14-value">0</span>

                <label htmlFor="slider-15">Quanto è importante la presenza di strutture per sport e fitness nel vicinato:</label>
                <input type="range" id="slider-15" name="slider15" min="0" max="5" defaultValue="0" />
                <span id="slider-15-value">0</span>

                <label htmlFor="slider-16">Quanto è importante la presenza di risorse sociali nel vicinato:</label>
                <input type="range" id="slider-16" name="slider16" min="0" max="5" defaultValue="0" />
                <span id="slider-16-value">0</span>

                <label htmlFor="slider-17">Quanto è importante la presenza di fermate del trasporto pubblico (Tper) nel vicinato:</label>
                <input type="range" id="slider-17" name="slider17" min="0" max="5" defaultValue="0" />
                <span id="slider-17-value">0</span>

                <label htmlFor="slider-18">Quanto è importante la presenza di aree Wi-Fi nel vicinato:</label>
                <input type="range" id="slider-18" name="slider18" min="0" max="5" defaultValue="0" />
                <span id="slider-18-value">0</span>

                <label htmlFor="slider-19">Quanto è importante la presenza di una stazione ferroviaria nel vicinato:</label>
                <input type="range" id="slider-19" name="slider19" min="0" max="5" defaultValue="0" />
                <span id="slider-19-value">0</span>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}
export default Menu;