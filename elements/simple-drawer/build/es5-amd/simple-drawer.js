define([
  "exports",
  "./node_modules/@polymer/polymer/polymer-element.js"
], function(_exports, _polymerElement) {
  "use strict";
  Object.defineProperty(_exports, "__esModule", { value: !0 });
  _exports.SimpleDrawer = void 0;
  function _templateObject_ddd21880f31011e88b2bf31f333d16d0() {
    var data = babelHelpers.taggedTemplateLiteral([
      "\n<style>:host {\n  display: block;\n}\n\n:host([hidden]) {\n  display: none;\n}\n</style>\n<slot></slot>"
    ]);
    _templateObject_ddd21880f31011e88b2bf31f333d16d0 = function _templateObject_ddd21880f31011e88b2bf31f333d16d0() {
      return data;
    };
    return data;
  }
  var SimpleDrawer = (function(_PolymerElement) {
    babelHelpers.inherits(SimpleDrawer, _PolymerElement);
    function SimpleDrawer() {
      babelHelpers.classCallCheck(this, SimpleDrawer);
      return babelHelpers.possibleConstructorReturn(
        this,
        babelHelpers.getPrototypeOf(SimpleDrawer).apply(this, arguments)
      );
    }
    babelHelpers.createClass(
      SimpleDrawer,
      [
        {
          key: "connectedCallback",
          value: function connectedCallback() {
            babelHelpers
              .get(
                babelHelpers.getPrototypeOf(SimpleDrawer.prototype),
                "connectedCallback",
                this
              )
              .call(this);
          }
        }
      ],
      [
        {
          key: "template",
          get: function get() {
            return (0, _polymerElement.html)(
              _templateObject_ddd21880f31011e88b2bf31f333d16d0()
            );
          }
        },
        {
          key: "properties",
          get: function get() {
            return {
              opened: {
                name: "opened",
                type: Boolean,
                value: !1,
                reflectToAttribute: !0,
                observer: "_openedChanged"
              },
              closeLabel: { name: "closeLabel", type: String, value: "Close" },
              closeIcon: { name: "closeIcon", type: String, value: "cancel" },
              invokedBy: { name: "invokedBy", type: Object }
            };
          }
        },
        {
          key: "tag",
          get: function get() {
            return "simple-drawer";
          }
        }
      ]
    );
    return SimpleDrawer;
  })(_polymerElement.PolymerElement);
  _exports.SimpleDrawer = SimpleDrawer;
  window.customElements.define(SimpleDrawer.tag, SimpleDrawer);
});
