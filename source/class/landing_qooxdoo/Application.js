/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

/**
 * This is the main application class of "landing_qooxdoo"
 *
 * @asset(landing_qooxdoo/*)
 */
qx.Class.define("landing_qooxdoo.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    _navbar: null,
    _footer: null,
    _currentPage: null,
    _pageContainer: null,
    _pageContent: null,

    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main()
    {
      // Call super class
      this.base(arguments);

      // Restore theme preference (light/dark) from localStorage
      this._applySavedTheme();

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      const root = this.getRoot();
      
      // Create main container with VBox layout
      const mainContainer = new qx.ui.container.Composite();
      mainContainer.setLayout(new qx.ui.layout.VBox());
      root.add(mainContainer, { edge: 0 });

      // Create navbar
      this._navbar = new landing_qooxdoo.components.Navbar();
      this._navbar.loadProducts();
      this._navbar.addListener("navigate", (e) => {
        const data = e.getData();
        this._navigateTo(data.path);
      }, this);
      mainContainer.add(this._navbar);

      // Create page container - scrollable
      this._pageContainer = new qx.ui.container.Scroll();
      // Configure scroll container to prevent scroll position issues
      this._pageContainer.setScrollbarX("auto");
      this._pageContainer.setScrollbarY("auto");
      const pageContent = new qx.ui.container.Composite();
      pageContent.setLayout(new qx.ui.layout.VBox());
      this._pageContainer.add(pageContent);
      this._pageContent = pageContent;
      mainContainer.add(this._pageContainer, { flex: 1 });

      // Create footer
      this._footer = new landing_qooxdoo.components.Footer();
      this._footer.loadProducts();
      this._footer.addListener("navigate", (e) => {
        const data = e.getData();
        this._navigateTo(data.path);
      }, this);
      mainContainer.add(this._footer);

      // Initialize routing
      this._initRouting();

      // Listen for browser back/forward buttons
      window.addEventListener("popstate", (e) => {
        const path = window.location.pathname;
        this._navigateTo(path || "/");
      });
    },

    /**
     * Initialize routing based on URL
     */
    _initRouting() {
      const path = window.location.pathname;
      this._navigateTo(path || "/");
    },

    /**
     * Navigate to a path
     * @param {String} path - Path to navigate to
     */
    _navigateTo(path) {
      // Normalize path
      if (!path || path === "") {
        path = "/";
      }
      
      // Only update URL if it's different from current path
      const currentPath = window.location.pathname;
      if (window.history && window.history.pushState && path !== currentPath) {
        window.history.pushState({ path }, "", path);
      }

      // Remove current page
      if (this._currentPage) {
        try {
          if (!this._currentPage.isDisposed()) {
            this._pageContent.remove(this._currentPage);
            this._currentPage.dispose();
          }
        } catch (e) {
          // Page might already be removed or disposed
          console.warn("Error removing page:", e);
        }
        this._currentPage = null;
      }

      // Create new page based on path
      let newPage = null;

      if (path === "/" || path === "") {
        newPage = new landing_qooxdoo.pages.HomePage();
        newPage.addListener("navigate", (e) => {
          const data = e.getData();
          this._navigateTo(data.path);
        }, this);
      } else if (path.startsWith("/products/")) {
        const productCode = path.split("/products/")[1];
        newPage = new landing_qooxdoo.pages.ProductPreviewPage(productCode);
      } else if (path === "/list-of-clients") {
        newPage = new landing_qooxdoo.pages.ListOfClientsPage();
      } else if (path === "/release-notes") {
        newPage = new landing_qooxdoo.pages.ReleaseNotesPage();
      } else {
        // 404 page
        newPage = new qx.ui.container.Composite();
        newPage.setLayout(new qx.ui.layout.VBox());
        newPage.setPadding(40);
        const errorLabel = new qx.ui.basic.Label("Page Not Found");
        errorLabel.setFont("bold");
        newPage.add(errorLabel);
      }

      if (newPage) {
        this._currentPage = newPage;
        this._pageContent.add(newPage);
        // Reset scroll position to top when navigating to a new page
        // Use setTimeout to ensure the page is rendered first
        setTimeout(() => {
          try {
            // Access the scroll container's content element directly
            const contentElement = this._pageContainer.getContentElement();
            if (contentElement && contentElement.getDomElement) {
              const domElement = contentElement.getDomElement();
              if (domElement && domElement.parentElement) {
                // Reset scroll position using DOM directly
                const scrollContainer = domElement.parentElement;
                if (scrollContainer.scrollTop !== undefined) {
                  scrollContainer.scrollTop = 0;
                }
              }
            }
          } catch (e) {
            // Ignore scroll errors - this is a workaround for Qooxdoo scroll issues
          }
        }, 0);
      }
    },

    /**
     * Apply saved theme (dark/light) from localStorage on startup
     */
    _applySavedTheme() {
      try {
        const saved = localStorage.getItem("landing_qooxdoo_theme");
        if (saved === "dark") {
          document.documentElement.classList.add("dark");
        } else if (saved === "light") {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {
        // Ignore if localStorage unavailable
      }
    },

    /**
     * Toggle dark mode theme (uses .dark class on documentElement, like qooxdo_proj)
     * Persists preference to localStorage.
     */
    toggleTheme() {
      document.documentElement.classList.toggle("dark");
      try {
        const isDark = document.documentElement.classList.contains("dark");
        localStorage.setItem("landing_qooxdoo_theme", isDark ? "dark" : "light");
      } catch (e) {
        // Ignore if localStorage unavailable
      }
    },

    /**
     * Return whether dark mode is currently active (for Navbar icon etc.)
     * @return {Boolean}
     */
    isDarkMode() {
      return document.documentElement.classList.contains("dark");
    }
  }
});
