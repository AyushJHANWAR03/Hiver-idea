# Hiver Email AI Assistant

A full-stack email triage and response assistant, built for Hiver AI.
This project demonstrates backend and frontend skills, including AI integration, RESTful APIs, and modern React UI.

## Features

- **Email Ingestion:** Users can submit emails via a form.
- **AI-Powered Classification:** Uses OpenAI GPT to classify intent and summarize emails.
- **Automated Reply Generation:** Generates professional replies using GPT.
- **AI Feedback:** Rates replies for tone, clarity, and helpfulness.
- **Dashboard:** View, reassign, and manage all emails.
- **Modern UI:** Responsive, clean React frontend with TailwindCSS.

## Tech Stack

- **Backend:** FastAPI, MongoDB (Motor), OpenAI API (v1.x)
- **Frontend:** React, TailwindCSS, Axios, React Router
- **Deployment:** Netlify (frontend), Render (backend)

## Getting Started

### Backend

1. Clone the repo and install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2. Set environment variables:
    - `OPENAI_API_KEY`
    - `MONGODB_URI`
3. Run the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend

1. Install dependencies:
    ```bash
    cd frontend
    npm install
    ```
2. Start the dev server:
    ```bash
    npm start
    ```

### Deployment

- **Frontend:** Deployed on Netlify at [https://hiver-email.netlify.app](https://hiver-email.netlify.app)
- **Backend:** Deployed on Render

#### Netlify Routing Fix

To support React Router, a `_redirects` file is included:
```
/*    /index.html   200
```
This ensures all routes (e.g., `/dashboard`) work on refresh or direct access.

## Demo

- [Live Demo](https://hiver-email.netlify.app)

## Author

Ayush Jhanwar  
[LinkedIn](https://www.linkedin.com/in/ayushjhanwar03/)  
Email: ayushjhanwar03@gmail.com

---

> **Interested in joining Hiver AI as a Backend SDE!**