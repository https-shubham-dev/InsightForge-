# AutoInsight AI 🚀  
### AI-Powered Data Analysis Platform (Power BI + ChatGPT Inspired)

AutoInsight AI is an advanced data analysis platform that transforms raw, unstructured datasets into clean, interactive, and insight-rich dashboards — without writing a single line of code.

It combines **data cleaning, visualization, AI insights, and conversational analytics** into one unified interface.

---

## 🌐 Live Demo

👉 https://autoinsightai.vercel.app

---

## ⚡ Core Features

### 📂 Smart Data Processing
- Upload CSV / Excel files  
- Automatically cleans unformatted datasets  
- Handles missing values, duplicates, inconsistencies  

---

### 📊 Power BI–Style Tables
- Conditional formatting (Low / Mid / High color coding)  
- Structured tabular data view  
- Download dataset with same formatting  

---

### 📈 Interactive Analytics Engine
- Multi-column filtering  
- Dynamic charts (Bar, Line, Pie, Scatter)  
- Real-time aggregation (Sum, Avg, Min, Max)  
- Custom X/Y axis selection  

---

### 📊 AI Dashboard Insights
- Auto-generated dataset summary  
- Key insights extraction  
- Anomaly detection  
- Actionable recommendations  

---

### 📄 Export System
- Download cleaned dataset  
- Export AI insights as PDF  
- Preserve formatting  

---

### 💬 Chat with Data (AI Assistant)
- Ask questions in plain English  
- Dataset-aware responses  
- Powered by LLM APIs  

---

### 🔐 Authentication
- Google Authentication (Supabase Auth)
- Authentication-enabled access control
---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + TypeScript  
- **State Management:** Custom store architecture  
- **Backend Services:** Supabase (DB + Auth)  
- **AI Integration:** External LLM APIs  
- **Deployment:** Vercel  

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
│   ├── routeTree.gen.ts
│   ├── style.css
│── public/
│── package.json
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

```
git clone https://github.com/rishabhsingh8445/AutoInsight-Ai.git
cd AutoInsight-Ai
npm install
npm run dev
```

App runs on:  
http://localhost:8080

---

## 🚀 Deployment

- Hosted on Vercel  
- Environment variables configured in dashboard  
- Automatic CI/CD via GitHub  

---

## 🔐 Security Notes

- Avoid exposing API keys in frontend  
- Use serverless functions for sensitive operations  
- Supabase handles authentication securely  

---

## 🧠 Why This Project Stands Out

- End-to-end pipeline:
  - Data Cleaning  
  - Visualization  
  - AI Insights  
  - Chat-based Analytics  

- Combines:
  → Power BI + AI Analyst + Data Cleaner  

---

## 📌 Future Improvements

- Backend layer for secure AI requests  
- Multi-user collaboration  
- Dataset versioning  
- Predictive analytics (ML models)  

---

## 👨‍💻 Author

Rishabh Singh

---

## ⭐ Support

If you found this useful, consider giving a ⭐ on GitHub
