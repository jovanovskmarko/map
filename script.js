'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    
    constructor(coords, distance, duration) {
        this.distance = distance 
        this.duration = duration
        this.coords = coords;
        this.id = (Date.now() + '').slice(-10);
        this.date = new Date();
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
            months[this.date.getMonth()]
          } ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence;   
        this.calcPace();
        this.type = 'running'
        this._setDescription();
    }

    calcPace() {
        this.pace = this.distance / this.duration;
    }
}

class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain;
        this.calcSpeed()
        this.type = 'cycling'
        this._setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
    }
}

class App {
    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        this._getPosition();

        inputType.addEventListener('change', this._toggleElevationField.bind(this))
        form.addEventListener('submit', this._newWorkout.bind(this))
    }

    renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map)
                    .bindPopup(L.popup({
                        maxWidth:250,
                        maxHeight:100,
                        autoClose: false,
                        closeOnClick: false,
                        className: `${workout.type}-popup`
                    }))
                    .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
                    .openPopup();
    }

    _newWorkout(e) {
        const validInputs = function(...inputs) {
            return inputs.every(function(inp) {
                return Number.isFinite(inp)
            })
        }

        const checkPositive = function(...inputs) {
            return inputs.every(function(inp) {
                return inp > 0
            })
        }
            e.preventDefault();
            const {lat, lng} = this.#mapEvent.latlng;
            
            

            // Get data from form
            const type = inputType.value;
            const distance = +inputDistance.value;
            const duration = +inputDuration.value;
            
            

            // Create workout object depending on the type
            let workout;
            if(type === 'running') {
                const cadence = +inputCadence.value;
                // Check if data is valid 
            
                if(!validInputs(distance, duration, cadence) || !checkPositive(distance, duration, cadence))
                
                    return alert('Inputs have to be positive numbers');
                
                workout = new Running([lat, lng], distance, duration, cadence)
            }

            if(type === 'cycling') {
                const elevationGain = +inputElevation.value;

                if(!validInputs(distance, duration, elevationGain) || !checkPositive(distance, duration)) 
                    return alert('Inputs have to be positive numbers');
                const coords = [lat, lng]
                workout = new Cycling(coords, distance, duration, elevationGain)
            }

            // Add new object to workout array
            
            this.#workouts.push(workout);
            
            // Render workout on map as marker  
            
            inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value =  ''
            
            this.renderWorkoutMarker(workout)

            this._renderWorkout(workout);
    }

    _toggleElevationField() {
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _loadMap(position) {

            const {latitude} = position.coords;
            const {longitude} = position.coords;
    
            const coords = [latitude, longitude];
    
            this.#map = L.map('map').setView(coords, 13);
    
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
  
            this.#map.on('click', this._showForm.bind(this), 
                
            function() {
                alert("Could not get your position");
            })
    }
    

    _getPosition() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this))
        }
    }

    _showForm(mapE) {
            this.#mapEvent = mapE;
            form.classList.remove('hidden')
            inputDistance.focus()
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `
        if(workout.type === 'running') {
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence.toFixed(1)}</span>
                <span class="workout__unit">spm</span>
            </div>
        </li>
            `
        }

        if(workout.type === 'cycling') {
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain.toFixed(1)}</span>
                <span class="workout__unit">m</span>
            </div>
        </li>
            `
        }

        form.insertAdjacentHTML('afterend', html);
    }
}

const app = new App();
