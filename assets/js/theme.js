// State-persisting Neo-Brutalist Theme Toggler
(function() {
  // Listen for DOM load to bind click event
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update document theme attribute
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Persist setting in LocalStorage
        localStorage.setItem('theme', newTheme);
      });
    }
  });
})();
