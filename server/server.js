const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Placeholder data for BarChart
const channelTypesData = {
  'Gaming': 150,
  'Music': 200,
  'Education': 100,
  'Entertainment': 180,
  'Sports': 120,
  'Technology': 90,
  'Cooking': 80,
  'Travel': 70,
  'Fashion': 60,
  'Other': 50
};

// Placeholder data for BiPlot
const biPlotData = {
  xData: [1.2, 2.3, 3.1, 4.5, 2.8, 3.9, 1.5, 2.7, 3.4, 4.1],
  yData: [2.1, 3.2, 1.8, 4.3, 2.9, 3.7, 1.6, 2.8, 3.5, 4.2],
  clusters: [0, 1, 0, 2, 1, 2, 0, 1, 2, 2],
  variables: ['Views', 'Subscribers', 'Earnings', 'Uploads'],
  xVars: [3.2, 1.8, 4.1, 2.5],
  yVars: [2.8, 3.5, 1.9, 4.2]
};

// Placeholder data for LineGraph
const lineGraphData = [
  ['2015', 100],
  ['2016', 150],
  ['2017', 200],
  ['2018', 300],
  ['2019', 400],
  ['2020', 500],
  ['2021', 600],
  ['2022', 700],
  ['2023', 800]
];

// Placeholder data for ScatterPlot
const scatterPlotData = {
  xData: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
  yData: [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000],
  lineData: [400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000]
};

// Placeholder data for WorldMap
const worldMapData = {
  'United States': { count: 1000, subscribers: 5000000, video_views: 10000000, uploads: 5000, earnings: 1000000 },
  'India': { count: 800, subscribers: 4000000, video_views: 8000000, uploads: 4000, earnings: 800000 },
  'United Kingdom': { count: 600, subscribers: 3000000, video_views: 6000000, uploads: 3000, earnings: 600000 },
  'Brazil': { count: 500, subscribers: 2500000, video_views: 5000000, uploads: 2500, earnings: 500000 },
  'Germany': { count: 400, subscribers: 2000000, video_views: 4000000, uploads: 2000, earnings: 400000 }
};

// Placeholder data for DataTab
const dataTabStats = {
  'all': {
    views: 1000000,
    earnings: 50000,
    subscribers: 100000,
    uploads: 1000
  },
  'United States': {
    views: 1500000,
    earnings: 75000,
    subscribers: 150000,
    uploads: 1500
  }
};

// Routes
app.get('/api/channel-types', (req, res) => {
  res.json(channelTypesData);
});

app.get('/api/channel-stats', (req, res) => {
  res.json({
    totalChannels: Object.values(channelTypesData).reduce((a, b) => a + b, 0),
    topCategory: Object.entries(channelTypesData).sort((a, b) => b[1] - a[1])[0][0],
    averageChannels: Object.values(channelTypesData).reduce((a, b) => a + b, 0) / Object.keys(channelTypesData).length
  });
});

app.get('/api/biplot-data', (req, res) => {
  res.json(biPlotData);
});

app.get('/api/linegraph-data', (req, res) => {
  res.json(lineGraphData);
});

app.get('/api/scatterplot-data', (req, res) => {
  res.json(scatterPlotData);
});

app.get('/api/worldmap-data', (req, res) => {
  res.json(worldMapData);
});

app.get('/api/datatab-stats/:country', (req, res) => {
  const country = req.params.country;
  res.json(dataTabStats[country] || dataTabStats['all']);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 