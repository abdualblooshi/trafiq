# 🚗 TrafiQ

**TrafiQ** is a web-based application for visualizing and analyzing traffic incidents in Dubai. The app provides a user-friendly interface for exploring traffic data, identifying patterns, and improving awareness of traffic dynamics through interactive maps, real-time visualizations, and customizable settings.

This project was developed as part of the **CS338 Data Visualization** course at UAEU, under the supervision of Dr. Sharief Abdallah.

🔗 **Live Demo**: [https://trafiq.onrender.com](https://trafiq.onrender.com)

---

## Project Overview

TrafiQ aims to make traffic incident data more accessible and understandable through interactive visualization. By combining modern web technologies with data visualization techniques, it provides insights into traffic patterns and helps identify areas requiring attention in Dubai's road network.

### Course Context
- **Course**: CS338 Data Visualization
- **Institution**: United Arab Emirates University (UAEU)
- **Instructor**: Dr. Sharief Abdallah
- **Semester**: Spring 2024

---

## Features

[Previous features section is good, keep as is]

---

## Technologies Used

- **Frontend:**
  - HTML, CSS (TailwindCSS)
  - JavaScript (ES6+)
  - Mapbox GL JS (for interactive maps)
  - D3.js (for data parsing and visualization)
  - Scrollama.js (for story-driven sections)

- **Backend:**
  - Node.js & Express
  - CSV parsing for data handling
  - RESTful API endpoints

- **Development & Deployment:**
  - pnpm (Package management)
  - Git (Version control)
  - Render (Cloud deployment)
  - Environment variables for configuration

---

## Project Structure

```plaintext
trafiq/
├── data/                   # Traffic incident data
├── public/                 # Static assets
│   ├── css/               # Compiled CSS
│   ├── js/                # JavaScript files
│   │   ├── accessibilityManager.js
│   │   ├── dataManager.js
│   │   ├── scrollManager.js
│   │   ├── sidebar.js
│   │   └── main.js
│   └── vendor/            # Third-party libraries
├── server/                # Server configuration
│   ├── server.js         # Express server setup
│   └── controllers/      # API controllers
├── src/                   # Source files
│   └── css/              # CSS source files
└── deploy.sh             # Deployment script

---

## Getting Started

### Prerequisites
- Node.js (>= 14.0.0)
- pnpm (>= 8.0.0)
- Modern web browser (Chrome, Firefox, or Edge recommended)
- Mapbox ACCESS Token

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/abdualblooshi/TrafiQ.git
   ```

2. Navigate to project directory:
   ```bash
   cd TrafiQ
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your Mapbox ACCESS token to .env
   ```

5. Build the project:
   ```bash
   pnpm run build
   ```

6. Start the development server:
   ```bash
   pnpm run dev
   ```

### Deployment

The project is set up for deployment on Render. Required environment variables:

```env
NODE_ENV=production
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

Deploy using:
```bash
./deploy.sh
```

---

## Development

### Available Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run setup` - Set up vendor files and build process
- `pnpm run build:css` - Build CSS
- `pnpm run watch:css` - Watch CSS changes
- `./deploy.sh` - Run deployment script

