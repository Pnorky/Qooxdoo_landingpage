/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("landing_qooxdoo.components.Navbar", {
  extend: qx.ui.container.Composite,

  events: {
    /** Fired when a navigation item is clicked */
    navigate: "qx.event.type.Data"
  },

  construct() {
    this.base(arguments);
    this.setMinHeight(64);
    this.setPaddingBottom(12);
    this.setPaddingRight(40);
    this.setLayout(new qx.ui.layout.VBox());
    this._products = [];
    this._init();
  },

  members: {
    _products: null,
    _menuBar: null,
    _logoContainer: null,
    _titleLabel: null,
    // _modeToggle: null,  // Dark mode toggle (commented out temporarily)

    _init() {
      // Main container - full width, horizontal layout
      const mainContainer = new qx.ui.container.Composite();
      mainContainer.setLayout(new qx.ui.layout.HBox(20));
      mainContainer.setPadding(16, 40, 20, 24);

      // Logo and title container
      this._logoContainer = new qx.ui.container.Composite();
      this._logoContainer.setLayout(new qx.ui.layout.HBox(12));
      this._logoContainer.setAlignY("middle");
      this._logoContainer.addListener("tap", () => {
        this.fireDataEvent("navigate", { path: "/" });
      }, this);

      // Logo image
      const logo = new qx.ui.basic.Image("landing_qooxdoo/logo.png");
      logo.setWidth(40);
      logo.setHeight(40);
      logo.setScale(true);

      // Company title (custom Basecoat label) - keep on one line, do not shrink
      this._titleLabel = new landing_qooxdoo.ui.Label("Digital Software Corporation");
      this._titleLabel.setFont("bold");
      this._titleLabel.setAlignY("middle");

      this._logoContainer.add(logo, { flex: 0 });
      this._logoContainer.add(this._titleLabel, { flex: 0 });
      mainContainer.add(this._logoContainer, { flex: 0 });

      // Spacer to push menu to the right
      const spacer = new qx.ui.core.Spacer();
      mainContainer.add(spacer, { flex: 1 });

      // Menu bar for navigation (styled via landing_qooxdoo.ui.MenuBar)
      this._menuBar = landing_qooxdoo.ui.MenuBar.createStyledMenuBar();

      // Browse Products menu
      const productsMenu = new qx.ui.menubar.Button("Browse Products");
      const productsSubMenu = new qx.ui.menu.Menu();
      productsMenu.setMenu(productsSubMenu);

      // Will be populated when products are loaded
      this._productsSubMenu = productsSubMenu;

      // Release Notes
      const releaseNotesButton = new qx.ui.menubar.Button("Release Notes");
      releaseNotesButton.addListener("execute", () => {
        this.fireDataEvent("navigate", { path: "/release-notes" });
      }, this);

      // List of Clients
      const clientsButton = new qx.ui.menubar.Button("List of Clients");
      clientsButton.addListener("execute", () => {
        this.fireDataEvent("navigate", { path: "/list-of-clients" });
      }, this);

      this._menuBar.add(productsMenu);
      this._menuBar.add(releaseNotesButton);
      this._menuBar.add(clientsButton);

      mainContainer.add(this._menuBar, { flex: 0 });

      // Dark mode toggle (commented out temporarily)
      // this._modeToggle = new qx.ui.form.ToggleButton();
      // this._modeToggle.setMarginLeft(16);
      // this._modeToggle.setMarginRight(20);
      // this._modeToggle.setToolTipText("Dark mode");
      // this._modeToggle.addListener("changeValue", (e) => {
      //   const app = qx.core.Init.getApplication();
      //   if (app && app.toggleTheme) {
      //     app.toggleTheme();
      //   }
      // }, this);
      // mainContainer.add(this._modeToggle, { flex: 0 });

      this.add(mainContainer);

      // Ensure navbar doesn't clip - clear overflow on entire chain so company label is not cut
      this.addListenerOnce("appear", () => {
        // Sync dark mode toggle with current theme (commented out temporarily)
        // const app = qx.core.Init.getApplication();
        // if (app && app.isDarkMode) {
        //   this._modeToggle.setValue(app.isDarkMode());
        // }
        const contentEl = this.getContentElement();
        if (contentEl) {
          contentEl.setStyle("overflowX", "visible");
          contentEl.setStyle("overflowY", "visible");
          const navDom = contentEl.getDomElement();
          if (navDom) {
            navDom.style.paddingRight = "24px";
            navDom.style.boxSizing = "border-box";
          }
        }
        const mainContentEl = mainContainer.getContentElement();
        if (mainContentEl) {
          mainContentEl.setStyle("overflow", "visible");
          mainContentEl.setStyle("overflowX", "visible");
          mainContentEl.setStyle("overflowY", "visible");
        }
        const logoContentEl = this._logoContainer.getContentElement();
        if (logoContentEl) {
          logoContentEl.setStyle("overflow", "visible");
          logoContentEl.setStyle("overflowX", "visible");
          logoContentEl.setStyle("overflowY", "visible");
        }
        if (this._titleLabel && this._titleLabel.getContentElement) {
          const titleContentEl = this._titleLabel.getContentElement();
          if (titleContentEl) {
            titleContentEl.setStyle("overflow", "visible");
            titleContentEl.setStyle("overflowX", "visible");
            titleContentEl.setStyle("overflowY", "visible");
          }
        }
      }, this);
    },

    /**
     * Load products and populate menu
     */
    loadProducts() {
      landing_qooxdoo.util.ExcelReader.getAllProducts().then(products => {
        this._products = products;
        this._productsSubMenu.removeAll();

        products.forEach(product => {
          const menuItem = new qx.ui.menu.Button(product.title);
          if (product.short_des) {
            menuItem.setToolTipText(product.short_des);
          }
          menuItem.addListener("execute", () => {
            this.fireDataEvent("navigate", { path: product.href });
          }, this);
          this._productsSubMenu.add(menuItem);
        });
      }).catch(error => {
        console.error("Failed to load products:", error);
      });
    },

  }
});
