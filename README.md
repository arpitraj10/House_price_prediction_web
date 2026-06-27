# 🏠 EstateIQ — House Price Prediction (Full Stack)

React + Flask + scikit-learn | Backend on **Render** · Frontend on **Vercel**

---

## 📁 Project Structure

```
house_price_fullstack/
├── backend/          ← Flask API → deploy to Render.com (FREE)
│   ├── app.py
│   ├── train_model.py
│   ├── house_price_model.pkl
│   ├── columns.json
│   ├── requirements.txt
│   ├── Procfile
│   ├── render.yaml        ← Render config
│   └── runtime.txt
└── frontend/         ← React app → deploy to Vercel (FREE)
    ├── src/
    ├── public/
    ├── package.json
    └── vercel.json
```

---

## 🚀 Deploy Backend → Render.com 

### Step-by-step:

1. **Push `backend/` to GitHub**
   - Create a new GitHub repo (e.g. `house-price-backend`)
   - Copy all files from the `backend/` folder into it
   - Push to main branch

2. **Sign up at [render.com](https://render.com)** 

3. **Create a Web Service**
   - Dashboard → **New → Web Service**
   - Connect your GitHub repo
   - Render auto-detects Python

4. **Configure the service:**
   | Setting | Value |
   |---|---|
   | **Name** | `house-price-api` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `gunicorn app:app --bind 0.0.0.0:$PORT` |
   | **Plan** | `Free` |

5. Click **Create Web Service** → wait 2–3 min for first build

6. Your API is live at: `https://house-price-api.onrender.com`
   Copy this URL — you'll need it for the frontend.

> ⚠️ **Free tier note:** The app sleeps after 15 min of inactivity. The first request after sleep takes ~60 seconds to wake up. Subsequent requests are instant. This is normal and fine for a portfolio project.

---

## 🌐 Deploy Frontend → Vercel (FREE)

1. Push the `frontend/` folder to a **separate GitHub repo** (or subfolder of same repo)

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo

3. Set **Root Directory** → `frontend` (if in same repo)

4. Add **Environment Variable:**
   - Key: `REACT_APP_API_URL`
   - Value: `https://house-price-api.onrender.com` *(your Render URL)*

5. Click **Deploy** — done! ✅

---

## 💻 Run Locally

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python app.py
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000" > .env
npm start
# → http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check server status |
| GET | `/api/locations` | Get all 58 Bangalore locations |
| POST | `/api/predict` | Predict house price |

### POST `/api/predict` — Example

**Request:**
```json
{
  "location": "Koramangala",
  "total_sqft": 1200,
  "bhk": 2,
  "bath": 2
}
```

**Response:**
```json
{
  "price": 99.84,
  "price_in_rupees": "₹ 99.84 Lakhs",
  "location": "Koramangala",
  "total_sqft": 1200.0,
  "bhk": 2,
  "bath": 2
}
```

---

## 🛠 Retrain the Model

```bash
cd backend
python train_model.py
# Regenerates house_price_model.pkl + columns.json
```

---

## ✅ All Deployment Issues Fixed

| Issue | Fix |
|---|---|
| Railway credits expired | Switched to **Render.com** (truly free, no card) |
| CORS errors | `flask-cors` with `CORS(app)` |
| PORT binding crash | `host="0.0.0.0", port=int(os.environ.get("PORT", 5000))` |
| Vercel 404 on refresh | `vercel.json` SPA rewrites |
| Hardcoded API URL | `REACT_APP_API_URL` env variable |
| Model file missing on server | Pre-trained `.pkl` committed to repo |
