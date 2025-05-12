import React, { useState, useMemo } from "react";
import RadarChart from "./RadarChart";
import * as d3 from 'd3';

// Example: variables to show on radar
const radarVariables = [
  { key: "salary", label: "Salary", domain: [0, 200000] },
  { key: "debt_amount", label: "Debt Amount", domain: [0, 150000] },
  { key: "monthly_debt_payment", label: "Monthly Payment", domain: [0, 5000] },
  { key: "savings", label: "Savings", domain: [0, 100000] },
];

const Plot3RadarContainer = ({ financialData }) => {
  // Get unique professions
  const professions = useMemo(
    () => Array.from(new Set(financialData.map(d => d.profession))).sort(),
    [financialData]
  );
  const [selectedProfession, setSelectedProfession] = useState(professions[0] || "");

  // Aggregate data for the selected profession
  const professionData = useMemo(() => {
    const rows = financialData.filter(d => d.profession === selectedProfession);
    if (!rows.length) return {};
    // Use mean for each variable
    const mean = key => d3.mean(rows, r => +r[key] || 0);
    const result = {};
    radarVariables.forEach(v => {
      result[v.key] = mean(v.key);
    });
    return result;
  }, [financialData, selectedProfession]);
console.log("DATA IS",professionData)
  return (
    <div>
      <div style={{ marginBottom: "12px" }}>
        <label>
          <b>Profession:&nbsp;</b>
          <select
            value={selectedProfession}
            onChange={e => setSelectedProfession(e.target.value)}
            style={{ fontSize: "1em", padding: "4px 8px", borderRadius: "6px" }}
          >
            {professions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <RadarChart
        key={selectedProfession}
        data={professionData}
        variables={radarVariables}
        width={320}
        height={320}
      />
    </div>
  );
};

export default Plot3RadarContainer;
