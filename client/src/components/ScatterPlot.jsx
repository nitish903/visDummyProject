import React, {useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './styles/ScatterPlot.css';

const ScatterPlot = ({ xData, yData, lineData, onChangeRadarIndex, onChangeRadarIndex2 }) => {
  const svgRef = useRef();
  const [newIndex, setNewIndex] = useState(-1);
 
  const [newIndex2, setNewIndex2] = useState(-1);


  useEffect(()=>{
    onChangeRadarIndex(newIndex);
  }, [newIndex]);


  useEffect(()=>{
    onChangeRadarIndex2(newIndex2);
  }, [newIndex2]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();

    const width = 600;
    const height = 365;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain(d3.extent(xData))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent([...yData, ...lineData]))
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".2s"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".2s"));
    console.log(newIndex);
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
      .data(xData.map((d, i) => ({ x: d, y: yData[i], index: i })))
      .enter().append('circle')
      .attr('cx', d => xScale(d.x) + margin.left)
      .attr('cy', d => yScale(d.y) + margin.top)
      .attr('r', d => (d.index === newIndex || d.index === newIndex2 )? 7 : 5) 
      .attr('fill', d => d.index === newIndex ? '#fff44f' : '#cc4c47') 
      .attr('stroke', d => (d.index === newIndex || d.index === newIndex2 ) ? 'black' : 'none') 
      .attr('stroke-width', d => (d.index === newIndex || d.index === newIndex2 ) ? 1.5 : 0) 
      .attr('filter', d => (d.index === newIndex || d.index === newIndex2 ) ? 'url(#drop-shadow)' : 'none')
      .on('click', (event, d) => {
        if (d.index !== newIndex){
          setNewIndex2(newIndex);
          setNewIndex(d.index);
        }
      })
      .on('mouseover', function(event, d) { 
        d3.select(this).style('cursor', 'pointer')
        .attr('fill', '#8c1f1a')
        .attr('r', 7);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
        .attr('fill', d => d.index === newIndex ? '#fff44f' : '#cc4c47')
        .attr('r', d => (d.index === newIndex || d.index === newIndex2 ) ? 7 : 5); 
      });

    const line = d3.line()
      .x((d, i) => xScale(xData[i]) + margin.left)
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
    .datum(lineData)
    .attr("fill", "none")
    .attr("stroke", "#a10802")
    .attr("stroke-width", 2) 
    .attr("stroke-opacity", 0.7)
    .attr("d", line)
    .style('filter', 'url(#drop-shadow-below)'); 
    svg.append('defs').append('filter')
      .attr('id', 'drop-shadow-above')
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 7)
      .attr('result', 'blur-above');

    svg.select('#drop-shadow-above').append('feOffset')
      .attr('dx', 0)
      .attr('dy', -4)
      .attr('result', 'offsetBlur-above');

    svg.select('#drop-shadow-above').append('feFlood')
      .attr('flood-color', 'red')
      .attr('result', 'offsetColor-above');

    svg.select('#drop-shadow-above').append('feComposite')
      .attr('in', 'offsetColor-above')
      .attr('in2', 'offsetBlur-above')
      .attr('operator', 'in')
      .attr('result', 'offsetBlur-above');

    const feMergeAbove = svg.select('#drop-shadow-above').append('feMerge');
    feMergeAbove.append('feMergeNode').attr('in', 'offsetBlur-above');
    feMergeAbove.append('feMergeNode').attr('in', 'SourceGraphic');

  }, [xData, yData, lineData, newIndex, newIndex2]);

  return (
    <div className='scatter-plot'>
      <svg ref={svgRef} width="605" height="365"></svg>
    </div>
  );
};

export default ScatterPlot;
