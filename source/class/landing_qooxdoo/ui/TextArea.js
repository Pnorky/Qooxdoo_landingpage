qx.Class.define("landing_qooxdoo.ui.TextArea", {
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
        wrap: {
            check: "Boolean",
            init: true,
            apply: "_applyWrap"
        },
        enabled: {
            refine: true
        }
    },

    events: {
        /** Fired when the textarea value changes */
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

        // Generate unique name for the textarea element
        this._textareaName = `textarea-${qx.core.Id.getInstance().toHashCode(this)}`;

        // Create HTML with Basecoat class - override only display property
        this._html = new qx.ui.embed.Html(`
      <div style="margin: 0; padding: 0; min-width: 0; flex: 1; width: 100%;">
        <style>
          textarea[name="${this._textareaName}"].textarea {
            display: block !important;
          }
        </style>
        <textarea 
          name="${this._textareaName}" 
          class="textarea" 
          placeholder="${placeholder || ""}"
          rows="4"
          style="resize: vertical;"
        ></textarea>
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
            // Ensure widget content element allows overflow
            const widgetElement = this.getContentElement();
            if (widgetElement) {
                widgetElement.setStyle("overflow", "visible");
                widgetElement.setStyle("min-width", "0");
                widgetElement.setStyle("width", "100%");
            }

            // Ensure textarea displays correctly and respects widget dimensions
            const textarea = this._getTextAreaElement();
            if (textarea) {
                // Ensure it's actually a textarea, not being converted to input
                if (textarea.tagName.toLowerCase() !== "textarea") {
                    console.error("TextArea element is not a textarea tag!");
                }
                // Apply widget dimensions to textarea
                const widgetWidth = this.getWidth();
                const widgetHeight = this.getHeight();
                if (widgetWidth) {
                    textarea.style.width = widgetWidth + "px";
                }
                if (widgetHeight) {
                    textarea.style.height = widgetHeight + "px";
                }
            }
            
            // Listen to dimension changes
            this.addListener("changeWidth", (e) => {
                const textarea = this._getTextAreaElement();
                if (textarea) {
                    const width = e.getData();
                    textarea.style.width = width ? width + "px" : "100%";
                }
            }, this);
            
            this.addListener("changeHeight", (e) => {
                const textarea = this._getTextAreaElement();
                if (textarea) {
                    const height = e.getData();
                    textarea.style.height = height ? height + "px" : "auto";
                }
            }, this);

            this._setupTextAreaEvents();
            // Now apply properties via property system to sync state
            if (this._initialPlaceholder) {
                this.setPlaceholder(this._initialPlaceholder);
            }
            // Apply initial enabled state
            this._applyEnabled(this.getEnabled());
            // Apply initial wrap state
            this._applyWrap(this.getWrap());
            
            // Make widget content element delegate focus to textarea
            const contentElement = this.getContentElement();
            if (contentElement) {
                const domElement = contentElement.getDomElement();
                if (domElement) {
                    // When widget receives focus, delegate to textarea
                    domElement.addEventListener("focusin", (e) => {
                        const textarea = this._getTextAreaElement();
                        if (textarea && e.target === domElement) {
                            textarea.focus();
                        }
                    });
                }
            }
        });
    },

    members: {
        _html: null,
        _textareaName: null,
        _textareaElement: null,
        _initialPlaceholder: null,

        /**
         * Setup event listeners on the textarea element
         */
        _setupTextAreaEvents() {
            const container = this._html.getContentElement().getDomElement();
            this._textareaElement = container.querySelector("textarea");

            if (!this._textareaElement) {
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
            
            // Exclude wrapper div from tab order so tabbing goes directly to textarea
            const wrapperDiv = container.querySelector("div");
            if (wrapperDiv) {
                wrapperDiv.setAttribute("tabindex", "-1");
            }
            
            // Ensure textarea is focusable - remove any tabindex that might prevent tab navigation
            if (this._textareaElement.hasAttribute("tabindex") && this._textareaElement.getAttribute("tabindex") === "-1") {
                this._textareaElement.removeAttribute("tabindex");
            }
            // Ensure textarea is explicitly in tab order
            this._textareaElement.removeAttribute("tabindex"); // Remove any existing tabindex
            // Native textareas are focusable by default - no tabindex needed

            // Handle Tab key to prevent widget wrapper from interfering
            this._textareaElement.addEventListener("keydown", (e) => {
                if (e.key === "Tab") {
                    // Allow Tab to work normally - don't prevent default
                    // This ensures tab navigation works properly
                    e.stopPropagation(); // Prevent widget wrapper from handling it
                }
            });

            // Listen to input events (fires on every keystroke)
            this._textareaElement.addEventListener("input", (e) => {
                const value = e.target.value;
                // Update property (qooxdoo will skip apply if value hasn't changed)
                this.setValue(value);
                this.fireDataEvent("input", value);
            });

            // Listen to change events (fires on blur if value changed)
            this._textareaElement.addEventListener("change", (e) => {
                const value = e.target.value;
                // Update property (qooxdoo will skip apply if value hasn't changed)
                this.setValue(value);
                this.fireDataEvent("changeValue", value);
            });
        },

        /**
         * Get the actual DOM textarea element
         * @return {Element|null} The textarea element or null if not available
         */
        _getTextAreaElement() {
            if (this._textareaElement) {
                return this._textareaElement;
            }

            if (this._html && this._html.getContentElement()) {
                const container = this._html.getContentElement().getDomElement();
                this._textareaElement = container ? container.querySelector("textarea") : null;
                return this._textareaElement;
            }

            return null;
        },

        /**
         * Apply value changes to the DOM textarea
         * @param {String} value - The new value
         * @param {Boolean} oldValue - The old value
         */
        _applyValue(value, oldValue) {
            const textarea = this._getTextAreaElement();
            if (textarea && textarea.value !== value) {
                textarea.value = value || "";
            }
        },

        /**
         * Apply placeholder changes to the DOM textarea
         * @param {String} placeholder - The new placeholder
         */
        _applyPlaceholder(placeholder) {
            const textarea = this._getTextAreaElement();
            if (textarea) {
                textarea.placeholder = placeholder || "";
            } else {
                // Element not ready yet, store for later
                this._initialPlaceholder = placeholder;
            }
        },

        /**
         * Apply wrap setting to the DOM textarea
         * @param {Boolean} wrap - Whether text should wrap
         */
        _applyWrap(wrap) {
            const textarea = this._getTextAreaElement();
            if (textarea) {
                textarea.wrap = wrap ? "soft" : "off";
            }
        },

        /**
         * Apply enabled state changes to the DOM textarea
         * @param {Boolean} enabled - Whether the field is enabled
         */
        _applyEnabled(enabled) {
            const textarea = this._getTextAreaElement();
            if (textarea) {
                textarea.disabled = !enabled;
            }
        },

        /**
         * Get the current value from the textarea field
         * @return {String} The current value
         */
        getValue() {
            const textarea = this._getTextAreaElement();
            return textarea ? textarea.value : this.getProperty("value") || "";
        },

        /**
         * Set focus on the textarea field
         */
        focus() {
            const textarea = this._getTextAreaElement();
            if (textarea) {
                textarea.focus();
            }
        },

        /**
         * Remove focus from the textarea field
         */
        blur() {
            const textarea = this._getTextAreaElement();
            if (textarea) {
                textarea.blur();
            }
        }
    }
});
