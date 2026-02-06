/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("landing_qooxdoo.components.Footer", {
  extend: qx.ui.container.Composite,

  events: {
    /** Fired when a navigation item is clicked */
    navigate: "qx.event.type.Data"
  },

  construct() {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox());
    this._products = [];
    this._init();
    // Apply footer line-height after DOM ready (and after loadProducts() re-init)
    this.addListenerOnce("appear", () => this._applyCompactFooterStyles());
  },

  members: {
    _products: null,

    _init() {
      const columnGap = 80;
      const footerContainer = new qx.ui.container.Composite();
      footerContainer.setLayout(new qx.ui.layout.HBox(0));
      footerContainer.setPadding(8, 8);
      footerContainer.setMinWidth(1280);
      footerContainer.setMaxWidth(1280);
      footerContainer.setAlignX("center");

      const productsWidth = 180;
      const othersWidth = 120;
      const contactWidth = 420;

      // PRODUCTS stays on the left
      const productsColumn = this._createColumn("PRODUCTS", () => {
        return this._products.map(product => ({
          label: product.code,
          href: product.href
        }));
      });
      productsColumn.setWidth(productsWidth);
      productsColumn.setAllowShrinkX(false);
      footerContainer.add(productsColumn, { flex: 0 });

      const othersColumn = this._createColumn("OTHERS", () => {
        return [
          { label: "List of clients", href: "/list-of-clients" },
          { label: "Release Notes", href: "/release-notes" }
        ];
      }, { center: true, width: othersWidth });
      othersColumn.setMarginLeft(columnGap);
      othersColumn.setWidth(othersWidth);
      othersColumn.setAllowShrinkX(false);

      // Center OTHERS only: [PRODUCTS] [spacer] [OTHERS] [spacer] [More information]
      footerContainer.add(new qx.ui.core.Spacer(), { flex: 1 });
      footerContainer.add(othersColumn, { flex: 0 });
      footerContainer.add(new qx.ui.core.Spacer(), { flex: 1 });

      const contactColumn = this._createContactColumn();
      contactColumn.setMarginLeft(columnGap);
      contactColumn.setWidth(contactWidth);
      contactColumn.setAllowShrinkX(false);
      footerContainer.add(contactColumn, { flex: 0 });

      // Wrapper to center footer content
      const footerWrapper = new qx.ui.container.Composite();
      footerWrapper.setLayout(new qx.ui.layout.VBox());
      footerWrapper.add(footerContainer);

      this.add(footerWrapper);

      // Copyright section - match React: pb-2 (8px), tight gap between lines (~4–6px)
      const copyrightRow = new qx.ui.container.Composite();
      copyrightRow.setLayout(new qx.ui.layout.HBox());
      copyrightRow.setMarginTop(16);
      copyrightRow.setPadding(0, 0);

      const copyrightSpacerLeft = new qx.ui.core.Spacer();
      const copyrightSpacerRight = new qx.ui.core.Spacer();

      const copyrightWidth = 380;
      const copyrightContainer = new qx.ui.container.Composite();
      copyrightContainer.setLayout(new qx.ui.layout.VBox(8));
      copyrightContainer.setPadding(0, 0, 8, 0);
      copyrightContainer.setMinWidth(copyrightWidth);
      copyrightContainer.setAllowShrinkX(false);
      const copyright1 = new landing_qooxdoo.ui.Label("All Rights Reserved 2003-2026");
      copyright1.setWidth(copyrightWidth);
      copyright1.setAlignX("center");
      copyright1.setTextAlign("center");
      copyright1.setMaxHeight(18);
      const copyright2 = new landing_qooxdoo.ui.Label("Digital Software Corporation © 2003-2026");
      copyright2.setWidth(copyrightWidth);
      copyright2.setAlignX("center");
      copyright2.setTextAlign("center");
      copyright2.setMaxHeight(18);
      const copyright3 = new landing_qooxdoo.ui.Label("Designed by Okonut & Friends");
      copyright3.setWidth(copyrightWidth);
      copyright3.setAlignX("center");
      copyright3.setTextAlign("center");
      copyright3.setMaxHeight(18);

      copyrightContainer.add(copyright1);
      copyrightContainer.add(copyright2);
      copyrightContainer.add(copyright3);

      copyrightRow.add(copyrightSpacerLeft, { flex: 1 });
      copyrightRow.add(copyrightContainer, { flex: 0 });
      copyrightRow.add(copyrightSpacerRight, { flex: 1 });

      this.add(copyrightRow);
    },

    /**
     * Create a column with title and items.
     * Uses uniform 8px spacing: header-to-first-item and between all items.
     * @param {Object} [opts] - Optional: { center: true, width: number } to center text in the column.
     */
    _createColumn(title, getItems, opts = {}) {
      const column = new qx.ui.container.Composite();
      column.setLayout(new qx.ui.layout.VBox(8));

      const center = opts.center && opts.width;
      const colWidth = opts.width;

      const titleLabel = new landing_qooxdoo.ui.Label(title);
      titleLabel.setFont("bold");
      titleLabel.setPaddingBottom(0);
      titleLabel.setMarginBottom(0);
      titleLabel.setMaxHeight(18);
      if (center) {
        titleLabel.setWidth(colWidth);
        titleLabel.setTextAlign("center");
      }
      column.add(titleLabel);

      const items = getItems();
      items.forEach(item => {
        const itemLabel = new landing_qooxdoo.ui.Label(item.label);
        itemLabel.setPaddingBottom(0);
        itemLabel.setMarginBottom(0);
        itemLabel.setMaxHeight(18);
        if (center) {
          itemLabel.setWidth(colWidth);
          itemLabel.setTextAlign("center");
        }
        itemLabel.addListener("tap", () => {
          this.fireDataEvent("navigate", { path: item.href });
        }, this);
        column.add(itemLabel);
      });

      return column;
    },

    /**
     * Create contact information column.
     * Uses same 8px spacing as other columns for consistency.
     */
    _createContactColumn() {
      const column = new qx.ui.container.Composite();
      column.setLayout(new qx.ui.layout.VBox(8));

      const titleLabel = new landing_qooxdoo.ui.Label("FOR MORE INFORMATION CONTACT");
      titleLabel.setFont("bold");
      titleLabel.setPaddingBottom(0);
      titleLabel.setMarginBottom(0);
      titleLabel.setMaxHeight(18);

      column.add(titleLabel);

      const nameLabel = new landing_qooxdoo.ui.Label("THOMAS C. SADDUL");
      nameLabel.setFont("bold");
      nameLabel.setMarginTop(0);
      nameLabel.setMarginBottom(0);
      nameLabel.setMaxHeight(18);

      column.add(nameLabel);

      const titleLabel2 = new landing_qooxdoo.ui.Label("President / CEO / Chief Architect");
      titleLabel2.setMarginTop(0);
      titleLabel2.setMarginBottom(0);
      titleLabel2.setMaxHeight(18);

      column.add(titleLabel2);

      // Contact info items - 8px gap from VBox for consistent spacing
      const contactItems = [
        { icon: "✉", text: "digisoftphofficial@gmail.com" },
        { icon: "📞", text: "Globe: 09278591168 | Smart: 09214524212" },
        { icon: "📍", text: "Paranaque City, Philippines" },
        { icon: "📘", text: "DigiSoftPH", link: "https://www.facebook.com/DigiSoftPH/" }
      ];

      contactItems.forEach((item) => {
        const contactItem = new qx.ui.container.Composite();
        contactItem.setLayout(new qx.ui.layout.HBox(8));
        contactItem.setMarginBottom(0);
        contactItem.setPadding(0);

        const iconLabel = new landing_qooxdoo.ui.Label(item.icon);
        iconLabel.setWidth(14);
        iconLabel.setHeight(14);
        iconLabel.setMaxHeight(18);

        const textLabel = new landing_qooxdoo.ui.Label(item.text);
        textLabel.setMaxHeight(18);
        if (item.link) {
          textLabel.addListener("tap", () => {
            window.open(item.link, "_blank");
          }, this);
        }

        contactItem.add(iconLabel);
        contactItem.add(textLabel, { flex: 1 });
        column.add(contactItem);
      });

      return column;
    },

    /**
     * Load products for footer
     */
    loadProducts() {
      landing_qooxdoo.util.ExcelReader.getAllProducts().then(products => {
        this._products = products;
        this.removeAll();
        this._init();
        // Re-apply compact styles after rebuild so new labels inherit tight line-height
        this._applyCompactFooterStyles();
      }).catch(error => {
        console.error("Failed to load products:", error);
      });
    },

    /**
     * Apply footer styles: layout and spacing only (no colors).
     */
    _applyCompactFooterStyles() {
      const contentEl = this.getContentElement();
      if (!contentEl) return;
      const dom = contentEl.getDomElement();
      if (!dom) return;
      dom.style.lineHeight = "1.15";
      dom.style.fontSize = "12px";
    }
  }
});
