import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function App() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ location: '', total_sqft: '', bhk: '', bath: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/locations`)
      .then(r => r.json())
      .then(d => { setLocations(d.locations || []); setApiError(false); })
      .catch(() => setApiError(true));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.location) return 'Please select a location.';
    if (!form.total_sqft || Number(form.total_sqft) < 300) return 'Area must be at least 300 sq.ft.';
    if (!form.bhk || Number(form.bhk) < 1) return 'Please enter BHK.';
    if (!form.bath || Number(form.bath) < 1) return 'Please enter number of bathrooms.';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setResult(null); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: form.location,
          total_sqft: Number(form.total_sqft),
          bhk: Number(form.bhk),
          bath: Number(form.bath)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prediction failed');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const lakhs = result?.price || 0;
  const crores = (lakhs / 100).toFixed(2);
  const low = (lakhs * 0.9).toFixed(1);
  const high = (lakhs * 1.1).toFixed(1);

  return (
    <div className="app">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo">🏠</div>
          <div>
            <div className="nav-title">EstateIQ</div>
            <div className="nav-subtitle">Price Intelligence</div>
          </div>
        </div>
        <div className="nav-badge">Bangalore ML Model</div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">AI-Powered Estimation</div>
        <h1>Know Your Home's <span>True Value</span></h1>
        <p className="hero-sub">
          Machine learning trained on thousands of Bangalore property transactions.
          Get an accurate estimate in seconds.
        </p>
        <div className="hero-stats">
          <div className="stat"><span className="stat-num">8,000+</span><span className="stat-label">Transactions</span></div>
          <div className="stat"><span className="stat-num">58</span><span className="stat-label">Locations</span></div>
          <div className="stat"><span className="stat-num">98.3%</span><span className="stat-label">Model Accuracy</span></div>
        </div>
      </section>

      {/* Main */}
      <main className="main">
        {apiError && (
          <div className="error-msg" style={{ marginBottom: 24 }}>
            ⚠️ Backend not reachable at <code>{API_BASE}</code>. Start the Flask server or set <code>REACT_APP_API_URL</code>.
          </div>
        )}

        <div className="grid">
          {/* Form card */}
          <div className="card">
            <div className="card-title">Property Details</div>
            <div className="card-sub">Fill in the details to get an instant price estimate.</div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Location</label>
                <select name="location" value={form.location} onChange={handleChange}>
                  <option value="">— Select Area —</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Built-up Area (sq.ft)</label>
                <input
                  type="number" name="total_sqft" placeholder="e.g. 1200"
                  value={form.total_sqft} onChange={handleChange} min="300" max="10000"
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>BHK</label>
                  <select name="bhk" value={form.bhk} onChange={handleChange}>
                    <option value="">Select</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Bathrooms</label>
                  <select name="bath" value={form.bath} onChange={handleChange}>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Bath</option>)}
                  </select>
                </div>
              </div>

              {error && <div className="error-msg">{error}</div>}
              <button type="submit" className="btn-predict" disabled={loading}>
                {loading ? 'Estimating…' : 'Estimate Price →'}
              </button>
            </form>
          </div>

          {/* Result card */}
          <div className="card">
            <div className="card-title">Price Estimate</div>
            <div className="card-sub">Based on current Bangalore market data.</div>

            {loading ? (
              <div className="result-empty">
                <div className="spinner" />
                <p>Analyzing property data…</p>
              </div>
            ) : result ? (
              <div>
                <div className="location-badge">
                  📍 {result.location}
                </div>
                <div className="result-price">
                  <div className="price-label">Estimated Market Value</div>
                  <span className="price-value">₹ {lakhs.toFixed(2)}</span>
                  <div className="price-unit">Lakhs</div>
                  {lakhs >= 100 && <div className="price-crore">≈ ₹ {crores} Crores</div>}
                </div>

                <hr className="price-divider" />

                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="d-label">Built-up Area</div>
                    <div className="d-value">{result.total_sqft} sq.ft</div>
                  </div>
                  <div className="detail-item">
                    <div className="d-label">BHK</div>
                    <div className="d-value">{result.bhk} Bedroom{result.bhk > 1 ? 's' : ''}</div>
                  </div>
                  <div className="detail-item">
                    <div className="d-label">Bathrooms</div>
                    <div className="d-value">{result.bath} Bath{result.bath > 1 ? 's' : ''}</div>
                  </div>
                  <div className="detail-item">
                    <div className="d-label">Price / sq.ft</div>
                    <div className="d-value">₹ {Math.round(lakhs * 100000 / result.total_sqft).toLocaleString()}</div>
                  </div>
                </div>

                <div className="price-range">
                  <div className="range-title">Estimated Range (±10%)</div>
                  <div className="range-row">
                    <div className="range-bound">
                      <div className="r-val">₹ {low}L</div>
                      <div className="r-lab">Low</div>
                    </div>
                    <div className="range-bound">
                      <div className="r-val">₹ {lakhs.toFixed(1)}L</div>
                      <div className="r-lab">Estimated</div>
                    </div>
                    <div className="range-bound">
                      <div className="r-val">₹ {high}L</div>
                      <div className="r-lab">High</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="result-empty">
                <div className="result-icon">🏡</div>
                <p>Fill in the property details and click<br /><strong>Estimate Price</strong> to see the result.</p>
              </div>
            )}
          </div>
        </div>

        {/* Info strip */}
        <div className="info-strip">
          <div className="info-card">
            <div className="info-icon">🤖</div>
            <h3>Ridge Regression Model</h3>
            <p>Trained on 8,000+ Bangalore property transactions with 98.3% accuracy. Location, size, and room count all factor in.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Instant Predictions</h3>
            <p>Our Flask API returns predictions in milliseconds, powered by a pre-trained scikit-learn model served via Gunicorn.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>58 Bangalore Localities</h3>
            <p>Covers prime areas like Koramangala, Indiranagar, Whitefield, and HSR Layout with location-specific pricing factors.</p>
          </div>
        </div>
      </main>

      <footer>
        Built with React + Flask + scikit-learn ·{' '}
        <a href="https://github.com/arpitraj10/house_price_prediction_web" target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        {' '} · Estimates are indicative only.
      </footer>
    </div>
  );
}
