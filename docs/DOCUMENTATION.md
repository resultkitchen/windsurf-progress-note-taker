# QuickNotes Documentation

## Overview
QuickNotes is a web application for evaluating and improving progress notes based on predefined guidelines and sample notes. The application helps ensure consistency and quality in note-taking by comparing submitted notes against established criteria.

## Architecture

### Backend
- **Node.js + Express**: Powers the web server and API endpoints
- **SQLite3**: Lightweight database for storing guidelines and sample notes
- **EJS**: Server-side templating for rendering views

### Frontend
- **HTML/CSS**: Basic structure and styling
- **JavaScript**: Client-side interactivity
- **Bootstrap**: Responsive design framework

## Core Components

### 1. Database (SQLite3)
- `guidelines` table: Stores current evaluation criteria
- `sample_notes` table: Contains example notes with quality ratings
- See `DATABASE-SCHEMA.md` for detailed schema information

### 2. API Routes
- `/api/guidelines`: Manage evaluation guidelines
  - POST: Create/update guidelines
- `/api/sample-notes`: Handle sample notes
  - POST: Add new sample notes
- `/api/notes/evaluate`: Evaluate submitted notes
  - POST: Submit note for evaluation

### 3. Page Routes
- `/`: Home page
- `/guidelines`: View/edit guidelines
- `/dashboard`: Main interface for note evaluation

### 4. Views (EJS Templates)
- `index.ejs`: Landing page
- `guidelines.ejs`: Guidelines management
- `dashboard.ejs`: Note evaluation interface

## Key Features

### Guidelines Management
- Store and update evaluation criteria
- Only one active set of guidelines at a time
- Guidelines provide the basis for note evaluation

### Sample Notes
- Store example notes that demonstrate proper formatting
- Each note is rated as excellent, good, or needs improvement
- Used as reference for evaluating new notes

### Note Evaluation
- Compare submitted notes against guidelines and samples
- Provide detailed feedback on note quality
- Suggest improvements based on guidelines

## File Structure
```
src/
├── db/
│   ├── index.js       # Database connection and queries
│   └── init-db.js     # Database initialization
├── routes/
│   ├── api.js         # API endpoints
│   └── pages.js       # Page routes
├── views/
│   ├── index.ejs      # Home page
│   ├── guidelines.ejs # Guidelines management
│   └── dashboard.ejs  # Main interface
├── public/
│   └── css/          # Stylesheets
└── server.js         # Main application entry
```

## API Reference

### POST /api/guidelines
Create or update evaluation guidelines
```json
{
  "content": "string (required)"
}
```

### POST /api/sample-notes
Add sample notes
```json
{
  "notes": ["string (required)"]
}
```

### POST /api/notes/evaluate
Submit a note for evaluation
```json
{
  "content": "string (required)"
}
```

## Development Setup
1. Install Node.js and npm
2. Clone the repository
3. Run `npm install` to install dependencies
4. Initialize database: `node src/db/init-db.js`
5. Start server: `npm start`
6. Access application at `http://localhost:3000`
