/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("landing_qooxdoo.pages.ProductPreviewPage", {
  extend: qx.ui.container.Composite,

  construct(productCode) {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox(20));
    this.setPadding(40, 60);
    this.setMaxWidth(1200);
    this.setAlignX("center");
    this._productCode = productCode;
    this._init();
  },

  members: {
    _productCode: null,
    _productData: null,

    _init() {
      // Title
      const title = new qx.ui.basic.Label("Loading...");
      title.setFont("bold");
      this._titleLabel = title;
      this.add(title);

      // Description
      const description = new qx.ui.basic.Label("");
      description.setRich(true);
      description.setPaddingBottom(20);
      this._descriptionLabel = description;
      this.add(description);

      // Load product data
      this._loadProductData();
    },

    /**
     * Load product data
     */
    _loadProductData() {
      if (!this._productCode) {
        this._titleLabel.setValue("Product Not Found");
        return;
      }

      landing_qooxdoo.util.ExcelReader.getProductDetails(this._productCode)
        .then(product => {
          if (!product) {
            this._titleLabel.setValue("Product Not Found");
            return;
          }

          this._productData = product;
          this._titleLabel.setValue(product.title);
          this._descriptionLabel.setValue(product.description || "");

          // Add FAQ section if available
          if (product.faq && product.faq.length > 0) {
            this._addFAQSection(product.faq);
          }

          // Add download section if available
          if (product.download && product.download.length > 0) {
            this._addDownloadSection(product.download);
          }

          // Add brochure section if available
          if (product.brochure && product.brochure.length > 0) {
            this._addBrochureSection(product.brochure);
          }
        })
        .catch(error => {
          console.error("Failed to load product:", error);
          this._titleLabel.setValue("Error loading product");
        });
    },

    /**
     * Add FAQ section
     * @param {Array} faqs - FAQ array
     */
    _addFAQSection(faqs) {
      const faqTitle = new qx.ui.basic.Label("Frequently Asked Questions");
      faqTitle.setFont("bold");
      this.add(faqTitle);

      faqs.forEach(faq => {
        const faqItem = new qx.ui.basic.Label(faq);
        faqItem.setRich(true);
        faqItem.setPaddingLeft(20);
        faqItem.setPaddingBottom(12);
        this.add(faqItem);
      });
    },

    /**
     * Add download section
     * @param {Array} downloads - Download array
     */
    _addDownloadSection(downloads) {
      const downloadTitle = new qx.ui.basic.Label("Downloads");
      downloadTitle.setFont("bold");
      this.add(downloadTitle);

      downloads.forEach(download => {
        const downloadButton = new landing_qooxdoo.ui.Button(`Download ${download.version || "File"}`);
        downloadButton.setPaddingBottom(10);
        downloadButton.addListener("execute", () => {
          if (download.link) {
            window.open(download.link, "_blank");
          }
        }, this);
        this.add(downloadButton);
      });
    },

    /**
     * Add brochure section
     * @param {Array} brochures - Brochure array
     */
    _addBrochureSection(brochures) {
      const brochureTitle = new qx.ui.basic.Label("Brochures");
      brochureTitle.setFont("bold");
      this.add(brochureTitle);

      brochures.forEach(brochure => {
        const brochureButton = new landing_qooxdoo.ui.Button(brochure.title || "View Brochure");
        brochureButton.setPaddingBottom(10);
        brochureButton.addListener("execute", () => {
          if (brochure.link) {
            window.open(brochure.link, "_blank");
          }
        }, this);
        this.add(brochureButton);
      });
    }
  }
});
