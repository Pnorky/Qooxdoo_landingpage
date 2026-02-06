/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("landing_qooxdoo.components.FeaturesSection", {
  extend: qx.ui.container.Composite,

  construct() {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox());
    this._init();
  },

  members: {
    _init() {
      // Main content container - centered with max width (compact spacing to avoid zoom-out)
      const contentContainer = new qx.ui.container.Composite();
      contentContainer.setLayout(new qx.ui.layout.VBox(20));
      contentContainer.setPadding(32, 40);
      contentContainer.setMaxWidth(1280);
      contentContainer.setAlignX("center");
      contentContainer.setMinHeight(400);

      // Title section
      const titleContainer = new qx.ui.container.Composite();
      titleContainer.setLayout(new qx.ui.layout.VBox(6));
      titleContainer.setAlignX("center");
      titleContainer.setPaddingBottom(12);

      const title = new qx.ui.basic.Label("SIAS ONLINE (3.x)");
      title.setFont("bold");
      title.setAlignX("center");

      const subtitle = new qx.ui.basic.Label("The best and no. 1 school management system in the Philippines.");
      subtitle.setAlignX("center");
      subtitle.setMaxWidth(672);

      titleContainer.add(title);
      titleContainer.add(subtitle);
      contentContainer.add(titleContainer);

      // Features grid - using HBox with wrapping for 2x2 grid
      const featuresGrid = new qx.ui.container.Composite();
      featuresGrid.setLayout(new qx.ui.layout.VBox(0));

      // First row
      const row1 = new qx.ui.container.Composite();
      row1.setLayout(new qx.ui.layout.HBox(0));
      
      // Second row
      const row2 = new qx.ui.container.Composite();
      row2.setLayout(new qx.ui.layout.HBox(0));

      const features = [
        {
          title: "Integrated Systems",
          description: "Most Complete & Fully Integrated Systems",
          image: "landing_qooxdoo/images/list-of-products.png",
          flex: 2 // Takes 2/3 of width
        },
        {
          title: "Learning Management System",
          description: "The FIRST and ONLY school software with INTEGRATED Learning Management System",
          image: "landing_qooxdoo/images/lms.png",
          flex: 1 // Takes 1/3 of width
        },
        {
          title: "Continuous & Active Development",
          description: "The ONLY school software that is CONTINUOUSLY IMPROVED (Since 1998) DOWNLOADABLE, UPGRADEABLE UNIFIED SYSTEM",
          image: "landing_qooxdoo/images/continuous.png",
          flex: 1 // Takes 1/2 of width
        },
        {
          title: "Cross-Platform",
          description: "The ONLY school software which is 100% Desktop and MOBILE friendly (ALL User Interfaces: Admin, Trans, Tools & Reports)",
          image: "landing_qooxdoo/images/availability.png",
          flex: 1 // Takes 1/2 of width
        }
      ];

      // Add first two features to row 1
      const featureCard1 = this._createFeatureCard(features[0]);
      const featureCard2 = this._createFeatureCard(features[1]);
      row1.add(featureCard1, { flex: 2 });
      row1.add(featureCard2, { flex: 1 });

      // Add last two features to row 2
      const featureCard3 = this._createFeatureCard(features[2]);
      const featureCard4 = this._createFeatureCard(features[3]);
      row2.add(featureCard3, { flex: 1 });
      row2.add(featureCard4, { flex: 1 });

      featuresGrid.add(row1);
      featuresGrid.add(row2);
      contentContainer.add(featuresGrid, { flex: 1 });

      // Center the content container
      this.add(contentContainer);
    },

    /**
     * Create a feature card
     * @param {Object} feature - Feature data
     * @return {qx.ui.container.Composite} Feature card widget
     */
    _createFeatureCard(feature) {
      const card = new qx.ui.container.Composite();
      card.setLayout(new qx.ui.layout.VBox(8));
      card.setPadding(20);
      card.setMinHeight(220);

      // Title
      const title = new qx.ui.basic.Label(feature.title);
      title.setFont("bold");

      // Description
      const description = new qx.ui.basic.Label(feature.description);
      description.setRich(true);

      // Image container
      const imageContainer = new qx.ui.container.Composite();
      imageContainer.setLayout(new qx.ui.layout.Basic());
      imageContainer.setMinHeight(140);
      imageContainer.setMaxHeight(220);
      
      const image = new qx.ui.basic.Image(feature.image);
      image.setScale(true);
      image.setWidth(260);
      image.setHeight(160);
      imageContainer.add(image);

      card.add(title);
      card.add(description, { flex: 0 });
      card.add(imageContainer, { flex: 1 });

      return card;
    }
  }
});
