qx.Class.define("landing_qooxdoo.ui.PasswordField", {
  extend: qx.ui.core.Widget,

  properties: {
    value: {
      check: "String",
      init: "",
      apply: "_applyValue",
      event: "changeValue"
    },
    placeholder: {
      check: "String",
      init: "",
      apply: "_applyPlaceholder"
    },
    enabled: {
      refine: true
    }
  },

  events: {
    /** Fired when the input value changes */
    "changeValue": "qx.event.type.Data",
    /** Fired when the user types in the field */
    "input": "qx.event.type.Data"
  },

  construct(placeholder = "") {
    this.base(arguments);

    // Set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // Store initial values (don't call setters yet as element isn't ready)
    this._initialPlaceholder = placeholder;

    // Generate unique name for the input element
    this._inputName = `input-${qx.core.Id.getInstance().toHashCode(this)}`;

    // Create HTML with Basecoat class - let Basecoat handle all styling
    this._html = new qx.ui.embed.Html(`
      <div style="margin: 0; padding: 0; min-width: 0; flex: 1; display: flex; align-items: center; height: 100%;">
        <input 
          name="${this._inputName}" 
          class="input" 
          type="password" 
          placeholder="${placeholder || ""}"
          style="width: 100%;"
        >
      </div>
    `);

    // Add child with layout properties
    this._add(this._html, { edge: 0 });

    // Listen to enabled property changes
    this.addListener("changeEnabled", (e) => {
      this._applyEnabled(e.getData());
    }, this);

    // Hook DOM events after the element appears
    this._html.addListenerOnce("appear", () => {
      this._setupInputEvents();
      // Now apply properties via property system to sync state
      if (this._initialPlaceholder) {
        this.setPlaceholder(this._initialPlaceholder);
      }
      // Apply initial enabled state
      this._applyEnabled(this.getEnabled());
      
      // Make widget content element delegate focus to input
      const contentElement = this.getContentElement();
      if (contentElement) {
        const domElement = contentElement.getDomElement();
        if (domElement) {
          // When widget receives focus, delegate to input
          domElement.addEventListener("focusin", (e) => {
            const input = this._getInputElement();
            if (input && e.target === domElement) {
              input.focus();
            }
          });
        }
      }
    });
  },

  members: {
    _html: null,
    _inputName: null,
    _inputElement: null,
    _initialPlaceholder: null,

    /**
     * Setup event listeners on the input element
     */
    _setupInputEvents() {
      const container = this._html.getContentElement().getDomElement();
      this._inputElement = container.querySelector("input");
      
      if (!this._inputElement) {
        return;
      }

      // Exclude qooxdoo widget content element from tab order
      const contentElement = this.getContentElement();
      if (contentElement) {
        const domElement = contentElement.getDomElement();
        if (domElement) {
          domElement.setAttribute("tabindex", "-1");
        }
      }
      
      // Exclude wrapper div from tab order so tabbing goes directly to input
      const wrapperDiv = container.querySelector("div");
      if (wrapperDiv) {
        wrapperDiv.setAttribute("tabindex", "-1");
      }
      
      // Ensure input is focusable - remove any tabindex that might prevent tab navigation
      if (this._inputElement.hasAttribute("tabindex") && this._inputElement.getAttribute("tabindex") === "-1") {
        this._inputElement.removeAttribute("tabindex");
      }
      // Ensure input is explicitly in tab order
      this._inputElement.removeAttribute("tabindex"); // Remove any existing tabindex
      // Native inputs are focusable by default - no tabindex needed

      // Handle Tab key to prevent widget wrapper from interfering
      this._inputElement.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          // Allow Tab to work normally - don't prevent default
          // This ensures tab navigation works properly
          e.stopPropagation(); // Prevent widget wrapper from handling it
        }
      });

      // Listen to input events (fires on every keystroke)
      this._inputElement.addEventListener("input", (e) => {
        const value = e.target.value;
        // Update property (qooxdoo will skip apply if value hasn't changed)
        this.setValue(value);
        this.fireDataEvent("input", value);
      });

      // Listen to change events (fires on blur if value changed)
      this._inputElement.addEventListener("change", (e) => {
        const value = e.target.value;
        // Update property (qooxdoo will skip apply if value hasn't changed)
        this.setValue(value);
        this.fireDataEvent("changeValue", value);
      });
    },

    /**
     * Get the actual DOM input element
     * @return {Element|null} The input element or null if not available
     */
    _getInputElement() {
      if (this._inputElement) {
        return this._inputElement;
      }
      
      if (this._html && this._html.getContentElement()) {
        const container = this._html.getContentElement().getDomElement();
        this._inputElement = container ? container.querySelector("input") : null;
        return this._inputElement;
      }
      
      return null;
    },

    /**
     * Apply value changes to the DOM input
     * @param {String} value - The new value
     * @param {Boolean} oldValue - The old value
     */
    _applyValue(value, oldValue) {
      const input = this._getInputElement();
      if (input && input.value !== value) {
        input.value = value || "";
      }
    },

    /**
     * Apply placeholder changes to the DOM input
     * @param {String} placeholder - The new placeholder
     */
    _applyPlaceholder(placeholder) {
      const input = this._getInputElement();
      if (input) {
        input.placeholder = placeholder || "";
      } else {
        // Element not ready yet, store for later
        this._initialPlaceholder = placeholder;
      }
    },

    /**
     * Apply enabled state changes to the DOM input
     * @param {Boolean} enabled - Whether the field is enabled
     */
    _applyEnabled(enabled) {
      const input = this._getInputElement();
      if (input) {
        input.disabled = !enabled;
      }
    },

    /**
     * Get the current value from the input field
     * @return {String} The current value
     */
    getValue() {
      const input = this._getInputElement();
      return input ? input.value : this.getProperty("value") || "";
    },

    /**
     * Set focus on the input field
     */
    focus() {
      const input = this._getInputElement();
      if (input) {
        input.focus();
      }
    },

    /**
     * Remove focus from the input field
     */
    blur() {
      const input = this._getInputElement();
      if (input) {
        input.blur();
      }
    }
  }
});
