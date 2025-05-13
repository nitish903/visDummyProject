import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const margin = { top: 40, right: 20, bottom: 50, left: 60 }; // Reduced margins
const width = 400; // Increased width
const height = 350;

const Heatmap = ({ data, onCellClick }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const professions = Array.from(
      new Set(data.map((d) => d.profession))
    ).sort();
    const debtLevels = Array.from(new Set(data.map((d) => d.debtLevel))).sort(
      (a, b) => {
        const getLow = (s) => +s.replace(/[^0-9]/g, "").split("-")[0];
        return getLow(a) - getLow(b);
      }
    );

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale
    const minStress = d3.min(data, (d) => d.stress);
    const maxStress = d3.max(data, (d) => d.stress);
    const colorScale = d3
      .scaleSequential()
      .interpolator(d3.interpolateRdYlGn)
      .domain([maxStress, minStress]);

    // Vertical legend
    const legendWidth = 10;
    const legendHeight = 100;
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left - 63},${margin.top + 20})`);

    // Legend gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "verticalGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(maxStress)); // Red (high)
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(minStress)); // Green (low)

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#verticalGradient)");

    legend.append("text")
      .attr("x", legendWidth + 5)
      .attr("y", 8)
      .style("font-size", "10px")
      .text("High");

    legend.append("text")
      .attr("x", legendWidth + 5)
      .attr("y", legendHeight - 2)
      .style("font-size", "10px")
      .text("Low");

    // Scales
    const x = d3.scaleBand()
      .domain(debtLevels)
      .range([0, width])
      .padding(0.05);

    const y = d3.scaleBand()
      .domain(professions)
      .range([0, height])
      .padding(0.05);

    // Title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .style("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("margin","20px")
      .text("Financial Stress by Profession & Debt");

    // Heatmap cells
    g.selectAll("rect")
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
      .on("mouseover", function(event, d) {
        d3.select(this).style("stroke", "#333").style("stroke-width", 2);
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          ...d
        });
      })
      .on("mouseout", function() {
        d3.select(this).style("stroke", "#fff").style("stroke-width", 1);
        setTooltip(null);
      })
      .on("click", (event, d) => onCellClick?.(d.profession, d.debtLevel));

    // Cell labels
    g.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .text(d => d3.format(".1f")(d.stress))
      .attr("x", d => x(d.debtLevel) + x.bandwidth()/2)
      .attr("y", d => y(d.profession) + y.bandwidth()/2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "10px")
      .style("fill", d => {
        const luminance = d3.hsl(colorScale(d.stress)).l;
        return luminance > 0.6 ? "#222" : "#fff";
      });

    // Axes
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

    // Axis labels
    svg.append("text")
      .attr("x", margin.left + width/2)
      .attr("y", margin.top + height + 50)
      .style("text-anchor", "middle")
      .text("Debt Level");

    svg.append("text")
      .attr("transform", `translate(${margin.left - 40},${margin.top + height/2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Profession");

  }, [data, onCellClick]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "600px" }}>
      <svg
        ref={svgRef}
        style={{
          background: "white",
          borderRadius: "20px",
          width: "100%",
          height: "auto"
        }}
      />
      {tooltip && (
        <div style={{
          position: "fixed",
          left: tooltip.x + 15,
          top: tooltip.y + 15,
          background: "white",
          padding: "8px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          pointerEvents: "none",
          zIndex: 10
        }}>
          <strong>{tooltip.profession}</strong><br/>
          Debt: {tooltip.debtLevel}<br/>
          Stress: {tooltip.stress.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default Heatmap;
