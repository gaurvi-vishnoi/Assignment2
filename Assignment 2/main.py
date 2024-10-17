from flask import Flask, request, jsonify, send_from_directory
import requests
import os

app = Flask(__name__)

TOMORROW_API_KEY = 'ud4J97M9NjOI87D6Ax7tbWyBecetYukm'
GOOGLE_MAPS_API_KEY = 'AIzaSyAKIbec0LFCqMVRtMA2ULPebt7Cknkpl0M'

@app.route('/')
def index():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'index.html')

@app.route('/get_weather', methods=['GET'])
def get_weather():
    street = request.args.get('street')
    city = request.args.get('city')
    state = request.args.get('state')

    if not street or not city or not state:
        return jsonify({"error": "Please provide street, city, and state."}), 400

   
    address = f"{street},{city},{state}"
    geo_url = f'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_MAPS_API_KEY}'

    try:
        geo_response = requests.get(geo_url).json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Unable to connect to Google Maps API"}), 500

    if geo_response['status'] == 'ZERO_RESULTS':
        return jsonify({"error": "Address not found in Google Maps."}), 400

    if geo_response['status'] == 'OK':
        location = geo_response['results'][0]['geometry']['location']
        lat, lon = location['lat'], location['lng']

        
        weather_url = (
            f'https://api.tomorrow.io/v4/timelines?location={lat},{lon}'
            f'&fields=temperature,humidity,pressureSeaLevel,windSpeed,visibility,cloudCover,uvIndex,weatherCode'
            f'&timesteps=current&units=imperial&apikey={TOMORROW_API_KEY}'
        )

        try:
            weather_response = requests.get(weather_url)
            weather_response.raise_for_status()
            current_data = weather_response.json()

            
            forecast_url = (
                f'https://api.tomorrow.io/v4/timelines?location={lat},{lon}'
                f'&fields=temperatureMax,temperatureMin,humidity,windSpeed,visibility,precipitationProbability,sunriseTime,sunsetTime,weatherCode'
                f'&timesteps=1d&units=imperial&apikey={TOMORROW_API_KEY}'
            )

            try:
                forecast_response = requests.get(forecast_url)
                forecast_response.raise_for_status()
                forecast_data = forecast_response.json()

                
                hourly_url = (
                    f'https://api.tomorrow.io/v4/timelines?location={lat},{lon}'
                    f'&fields=temperature,humidity,windSpeed,windDirection,pressureSeaLevel'
                    f'&timesteps=1h&units=imperial&apikey={TOMORROW_API_KEY}'
                )

                try:
                    hourly_response = requests.get(hourly_url)
                    hourly_response.raise_for_status()
                    hourly_data = hourly_response.json()

                    
                    print(f"Current Weather API Response: {current_data}")
                    print(f"7-Day Forecast API Response: {forecast_data}")
                    print(f"Hourly Weather API Response: {hourly_data}")

                    
                    combined_response = {
                        "currentWeather": current_data,
                        "forecast": forecast_data,
                        "hourlyWeather": hourly_data
                    }

                    return jsonify(combined_response)

                except requests.exceptions.RequestException as e:
                    return jsonify({"error": "Unable to connect to Tomorrow.io API for hourly weather"}), 500

            except requests.exceptions.RequestException as e:
                return jsonify({"error": "Unable to connect to Tomorrow.io API for forecast"}), 500

        except requests.exceptions.RequestException as e:
            return jsonify({"error": "Unable to connect to Tomorrow.io API for current weather"}), 500

    else:
        return jsonify({"error": "Address not found"}), 400
    

if __name__ == '__main__':
    app.run(debug=True)

