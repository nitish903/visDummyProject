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

    // Scales
    const scales = {};
    variables.forEach((v) => {
      if (v.type === "numerical") {
        scales[v.key] = d3.scaleLinear().domain(v.domain).range([0, radius]);
      } else if (v.type === "categorical") {
        // Map category to index (0 to categories.length - 1)
        scales[v.key] = d3
          .scalePoint()
          .domain(v.categories)
          .range([0, radius])
          .padding(0.5);
      }
    });

    // Radar data: convert categorical values to positions
    const radarData = variables.map((v) => {
      const rawValue = data[v.key];
      let value = 0;
      if (v.type === "numerical") {
        value = +rawValue || 0;
      } else if (v.type === "categorical") {
        value = v.categories.includes(rawValue) ? rawValue : v.categories[0];
      }
      return { axis: v.label, value, key: v.key, rawValue };
    });

    // Line generator
    const line = d3
      .lineRadial()
      .radius((d, i) => {
        const v = variables[i];
        const scale = scales[v.key];
        return v.type === "numerical" ? scale(d.value) : scale(d.value) ?? 0;
      })
      .angle((d, i) => i * angleSlice);

    // SVG setup
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Draw grid circles
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

    // Draw axes and labels
    variables.forEach((v, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;

      // Axis line
      svg
        .append("line")
        .attr("x1", center.x)
        .attr("y1", center.y)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#bbb");

      // Label
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
      const v = variables[i];
      const scale = scales[v.key];
      const angle = angleSlice * i - Math.PI / 2;
      const r = v.type === "numerical" ? scale(d.value) : scale(d.value) ?? 0;

      const cx = center.x + Math.cos(angle) * r;
      const cy = center.y + Math.sin(angle) * r;

      svg
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 4)
        .attr("fill", "#d35859");

      // Optional: show raw value as tooltip
      svg.append("title").text(`${v.label}: ${d.rawValue}`);
    });
  }, [data, variables, width, height]);

  return <svg ref={svgRef} />;
};

export default RadarChart;
