import React, { useState, useEffect } from 'react';
import './App.css';
import Heatmap from './components/Heatmap';
import BiPlot from './components/BiPlot';
import ParallelCoordinatesPlot from './components/ParallelCoordinatesPlot';
import Plot3RadarContainer from './components/RadarContainer';
import BeeSwarmPlot from './components/BeeSwarm';
import * as d3 from 'd3';


const App = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [pcpData, setPcpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [financialData,setFinancialData]=useState([])
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const processData = async () => {
      const financial = await d3.csv('/Data/financial_data.csv');
      setFinancialData(financial)
      const mental = await d3.csv('/Data/mental_health_data.csv');
      const cleanFinancial = financial.map(d => ({
        profession: d.profession,
        debtAmount: +d.debt_amount,
        salary: +d.salary,
        age: +d.age,
        debtType: d.debt_type
      }));
      const cleanMental = mental.map(d => ({
        profession: d.Profession,
        financialStress: +d['Financial Stress'],
        depression: d.Depression,
        workHours: +d['Work/Study Hours'],
        age: +d.Age
      }));
      const merged = cleanFinancial.map(f => {
        const m = cleanMental.find(m => 
          m.profession === f.profession && m.age === f.age
        );
        console.log("DATA IS",m)
        return m ? {...f, ...m} : f;
      }).filter(d => d.financialStress && d.depression);

      const debtBins = [0, 10000, 20000, 30000, 40000, 50000];
      const heatmap = d3.rollups(
        merged,
        v => d3.mean(v, d => d.financialStress),
        d => d.profession,
        d => debtBins.find(bin => d.debtAmount < bin) || 50000
      ).flatMap(([profession, bins]) => 
        bins.map(([bin, stress]) => ({
          profession,
          debtLevel: `$${(bin - 10000)/1000}k-$${bin/1000}k`,
          stress: stress || 0
        }))
      );

      const depressionScale = { 'Low': 1, 'Medium': 2, 'High': 3 };
      const pcp = merged.map(d => ({
        profession: d.profession,
        salary: d.salary,
        debtRatio: d.debtAmount / (d.salary || 1),
        financialStress: d.financialStress,
        depression: depressionScale[d.depression] || 1
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
  
  if (loading) return <div className="loading">Processing data...</div>;

  return (
<div className="App">
  <h1>Debt, Profession & Mental Health Analytics</h1>
  <div className="dashboard5">
    {/* First row */}
    <div className='dashboard-row'>
    <div className="heatmap-component chart-container">
      <h3>Financial Stress by Profession & Debt</h3>
      <Heatmap data={heatmapData} />
    </div>
    <div className="pcp-component chart-container">
      <h3>Multivariate Relationships</h3>
      <ParallelCoordinatesPlot data={pcpData} onBrush={setFilteredData}/>
    </div>
    </div>
    {/* Second row */}
    <div className='dashboard-row'>
    <div className="chart-container small-plot-1">
      <h3>Radar Chart</h3>
      <Plot3RadarContainer financialData={financialData}/>
    </div>
    <div className="chart-container small-plot-2">
      <h3>Bee Swarm Plot</h3>
      <BeeSwarmPlot data={filteredData}/>
    </div>
    <div className="chart-container small-plot-3">
      <h3>Plot 5 Title</h3>
      <div className="placeholder-content">Coming soon...</div>
    </div>
    </div>
  </div>
</div>

  );
};

export default App;
