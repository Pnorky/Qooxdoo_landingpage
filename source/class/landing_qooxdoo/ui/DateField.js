qx.Class.define("landing_qooxdoo.ui.DateField", {
    extend: qx.ui.core.Widget,

    properties: {
        value: {
            check: "Date",
            nullable: true,
            init: null,
            apply: "_applyValue",
            event: "changeValue"
        },
        enabled: {
            refine: true
        }
    },

    events: {
        /** Fired when the date value changes */
        "changeValue": "qx.event.type.Data"
    },

    construct() {
        this.base(arguments);

        // Set a layout so children get measured and laid out
        this._setLayout(new qx.ui.layout.Canvas());

        // Generate unique ID for the component
        this._dateId = `date-${qx.core.Id.getInstance().toHashCode(this)}`;
        this._isOpen = false;
        this._currentMonth = new Date().getMonth();
        this._currentYear = new Date().getFullYear();

        // Create HTML with Basecoat input structure (similar to TextField)
        this._html = new qx.ui.embed.Html(`
      <div style="margin: 0; padding: 0; min-width: 0; display: flex; align-items: center; height: 100%; position: relative; width: 100%;">
        <input 
          type="text" 
          class="input" 
          id="${this._dateId}-trigger" 
          style="width: 100%; padding-right: calc(var(--spacing) * 8); cursor: text;"
          aria-haspopup="dialog" 
          aria-expanded="false" 
          aria-controls="${this._dateId}-calendar"
          placeholder="MM/DD/YYYY"
          maxlength="10"
        />
        <button 
          type="button" 
          id="${this._dateId}-icon-btn"
          style="position: absolute; right: calc(var(--spacing) * 1); top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.5); display: flex; align-items: center; pointer-events: auto; z-index: 1;"
          aria-label="Open calendar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
        </button>
        <div 
          id="${this._dateId}-popover" 
          data-basecoat-ignore="true"
          aria-hidden="true"
          style="display: none !important; visibility: hidden !important; position: absolute; top: 100%; left: 0; margin-top: 2px; z-index: 10001; width: auto !important; min-width: 0 !important; max-width: none !important; background-color: var(--popover); color: var(--popover-foreground); border-radius: calc(var(--radius) - 2px); border: 1px solid var(--border); box-shadow: var(--shadow-md);"
        >
          <div id="${this._dateId}-calendar" role="dialog" aria-label="Calendar" style="padding: calc(var(--spacing) * 0.75); box-sizing: border-box; width: 100% !important; min-width: 0 !important; max-width: 100% !important; pointer-events: auto !important;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--spacing) * 0.75);">
              <button type="button" id="${this._dateId}-prev-month" style="background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.5); display: flex; align-items: center; color: var(--foreground); pointer-events: auto; z-index: 10; position: relative;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
              </button>
              <div id="${this._dateId}-month-year" style="font-weight: 500; font-size: var(--text-sm);"></div>
              <button type="button" id="${this._dateId}-next-month" style="background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.5); display: flex; align-items: center; color: var(--foreground); pointer-events: auto; z-index: 10; position: relative;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: calc(var(--spacing) * 0.15); margin-bottom: calc(var(--spacing) * 0.4);">
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Sun</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Mon</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Tue</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Wed</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Thu</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Fri</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Sat</div>
            </div>
            <div id="${this._dateId}-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: calc(var(--spacing) * 0.15);"></div>
          </div>
        </div>
        <input type="hidden" name="${this._dateId}-value" value="" />
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
            const widgetElement = this.getContentElement();
            if (widgetElement) {
                widgetElement.setStyle("overflow", "visible");
                widgetElement.setStyle("z-index", "1");
                widgetElement.setStyle("min-width", "0");
            }

            // Ensure container respects widget width
            const container = this._getContainerElement();
            if (container) {
                container.style.minWidth = "0";
            }

            this._setupDatePickerEvents();
            this._renderCalendar();
            this._applyEnabled(this.getEnabled());
            const initialValue = this._value;
            if (initialValue) {
                this._applyValue(initialValue);
            }
            
            // Make widget content element delegate focus to input
            if (widgetElement) {
                const domElement = widgetElement.getDomElement();
                if (domElement) {
                    // When widget receives focus, delegate to input
                    domElement.addEventListener("focusin", (e) => {
                        const input = this._inputElement;
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
        _dateId: null,
        _inputElement: null,
        _iconButton: null,
        _popoverElement: null,
        _calendarElement: null,
        _isOpen: null,
        _currentMonth: null,
        _currentYear: null,
        _selectedDate: null,
        _popoverContainer: null,
        _updatePositionHandler: null,
        _clickHandler: null,
        _calendarClickHandler: null,

        /**
         * Setup event listeners for the date picker
         */
        _setupDatePickerEvents() {
            const container = this._getContainerElement();
            if (!container) return;

            this._inputElement = container.querySelector(`#${this._dateId}-trigger`);
            this._iconButton = container.querySelector(`#${this._dateId}-icon-btn`);
            this._popoverElement = container.querySelector(`#${this._dateId}-popover`);
            this._calendarElement = container.querySelector(`#${this._dateId}-calendar`);

            if (!this._inputElement || !this._popoverElement || !this._calendarElement) {
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

            // Input click - allow direct typing, don't open calendar
            // The calendar icon button will handle opening the calendar

            // Handle direct date input with strict formatting
            this._inputElement.addEventListener("input", (e) => {
                this._formatDateInput(e.target);
                this._handleDateInput(e.target.value);
            });

            // Prevent invalid characters (only digits and slashes)
            this._inputElement.addEventListener("keypress", (e) => {
                const char = String.fromCharCode(e.which || e.keyCode);
                // Allow digits, slashes, and control keys
                if (!/[0-9/]/.test(char) && !/[0-8]/.test(e.key) && 
                    e.key !== 'Backspace' && e.key !== 'Delete' && 
                    e.key !== 'Tab' && e.key !== 'ArrowLeft' && 
                    e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && 
                    e.key !== 'ArrowDown' && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                }
            });

            // Prevent paste of invalid content
            this._inputElement.addEventListener("paste", (e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                // Remove all non-digit characters except slashes
                const cleaned = pastedText.replace(/[^\d/]/g, '');
                // Format the cleaned input
                const formatted = this._formatDateString(cleaned);
                this._inputElement.value = formatted;
                this._handleDateInput(formatted);
            });

            // Icon button click to toggle calendar
            if (this._iconButton) {
                this._iconButton.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.getEnabled()) {
                        this._toggleCalendar();
                    }
                }, true);
            }

            // Previous/Next month buttons
            const prevBtn = container.querySelector(`#${this._dateId}-prev-month`);
            const nextBtn = container.querySelector(`#${this._dateId}-next-month`);
            if (prevBtn) {
                prevBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._changeMonth(-1);
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._changeMonth(1);
                });
            }

            // Click outside to close
            this._clickHandler = (e) => {
                if (!this._isOpen) return;

                const target = e.target;

                // Check if click is on navigation buttons - if so, don't close
                const prevBtn = this._popoverElement?.querySelector(`#${this._dateId}-prev-month`);
                const nextBtn = this._popoverElement?.querySelector(`#${this._dateId}-next-month`);
                if ((prevBtn && (prevBtn === target || prevBtn.contains(target))) ||
                    (nextBtn && (nextBtn === target || nextBtn.contains(target)))) {
                    return; // Let the button handler process it
                }

                const isInCalendar = this._calendarElement && this._calendarElement.contains(target);
                const isInInput = this._inputElement && this._inputElement.contains(target);
                const isInIcon = this._iconButton && this._iconButton.contains(target);

                if (!isInCalendar && !isInInput && !isInIcon) {
                    this._closeCalendar();
                }
            };
        },

        /**
         * Get the container DOM element
         */
        _getContainerElement() {
            if (this._html && this._html.getContentElement()) {
                return this._html.getContentElement().getDomElement();
            }
            return null;
        },

        /**
         * Update popover position (for scroll/resize)
         */
        _updatePopoverPosition() {
            if (!this._isOpen || !this._inputElement || !this._popoverElement) {
                return;
            }

            const buttonRect = this._inputElement.getBoundingClientRect();
            const top = buttonRect.bottom + window.scrollY + 2;
            const left = buttonRect.left + window.scrollX;
            const width = buttonRect.width;

            this._popoverElement.style.setProperty("top", `${top}px`, "important");
            this._popoverElement.style.setProperty("left", `${left}px`, "important");
            this._popoverElement.style.setProperty("width", `${width}px`, "important");

            // Make calendar match popover width
            if (this._popoverElement) {
                const calendarElement = this._popoverElement.querySelector(`#${this._dateId}-calendar`);
                if (calendarElement) {
                    calendarElement.style.setProperty("width", `${width}px`, "important");
                    calendarElement.style.setProperty("max-width", `${width}px`, "important");
                    calendarElement.style.setProperty("min-width", `${width}px`, "important");
                }
            }
        },

        /**
         * Toggle calendar open/closed
         */
        _toggleCalendar() {
            if (this._isOpen) {
                this._closeCalendar();
            } else {
                this._openCalendar();
            }
        },

        /**
         * Open the calendar
         */
        _openCalendar() {
            if (!this._popoverElement || !this._inputElement) {
                return;
            }
            
            // Ensure _popoverElement is a DOM element
            if (typeof this._popoverElement.querySelector !== 'function') {
                console.error('DateField: _popoverElement is not a valid DOM element');
                return;
            }

            this._isOpen = true;

            // Move popover to body to escape overflow constraints
            if (!this._popoverContainer) {
                this._popoverContainer = document.createElement("div");
                this._popoverContainer.className = "datefield-popover-container";
                this._popoverContainer.setAttribute("data-basecoat-ignore", "true");
                this._popoverContainer.style.position = "fixed";
                this._popoverContainer.style.pointerEvents = "none";
                this._popoverContainer.style.zIndex = "10000";
                this._popoverContainer.style.top = "0";
                this._popoverContainer.style.left = "0";
                document.body.appendChild(this._popoverContainer);
            }

            if (this._popoverElement.parentNode !== this._popoverContainer) {
                this._popoverContainer.appendChild(this._popoverElement);
            }
            this._popoverElement.style.pointerEvents = "auto";

            // Re-query calendar element after moving to body (in case reference is stale)
            if (this._popoverElement) {
                this._calendarElement = this._popoverElement.querySelector(`#${this._dateId}-calendar`);
            }

            // Use event delegation on the calendar element for navigation buttons
            if (this._calendarElement) {
                // Remove old listener if exists
                if (this._calendarClickHandler) {
                    this._calendarElement.removeEventListener("click", this._calendarClickHandler);
                }

                // Add new event delegation handler
                this._calendarClickHandler = (e) => {
                    let target = e.target;

                    // Traverse up to find the button if clicking on SVG or path
                    while (target && target !== this._calendarElement) {
                        if (target.id === `${this._dateId}-prev-month`) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            this._changeMonth(-1);
                            return false;
                        }
                        if (target.id === `${this._dateId}-next-month`) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            this._changeMonth(1);
                            return false;
                        }
                        target = target.parentElement;
                    }
                };

                this._calendarElement.addEventListener("click", this._calendarClickHandler, true);
            }

            // Remove aria-hidden
            this._popoverElement.removeAttribute("aria-hidden");

            // Position popover
            this._popoverElement.style.position = "fixed";
            this._popoverElement.style.zIndex = "10001";
            this._popoverElement.style.setProperty("transition", "none", "important");
            this._popoverElement.style.setProperty("transform", "none", "important");
            this._popoverElement.style.setProperty("scale", "1", "important");
            this._popoverElement.style.setProperty("opacity", "1", "important");

            this._popoverElement.style.setProperty("display", "none", "important");
            this._updatePopoverPosition();

            this._popoverElement.style.setProperty("display", "block", "important");
            this._popoverElement.style.setProperty("visibility", "visible", "important");
            this._inputElement.setAttribute("aria-expanded", "true");

            // Add scroll/resize listeners
            this._updatePositionHandler = this._updatePopoverPosition.bind(this);
            window.addEventListener("scroll", this._updatePositionHandler, true);
            window.addEventListener("resize", this._updatePositionHandler);

            // Add click outside listener
            if (this._clickHandler) {
                setTimeout(() => {
                    document.addEventListener("click", this._clickHandler, true);
                }, 0);
            }

            // Render calendar for current month
            this._renderCalendar();
        },

        /**
         * Close the calendar
         */
        _closeCalendar() {
            if (!this._popoverElement || !this._inputElement) {
                return;
            }

            this._isOpen = false;

            // Remove scroll/resize listeners
            if (this._updatePositionHandler) {
                window.removeEventListener("scroll", this._updatePositionHandler, true);
                window.removeEventListener("resize", this._updatePositionHandler);
                this._updatePositionHandler = null;
            }

            // Remove document click listener
            if (this._clickHandler) {
                document.removeEventListener("click", this._clickHandler, true);
                this._clickHandler = null;
            }

            // Remove calendar click handler
            if (this._calendarClickHandler && this._calendarElement) {
                this._calendarElement.removeEventListener("click", this._calendarClickHandler, true);
                this._calendarClickHandler = null;
            }

            this._popoverElement.setAttribute("aria-hidden", "true");
            this._popoverElement.style.setProperty("display", "none", "important");
            this._popoverElement.style.setProperty("visibility", "hidden", "important");
            this._inputElement.setAttribute("aria-expanded", "false");

            // Move popover back to original container
            const container = this._getContainerElement();
            if (container && this._popoverElement.parentNode === this._popoverContainer) {
                container.appendChild(this._popoverElement);
            }
        },

        /**
         * Change month
         */
        _changeMonth(delta) {
            this._currentMonth += delta;
            if (this._currentMonth < 0) {
                this._currentMonth = 11;
                this._currentYear--;
            } else if (this._currentMonth > 11) {
                this._currentMonth = 0;
                this._currentYear++;
            }
            this._renderCalendar();
        },

        /**
         * Render the calendar grid
         */
        _renderCalendar() {
            // Query from popover element to work both before and after moving to body
            // If popoverElement exists (after setup), use it; otherwise use container
            let searchRoot = null;
            if (this._popoverElement) {
                searchRoot = this._popoverElement;
            } else {
                const container = this._getContainerElement();
                if (container) {
                    searchRoot = container;
                }
            }

            if (!searchRoot) return;

            const daysContainer = searchRoot.querySelector(`#${this._dateId}-days`);
            const monthYearDisplay = searchRoot.querySelector(`#${this._dateId}-month-year`);

            if (!daysContainer || !monthYearDisplay) return;

            // Update month/year display
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            monthYearDisplay.textContent = `${monthNames[this._currentMonth]} ${this._currentYear}`;

            // Clear days container
            daysContainer.innerHTML = "";

            // Get first day of month and number of days
            const firstDay = new Date(this._currentYear, this._currentMonth, 1).getDay();
            const daysInMonth = new Date(this._currentYear, this._currentMonth + 1, 0).getDate();
            const today = new Date();
            const selectedDate = this._selectedDate;

            // Add empty cells for days before month starts
            for (let i = 0; i < firstDay; i++) {
                const cell = document.createElement("div");
                cell.style.padding = "calc(var(--spacing) * 0.25)";
                daysContainer.appendChild(cell);
            }

            // Add day cells
            for (let day = 1; day <= daysInMonth; day++) {
                const cell = document.createElement("button");
                cell.type = "button";
                cell.textContent = day;
                cell.style.cssText = `
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: calc(var(--radius) - 4px);
          font-size: var(--text-xs);
          transition: all 0.2s;
          padding: calc(var(--spacing) * 0.25);
          min-width: 0;
        `;

                const cellDate = new Date(this._currentYear, this._currentMonth, day);
                const isToday = cellDate.toDateString() === today.toDateString();
                const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();

                if (isSelected) {
                    cell.style.backgroundColor = "var(--primary)";
                    cell.style.color = "var(--primary-foreground)";
                } else if (isToday) {
                    cell.style.border = "1px solid var(--ring)";
                }

                cell.addEventListener("mouseenter", () => {
                    if (!isSelected) {
                        cell.style.backgroundColor = "var(--accent)";
                        cell.style.color = "var(--accent-foreground)";
                    }
                });

                cell.addEventListener("mouseleave", () => {
                    if (!isSelected) {
                        cell.style.backgroundColor = "transparent";
                        cell.style.color = "";
                        if (isToday) {
                            cell.style.border = "1px solid var(--ring)";
                        } else {
                            cell.style.border = "none";
                        }
                    }
                });

                cell.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._selectDate(cellDate);
                });

                daysContainer.appendChild(cell);
            }
        },

        /**
         * Select a date
         */
        _selectDate(date) {
            this._selectedDate = date;
            this.setValue(date);
            this._updateDisplay();
            this._closeCalendar();
        },

        /**
         * Update the display text
         */
        _updateDisplay() {
            if (!this._inputElement) return;

            if (this._selectedDate) {
                const month = String(this._selectedDate.getMonth() + 1).padStart(2, "0");
                const day = String(this._selectedDate.getDate()).padStart(2, "0");
                const year = this._selectedDate.getFullYear();
                this._inputElement.value = `${month}/${day}/${year}`;
            } else {
                this._inputElement.value = "";
            }
        },

        /**
         * Handle direct date input from user
         */
        _handleDateInput(value) {
            if (!value || value.trim() === "") {
                this._selectedDate = null;
                this.setValue(null);
                return;
            }

            // Parse MM/DD/YYYY format
            const date = this._parseDateInput(value);
            if (date && !isNaN(date.getTime())) {
                this._selectedDate = date;
                this.setValue(date);
                // Update calendar to show the entered month/year
                this._currentMonth = date.getMonth();
                this._currentYear = date.getFullYear();
                if (this._isOpen) {
                    this._renderCalendar();
                }
            }
        },

        /**
         * Format date string to MM/DD/YYYY format
         */
        _formatDateString(digits) {
            let formatted = '';
            if (digits.length > 0) {
                formatted = digits.substring(0, 2);
            }
            if (digits.length > 2) {
                formatted += '/' + digits.substring(2, 4);
            }
            if (digits.length > 4) {
                formatted += '/' + digits.substring(4, 8);
            }
            return formatted;
        },

        /**
         * Format date input as user types (strict MM/DD/YYYY)
         */
        _formatDateInput(input) {
            let value = input.value;
            const cursorPos = input.selectionStart;
            
            // Remove all non-digit characters
            let digits = value.replace(/[^\d]/g, '');
            
            // Limit to 8 digits (MMDDYYYY)
            if (digits.length > 8) {
                digits = digits.substring(0, 8);
            }
            
            // Format with slashes: MM/DD/YYYY
            const formatted = this._formatDateString(digits);
            
            // Validate month (01-12)
            if (digits.length >= 2) {
                const month = parseInt(digits.substring(0, 2), 10);
                if (month > 12) {
                    // Invalid month, keep only first digit
                    digits = digits.substring(0, 1);
                    const newFormatted = this._formatDateString(digits);
                    input.value = newFormatted;
                    setTimeout(() => {
                        input.setSelectionRange(newFormatted.length, newFormatted.length);
                    }, 0);
                    return;
                }
            }
            
            // Validate day (01-31) - basic check
            if (digits.length >= 4) {
                const day = parseInt(digits.substring(2, 4), 10);
                if (day > 31) {
                    // Invalid day, keep only first 3 digits
                    digits = digits.substring(0, 3);
                    const newFormatted = this._formatDateString(digits);
                    input.value = newFormatted;
                    setTimeout(() => {
                        input.setSelectionRange(newFormatted.length, newFormatted.length);
                    }, 0);
                    return;
                }
            }

            // Update value if changed
            if (input.value !== formatted) {
                input.value = formatted;
                // Adjust cursor position after formatting
                let newCursorPos = cursorPos;
                const oldLength = value.length;
                const newLength = formatted.length;
                
                // If a slash was added, move cursor forward
                if (newLength > oldLength) {
                    newCursorPos = cursorPos + (newLength - oldLength);
                } else if (newLength < oldLength) {
                    // If characters were removed, adjust cursor
                    newCursorPos = Math.max(0, cursorPos - (oldLength - newLength));
                }
                
                // Ensure cursor doesn't go beyond the formatted string
                newCursorPos = Math.min(newCursorPos, formatted.length);
                
                setTimeout(() => {
                    input.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
            }
        },

        /**
         * Parse MM/DD/YYYY string to Date object
         */
        _parseDateInput(value) {
            if (!value) return null;
            
            // Remove any non-digit characters except slashes
            const cleaned = value.replace(/[^\d/]/g, '');
            const parts = cleaned.split('/');
            
            if (parts.length !== 3) return null;
            
            const month = parseInt(parts[0], 10);
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            
            // Validate ranges
            if (isNaN(month) || month < 1 || month > 12) return null;
            if (isNaN(day) || day < 1 || day > 31) return null;
            if (isNaN(year) || year < 1900 || year > 2100) return null;
            
            // Create date and validate (handles invalid dates like Feb 30)
            const date = new Date(year, month - 1, day);
            if (date.getMonth() !== month - 1 || date.getDate() !== day || date.getFullYear() !== year) {
                return null; // Invalid date
            }
            
            return date;
        },

        /**
         * Convert Date object to YYYY-MM-DD string
         */
        _dateToString(date) {
            if (!date || !(date instanceof Date)) {
                return "";
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        },

        /**
         * Apply value changes
         */
        _applyValue(value, oldValue) {
            if (value && value instanceof Date) {
                this._selectedDate = value;
                this._currentMonth = value.getMonth();
                this._currentYear = value.getFullYear();
                this._updateDisplay();
                if (this._isOpen) {
                    this._renderCalendar();
                }
            } else {
                this._selectedDate = null;
                this._updateDisplay();
            }
        },

        /**
         * Apply enabled state
         */
        _applyEnabled(enabled) {
            if (this._inputElement) {
                this._inputElement.disabled = !enabled;
            }
            if (this._iconButton) {
                this._iconButton.disabled = !enabled;
                this._iconButton.style.pointerEvents = enabled ? "auto" : "none";
                this._iconButton.style.opacity = enabled ? "1" : "0.5";
            }
        },

        /**
         * Get the current value
         */
        getValue() {
            return this._selectedDate || this.getProperty("value") || null;
        },

        /**
         * Reset the date field value
         */
        resetValue() {
            this.setValue(null);
        },

        /**
         * Set focus on the date field
         */
        focus() {
            if (this._inputElement) {
                this._inputElement.focus();
            }
        },

        /**
         * Remove focus from the date field
         */
        blur() {
            if (this._inputElement) {
                this._inputElement.blur();
            }
            this._closeCalendar();
        },

        /**
         * Destructor
         */
        destruct() {
            this._closeCalendar();
            if (this._popoverContainer && this._popoverContainer.parentNode) {
                this._popoverContainer.parentNode.removeChild(this._popoverContainer);
            }
            this.base(arguments);
        }
    }
});
