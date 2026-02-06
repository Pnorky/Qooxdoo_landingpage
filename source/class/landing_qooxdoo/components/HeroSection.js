/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("landing_qooxdoo.components.HeroSection", {
  extend: qx.ui.container.Composite,

  events: {
    /** Fired when a product is clicked */
    productClick: "qx.event.type.Data"
  },

  construct() {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox());
    this._products = [];
    this._currentIndex = 0;
    this._init();
  },

  members: {
    _products: null,
    _currentIndex: null,
    _productCard: null,
    _autoPlayTimer: null,
    _dotsContainer: null,

    _init() {
      // Set full viewport height
      this.setHeight(600);
      this.setPadding(40);
      this.setMinHeight(600);

      // Main content container - centered with max width
      const contentContainer = new qx.ui.container.Composite();
      contentContainer.setLayout(new qx.ui.layout.VBox(24));
      contentContainer.setMaxWidth(1200);
      contentContainer.setAlignX("center");
      contentContainer.setAlignY("middle");
      contentContainer.setMinHeight(520);

      // Product card container - centered content
      this._productCard = new qx.ui.container.Composite();
      this._productCard.setLayout(new qx.ui.layout.VBox(24));
      this._productCard.setPadding(40);
      this._productCard.setAlignX("center");

      this._titleLabel = new qx.ui.basic.Label("Loading...");
      this._titleLabel.setFont("bold");
      this._titleLabel.setAlignX("center");

      this._descriptionLabel = new qx.ui.basic.Label("");
      this._descriptionLabel.setAlignX("center");
      this._descriptionLabel.setMaxWidth(800);
      this._descriptionLabel.setRich(true);

      const viewMoreButton = new landing_qooxdoo.ui.Button("VIEW MORE");
      viewMoreButton.setAlignX("center");
      viewMoreButton.setWidth(130);
      viewMoreButton.addListener("execute", () => {
        if (this._products.length > 0) {
          this.pauseAutoPlay();
          this.fireDataEvent("productClick", this._products[this._currentIndex]);
        }
      }, this);
      
      this._productCard.addListener("mouseover", () => {
        this.pauseAutoPlay();
      }, this);
      
      this._productCard.addListener("mouseout", () => {
        setTimeout(() => {
          this.resumeAutoPlay();
        }, 2000);
      }, this);

      this._productCard.add(this._titleLabel);
      this._productCard.add(this._descriptionLabel);
      this._productCard.add(viewMoreButton);

      // Navigation dots container - positioned below VIEW MORE button, centered
      const dotsWrapper = new qx.ui.container.Composite();
      dotsWrapper.setLayout(new qx.ui.layout.HBox());
      dotsWrapper.setPaddingTop(20);
      
      // Left spacer to center the dots
      const leftSpacer = new qx.ui.core.Spacer();
      dotsWrapper.add(leftSpacer, { flex: 1 });
      
      this._dotsContainer = new qx.ui.container.Composite();
      this._dotsContainer.setLayout(new qx.ui.layout.HBox(8));
      dotsWrapper.add(this._dotsContainer);
      
      // Right spacer to center the dots
      const rightSpacer = new qx.ui.core.Spacer();
      dotsWrapper.add(rightSpacer, { flex: 1 });
      
      this._productCard.add(dotsWrapper);

      contentContainer.add(this._productCard);

      this.add(contentContainer);
    },

    /**
     * Load products and start carousel
     */
    loadProducts() {
      landing_qooxdoo.util.ExcelReader.getAllProducts().then(products => {
        if (!products || products.length === 0) {
          this._titleLabel.setValue("Welcome to Digital Software Corporation");
          this._descriptionLabel.setValue("School Management Systems");
          return;
        }
        
        this._products = products;
        this._currentIndex = 0;
        this._updateCarousel();
        this._createDots();
        this._startAutoPlay();
      }).catch(error => {
        console.error("Failed to load products:", error);
        this._titleLabel.setValue("Welcome to Digital Software Corporation");
        this._descriptionLabel.setValue("School Management Systems");
      });
    },

    /**
     * Update carousel display
     */
    _updateCarousel() {
      if (this._products.length === 0) {
        return;
      }

      const product = this._products[this._currentIndex];
      this._titleLabel.setValue(product.title);
      this._descriptionLabel.setValue(product.short_des || "");
    },

    /**
     * Create navigation dots
     */
    _createDots() {
      this._dotsContainer.removeAll();
      this._dots = [];

      for (let i = 0; i < this._products.length; i++) {
        const dot = new qx.ui.basic.Label("○");
        const index = i;
        dot.setRich(true);
        dot.addListener("tap", () => {
          this.pauseAutoPlay();
          this._currentIndex = index;
          this._updateCarousel();
          this._updateDots();
          setTimeout(() => {
            this.resumeAutoPlay();
          }, 5000);
        }, this);
        this._dots.push(dot);
        this._dotsContainer.add(dot);
      }
      this._updateDots();
    },

    /**
     * Update dots appearance
     */
    _updateDots() {
      if (!this._dots) {
        return;
      }
      this._dots.forEach((dot, index) => {
        if (index === this._currentIndex) {
          dot.setValue("●");
        } else {
          dot.setValue("○");
        }
      });
    },

    /**
     * Start auto-play
     */
    _startAutoPlay() {
      if (this._autoPlayTimer) {
        this._autoPlayTimer.stop();
        this._autoPlayTimer.dispose();
      }
      
      if (this._products.length <= 1) {
        return;
      }
      
      this._autoPlayTimer = new qx.event.Timer(4000);
      this._autoPlayTimer.addListener("interval", () => {
        this._currentIndex = (this._currentIndex + 1) % this._products.length;
        this._updateCarousel();
        this._updateDots();
      }, this);
      this._autoPlayTimer.start();
    },
    
    /**
     * Pause auto-play
     */
    pauseAutoPlay() {
      if (this._autoPlayTimer) {
        this._autoPlayTimer.stop();
      }
    },
    
    /**
     * Resume auto-play
     */
    resumeAutoPlay() {
      if (this._autoPlayTimer && this._products.length > 1) {
        this._autoPlayTimer.start();
      } else {
        this._startAutoPlay();
      }
    }
  },

  destruct() {
    if (this._autoPlayTimer) {
      this._autoPlayTimer.stop();
      this._autoPlayTimer.dispose();
    }
    this.base(arguments);
  }
});
