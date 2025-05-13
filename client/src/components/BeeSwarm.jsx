import React, { useRef, useCallback, useEffect, useMemo } from "react";
import * as d3 from "d3";

const BeeSwarmPlot = ({
  data,
  width = 500,
  height = 300,
  onPointClick = () => {},
  selectedPoint = null,
}) => {
  const svgRef = useRef();
  const margin = { top: 30, right: 30, bottom: 60, left: 60 };

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

    // Draw circles with transitions
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
    ? "orange"
    : d.depression === "Yes"
    ? "#ff4d4d"
    : "#69b3a2"
)
.style("stroke", (d) => (selectedPoint && d === selectedPoint ? "black" : "none"))
.style("stroke-width", (d) => (selectedPoint && d === selectedPoint ? 2 : 0))

            .call((enter) =>
              enter
                .transition()
                .duration(600)
                .attr("r", 4)
                .style("opacity", 0.7)
            )
            .on("click", (event, d) => onPointClick(d)),
        (update) => update,
        (exit) => exit.remove()
      )
      .append("title")
      .text(
        (d) =>
          `${d.profession}\nStress: ${d.financialStress}\nDepression: ${d.depression}`
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
  }, [data, width, height, margin]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  return (
    <div className="chart-container">
      <svg ref={svgRef} />
      <div className="legend">
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#ff4d4d" }}
          />
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#69b3a2" }}
          />
        </div>
      </div>
    </div>
  );
};

// export default BeeSwarmPlot;

export default React.memo(BeeSwarmPlot, (prevProps, nextProps) => {
  return prevProps.selectedPoint === nextProps.selectedPoint;
});
// CSS for the component (add to your stylesheet)
/*
.chart-container {
  position: relative;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.legend {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.9);
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}
*/
