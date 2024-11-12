const api_key = 'f5e1c92f28242bbb2b9bdbd3e9582c45';
let on_Celsius = true;

const city_input = document.getElementById('city-input');
const city_name = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const wind_speed = document.getElementById('wind-speed');
const weather_img = document.getElementById('weather-icon');
const forecast_block = document.getElementById('forecast-id');
const suggestions = document.getElementById('suggestions-list');


async function fetch_weather_data() {
    const city = city_input.value;
    if (!city) return;

    const units = on_Celsius ? 'metric' : 'imperial';
    try{
        const response  = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${api_key}`);
        const data = await response.json();
        if(data.cod === 200){
            current_weather_show(data);
            fetch_forecast(data.coord.lat, data.coord.lon);
            suggestions.innerHTML = '';
        } else{
            alert(data.message);
        }
    } catch (error) {
        console.error('There is error in fetching weather', error);
      }
}

function current_weather_show(data){
    city_name.innerText = data.name;
    temperature.innerText = `Temperature: ${data.main.temp}°${on_Celsius ?  'C' : 'F'}`;
    humidity.innerText = `Humidity: ${data.main.humidity}%`;
    wind_speed.innerText = `Wind Speed: ${data.wind.speed} ${on_Celsius ? 'm/s' : 'mph'}`;
    weather_img.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

async function fetch_forecast(lat, lon) {
    const units = on_Celsius ? 'metric' : 'imperial';
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${api_key}`);
        const data = await response.json();
        forecast_display(data.list);
    } 
    catch (error) {
        console.error('There is error in fetching forecast:', error);
      }
}

function forecast_display(forecast_info){
    forecast_block.innerHTML = '';
    const daily_forecast = forecast_info.filter((reading) => reading.dt_txt.includes('12:00:00'));

    daily_forecast.slice(0, 5).forEach(day => {
        const forecast_item = document.createElement('div');
        forecast_item.classList.add('forecast-item');
        forecast_item.innerHTML = `
          <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Icon">
          <p>High: ${day.main.temp_max}°${on_Celsius ? 'C' : 'F'}</p>
          <p>Low: ${day.main.temp_min}°${on_Celsius ? 'C' : 'F'}</p>
        `;
        forecast_block.appendChild(forecast_item);
      });
}

function receive_location(){
  city_input.value = '';
    navigator.geolocation.getCurrentPosition(async (location) => {
        const { latitude, longitude } = location.coords;
        const units = on_Celsius ? 'metric' : 'imperial';
        try {
          const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${api_key}`);
          const data = await response.json();
          current_weather_show(data);
          fetch_forecast(latitude, longitude);
        } catch (error) {
          console.error('There is error in fetching location weather:', error);
        }
      });
}

function change_temperature_func() {
    on_Celsius = !on_Celsius;
    fetch_weather_data();
  } //switching units func

  async function suggestion_menu_func() {
    const query = city_input.value;
    const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${api_key}`);
    const cities_list = await response.json();
  
    suggestions.innerHTML = '';
  
    cities_list.forEach(city => {
      const suggestion_item = document.createElement('li');
      suggestion_item.innerText = `${city.name}, ${city.country}`;
      suggestion_item.onclick = () => {
        city_input.value = `${city.name}`;
        suggestions.innerHTML = '';
        fetch_weather_data();
      };
      suggestions.appendChild(suggestion_item);
    });
  }


