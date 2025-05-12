// ParallelCoordinatesPlot.js
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ParallelCoordinatesPlot = ({ data, onBrush }) => {
const svgRef = useRef();
useEffect(() => {
if (!data.length) return;

const margin = { top: 30, right: 30, bottom: 30, left: 60 };
const width = 1000 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select(svgRef.current)
.attr('width', width + margin.left + margin.right)
.attr('height', height + margin.top + margin.bottom)
.append('g')
.attr('transform', `translate(${margin.left},${margin.top})`);
const dimensions = ['profession', 'salary', 'debtRatio', 'financialStress', 'depression'];

const y = {};
for (const dim of dimensions) {
y[dim] = d3.scaleLinear()
.domain(d3.extent(data, d => typeof d[dim] === 'string' ? d[dim].length : d[dim]))
.range([height, 0]);
}


const x = d3.scalePoint()
.range([0, width])
.domain(dimensions)
.padding(0.5);

// Draw lines
svg.selectAll('path')
.data(data)
.enter()
.append('path')
.attr('d', d => {
return d3.line()(dimensions.map(p => [x(p), y[p](typeof d[p] === 'string' ? d[p].length : d[p])]));
})
.style('fill', 'none')
.style('stroke', '#69b3a2')
.style('opacity', 0.5);

// Draw axes
dimensions.forEach(dim => {
svg.append('g')
.attr('transform', `translate(${x(dim)},0)`)
.attr('class', 'brush')
.call(d3.axisLeft(y[dim]));
});

// Add brushing
const brush = d3.brushY()
.on('start brush end', brushed);

dimensions.forEach(dim => {
svg.append('g')
.attr('transform', `translate(${x(dim)},0)`)
.attr('class', 'brush')
.call(brush);
});

function brushed(event) {
const actives = [];

// Select all brush groups
svg.selectAll('.brush')
.each(function(dim, i) {
const brushSelection = d3.brushSelection(this); // [y0, y1]
if (brushSelection) {
actives.push({
dimension: dimensions[i],
extent: brushSelection
});
}
});

// Filter the data
const selected = data.filter(d => {
return actives.every(active => {
const dim = active.dimension;
const scale = y[dim];
let val = d[dim];

// If the value is a string, use its length (or better: encode strings separately)
if (typeof val === 'string') val = val.length;

const pos = scale(val);
return pos >= active.extent[0] && pos <= active.extent[1];
});
});

// Send filtered data to parent
if (onBrush) {
onBrush(selected);
}
}

}, [data]);

return <svg
ref={svgRef}
/>
;
};

export default ParallelCoordinatesPlot;