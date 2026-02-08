/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("landing_qooxdoo.pages.ListOfClientsPage", {
  extend: qx.ui.container.Composite,

  construct() {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox(16));
    this.setPadding(24, 24);
    this.setAllowGrowX(true);
    this.setAllowGrowY(true);
    this._init();
  },

  members: {
    _init() {
      // Title – custom Label, larger size
      const title = new landing_qooxdoo.ui.Label("List of Clients");
      title.setFont("bold");
      title.addListenerOnce("appear", () => {
        const root = title.getContentElement() && title.getContentElement().getDomElement();
        if (root) {
          const labelEl = root.querySelector(".label");
          if (labelEl) {
            labelEl.style.fontSize = "1.75rem";
            labelEl.style.lineHeight = "1.2";
          }
        }
      });
      this.add(title);

      // Table container – full width
      const tableContainer = new qx.ui.container.Composite();
      tableContainer.setLayout(new qx.ui.layout.VBox());
      tableContainer.setAllowGrowX(true);
      this._tableContainer = tableContainer;
      this.add(tableContainer, { flex: 1 });

      this._loadClients();
    },

    /**
     * Load clients from Excel and show in custom Table
     */
    _loadClients() {
      landing_qooxdoo.util.ExcelReader.getListOfClients()
        .then(clients => {
          if (!clients || clients.length === 0) {
            const noDataLabel = new qx.ui.basic.Label("No clients found");
            this._tableContainer.add(noDataLabel);
            return;
          }

          const firstClient = clients[0];
          const columns = Object.keys(firstClient);

          const table = new landing_qooxdoo.ui.Table("");
          table.setAllowGrowX(true);
          table.setAllowGrowY(true);
          table.setMinHeight(200);

          table.setHeaders(columns);

          clients.forEach(client => {
            const rowData = columns.map(col => client[col] != null ? String(client[col]) : "");
            table.addRow(rowData, null, client);
          });

          this._tableContainer.add(table, { flex: 1 });
        })
        .catch(error => {
          console.error("Failed to load clients:", error);
          const errorLabel = new qx.ui.basic.Label("Error loading clients: " + error.message);
          this._tableContainer.add(errorLabel);
        });
    }
  }
});
