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
      const pageContentEl = this.getContentElement();
      if (pageContentEl && pageContentEl.addClass) pageContentEl.addClass("list-of-clients-page");
      const headerBlock = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
      const title = new landing_qooxdoo.ui.Label("LIST OF CLIENTS");
      title.setFont("bold");
      if (title.getContentElement()) title.getContentElement().addClass("clients-page-title");
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
      headerBlock.add(title);
      const subtitle = new landing_qooxdoo.ui.Label("List of clients who have purchased / subscribed to the products.");
      if (subtitle.getContentElement()) subtitle.getContentElement().addClass("clients-page-subtitle");
      headerBlock.add(subtitle);
      this.add(headerBlock);

      const accordionContainer = new qx.ui.container.Composite();
      accordionContainer.setLayout(new qx.ui.layout.VBox());
      accordionContainer.setAllowGrowX(true);
      this._accordionContainer = accordionContainer;
      this._scroll = new qx.ui.container.Scroll();
      this._scroll.setScrollbarY("auto");
      this._scroll.setScrollbarX("off");
      accordionContainer.add(this._scroll, { flex: 1 });
      this.add(accordionContainer, { flex: 1 });

      this._loadClients();
    },

    /**
     * Load clients from Excel. Row 1 = place names (accordion labels); each column = list of schools for that place.
     */
    _loadClients() {
      landing_qooxdoo.util.ExcelReader.getListOfClients()
        .then((data) => {
          const places = data.places || [];
          const schoolLists = data.schoolLists || [];
          if (places.length === 0) {
            const noDataLabel = new landing_qooxdoo.ui.Label("No clients found");
            this._scroll.add(noDataLabel);
            return;
          }

          const accordion = new landing_qooxdoo.ui.Accordion();
          accordion.setAllowGrowX(true);
          accordion.setAllowGrowY(false);
          accordion.setRichContent(false);

          places.forEach((place, i) => {
            const label = (place != null && String(place).trim() !== "") ? String(place).trim().toUpperCase() : "";
            if (label === "") return;
            const schools = schoolLists[i] || [];
            const bulletLines = schools.map((s) => "• " + s);
            accordion.addItem(label, bulletLines.join("\n"));
          });

          this._scroll.add(accordion);
        })
        .catch(error => {
          console.error("Failed to load clients:", error);
          const errorLabel = new landing_qooxdoo.ui.Label("Error loading clients: " + error.message);
          this._scroll.add(errorLabel);
        });
    }
  }
});
