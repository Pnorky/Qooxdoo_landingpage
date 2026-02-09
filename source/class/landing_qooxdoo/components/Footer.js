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
    this.setMinHeight(260);
    this._products = [];
    this._init();
    // Apply footer line-height after DOM ready (and after loadProducts() re-init)
    this.addListenerOnce("appear", () => this._applyCompactFooterStyles());
  },

  members: {
    _products: null,

    _init() {
      // Footer = canvas (this). Two components: columns (top), copyright (bottom).
      this.setLayout(new qx.ui.layout.VBox(0));
      this.setAllowGrowX(true);

      // —— Component 1: 3 columns (top of footer) ——
      const columnsBlock = new qx.ui.container.Composite();
      columnsBlock.setLayout(new qx.ui.layout.VBox(0));
      columnsBlock.setAllowGrowX(true);
      columnsBlock.addListenerOnce("appear", () => {
        const el = columnsBlock.getContentElement();
        if (el && el.getDomElement()) {
          const dom = el.getDomElement();
          dom.classList.add("footer-card-section", "footer-columns-block");
          dom.style.overflow = "visible";
          dom.style.width = "100%";
        }
      });

      const columnsHtml = this._buildColumnsHtml();
      const columnsHtmlWidget = new qx.ui.embed.Html(columnsHtml);
      columnsHtmlWidget.setAllowGrowX(true);
      columnsHtmlWidget.addListenerOnce("appear", () => {
        const self = this;
        const handleFooterClick = (e) => {
          const a = e.target.closest("a");
          if (!a) return;
          const dataHref = a.getAttribute("data-href");
          if (dataHref) {
            e.preventDefault();
            e.stopPropagation();
            self.fireDataEvent("navigate", { path: dataHref });
            return;
          }
          if (a.getAttribute("href") && a.getAttribute("href") !== "#") return;
          e.preventDefault();
        };
        const bindInDocument = (doc) => {
          if (!doc || doc._footerLinksBound) return;
          doc._footerLinksBound = true;
          doc.addEventListener("click", handleFooterClick, true);
          try {
            const root = doc.body || doc.documentElement;
            if (root && root.querySelectorAll) {
              root.querySelectorAll("a[data-href]").forEach(link => {
                link.addEventListener("click", (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const path = link.getAttribute("data-href");
                  if (path) self.fireDataEvent("navigate", { path });
                }, true);
              });
            }
          } catch (err) {}
        };
        const htmlEl = columnsHtmlWidget.getContentElement && columnsHtmlWidget.getContentElement();
        const root = htmlEl && htmlEl.getDomElement && htmlEl.getDomElement();
        if (root) {
          root.style.overflow = "visible";
          root.style.minHeight = "0";
          bindInDocument(root.ownerDocument);
          const iframe = root.querySelector && root.querySelector("iframe");
          if (iframe) {
            const onIframeReady = () => {
              try {
                const idoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
                if (idoc && idoc.body) bindInDocument(idoc);
              } catch (err) {}
            };
            if (iframe.contentDocument && iframe.contentDocument.body) {
              onIframeReady();
            } else {
              iframe.addEventListener("load", onIframeReady);
              setTimeout(onIframeReady, 150);
              setTimeout(onIframeReady, 500);
            }
          }
        }
        const blockEl = columnsBlock.getContentElement();
        const sectionDom = blockEl && blockEl.getDomElement();
        if (sectionDom && !sectionDom._footerClickBound) {
          sectionDom._footerClickBound = true;
          sectionDom.addEventListener("click", handleFooterClick, true);
        }
      });
      columnsBlock.add(columnsHtmlWidget);

      // —— Component 2: copyright (bottom of footer) ——
      const copyrightBlock = new qx.ui.container.Composite();
      copyrightBlock.setLayout(new qx.ui.layout.VBox(0));
      copyrightBlock.setAllowGrowX(true);
      copyrightBlock.addListenerOnce("appear", () => {
        const el = copyrightBlock.getContentElement();
        if (el && el.getDomElement()) {
          const dom = el.getDomElement();
          dom.classList.add("footer-copyright-block");
          dom.style.overflow = "visible";
          dom.style.width = "100%";
        }
      });

      const copyrightRow = new qx.ui.container.Composite();
      copyrightRow.setLayout(new qx.ui.layout.HBox());
      copyrightRow.setMarginTop(80);
      copyrightRow.setPadding(0, 0);
      copyrightRow.setAllowGrowX(true);
      copyrightRow.addListenerOnce("appear", () => {
        const el = copyrightRow.getContentElement();
        if (el && el.getDomElement()) el.getDomElement().classList.add("footer-copyright-row");
      });
      const copyrightSpacerLeft = new qx.ui.core.Spacer();
      const copyrightSpacerRight = new qx.ui.core.Spacer();
      const copyrightWidth = 380;
      const copyrightHtml = this._buildCopyrightHtml();
      const copyrightHtmlWidget = new qx.ui.embed.Html(copyrightHtml);
      copyrightHtmlWidget.setMinWidth(copyrightWidth);
      copyrightHtmlWidget.setAllowShrinkX(false);
      copyrightRow.add(copyrightSpacerLeft, { flex: 1 });
      copyrightRow.add(copyrightHtmlWidget, { flex: 0 });
      copyrightRow.add(copyrightSpacerRight, { flex: 1 });
      copyrightBlock.add(copyrightRow);

      // Canvas: add the two components (columns on top, copyright on bottom)
      this.add(columnsBlock, { flex: 0 });
      this.add(copyrightBlock, { flex: 0 });

      const applyFooterStyles = () => {
        const contentEl = this.getContentElement();
        if (contentEl) {
          const dom = contentEl.getDomElement();
          if (dom) {
            dom.classList.add("footer-card");
            dom.style.border = "none";
            dom.style.width = "100%";
            dom.style.overflow = "visible";
            dom.style.minHeight = "280px";
            dom.style.display = "flex";
            dom.style.flexDirection = "column";
          }
        }
        const columnsBlockEl = columnsBlock.getContentElement();
        if (columnsBlockEl) {
          const d = columnsBlockEl.getDomElement();
          if (d) {
            d.classList.add("footer-card-section", "footer-columns-block");
            d.style.padding = "12px 8px 40px 0";
            d.style.display = "flex";
            d.style.flexDirection = "column";
            d.style.alignItems = "stretch";
            d.style.minHeight = "0";
            d.style.overflow = "visible";
            d.style.width = "100%";
          }
        }
        const copyrightBlockEl = copyrightBlock.getContentElement();
        if (copyrightBlockEl) {
          const d = copyrightBlockEl.getDomElement();
          if (d) {
            d.classList.add("footer-copyright-block");
            d.style.padding = "80px 8px 16px";
            d.style.minHeight = "72px";
            d.style.display = "flex";
            d.style.flexDirection = "column";
            d.style.alignItems = "center";
            d.style.gap = "0";
            d.style.overflow = "visible";
            d.style.width = "100%";
          }
        }
      };

      this.addListenerOnce("appear", applyFooterStyles);
      setTimeout(applyFooterStyles, 100);
      setTimeout(applyFooterStyles, 400);
    },

    _escapeHtml(str) {
      if (!str) return "";
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    },

    _buildCopyrightHtml() {
      const lineStyle = "color:#fff;font-size:13px;line-height:1;margin:0;padding:0;text-align:center;display:block";
      const esc = s => this._escapeHtml(s);
      return "<div class=\"footer-copyright-text\" style=\"line-height:1;margin:0;padding:0;text-align:center;color:#fff;font-size:13px;\">" +
        "<div style=\"" + lineStyle + "\">" + esc("All Rights Reserved 2003-2026") + "</div>" +
        "<div style=\"" + lineStyle + "\">" + esc("Digital Software Corporation © 2003-2026") + "</div>" +
        "<div style=\"" + lineStyle + "\">" + esc("Designed by Okonut & Friends") + "</div>" +
        "</div>";
    },

    _buildColumnsHtml() {
      const esc = s => this._escapeHtml(s);
      const rowStyle = "display:flex;flex-direction:row;justify-content:space-between;gap:80px;width:880px;max-width:100%;margin:0 auto;padding:0 8px;box-sizing:border-box;overflow:visible;min-height:0";
      const titleStyle = "color:#FFA500;font-weight:bold;font-size:13px;margin:0 0 4px 0;padding:0";
      const itemStyle = "color:#fff;font-size:13px;line-height:1.3;margin:0 0 2px 0;padding:0;text-decoration:none;display:block";
      const linkStyle = itemStyle + ";cursor:pointer";
      const lineStyle = "color:#fff;font-size:13px;line-height:1.3;margin:0 0 2px 0;padding:0";
      let productsHtml = "<div style=\"" + titleStyle + "\">PRODUCTS</div>";
      (this._products || []).forEach(p => {
        productsHtml += "<a href=\"#\" data-href=\"" + esc(p.href || "") + "\" style=\"" + linkStyle + "\">" + esc(p.code || "") + "</a>";
      });
      const othersItems = [
        { label: "List of clients", href: "/list-of-clients" },
        { label: "Release Notes", href: "/release-notes" }
      ];
      let othersHtml = "<div style=\"" + titleStyle + "\">OTHERS</div>";
      othersItems.forEach(o => {
        othersHtml += "<a href=\"#\" data-href=\"" + esc(o.href) + "\" style=\"" + linkStyle + "\">" + esc(o.label) + "</a>";
      });
      const lineBlock = "display:block;margin:0 0 6px 0;";
      let contactHtml = "<div class=\"footer-column-contact\" style=\"flex:0 0 auto;min-width:0;max-width:420px\">";
      contactHtml += "<div style=\"" + titleStyle + "\">FOR MORE INFORMATION CONTACT</div>";
      contactHtml += "<div style=\"" + lineStyle + ";font-weight:bold;" + lineBlock + "\">THOMAS C. SADDUL</div>";
      contactHtml += "<div style=\"" + lineStyle + ";" + lineBlock + "\">President / CEO / Chief Architect</div>";
      contactHtml += "<a href=\"mailto:digisoftphofficial@gmail.com\" style=\"" + linkStyle + ";" + lineBlock + "\">✉ digisoftphofficial@gmail.com</a>";
      contactHtml += "<div style=\"" + lineStyle + ";" + lineBlock + ";white-space:nowrap;\">📞 <a href=\"tel:+639278591168\" style=\"" + linkStyle + ";display:inline;\">Globe: 09278591168</a> | <a href=\"tel:+639214524212\" style=\"" + linkStyle + ";display:inline;\">Smart: 09214524212</a></div>";
      contactHtml += "<div style=\"" + lineStyle + ";" + lineBlock + "\">📍 Paranaque City, Philippines</div>";
      contactHtml += "<a href=\"https://www.facebook.com/DigiSoftPH/\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"" + linkStyle + ";" + lineBlock + "\">📘 DigiSoftPH</a>";
      contactHtml += "</div>";
      return "<div class=\"footer-columns-html-row\" style=\"" + rowStyle + "\">" +
        "<div class=\"footer-column\" style=\"flex:0 0 auto;min-width:0\">" + productsHtml + "</div>" +
        "<div class=\"footer-column\" style=\"flex:0 0 auto;min-width:0\">" + othersHtml + "</div>" +
        contactHtml +
        "</div>";
    },

    /**
     * Load products for footer
     */
    loadProducts() {
      landing_qooxdoo.util.ExcelReader.getAllProducts().then(products => {
        this._products = products || [];
        this.removeAll();
        try {
          this._init();
          this._applyCompactFooterStyles();
        } catch (e) {
          console.error("Footer _init failed:", e);
          this._init();
        }
      }).catch(error => {
        console.error("Failed to load products:", error);
        this._products = [];
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
      dom.style.lineHeight = "1.2";
    }
  }
});
