import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const BeeSwarmPlot = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data.length) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove(); // clear previous
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale: group by profession
    const x = d3.scaleBand()
      .domain([...new Set(data.map(d => d.profession))])
      .range([0, width])
      .padding(1);

    // Y scale: e.g., satisfaction or stress
    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => +d.financialStress)) // choose your variable here
      .nice()
      .range([height, 0]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y));

    // Simulation for bee swarm effect
    const simulation = d3.forceSimulation(data)
      .force("x", d3.forceX(d => x(d.profession)).strength(1))
      .force("y", d3.forceY(d => y(d.financialStress)).strength(1))
      .force("collide", d3.forceCollide(4))
      .stop();

    for (let i = 0; i < 200; i++) simulation.tick();

    // Draw dots
    svg.append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 4)
      .style("fill", d => d.depression === 'Yes' ? '#ff4d4d' : '#69b3a2')
      .style("opacity", 0.7)
      .append("title")
      .text(d => `Stress: ${d.financialStress}, Depression: ${d.depression}`);

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default BeeSwarmPlot;
