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
    this.setPadding(0);
    this.setLayout(new qx.ui.layout.VBox());
    this.setAllowStretchX(true);
    this._products = [];
    this._init();
  },

  members: {
    _products: null,
    _menuBar: null,
    _logoContainer: null,
    _titleLabel: null,
    _modeToggle: null,
    _productsMenuButton: null,

    _init() {
      // Card wrapper (theme from theme.css: --card, --card-foreground, --border, etc.)
      const card = new landing_qooxdoo.ui.Card("", "", false);
      card.setFullWidth(true);

      // Main container: logo left, menus centered (between spacers), toggle right
      const mainContainer = new qx.ui.container.Composite();
      mainContainer.setLayout(new qx.ui.layout.HBox(0));
      mainContainer.setPadding(16, 200, 20, 200);

      this._logoContainer = new qx.ui.container.Composite();
      this._logoContainer.setLayout(new qx.ui.layout.HBox(12));
      this._logoContainer.setAlignY("middle");
      this._logoContainer.addListener("tap", () => {
        this.fireDataEvent("navigate", { path: "/" });
      }, this);

      const logo = new qx.ui.basic.Image("landing_qooxdoo/logo.png");
      logo.setWidth(40);
      logo.setHeight(40);
      logo.setScale(true);

      this._titleLabel = new landing_qooxdoo.ui.Label("Digital Software Corporation");
      this._titleLabel.setFont("bold");
      this._titleLabel.setAlignY("middle");
      this._titleLabel.setMarginTop(-4);

      this._logoContainer.add(logo, { flex: 0 });
      this._logoContainer.add(this._titleLabel, { flex: 0 });
      this._logoContainer.setMarginRight(40);
      mainContainer.add(this._logoContainer, { flex: 0 });

      const leftSpacer = new qx.ui.core.Spacer();
      mainContainer.add(leftSpacer, { flex: 1 });

      this._menuBar = landing_qooxdoo.ui.MenuBar.createStyledMenuBar();
      this._menuBar.setMarginLeft(24);
      this._menuBar.setMarginRight(24);

      const productsMenu = new qx.ui.menubar.Button("Browse Products");
      const productsSubMenu = new qx.ui.menu.Menu();
      productsMenu.setMenu(productsSubMenu);
      this._productsSubMenu = productsSubMenu;
      this._productsMenuButton = productsMenu;
      const setBrowseProductsOpen = (open) => {
        const btn = this._productsMenuButton;
        if (btn && btn.getContentElement()) {
          const dom = btn.getContentElement().getDomElement();
          if (dom) {
            if (open) dom.classList.add("navbar-browse-products-open");
            else dom.classList.remove("navbar-browse-products-open");
          }
        }
      };
      productsSubMenu.addListener("changeVisibility", (e) => {
        setBrowseProductsOpen(!!e.getData());
      }, this);
      productsSubMenu.addListener("appear", () => setBrowseProductsOpen(true), this);
      productsSubMenu.addListener("disappear", () => setBrowseProductsOpen(false), this);

      const releaseNotesButton = new qx.ui.menubar.Button("Release Notes");
      releaseNotesButton.addListener("execute", () => {
        this.fireDataEvent("navigate", { path: "/release-notes" });
      }, this);

      const clientsButton = new qx.ui.menubar.Button("List of Clients");
      clientsButton.addListener("execute", () => {
        this.fireDataEvent("navigate", { path: "/list-of-clients" });
      }, this);

      this._menuBar.add(productsMenu);
      this._menuBar.add(releaseNotesButton);
      this._menuBar.add(clientsButton);

      mainContainer.add(this._menuBar, { flex: 0 });

      const rightSpacer = new qx.ui.core.Spacer();
      mainContainer.add(rightSpacer, { flex: 1 });

      this._modeToggle = new qx.ui.form.Button("☀");
      this._modeToggle.setToolTipText("Toggle dark mode");
      this._modeToggle.setMinWidth(40);
      this._modeToggle.setMinHeight(40);
      this._modeToggle.setMarginLeft(24);
      this._modeToggle.addListener("execute", () => {
        const app = qx.core.Init.getApplication();
        if (app && app.toggleTheme) {
          app.toggleTheme();
          this._updateModeToggleLabel();
        }
      }, this);
      mainContainer.add(this._modeToggle, { flex: 0 });

      card.getSection().add(mainContainer);
      this.add(card);

      // Ensure navbar doesn't clip - clear overflow on entire chain so company label is not cut
      this.addListenerOnce("appear", () => {
        this._updateModeToggleLabel();
        if (this._modeToggle) {
          const toggleEl = this._modeToggle.getContentElement();
          if (toggleEl) {
            const dom = toggleEl.getDomElement();
            if (dom) dom.classList.add("navbar-dark-mode-toggle");
          }
        }
        if (this._productsMenuButton) {
          const btnEl = this._productsMenuButton.getContentElement();
          if (btnEl) {
            const dom = btnEl.getDomElement();
            if (dom) dom.classList.add("navbar-browse-products");
          }
        }
        const contentEl = this.getContentElement();
        if (contentEl) {
          contentEl.setStyle("overflowX", "visible");
          contentEl.setStyle("overflowY", "visible");
          const navDom = contentEl.getDomElement();
          if (navDom) {
            navDom.style.boxSizing = "border-box";
            navDom.style.width = "100%";
          }
        }
        const cardContentEl = card.getContentElement();
        if (cardContentEl) {
          cardContentEl.setStyle("overflow", "visible");
          cardContentEl.setStyle("overflowX", "visible");
          cardContentEl.setStyle("overflowY", "visible");
          cardContentEl.setStyle("borderRadius", 0);
          const cardDom = cardContentEl.getDomElement();
          if (cardDom) {
            cardDom.classList.add("navbar-card");
            cardDom.style.borderRadius = "0";
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
            const titleDom = titleContentEl.getDomElement();
            if (titleDom) titleDom.classList.add("navbar-title");
          }
        }
      }, this);
    },

    /**
     * Update dark mode toggle label (☀ = switch to light, 🌙 = switch to dark)
     */
    _updateModeToggleLabel() {
      if (!this._modeToggle) return;
      const app = qx.core.Init.getApplication();
      const isDark = app && app.isDarkMode && app.isDarkMode();
      this._modeToggle.setLabel(isDark ? "☀" : "🌙");
      this._modeToggle.setToolTipText(isDark ? "Switch to light mode" : "Switch to dark mode");
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
