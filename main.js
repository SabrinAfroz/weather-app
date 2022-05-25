const UI = {
    loadSelector() {
        const cityElm = document.querySelector('#city');
        const cityInfoElm = document.querySelector('#w-city');
        const iconElm = document.querySelector('#w-icon');
        const temperatureElm = document.querySelector('#w-temp');
        const pressureElm = document.querySelector('#w-pressure');
        const humidityElm = document.querySelector('#w-humidity');
        const feelElm = document.querySelector('#w-feel');
        const formElm = document.querySelector('#form');
        const countryElm = document.querySelector('#country');
        const messageElm = document.querySelector('.messageWrapper');

        return {
            cityElm,
            cityInfoElm,
            iconElm,
            temperatureElm,
            pressureElm,
            humidityElm,
            feelElm,
            formElm,
            countryElm,
            messageElm
        }
    },
    hideMessage() {
        const { messageElm } = this.loadSelector();
        setTimeout(() => {
            messageElm.innerHTML = ''
        }, 2000)
    },
    showMessage(msg) {
        const { messageElm } = this.loadSelector();
        const elm = `<div class='alert alert-danger'>${msg}</div>`
        messageElm.innerHTML = elm;
        this.hideMessage();
    },
    validationInput(city, country) {
        if (city === '' || country === '') {
            this.showMessage('please provide necessary information')
            return false;
        }
        return true;
    },
    getInput() {
        const { cityElm, countryElm } = this.loadSelector();
        const city = cityElm.value;
        const country = countryElm.value;

        //validation of input
        const isValided = this.validationInput(city, country);
        return {
            city,
            country,
            isValided
        };
    },
    clearInput() {
        const { cityElm, countryElm } = this.loadSelector();
        cityElm.value = '';
        countryElm.value = '';

    },
    getIcon(iconCode) {
        return 'https://openweathermap.org/img/w/' + iconCode + '.png';
    },
    async getAndPopulateUI() {

        //load data from locakStorage
        const { city, country } = storage.getData();
        //setting to weatherData and calling API
        weatherData.city = city;
        weatherData.country = country;

        //calling API
        const data = await weatherData.getData();

        //populate to UI

        this.populatedUI(data);
    },
    populatedUI(data) {
        const {
            iconElm,
            cityInfoElm,
            temperatureElm,
            pressureElm,
            humidityElm,
            feelElm,
            formElm
        } = this.loadSelector();

        const { weather, main, name: cityName } = data;
        const url = this.getIcon(weather[0].icon);
        cityInfoElm.textContent = cityName;
        temperatureElm.textContent = `Temperature: ${main.temp}c`;
        pressureElm.textContent = `Pressure: ${main.pressure}Kpa`;
        humidityElm.textContent = `Humidity: ${main.humidity}`;
        feelElm.textContent = weather[0].main;

        iconElm.setAttribute('src', url);

        console.log(data);
    },
    init() {
        const { formElm } = this.loadSelector();
        formElm.addEventListener('submit', async e => {
                e.preventDefault();
                const { city, country, isValided } = this.getInput();
                this.clearInput();
                if (isValided) {
                    weatherData.city = city;
                    weatherData.country = country;

                    //saving data to local storage
                    storage.city = city;
                    storage.country = country;
                    //saving to local storage
                    storage.saveData();
                    //getting data from api
                    const data = await weatherData.getData();
                    //populated data
                    if (data) {
                        this.populatedUI(data);
                    }

                }
            })
            // window.addEventListener('DOMContentLoaded', UI.getAndPopulateUI.bind(UI));
        window.addEventListener('DOMContentLoaded', this.getAndPopulateUI.bind(this));
    }
}

UI.init();

// temp data store and dealing
const weatherData = {
    city: '',
    country: '',
    APP_ID: '4f6cc5bcddd1696fe34a6a0ae94a4395',
    async getData() {
        //requesting data from server
        try {
            const res = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${this.city},${this.country}&units=metric&appid=${this.APP_ID}`);

            const data = await res.json();
            if (data.cod >= 400) {
                //error
                UI.showMessage(data.message);
                return false;
            } else {
                console.log(data);
                return data;
            }


        } catch (err) {
            UI.showMessage('problem in finding weather');
            //console.log('problem finding in weather');
        }

    }
}


const storage = {
    city: '',
    country: '',
    saveData() {
        localStorage.setItem('BD_WEATHER_CITY', this.city);
        localStorage.setItem('BD_WEATHER_COUNTRY', this.country);
    },
    getData() {
        const city = localStorage.getItem('BD_WEATHER_CITY') || 'Dhaka';
        const country = localStorage.getItem('BD_WEATHER_COUNTRY') || 'BD';
        return { city, country };
    }
}