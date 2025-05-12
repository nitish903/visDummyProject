import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const margin = { top: 45, right: 10, bottom: 100, left: 80 };
const width = 260;
const height = 180;

const Heatmap = ({ data, onCellClick }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const professions = Array.from(new Set(data.map(d => d.profession))).sort();
    const debtLevels = Array.from(new Set(data.map(d => d.debtLevel))).sort((a, b) => {
      const getLow = s => +s.replace(/[^0-9]/g, '').split('-')[0];
      return getLow(a) - getLow(b);
    });

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(debtLevels)
      .range([0, width])
      .padding(0.05);

    const y = d3.scaleBand()
      .domain(professions)
      .range([0, height])
      .padding(0.05);

    const minStress = d3.min(data, d => d.stress);
    const maxStress = d3.max(data, d => d.stress);

    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateRdYlGn)
      .domain([maxStress, minStress]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px");

    g.selectAll()
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.debtLevel))
      .attr("y", d => y(d.profession))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => colorScale(d.stress))
      .style("stroke", "#fff")
      .style("stroke-width", 1)
      .on("mouseover", function () {
        d3.select(this).style("stroke", "#333").style("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this).style("stroke", "#fff").style("stroke-width", 1);
      })
      .on("click", (event, d) => {
        if (onCellClick) {
          onCellClick(d.profession, d.debtLevel);
        }
      });

    svg.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", margin.top + height + 60)
      .attr("text-anchor", "middle")
      .style("font-size", "15px")
      .text("Debt Level");

    svg.append("text")
      .attr("transform", `translate(${margin.left - 60},${margin.top + height / 2}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .style("font-size", "15px")
      .text("Profession");
  }, [data, onCellClick]);

  return (
    <svg
      ref={svgRef}
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}
      style={{ background: "white", borderRadius: "20px", width: "100%", height: "auto", maxWidth: 360 }}
    />
  );
};

export default Heatmap;
