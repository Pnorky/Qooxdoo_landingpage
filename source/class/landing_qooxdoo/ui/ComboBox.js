qx.Class.define("landing_qooxdoo.ui.ComboBox", {
  extend: qx.ui.core.Widget,

  properties: {
    value: {
      check: "String",
      init: "",
      apply: "_applyValue",
      event: "changeValue"
    },
    enabled: {
      refine: true
    }
  },

  events: {
    /** Fired when the selection changes */
    "changeValue": "qx.event.type.Data",
    /** Fired when the selection changes (alias for changeValue) */
    "changeSelection": "qx.event.type.Data"
  },

  construct() {
    this.base(arguments);

    // Set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // Store items internally
    this._items = [];
    this._itemMap = new Map(); // Maps option value to ListItem
    this._isOpen = false;
    this._selectedItem = null;

    // Generate unique ID for the component
    this._comboId = `select-${qx.core.Id.getInstance().toHashCode(this)}`;

    // Create HTML with Basecoat select structure
    this._html = new qx.ui.embed.Html(`
      <div class="select" id="${this._comboId}" style="position: relative; width: 100%; margin: 0; padding: 0; min-width: 0; flex-shrink: 1;">
        <button 
          type="button" 
          class="btn-outline" 
          id="${this._comboId}-trigger" 
          style="width: 100%; justify-content: space-between;"
          aria-haspopup="listbox" 
          aria-expanded="false" 
          aria-controls="${this._comboId}-listbox"
        >
          <span class="truncate" style="flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;"></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0; margin-left: 0.5rem; transition: transform 0.2s;">
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </button>
        <div 
          id="${this._comboId}-popover" 
          data-popover 
          aria-hidden="true"
          style="display: none !important; visibility: hidden !important; position: absolute; top: 100%; left: 0; margin-top: 2px; z-index: 10001; min-width: 100%;"
        >
          <div role="listbox" id="${this._comboId}-listbox" aria-orientation="vertical" aria-labelledby="${this._comboId}-trigger" style="max-height: 300px; overflow-y: auto;">
          </div>
        </div>
        <input type="hidden" name="${this._comboId}-value" value="" />
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
      // Ensure the widget doesn't clip overflow for the dropdown
      const widgetElement = this.getContentElement();
      if (widgetElement) {
        widgetElement.setStyle("overflow", "visible");
      }
      
      this._setupDropdownEvents();
      // Add any items that were added before the DOM was ready
      this._syncItemsToDOM();
      // Apply initial enabled state
      this._applyEnabled(this.getEnabled());
      // Apply initial value if set
      const initialValue = this._value || "";
      if (initialValue) {
        this._applyValue(initialValue);
      }
      
      // Make widget content element delegate focus to button
      if (widgetElement) {
        const domElement = widgetElement.getDomElement();
        if (domElement) {
          // When widget receives focus, delegate to button
          domElement.addEventListener("focusin", (e) => {
            const button = this._buttonElement;
            if (button && e.target === domElement) {
              button.focus();
            }
          });
        }
      }
    });
  },

  members: {
    _html: null,
    _comboId: null,
    _buttonElement: null,
    _popoverElement: null,
    _listboxElement: null,
    _valueSpan: null,
    _items: null,
    _itemMap: null,
    _isOpen: null,
    _selectedItem: null,
    _popoverContainer: null, // Container for popover when moved to body
    _updatePositionHandler: null, // Handler for position updates

    /**
     * Setup event listeners for the dropdown
     */
    _setupDropdownEvents() {
      const container = this._html.getContentElement().getDomElement();
      this._buttonElement = container.querySelector(`#${this._comboId}-trigger`);
      this._popoverElement = container.querySelector(`#${this._comboId}-popover`);
      this._listboxElement = container.querySelector(`#${this._comboId}-listbox`);
      this._valueSpan = container.querySelector(".truncate");
      
      if (!this._buttonElement || !this._popoverElement || !this._listboxElement || !this._valueSpan) {
        return;
      }

      // Exclude qooxdoo widget content element from tab order
      const widgetElement = this.getContentElement();
      if (widgetElement) {
        const domElement = widgetElement.getDomElement();
        if (domElement) {
          domElement.setAttribute("tabindex", "-1");
        }
      }
      
      // Exclude wrapper div from tab order so tabbing goes directly to button
      const wrapperDiv = container.querySelector("div.select");
      if (wrapperDiv) {
        wrapperDiv.setAttribute("tabindex", "-1");
      }
      
      // Ensure button is focusable - remove any tabindex that might prevent tab navigation
      if (this._buttonElement.hasAttribute("tabindex") && this._buttonElement.getAttribute("tabindex") === "-1") {
        this._buttonElement.removeAttribute("tabindex");
      }
      // Ensure button is explicitly in tab order
      this._buttonElement.removeAttribute("tabindex"); // Remove any existing tabindex
      // Native buttons are focusable by default - no tabindex needed

      // Toggle dropdown on button click
      this._buttonElement.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.getEnabled()) {
          this._toggleDropdown();
        }
      }, true); // Use capture phase to ensure it fires

      // Close dropdown when clicking outside
      const clickHandler = (e) => {
        if (this._isOpen && !container.contains(e.target)) {
          this._closeDropdown();
        }
      };
      document.addEventListener("click", clickHandler);
      this._clickHandler = clickHandler;

      // Handle keyboard navigation on button
      this._buttonElement.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          // Allow Tab to work normally - don't prevent default
          // This ensures tab navigation works properly
          e.stopPropagation(); // Prevent widget wrapper from handling it
          return; // Don't process Tab as a dropdown toggle
        } else if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          if (!this._isOpen) {
            this._openDropdown();
          }
        } else if (e.key === "Escape" && this._isOpen) {
          e.preventDefault();
          this._closeDropdown();
        }
      });

      // Handle option selection and keyboard navigation in listbox
      this._listboxElement.addEventListener("click", (e) => {
        const option = e.target.closest("[role='option']");
        if (option) {
          const value = option.getAttribute("data-value");
          this._selectValue(value);
          this._closeDropdown();
        }
      });

      this._listboxElement.addEventListener("keydown", (e) => {
        const options = Array.from(this._listboxElement.querySelectorAll("[role='option']"));
        const currentIndex = options.findIndex(opt => opt === document.activeElement);
        
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          options[nextIndex].focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          options[prevIndex].focus();
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const option = document.activeElement;
          if (option && option.getAttribute("role") === "option") {
            const value = option.getAttribute("data-value");
            this._selectValue(value);
            this._closeDropdown();
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          this._closeDropdown();
          this._buttonElement.focus();
        }
      });
    },

    /**
     * Get the container element
     * @return {Element|null} The container element or null if not available
     */
    _getContainerElement() {
      if (this._html && this._html.getContentElement()) {
        return this._html.getContentElement().getDomElement();
      }
      return null;
    },

    /**
     * Toggle dropdown open/closed
     */
    _toggleDropdown() {
      if (this._isOpen) {
        this._closeDropdown();
      } else {
        this._openDropdown();
      }
    },

    /**
     * Update popover position (for scroll/resize)
     */
    _updatePopoverPosition() {
      if (!this._isOpen || !this._buttonElement || !this._popoverElement) {
        return;
      }
      
      const buttonRect = this._buttonElement.getBoundingClientRect();
      const top = buttonRect.bottom + window.scrollY + 2;
      const left = buttonRect.left + window.scrollX;
      const minW = buttonRect.width;
      const maxW = Math.min(480, Math.max(200, window.innerWidth - 40));

      // Set position immediately without transitions
      this._popoverElement.style.setProperty("top", `${top}px`, "important");
      this._popoverElement.style.setProperty("left", `${left}px`, "important");
      this._popoverElement.style.setProperty("min-width", `${minW}px`, "important");
      this._popoverElement.style.setProperty("width", "max-content", "important");
      this._popoverElement.style.setProperty("max-width", `${maxW}px`, "important");
    },

    /**
     * Open the dropdown
     */
    _openDropdown() {
      if (!this._popoverElement || !this._buttonElement) {
        return;
      }

      this._isOpen = true;
      
      // Get button position before moving popover
      const buttonRect = this._buttonElement.getBoundingClientRect();
      
      // Check if we're inside a dialog - native <dialog> elements create a stacking context
      // The dialog backdrop (::backdrop) has a very high z-index, so we need to append
      // the popover to the dialog element itself to be in the same stacking context
      let dialogElement = this._buttonElement.closest("dialog");
      let targetContainer = document.body;
      
      if (dialogElement) {
        // We're inside a dialog - append to the dialog element itself
        // This ensures the popover is in the same stacking context as the dialog
        targetContainer = dialogElement;
      }
      
      // Move popover to body/dialog to escape overflow constraints
      if (!this._popoverContainer) {
        this._popoverContainer = document.createElement("div");
        this._popoverContainer.className = "select"; // Maintain select context for Basecoat CSS
        this._popoverContainer.style.position = "fixed";
        this._popoverContainer.style.pointerEvents = "none";
        // Use very high z-index - dialog backdrop uses max int32, so we use max-1
        // When inside dialog, this will be relative to dialog's stacking context
        this._popoverContainer.style.zIndex = "2147483646";
        this._popoverContainer.style.top = "0";
        this._popoverContainer.style.left = "0";
        targetContainer.appendChild(this._popoverContainer);
      } else {
        // If container exists but is in wrong place, move it
        if (this._popoverContainer.parentNode !== targetContainer) {
          targetContainer.appendChild(this._popoverContainer);
        }
      }
      
      // Move popover to container
      if (this._popoverElement.parentNode !== this._popoverContainer) {
        this._popoverContainer.appendChild(this._popoverElement);
      }
      this._popoverElement.style.pointerEvents = "auto";
      
      // Remove aria-hidden attribute entirely (Basecoat checks for its presence)
      this._popoverElement.removeAttribute("aria-hidden");
      
      // Position popover using fixed positioning relative to viewport
      this._popoverElement.style.position = "fixed";
      // Use very high z-index - when inside dialog, this is relative to dialog's stacking context
      // When not in dialog, this ensures it's above most other elements
      this._popoverElement.style.zIndex = "2147483647";
      
      // Disable all transitions and transforms to prevent swooping animation
      this._popoverElement.style.setProperty("transition", "none", "important");
      this._popoverElement.style.setProperty("transform", "none", "important");
      this._popoverElement.style.setProperty("scale", "1", "important");
      this._popoverElement.style.setProperty("opacity", "1", "important");
      this._popoverElement.style.setProperty("translate", "none", "important");
      
      // Position immediately while still hidden to prevent animation
      this._popoverElement.style.setProperty("display", "none", "important");
      this._updatePopoverPosition();
      
      // Now show it - Basecoat will handle styling via CSS
      this._popoverElement.style.setProperty("display", "block", "important");
      this._popoverElement.style.setProperty("visibility", "visible", "important");
      this._buttonElement.setAttribute("aria-expanded", "true");
      
      // Add scroll/resize listeners to update position
      this._updatePositionHandler = this._updatePopoverPosition.bind(this);
      window.addEventListener("scroll", this._updatePositionHandler, true);
      window.addEventListener("resize", this._updatePositionHandler);
      
      // Rotate chevron icon
      const svg = this._buttonElement.querySelector("svg");
      if (svg) {
        svg.style.transform = "rotate(180deg)";
      }

      // Focus first option if available
      const firstOption = this._listboxElement.querySelector("[role='option']");
      if (firstOption) {
        setTimeout(() => firstOption.focus(), 0);
      }
    },

    /**
     * Close the dropdown
     */
    _closeDropdown() {
      if (!this._popoverElement || !this._buttonElement) {
        return;
      }

      this._isOpen = false;
      
      // Remove scroll/resize listeners
      if (this._updatePositionHandler) {
        window.removeEventListener("scroll", this._updatePositionHandler, true);
        window.removeEventListener("resize", this._updatePositionHandler);
        this._updatePositionHandler = null;
      }
      
      // Hide popover
      this._popoverElement.style.setProperty("display", "none", "important");
      this._popoverElement.style.setProperty("visibility", "hidden", "important");
      this._popoverElement.setAttribute("aria-hidden", "true");
      this._buttonElement.setAttribute("aria-expanded", "false");
      
      // Move popover back to original container
      const container = this._getContainerElement();
      if (container && this._popoverElement.parentNode !== container) {
        container.appendChild(this._popoverElement);
      }
      
      // Reset positioning
      this._popoverElement.style.position = "absolute";
      this._popoverElement.style.top = "100%";
      this._popoverElement.style.left = "0";
      
      // Reset chevron icon
      const svg = this._buttonElement.querySelector("svg");
      if (svg) {
        svg.style.transform = "rotate(0deg)";
      }
    },

    /**
     * Select a value
     * @param {String} value - The value to select
     */
    _selectValue(value) {
      const item = this._itemMap.get(value);
      if (item) {
        this._selectedItem = item;
        this.setValue(value);
        this.fireDataEvent("changeValue", value);
        this.fireDataEvent("changeSelection", value);
      }
    },

    /**
     * Sync stored items to the DOM listbox
     */
    _syncItemsToDOM() {
      if (!this._listboxElement) {
        return;
      }

      // Clear existing options
      this._listboxElement.innerHTML = "";

      // Add all stored items with proper Basecoat styling
      this._items.forEach(item => {
        const option = document.createElement("div");
        option.setAttribute("role", "option");
        option.setAttribute("data-value", item._value);
        option.setAttribute("tabindex", "0");
        option.textContent = item._label;
        
        // Basecoat CSS will handle all styling - no inline styles needed
        // The options will get proper padding, hover effects, etc. from Basecoat
        this._listboxElement.appendChild(option);
      });

      // Update selected state
      this._updateSelectedDisplay();
    },

    /**
     * Update the button display to show selected value
     */
    _updateSelectedDisplay() {
      if (!this._valueSpan) {
        return;
      }

      if (this._selectedItem) {
        this._valueSpan.textContent = this._selectedItem._label;
      } else {
        this._valueSpan.textContent = "";
      }

      // Update selected state in options
      if (this._listboxElement) {
        const options = this._listboxElement.querySelectorAll("[role='option']");
        options.forEach(option => {
          const value = option.getAttribute("data-value");
          if (this._selectedItem && value === this._selectedItem._value) {
            option.setAttribute("aria-selected", "true");
          } else {
            option.removeAttribute("aria-selected");
          }
        });
      }
    },

    /**
     * Add an item to the combo box
     * @param {qx.ui.form.ListItem|String} item - The item to add (ListItem or string)
     */
    add(item) {
      let label, value;
      
      // Handle both ListItem objects and plain strings
      if (item && typeof item.getLabel === "function") {
        // It's a ListItem-like object
        label = item.getLabel();
        value = item.getValue ? item.getValue() : label;
      } else if (typeof item === "string") {
        // It's a plain string
        label = item;
        value = item;
      } else {
        // Invalid item type
        return;
      }

      // Create a simple object to represent the item
      const listItem = {
        getLabel: () => label,
        getValue: () => value,
        _label: label,
        _value: value
      };

      this._items.push(listItem);
      this._itemMap.set(value, listItem);

      // Update DOM if element is ready
      if (this._listboxElement) {
        const option = document.createElement("div");
        option.setAttribute("role", "option");
        option.setAttribute("data-value", value);
        option.setAttribute("tabindex", "0");
        option.textContent = label;
        
        // Basecoat will handle hover styling via CSS
        this._listboxElement.appendChild(option);
      }
    },

    /**
     * Get the current selection
     * @return {Array} Array of selected ListItem-like objects
     */
    getSelection() {
      return this._selectedItem ? [this._selectedItem] : [];
    },

    /**
     * Reset the selection (clear it)
     */
    resetSelection() {
      this._selectedItem = null;
      this.setValue("");
      this._updateSelectedDisplay();
    },

    /**
     * Apply value changes to the DOM
     * @param {String} value - The new value
     * @param {String} oldValue - The old value
     */
    _applyValue(value, oldValue) {
      if (value) {
        const item = this._itemMap.get(value);
        if (item) {
          this._selectedItem = item;
        }
      } else {
        this._selectedItem = null;
      }
      this._updateSelectedDisplay();
    },

    /**
     * Apply enabled state changes to the DOM
     * @param {Boolean} enabled - Whether the field is enabled
     */
    _applyEnabled(enabled) {
      if (this._buttonElement) {
        this._buttonElement.disabled = !enabled;
        if (!enabled && this._isOpen) {
          this._closeDropdown();
        }
      }
    },

    /**
     * Get the current value from the combo box
     * @return {String} The current value
     */
    getValue() {
      return this._selectedItem ? this._selectedItem._value : (this._value || "");
    },

    /**
     * Set the value (select an option by label or value)
     * Compatible with qooxdoo's ComboBox which accepts label strings
     * @param {String} valueOrLabel - The value or label to select
     */
    setValue(valueOrLabel) {
      if (!valueOrLabel) {
        // Clear selection
        if (this._value !== "") {
          const oldValue = this._value;
          this._value = "";
          this._applyValue("", oldValue);
          this.fireDataEvent("changeValue", "", oldValue);
        }
        return;
      }

      // Try to find item by label first (qooxdoo compatibility), then by value
      let foundItem = null;
      let foundValue = null;

      // First, try to find by label (qooxdoo style)
      for (const item of this._items) {
        if (item._label === valueOrLabel) {
          foundItem = item;
          foundValue = item._value;
          break;
        }
      }

      // If not found by label, try by value
      if (!foundItem) {
        foundItem = this._itemMap.get(valueOrLabel);
        if (foundItem) {
          foundValue = foundItem._value;
        } else {
          // If still not found, use the string as-is (for backward compatibility)
          foundValue = valueOrLabel;
        }
      }

      // Set the property value directly and trigger apply
      if (this._value !== foundValue) {
        const oldValue = this._value;
        this._value = foundValue;
        this._applyValue(foundValue, oldValue);
        this.fireDataEvent("changeValue", foundValue, oldValue);
      }
    },

    /**
     * Set focus on the combo box button
     */
    focus() {
      if (this._buttonElement) {
        this._buttonElement.focus();
      }
    },

    /**
     * Remove focus from the combo box
     */
    blur() {
      if (this._buttonElement) {
        this._buttonElement.blur();
      }
      this._closeDropdown();
    },
    
    /**
     * Cleanup when widget is disposed
     */
    destruct() {
      // Close dropdown if open
      if (this._isOpen) {
        this._closeDropdown();
      }
      
      // Remove click handler
      if (this._clickHandler) {
        document.removeEventListener("click", this._clickHandler);
        this._clickHandler = null;
      }
      
      // Remove position update handler
      if (this._updatePositionHandler) {
        window.removeEventListener("scroll", this._updatePositionHandler, true);
        window.removeEventListener("resize", this._updatePositionHandler);
        this._updatePositionHandler = null;
      }
      
      // Clean up popover container
      if (this._popoverContainer && this._popoverContainer.parentNode) {
        this._popoverContainer.parentNode.removeChild(this._popoverContainer);
        this._popoverContainer = null;
      }
      
      this.base(arguments);
    }
  }
});
