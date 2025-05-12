import React, { useState, useEffect } from 'react';
import './App.css';
import WorldMap from './components/WorldMap';
import DataTab from './components/DataTab'
import axios from 'axios';
import ScatterPlot from './components/ScatterPlot';
import BarChart from './components/BarChart';
import BiPlot from './components/BiPlot';
import LineGraph from './components/LineGraph';
import Radar from "react-d3-radar";


function App() {
  
  const backend_url = 'http://127.0.0.1:8000'

  const [mapData, setMapData] = useState({});
  const [avgData, setAvgData] = useState({});
  const [country, setCountry] = useState('all');
  const [type, setType] = useState('all');
  const [scatterXData, setScatterXData] = useState([]);
  const [scatterYData, setScatterYData] = useState([]);
  const [barchartData, setBarchartData] = useState({});
  const [lineGraphData, setLineGraphData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [radarIndex, setRadarIndex] = useState(-1);
  const [radarData, setRadarData] = useState({"uploads":0,"video_views_for_the_last_30_days":0,"subscribers_for_last_30_days":0,"earnings":0,"video_views":0});
  const [radarYoutuber, setRadarYoutuber] = useState('');
  const [radarIndex2, setRadarIndex2] = useState(-2);
  const [radarData2, setRadarData2] = useState({"uploads":0,"video_views_for_the_last_30_days":0,"subscribers_for_last_30_days":0,"earnings":0,"video_views":0});
  const [radarYoutuber2, setRadarYoutuber2] = useState('');
  const [biXData, setBiXData] = useState([]);
  const [biYData, setBiYData] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [biVariables, setBiVariables] = useState([]);
  const [biXVars, setBiXVars] = useState([]);
  const [biYVars, setBiYVars] = useState([]);


  const onChangeCountry = (new_country) => {
    if(new_country == 'United States of America'){
      new_country = 'United States';
    }
    setCountry(new_country);
  }

  const onChangeType = (new_type) => {
    setType(new_type);
  }

  const onChangeRadarIndex = (new_radar_index) => {
    setRadarIndex(new_radar_index);
  }

  const onChangeRadarIndex2 = (new_radar_index2) => {
    setRadarIndex2(new_radar_index2);
  }

  useEffect(()=>{
    axios.get(`${backend_url}/get_radar_index_data/${country}/${type}/${radarIndex}`)
    .then(response => {
      let dict = response.data
      setRadarYoutuber(dict['Youtuber']);
      delete dict['Youtuber'];
      setRadarData(dict);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  },[radarIndex]);
 
  useEffect(()=>{
    axios.get(`${backend_url}/get_radar_index_data/${country}/${type}/${radarIndex2}`)
    .then(response => {
      let dict = response.data
      setRadarYoutuber2(dict['Youtuber']);
      delete dict['Youtuber'];
      setRadarData2(dict);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  },[radarIndex2]);

  useEffect(()=>{
      axios.get(`${backend_url}/get_country_stats/${type}`)
      .then(response => {
        setMapData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

      axios.get(`${backend_url}/get_avg_data/${country}/${type}`)
      .then(response => {
        setAvgData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

      axios.get(`${backend_url}/get_scatter_data/${country}/${type}`)
      .then(response => {
        setScatterYData(response.data.earnings);
        setScatterXData(response.data.views);
        setLineData(response.data.line);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

      axios.get(`${backend_url}/get_barchart_data/${country}`)
      .then(response => {
        setBarchartData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

      axios.get(`${backend_url}/get_linegraph_data/${country}/${type}`)
      .then(response => {
        setLineGraphData(response.data['data']);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

      axios.get(`${backend_url}/get_radar_index_data/${country}/${type}/${radarIndex}`)
    .then(response => {
      let dict = response.data
      setRadarYoutuber(dict['Youtuber']);
      delete dict['Youtuber'];
      setRadarData(dict);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

    setRadarIndex(-1);

    axios.get(`${backend_url}/get_radar_index_data/${country}/${type}/${radarIndex2}`)
    .then(response => {
      let dict = response.data
      setRadarYoutuber2(dict['Youtuber']);
      delete dict['Youtuber'];
      setRadarData2(dict);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

    setRadarIndex2(-2);

    axios.get(`${backend_url}/get_biplot_data/${country}/${type}`)
    .then(response => {
      console.log(response.data);
      setBiXData(response.data['pc1_values']);
      setBiYData(response.data['pc2_values']);
      setBiVariables(response.data['attributes']);
      setBiXVars(response.data['pc1_attrs']);
      setBiYVars(response.data['pc2_attrs']);
      setClusters(response.data['kmean_result']);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

  },[country, type]);


  return (
      <div className="App">
        {/* Component 1 (DataTab) */}
        <div className="data-component">
          <DataTab data={avgData}  country = {country}/>
        </div>
        {/* Component 2 */}
        <div className="world-map-container">
          <WorldMap data={mapData} onChangeCountry= {onChangeCountry} />
        </div>
        {/* Component 3 */}
        <div className="bar-component">
          {/* <DataTab data={avgData} /> */}
          <BarChart data = {barchartData} onChangeType={onChangeType}/>
        </div>
        {/* Component 4 (WorldMap) */}
        <div className="bi-component">
          {/* Your Component 6 JSX */}
          <div className="radar-title">
            <h3>{radarIndex == -1 ? "Top Two Youtubers" : "Two Selected Youtubers"}</h3>

          </div>
          <div className="radar">
            <Radar
            width={320} height={320} padding={35} domainMax={1} highlighted={null}
            data={{
              variables: [
                { key: "uploads", label: "Uploads" },
                { key: "video_views_for_the_last_30_days", label: "Views from last 30 days" },
                { key: "subscribers_for_last_30_days", label: "Subscribers from last 30 days" },
                { key: "earnings", label: "Yearly Earnings" },
                { key: "video_views", label: "Video Views" }
              ],
              sets: [{},{}, {},{key: "key",label: "Factors",values: radarData2}, {}, {}, {}, {}, {key: "key1",label: "Factors",values: radarData}]
            }}
            />
            <div class="legend">
              <div class="legend-item">
                <div class="legend-color1" ></div>
                <span>{radarYoutuber}</span>
              </div>
              <div class="legend-item">
                <div class="legend-color2" ></div>
                <span>{radarYoutuber2}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Component 5 */}
        <div className="scatter-component">
          <ScatterPlot xData = {scatterXData} yData={scatterYData} lineData = {lineData} onChangeRadarIndex = {onChangeRadarIndex} onChangeRadarIndex2 = {onChangeRadarIndex2} />
        </div>
        {/* Component 6 */}
        <div className="line-component">
          {/* Your Component 5 JSX */}
          {/* <LineGraph data = {lineGraphData}/> */}
          <BiPlot xData = {biXData} yData = {biYData} clusters = {clusters} variables = {biVariables} xVars = {biXVars} yVars = {biYVars}/>
        </div>
        
      </div>
  );
}

export default App;
