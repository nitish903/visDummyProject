import React from 'react';
import './styles/DataTab.css'

function formatNumber(number) {
  if (number==undefined) {
    return;
  }
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + 'B';
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  } else {
    return number.toString();
  }
}

function DataTab({ data, country }) {
  return (
    <div className='dataTab'>
    <div className='heading'>
        <h3>YouTube Stats of {country == 'all' ? "World":  (country === "United States" ? "USA" : country)}</h3>
    </div>
    <div className='dataStats'>
        <div className="card">
            <div className="card-heading">Avg Views</div>
            <div className="card-number">{data["views"]!=undefined?formatNumber(data["views"].toFixed(1)):<p></p>}</div>
        </div>
        <div className="card">
            <div className="card-heading">Avg Earnings</div>
            <div className="card-number">{data["views"]!=undefined?formatNumber(data["earnings"].toFixed(1)):<p></p>}</div>
        </div>
        <div className="card">
            <div className="card-heading">Avg Subscribers</div>
            <div className="card-number">{data["views"]!=undefined?formatNumber(data["subscribers"].toFixed(1)):<p></p>}</div>
        </div>
        <div className="card">
            <div className="card-heading">Avg Uploads</div>
            <div className="card-number">{data["views"]!=undefined?formatNumber(data["uploads"].toFixed(1)):<p></p>}</div>
        </div>
    </div>
</div>

  );
}

export default DataTab;
