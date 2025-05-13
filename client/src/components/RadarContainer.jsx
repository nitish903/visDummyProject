import React, { useState, useMemo } from "react";
import RadarChart from "./RadarChart";
import * as d3 from "d3";

// Updated radar variables
const radarVariables = [
  {
    key: "satisfaction",
    label: "Satisfaction",
    domain: [1, 5],
    type: "numerical",
  },
  {
    key: "depression",
    label: "Depression",
    categories: ["No", "Yes"],
    type: "categorical",
  },
  {
    key: "diet",
    label: "Diet Quality",
    categories: ["Poor", "Moderate", "Excellent"],
    type: "categorical",
  },
  {
    key: "sleep",
    label: "Sleep Hours",
    categories: [
      "<6 hours",
      "6-7 hours",
      "7-8 hours",
      "8+ hours",
      "More than 8 hours",
    ],
    type: "categorical",
  },
  {
    key: "workHours",
    label: "Work Hours",
    domain: [0, 12],
    type: "numerical",
  },
];

const Plot3RadarContainer = ({ financialData }) => {
  const degrees = [
    "B.Tech",
    "BE",
    "BA",
    "BSc",
    "B.Com",
    "MBA",
    "MSc",
    "MA",
    "PhD",
    "MBBS",
  ];
  const [selectedDegree, setselectedDegree] = useState(degrees[0] || "");

  // Helper to compute mode for categorical variables
  const mode = (values) => {
    const frequency = {};
    values.forEach((v) => {
      if (v != null && v !== "") {
        frequency[v] = (frequency[v] || 0) + 1;
      }
    });
    return Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  };

  const degreeData = useMemo(() => {
    const rows = financialData.filter((d) => d.degree === selectedDegree);
    if (!rows.length) return {};

    const result = {};
    radarVariables.forEach((v) => {
      const values = rows.map((r) => r[v.key]);
      if (v.type === "numerical") {
        result[v.key] = d3.mean(values, (d) => +d || 0);
      } else if (v.type === "categorical") {
        result[v.key] = mode(values);
      }
    });
    return result;
  }, [financialData, selectedDegree]);

  return (
    <div>
      <div style={{ marginBottom: "12px" }}>
        <label>
          <b>Degree:&nbsp;</b>
          <select
            value={selectedDegree}
            onChange={(e) => setselectedDegree(e.target.value)}
            style={{ fontSize: "1em", padding: "4px 8px", borderRadius: "6px" }}
          >
            {degrees.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>
      <RadarChart
        key={selectedDegree}
        data={degreeData}
        variables={radarVariables}
        width={320}
        height={320}
      />
    </div>
  );
};

export default Plot3RadarContainer;
