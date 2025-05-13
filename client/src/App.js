import React, { useState, useEffect, useMemo } from "react";
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
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [lineplotData, setLinePlotData] = useState([]);
  const [yaxisValue, setYaxisValue] = useState("financialStress");
  const [radarData, setRadarData] = useState([]);
  const memoizedPCPData = useMemo(() => pcpData, [pcpData]);
const [mainProfession, setMainProfession] = useState(null);
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
        // gender: d.Gender,
        satisfaction: +d.Satisfaction,
        diet: d["Dietary Habits"],
        degree: d.Degree,
        suicidal: d["Have you ever had suicidal thoughts ?"],
        student: d["Working Professional or Student"],
        sleep: d["Sleep Duration"],
        family_mental: d["Family History of Mental Illness"],
      }));
      setRadarData(cleanMental);
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
          bins.map(([bin, stress]) => ({
            profession,
            debtLevel: `$${(bin - 5000) / 1000}k-$${bin / 1000}k`,
            stress: stress || 0,
          }))
        );
      const depressionScale = { "No":0, "Yes":1 };
      const pcp = merged.map((d) => ({
        profession: d.profession,
        salary: d.salary,
        debtRatio: d.debtAmount / (d.salary || 1),
        financialStress: d.financialStress,
        depression: depressionScale[d.depression],
      }));

      setHeatmapData(heatmap);
      setPcpData(pcp.slice(0, 100));
      setLoading(false);
    };

    processData();
  }, []);

  const handleCellClick = (profession, debtLevel) => {
    const heatmapEntry = heatmapData.find(
      (d) => d.profession === profession && d.debtLevel === debtLevel
    );
    const stressValue = heatmapEntry?.stress || 0;

    // Get all stress values for dynamic calculation
    const allStressValues = heatmapData
      .map((d) => d.stress)
      .filter((v) => !isNaN(v));
    const sortedStress = [...allStressValues].sort((a, b) => a - b);

    // Calculate quartiles dynamically
    const q1 = d3.quantile(sortedStress, 0.25); // 25th percentile
    const q3 = d3.quantile(sortedStress, 0.75); // 75th percentile

    let stressLevel = "Moderate";
    if (stressValue > q3) stressLevel = "High";
    else if (stressValue < q1) stressLevel = "Low";

    const lower = +debtLevel.split("-")[0].replace(/[^\d]/g, "") * 1000;
    const upper = +debtLevel.split("-")[1].replace(/[^\d]/g, "") * 1000;

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
        stressLevel,
        stressValue: stressValue.toFixed(2),
      });
    } else {
      setSelectedInfo({
        profession,
        debtLevel,
        stressLevel,
        stressValue: stressValue.toFixed(2),
      });
    }
         setMainProfession(selectedInfo?.profession)
  };

  if (loading) return <div className="loading">Processing data...</div>;
  return (
    <div className="App">
      <h1 className="chart-heading large-font">Debt, Profession & Mental Health Analytics</h1>

      <div className="dashboard5">
        <div className="dashboard-row first-row">
          {/* Heatmap */}
          <div className="chart-wrapper">
            <h3 className="chart-heading heatmap-heading">
              Financial Stress by Profession and Debt
            </h3>

            <div className="heatmap-component chart-container">
                <Heatmap data={heatmapData} onCellClick={handleCellClick} />
            </div>
          </div>

          {/* Info Tab */}
          <div className="chart-wrapper info">
            <h3 className="chart-heading info-heading">Information Tab</h3>
            <div className="chart-container" style={{ flex: 0.8 }}>
              {selectedInfo ? (
                <div className="info-tab">
                  <p>
           <strong>Profession: </strong>
                    {selectedInfo.profession} 
                  </p>
                  <p>
                    <strong>Debt Level:</strong> {selectedInfo.debtLevel}
                  </p>
                  {selectedInfo.matches && (
                    <>
                      <p>
                        <strong>Individuals:</strong> {selectedInfo.matches}
                      </p>
                      <p>
                        <button
                          className="info-button"
                          onClick={() => setYaxisValue("financialStress")}
                        >
                          Stress Level:
                        </button>
                        <span
                          className={`stress-${selectedInfo.stressLevel.toLowerCase()}`}
                        >
                          {selectedInfo.stressLevel} ({selectedInfo.stressValue}
                          )
                        </span>
                      </p>

                      <p>
                        <button
                          className="info-button"
                          onClick={() => setYaxisValue("salary")}
                        >
                          Avg Salary:
                        </button>
                        ${selectedInfo.avgSalary}
                      </p>

                      <p>
                        <button
                          className="info-button"
                          onClick={() => setYaxisValue("monthlyDebt")}
                        >
                          Avg Debt:
                        </button>
                        ${selectedInfo.avgDebt}
                      </p>

                      <p>
                        <button
                          className="info-button"
                          onClick={() => setYaxisValue("savings")}
                        >
                          Avg Savings:
                        </button>
                        ${selectedInfo.avgSavings}
                      </p>

                      <p>
                        <button
                          className="info-button"
                          onClick={() => setYaxisValue("costOfLiving")}
                        >
                          Cost of Living:
                        </button>
                        {selectedInfo.costOfLiving}
                      </p>

                      <p>
                        <button
                          className="info-button"
                          onClick={() => setYaxisValue("maritalStatus")}
                        >
                          Marital Status:
                        </button>
                        {selectedInfo.maritalStatus}
                      </p>

                      <p>
                        <button
                          className="info-button"
                          onClick={() => setYaxisValue("hasKids")}
                        >
                          Has Kids:
                        </button>
                        {selectedInfo.hasKids}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <p>Click a heatmap block to see details</p>
              )}
            </div>
          </div>
          {/* Parallel Coordinates */}
          <div className="chart-wrapper pcp">
            <h3 className="chart-heading pcp-heading">Multivariate Plot</h3>
            <div className="pcp-component chart-container">
                                <ParallelCoordinatesPlot
    data={pcpData}
    main_profession={mainProfession}
    onBrush={(selected) => {
                    setSelectedPoint(
                      selected.length === 1 ? selected[0] : null
                    );
                  }}
    onResetProfession={() => setMainProfession(null)}
  />
            </div>
          </div>
        </div>

        <div className="dashboard-row">
          {/* Line Plot */}
          <div className="chart-wrapper">
            <h3 className="chart-heading">Debt Over Time</h3>
            <div className="chart-container small-plot-3">
                <LinePlot data={lineplotData} profession={selectedInfo?.profession} yAxisProp={yaxisValue} />
              </div>
          </div>
          {/* Bee Swarm */}
          <div className="chart-wrapper">
            <h3 className="chart-heading">Bee Swarm Plot</h3>
            <div className="chart-container small-plot-2">
                <BeeSwarmPlot
                  data={memoizedPCPData}
                  selectedPoint={selectedPoint}
                />
            </div>
          </div>

          {/* Radar Chart */}
          <div className="chart-wrapper">
            <h3 className="chart-heading">Radar Chart for Degree </h3>
            <div className="chart-container small-plot-1">
                <Plot3RadarContainer financialData={radarData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
