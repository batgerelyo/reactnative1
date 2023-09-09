import axios from "axios"; // JS library fro making HTTP req
import { apiKey } from "../constants";  //module weatherAPI service 

//tuhain params object as arguemnt and retunrs URL for fetching weather forecast
const forecastEndpoint = (params)=> `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}`;
const locationsEndpoint = (params)=> `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

//asynchronous function takes an endpoint URL as an argument and makes an HTTP GET request using Axios
const apiCall = async (endpoint)=>{
    const options = {
        method: 'GET',
        url: endpoint,
    };

      try{
        const response = await axios.request(options);
        return response.data;
      }catch(error){
        console.log('error: ',error);
        return {};
    }
}

export const fetchWeatherForecast = (params)=>{
    let Url = forecastEndpoint(params);
    return apiCall(Url);
}

export const fetchLocations = params=>{
    let locationsUrl = locationsEndpoint(params);
    return apiCall(locationsUrl);
}
