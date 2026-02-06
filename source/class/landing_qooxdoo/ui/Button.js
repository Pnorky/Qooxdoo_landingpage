qx.Class.define("landing_qooxdoo.ui.Button", {
  extend: qx.ui.core.Widget,

  events: {
    "execute": "qx.event.type.Event"
  },

  construct(label, variant = "", size = "") {
    this.base(arguments);

    // set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // generate Basecoat classes
    let classes = ["btn"];
    if (variant) classes.push(`btn-${variant}`);
    if (size) classes.push(`btn-${size}`);

    // embed HTML
    // Use min-width: 0 to allow flex items to shrink below their content size
    // Add text overflow handling for long button text
    this._html = new qx.ui.embed.Html(`
      <div style="margin: 2px; min-width: 0; flex-shrink: 1;">
        <button class="${classes.join(" ")}" style="width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; min-width: 0;">${label}</button>
      </div>
    `);

    // add child with layout properties
    this._add(this._html, { edge: 0 });

    // hook DOM click
    this._html.addListenerOnce("appear", () => {
      const btn = this._html.getContentElement().getDomElement().querySelector("button");
      btn.addEventListener("click", () => this.fireEvent("execute"));
    });
  }
});