// public/js/table.js
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const severityFilter = document.getElementById("filterSeverity");

  // Debounce function for search
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Filter function for both desktop and mobile views
  function filterItems(searchTerm, severity) {
    const items = document.querySelectorAll(".lg\\:hidden > div, tbody > tr");

    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const severityMatch = !severity || text.includes(severity.toLowerCase());
      const searchMatch =
        !searchTerm || text.includes(searchTerm.toLowerCase());

      item.style.display = severityMatch && searchMatch ? "" : "none";
    });
  }

  // Event listeners
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce(function (e) {
        filterItems(e.target.value, severityFilter.value);
      }, 300)
    );
  }

  if (severityFilter) {
    severityFilter.addEventListener("change", function (e) {
      filterItems(searchInput.value, e.target.value);
    });
  }
});
