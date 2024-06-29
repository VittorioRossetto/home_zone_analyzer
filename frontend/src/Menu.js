import React, { useEffect } from "react";

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
                <label htmlFor="slider-1">Quanto è importante una palestra nei dintorni:</label>
                <input type="range" id="slider-1" name="slider1" min="0" max="5" defaultValue="0" />
                <span id="slider-1-value">0</span>

                <label htmlFor="slider-2">Quanto è importante una chiesa nei dintorni:</label>
                <input type="range" id="slider-2" name="slider2" min="0" max="5" defaultValue="0" />
                <span id="slider-2-value">0</span>

                <label htmlFor="slider-3">Quanto è importante la presenza di una scuola:</label>
                <input type="range" id="slider-3" name="slider3" min="0" max="5" defaultValue="0" />
                <span id="slider-3-value">0</span>

                <label htmlFor="slider-4">Quanto è importante la presenza di un'università:</label>
                <input type="range" id="slider-4" name="slider4" min="0" max="5" defaultValue="0" />
                <span id="slider-4-value">0</span>

                <label htmlFor="slider-5">Quanto è importante la vicinanza all'ospedale:</label>
                <input type="range" id="slider-5" name="slider5" min="0" max="5" defaultValue="0" />
                <span id="slider-5-value">0</span>

                <label htmlFor="slider-6">Quanto è importante la presenza di almeno un parco:</label>
                <input type="range" id="slider-6" name="slider6" min="0" max="5" defaultValue="0" />
                <span id="slider-6-value">0</span>

                <label htmlFor="slider-7">Quanto è importante la presenza di un cinema:</label>
                <input type="range" id="slider-7" name="slider7" min="0" max="5" defaultValue="0" />
                <span id="slider-7-value">0</span>

                <label htmlFor="slider-8">Quanto è importante la presenza di almeno 2 fermate del bus:</label>
                <input type="range" id="slider-8" name="slider8" min="0" max="5" defaultValue="0" />
                <span id="slider-8-value">0</span>

                <label htmlFor="slider-9">Quanto è importante la presenza di un parcheggio:</label>
                <input type="range" id="slider-9" name="slider9" min="0" max="5" defaultValue="0" />
                <span id="slider-9-value">0</span>

                <label htmlFor="slider-10">Quanto è importante la vicinanza ad una stazione ferroviaria:</label>
                <input type="range" id="slider-10" name="slider10" min="0" max="5" defaultValue="0" />
                <span id="slider-10-value">0</span>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}
export default Menu;