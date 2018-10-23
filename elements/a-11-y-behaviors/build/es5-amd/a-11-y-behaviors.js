define([
  "exports",
  "./node_modules/@polymer/polymer/polymer-element.js",
  "./node_modules/@lrnwebcomponents/hax-body-behaviors/lib/HAXWiring.js"
], function(_exports, _polymerElement, _HAXWiring) {
  "use strict";
  Object.defineProperty(_exports, "__esModule", { value: !0 });
  _exports.A11YBehaviors = void 0;
  function _templateObject_e7e7d8f0d6eb11e88e4fc5ff07b8d8f9() {
    var data = babelHelpers.taggedTemplateLiteral([
      "\n<style>:host {\n  display: block;\n}\n\n:host([hidden]) {\n  display: none;\n}\n</style>\n<slot></slot>"
    ]);
    _templateObject_e7e7d8f0d6eb11e88e4fc5ff07b8d8f9 = function() {
      return data;
    };
    return data;
  }
  var A11YBehaviors = (function(_PolymerElement) {
    babelHelpers.inherits(A11YBehaviors, _PolymerElement);
    function A11YBehaviors() {
      babelHelpers.classCallCheck(this, A11YBehaviors);
      return babelHelpers.possibleConstructorReturn(
        this,
        (A11YBehaviors.__proto__ || Object.getPrototypeOf(A11YBehaviors)).apply(
          this,
          arguments
        )
      );
    }
    babelHelpers.createClass(
      A11YBehaviors,
      [
        {
          key: "connectedCallback",
          value: function connectedCallback() {
            babelHelpers
              .get(
                A11YBehaviors.prototype.__proto__ ||
                  Object.getPrototypeOf(A11YBehaviors.prototype),
                "connectedCallback",
                this
              )
              .call(this);
            this.HAXWiring = new _HAXWiring.HAXWiring();
            this.HAXWiring.setHaxProperties(
              A11YBehaviors.haxProperties,
              A11YBehaviors.tag,
              this
            );
          }
        }
      ],
      [
        {
          key: "template",
          get: function get() {
            return (0, _polymerElement.html)(
              _templateObject_e7e7d8f0d6eb11e88e4fc5ff07b8d8f9()
            );
          }
        },
        {
          key: "haxProperties",
          get: function get() {
            return {
              canScale: !0,
              canPosition: !0,
              canEditSource: !1,
              gizmo: {
                title: "A 11-y-behaviors",
                description: "Automated conversion of a11y-behaviors/",
                icon: "icons:android",
                color: "green",
                groups: ["11"],
                handles: [{ type: "todo:read-the-docs-for-usage" }],
                meta: {
                  author: "btopro",
                  owner: "The Pennsylvania State University"
                }
              },
              settings: { quick: [], configure: [], advanced: [] }
            };
          }
        },
        {
          key: "properties",
          get: function get() {
            return {};
          }
        },
        {
          key: "tag",
          get: function get() {
            return "a-11-y-behaviors";
          }
        }
      ]
    );
    return A11YBehaviors;
  })(_polymerElement.PolymerElement);
  _exports.A11YBehaviors = A11YBehaviors;
  window.customElements.define(A11YBehaviors.tag, A11YBehaviors);
});
