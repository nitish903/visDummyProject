import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import "../App.css";

const ParallelCoordinatesPlot = ({ data, onBrush }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data.length) return;

    // SVG dimensions
    const margin = { top: 10, right: 30, bottom: 40, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

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
      .data(data, (d, i) => i)
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
      .style("stroke", "#69b3a2")
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
            .style("stroke", "#69b3a2")
            .style("stroke-width", 1)
            .style("opacity", 0.5);
        }
      })
      .on("click", function (event, d) {
        // Deselect all
        svg
          .selectAll(".pcp-line")
          .classed("selected", false)
          .style("stroke", "#69b3a2")
          .style("stroke-width", 1)
          .style("opacity", 0.5);

        // Select this
        d3.select(this)
          .classed("selected", true)
          .style("stroke", "red")
          .style("stroke-width", 3)
          .style("opacity", 1);

        // Notify parent
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
      const selected = data.filter((d) =>
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

  return <svg ref={svgRef} />;
};

export default ParallelCoordinatesPlot;
