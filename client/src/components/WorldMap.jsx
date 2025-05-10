import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import worldData from './custom.geo.json';
import { FormControl, FormControlLabel, MenuItem, Select, Switch, Radio, FormLabel, RadioGroup, Button} from '@mui/material';
import './styles/WorldMap.css';

const WorldMap = ({ data, onChangeCountry }) => {
  const svgRef = useRef();

  const [variable, setVariable] = useState('count');
  const [newCountry, setNewCountry] = useState('all');

  useEffect(()=>{
    onChangeCountry(newCountry);
  }, [newCountry])


  useEffect(() => {
    if(Object.keys(data).length !== 0){
      const svg = d3.select(svgRef.current);

      svg.selectAll('*').remove();

      const projection = d3.geoMercator().translate([350, 180]).scale(120);

      const path = d3.geoPath().projection(projection);

      const colorScale = d3
        .scaleLinear()
        .domain([0, d3.max(Object.values(data), d => d[variable])])
        .range(['#fce8e7', '#a10802']); 
      svg
        .selectAll('path')
        .data(worldData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', d => {
          const countryName = d.properties.name;
          if (countryName != 'all' && countryName === newCountry) {
            return '#808080'; 
          } else {
            const countryData = data[countryName];
            return countryData ? colorScale(countryData[variable]) : '#fff5f4'; 
          }
        })
        // .style('filter', d => d.properties.name === newCountry ? 'drop-shadow(0 10px 10px #a10802)' : 'none')
        .attr('stroke',  d => d.properties.name === newCountry ? '#000' : '#a10802') 
        .attr('stroke-width', d => d.properties.name === newCountry ? 2 : 0.2)
        .attr('stroke-opacity', d => d.properties.name === newCountry ? 1 : 0.3)
        .on('click', (event, d) => {
          const countryName = d.properties.name
            // setNewCountry(countryName);
            const countryData = data[countryName];
            if (countryData) {
              const countryColor = colorScale(countryData[variable]); 
              setNewCountry(countryName);
          }
        })
        .on('mouseover', function(event, d) { 
          d3.select(this).style('cursor', 'pointer'); 
        })
        .append('title') 
        .text(d => d.properties.name);

      const legendGradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'legendGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      legendGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#fce8e7');

      legendGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#a10802');

      svg.append('rect')
        .attr('x', 400)
        .attr('y', 280) // Adjust vertical position
        .attr('width', 200)
        .attr('height', 10)
        .style('fill', 'url(#legendGradient)');

      svg.append('text')
        .attr('x', 385)
        .attr('y', 300) 
        .text('0');

        const maxValue = d3.max(Object.values(data), d => d[variable]);
        svg.append('text')
          .attr('x', 605)
          .attr('y', 300) 
          .text(abbreviateNumber(maxValue));
  
        function abbreviateNumber(value) {
          const suffixes = ["", "K", "M", "B", "T"];
          const suffixNum = Math.floor(("" + value).length / 3);
          let shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2));
          if (shortValue % 1 !== 0) {
            shortValue = shortValue.toFixed(1);
          }
          return shortValue + suffixes[suffixNum];
        }
    
    }
  }, [data, variable, newCountry]);

  return (
    <div className='mapComponent'>
      <div className="radio-buttons">
        <div className="custom-form-control">
          <button
            className={`custom-form-control-label ${variable === "count" ? "selected" : ""}`}
            onClick={() => setVariable("count")}
          >
            Channels
          </button>
          <button
            className={`custom-form-control-label ${variable === "subscribers" ? "selected" : ""}`}
            onClick={() => setVariable("subscribers")}
          >
            Subscribers
          </button>
          <button
            className={`custom-form-control-label ${variable === "video_views" ? "selected" : ""}`}
            onClick={() => setVariable("video_views")}
          >
            Views
          </button>
          <button
            className={`custom-form-control-label ${variable === "uploads" ? "selected" : ""}`}
            onClick={() => setVariable("uploads")}
          >
            Uploads
          </button>
          <button
            className={`custom-form-control-label ${variable === "earnings" ? "selected" : ""}`}
            onClick={() => setVariable("earnings")}
          >
            Earnings
          </button>
        </div>
      </div>
      <svg
        className='map'
        ref={svgRef}
        width={730}
        height={325}
        style={{ backgroundColor: '#eee', position: 'relative' }}
      />
    </div>
  );
};

export default WorldMap;
