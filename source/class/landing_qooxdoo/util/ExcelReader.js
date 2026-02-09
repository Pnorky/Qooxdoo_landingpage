/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("landing_qooxdoo.util.ExcelReader", {
  type: "static",

  statics: {
    /**
     * Read Excel file and return parsed data
     * @param {String} filePath - Path to Excel file
     * @return {qx.Promise} Promise that resolves with parsed file data
     */
    readExcel(filePath) {
      return new qx.Promise((resolve, reject) => {
        // Load XLSX library if not already loaded
        if (typeof XLSX === "undefined") {
          this._loadXLSXLibrary().then(() => {
            this._fetchAndParse(filePath, resolve, reject);
          }).catch(reject);
        } else {
          this._fetchAndParse(filePath, resolve, reject);
        }
      });
    },

    /**
     * Load XLSX library from CDN
     * @return {qx.Promise} Promise that resolves when library is loaded
     */
    _loadXLSXLibrary() {
      return new qx.Promise((resolve, reject) => {
        if (typeof XLSX !== "undefined") {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
        
        script.onload = () => {
          resolve();
        };
        
        script.onerror = () => {
          reject(new Error("Failed to load XLSX library"));
        };

        document.head.appendChild(script);
      });
    },

    /**
     * Fetch and parse Excel file
     * @param {String} filePath - Path to Excel file
     * @param {Function} resolve - Promise resolve function
     * @param {Function} reject - Promise reject function
     */
    _fetchAndParse(filePath, resolve, reject) {
      fetch(filePath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status}`);
          }
          return response.arrayBuffer();
        })
        .then(arrayBuffer => {
          try {
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const sheetsData = {};
            
            for (const sheetName of workbook.SheetNames) {
              const sheet = workbook.Sheets[sheetName];
              let filteredRows;
              if (sheetName === "ListOfClients") {
                const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
                if (raw.length < 1) {
                  filteredRows = [];
                } else {
                  filteredRows = { places: raw[0].map((h) => String(h || "").trim() || ""), rawRows: raw.slice(1) };
                }
              } else {
                const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                filteredRows = rawRows.filter((row) =>
                  Object.values(row).some((val) => val !== null && val !== "")
                );
              }
              sheetsData[sheetName] = filteredRows;
            }

            resolve({
              fileName: filePath.split("/").pop() || "",
              sheets: sheetsData
            });
          } catch (error) {
            reject(new Error(`Failed to parse Excel file: ${error.message}`));
          }
        })
        .catch(error => {
          reject(error);
        });
    },

    /**
     * Get all products from products.xlsx
     * @return {qx.Promise} Promise that resolves with products array
     */
    getAllProducts() {
      const resourceManager = qx.util.ResourceManager.getInstance();
      const excelPath = resourceManager.toUri("landing_qooxdoo/data/products.xlsx");
      return this.readExcel(excelPath).then(data => {
        if (!data.sheets.Info) {
          return [];
        }

        const { Info, FAQ = [], Download = [], Brochure = [] } = data.sheets;

        return Info.map((info) => ({
          code: info.Code,
          title: `${info.Title} (${info.Code})`,
          description: info.Description,
          href: `/products/${info.Code}`.toLowerCase(),
          faq: FAQ.filter((faq) => faq.Code === info.Code)
            .slice(0, 1)
            .map((f) => f.FAQ),
          download: Download.find((dl) => dl.Code === info.Code)?.Link || null,
          brochure: Brochure.find((br) => br.Code === info.Code)?.Link || null,
          short_des: info.Short
        }));
      });
    },

    /**
     * Get list of clients from list-of-clients.xlsx.
     * Excel layout: row 1 = place names (accordion labels), each column = schools for that place.
     * @return {qx.Promise} Promise that resolves with { places: string[], schoolLists: string[][] }
     */
    getListOfClients() {
      const resourceManager = qx.util.ResourceManager.getInstance();
      const excelPath = resourceManager.toUri("landing_qooxdoo/data/list-of-clients.xlsx");
      return this.readExcel(excelPath).then(data => {
        const sheetData = data.sheets?.ListOfClients;
        if (!sheetData || !sheetData.places) {
          return { places: [], schoolLists: [] };
        }
        const places = sheetData.places;
        const rawRows = sheetData.rawRows || [];
        const numCols = places.length;
        const schoolLists = [];
        for (let c = 0; c < numCols; c++) {
          const schools = rawRows
            .map((row) => (row[c] != null ? String(row[c]).trim() : ""))
            .filter((s) => s !== "");
          schoolLists.push(schools);
        }
        return { places, schoolLists };
      });
    },

    /**
     * Get product details by code
     * @param {String} code - Product code
     * @return {qx.Promise} Promise that resolves with product details
     */
    getProductDetails(code) {
      const resourceManager = qx.util.ResourceManager.getInstance();
      const excelPath = resourceManager.toUri("landing_qooxdoo/data/products.xlsx");
      return this.readExcel(excelPath).then(data => {
        if (!data.sheets.Info) {
          return null;
        }

        const { Info, FAQ = [], Download = [], Brochure = [] } = data.sheets;
        const info = Info.find((p) => p.Code === code.toUpperCase());
        if (!info) {
          return null;
        }

        return {
          title: `${info.Title} (${info.Code})`,
          description: info.Short,
          href: `/products/${info.Code}`,
          faq: FAQ.filter((faq) => faq.Code === code.toUpperCase()).map((f) => f.FAQ),
          download: Download.filter((dl) => dl.Code === code.toUpperCase()).map((dl) => ({
            version: dl.Version,
            link: dl.Link
          })),
          brochure: Brochure.filter((br) => br.Code === code.toUpperCase()).map((br) => ({
            title: br.Title,
            link: br.Link
          }))
        };
      });
    }
  }
});
