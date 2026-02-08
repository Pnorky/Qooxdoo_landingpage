/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("landing_qooxdoo.ui.MenuBar",
  {
    extend: qx.ui.container.Composite,

    events: {
      /** Fired when logout is requested */
      logout: "qx.event.type.Event",
    },

    statics: {
      /**
       * Create a styled menubar (theme background, foreground, bottom border).
       * Use this when you need a qx.ui.menubar.MenuBar with consistent styling, e.g. in Navbar.
       * @return {qx.ui.menubar.MenuBar}
       */
      createStyledMenuBar() {
        const menubar = new qx.ui.menubar.MenuBar();
        menubar.setAllowGrowX(true);
        menubar.addListenerOnce("appear", () => {
          const contentEl = menubar.getContentElement();
          if (contentEl) {
            const dom = contentEl.getDomElement();
            if (dom) {
              dom.classList.add("menubar-theme");
            }
          }
        }, menubar);
        return menubar;
      }
    },

    construct: function () {
      this.base(arguments);

      // Initialize loaded scripts tracker
      this._loadedScripts = {};

      var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow());
      frame.setAllowStretchX(true);
      this.setLayout(new qx.ui.layout.Grow());
      this.setAllowStretchX(true);

      var menubar = landing_qooxdoo.ui.MenuBar.createStyledMenuBar();
      
      frame.add(menubar);

      var windowsMenu = new qx.ui.menubar.Button("Students", null, this._getWindowsMenu());
      // var viewMenu = new qx.ui.menubar.Button("View", null, this._getViewMenu());
      var windowMenu = new qx.ui.menubar.Button("Window", null, this._getWindowMenu());
      var printingMenu = new qx.ui.menubar.Button("Printing", null, this._getPrintingMenu()); 

      menubar.add(windowsMenu);
      // menubar.add(viewMenu);
      menubar.add(windowMenu);
      menubar.add(printingMenu);

      // Add logout button as a menubar button (right-aligned)
      this._logoutButton = new qx.ui.menubar.Button("Logout");
      this._logoutButton.addListener("execute", () => {
        this._handleLogout();
      }, this);
      
      // Add spacer to push logout to the right
      menubar.addSpacer();
      menubar.add(this._logoutButton);

      this.add(frame);
    },

    members:
    {
      _windowManager: null,
      _showPersonalInfoCheckbox: null,
      _showContactInfoCheckbox: null,
      _showAcademicInfoCheckbox: null,
      _showStudentTableCheckbox: null,
      _logoutButton: null,
      _loadedScripts: null, // Track loaded scripts

      /**
       * Handle logout button click
       */
      _handleLogout: function () {
        // Fire logout event
        this.fireEvent("logout");
      },

      /**
       * Set the window manager reference
       * @param {Object} windowManager - Window manager instance (optional)
       */
      setWindowManager: function (windowManager) {
        this._windowManager = windowManager;
      },

      _getWindowsMenu: function () {
        var menu = new qx.ui.menu.Menu();

        var personalInfoButton = new qx.ui.menu.Button("Personal Information");
        var contactInfoButton = new qx.ui.menu.Button("Contact Information");
        var academicInfoButton = new qx.ui.menu.Button("Academic Information");
        var studentTableButton = new qx.ui.menu.Button("Student Table");

        menu.add(personalInfoButton);
        menu.add(contactInfoButton);
        menu.add(academicInfoButton);
        menu.add(studentTableButton);

        // Event handlers
        personalInfoButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.openWindow("personalInfo");
          }
        }, this);

        contactInfoButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.openWindow("contactInfo");
          }
        }, this);

        academicInfoButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.openWindow("academicInfo");
          }
        }, this);

        studentTableButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.openWindow("studentTable");
          }
        }, this);

        return menu;
      },

      _getWindowMenu: function () {
        var menu = new qx.ui.menu.Menu();

        var cascadeWindowsButton = new qx.ui.menu.Button("Cascade Windows");
        var tileWindowsButton = new qx.ui.menu.Button("Tile Windows");
        var closeAllButton = new qx.ui.menu.Button("Close All Windows");
        var toggleThemeButton = new qx.ui.menu.Button("Toggle Dark Mode");

        menu.add(cascadeWindowsButton);
        menu.add(tileWindowsButton);
        menu.addSeparator();
        menu.add(closeAllButton);
        menu.addSeparator();
        menu.add(toggleThemeButton);

        // Event handlers
        cascadeWindowsButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.cascadeWindows();
          }
        }, this);

        tileWindowsButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.tileWindows();
          }
        }, this);

        closeAllButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.closeAllWindows();
            // Uncheck all checkboxes in View menu
            // if (this._showPersonalInfoCheckbox) {
            //   this._showPersonalInfoCheckbox.setValue(false);
            // }
            // if (this._showContactInfoCheckbox) {
            //   this._showContactInfoCheckbox.setValue(false);
            // }
            // if (this._showAcademicInfoCheckbox) {
            //   this._showAcademicInfoCheckbox.setValue(false);
            // }
            // if (this._showStudentTableCheckbox) {
            //   this._showStudentTableCheckbox.setValue(false);
            // }
          }
        }, this);

        toggleThemeButton.addListener("execute", () => {
          const app = qx.core.Init.getApplication();
          if (app && app.toggleTheme) {
            app.toggleTheme();
          }
        }, this);

        return menu;
      },

      _getPrintingMenu: function () {
        var menu = new qx.ui.menu.Menu();
        var pdfReportButton = new qx.ui.menu.Button("PDF Report");
        var excelReportButton = new qx.ui.menu.Button("Excel Report");
        menu.add(pdfReportButton);
        menu.add(excelReportButton);

        // Event handlers
        pdfReportButton.addListener("execute", () => {
          console.log("[PDF] PDF Report button clicked");
          this._generatePDFReport();
        }, this);

        excelReportButton.addListener("execute", () => {
          this._generateExcelReport();
        }, this);

        return menu;
      },

      /**
       * Load a script from CDN
       * @param {String} cdnUrl - Full CDN URL to the script
       * @param {Function} callback - Callback function when script is loaded
       * @param {Function} errorCallback - Optional callback function when script fails to load
       */
      _loadScriptFromCDN: function (cdnUrl, callback, errorCallback) {
        // Check if script is already loaded
        if (this._loadedScripts[cdnUrl]) {
          if (callback) {
            callback();
          }
          return;
        }

        console.log("Loading script from CDN:", cdnUrl);

        // Create script element and load dynamically
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = cdnUrl;
        
        script.onload = () => {
          // Mark as loaded
          this._loadedScripts[cdnUrl] = true;
          console.log("Script loaded successfully from CDN:", cdnUrl);
          if (callback) {
            callback();
          }
        };
        
        script.onerror = () => {
          console.error("Failed to load script from CDN:", cdnUrl);
          // If error callback is provided, call it
          if (errorCallback) {
            errorCallback();
          } else {
            alert("Failed to load script from CDN: " + cdnUrl);
          }
        };

        // Append to document head
        document.head.appendChild(script);
      },

      /**
       * Load a script from node_modules (for npm-installed packages)
       * @param {String} modulePath - Path within node_modules (e.g., "pdfmake/build/pdfmake.min.js")
       * @param {Function} callback - Callback function when script is loaded
       * @param {Function} errorCallback - Optional callback function when script fails to load
       */
      _loadScriptFromNodeModules: function (modulePath, callback, errorCallback) {
        // Check if script is already loaded
        const scriptKey = "node_modules/" + modulePath;
        if (this._loadedScripts[scriptKey]) {
          if (callback) {
            callback();
          }
          return;
        }

        // Try to load from node_modules path (requires dev server to serve node_modules)
        const currentUrl = window.location.href;
        const urlObj = new URL(currentUrl);
        const fullPath = urlObj.origin + "/node_modules/" + modulePath;
        
        console.log("Loading script from node_modules:", fullPath);

        // Create script element and load dynamically
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = fullPath;
        
        script.onload = () => {
          // Mark as loaded
          this._loadedScripts[scriptKey] = true;
          console.log("Script loaded successfully from node_modules:", modulePath);
          if (callback) {
            callback();
          }
        };
        
        script.onerror = () => {
          console.error("Failed to load script from node_modules:", fullPath);
          // If error callback is provided, call it
          if (errorCallback) {
            errorCallback();
          } else {
            alert("Failed to load script from node_modules: " + modulePath + "\nPath: " + fullPath + "\n\nNote: Your dev server needs to serve node_modules, or use a bundler.");
          }
        };

        // Append to document head
        document.head.appendChild(script);
      },

      /**
       * Dynamically load a script if not already loaded
       * @param {String} scriptPath - Path to the script file (e.g., "pdfmake.min.js")
       * @param {Function} callback - Callback function when script is loaded
       * @param {Function} errorCallback - Optional callback function when script fails to load
       */
      _loadScript: function (scriptPath, callback, errorCallback) {
        // Check if script is already loaded
        if (this._loadedScripts[scriptPath]) {
          if (callback) {
            callback();
          }
          return;
        }

        // Get resource path using ResourceManager
        let fullPath;
        const currentUrl = window.location.href;
        const urlObj = new URL(currentUrl);
        
        try {
          // Use toUri with the complete resource path
          const resourceManager = qx.util.ResourceManager.getInstance();
          fullPath = resourceManager.toUri("landing_qooxdoo/lib/" + scriptPath);
          
          console.log("ResourceManager returned:", fullPath);
          
          // If toUri returns a relative path, make it absolute
          if (!fullPath.startsWith("http://") && !fullPath.startsWith("https://")) {
            // Make it absolute by prepending origin
            if (!fullPath.startsWith("/")) {
              // Relative path - prepend with /resource/
              fullPath = urlObj.origin + "/resource/" + fullPath;
            } else {
              // Root-relative path
              fullPath = urlObj.origin + fullPath;
            }
          }
        } catch (e) {
          console.error("Error getting resource path from ResourceManager:", e);
          // Fallback: construct path manually
          const pathname = urlObj.pathname;
          
          if (pathname.includes("/compiled/")) {
            const compiledIndex = pathname.indexOf("/compiled/");
            fullPath = urlObj.origin + pathname.substring(0, compiledIndex) + "/resource/landing_qooxdoo/lib/" + scriptPath;
          } else {
            // For source mode with qx serve, resources are typically at /resource/
            fullPath = urlObj.origin + "/resource/landing_qooxdoo/lib/" + scriptPath;
          }
        }
        
        console.log("Loading script from:", fullPath);

        // Create script element and load dynamically
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = fullPath;
        
        script.onload = () => {
          // Mark as loaded
          this._loadedScripts[scriptPath] = true;
          console.log("Script loaded successfully:", scriptPath);
          if (callback) {
            callback();
          }
        };
        
        script.onerror = () => {
          console.error("Failed to load script:", fullPath);
          console.error("Attempted URL:", script.src);
          // If error callback is provided, call it instead of alerting
          if (errorCallback) {
            errorCallback();
          } else {
            alert("Failed to load script: " + scriptPath + "\nPath: " + fullPath);
          }
        };

        // Append to document head
        document.head.appendChild(script);
      },

      /**
       * Generate a filename with current date and time
       * @param {String} baseName - Base name for the file (e.g., "StudentReport")
       * @param {String} extension - File extension (e.g., "xlsx" or "pdf")
       * @return {String} Formatted filename with datetime
       */
      _generateFileName: function (baseName, extension) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        
        const datetime = `${year}${month}${day}_${hours}${minutes}${seconds}`;
        return `${baseName}_${datetime}.${extension}`;
      },

      /**
       * Get student data from the student table window or API
       * @param {Function} callback - Callback function with student data array
       */
      _getStudentData: function (callback) {
        console.log("[PDF] _getStudentData called");
        
        // First, try to get data from the open window
        if (this._windowManager) {
          console.log("[PDF] Window manager available, checking for student table window...");
          const studentTableWindow = this._windowManager.getWindow("studentTable");
          if (studentTableWindow) {
            console.log("[PDF] Student table window found");
            const studentInfoTable = studentTableWindow.getStudentInfoTable();
            if (studentInfoTable) {
              console.log("[PDF] Student info table found, getting data...");
              const students = studentInfoTable.getStudentsData();
              if (students && students.length > 0) {
                console.log("[PDF] Found", students.length, "students in window");
                callback(students);
                return;
              } else {
                console.log("[PDF] No students found in window");
              }
            } else {
              console.log("[PDF] Student info table not found");
            }
          } else {
            console.log("[PDF] Student table window not found");
          }
        } else {
          console.log("[PDF] Window manager not available");
        }

        // If no data in window, load from API
        console.log("[PDF] Loading student data from API...");
        fetch("http://localhost:3000/api/students", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => {
          console.log("[PDF] API response status:", response.status);
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          return response.json();
        })
        .then(students => {
          console.log("[PDF] API returned", students ? students.length : 0, "students");
          // Return all student fields - no need to transform/limit
          console.log("[PDF] Returning", students.length, "students with all fields");
          callback(students || []);
        })
        .catch(error => {
          console.error("[PDF] Failed to load students from API:", error);
          console.error("[PDF] Error details:", error.message, error.stack);
          alert("Failed to load student data: " + error.message);
          callback([]);
        });
      },

      /**
       * Generate PDF report using pdfmake
       */
      _generatePDFReport: function () {
        console.log("[PDF] _generatePDFReport called");
        
        // Get student data (from window or API)
        console.log("[PDF] Fetching student data...");
        this._getStudentData((students) => {
          console.log("[PDF] Student data received, count:", students.length);
          
          if (students.length === 0) {
            console.warn("[PDF] No student data available");
            alert("No student data available to generate PDF report.");
            return;
          }

          // Try to use pdfmake - check if already loaded
          let pdfMake = null;
          
          // First, check if pdfmake and vfs are already available on window
          if (typeof window !== "undefined" && window.pdfMake && window.pdfMake.vfs) {
            pdfMake = window.pdfMake;
            console.log("[PDF] pdfmake found on window.pdfMake with vfs");
            this._createPDFDocument(students, pdfMake);
            return;
          }
          
          // If not available, load from CDN (since Qooxdoo dev server doesn't serve node_modules)
          console.log("[PDF] Loading pdfmake from CDN...");
          const pdfMakeUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js";
          const vfsFontsUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.js";
          
          // Load pdfmake first
          this._loadScriptFromCDN(pdfMakeUrl, () => {
            console.log("[PDF] pdfmake loaded successfully from CDN");
            // Then load vfs_fonts
            this._loadScriptFromCDN(vfsFontsUrl, () => {
              console.log("[PDF] vfs_fonts loaded successfully from CDN");
              setTimeout(() => {
                if (window.pdfMake && window.pdfMake.vfs) {
                  console.log("[PDF] Calling _createPDFDocument with", students.length, "students");
                  this._createPDFDocument(students, window.pdfMake);
                } else {
                  console.error("[PDF] pdfMake or vfs not available after loading");
                  alert("Failed to initialize PDF library. Please refresh the page and try again.");
                }
              }, 100);
            }, (error) => {
              console.error("[PDF] Failed to load vfs_fonts from CDN:", error);
              alert("Failed to load PDF fonts from CDN. Please check your internet connection.");
            });
          }, (error) => {
            console.error("[PDF] Failed to load pdfmake from CDN:", error);
            alert("Failed to load PDF library from CDN. Please check your internet connection.");
          });
        });
      },


      /**
       * Get PDF report configuration
       * @return {Object} PDF configuration object
       */
      _getPDFConfig: function () {
        return {
          orientation: "portrait", // "portrait" or "landscape"
          pageSize: "A4",
          margins: [40, 60, 40, 60],
          reportType: "full" // "basic", "academic", "contact", or "full"
        };
      },

      /**
       * Get PDF column configuration
       * 
       * To customize columns, modify this method to return your desired column array.
       * Each column object should have:
       * - key: Field name from student data object
       * - label: Display label for the column header
       * - width: Column width ("auto", "*", or specific number)
       * - align: Text alignment ("left", "center", "right")
       * - category: Optional category for filtering ("basic", "academic", "contact", "personal")
       * 
       * @param {String} reportType - Type of report (optional, defaults to "full")
       * @return {Array} Array of column configuration objects
       */
      _getPDFColumnConfig: function (reportType) {
        reportType = reportType || "full";
        
        // Default columns matching the Student Information Table display
        // Widths optimized for portrait A4 (page width: 595pt, margins: 40pt each = 80pt, usable: ~510pt)
        // Total: 20 + 60 + 70 + 70 + 220 + 40 = 480pt (leaves buffer for padding/borders)
        const defaultColumns = [
          { key: "studentId", label: "Student Id", width: 60, align: "left", category: "basic" },
          { key: "firstName", label: "First Name", width: 70, align: "left", category: "basic" },
          { key: "lastName", label: "Last Name", width: 70, align: "left", category: "basic" },
          { key: "program", label: "Program", width: 220, align: "left", category: "academic" },
          { key: "yearLevel", label: "Year Level", width: 40, align: "center", category: "academic" }
        ];
        
        // Extended column configurations for other report types
        const allColumns = [
          ...defaultColumns,
          { key: "email", label: "Email", width: "*", align: "left", category: "contact" },
          { key: "personalPhone", label: "Phone", width: "auto", align: "left", category: "contact" },
          { key: "dateOfBirth", label: "Date of Birth", width: "auto", align: "center", category: "personal" },
          { key: "gender", label: "Gender", width: "auto", align: "center", category: "personal" },
          { key: "address", label: "Address", width: "*", align: "left", category: "contact" },
          { key: "emergencyContact", label: "Emergency Contact", width: "*", align: "left", category: "contact" },
          { key: "emergencyContactPhone", label: "Emergency Phone", width: "auto", align: "left", category: "contact" },
          { key: "relationship", label: "Relationship", width: "auto", align: "left", category: "contact" },
          { key: "gradeSchool", label: "Grade School", width: "*", align: "left", category: "academic" },
          { key: "highSchool", label: "High School", width: "*", align: "left", category: "academic" },
          { key: "college", label: "College", width: "*", align: "left", category: "academic" }
        ];

        // Filter columns based on report type
        switch (reportType) {
          case "basic":
            return defaultColumns;
          case "academic":
            return allColumns.filter(col => col.category === "basic" || col.category === "academic");
          case "contact":
            return allColumns.filter(col => col.category === "basic" || col.category === "contact");
          case "full":
          default:
            return defaultColumns; // Return only the table columns by default
        }
      },

      /**
       * Filter column configuration based on available data
       * @param {Array} columnConfig - Column configuration array
       * @param {Array} students - Sample student data to check available fields
       * @return {Array} Filtered column configuration
       */
      _filterColumnsByAvailableData: function (columnConfig, students) {
        if (!students || students.length === 0) {
          return columnConfig;
        }

        // Check which fields exist in the student data
        const sampleStudent = students[0];
        const availableKeys = Object.keys(sampleStudent);

        // Filter columns to only include those with available data
        return columnConfig.filter(col => {
          // Always include columns that might have data
          if (availableKeys.includes(col.key)) {
            // Check if at least one student has non-empty data for this field
            return students.some(student => {
              const value = student[col.key];
              return value !== null && value !== undefined && value !== "";
            });
          }
          return false;
        });
      },

      /**
       * Extract numeric part from yearLevel string
       * Handles formats like "p4", "rr3", "r2", "4", "1st Year", "2nd Year", etc.
       * @param {String|Number} yearLevel - Year level value
       * @return {String} Numeric year level (1-4) or empty string
       */
      _normalizeYearLevel: function (yearLevel) {
        if (!yearLevel) return "";
        
        // If it's already a number, convert to string
        if (typeof yearLevel === 'number') {
          return String(yearLevel);
        }
        
        const str = String(yearLevel).trim();
        if (!str) return "";
        
        // Extract the last digit from the string
        const match = str.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          // Ensure it's between 1-4 (valid year levels)
          if (num >= 1 && num <= 4) {
            return String(num);
          }
        }
        
        return str; // Return original if no valid number found
      },

      /**
       * Format a value for PDF display
       * @param {*} value - Value to format
       * @param {String} key - Field key
       * @return {String} Formatted value
       */
      _formatPDFValue: function (value, key) {
        if (value === null || value === undefined || value === "") {
          return "-";
        }
        
        // Normalize yearLevel to numeric string
        if (key === "yearLevel" && value) {
          return this._normalizeYearLevel(value);
        }
        
        // Format dates
        if (key === "dateOfBirth" && value) {
          try {
            const date = new Date(value);
            return date.toLocaleDateString();
          } catch (e) {
            return String(value);
          }
        }
        
        return String(value);
      },

      /**
       * Build table structure dynamically from column configuration
       * @param {Array} students - Array of student data
       * @param {Array} columnConfig - Column configuration array
       * @return {Object} Object with table body and widths
       */
      _buildPDFTable: function (students, columnConfig) {
        // Build header row - add row number column first
        const headerRow = [
          { text: "#", style: "tableHeader", bold: true, alignment: "center" },
          ...columnConfig.map(col => ({
            text: col.label,
            style: "tableHeader",
            bold: true,
            alignment: col.align || "left"
          }))
        ];

        // Build data rows - add row number first
        const dataRows = students.map((student, index) => {
          return [
            { text: (index + 1).toString(), alignment: "center" },
            ...columnConfig.map(col => {
              const value = this._formatPDFValue(student[col.key], col.key);
              const cellConfig = {
                text: value,
                alignment: col.align || "left"
              };
              // Prevent wrapping for Program column to keep it on one line
              if (col.key === "program") {
                cellConfig.noWrap = true;
              }
              return cellConfig;
            })
          ];
        });

        // Build widths array - add row number column width first
        const widths = ["auto", ...columnConfig.map(col => col.width || "*")];

        return {
          body: [headerRow, ...dataRows],
          widths: widths
        };
      },

      /**
       * Create PDF document using pdfmake
       * @param {Array} students - Array of student data
       * @param {Object} pdfMakeInstance - pdfMake instance (optional, defaults to window.pdfMake)
       */
      _createPDFDocument: function (students, pdfMakeInstance) {
        console.log("[PDF] _createPDFDocument called with", students ? students.length : 0, "students");
        
        // Use provided instance or fall back to window.pdfMake
        const pdfMake = pdfMakeInstance || (typeof window !== 'undefined' ? window.pdfMake : undefined);
        
        if (!pdfMake || typeof pdfMake === "undefined") {
          console.error("[PDF] pdfMake is undefined - library not loaded");
          alert("PDF library failed to load. Please refresh the page.");
          return;
        }
        
        console.log("[PDF] pdfMake is available:", typeof pdfMake);
        console.log("[PDF] pdfMake.vfs available:", !!pdfMake.vfs);

        // Get PDF configuration
        const pdfConfig = this._getPDFConfig();
        
        // Get column configuration and filter by available data
        const allColumns = this._getPDFColumnConfig(pdfConfig.reportType);
        const columnConfig = this._filterColumnsByAvailableData(allColumns, students);
        console.log("[PDF] Using column configuration with", columnConfig.length, "columns (filtered from", allColumns.length, "available)");

        // Build table structure dynamically
        console.log("[PDF] Building table structure...");
        const tableStructure = this._buildPDFTable(students, columnConfig);
        
        console.log("[PDF] Table built with", tableStructure.body.length, "rows (1 header +", students.length, "data rows)");

        // Generate report metadata
        const reportDate = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        const reportTime = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        });

        // Define document content with enhanced formatting
        const docDefinition = {
          content: [
            // Header section
            {
              text: "Student Report",
              style: "header",
              alignment: "center",
              margin: [0, 0, 0, 10]
            },
            {
              text: `Generated on ${reportDate} at ${reportTime}`,
              style: "subheader",
              alignment: "center",
              margin: [0, 0, 0, 20]
            },
            {
              text: `Total Students: ${students.length}`,
              style: "info",
              margin: [0, 0, 0, 15]
            },
            // Table section
            {
              table: {
                headerRows: 1,
                widths: tableStructure.widths,
                body: tableStructure.body
              },
              layout: {
                hLineWidth: function (i, node) {
                  return i === 0 || i === node.table.body.length ? 1 : 0.5;
                },
                vLineWidth: function (i, node) {
                  return i === 0 || i === node.table.widths.length ? 1 : 0.5;
                },
                hLineColor: function (i, node) {
                  return i === 0 || i === node.table.body.length ? "#000000" : "#cccccc";
                },
                vLineColor: function (i, node) {
                  return i === 0 || i === node.table.widths.length ? "#000000" : "#cccccc";
                },
                paddingLeft: function (i, node) {
                  return i === 0 ? 6 : 4;
                },
                paddingRight: function (i, node) {
                  return i === node.table.widths.length - 1 ? 6 : 4;
                },
                paddingTop: function (i, node) {
                  return i === 0 ? 6 : 4;
                },
                paddingBottom: function (i, node) {
                  return i === node.table.body.length - 1 ? 6 : 4;
                }
              }
            }
          ],
          styles: {
            header: {
              fontSize: 20,
              bold: true,
              color: "#1a1a1a"
            },
            subheader: {
              fontSize: 10,
              color: "#666666",
              italics: true
            },
            info: {
              fontSize: 11,
              bold: true,
              color: "#333333"
            },
            tableHeader: {
              fontSize: 10,
              bold: true,
              fillColor: "#f5f5f5",
              color: "#1a1a1a"
            }
          },
          defaultStyle: {
            fontSize: 9,
            color: "#333333"
          },
          pageMargins: pdfConfig.margins,
          pageSize: pdfConfig.pageSize,
          pageOrientation: pdfConfig.orientation
        };

        // Generate and download PDF
        console.log("[PDF] Starting PDF generation process...");
        
        try {
          if (typeof pdfMake === "undefined") {
            console.error("[PDF] pdfMake is undefined in try block");
            alert("PDF library not available.");
            return;
          }

          // Generate filename with datetime
          const filename = this._generateFileName("StudentReport", "pdf");
          console.log("[PDF] Generated filename:", filename);
          
          console.log("[PDF] Creating PDF document with docDefinition...");
          console.log("[PDF] DocDefinition preview:", JSON.stringify(docDefinition).substring(0, 200) + "...");
          
          // Create PDF document
          let pdfDoc;
          try {
            console.log("[PDF] Calling pdfMake.createPdf()...");
            pdfDoc = pdfMake.createPdf(docDefinition);
            console.log("[PDF] PDF document created successfully, pdfDoc:", pdfDoc);
          } catch (createError) {
            console.error("[PDF] Error creating PDF document:", createError);
            console.error("[PDF] Error stack:", createError.stack);
            alert("Error creating PDF: " + createError.message);
            return;
          }
          
          // Open PDF in new window for preview (user can then download from browser's PDF viewer)
          console.log("[PDF] Opening PDF in new window for preview...");
          try {
            pdfDoc.open();
            console.log("[PDF] PDF preview opened successfully in new window");
          } catch (openError) {
            console.error("[PDF] Error opening PDF preview:", openError);
            // Fallback: try using getBlob() and open in new window
            console.log("[PDF] Falling back to blob-based preview...");
            pdfDoc.getBlob((blob) => {
              try {
                console.log("[PDF] PDF blob created, size:", blob.size);
                const url = window.URL.createObjectURL(blob);
                const previewWindow = window.open(url, '_blank');
                if (previewWindow) {
                  console.log("[PDF] PDF preview opened in new window via blob URL");
                  // Clean up the URL after a delay to allow the window to load
                  setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                  }, 1000);
                } else {
                  console.error("[PDF] Popup blocked - attempting direct download");
                  alert("Popup was blocked. Please allow popups for this site and try again, or the PDF will be downloaded directly.");
                  // Fallback to direct download
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                }
              } catch (blobError) {
                console.error("[PDF] Error with blob preview:", blobError);
                alert("Error generating PDF preview: " + (blobError.message || "Unknown error"));
              }
            }, (error) => {
              console.error("[PDF] Error generating PDF blob:", error);
              alert("Error generating PDF: " + (error.message || "Unknown error"));
            });
          }
        } catch (error) {
          console.error("[PDF] Error generating PDF:", error);
          console.error("[PDF] Error stack:", error.stack);
          alert("Error generating PDF: " + error.message);
        }
      },

      /**
       * Generate Excel report using exceljs
       */
      _generateExcelReport: function () {
        // Get student data (from window or API)
        this._getStudentData((students) => {
          if (students.length === 0) {
            alert("No student data available to generate Excel report.");
            return;
          }

          // Load exceljs script
          this._loadScript("exceljs.min.js", () => {
            this._createExcelDocument(students);
          });
        });
      },

      /**
       * Create Excel document using exceljs
       * @param {Array} students - Array of student data
       */
      _createExcelDocument: function (students) {
        // Check for ExcelJS in different possible locations
        const ExcelJS = window.ExcelJS || window.Excel || (typeof require !== "undefined" && require("exceljs"));
        
        if (!ExcelJS) {
          alert("Excel library failed to load. Please refresh the page.");
          return;
        }

        try {
          // Create a new workbook and worksheet
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet("Students");

          // Set column headers
          worksheet.columns = [
            { header: "#", key: "number", width: 10 },
            { header: "Student ID", key: "studentId", width: 15 },
            { header: "First Name", key: "firstName", width: 20 },
            { header: "Last Name", key: "lastName", width: 20 },
            { header: "Program", key: "program", width: 25 },
            { header: "Year Level", key: "yearLevel", width: 15, style: { numFmt: '0' } }
          ];

          // Style the header row
          worksheet.getRow(1).font = { bold: true };
          worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFEEEEEE" }
          };

          // Add student data
          students.forEach((student, index) => {
            const normalizedYearLevel = this._normalizeYearLevel(student.yearLevel);
            // Convert yearLevel to number for Excel (not text)
            const yearLevelNumber = normalizedYearLevel ? parseInt(normalizedYearLevel, 10) : null;
            
            const row = worksheet.addRow({
              number: index + 1,
              studentId: student.studentId || "",
              firstName: student.firstName || "",
              lastName: student.lastName || "",
              program: student.program || "",
              yearLevel: yearLevelNumber !== null && !isNaN(yearLevelNumber) ? yearLevelNumber : ""
            });
            
            // Ensure yearLevel cell is formatted as number
            if (yearLevelNumber !== null && !isNaN(yearLevelNumber)) {
              const yearLevelCell = row.getCell('yearLevel');
              yearLevelCell.numFmt = '0';
              yearLevelCell.value = yearLevelNumber;
            }
          });

          // Generate and download Excel file
          workbook.xlsx.writeBuffer().then((buffer) => {
            // Create blob and download
            const blob = new Blob([buffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            // Generate filename with datetime
            link.download = this._generateFileName("StudentReport", "xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }).catch((error) => {
            console.error("Error generating Excel:", error);
            alert("Error generating Excel: " + error.message);
          });
        } catch (error) {
          console.error("Error creating Excel document:", error);
          alert("Error creating Excel document: " + error.message);
        }
      },

      // _getViewMenu: function () {
      //   var menu = new qx.ui.menu.Menu();

      //   this._showPersonalInfoCheckbox = new qx.ui.menu.CheckBox("Show Personal Info Window");
      //   this._showContactInfoCheckbox = new qx.ui.menu.CheckBox("Show Contact Info Window");
      //   this._showAcademicInfoCheckbox = new qx.ui.menu.CheckBox("Show Academic Info Window");
      //   this._showStudentTableCheckbox = new qx.ui.menu.CheckBox("Show Student Table Window");

      //   // Start unchecked since windows are not displayed automatically upon login
      //   this._showPersonalInfoCheckbox.setValue(false);
      //   this._showContactInfoCheckbox.setValue(false);
      //   this._showAcademicInfoCheckbox.setValue(false);
      //   this._showStudentTableCheckbox.setValue(false);

      //   this._showPersonalInfoCheckbox.addListener("changeValue", (e) => {
      //     if (this._windowManager) {
      //       if (e.getData()) {
      //         this._windowManager.openWindow("personalInfo");
      //       } else {
      //         this._windowManager.closeWindow("personalInfo");
      //       }
      //     }
      //   }, this);
      //   this._showContactInfoCheckbox.addListener("changeValue", (e) => {
      //     if (this._windowManager) {
      //       if (e.getData()) {
      //         this._windowManager.openWindow("contactInfo");
      //       } else {
      //         this._windowManager.closeWindow("contactInfo");
      //       }
      //     }
      //   }, this);
      //   this._showAcademicInfoCheckbox.addListener("changeValue", (e) => {
      //     if (this._windowManager) {
      //       if (e.getData()) {
      //         this._windowManager.openWindow("academicInfo");
      //       } else {
      //         this._windowManager.closeWindow("academicInfo");
      //       }
      //     }
      //   }, this);
      //   this._showStudentTableCheckbox.addListener("changeValue", (e) => {
      //     if (this._windowManager) {
      //       if (e.getData()) {
      //         this._windowManager.openWindow("studentTable");
      //       } else {
      //         this._windowManager.closeWindow("studentTable");
      //       }
      //     }
      //   }, this);

      //   menu.add(this._showPersonalInfoCheckbox);
      //   menu.add(this._showContactInfoCheckbox);
      //   menu.add(this._showAcademicInfoCheckbox);
      //   menu.add(this._showStudentTableCheckbox);

      //   return menu;
      // }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */

    destruct: function () {
      // Cleanup if needed
    }
  });
