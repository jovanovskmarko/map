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
    
    constructor(distance, duration, coords) {
        this.distance = distance 
        this.duration = duration
        this.coords = coords;
    
        this.id = (Date.now() + '').slice(-10);
        this.date = new Date();
    }
}

class Running extends Workout {
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords)
        this.cadence = cadence;   
        this.calcPace();
    }

    calcPace() {
        this.pace = this.distance / this.duration;
    }
}

class Cycling extends Workout {
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords)
        this.elevationGain = elevationGain;
        this.calcSpeed()
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
    }
}

class App {
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();

        inputType.addEventListener('change', this._toggleElevationField.bind(this))
        form.addEventListener('submit', this._newWorkout.bind(this))
    }

    _newWorkout(e) {
            e.preventDefault();
            inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value =  ''
            const {lat, lng} = this.#mapEvent.latlng;
                    
                    L.marker([lat, lng]).addTo(this.#map)
                    .bindPopup(L.popup({
                        maxWidth:250,
                        maxHeight:100,
                        autoClose: false,
                        closeOnClick: false,
                        className: 'running-popup'
                    }))
                    .setPopupContent('Workout')
                    .openPopup();
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
}

const app = new App();
const workout = new Workout(1,2,3)
const run = new Running(1,2,[3,5],2)
const cyc = new Cycling(1,2,[3,5],2)
console.log(run)
console.log(cyc)