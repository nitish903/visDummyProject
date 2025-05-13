import React, { useRef, useCallback, useEffect } from "react";
import * as d3 from "d3";

const BeeSwarmPlot = ({
  data,
  width = 600,
  height = 400,
  onPointClick = () => {},
  selectedPoint = null,
}) => {
  const svgRef = useRef();
  const margin = { top: 30, right: 30, bottom: 60, left: 60 };
  const legendData = [
    { label: "Depression", color: "#ff4d4d" },
    { label: "No Depression", color: "blueviolet" },
  ];

  const drawChart = useCallback(() => {
    if (!data.length) return null;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const mainGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Sort professions alphabetically
    const professions = [...new Set(data.map((d) => d.profession))].sort(
      (a, b) => a.localeCompare(b)
    );
    const legendGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left}, ${height - margin.bottom / 2 + 20})`
      );

    legendData.forEach((item, index) => {
      const legendItem = legendGroup
        .append("g")
        .attr("transform", `translate(${index * 150}, 0)`); // space between items

      legendItem
        .append("circle")
        .attr("r", 5)
        .attr("cx", 0)
        .attr("cy", 0)
        .style("fill", item.color);

      legendItem
        .append("text")
        .attr("x", 10)
        .attr("y", 0)
        .attr("dominant-baseline", "middle")
        .style("font-size", "12px")
        .text(item.label);
    });

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(professions)
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d.financialStress))
      .nice()
      .range([innerHeight, 0]);

    // Simulation setup
    const simulation = d3
      .forceSimulation()
      .alphaDecay(0.05)
      .force(
        "x",
        d3
          .forceX((d) => xScale(d.profession) + xScale.bandwidth() / 2)
          .strength(0.5)
      )
      .force("y", d3.forceY((d) => yScale(d.financialStress)).strength(1))
      .force("collide", d3.forceCollide(4))
      .stop();

    // Initialize positions
    data.forEach((d) => {
      d.x = xScale(d.profession) + xScale.bandwidth() / 2;
      d.y = yScale(d.financialStress);
    });

    // Run simulation
    simulation.nodes(data);
    for (let i = 0; i < 150; i++) simulation.tick();
    if (selectedPoint) {
      const selectedProfession = selectedPoint.profession;
      const selectedY = selectedPoint.y;

      const yThreshold = 15;

      const clusterPoints = data.filter(
        (d) =>
          d.profession === selectedProfession &&
          Math.abs(d.y - selectedY) <= yThreshold
      );

      if (clusterPoints.length > 1) {
        const xValues = clusterPoints.map((d) => d.x);
        const yValues = clusterPoints.map((d) => d.y);

        const xMin = d3.min(xValues);
        const xMax = d3.max(xValues);
        const yMin = d3.min(yValues);
        const yMax = d3.max(yValues);

        const xCenter = (xMin + xMax) / 2;
        const yCenter = (yMin + yMax) / 2;

        // Increased padding for bigger ellipse
        const xRadius = (xMax - xMin) / 2 + 12; // was +6
        const yRadius = (yMax - yMin) / 2 + 18; // was +6

        mainGroup
          .append("ellipse")
          .attr("cx", xCenter)
          .attr("cy", yCenter)
          .attr("rx", xRadius)
          .attr("ry", yRadius)
          .style("fill", "none")
          .style("stroke", "red")
          .style("stroke-width", 2)
          .lower();
      }
    }

    // Draw circles with transitions and hover effect
    mainGroup
      .selectAll("circle")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", 0)
            .style("fill", (d) =>
              selectedPoint && d === selectedPoint
                ? "yellow"
                : d.depression === 1
                ? "#ff4d4d"
                : "blueviolet"
            )
            .style("stroke", (d) =>
              selectedPoint && d === selectedPoint ? "yellow" : "none"
            )
            .style("stroke-width", (d) =>
              selectedPoint && d === selectedPoint ? 2 : 0
            )
            .call((enter) =>
              enter
                .transition()
                .duration(600)
                .attr("r", 4)
                .style("opacity", 0.7)
            )
            .on("click", (event, d) => onPointClick(d))
            // --- HOVER HANDLERS ---
            .on("mouseover", function (event, d) {
              d3.select(this).style("fill", "yellow");
            })
            .on("mouseout", function (event, d) {
              const originalColor =
                selectedPoint && d === selectedPoint
                  ? "yellow"
                  : d.depression === 1
                  ? "#ff4d4d"
                  : "blueviolet";
              d3.select(this).style("fill", originalColor);
            }),
        (update) => update,
        (exit) => exit.remove()
      )
      .append("title")
      .text(
        (d) =>
          `${d.profession}\nStress: ${d.financialStress}\nDepression: ${d.depression}\nDebtRatio: ${d.debtRatio}\nSalary: ${d.salary}`
      );

    // Axes
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);

    mainGroup
      .append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

    mainGroup
      .append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .text("Financial Stress Level");
  }, [data, width, height, margin, selectedPoint, onPointClick]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  return <svg ref={svgRef} />;
};

export default React.memo(BeeSwarmPlot, (prevProps, nextProps) => {
  return prevProps.selectedPoint === nextProps.selectedPoint;
});
