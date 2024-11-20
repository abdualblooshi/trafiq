# TrafiQ

**TrafiQ** is a web-based application for visualizing and analyzing traffic incidents in Dubai. The app provides a user-friendly interface for exploring traffic data, identifying patterns, and improving awareness of traffic dynamics through interactive maps, real-time visualizations, and customizable settings.

---

## Features

- **Interactive Maps:**
  - View traffic incidents plotted on a map with severity-based coloring.
  - Switch between map styles (Dark, Light, Satellite, etc.).
  - Zoom into specific areas like Downtown Dubai, Marina, or Deira.

- **Accessibility Options:**
  - Customize color schemes for different visual needs (Protanopia, Deuteranopia, etc.).
  - Adjust font sizes and contrast for improved readability.

- **Data Visualization:**
  - Analyze traffic patterns by type, location, and time of day.
  - Get detailed statistics on total incidents, severe cases, and trends.

- **Customizable User Settings:**
  - Save accessibility and map preferences locally using `localStorage`.
  - Retain settings between sessions on the same device.

---

## Technologies Used

- **Frontend:**
  - HTML, CSS (TailwindCSS)
  - JavaScript (ES6+)
  - Mapbox GL JS (for interactive maps)
  - D3.js (for data parsing and visualization)
  - Scrollama.js (for story-driven sections)

- **Backend (future upgrade):**
  - Node.js (planned for centralized data handling and real-time updates)

---

## File Structure

```plaintext
/
├── index.html            # Main HTML file
├── css/
│   └── styles.css        # Custom styles
├── js/
│   ├── accessabilityManager.js  # Handles accessibility settings
│   ├── dataManager.js           # Fetches and processes traffic data
│   ├── scrollManager.js         # Manages scroll-driven map updates
│   ├── sidebar.js               # Handles sidebar UI interactions
│   └── main.js                  # Application entry point
```

---

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, or Edge recommended).
- Internet connection (required for loading traffic data and map assets).
- Mapbox ACCESS Token (to be added in the javascript file scrollManager.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/TrafiQ.git
   ```
2. Open the project directory:
   ```bash
   cd TrafiQ
   ```
3. Open `index.html` in your browser to view the application.

---

## Usage

1. **Explore Traffic Incidents:**
   - Use the map to view incident locations and severity.
   - Scroll through story sections for insights on specific areas and times.

2. **Customize Settings:**
   - Access the **Accessibility Settings** from the sidebar to adjust color schemes, font sizes, and contrast.
   - Open **Map Display Settings** to switch map styles and customize point sizes.

3. **Save Preferences:**
   - Your settings will be saved locally and automatically applied in future sessions.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- **Traffic Data:** Data provided by Dubai Open Data Initiative.
- **Libraries and Tools:** D3.js, Mapbox GL JS, TailwindCSS, Scrollama.js.
