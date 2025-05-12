import React, { useState, useEffect } from "react";
import "./App.css";
import Heatmap from "./components/Heatmap";
import ParallelCoordinatesPlot from "./components/ParallelCoordinatesPlot";
import Plot3RadarContainer from "./components/RadarContainer";
import BeeSwarmPlot from "./components/BeeSwarm";
import * as d3 from "d3";
import LinePlot from "./components/LinePlot";

const App = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [pcpData, setPcpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [lineplotData, setLinePlotData] = useState([]);
  const [yaxisValue, setYaxisValue] = useState(null);

  useEffect(() => {
    const processData = async () => {
      const financial = await d3.csv("/Data/financial_data.csv");
      setFinancialData(financial);
      const mental = await d3.csv("/Data/mental_health_data.csv");

      const cleanFinancial = financial.map((d) => ({
        profession: d.profession,
        debtAmount: +d.debt_amount,
        salary: +d.salary,
        age: +d.age,
        debtType: d.debt_type,
        maritalStatus: d.marital_status,
        hasKids: d.has_kids,
        savings: +d.savings,
        monthlyDebt: +d.monthly_debt_payment,
        costOfLiving: d.cost_of_living,
      }));

      const cleanMental = mental.map((d) => ({
        profession: d.Profession,
        financialStress: +d["Financial Stress"],
        depression: d.Depression,
        workHours: +d["Work/Study Hours"],
        age: +d.Age,
      }));

      const merged = cleanFinancial
        .map((f) => {
          const m = cleanMental.find(
            (m) => m.profession === f.profession && m.age === f.age
          );
          return m ? { ...f, ...m } : null;
        })
        .filter((d) => d && d.financialStress && d.depression);
      setLinePlotData(merged);
      const debtBins = [20000, 25000, 30000, 35000, 40000, 45000, 50000];

      const heatmap = d3
        .rollups(
          merged,
          (v) => d3.mean(v, (d) => d.financialStress),
          (d) => d.profession,
          (d) => debtBins.find((bin) => d.debtAmount < bin) || 50000
        )
        .flatMap(([profession, bins]) =>
          bins.map(([bin, stress]) => {
            const lower = bin - 5000;
            return {
              profession,
              debtLevel: `$${lower / 1000}k-$${bin / 1000}k`,
              stress: stress || 0,
            };
          })
        );

      const depressionScale = { Low: 1, Medium: 2, High: 3 };
      const pcp = merged.map((d) => ({
        profession: d.profession,
        salary: d.salary,
        debtRatio: d.debtAmount / (d.salary || 1),
        financialStress: d.financialStress,
        depression: depressionScale[d.depression] || 1,
      }));

      setHeatmapData(heatmap);
      setPcpData(pcp.slice(0, 100));
      setLoading(false);
    };

    processData();
  }, []);

  useEffect(() => {
    if (pcpData.length) setFilteredData(pcpData);
  }, [pcpData]);

  const handleCellClick = (profession, debtLevel) => {
    const lower = +debtLevel.split("-")[0].replace(/[$k]/g, "") * 1000;
    const upper = +debtLevel.split("-")[1].replace(/[$k]/g, "") * 1000;
    const matches = financialData.filter(
      (d) =>
        d.profession === profession &&
        +d.debt_amount >= lower &&
        +d.debt_amount < upper
    );

    if (matches.length > 0) {
      const avgSalary = d3.mean(matches, (d) => +d.salary);
      const avgDebt = d3.mean(matches, (d) => +d.monthly_debt_payment);
      const avgSavings = d3.mean(matches, (d) => +d.savings);

      setSelectedInfo({
        profession,
        debtLevel,
        matches: matches.length,
        avgSalary: avgSalary.toFixed(0),
        avgDebt: avgDebt.toFixed(0),
        avgSavings: avgSavings.toFixed(0),
        maritalStatus: matches[0].marital_status,
        hasKids: matches[0].has_kids,
        costOfLiving: matches[0].cost_of_living,
        stressLevel: "Moderate", // Placeholder - could compute based on logic
      });
    } else {
      setSelectedInfo({ profession, debtLevel });
    }
  };

  if (loading) return <div className="loading">Processing data...</div>;

  return (
    <div className="App">
      <h1>Debt, Profession & Mental Health Analytics</h1>
      <div className="dashboard5">
        <div className="dashboard-row">
          <div className="heatmap-component chart-container">
            <h3>Financial Stress by Profession & Debt</h3>
            <Heatmap data={heatmapData} onCellClick={handleCellClick} />
          </div>
          <div className="heatmap-component chart-container">
            <h3>Information Tab</h3>
            {selectedInfo ? (
              <div className="info-tab">
                <p>
                  <strong>Profession:</strong>{" "}
                  <strong>{selectedInfo.profession}</strong>
                </p>
                <p>
                  <strong>Debt Level:</strong>{" "}
                  <strong>{selectedInfo.debtLevel}</strong>
                </p>
                {selectedInfo.matches && (
                  <>
                    <p>
                      <strong>Matching Individuals:</strong>{" "}
                      <strong>{selectedInfo.matches}</strong>
                    </p>
                    <p>
                      <button
                        id="financialStress"
                        onClick={(e) => setYaxisValue(e.target.id)}
                      >
                        Financial Stress Level:
                      </button>{" "}
                      <strong>{selectedInfo.stressLevel}</strong>
                    </p>
                    <p>
                      <button
                        id="salary"
                        onClick={(e) => setYaxisValue(e.target.id)}
                      >
                        Average Salary:
                      </button>{" "}
                      ${selectedInfo.avgSalary}
                    </p>
                    <p>
                      <button
                        id="debtAmount"
                        onClick={(e) => setYaxisValue(e.target.id)}
                      >
                        Avg. Monthly Debt Payment:
                      </button>{" "}
                      ${selectedInfo.avgDebt}
                    </p>
                    <p>
                      <button
                        id="savings"
                        onClick={(e) => setYaxisValue(e.target.id)}
                      >
                        Avg. Savings:
                      </button>{" "}
                      ${selectedInfo.avgSavings}
                    </p>
                    <p>
                      <button
                        id="costOfLiving"
                        onClick={(e) => setYaxisValue(e.target.id)}
                      >
                        Avg. Cost of Living:
                      </button>{" "}
                      {selectedInfo.costOfLiving}
                    </p>
                    <p>
                      <button
                        id="maritalStatus"
                        onClick={(e) => setYaxisValue(e.target.id)}
                      >
                        Marital Status:
                      </button>{" "}
                      {selectedInfo.maritalStatus}
                    </p>
                    <p>
                      <button
                        id="hasKids"
                        onClick={(e) => setYaxisValue(e.target.id)}
                      >
                        Has Kids:
                      </button>{" "}
                      {selectedInfo.hasKids}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p>Click a block to see details.</p>
            )}
          </div>
          <div className="pcp-component chart-container">
            <h3>Multivariate Relationships</h3>
            <ParallelCoordinatesPlot data={pcpData} onBrush={setFilteredData} />
          </div>
        </div>
        <div className="dashboard-row">
          <div className="chart-container small-plot-3">
            <h3>Line Plot</h3>
            <LinePlot data={lineplotData} yAxisProp={yaxisValue} />
          </div>
          <div className="chart-container small-plot-2">
            <h3>Bee Swarm Plot</h3>
            <BeeSwarmPlot data={filteredData} />
          </div>
          <div className="chart-container small-plot-1">
            <h3>Radar Chart</h3>
            <Plot3RadarContainer financialData={financialData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
