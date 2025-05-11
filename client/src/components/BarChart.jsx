import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './styles/BarChart.css'

const BarChart = ({ onChangeType }) => {
  const svgRef = useRef();
  const [newType, setNewType] = useState('all');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/channel-types');
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    onChangeType(newType);
  }, [newType, onChangeType]);

  useEffect(() => {
    if (loading) return;

    d3.select(svgRef.current).selectAll("*").remove();

    let dataArray = Object.entries(data);

    dataArray.sort((a, b) => b[1] - a[1]);

    if (dataArray.length > 10) {
      let topNine = dataArray.slice(0, 9);
      let otherSum = dataArray.slice(9).reduce((acc, curr) => acc + curr[1], 0);
      topNine.push(["Other", otherSum]);
      dataArray = topNine;
    }

    const processedData = {};
    for (let i = 0; i < dataArray.length; i++) {
      processedData[dataArray[i][0]] = dataArray[i][1];
    }

    const svg = d3.select(svgRef.current);

    const width = 510;
    const height = 390;
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
      .domain(Object.keys(processedData))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(Object.values(processedData))])
      .range([chartHeight, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${margin.left}, ${margin.top + chartHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-35)");

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(yAxis);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - margin.bottom / 2 + 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '0.8em')
      .text('Channel Types');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', margin.left / 2 - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '0.9em')
      .text('No. of Youtubers');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '1.2em')
      .style('text-decoration', 'underline')
      .text('Youtubers per Channel Type');

    svg.selectAll('.bar')
      .data(Object.entries(processedData))
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => margin.left + xScale(d[0]))
      .attr('y', d => margin.top + yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => chartHeight - yScale(d[1]))
      .attr('fill', d => {
        if(d[0] === newType) return '#a10802';
        else return '#db6e6a'
      })
      .on('click', (_, i) => { 
        setNewType(i[0]); 
      })
      .on('mouseover', function() { 
        d3.select(this).style('cursor', 'pointer'); 
      });

  }, [data, newType, loading]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className='bar-chart'>
      <svg ref={svgRef} width={510} height={390}>
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
    </div>
  );
};

export default BarChart;
