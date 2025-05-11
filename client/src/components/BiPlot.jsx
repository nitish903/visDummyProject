import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import "./styles/BiPlot.css"

const BiPlot = () => {
  const svgRef = useRef();
  const colors = ["#D35859", "#FFD700", "#8A2BE2", "#00FFFF", "#FF6347", "#9932CC", "#FFA500"];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/biplot-data');
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
    if (!data || loading) return;

    const margin = { top: 30, right: 20, bottom: 45, left: 50 }; 
    const width = 550 - margin.left - margin.right;
    const height = 355 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent([...data.xData, ...data.xVars]);
    const yExtent = d3.extent([...data.yData, ...data.yVars]);

    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2 - 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '1.2em')
      .style('text-decoration', 'underline')
      .text('BiPlot');

    svg.selectAll("circle")
      .data(data.xData.map((d, i) => [d, data.yData[i]]))
      .enter().append("circle")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 2)
      .style("fill", (d, i) => colors[data.clusters[i]]);

    svg.append("text")
      .attr("transform", `translate(${width / 2},${height + margin.top + 10})`)
      .style("text-anchor", "middle")
      .text("PC1 values");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("PC2 values");

    data.variables.forEach(label => {
      const line = svg.append("line")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(data.xVars[data.variables.indexOf(label)]))
        .attr("y2", yScale(data.yVars[data.variables.indexOf(label)]))
        .attr("stroke", "#cc4c47")
        .attr("stroke-width", 3)
        .style("opacity", 0);

      line.transition()
        .duration(500) 
        .delay(1000) 
        .style("opacity", 1);

      line.append("title")
        .text(label);

      line.on("mouseover", function() {
        d3.select(this).attr("stroke-width", 5);
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-width", 3);
      });
    });

  }, [data, loading]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className='biPlot'>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BiPlot;
