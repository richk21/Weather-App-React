import React, {useEffect, useState} from "react";
import axios from 'axios';

function App() {  
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [user, setUser] = useState([]);
  const [userlink, setUserLink] = useState([]);
  const [defLocation, setUserLocation] = useState({latitude:null, longitude:null, city:''});

  
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=ddbc18a75dd11b8c0091cbae00d750a3`


  useEffect(()=>{
    //fetch user's current location
    fetchCurrentLocation();
  },[]);

  const fetchCurrentLocation=()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        position =>{
          const {latitude, longitude} = position.coords;
          const apikey = "594c2ec9ff914d06ac1f3a2bde9da12c";
          fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apikey}`)
          .then(response => response.json())
          .then(data => {
            const city = data.results[0].components.city || data.results[0].components.town || data.results[0].components.village || '';
            setUserLocation({latitude, longitude, city});
            fetchWeatherDataAndImage(city);
          })
          .catch(error=>{
            console.error(error)
          });
        },
        error=>{
          console.error(error)
        }
      );
    }else{
      console.log("Geolocation is not supported by this browser");
    }
  }

  const fetchWeatherDataAndImage = async (location) => {
    var desc="";
    try{
      const response = await axios.get(url);
      setData(response.data);
      desc = response.data.weather[0]? response.data.weather[0].description : '';
      console.log(desc)
      console.log(response.data);
    }catch(err){
      console.error("Error fetching weather data: ", err);
      setData({});
    }
    setLocation('');

    try{
      desc = desc+" "+location+" landscape"
      const bgresponse = await axios.get(`https://api.unsplash.com/photos/random?query=${desc}&client_id=jZ0wkB4YyRJQBw-pzfuwwINLDotJ6uBXzXf6BIEI_IU`);
      const imageData = bgresponse.data;
      const image = imageData.urls && imageData.urls.regular ? imageData.urls.regular : '';
      const username = imageData.user ? imageData.user.first_name+" "+imageData.user.last_name : 'Unknown';
      const usernamelink = imageData.user ? (imageData.user.links ? imageData.user.links.html : null) : null;
      setImages(image);
      setUser(username);
      setUserLink(usernamelink);
      console.log(imageData);
      console.log(user)
    }catch(err){
      console.error("Error fetching background image: ", err);
      setImages([]);
    }
  }

  const searchLocation = async(event) => {
    if(event.key === "Enter"){
      fetchWeatherDataAndImage(location);
      //setLocation('')
    }
  }

  return (
    <div className="App" style={{ minHeight: "740px", width: "100%", height: "100vh", position: "relative", backgroundColor: "rgba(0, 0, 0, 0.5)", color: "#fff"}}>
      <div className="beforeElement" style={{ backgroundImage: `url(${images})`, backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover", position: "absolute", width: "100%", height: "100%", top: 0, left: 0, zIndex: -1 }}/>
      <div class="search">
        <input 
        type="text" 
        value={location}
        onChange={event=>setLocation(event.target.value)} 
        placeholder="Enter Location"
        onKeyPress={(searchLocation)}
        />
      </div>
      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
            <div className="temp">
              {data.main ? <h1>{parseInt(Math.round(data.main.temp-273.15))}°c</h1>:null}
              {data.main ? <p className="minmaxtemp">{String(parseInt(Math.round(data.main.temp_min-273.15)))+"-"+String(parseInt(Math.round(data.main.temp_max-273.15)))}°c</p>:null}
            </div>
            <div className="description">
              {data.weather ? <p className="bold">{data.weather[0].main}</p> : null}
              {data.weather ? <p className="weatherdescription">{data.weather[0].description}</p> : null}
            </div>
          </div>
        </div>
        <div className="bottom">
          <div className="feels">
            {data.main ? <p className="bold">{parseInt(Math.round(data.main.feels_like-273.15))}°c</p> : null}
            <p>Feels like</p>
          </div>
          <div className="humidity">
            {data.main ? <p className="bold">{parseInt(Math.round(data.main.humidity))}%</p> : null}
            <p>Humidity</p>
          </div>
          <div className="wind">
            {data.wind ? <p className="bold">{parseInt(Math.round(data.wind.speed))} MPH</p> : null}
            <p>Wind Speed</p>
          </div>
        </div>
        <div className="copy">
        <p className="copyright">Shot by <a href={userlink} target="_blank"><b>{user}</b></a><br/><b>Unsplash</b></p>
      </div>
      </div>
    </div>
  );
}

export default App;
