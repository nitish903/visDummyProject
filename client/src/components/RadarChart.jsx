import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const RadarChart = ({ data, variables, width = 300, height = 300 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !variables.length) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const radius = Math.min(width, height) / 2 - 40;
    const center = { x: width / 2, y: height / 2 };
    const angleSlice = (2 * Math.PI) / variables.length;

    // Scales for each variable
    const scales = {};
    variables.forEach((v) => {
      scales[v.key] = d3.scaleLinear().domain(v.domain).range([0, radius]);
    });

    // Radar line
    const line = d3
      .lineRadial()
      .radius((d, i) => scales[variables[i].key](d.value))
      .angle((d, i) => i * angleSlice);

    // Prepare data for radar
    const radarData = variables.map((v) => ({
      axis: v.label,
      value: +data[v.key] || 0,
    }));

    // SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    svg.selectAll("*").remove();
    // Draw grid
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      svg
        .append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("r", (radius / levels) * level)
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-dasharray", "2,2");
    }

    // Draw axes
    variables.forEach((v, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      svg
        .append("line")
        .attr("x1", center.x)
        .attr("y1", center.y)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#bbb");
      // Axis labels
      svg
        .append("text")
        .attr("x", center.x + Math.cos(angle) * (radius + 15))
        .attr("y", center.y + Math.sin(angle) * (radius + 15))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-size", "12px")
        .text(v.label);
    });

    // Draw radar area
    svg
      .append("path")
      .datum(radarData)
      .attr("d", line)
      .attr("transform", `translate(${center.x},${center.y})`)
      .attr("fill", "#a10802")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "#a10802")
      .attr("stroke-width", 2);

    // Draw data points
    radarData.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = scales[variables[i].key](d.value);
      svg
        .append("circle")
        .attr("cx", center.x + Math.cos(angle) * r)
        .attr("cy", center.y + Math.sin(angle) * r)
        .attr("r", 4)
        .attr("fill", "#d35859");
    });
  }, [data, variables, width, height]);

  return <svg ref={svgRef} />;
};

export default RadarChart;
