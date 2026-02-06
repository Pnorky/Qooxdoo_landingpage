/**
 * Custom Label – used globally (Navbar, Footer, Hero, Features, ProductPreview, etc.).
 * Avoid changing default font size, line-height, or padding here; control spacing/layout
 * in the parent components so one page doesn’t force others to zoom.
 */
qx.Class.define("landing_qooxdoo.ui.Label", {
  extend: qx.ui.core.Widget,

  properties: {
    value: {
      check: "String",
      init: "",
      apply: "_applyValue",
      event: "changeValue"
    },
    rich: {
      check: "Boolean",
      init: false,
      apply: "_applyRich"
    },
    textAlign: {
      check: ["left", "center", "right", "justify"],
      init: "left",
      apply: "_applyTextAlign"
    },
    /** When true, text wraps instead of staying on one line (avoids clipping in narrow columns). */
    wrap: {
      check: "Boolean",
      init: false,
      apply: "_applyWrap"
    }
  },

  events: {
    /** Fired when the label value changes */
    "changeValue": "qx.event.type.Data"
  },

  construct(value = "") {
    this.base(arguments);

    // Set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // Store initial value (don't call setter yet as element isn't ready)
    this._initialValue = value;

    // Create HTML for Basecoat label - let Basecoat handle styling
    this._html = new qx.ui.embed.Html(`
      <div style="margin: 0; padding: 0; min-width: min-content; flex-shrink: 0; display: inline-flex; align-items: center; height: 100%;">
        <label class="label" style="min-width: min-content; white-space: nowrap; display: inline-block; overflow: visible;"></label>
      </div>
    `);

    // Add child with layout properties
    this._add(this._html, { edge: 0 });

    // Listen to font property changes
    this.addListener("changeFont", (e) => {
      this._applyFont(e.getData());
    }, this);

    // Hook DOM updates after the element appears
    this._html.addListenerOnce("appear", () => {
      // Now apply properties via property system to sync state
      if (this._initialValue) {
        this.setValue(this._initialValue);
      }
      // Apply font (handles null values)
      this._applyFont(this.getFont());
      this._applyTextAlign(this.getTextAlign());
      // Prevent any overlapping theme/Basecoat CSS from clipping text
      this._applyNoClipStyles();
    });
    // Ensure widget and all content elements allow full text (no overflow clip)
    this.addListenerOnce("appear", () => {
      const contentEl = this.getContentElement();
      if (contentEl) {
        contentEl.setStyle("overflow", "visible");
        contentEl.setStyle("overflowX", "visible");
        contentEl.setStyle("overflowY", "visible");
      }
      if (this._html && this._html.getContentElement()) {
        this._html.getContentElement().setStyle("overflow", "visible");
        this._html.getContentElement().setStyle("overflowX", "visible");
        this._html.getContentElement().setStyle("overflowY", "visible");
      }
      this._applyNoClipStyles();
    });
  },

  members: {
    _html: null,
    _labelElement: null,
    _initialValue: null,

    /**
     * Escape HTML to prevent XSS attacks when rich is false
     * @param {String} text - Text to escape
     * @return {String} Escaped text
     */
    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Get the actual DOM label element
     * @return {Element|null} The label element or null if not available
     */
    _getLabelElement() {
      if (this._labelElement) {
        return this._labelElement;
      }
      
      if (this._html && this._html.getContentElement()) {
        const container = this._html.getContentElement().getDomElement();
        this._labelElement = container ? container.querySelector("label") : null;
        return this._labelElement;
      }
      
      return null;
    },

    /**
     * Apply value changes to the DOM label
     * @param {String} value - The new value
     */
    _applyValue(value) {
      const label = this._getLabelElement();
      if (label) {
        if (this.getRich()) {
          // For rich text, allow HTML
          label.innerHTML = value || "";
        } else {
          // For plain text, escape HTML
          label.textContent = value || "";
        }
      }
    },

    /**
     * Apply rich text setting
     * @param {Boolean} rich - Whether to allow HTML content
     */
    _applyRich(rich) {
      // Re-apply value to update HTML rendering
      // Get current text content from DOM (always read as textContent to get visible text)
      const label = this._getLabelElement();
      let currentValue = "";
      if (label) {
        // Always read as textContent to get the actual displayed text
        currentValue = label.textContent || "";
      } else {
        // DOM not ready yet, use initial value
        currentValue = this._initialValue || "";
      }
      // Re-apply with new rich setting
      this._applyValue(currentValue);
    },

    /**
     * Apply font styling
     * @param {String|null} font - Font style (e.g., "bold", "italic") or null
     */
    _applyFont(font) {
      const label = this._getLabelElement();
      if (label) {
        if (font === "bold") {
          label.style.fontWeight = "bold";
          label.style.fontStyle = "";
        } else if (font === "italic") {
          label.style.fontStyle = "italic";
          label.style.fontWeight = "";
        } else {
          // Clear font styling for null or other values
          label.style.fontWeight = "";
          label.style.fontStyle = "";
        }
      }
    },

    /**
     * Apply text alignment
     * @param {String} align - Text alignment (left, center, right, justify)
     */
    _applyTextAlign(align) {
      const label = this._getLabelElement();
      if (label) {
        const a = align || "left";
        label.style.textAlign = a;
        // For center/right/justify, label must take full width or text won't actually align
        const needsFullWidth = a === "center" || a === "right" || a === "justify";
        label.style.width = needsFullWidth ? "100%" : "";
        label.style.display = needsFullWidth ? "block" : "inline-block";
        const wrapper = label.parentElement;
        if (wrapper) {
          wrapper.style.width = needsFullWidth ? "100%" : "";
          wrapper.style.display = needsFullWidth ? "block" : "inline-flex";
        }
      }
    },

    /**
     * Override any overlapping CSS (theme/Basecoat) that could clip or truncate the label text
     */
    _applyNoClipStyles() {
      const label = this._getLabelElement();
      if (label) {
        const wrap = this.getWrap();
        label.style.overflow = "visible";
        label.style.overflowX = "visible";
        label.style.overflowY = "visible";
        label.style.textOverflow = "clip";
        label.style.whiteSpace = wrap ? "normal" : "nowrap";
        if (wrap) {
          label.style.wordBreak = "break-word";
          label.style.minWidth = "0";
          label.style.maxWidth = "100%";
          label.style.flexShrink = "1";
          label.style.display = "block";
          const wrapper = label.parentElement;
          if (wrapper) {
            wrapper.style.minWidth = "0";
            wrapper.style.flexShrink = "1";
          }
        } else {
          label.style.maxWidth = "none";
          label.style.minWidth = "min-content";
          label.style.flexShrink = "0";
          const wrapper = label.parentElement;
          if (wrapper) {
            wrapper.style.minWidth = "min-content";
            wrapper.style.flexShrink = "0";
          }
        }
      }
    },

    /**
     * Apply wrap: when true, text wraps (white-space: normal) so it doesn't clip in narrow columns.
     */
    _applyWrap(wrap) {
      const label = this._getLabelElement();
      if (label) {
        label.style.whiteSpace = wrap ? "normal" : "nowrap";
        label.style.wordBreak = wrap ? "break-word" : "";
      }
      this._applyNoClipStyles();
    },

    /**
     * Get the current value/text of the label
     * @return {String} The current value
     */
    getValue() {
      const label = this._getLabelElement();
      if (label) {
        return this.getRich() ? label.innerHTML : label.textContent;
      }
      // Return initial value if DOM element not ready yet
      return this._initialValue || "";
    }
  }
});
