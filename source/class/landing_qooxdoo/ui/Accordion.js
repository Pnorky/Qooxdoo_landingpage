/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Basecoat-style accordion (one open at a time). Uses theme variables for dark mode.
 * Add items via addItem(summary, content) or setItems([{summary, content}]).
 */
qx.Class.define("landing_qooxdoo.ui.Accordion", {
  extend: qx.ui.core.Widget,

  properties: {
    /** Whether content may contain HTML (if false, content is escaped) */
    richContent: {
      check: "Boolean",
      init: false
    }
  },

  construct() {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.Canvas());
    this._items = [];
    this._accordionId = `accordion-${qx.core.Id.getInstance().toHashCode(this)}`;
    this._html = new qx.ui.embed.Html(`<section class="accordion clients-accordion-theme" id="${this._accordionId}" style="width:100%;"></section>`);
    this._add(this._html, { edge: 0 });
    this._html.addListenerOnce("appear", () => {
      this._render();
      this._attachOneOpenBehavior();
    }, this);
  },

  members: {
    _items: null,
    _html: null,
    _accordionId: null,

    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Add an accordion item.
     * @param {String} summary - Title (clickable)
     * @param {String} content - Body (plain or HTML if richContent)
     */
    addItem(summary, content) {
      this._items.push({ summary: summary || "", content: content != null ? String(content) : "" });
      const section = this._getSectionElement();
      if (section) {
        const frag = this._buildItemFragment(this._items[this._items.length - 1], this._items.length - 1);
        section.appendChild(frag);
        this._scheduleUpdateHeight();
      }
    },

    /**
     * Set all items at once (replaces existing).
     * @param {Array<{summary: string, content: string}>} items
     */
    setItems(items) {
      this._items = Array.isArray(items) ? items.slice() : [];
      this._render();
    },

    _buildItemFragment(item, index) {
      const summaryEsc = this._escapeHtml(item.summary);
      const contentEsc = this.getRichContent() ? item.content : this._escapeHtml(item.content);
      const details = document.createElement("details");
      details.className = "group border-b last:border-b-0";
      details.setAttribute("data-index", String(index));
      details.innerHTML = `
        <summary class="w-full focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all outline-none rounded-md">
          <h2 class="flex flex-1 items-start justify-between gap-4 py-4 text-left text-sm font-medium hover:underline">
            ${summaryEsc}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 group-open:rotate-180"><path d="m6 9 6 6 6-6"/></svg>
          </h2>
        </summary>
        <section class="pb-4 accordion-content-section">
          <div class="text-sm whitespace-pre-wrap accordion-content-body">${contentEsc}</div>
        </section>
      `;
      return details;
    },

    _getSectionElement() {
      const root = this._html && this._html.getContentElement() && this._html.getContentElement().getDomElement();
      if (!root) return null;
      return root.querySelector("#" + this._accordionId) || root.firstElementChild || root;
    },

    _render() {
      const section = this._getSectionElement();
      if (!section) return;
      section.innerHTML = "";
      this._items.forEach((item, index) => {
        section.appendChild(this._buildItemFragment(item, index));
      });
      this._scheduleUpdateHeight();
    },

    _scheduleUpdateHeight() {
      const section = this._getSectionElement();
      if (!section) return;
      const update = () => {
        if (this.isDisposed()) return;
        const el = this._getSectionElement();
        if (el && el.scrollHeight) this.setMinHeight(el.scrollHeight);
      };
      setTimeout(update, 0);
    },

    _attachOneOpenBehavior() {
      const section = this._getSectionElement();
      if (!section) return;
      section.addEventListener("click", (event) => {
        const summary = event.target.closest("summary");
        if (!summary) return;
        const details = summary.closest("details");
        if (!details) return;
        section.querySelectorAll("details").forEach((el) => {
          if (el !== details) {
            el.removeAttribute("open");
          }
        });
      });
    }
  }
});
