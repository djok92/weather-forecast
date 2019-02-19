const eventHub = new Vue();

Vue.component('weather-error', {
    props: ['error'],
    template:   `<div class="notification is-danger" v-show="error">
                    <button class="delete" @click="$emit('reseterror');"></button>
                    <p>{{error}}</p>
                </div>`
})

Vue.component('weather-response-current', {
    props: ['weatherData'],
    template:   `<div class="columns" v-show="weatherData.sunriseTime">
                    <div class="column is-half">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <th>Temperature</th>
                                    <td>{{ temperature }}</td>
                                </tr>
                                <tr>
                                    <th>Conditions</th>
                                    <td>{{ weatherData.conditions }}</td>
                                </tr>
                                <tr>
                                    <th>Air Pressure</th>
                                    <td>{{ airPressure }}</td>
                                </tr>
                                <tr>
                                    <th>Humidity</th>
                                    <td>{{ humidity }}</td>
                                </tr>
                                <tr>
                                    <th>Wind direction</th>
                                    <td>{{ windDirection }}</td>
                                </tr>
                                <tr>
                                    <th>Wind speed</th>
                                    <td>{{ windSpeed }}</td>
                                </tr>
                                <tr>
                                    <th>Sunrise time</th>
                                    <td>{{ sunriseTime }}</td>
                                </tr>
                                <tr>
                                    <th>Sunset time</th>
                                    <td>{{ sunsetTime }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="column is-half">
                        <div id="map">
                            <figure>
                                <img :src="imgSrc">
                            </figure>
                        </div>
                    </div>
                </div>`,
    computed: {
        temperature: function () {
            return Math.round(+this.weatherData.temperature) + String.fromCharCode(186) + 'C';
        },
        airPressure: function () {
            return Math.round(+this.weatherData.airPressure) + 'hPa';
        },
        humidity: function () {
            return Math.round(+this.weatherData.humidity) + '%';
        },
        windSpeed: function () {
            return Math.round(+this.weatherData.windSpeed) + 'm/s';
        },
        windDirection: function () {
            return Math.round(+this.weatherData.windDirection) + String.fromCharCode(186);
        },
        sunriseTime: function () {
            return new Date(this.weatherData.sunriseTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
        },
        sunsetTime: function () {
            return new Date(this.weatherData.sunsetTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
        },
        imgSrc: function() {
            return this.weatherData.map
        }
    },
});

Vue.component('weather-response-forecast', {
    props: ['weatherDataForecast'],
    template:   `<div>
                    <div class="tabs is-toggle">
                        <ul>
                            <li class="tab-element" v-for="(itemDate,key) in allDates" :key="itemDate.id" :class="{\'is-active\' : !key}" @click="tabChange($event)" :data-numord="key">
                                <a><span>{{ itemDate }}</span></a>
                            </li>
                        </ul>
                    </div>
                    <table id="text-center-table" class="table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Temperature</th>
                                <th>Conditions</th>
                                <th>Air Pressure</th>
                                <th>Humidity</th>
                                <th>Wind Speed</th>
                                <th>Wind Direction</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in sdf[activeTab]">
                                <th>{{ item.dt_txt }}</th>
                                <td>
                                    {{ Math.round(+item.main.temp) + String.fromCharCode(186) + 'C'  }}
                                    <figure>
                                        <img class="image-display" :src="\'http://openweathermap.org/img/w/\' + item.weather[0].icon + \'.png\'" :alt="item.weather[0].description"/>
                                    </figure>
                                </td>
                                <td>{{ item.weather[0].description }}</td>
                                <td>{{ Math.round(+item.main.pressure) + 'hPa'}}</td>
                                <td>{{ Math.round(+item.main.humidity) + '%' }}</td>
                                <td>{{ Math.round(+item.wind.speed) + 'm/s' }}</td>
                                <td>{{ Math.round(+item.wind.deg) + String.fromCharCode(186) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>`,
    data() {
        return {
            activeTab: 0,
            sdf: null,
        }
    },
    methods: {
        tabChange: function (elem) {
            const elems = document.getElementsByClassName('tab-element');
            elems[this.activeTab].classList.remove('is-active');
            this.activeTab = elem.currentTarget.getAttribute('data-numord');
            elem.currentTarget.classList.add('is-active');
        }
    },

    computed: {
        allDates: function() {
            const list = [];

            for(i=0;i<this.weatherDataForecast.length;i++) {
                list.push((this.weatherDataForecast[i].dt_txt.split(' '))[0]);
            }

            const filteredDates = list.filter(function(item, pos){
                return list.indexOf(item) == pos;
            });

            return filteredDates;
        },
    },

    created() {
        const n = this.allDates.length;
        const filteredWeatherByDate = [];
        for(i=0;i<n;i++) {
             const tmp = this.weatherDataForecast.filter(item => {
                return (item.dt_txt.split(' '))[0] == this.allDates[i];
            });
            filteredWeatherByDate.push(tmp);
        }

        this.sdf = filteredWeatherByDate;
        console.log(this.sdf)
    }
})

Vue.component('form-weather', {
    props: ['numOfDays'],
    template:   `<div class="wrapper">
                    <h1 class="title" v-if="numOfDays === 1">Trenutna Vremenska Prognoza</h1>
                    <h1 class="title" v-else-if="numOfDays === 5">Vremenska Prognoza Za 5 Dana</h1>
                    <div class="form-wrappear box">
                        <div class="columns">
                            <div class="column is-three-fifths">
                                <figure class="image">
                                    <img src="img/voditeljka.jpg">
                                </figure>
                            </div>
                            <div class="column is-two-fifths">
                                <div class="field">
                                    <div class="field-body">
                                        <div class="field">
                                            <label class="label">City</label>
                                            <div class="control">
                                                <input type="text" class="input" placeholder="Please enter city" v-model="city">
                                            </div>
                                        </div>
                                        <div class="field">
                                            <label class="label">Country</label>
                                            <div class="control">
                                                <input type="text" class="input" placeholder="Please enter country" v-model="country">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="field is-grouped">
                                    <div class="control">
                                        <button id="searchBtn" class="button is-primary" @click="makeRequest">Search</button>
                                    </div>
                                    <div class="control">
                                        <button id="clearBtn" class="button is-text" @click="clearForm">Clear form</button>
                                    </div>
                                </div>
                                <weather-error v-bind:error="err" @reseterror="resetError"></weather-error>
                                <weather-response-current v-if="(showTable && numOfDays === 1)" v-bind:weatherData="weatherData"></weather-response-current>
                                <weather-response-forecast v-if="(showTable && numOfDays === 5)" v-bind:weatherDataForecast="weatherDataForecast"></weather-response-forecast>
                            </div>
                        </div>
                    </div>
                </div>`,
    data() {
        return {
            city: '',
            country: '',
            showTable: '',
            err: '',
            weatherData: {
                temperature: '',
                conditions: '',
                airPressure: '',
                humidity: '',
                windDirection: '',
                windSpeed: '',
                sunriseTime: '',
                sunsetTime: '',
                latitude: '',
                longitude: '',
                map: ''
            },
            weatherDataForecast: null
        }
    },

    methods: {
        
        makeRequest: function() {
            this.clearData();
            this.resetError();

            if(this.formValidation()) {
                let weatherReportType;

                if(this.numOfDays === 1) {
                    weatherReportType = 'weather'
                } else {
                    weatherReportType = 'forecast'
                }
    
                const weatherUrl = `http://api.openweathermap.org/data/2.5/${weatherReportType}?q=${encodeURI(this.city)},${encodeURI(this.country)}&lang=hr&units=metric&appid=1384eff7759c6a754d37878aaa944cdb`;
                axios.get(weatherUrl)
                    .then(res => {
                        if(weatherReportType === 'weather') {
                            this.weatherData.temperature = res.data.main.temp;
                            this.weatherData.conditions = res.data.weather[0].main;
                            this.weatherData.airPressure = res.data.main.pressure;
                            this.weatherData.humidity = res.data.main.humidity;
                            this.weatherData.windDirection = res.data.wind.deg;
                            this.weatherData.windSpeed = res.data.wind.speed;
                            this.weatherData.latitude = res.data.coord.lat;
                            this.weatherData.longitude = res.data.coord.lon;
                            this.weatherData.sunriseTime = res.data.sys.sunrise;
                            this.weatherData.sunsetTime = res.data.sys.sunset;
                            this.showTable = true;
                            this.weatherData.map = `https://www.mapquestapi.com/staticmap/v5/map?key=fvBPkCf742T3gS1F755wgbrqjmOxfNcv&locations=${this.city}&zoom=10&type=hyb&size=600,400@2x`
                        } else {
                            this.weatherDataForecast = res.data.list;
                            this.showTable = true;
                        } 
                    }).catch( () => {
                       this.err = 'The data you have entered is not valid! City name must be in English!'
                    }); 
            }   
        },

        formValidation: function() {
            if(this.city === '' || this.country === '') {
                this.err = 'Please check all input fields!';
                return false
            } else {
                return true;
            }
        },

        clearData: function() {
            this.temperature = '',
            this.conditions = '',
            this.airPressure = '',
            this.humidity = '',
            this.windDirection = '',
            this.windSpeed = '',
            this.sunriseTime = '',
            this.sunsetTime = '',
            this.latitude = '',
            this.longitude = '',
            this.map =  '',
            this.showTable = false;
        },
        
        clearForm: function() {
            this.city = '',
            this.country = '',
            this.showTable = false;
            this.resetError();
            this.clearData();
        },

        resetError: function() {
            this.err = ''
        }
    }
})

const homePage = {
    template:   `<div class="content">
                    <h1 class="title">Welcome to weather app!</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan, metus ultrices eleifend gravida, nulla nunc varius lectus, nec rutrum justo nibh eu lectus. Ut vulputate semper dui. Fusce erat odio, sollicitudin vel erat vel, interdum mattis neque. Subscript works as well!</p>
                    <h2>Second level</h2>
                    <p>Curabitur accumsan turpis pharetra augue tincidunt blandit. Quisque condimentum maximus mi, sit amet commodo arcu rutrum id. Proin pretium urna vel cursus venenatis. Suspendisse potenti. Etiam mattis sem rhoncus lacus dapibus facilisis. Donec at dignissim dui. Ut et neque nisl.</p>
                    <ul>
                        <li>In fermentum leo eu lectus mollis, quis dictum mi aliquet.</li>
                        <li>Morbi eu nulla lobortis, lobortis est in, fringilla felis.</li>
                        <li>Aliquam nec felis in sapien venenatis viverra fermentum nec lectus.</li>
                        <li>Ut non enim metus.</li>
                    </ul>
                    <h3>Third level</h3>
                    <p>Quisque ante lacus, malesuada ac auctor vitae, congue non ante. Phasellus lacus ex, semper ac tortor nec, fringilla condimentum orci. Fusce eu rutrum tellus.</p>
                    <ol>
                        <li>Donec blandit a lorem id convallis.</li>
                        <li>Cras gravida arcu at diam gravida gravida.</li>
                        <li>Integer in volutpat libero</li>
                        <li>Donec a diam tellus</li>
                        <li>Aenean nec tortor orci</li>
                        <li>Quisque aliquam cursus urna, non bibendum massa viverra eget.</li>
                        <li>Vivamus maximus ultricies pulvinar.</li>
                    </ol>
                    <blockquote>Ut venenatis, nisl scelerisque sollicitudin fermentum, quam libero hendrerit ipsum, ut blandit est tellus sit amet turpis.</blockquote>
                    <p>Quisque at semper enim, eu hendrerit odio. Etiam auctor nisl et justo sodales elementum. Maecenas ultrices lacus quis neque consectetur, et lobortis nisi molestie.</p>
                    <p>Sed sagittis enim ac tortor maximus rutrum. Nulla facilisi. Donec mattis vulputate risus in luctus. Maecenas vestibulum interdum commodo.</p>
                    <dl>
                        <dt>Web</dt>
                        <dd>The part of the Internet that contains websites and web pages</dd>
                        <dt>HTML</dt>
                        <dd>A markup language for creating web pages</dd>
                        <dt>CSS</dt>
                        <dd>A technology to make HTML look better
                        Suspendisse egestas sapien non felis placerat elementum. Morbi tortor nis</dd>
                    </dl>
                    <h4>Fourth level</h4>
                    <p>Nulla efficitur eleifend nisi, sit amet bibendum sapien fringilla ac. Mauris euismod metus a tellus laoreet, at elementum ex efficitur.</p>
                </div>`
}

const errorPage = {
    template:   `<h1>Sorry this page doesn't exist!</h1>`
}

const currentForecast = {
    template:   `<form-weather v-bind:numOfDays="numOfDays"></form-weather>`,
    data() {
        return {
            numOfDays: 1
        }
    }
}

const fiveDaysForecast = {
    template:   `<form-weather v-bind:numOfDays="numOfDays"></form-weather>`,
    data() {
        return {
            numOfDays: 5
        }
    }
}

const router = new VueRouter({
    routes: [
        {
            path: '*',
            component: errorPage
        },

        {
            path: '/404',
            component: errorPage
        },

        {
            path: '/',
            component: homePage
        },

        {
            path: '/home',
            component: homePage
        },

        {
            path: '/currentForecast',
            component: currentForecast
        },

        {
            path: '/forNextFiveDays',
            component: fiveDaysForecast
        }
    ]
})

new Vue({
    router: router,
    el: '#root',
    data: {

    }
})
