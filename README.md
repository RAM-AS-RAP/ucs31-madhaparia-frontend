# RespiraCare Frontend

Frontend application for the **Respiratory Health Awareness and Prediction System**.

RespiraCare provides a patient-friendly interface for respiratory symptom entry, symptom confirmation, health-awareness prediction results, patient history and administrator access.

The application is built using React and communicates with the FastAPI backend through REST API endpoints.

## Technology Stack

- React
- Vite
- JavaScript
- React Router
- Axios
- CSS
- Oxlint

## Current Features

The current frontend foundation includes:

- React + Vite project structure
- React Router configuration
- Shared application layout
- RespiraCare navigation
- Responsive landing page
- Health-awareness disclaimer
- 404 page
- Axios API client
- Environment-based backend API URL
- Responsive styling

Authentication, prediction workflows, patient history and administrator features will be added in later development issues.

## Project Structure

```text
src/
├── components/
├── layouts/
│   └── AppLayout.jsx
├── pages/
│   ├── HomePage.jsx
│   └── NotFoundPage.jsx
├── services/
│   └── api.js
├── styles/
│   └── global.css
├── App.jsx
└── main.jsx