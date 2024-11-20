# TrafiQ

**TrafiQ** is a web-based application for visualizing and analyzing traffic incidents in Dubai. The app provides a user-friendly interface for exploring traffic data, identifying patterns, and improving awareness of traffic dynamics through interactive maps, real-time visualizations, and customizable settings.

This project was developed as part of the **CS338 Data Visualization** course at UAEU, under the supervision of Dr. Sharief Abdallah.

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

- **Interactive Maps:**

  - View traffic incidents plotted on a map with severity-based coloring
  - Switch between map styles (Dark, Light, Satellite, etc.)
  - Zoom into specific areas like Downtown Dubai, Marina, or Deira

- **Accessibility Options:**

  - Customize color schemes for different visual needs (Protanopia, Deuteranopia, etc.)
  - Adjust font sizes and contrast for improved readability

- **Data Visualization:**

  - Analyze traffic patterns by type, location, and time of day
  - Get detailed statistics on total incidents, severe cases, and trends

- **Customizable User Settings:**
  - Save accessibility and map preferences locally using `localStorage`
  - Retain settings between sessions on the same device

---

## Technologies Used

- **Frontend:**

  - HTML, CSS (TailwindCSS)
  - JavaScript (ES6+)
  - Mapbox GL JS (for interactive maps)
  - D3.js (for data parsing and visualization)
  - Scrollama.js (for story-driven sections)

- **Development Tools:**
  - pnpm (Package management)
  - Node.js and Express (Local development server)
  - Git (Version control)

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
├── src/                   # Source files
│   └── css/              # CSS source files
└── views/                # View templates
```
````

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

---

## Development

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run copy-vendor` - Copy vendor files
- `pnpm run build:css` - Build CSS
- `pnpm run watch:css` - Watch CSS changes

---

## Usage

1. **Explore Traffic Incidents:**

   - Use the map to view incident locations and severity
   - Scroll through story sections for insights on specific areas and times

2. **Customize Settings:**

   - Access the **Accessibility Settings** from the sidebar to adjust color schemes, font sizes, and contrast
   - Open **Map Display Settings** to switch map styles and customize point sizes

3. **Save Preferences:**
   - Your settings will be saved locally and automatically applied in future sessions

---

## Data Sources

The traffic incident data used in this project is provided by the Dubai Open Data Initiative. The dataset includes:

- Incident locations
- Time and date of incidents
- Severity levels
- Type of incidents

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- Dr. Sharief Abdallah for guidance and supervision
- Dubai Open Data Initiative for providing traffic data
- Libraries and Tools:
  - D3.js
  - Mapbox GL JS
  - TailwindCSS
  - Scrollama.js
