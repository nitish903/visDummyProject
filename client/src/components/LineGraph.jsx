import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "./styles/LineGraph.css"

const LineGraph = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 50, left: 50 }; 
    const width = 550 - margin.left - margin.right;
    const height = 355 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d[0]))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[1])])
      .nice()
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(d[0]) + x.bandwidth() / 2)
      .y(d => y(d[1]))
      .curve(d3.curveMonotoneX); // Use a curvier interpolation

    const area = d3.area()
      .x(d => x(d[0]) + x.bandwidth() / 2)
      .y0(height)
      .y1(d => y(d[1]))
      .curve(d3.curveMonotoneX); 

    svg.append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", y(0))
      .attr("x2", 0).attr("y2", y(d3.max(data, d => d[1])))
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#fff"},
        {offset: "80%", color: "#db6e6a"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    svg.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area)
      .attr("fill", "url(#area-gradient)"); 
    svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#a10802")
      .attr("stroke-width", 3); 
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("transform", `translate(${width / 2},${height + margin.top + 30})`)
      .style("text-anchor", "middle")
      .text("Created Year");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("No. of Channels");

    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2 - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '1.2em')
      .style('text-decoration', 'underline')
      .text('Channels created per year');

  }, [data]);

  return (
    <div className='line-graph'>
    <svg ref={svgRef}></svg>
    </div>
  );
};

export default LineGraph;
