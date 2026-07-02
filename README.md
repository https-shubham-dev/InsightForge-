# AutoInsight AI

### AI-Powered Data Analysis Platform

AutoInsight AI transforms raw CSV/Excel datasets into clean, interactive, insight-rich dashboards — without writing a single line of code. Combines data cleaning, visualization, AI insights, and conversational analytics in one unified interface.

---

## ⚡ Features

**Smart Data Processing**
- Upload CSV / Excel files
- Auto-cleans unformatted datasets — handles missing values, duplicates, inconsistencies

**Power BI–Style Tables**
- Conditional formatting (Low / Mid / High color coding)
- Structured tabular view with downloadable output

**Interactive Analytics**
- Multi-column filtering
- Dynamic charts — Bar, Line, Pie, Scatter
- Real-time aggregation (Sum, Avg, Min, Max)
- Custom X/Y axis selection

**AI Dashboard Insights**
- Auto-generated dataset summary
- Key insights extraction, anomaly detection, actionable recommendations

**Export System**
- Download cleaned dataset
- Export AI insights as PDF

**Chat with Data**
- Ask questions in plain English
- Dataset-aware responses powered by LLM APIs

**Authentication**
- Google Auth via Supabase
- Access control per user

---

## 🛠️ Tech Stack

| Layer | Tech |
|:------|:-----|
| Frontend | React + Vite + TypeScript |
| Backend / DB | Supabase (DB + Auth) |
| AI | Gemini API / Groq API |
| Deployment | Vercel |

---

## 📁 Project Structure

```
project-root/
│── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── store/
│   ├── router.tsx
│── public/
│── vite.config.ts
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```
VITE_API_KEY=your_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 💻 Local Development

```bash
git clone https://github.com/https-shubham-dev/AutoInsight-AI.git
cd AutoInsight-AI
npm install
npm run dev
```

Runs on `http://localhost:8080`

---

## 📌 Upcoming

- Backend layer for secure AI requests
- Multi-user collaboration
- Predictive analytics (ML models)

---

## 👨‍💻 Author

**Shubham Kumar**
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/shubham-kumar-code)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:Https.Shubham@gmail.com)
