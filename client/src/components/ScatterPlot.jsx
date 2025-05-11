import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './styles/ScatterPlot.css';

const ScatterPlot = ({ onChangeRadarIndex, onChangeRadarIndex2 }) => {
  const svgRef = useRef();
  const [newIndex, setNewIndex] = useState(-1);
  const [newIndex2, setNewIndex2] = useState(-1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/scatterplot-data');
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
    onChangeRadarIndex(newIndex);
  }, [newIndex, onChangeRadarIndex]);

  useEffect(() => {
    onChangeRadarIndex2(newIndex2);
  }, [newIndex2, onChangeRadarIndex2]);

  useEffect(() => {
    if (!data || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 365;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data.xData))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent([...data.yData, ...data.lineData]))
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".2s"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".2s"));

    svg.append('g')
      .attr('transform', `translate(${margin.left}, ${innerHeight + margin.top})`)
      .call(xAxis)
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .style('font-size', '1.3em')
      .text('No. of views');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -innerHeight / 2)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .style('font-size', '1.3em')
      .text("Earnings ($)");

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2 + 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '1.2em')
      .style('text-decoration', 'underline')
      .text('Earnings v/s Views');

    svg.selectAll('circle')
      .data(data.xData.map((d, i) => ({ x: d, y: data.yData[i], index: i })))
      .enter().append('circle')
      .attr('cx', d => xScale(d.x) + margin.left)
      .attr('cy', d => yScale(d.y) + margin.top)
      .attr('r', d => (d.index === newIndex || d.index === newIndex2) ? 7 : 5)
      .attr('fill', d => d.index === newIndex ? '#fff44f' : '#cc4c47')
      .attr('stroke', d => (d.index === newIndex || d.index === newIndex2) ? 'black' : 'none')
      .attr('stroke-width', d => (d.index === newIndex || d.index === newIndex2) ? 1.5 : 0)
      .attr('filter', d => (d.index === newIndex || d.index === newIndex2) ? 'url(#drop-shadow)' : 'none')
      .on('click', (event, d) => {
        if (d.index !== newIndex) {
          setNewIndex2(newIndex);
          setNewIndex(d.index);
        }
      })
      .on('mouseover', function() {
        d3.select(this)
          .style('cursor', 'pointer')
          .attr('fill', '#8c1f1a')
          .attr('r', 7);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('fill', d => d.index === newIndex ? '#fff44f' : '#cc4c47')
          .attr('r', d => (d.index === newIndex || d.index === newIndex2) ? 7 : 5);
      });

    const line = d3.line()
      .x((d, i) => xScale(data.xData[i]) + margin.left)
      .y((d, i) => yScale(d) + margin.top);

    svg.append('defs').append('filter')
      .attr('id', 'drop-shadow-below')
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 7)
      .attr('result', 'blur-below');

    svg.select('#drop-shadow-below').append('feOffset')
      .attr('dx', 0)
      .attr('dy', 4)
      .attr('result', 'offsetBlur-below');

    svg.select('#drop-shadow-below').append('feFlood')
      .attr('flood-color', 'red')
      .attr('result', 'offsetColor-below');

    svg.select('#drop-shadow-below').append('feComposite')
      .attr('in', 'offsetColor-below')
      .attr('in2', 'offsetBlur-below')
      .attr('operator', 'in')
      .attr('result', 'offsetBlur-below');

    const feMergeBelow = svg.select('#drop-shadow-below').append('feMerge');
    feMergeBelow.append('feMergeNode').attr('in', 'offsetBlur-below');
    feMergeBelow.append('feMergeNode').attr('in', 'SourceGraphic');

    svg.append("path")
      .datum(data.lineData)
      .attr("fill", "none")
      .attr("stroke", "#a10802")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.7)
      .attr("d", line)
      .style('filter', 'url(#drop-shadow-below)');

  }, [data, newIndex, newIndex2, loading]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className='scatter-plot'>
      <svg ref={svgRef} width="605" height="365"></svg>
    </div>
  );
};

export default ScatterPlot;
