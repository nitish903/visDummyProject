import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import "../App.css";

const ParallelCoordinatesPlot = ({ data, main_profession, onBrush, onResetProfession }) => {
  const svgRef = useRef();
  const prettyLabels = {
    profession: "Profession",
    salary: "Salary",
    debtRatio: "Debt Ratio",
    financialStress: "Financial Stress",
    depression: "Depression",
  };
  const filteredData = main_profession
  ? data.filter((d) => d.profession === main_profession)
  : data;
  useEffect(() => {
    if (!data.length) return;
    // SVG dimensions
    const margin = { top: 50, right: 30, bottom: 40, left: 60 };
    const width = 1100 - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create main group
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Dimensions to plot
    const dimensions = [
      "profession",
      "salary",
      "debtRatio",
      "financialStress",
      "depression",
    ];
    // Color scale based on profession
    const color = d3
      .scaleOrdinal()
      .domain([...new Set(data.map((d) => d.profession))])
      .range(d3.schemeCategory10); // or any D3 categorical palette

    // Y scales
    const y = {};
    for (const dim of dimensions) {
      y[dim] = d3
        .scaleLinear()
        .domain(
          d3.extent(data, (d) =>
            typeof d[dim] === "string" ? d[dim].length : d[dim]
          )
        )
        .range([height, 0]);
    }

    // X scale
    const x = d3.scalePoint().range([0, width]).domain(dimensions).padding(0.5);

    // Path generator
    const lineGen = d3.line();
    // Draw lines (one per data row)
const paths = svg
  .selectAll(".pcp-line")
.data(filteredData, (d, i) => i)
  .join("path")
  .attr("class", "pcp-line")
  .attr("d", (d) =>
    lineGen(
      dimensions.map((p) => [
        x(p),
        y[p](typeof d[p] === "string" ? d[p].length : d[p]),
      ])
    )
  )
  .style("fill", "none")
  .style("stroke", (d) => color(d.profession))
  .style("stroke-width", 1)
  .style("opacity", 0.5)
  .on("mouseover", function (event, d) {
    if (!d3.select(this).classed("selected")) {
      d3.select(this)
        .style("stroke", "orange")
        .style("stroke-width", 3)
        .style("opacity", 1);
    }
  })
  .on("mouseout", function (event, d) {
    if (!d3.select(this).classed("selected")) {
      d3.select(this)
        .style("stroke", color(d.profession))
        .style("stroke-width", 1)
        .style("opacity", 0.5);
    }
  })
  .on("click", function (event, d) {
    svg
      .selectAll(".pcp-line")
      .classed("selected", false)
      .style("stroke", (d) => color(d.profession))
      .style("stroke-width", 1)
      .style("opacity", 0.5);

    d3.select(this)
      .classed("selected", true)
      .style("stroke", "red")
      .style("stroke-width", 3)
      .style("opacity", 1);

    if (onBrush) onBrush([d]);
  });

    // Draw axes
    svg
      .selectAll(".axis")
      .data(dimensions)
      .join("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${x(d)},0)`)
      .each(function (dim) {
        d3.select(this).call(d3.axisLeft(y[dim]));

        // 👉 Append axis label
        d3.select(this)
          .append("text")
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .style("fill", "black")
          .style("font-size", "12px")
          .text(prettyLabels[dim] || dim);
      });

    // Brushing
    const brush = d3
      .brushY()
      .extent([
        [-10, 0],
        [10, height],
      ])
      .on("start brush end", brushed);

    // Add one brush per axis
    svg
      .selectAll(".brush")
      .data(dimensions)
      .join("g")
      .attr("class", "brush")
      .attr("transform", (d) => `translate(${x(d)},0)`)
      .each(function (dim) {
        d3.select(this).call(brush);
      });

    function brushed(event) {
      // Deselect all lines
      svg
        .selectAll(".pcp-line")
        .classed("selected", false)
        .style("stroke", "#69b3a2")
        .style("stroke-width", 1)
        .style("opacity", 0.5);

      // Find active brushes
      const actives = [];
      svg.selectAll(".brush").each(function (dim, i) {
        const brushSelection = d3.brushSelection(this);
        if (brushSelection) {
          actives.push({
            dimension: dimensions[i],
            extent: brushSelection,
          });
        }
      });

      // Filter data
 const selected = filteredData.filter((d) =>
        actives.every((active) => {
          const dim = active.dimension;
          const scale = y[dim];
          let val = d[dim];
          if (typeof val === "string") val = val.length;
          const pos = scale(val);
          return pos >= active.extent[0] && pos <= active.extent[1];
        })
      );

      // Highlight selected lines
      svg
        .selectAll(".pcp-line")
        .filter((d) => selected.includes(d))
        .classed("selected", true)
        .style("stroke", "red")
        .style("stroke-width", 3)
        .style("opacity", 1);

      // Notify parent
      if (onBrush) onBrush(selected);
    }

    // Cleanup function
    return () => {
      d3.select(svgRef.current).selectAll("*").remove();
    };
  }, [data, onBrush]);

  return <div style={{ display: "flex", alignItems: "center" }}>
  <button
    style={{
      marginRight: "10px",
      padding: "6px 10px",
      fontSize: "12px",
      cursor: "pointer",
      backgroundColor: "#f0f0f0",
      border: "1px solid #ccc",
      borderRadius: "4px",
      marginTop: "-300px",
      position:"absolute",
    }}
    onClick={() => onResetProfession && onResetProfession()}
  >
    Reset
  </button>
  <svg ref={svgRef} />
</div>

};

export default ParallelCoordinatesPlot;
