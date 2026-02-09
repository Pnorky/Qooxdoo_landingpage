/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

qx.Class.define("landing_qooxdoo.pages.ProductPreviewPage", {
  extend: qx.ui.container.Composite,

  events: {
    /** Fired when navigation is requested (e.g. breadcrumb Home) */
    navigate: "qx.event.type.Data"
  },

  construct(productCode) {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox(0));
    this.setPadding(0);
    this._productCode = productCode;
    this._downloads = [];
    this._init();
  },

  members: {
    _productCode: null,
    _productData: null,
    _downloads: null,
    _versionCombo: null,
    _versionComboContainer: null,
    _mainScroll: null,
    _releaseNotesArea: null,
    _faqContainer: null,
    _brochureContainer: null,
    _breadcrumbProduct: null,
    _mainContent: null,
    _sectionOverview: null,
    _sectionDownload: null,
    _sectionRelease: null,
    _sectionBrochures: null,

    _scrollToSection(sectionComposite) {
      const scroll = this._mainScroll;
      if (!scroll || !sectionComposite) return;
      try {
        const top = scroll.getItemTop(sectionComposite);
        if (typeof top === "number") {
          scroll.scrollToY(Math.max(0, top - 16), 300);
        }
      } catch (e) {
        const el = sectionComposite.getContentElement && sectionComposite.getContentElement();
        if (el && el.getDomElement) {
          const dom = el.getDomElement();
          if (dom && typeof dom.scrollIntoView === "function") {
            dom.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    },

    _init() {
      const root = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
      root.setPadding(0);
      this.add(root, { flex: 1 });

      // Left sidebar (Overview, Download, Release Notes, Brochures) – scroll to section on tap
      const sidebar = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
      sidebar.setWidth(200);
      sidebar.setMinWidth(200);
      sidebar.setPadding(24, 16);
      sidebar.setBackgroundColor("transparent");
      if (sidebar.getContentElement()) sidebar.getContentElement().addClass("product-preview-sidebar");

      const overviewLabel = new landing_qooxdoo.ui.Label("Overview");
      overviewLabel.setWrap(true);
      overviewLabel.setCursor("pointer");
      sidebar.add(overviewLabel);

      const downloadLabel = new landing_qooxdoo.ui.Label("Download");
      downloadLabel.setWrap(true);
      downloadLabel.setCursor("pointer");
      sidebar.add(downloadLabel);

      const releaseLabel = new landing_qooxdoo.ui.Label("Release Notes");
      releaseLabel.setWrap(true);
      releaseLabel.setCursor("pointer");
      sidebar.add(releaseLabel);

      const brochuresLabel = new landing_qooxdoo.ui.Label("Brochures");
      brochuresLabel.setWrap(true);
      brochuresLabel.setCursor("pointer");
      sidebar.add(brochuresLabel);

      root.add(sidebar, { flex: 0 });

      // Add CSS scope class so theme.css can target product page (appearance does not add custom classes)
      const pageContentEl = this.getContentElement();
      if (pageContentEl && pageContentEl.addClass) pageContentEl.addClass("product-preview-page");

      // Main content (scrollable)
      this._mainScroll = new qx.ui.container.Scroll();
      this._mainScroll.setScrollbarY("auto");
      this._mainScroll.setScrollbarX("off");
      const mainContent = new qx.ui.container.Composite(new qx.ui.layout.VBox(24));
      mainContent.setPadding(32, 40);
      mainContent.setMinWidth(400);
      if (mainContent.getContentElement()) mainContent.getContentElement().addClass("product-preview-content");
      this._mainScroll.add(mainContent);
      root.add(this._mainScroll, { flex: 1 });
      this._mainContent = mainContent;

      // Section wrappers for scroll-into-view (sidebar nav)
      const overviewSection = new qx.ui.container.Composite(new qx.ui.layout.VBox(24));
      const downloadSection = new qx.ui.container.Composite(new qx.ui.layout.VBox(24));
      const releaseSection = new qx.ui.container.Composite(new qx.ui.layout.VBox(24));
      const brochureSection = new qx.ui.container.Composite(new qx.ui.layout.VBox(24));
      this._sectionOverview = overviewSection;
      this._sectionDownload = downloadSection;
      this._sectionRelease = releaseSection;
      this._sectionBrochures = brochureSection;

      overviewLabel.addListener("tap", () => this._scrollToSection(overviewSection));
      downloadLabel.addListener("tap", () => this._scrollToSection(downloadSection));
      releaseLabel.addListener("tap", () => this._scrollToSection(releaseSection));
      brochuresLabel.addListener("tap", () => this._scrollToSection(brochureSection));

      // Breadcrumbs: Home > ProductCode (16px + link underline via theme)
      const breadcrumbContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
      if (breadcrumbContainer.getContentElement()) breadcrumbContainer.getContentElement().addClass("product-breadcrumb");
      const homeLink = new landing_qooxdoo.ui.Label("Home");
      if (homeLink.getContentElement()) homeLink.getContentElement().addClass("product-breadcrumb-link");
      homeLink.setFont("bold");
      homeLink.addListener("tap", () => this.fireDataEvent("navigate", { path: "/" }));
      breadcrumbContainer.add(homeLink);
      const sep = new landing_qooxdoo.ui.Label(">");
      breadcrumbContainer.add(sep);
      this._breadcrumbProduct = new landing_qooxdoo.ui.Label(this._productCode || "");
      this._breadcrumbProduct.setFont("bold");
      breadcrumbContainer.add(this._breadcrumbProduct);
      overviewSection.add(breadcrumbContainer);

      // Title + description with tight spacing (less gap between title and description)
      const titleDescBlock = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
      if (titleDescBlock.getContentElement()) titleDescBlock.getContentElement().addClass("product-title-description-block");
      this._titleLabel = new landing_qooxdoo.ui.Label("Loading...");
      this._titleLabel.setFont("bold");
      this._titleLabel.setWrap(true);
      if (this._titleLabel.getContentElement()) this._titleLabel.getContentElement().addClass("product-title");
      titleDescBlock.add(this._titleLabel);
      this._descriptionLabel = new landing_qooxdoo.ui.Label("");
      this._descriptionLabel.setRich(true);
      this._descriptionLabel.setWrap(true);
      titleDescBlock.add(this._descriptionLabel);
      overviewSection.add(titleDescBlock);

      // FAQ section container (filled when data loads)
      this._faqContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(12));
      overviewSection.add(this._faqContainer);

      mainContent.add(overviewSection);

      // Download section: "DOWNLOAD" heading + ComboBox (16px via theme)
      const downloadSectionTitle = new landing_qooxdoo.ui.Label("DOWNLOAD");
      downloadSectionTitle.setFont("bold");
      if (downloadSectionTitle.getContentElement()) downloadSectionTitle.getContentElement().addClass("product-section-title");
      downloadSection.add(downloadSectionTitle);

      this._versionComboContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
      if (this._versionComboContainer.getContentElement()) this._versionComboContainer.getContentElement().addClass("product-download-combo-wrap");
      downloadSection.add(this._versionComboContainer);
      mainContent.add(downloadSection);

      // Release Notes section (16px via theme)
      const releaseTitle = new landing_qooxdoo.ui.Label("RELEASE NOTES");
      releaseTitle.setFont("bold");
      if (releaseTitle.getContentElement()) releaseTitle.getContentElement().addClass("product-section-title");
      releaseSection.add(releaseTitle);

      this._releaseNotesArea = new landing_qooxdoo.ui.TextArea("Release notes will be listed here when available.");
      this._releaseNotesArea.setWrap(true);
      this._releaseNotesArea.setMinHeight(200);
      this._releaseNotesArea.setEnabled(false);
      releaseSection.add(this._releaseNotesArea);
      mainContent.add(releaseSection);

      // Brochures section (16px via theme)
      const brochureSectionTitle = new landing_qooxdoo.ui.Label("BROCHURES");
      brochureSectionTitle.setFont("bold");
      if (brochureSectionTitle.getContentElement()) brochureSectionTitle.getContentElement().addClass("product-section-title");
      brochureSection.add(brochureSectionTitle);

      this._brochureContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
      brochureSection.add(this._brochureContainer);
      mainContent.add(brochureSection);

      this._loadProductData();
    },

    _loadProductData() {
      if (!this._productCode) {
        this._titleLabel.setValue("Product Not Found");
        this._breadcrumbProduct.setValue("");
        return;
      }

      landing_qooxdoo.util.ExcelReader.getProductDetails(this._productCode)
        .then(product => {
          if (!product) {
            this._titleLabel.setValue("Product Not Found");
            this._breadcrumbProduct.setValue(this._productCode);
            return;
          }

          this._productData = product;
          this._titleLabel.setValue(product.title);
          this._descriptionLabel.setValue(product.description || "");
          this._breadcrumbProduct.setValue(product.title);

          this._faqContainer.removeAll();
          if (product.faq && product.faq.length > 0) {
            const faqTitle = new landing_qooxdoo.ui.Label("FAQ");
            faqTitle.setFont("bold");
            if (faqTitle.getContentElement()) faqTitle.getContentElement().addClass("product-section-title");
            this._faqContainer.add(faqTitle);
            product.faq.forEach(faq => {
              const item = new landing_qooxdoo.ui.Label("✓ " + faq);
              item.setRich(true);
              item.setWrap(true);
              this._faqContainer.add(item);
            });
          }

          this._downloads = product.download || [];
          this._versionComboContainer.removeAll();
          this._versionCombo = new landing_qooxdoo.ui.ComboBox();
          this._versionCombo.setWidth(280);
          this._versionCombo.setMaxWidth(320);
          this._versionCombo.add({
            getLabel: () => "Select version...",
            getValue: () => ""
          });
          this._downloads.forEach((dl, idx) => {
            const label = "Download " + (dl.version || "File");
            this._versionCombo.add({
              getLabel: () => label,
              getValue: () => String(idx)
            });
          });
          this._versionCombo.setValue("");
          this._versionCombo.addListener("changeValue", (e) => {
            const value = e.getData();
            if (value === "" || value == null) return;
            const i = parseInt(value, 10);
            if (!isNaN(i) && this._downloads[i] && this._downloads[i].link) {
              window.open(this._downloads[i].link, "_blank");
            }
          }, this);
          this._versionComboContainer.add(this._versionCombo);

          if (product.release_notes) {
            this._releaseNotesArea.setValue(product.release_notes);
          }

          this._brochureContainer.removeAll();
          if (product.brochure && product.brochure.length > 0) {
            product.brochure.forEach(brochure => {
              const linkLabel = new landing_qooxdoo.ui.Label(brochure.title || "View Brochure");
              linkLabel.setCursor("pointer");
              if (linkLabel.getContentElement()) linkLabel.getContentElement().addClass("product-brochure-link");
              linkLabel.addListener("tap", () => {
                if (brochure.link) window.open(brochure.link, "_blank");
              }, this);
              this._brochureContainer.add(linkLabel);
            });
          } else {
            const noBrochuresLabel = new landing_qooxdoo.ui.Label("No brochures available");
            if (noBrochuresLabel.getContentElement()) noBrochuresLabel.getContentElement().addClass("product-brochure-empty");
            this._brochureContainer.add(noBrochuresLabel);
          }
        })
        .catch(() => {
          this._titleLabel.setValue("Error loading product");
          this._breadcrumbProduct.setValue(this._productCode);
        });
    }
  }
});
