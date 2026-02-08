/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Basecoat-style Card component with header, section, and footer areas.
 * Matches the structure: card w-full > header > section > footer.
 * Add content via getHeader(), getSection(), and getFooter() or use
 * setTitle() / setSubtitle() for the header.
 */
qx.Class.define("landing_qooxdoo.ui.Card", {
  extend: qx.ui.container.Composite,

  properties: {
    /** Card title (header h2) */
    title: {
      check: "String",
      init: "",
      apply: "_applyTitle",
      event: "changeTitle"
    },
    /** Card subtitle (header p) */
    subtitle: {
      check: "String",
      init: "",
      apply: "_applySubtitle",
      event: "changeSubtitle"
    },
    /** Whether the card uses full width (adds "w-full" class) */
    fullWidth: {
      check: "Boolean",
      init: true,
      apply: "_applyFullWidth"
    }
  },

  construct(title = "", subtitle = "", sectionGrows = true) {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox(0));
    this._title = title;
    this._subtitle = subtitle;
    this._sectionGrows = sectionGrows;
    this._init();
  },

  members: {
    _headerComposite: null,
    _headerHtml: null,
    _sectionComposite: null,
    _footerComposite: null,

    _init() {
      // Apply Basecoat "card" and "w-full"; theme.css .card rule uses variables so it adapts automatically
      this.addListenerOnce("appear", () => {
        this._applyCardClasses(this, ["card"]);
        this._applyFullWidth(this.getFullWidth());
      });

      // Header area (Basecoat: <header><h2>...</h2><p>...</p></header>)
      this._headerComposite = new qx.ui.container.Composite();
      this._headerComposite.setLayout(new qx.ui.layout.VBox(4));
      this._headerComposite.setPadding(0);
      this._headerComposite.addListenerOnce("appear", () => {
        this._applyCardClasses(this._headerComposite, ["header"]);
      });

      const titleEsc = this._escapeHtml(this._title || "");
      const subtitleEsc = this._escapeHtml(this._subtitle || "");
      this._headerHtml = new qx.ui.embed.Html(`
        <header style="margin: 0; padding: 0; width: 100%;">
          <h2 class="card-title" style="margin: 0 0 0.25rem 0; font-size: 1.5rem; line-height: 1; font-weight: 600; color: var(--card-foreground);">${titleEsc}</h2>
          <p class="card-subtitle" style="margin: 0; font-size: 0.875rem; color: var(--muted-foreground);">${subtitleEsc}</p>
        </header>
      `);
      this._headerComposite.add(this._headerHtml, { flex: 0 });
      this.add(this._headerComposite, { flex: 0 });
      this._updateHeaderVisibility();

      // Section area (main content). Use flex: 0 when sectionGrows is false (navbar/footer) so the card doesn't stretch.
      this._sectionComposite = new qx.ui.container.Composite();
      this._sectionComposite.setLayout(new qx.ui.layout.VBox(8));
      this._sectionComposite.setPadding(0);
      this._sectionComposite.addListenerOnce("appear", () => {
        this._applyCardClasses(this._sectionComposite, ["section"]);
      });
      this.add(this._sectionComposite, { flex: this._sectionGrows ? 1 : 0 });

      // Footer area (Basecoat: footer with flex)
      this._footerComposite = new qx.ui.container.Composite();
      this._footerComposite.setLayout(new qx.ui.layout.VBox(8));
      this._footerComposite.setPadding(0);
      this._footerComposite.addListenerOnce("appear", () => {
        this._applyCardClasses(this._footerComposite, ["footer"]);
        const el = this._footerComposite.getContentElement();
        if (el && el.getDomElement()) {
          const dom = el.getDomElement();
          dom.style.display = "flex";
          dom.style.flexDirection = "column";
          dom.style.alignItems = "center";
          dom.style.gap = "0.5rem";
        }
      });
      this.add(this._footerComposite, { flex: 0 });
    },

    /**
     * Hide header when both title and subtitle are empty (e.g. for Navbar/Footer cards).
     */
    _updateHeaderVisibility() {
      if (!this._headerComposite) return;
      const hasContent = (this.getTitle() || "").trim() !== "" || (this.getSubtitle() || "").trim() !== "";
      this._headerComposite.setVisibility(hasContent ? "visible" : "excluded");
    },

    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    _applyCardClasses(widget, classes) {
      const contentEl = widget.getContentElement();
      if (contentEl) {
        const dom = contentEl.getDomElement();
        if (dom) {
          classes.forEach(c => dom.classList.add(c));
        }
      }
    },

    _applyTitle(value) {
      this._updateHeaderVisibility();
      if (!this._headerHtml || !this._headerHtml.getContentElement()) return;
      const container = this._headerHtml.getContentElement().getDomElement();
      if (!container) return;
      const h2 = container.querySelector("h2");
      if (h2) h2.textContent = value || "";
    },

    _applySubtitle(value) {
      this._updateHeaderVisibility();
      if (!this._headerHtml || !this._headerHtml.getContentElement()) return;
      const container = this._headerHtml.getContentElement().getDomElement();
      if (!container) return;
      const p = container.querySelector("p");
      if (p) p.textContent = value || "";
    },

    _applyFullWidth(fullWidth) {
      const contentEl = this.getContentElement();
      if (!contentEl) return;
      const dom = contentEl.getDomElement();
      if (!dom) return;
      if (fullWidth) {
        dom.classList.add("w-full");
      } else {
        dom.classList.remove("w-full");
      }
    },

    /**
     * Container for the header (title/subtitle). Use setTitle/setSubtitle for text.
     * @return {qx.ui.container.Composite}
     */
    getHeader() {
      return this._headerComposite;
    },

    /**
     * Container for the main content (e.g. form fields). Add children here.
     * @return {qx.ui.container.Composite}
     */
    getSection() {
      return this._sectionComposite;
    },

    /**
     * Container for footer actions (e.g. buttons, links). Add children here.
     * @return {qx.ui.container.Composite}
     */
    getFooter() {
      return this._footerComposite;
    }
  }
});
