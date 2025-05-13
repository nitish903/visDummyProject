import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const LinePlot = ({
  data,
  profession,
  yAxisProp,
  width = 800,
  height = 430,
  margin = { top: 40, right: 40, bottom: 60, left: 70 },
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !yAxisProp || !data.length) return;

    // Filter data by profession if provided
    const filteredData = profession
      ? data.filter((d) => d.profession === profession)
      : data;

    if (!filteredData.length) {
      // If no data after filtering, clear svg and return
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const scale = 0.95;

    // Main group with margins and scale
    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top}) scale(${scale})`
      );

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Detect data type for y-axis
    const sampleValue = filteredData[0][yAxisProp];
    const isYCategorical = typeof sampleValue === "string";

    // Group data by age
    const groupedData = Array.from(
      d3.group(filteredData, (d) => d.age),
      ([age, values]) => ({
        age: +age,
        [yAxisProp]: isYCategorical
          ? values[0][yAxisProp] // Take first categorical value
          : d3.mean(values, (d) => +d[yAxisProp]), // Average numerical values
      })
    ).sort((a, b) => a.age - b.age);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(groupedData, (d) => d.age))
      .range([0, innerWidth]);

    const yScale = isYCategorical
      ? d3
          .scalePoint()
          .domain([...new Set(filteredData.map((d) => d[yAxisProp]))])
          .range([innerHeight, 0])
          .padding(0.5)
      : d3
          .scaleLinear()
          .domain(d3.extent(groupedData, (d) => d[yAxisProp]))
          .nice()
          .range([innerHeight, 0]);

    // Line generator
    const line = d3
      .line()
      .x((d) => xScale(d.age))
      .y((d) => yScale(d[yAxisProp]))
      .curve(d3.curveMonotoneX);

    // Title (optional: you can customize or remove)
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10) // Just above the plot area
      .attr("text-anchor", "middle")
      .style("font-size", "28px")
      .style("font-weight", "bold")
      .text(profession ? `Profession: ${profession}` : "Line Plot");

    // Draw line path
    g.append("path")
      .datum(groupedData)
      .attr("class", "line-path")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#d35859")
      .attr("stroke-width", 2);

    // Draw axes
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .attr("class", "y-axis")
      .call(isYCategorical ? d3.axisLeft(yScale) : d3.axisLeft(yScale));

    // Axis labels
    g.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .text("Age");

    g.append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -margin.left + 15)
      .text(yAxisProp);

    // Add dots for data points
    g.selectAll(".dot")
      .data(groupedData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.age))
      .attr("cy", (d) => yScale(d[yAxisProp]))
      .attr("r", 4)
      .attr("fill", "black");

    // Interactivity: highlight line on hover
    g.select(".line-path")
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "orange").attr("stroke-width", 3);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#d35859").attr("stroke-width", 2);
      });
  }, [data, profession, yAxisProp, width, height, margin]);

  return <svg ref={svgRef} />;
};

export default LinePlot;
