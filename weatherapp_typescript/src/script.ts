document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = '7eee75504cd31459d48bf17c8c8f3b59';

    const button = document.querySelector(".search-btn") as HTMLButtonElement;
    const cityElement = document.querySelector(".city-name") as HTMLElement;
    const forecastContainer = document.querySelector(".forecast-container") as HTMLElement;
    const weatherIcon = document.querySelector(".weather-icon-img") as HTMLImageElement;
    const temperatureElement = document.querySelector(".temp-value") as HTMLElement;
    const weatherDescElement = document.querySelector(".weather-desc") as HTMLElement;
    const minMaxElement = document.querySelector(".max-min") as HTMLElement;
    const historyList = document.querySelector(".history-list") as HTMLElement;
    const container = document.querySelector(".container") as HTMLElement;
    const spinnerContainer = document.querySelector(".spinner-container") as HTMLElement;

    function showSpinner(): void {
        if (spinnerContainer && container) {
            spinnerContainer.style.display = "flex";
            container.style.display = "none";
        }
    }

    function hideSpinner(): void {
        if (spinnerContainer && container) {
            spinnerContainer.style.display = "none";
            container.style.display = "flex";
        }
    }

    async function fetchWeather(city: string): Promise<void> {
        const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;

        try {
            showSpinner();
            const response = await fetch(FORECAST_URL);
            if (!response.ok) {
                throw new Error('City not found');
            }
            const data = await response.json();
            console.log(data);
            updateWeather(data);
            updateHistory(city, data.list[0].main.temp.toFixed(1), data.list[0].weather[0].main);
        } catch (error) {
            console.error('Error fetching weather data:', (error as Error).message);
            alert('City not found. Please enter a valid city name.');
        } finally {
            hideSpinner();
        }
    }

    function updateWeather(data: any): void {
        if (cityElement) {
            cityElement.textContent = data.city.name;
        }

        if (data.list && data.list.length > 0) {
            const weatherCondition = data.list[0].weather[0].main;
            updateWeatherIcon(weatherCondition);
        }

        if (temperatureElement && data.list && data.list.length > 0) {
            temperatureElement.textContent = `${data.list[0].main.temp.toFixed(1)}`;
        }

        if (weatherDescElement && data.list && data.list.length > 0) {
            weatherDescElement.textContent = data.list[0].weather[0].description;
        }

        if (minMaxElement && data.list && data.list.length > 0) {
            const minTemp = data.list[0].main.temp_min.toFixed(1);
            const maxTemp = data.list[0].main.temp_max.toFixed(1);
            minMaxElement.textContent = `Min: ${minTemp}°C Max: ${maxTemp}°C`;
        }

        const upcomingForecastContainer = document.querySelector(".upcoming-forecast") as HTMLElement;
        if (upcomingForecastContainer) {
            upcomingForecastContainer.innerHTML = '';

            const forecastList = data.list.slice(1, 4);

            forecastList.forEach((forecast: any) => {
                const forecastItem = document.createElement('div');
                forecastItem.classList.add('forecast-card');

                const date = new Date(forecast.dt * 1000);
                const dateString = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });

                const iconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

                forecastItem.innerHTML = `
                    <div class="forecast-item">
                        <img src="${iconUrl}" alt="${forecast.weather[0].description}" class="forecast-icon">
                        <p class="temp">${forecast.main.temp.toFixed(1)}°C</p>
                        <p class="time">${dateString}</p>
                    </div>
                `;

                upcomingForecastContainer.appendChild(forecastItem);
            });
        }
    }

    function updateWeatherIcon(weatherCondition: string): void {
        if (weatherIcon) {
            switch (weatherCondition) {
                case "Haze":
                    weatherIcon.src = './images/mist.png';
                    break;
                case "Clouds":
                    weatherIcon.src = './images/clouds.png';
                    break;
                case "Clear":
                    weatherIcon.src = './images/clear.png';
                    break;
                case "Drizzle":
                    weatherIcon.src = './images/drizzle.png';
                    break;
                case "Mist":
                    weatherIcon.src = './images/mist.png';
                    break;
                case "Rain":
                    weatherIcon.src = './images/rain.png';
                    break;
                case "Snow":
                    weatherIcon.src = './images/snow.png';
                    break;
                default:
                    weatherIcon.src = './images/clear.png';
                    break;
            }
        }
    }

    function updateHistory(city: string, temp: string, weatherCondition: string): void {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        
        let iconSrc: string;
        switch (weatherCondition) {
            case "Haze":
                iconSrc = './images/mist.png';
                break;
            case "Clouds":
                iconSrc = './images/clouds.png';
                break;
            case "Clear":
                iconSrc = './images/clear.png';
                break;
            case "Drizzle":
                iconSrc = './images/drizzle.png';
                break;
            case "Mist":
                iconSrc = './images/mist.png';
                break;
            case "Rain":
                iconSrc = './images/rain.png';
                break;
            case "Snow":
                iconSrc = './images/snow.png';
                break;
            default:
                iconSrc = './images/clear.png';
                break;
        }

        historyItem.innerHTML = `
            <span class="history-city">${city}</span>
            <span class="history-temp-icon">
                <span>${temp}°C</span>
                <img src="${iconSrc}" alt="${weatherCondition}" class="history-icon">
            </span>
        `;

        historyItem.addEventListener("click", () => {
            fetchWeather(city);
        });

        if (historyList.childElementCount >= 5) {
            if (historyList.lastChild) {
                historyList.removeChild(historyList.lastChild);
            }
        }

        historyList.insertBefore(historyItem, historyList.firstChild);

        const historyData = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
        historyData.unshift({ city, temp, weatherCondition });
        if (historyData.length > 5) {
            historyData.pop();
        }
        localStorage.setItem('weatherHistory', JSON.stringify(historyData));
    }

    function loadHistory(): void {
        const historyData = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
        historyData.forEach((item: { city: string; temp: string; weatherCondition: string; }) => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            
            let iconSrc: string;
            switch (item.weatherCondition) {
                case "Haze":
                    iconSrc = './images/mist.png';
                    break;
                case "Clouds":
                    iconSrc = './images/clouds.png';
                    break;
                case "Clear":
                    iconSrc = './images/clear.png';
                    break;
                case "Drizzle":
                    iconSrc = './images/drizzle.png';
                    break;
                case "Mist":
                    iconSrc = './images/mist.png';
                    break;
                case "Rain":
                    iconSrc = './images/rain.png';
                    break;
                case "Snow":
                    iconSrc = './images/snow.png';
                    break;
                default:
                    iconSrc = './images/clear.png';
                    break;
            }

            historyItem.innerHTML = `
                <span class="history-city">${item.city}</span>
                <span class="history-temp-icon">
                    <span>${item.temp}°C</span>
                    <img src="${iconSrc}" alt="${item.weatherCondition}" class="history-icon">
                </span>
            `;

            historyItem.addEventListener("click", () => {
                fetchWeather(item.city);
            });

            historyList.appendChild(historyItem);
        });
    }

    button.addEventListener("click", () => {
        const cityInput = (document.querySelector(".city-input") as HTMLInputElement).value.trim();
        if (cityInput !== '') {
            fetchWeather(cityInput);
        } else {
            alert('Please enter a city name');
        }
    });

    loadHistory();

    fetchWeather('Lahore');
});
