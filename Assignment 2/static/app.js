let autoDetectedCity = null;
let autoDetectedState = null;

function createMeteogram(weatherData) {
  const intervals = weatherData.data.timelines[0].intervals;

  const temperatureSeries = [];
  const humiditySeries = [];
  const pressureSeries = [];
  const windbarbSeries = [];

  intervals.forEach(interval => {
    const timeStamp = new Date(interval.startTime).getTime();
    const temp = interval.values.temperature;
    const humidity = interval.values.humidity;
    const pressure = interval.values.pressureSeaLevel;
    const windSpeed = interval.values.windSpeed || 0;
    const windDir = interval.values.windDirection || 0;

    temperatureSeries.push([timeStamp, temp]);
    humiditySeries.push([timeStamp, humidity]);
    pressureSeries.push([timeStamp, pressure]);

    if (windSpeed && windDir) {
      windbarbSeries.push({
        x: timeStamp,
        value: windSpeed,
        direction: windDir
      });
    }
  });

  Highcharts.chart('chart2', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Hourly Weather (For Next 5 Days)'
    },
    xAxis: {
      type: 'datetime',
      tickInterval: 24 * 3600 * 1000,
      labels: {
        format: '{value:%a %d %b}',
        rotation: 0,
        align: 'center'
      },
      tickLength: 10,
      opposite: true,
    },
    yAxis: [{
      title: {
        text: 'Temperature (°F)'
      },
      opposite: false,
      tickInterval: 15,
      min: 0,
      max: 135,
    }, {
      title: {
        text: 'inHg',
        align: 'high',
        offset: 0,
        rotation: 0,
        y: -20,
        style: {
          color: '#FFA500',
          fontWeight: 'bold'
        }
      },
      tickPositions: [29],
      labels: {
        style: {
          color: '#FFA500',
          fontWeight: 'bold'
        },
        formatter: function () {
          return '29';
        }
      },
      opposite: true,
      tickLength: 0,
      plotLines: [{
        value: 29,
        color: '#FFD700',
        dashStyle: 'Dash',
        width: 2,
        label: {
          text: '29 inHg',
          align: 'right',
          x: -10,
          y: 5,
          style: {
            color: '#FFD700',
            fontWeight: 'bold'
          }
        }
      }]
    }, {
      title: {
        text: null
      },
      height: 60,
      top: 330,
      offset: 0,
      lineWidth: 0,
      tickLength: 0,
      labels: {
        enabled: false
      }
    }],
    tooltip: {
      shared: true,
      formatter: function () {
        let tooltip = '<b>' + Highcharts.dateFormat('%A, %b %e', this.x) + '</b>';
        this.points.forEach(point => {
          if (point.series.name === 'Wind' && point.point.value) {
            tooltip += `<br/><span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.point.value} mph</b>`;
          } else {
            tooltip += `<br/><span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y}</b>`;
          }
        });
        return tooltip;
      }
    },
    series: [{
      name: 'Humidity',
      type: 'column',
      data: humiditySeries,
      tooltip: {
        valueSuffix: ''
      },
      color: '#1E90FF',
      zIndex: 1,
      pointWidth: 20,
      borderRadius: 5,
      dataLabels: {
        enabled: true,
        color: 'gray',
        style: {
          fontWeight: 'bold',
        },
        formatter: function () {
          return Math.round(this.y);
        }
      }
    }, {
      name: 'Temperature',
      type: 'line',
      data: temperatureSeries,
      tooltip: {
        valueSuffix: '°F'
      },
      color: '#FF0000',
      zIndex: 2,
    }, {
      name: 'Pressure',
      type: 'line',
      yAxis: 1,
      data: pressureSeries,
      tooltip: {
        valueSuffix: ' hPa'
      },
      color: '#FFA500',
      zIndex: 3,
      dashStyle: 'Dash',
    }, {
      name: 'Wind',
      type: 'windbarb',
      data: windbarbSeries,
      yAxis: 2,
      color: '#0000FF',
      zIndex: 4,
      showInLegend: true,
      tooltip: {
        valueSuffix: ' mph'
      }
    }]
  });
}

function convertToUTC(ISODates) {
  return ISODates.map(date => new Date(date).getTime());
}

function createChart(intervals) {
  let ISODates = intervals.map(interval => interval.startTime);
  let utcTimestamps = convertToUTC(ISODates);

  let result = [];
  for (let i = 0; i < intervals.length; i++) {
    result.push([utcTimestamps[i], intervals[i].values.temperatureMin, intervals[i].values.temperatureMax]);
  }

  Highcharts.chart("chart1", {
    chart: {
      type: "arearange",
      zooming: {
        type: "x",
      },
      scrollablePlotArea: {
        minWidth: 600,
        scrollPositionX: 1,
      },
    },
    title: {
      text: "Temperature Ranges (Min, Max)",
      style: {
        color: "#000000",
        fontWeight: "bold",
        fontSize: "20px",
      },
    },
    xAxis: {
      type: "datetime",
      accessibility: {
        rangeDescription: `Range: ${ISODates[0]} to ${ISODates[ISODates.length - 1]}`,
      },
    },
    yAxis: {
      title: {
        text: null,
      },
    },
    tooltip: {
      crosshairs: true,
      shared: true,
      valueSuffix: "°F",
      xDateFormat: "%A, %b %e",
    },
    legend: {
      enabled: false,
    },
    series: [{
      name: "Temperatures",
      data: result,
      color: {
        linearGradient: {
          x1: 0,
          x2: 0,
          y1: 0,
          y2: 1,
        },
        stops: [
          [0, "#f5a82d"],
          [1, "#87CEEB"]
        ],
      },
      marker: {
        enabled: true,
        radius: 5,
        fillColor: "#87CEEB",
        lineColor: "#f5a82d",
        lineWidth: 1,
      },
    }],
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".weather-card").style.display = "none";
  document.getElementById("weatherDataTable").style.display = "none";
  document.querySelector(".weather-gradient").style.display = "none";
  document.querySelector(".daily-weather").style.display = "none";

  const form = document.getElementById("weatherForm");
  
  const clearButton = document.querySelector(".clear-btn");
  clearButton.addEventListener("click", () => {
    form.reset();
    document.querySelector(".weather-card").style.display = "none";
    document.querySelector(".weather-gradient").style.display = "none"; 
    document.querySelector(".daily-weather").style.display = "none";
    document.getElementById("weatherDataTable").style.display = "none";
    document.getElementById("daily-weather-line").style.display = "none"; 
    document.getElementById("weather-chart-line").style.display = "none";
    document.querySelector(".weather-charts-heading").style.display = "none";
    document.getElementById("chart1").style.display = "none";
    document.getElementById("chart2").style.display = "none";
    document.getElementById("arrow-image-down").style.display = "none";
    document.getElementById("arrow-image-up").style.display = "none";
    document.getElementById("weatherResult").style.display = "none";
  });
  
  const autoDetectCheckbox = document.getElementById("autodetect");
  const token = '7127a15cd50c9b';  

  autoDetectCheckbox.addEventListener("change", async (e) => {
    if (autoDetectCheckbox.checked) {
      try {
        
        const response = await fetch(`https://ipinfo.io?token=${token}`);
        const data = await response.json();
        console.log('Full Location Data:', data);

        autoDetectedCity = data.city || "Unknown city";
        autoDetectedState = data.region || "Unknown state"; 

        
        document.getElementById("street").value = autoDetectedCity;
        document.getElementById("city").value = autoDetectedCity;

        
        const stateDropdown = document.getElementById("state");
        const stateOptions = stateDropdown.options;

        for (let i = 0; i < stateOptions.length; i++) {
          if (stateOptions[i].textContent === autoDetectedState) {
            stateDropdown.selectedIndex = i;
            break;
          }
        }

        console.log('Detected City:', autoDetectedCity);
        console.log('Detected State:', autoDetectedState);
      } catch (error) {
        console.error('Error fetching location from IP:', error);
        document.getElementById("weatherResult").innerText = "Error auto-detecting location. Please enter manually.";
        document.getElementById("weatherResult").style.display = "block";
      }
    } else {
      
      autoDetectedCity = null;
      autoDetectedState = null;
      document.getElementById("street").value = "";
      document.getElementById("city").value = "";
      document.getElementById("state").selectedIndex = 0; 
    }
  });

  form.onsubmit = async (e) => {
    e.preventDefault();

    
    const street = document.getElementById("street").value;
    const city = autoDetectedCity || document.getElementById("city").value;
    const state = autoDetectedState || document.getElementById("state").value;

    if (!city || !state) {
      alert("City and state are required.");
      return;
    }

    try {
      const weatherResponse = await fetch(`/get_weather?street=${street}&city=${city}&state=${state}`);
      const weatherData = await weatherResponse.json();

      if (weatherData.error) {
        document.getElementById("weatherResult").innerText = weatherData.error;
        document.getElementById("weatherResult").style.display = "block";
      } else {
        const currentWeather = weatherData.currentWeather.data.timelines[0].intervals[0].values;
        const weatherCode = currentWeather.weatherCode;
        let condition = "";
        let iconPath = "";

        switch (weatherCode) {
          case 1000:
            condition = "Clear";
            iconPath = "static/Images/Weather Symbols for Weather Codes/clear_day.svg";
            break;
          case 1001:
            condition = "Cloudy";
            iconPath = "static/Images/Weather Symbols for Weather Codes/cloudy.svg";
            break;
          case 1100:
            condition = "Mostly Clear";
            iconPath = "static/Images/Weather Symbols for Weather Codes/mostly_clear_day.svg";
            break;
          case 1101:
            condition = "Partly Cloudy";
            iconPath = "static/Images/Weather Symbols for Weather Codes/partly_cloudy_day.svg";
            break;
          case 1102:
            condition = "Mostly Cloudy";
            iconPath = "static/Images/Weather Symbols for Weather Codes/mostly_cloudy.svg";
            break;
          case 2000:
            condition = "Fog";
            iconPath = "static/Images/Weather Symbols for Weather Codes/fog.svg";
            break;
          case 2100:
            condition = "Light Fog";
            iconPath = "static/Images/Weather Symbols for Weather Codes/light_fog.svg";
            break;
          case 4000:
            condition = "Drizzle";
            iconPath = "static/Images/Weather Symbols for Weather Codes/drizzle.svg";
            break;
          case 4200:
            condition = "Light Rain";
            iconPath = "static/Images/Weather Symbols for Weather Codes/rain_light.svg";
            break;
          case 4201:
            condition = "Rain";
            iconPath = "static/Images/Weather Symbols for Weather Codes/rain.svg";
            break;
          case 5000:
            condition = "Snow";
            iconPath = "static/Images/Weather Symbols for Weather Codes/snow.svg";
            break;
          case 5100:
            condition = "Light Snow";
            iconPath = "static/Images/Weather Symbols for Weather Codes/snow_light.svg";
            break;
          case 6000:
            condition = "Freezing Rain";
            iconPath = "static/Images/Weather Symbols for Weather Codes/freezing_rain.svg";
            break;
          case 6100:
            condition = "Light Freezing Rain";
            iconPath = "static/Images/Weather Symbols for Weather Codes/freezing_rain_light.svg";
            break;
          case 6200:
            condition = "Heavy Freezing Rain";
            iconPath = "static/Images/Weather Symbols for Weather Codes/freezing_rain_heavy.svg";
            break;
          case 7000:
            condition = "Ice Pellets";
            iconPath = "static/Images/Weather Symbols for Weather Codes/ice_pellets.svg";
            break;
          case 7100:
            condition = "Light Ice Pellets";
            iconPath = "static/Images/Weather Symbols for Weather Codes/ice_pellets_light.svg";
            break;
          case 7200:
            condition = "Heavy Ice Pellets";
            iconPath = "static/Images/Weather Symbols for Weather Codes/ice_pellets_heavy.svg";
            break;
          case 8000:
            condition = "Thunderstorm";
            iconPath = "static/Images/Weather Symbols for Weather Codes/tstorm.svg";
            break;
          case 9000:
            condition = "Flurries";
            iconPath = "static/Images/Weather Symbols for Weather Codes/flurries.svg";
            break;
          case 9200:
            condition = "Strong Wind";
            iconPath = "static/Images/Weather Symbols for Weather Codes/strong_wind.svg";
            break;
          case 9100:
            condition = "Wind";
            iconPath = "static/Images/Weather Symbols for Weather Codes/wind.svg";
            break;
          default:
            condition = "Unknown";
            iconPath = "static/Images/default.png";
            break;
        }

        document.getElementById("location").innerText = `${street}, ${city}, ${state}`;
        document.getElementById("temperature").innerText = `${currentWeather.temperature.toFixed(1)}°`;
        document.getElementById("condition").innerText = condition;
        document.getElementById("weatherIcon").src = iconPath;

        document.getElementById("humidity").innerText = `${currentWeather.humidity}%`;
        document.getElementById("pressure").innerText = `${currentWeather.pressureSeaLevel} inHg`;
        document.getElementById("windSpeed").innerText = `${currentWeather.windSpeed} mph`;
        document.getElementById("visibility").innerText = `${currentWeather.visibility} mi`;
        document.getElementById("cloudCover").innerText = `${currentWeather.cloudCover}%`;
        document.getElementById("uvLevel").innerText = currentWeather.uvIndex;

        document.querySelector(".weather-card").style.display = "block";

        const weatherTableBody = document.getElementById("weatherTableBody");
        weatherTableBody.innerHTML = "";

        const timelines = weatherData.forecast.data.timelines;

        timelines.forEach((timeline) => {
          timeline.intervals.forEach((interval) => {
            let dailyWeatherData = interval.values;

            let dailyCondition = "";
            let dailyIconPath = "";

            switch (dailyWeatherData.weatherCode) {
              case 1000:
                dailyCondition = "Clear";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/clear_day.svg";
                break;
              case 1001:
                dailyCondition = "Cloudy";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/cloudy.svg";
                break;
              case 1100:
                dailyCondition = "Mostly Clear";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/mostly_clear_day.svg";
                break;
              case 1101:
                dailyCondition = "Partly Cloudy";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/partly_cloudy_day.svg";
                break;
              case 1102:
                dailyCondition = "Mostly Cloudy";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/mostly_cloudy.svg";
                break;
              case 2000:
                dailyCondition = "Fog";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/fog.svg";
                break;
              case 2100:
                dailyCondition = "Light Fog";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/light_fog.svg";
                break;
              case 4000:
                dailyCondition = "Drizzle";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/drizzle.svg";
                break;
              case 4200:
                dailyCondition = "Light Rain";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/rain_light.svg";
                break;
              case 4201:
                dailyCondition = "Rain";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/rain.svg";
                break;
              case 5000:
                dailyCondition = "Snow";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/snow.svg";
                break;
              case 5100:
                dailyCondition = "Light Snow";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/snow_light.svg";
                break;
              case 6000:
                dailyCondition = "Freezing Rain";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/freezing_rain.svg";
                break;
              case 6100:
                dailyCondition = "Light Freezing Rain";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/freezing_rain_light.svg";
                break;
              case 6200:
                dailyCondition = "Heavy Freezing Rain";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/freezing_rain_heavy.svg";
                break;
              case 7000:
                dailyCondition = "Ice Pellets";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/ice_pellets.svg";
                break;
              case 7100:
                dailyCondition = "Light Ice Pellets";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/ice_pellets_light.svg";
                break;
              case 7200:
                dailyCondition = "Heavy Ice Pellets";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/ice_pellets_heavy.svg";
                break;
              case 8000:
                dailyCondition = "Thunderstorm";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/tstorm.svg";
                break;
              case 9000:
                dailyCondition = "Flurries";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/flurries.svg";
                break;
              case 9200:
                dailyCondition = "Strong Wind";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/strong_wind.svg";
                break;
              case 9100:
                dailyCondition = "Wind";
                dailyIconPath = "static/Images/Weather Symbols for Weather Codes/wind.svg";
                break;
              default:
                dailyCondition = "Unknown";
                dailyIconPath = "static/Images/default.png";
                break;
            }

            const newRow = document.createElement("tr");
            newRow.className = "weather-table-body-row";

            const date = new Date(interval.startTime).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );
            const tempHigh = dailyWeatherData.temperatureMax;
            const tempLow = dailyWeatherData.temperatureMin;
            const sunrise = dailyWeatherData.sunriseTime || "N/A";
            const sunset = dailyWeatherData.sunsetTime || "N/A";
            const precipitationIntensity = dailyWeatherData.precipitationIntensity || "N/A";
            const precipitationProbability = dailyWeatherData.precipitationProbability || "0";
            const humidity = dailyWeatherData.humidity || "N/A";
            const visibility = dailyWeatherData.visibility || "N/A";
            const windSpeed = dailyWeatherData.windSpeed || "N/A";

            newRow.innerHTML = `
                            <td class="weather-table-body-cell">${date}</td>
                            <td class="weather-table-body-cell status-cell">
                                <img src="${dailyIconPath}" alt="${dailyCondition}" class="status-icon" /> ${dailyCondition}
                            </td>
                            <td class="weather-table-body-cell">${tempHigh}°F</td>
                            <td class="weather-table-body-cell">${tempLow}°F</td>
                            <td class="weather-table-body-cell wind-speed">${windSpeed} mph</td>
                        `;
            console.log(newRow.innerHTML);

            weatherTableBody.appendChild(newRow);

            function formatTimeTo12HourNoMinutes(timeString) {
              const date = new Date(timeString);
              return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
            }

            newRow.addEventListener("click", () => {
              document.querySelector(".weather-gradient").style.display = "block";
              document.querySelector(".daily-weather").style.display = "block";
              document.querySelector(".weather-card").style.display = "none";
              document.getElementById("weatherDataTable").style.display = "none";

              const formattedSunrise = formatTimeTo12HourNoMinutes(sunrise);
              const formattedSunset = formatTimeTo12HourNoMinutes(sunset);

              document.getElementById("gradient-date").innerText = date;
              document.getElementById("gradient-temperature").innerText = `${tempHigh}°F/${tempLow}°F`;
              document.getElementById("gradient-condition").innerText = dailyCondition;
              document.getElementById("wind-speed").innerText = `Wind Speed: ${windSpeed} mph`;
              document.getElementById("sunrise-sunset").innerText = `Sunrise/Sunset: ${formattedSunrise}/${formattedSunset}`;
              document.getElementById("precipitation").innerText = `Precipitation: ${precipitationIntensity || "N/A"}`;
              document.getElementById("chance-of-rain").innerText = `Chance of Rain: ${precipitationProbability || "0"} %`;
              document.getElementById("humidity").innerText = `Humidity: ${humidity}%`;
              document.getElementById("visibility").innerText = `Visibility: ${visibility} mi`;
              document.getElementById("gradient-icon").src = dailyIconPath;

              document.querySelector(".weather-charts-heading").style.display = "block";
              document.getElementById("weather-chart-line").style.display = "block";
              document.getElementById("arrow-image-down").style.display = "block";
              document.getElementById("arrow-image-up").style.display = "none";

              createChart(weatherData.forecast.data.timelines[0].intervals);
              createMeteogram(weatherData.hourlyWeather);

              const downArrow = document.getElementById("arrow-image-down");
              const upArrow = document.getElementById("arrow-image-up");

              downArrow.addEventListener("click", () => {
                downArrow.style.display = "none";
                upArrow.style.display = "block";

                document.getElementById("chart1").style.display = "block";
                document.getElementById("chart2").style.display = "block";
              });

              upArrow.addEventListener("click", () => {
                upArrow.style.display = "none";
                downArrow.style.display = "block";

                document.getElementById("chart1").style.display = "none";
                document.getElementById("chart2").style.display = "none";
              });
            });
          });
        });

        document.getElementById("weatherDataTable").style.display = "block";
        document.getElementById("daily-weather-line").style.display = "block";
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      document.getElementById("weatherResult").innerText = "Error fetching weather data. Please try again.";
      document.getElementById("weatherResult").style.display = "block";
    }
  };
});
