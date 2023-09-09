import React, { useCallback, useEffect,useState } from 'react';
import { View, StatusBar, Image, TextInput, SafeAreaView, TouchableOpacity, Text, ScrollView } from 'react-native';
import tw from 'twrnc'; // tailwindnative classes
import { CalendarDaysIcon, MagnifyingGlassIcon, MapPinIcon } from 'react-native-heroicons/outline';
import {debounce} from 'lodash';
import {fetchLocations, fetchWeatherForecast} from '../api/weather'
import { weatherImages } from '../constants';
import * as Progress from 'react-native-progress';
import { getData, storeData } from '../utils/asyncStorage';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false) //var that toggles the search bar's haragdats
  const [locations, setLocations] = useState([]) //array that store the locations
  const [weather,setWeather] = useState({}) //object to store weather data
  const [loading, setLoading] = useState(true) // its a boolean flag to indicate data is being stored

  // function to handle location selection and fetch weather data for selected loc
  const handleLocation = (loc) => {
    console.log('location: ',loc)
    setLocations([]);
    toggleSearch(false);
    setLocations(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name)
      //console.log('got forecast: ',data);
    })
  }

  // fetch location data based on user input
  const handleSearch =value=>{
    if(value.length>2){
      fetchLocations({cityName: value}).then(data=>{
        setLocations(data);
      })
    }
  }
 
  // emoty dependency array fetches weather data when the
  useEffect(()=>{
     fetchWeatherData();
  },[]);

 //async function to fetch weather data for a default or previously selected city
  const fetchWeatherData = async ()=>{
    let myCity = await getData('city');
    let cityName = 'Ulaanbaatar';
    if(myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false)
    })
  }

  // debounced version if the handlesearch hm
  const HandleTextDebounce = useCallback(debounce(handleSearch,1200) ,[]);
  const  {current, location} = weather;
  
  return (
    <View style={tw`flex-1 relative`}>
      <StatusBar style="light" />
      <Image blurRadius={50} source={require('../assets/images/bg.png')} style={tw`absolute h-full w-full`} />
      {
        loading? (
          <View style={tw`flex-1 flex-row justify-center items-center`}>
           <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
          </View>

        ):(
          <SafeAreaView style={tw`flex flex-1`}>
        {/* Search section */}
        <View style={[
          tw`mx-4 relative z-50`,
          { height: '7%' },
        ]}>
          <View style={[
            tw`flex-row justify-end items-center rounded-full`,
            { backgroundColor: showSearch ? 'rgba(255,255,255, 0.2)' : 'transparent' }, 
          ]}>
            {
              showSearch ? (
                <TextInput
                  onChangeText={HandleTextDebounce} 
                  placeholder='Search City'
                  placeholderTextColor='lightgray'
                  style={[
                    tw`pl-6 h-10 pb-1 flex-1 text-base text-white`,
                    { backgroundColor: 'transparent' }, 
                  ]}
                />
              ) : null 
            }

            <TouchableOpacity
              onPress={() => toggleSearch(!showSearch)}
              style={[
                tw`rounded-full p-3 m-1`,
                { backgroundColor: 'rgba(255,255,255, 0.3)' },
              ]}
            >
              <MagnifyingGlassIcon size={25} color='white' />
            </TouchableOpacity>
          </View>
          {
            locations.length > 0 && showSearch ? (
              <View style={tw`absolute w-full bg-gray-300 top-16 rounded-3xl`}>
                {locations.map((loc, index) => {
                  let showBorder= index+1 != locations.length;
                  let borderClass= showBorder? 'border-b-2 border-b-gray-400': '';

                  return (
                    <TouchableOpacity
                    onPress={()=> handleLocation(loc)} 
                  key={index}
                  style={tw`flex-row items-center ${borderClass} p-3 px-4 mb-1 `}
                  >
                    <MapPinIcon size={20} color='gray'></MapPinIcon>
                    <Text style={tw`text-black text-lg ml-2`}>{loc?.name}, {loc?.country}</Text>
                  </TouchableOpacity>       
                  )
                })}
              </View>
            ):null
          }
        </View>
        {/** forecast section */}
        <View style={tw`mx-4 flex justify-around flex-1 mb-2`}>
          {/**location */}
          <Text style={tw`text-white text-center text-2xl font-bold`}>
           {location?.name},
           <Text style={tw`text-lg font-semibold text-gray-300`}>
           {" "+location?.country}
           </Text>
          </Text>
          {/* weather image*/}
          <View style={tw`flex-row justify-center`}>
            <Image 
            source={weatherImages[current?.condition?.text]} 
            style={tw`w-52 h-52`}             
            />
          </View>
          {/** degree celcius */}
          <View  style="space-y-2">
            <Text style={tw`text-center font-bold text-white text-6xl ml-5`}>
              {current?.temp_c}&#176;
            </Text>
            <Text style={tw `text-center text-white text-xl tracking-wildest`}>
              {current?.condition?.text}
            </Text>
          </View>
          {/** other stats */}
          <View style={tw`flex-row justify-between mx-4`}>
            <View style={tw`flex-row space-x-2 items-center`}>
              <Image source={require('../assets/icons/wind.png')} style={tw`h-6 w-6`} />
              <Text style={tw`text-white font-semibold text-base`}>
              {current?.wind_kph}km
              </Text>
            </View>
            <View style={tw`flex-row space-x-2 items-center`}>
              <Image source={require('../assets/icons/drop.png')} style={tw`h-6 w-6`} />
              <Text style={tw`text-white font-semibold text-base`}>
              {current?.humidity}%
              </Text>
            </View>
            <View style={tw`flex-row space-x-2 items-center`}>
              <Image source={require('../assets/icons/sun.png')} style={tw`h-6 w-6`} />
              <Text style={tw`text-white font-semibold text-base`}>
              {weather?.forecast?.forecastday[0]?.astro?.sunrise}
              </Text>
            </View>
          </View>
        </View>
        {/** forecast for next days */}
        <View style={tw`mb-2`}>
          <View style={tw`flex-row items-center mx-5 space-x-2`}>
            <CalendarDaysIcon size={22} color="white"/>
            <Text style={tw`text-white text-base`}>Daily forecast</Text>
          </View>
          <ScrollView
          horizontal
          contentContainerStyle={{paddingHorizontal: 15}}
          showsHorizontalScrollIndicator={false}
        > 
          {
          weather?.forecast?.forecastday?.map((item, index) => {
            let date = new Date(item.date);
            let options = { weekday: 'long'};
            let dayName = date.toLocaleDateString('en-US', options);
            dayName = dayName.split('.')[0]
          return(
          <View
          key={index} 
           style={[
           tw`flex justify-center items-center w-24 rounded-3xl py-3 mr-4`,
           { backgroundColor: 'rgba(255,255,255, 0.15)' },
           ]}
           >
          <Image
          source={weatherImages[item?.day?.condition?.text|| 'other']}
          style={tw`h-11 w-11`}
         />
          <Text style={tw`text-white`}>{dayName}</Text>
          <Text style={tw`text-white text-xl font-semibold`}>
          {item?.day?.avgtemp_c}&#176;
         </Text>
         </View>
           )
          })
         }
          </ScrollView>
        </View>
      </SafeAreaView>

        )
      }

    </View>
  );
}
