/**
 * Copyright 2018 The Pennsylvania State University
 * @license Apache-2.0, see License.md for full text.
 */
import { html, Polymer } from "@polymer/polymer/polymer-legacy.js";
import * as async from "@polymer/polymer/lib/utils/async.js";
import { store } from "@lrnwebcomponents/haxcms-elements/lib/core/haxcms-site-store.js";
import { autorun, toJS } from "mobx";
import { HAXWiring } from "@lrnwebcomponents/hax-body-behaviors/lib/HAXWiring.js";
import "@polymer/paper-fab/paper-fab.js";
import "@polymer/paper-tooltip/paper-tooltip.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/iron-ajax/iron-ajax.js";
import "@polymer/iron-icons/editor-icons.js";
import "@lrnwebcomponents/jwt-login/jwt-login.js";
import "@lrnwebcomponents/h-a-x/h-a-x.js";
import "@lrnwebcomponents/simple-toast/simple-toast.js";
import "@lrnwebcomponents/simple-modal/simple-modal.js";
import "@lrnwebcomponents/hax-body/lib/hax-schema-form.js";
/**
 * `haxcms-site-editor`
 * `haxcms editor element that provides all editing capabilities`
 *
 * @demo demo/index.html
 */
Polymer({
  is: "haxcms-site-editor",
  _template: html`
    <style>
      :host {
        display: block;
      }
      #editbutton {
        position: fixed;
        bottom: 0;
        right: 0;
        margin: 16px;
        padding: 2px;
        width: 40px;
        height: 40px;
        visibility: visible;
        opacity: 1;
        transition: all 0.4s ease;
        z-index: 1000;
      }
      #outlinebutton {
        position: fixed;
        bottom: 0;
        right: 46px;
        margin: 16px;
        padding: 2px;
        width: 40px;
        height: 40px;
        visibility: visible;
        opacity: 1;
        transition: all 0.4s ease;
        z-index: 1000;
      }
      :host([edit-mode]) #editbutton {
        width: 100%;
        z-index: 100;
        right: 0;
        bottom: 0;
        border-radius: 0;
        height: 80px;
        margin: 0;
        padding: 8px;
        background-color: var(--paper-blue-500) !important;
      }
      h-a-x {
        padding: 80px 40px;
        margin: auto;
        display: none;
      }
      :host([edit-mode]) h-a-x {
        display: block;
      }
    </style>
    <iron-ajax
      headers='{"Authorization": "Bearer [[jwt]]"}'
      id="nodeupdateajax"
      url="[[saveNodePath]]"
      method="[[method]]"
      body="[[updateNodeData]]"
      content-type="application/json"
      handle-as="json"
      on-response="_handleNodeResponse"
    ></iron-ajax>
    <iron-ajax
      headers='{"Authorization": "Bearer [[jwt]]"}'
      id="outlineupdateajax"
      url="[[saveOutlinePath]]"
      method="[[method]]"
      body="[[updateOutlineData]]"
      content-type="application/json"
      handle-as="json"
      on-response="_handleOutlineResponse"
    ></iron-ajax>
    <iron-ajax
      headers='{"Authorization": "Bearer [[jwt]]"}'
      id="getfieldsajax"
      url="[[getNodeFieldsPath]]"
      method="[[method]]"
      body="[[getFieldsData]]"
      content-type="application/json"
      handle-as="json"
      on-response="_handleGetFieldsResponse"
    ></iron-ajax>
    <iron-ajax
      headers='{"Authorization": "Bearer [[jwt]]"}'
      id="manifestupdateajax"
      url="[[saveManifestPath]]"
      method="[[method]]"
      body="[[updateManifestData]]"
      content-type="application/json"
      handle-as="json"
      on-response="_handleManifestResponse"
    ></iron-ajax>
    <iron-ajax
      headers='{"Authorization": "Bearer [[jwt]]"}'
      id="publishajax"
      loading="{{publishing}}"
      url="[[publishSitePath]]"
      method="[[method]]"
      body="[[publishSiteData]]"
      content-type="application/json"
      handle-as="json"
      on-response="_handlePublishResponse"
    ></iron-ajax>
    <iron-ajax
      headers='{"Authorization": "Bearer [[jwt]]"}'
      id="createajax"
      url="[[createNodePath]]"
      method="[[method]]"
      body="[[createData]]"
      content-type="application/json"
      handle-as="json"
      on-response="_handleCreateResponse"
      last-response="{{__createNodeResponse}}"
    ></iron-ajax>
    <iron-ajax
      headers='{"Authorization": "Bearer [[jwt]]"}'
      id="deleteajax"
      url="[[deleteNodePath]]"
      method="[[method]]"
      body="[[deleteData]]"
      content-type="application/json"
      handle-as="json"
      on-response="_handleDeleteResponse"
      last-response="{{__deleteNodeResponse}}"
    ></iron-ajax>
    <h-a-x app-store$="[[appStore]]"></h-a-x>
  `,
  properties: {
    /**
     * Allow method to be overridden, useful in local testing
     */
    method: {
      type: String,
      value: "POST"
    },
    /**
     * JSON Web token, it'll come from a global call if it's available
     */
    jwt: {
      type: String
    },
    /**
     * end point for saving nodes
     */
    saveNodePath: {
      type: String
    },
    /**
     * end point for create new nodes
     */
    createNodePath: {
      type: String
    },
    /**
     * end point for delete nodes
     */
    deleteNodePath: {
      type: String
    },
    /**
     * end point for saving manifest
     */
    saveManifestPath: {
      type: String
    },
    /**
     * end point for publishing to surge
     */
    publishSitePath: {
      type: String
    },
    /**
     * Publishing end point, this has CDN implications so show message
     */
    publishing: {
      type: Boolean,
      observer: "_publishingChanged"
    },
    /**
     * end point for saving outline
     */
    saveOutlinePath: {
      type: String
    },
    /**
     * appStore object from backend
     */
    appStore: {
      type: Object
    },
    /**
     * if the node is in an edit state or not
     */
    editMode: {
      type: Boolean,
      reflectToAttribute: true,
      value: false
    },
    /**
     * data as part of the POST to the backend
     */
    updateNodeData: {
      type: Object,
      value: {}
    },
    /**
     * delete node data
     */
    deleteData: {
      type: Object,
      value: {}
    },
    /**
     * create new node data
     */
    createData: {
      type: Object,
      value: {}
    },
    /**
     * create new node data
     */
    publishSiteData: {
      type: Object,
      value: {}
    },
    /**
     * data as part of the POST to the backend
     */
    updateManifestData: {
      type: Object,
      value: {}
    },
    /**
     * data as part of the POST to the backend
     */
    updateOutlineData: {
      type: Object,
      value: {}
    },
    /**
     * data as part of the POST to the backend
     */
    updateManifestData: {
      type: Object,
      value: {}
    },
    /**
     * data as part of the POST to the for field data
     */
    getFieldsData: {
      type: Object,
      value: {}
    },
    /**
     * Active item of the node being worked on, JSON outline schema item format
     */
    activeItem: {
      type: Object,
      notify: true,
      observer: "_activeItemChanged"
    },
    /**
     * Outline of items in json outline schema format
     */
    manifest: {
      type: Object,
      notify: true,
      observer: "_manifestChanged"
    },
    getNodeFieldsPath: {
      type: String
    },
    getFieldsToken: {
      type: String
    }
  },
  /**
   * Break the shadow root for this element (by design)
   */
  _attachDom(dom) {
    this.appendChild(dom);
  },
  /**
   * ready life cycle
   */
  ready: function() {
    window.SimpleToast.requestAvailability();
    window.SimpleModal.requestAvailability();
    window.addEventListener("hax-store-ready", this._storeReadyToGo.bind(this));
    window.addEventListener(
      "json-outline-schema-active-item-changed",
      this._newActiveItem.bind(this)
    );
    window.addEventListener(
      "json-outline-schema-active-body-changed",
      this._bodyChanged.bind(this)
    );
    window.addEventListener("haxcms-save-outline", this.saveOutline.bind(this));
    window.addEventListener("haxcms-save-node", this.saveNode.bind(this));
    window.addEventListener(
      "haxcms-save-node-details",
      this.saveNodeDetails.bind(this)
    );
    window.addEventListener(
      "haxcms-save-site-data",
      this.saveManifest.bind(this)
    );
    window.addEventListener(
      "haxcms-load-node-fields",
      this.loadNodeFields.bind(this)
    );
    window.addEventListener("haxcms-create-node", this.createNode.bind(this));
    window.addEventListener("haxcms-delete-node", this.deleteNode.bind(this));
    window.addEventListener("haxcms-publish-site", this.publishSite.bind(this));
    const evt = new CustomEvent("simple-toast-show", {
      bubbles: true,
      cancelable: true,
      detail: {
        text: "You are logged in, edit tools shown."
      }
    });
    window.dispatchEvent(evt);
  },
  /**
   * attached life cycle
   */
  attached: function() {
    this.__disposer = autorun(() => {
      this.manifest = toJS(store.manifest);
    });
    this.__disposer2 = autorun(() => {
      this.activeItem = toJS(store.activeItem);
    });
    async.microTask.run(() => {
      this.updateStyles();
      if (window.HaxStore.ready) {
        let detail = {
          detail: true
        };
        this._storeReadyToGo(detail);
      }
    });
  },
  /**
   * Detatched life cycle
   */
  detached: function() {
    this.__disposer();
    this.__disposer2();
    window.removeEventListener(
      "hax-store-ready",
      this._storeReadyToGo.bind(this)
    );
    window.removeEventListener(
      "haxcms-save-outline",
      this.saveOutline.bind(this)
    );
    window.removeEventListener("haxcms-save-node", this.saveNode.bind(this));
    window.removeEventListener(
      "haxcms-save-node-details",
      this.saveNodeDetails.bind(this)
    );
    window.removeEventListener(
      "haxcms-save-site-data",
      this.saveManifest.bind(this)
    );
    window.removeEventListener(
      "haxcms-publish-site",
      this.publishSite.bind(this)
    );
    window.removeEventListener(
      "json-outline-schema-active-item-changed",
      this._newActiveItem.bind(this)
    );
    window.removeEventListener(
      "json-outline-schema-active-body-changed",
      this._bodyChanged.bind(this)
    );
    window.removeEventListener(
      "haxcms-load-node-fields",
      this.loadNodeFields.bind(this)
    );
    window.removeEventListener(
      "haxcms-create-node",
      this.createNode.bind(this)
    );
    window.removeEventListener(
      "haxcms-delete-node",
      this.deleteNode.bind(this)
    );
  },
  /**
   * Load and display node fields
   */
  loadNodeFields: function(e) {
    this.__nodeFieldsInvoked = e.detail;
    // pass along the jwt for user "session" purposes
    this.set("getFieldsData.jwt", this.jwt);
    this.notifyPath("getFieldsData.jwt");
    this.set("getFieldsData.token", this.getFieldsToken);
    this.notifyPath("getFieldsData.token");
    this.set("getFieldsData.siteName", this.manifest.metadata.siteName);
    this.notifyPath("getFieldsData.siteName");
    this.set("getFieldsData.nodeId", this.activeItem.id);
    this.notifyPath("getFieldsData.nodeId");
    this.$.getfieldsajax.generateRequest();
  },
  /**
   * Handle getting fields response
   */
  _handleGetFieldsResponse: function(e) {
    // we get back HAXSchema from the server
    let wiring = new HAXWiring();
    this._haxSchema = wiring.prototypeHaxProperties();
    this._haxSchema.settings = e.detail.response.haxSchema;
    let values = e.detail.response.values;
    let c = document.createElement("hax-schema-form");
    // set a min width of 50 viewable
    c.style.minWidth = "50vw";
    for (var key in this._haxSchema.settings) {
      let schema = wiring.getHaxJSONSchema(key, this._haxSchema);
      for (var i in schema.properties) {
        if (values[i]) {
          schema.properties[i].value = values[i];
        }
      }
      c.set(key + "Schema", schema);
    }
    this.__fieldsForm = c;
    let b1 = document.createElement("paper-button");
    b1.raised = true;
    let icon = document.createElement("iron-icon");
    icon.icon = "icons:save";
    b1.appendChild(icon);
    b1.appendChild(document.createTextNode("Save fields"));
    b1.setAttribute("dialog-confirm", "dialog-confirm");
    b1.addEventListener("click", this._saveFieldsTap.bind(this));
    let b2 = document.createElement("paper-button");
    b2.appendChild(document.createTextNode("cancel"));
    b2.setAttribute("dialog-dismiss", "dialog-dismiss");
    let b = document.createElement("div");
    b.style.position = "absolute";
    b.style.bottom = 0;
    b.style.left = 0;
    b.style.right = 0;
    b.style.zIndex = 1000000;
    b.style.backgroundColor = "#ddd";
    b.appendChild(b1);
    b.appendChild(b2);
    const evt = new CustomEvent("simple-modal-show", {
      bubbles: true,
      cancelable: false,
      detail: {
        title: "Edit " + store.activeTitle + " fields",
        elements: { content: c, buttons: b },
        invokedBy: this.__nodeFieldsInvoked,
        clone: false
      }
    });
    window.dispatchEvent(evt);
  },
  /**
   * Save the fields as we get tapped
   */
  _saveFieldsTap: function(e) {
    let values = this.__fieldsForm.value;
    values.id = this.activeItem.id;
    // fire event with details for saving
    window.dispatchEvent(
      new CustomEvent("haxcms-save-node-details", {
        bubbles: true,
        cancelable: true,
        detail: values
      })
    );
    // fire event to close the modal
    window.dispatchEvent(
      new CustomEvent("simple-modal-hide", {
        bubbles: true,
        cancelable: true,
        detail: {}
      })
    );
  },
  /**
   * create node event
   */
  createNode: function(e) {
    if (e.detail.values) {
      this.set("createData", {});
      this.set("createData", e.detail.values);
      this.notifyPath("createData.*");
      this.set("createData.siteName", this.manifest.metadata.siteName);
      this.notifyPath("createData.siteName");
      this.set("createData.jwt", this.jwt);
      this.notifyPath("createData.jwt");
      this.$.createajax.generateRequest();
      const evt = new CustomEvent("simple-modal-hide", {
        bubbles: true,
        cancelable: true,
        detail: {}
      });
      window.dispatchEvent(evt);
    }
  },
  _handleCreateResponse: function(response) {
    const evt = new CustomEvent("simple-toast-show", {
      bubbles: true,
      cancelable: true,
      detail: {
        text: `Created ${this.__createNodeResponse.title}!`,
        duration: 3000
      }
    });
    window.dispatchEvent(evt);
    this.fire("haxcms-trigger-update", true);
  },
  /**
   * delete the node we just got
   */
  deleteNode: function(e) {
    this.set("deleteData", {});
    this.set("deleteData.nodeId", e.detail.item.id);
    this.notifyPath("deleteData.nodeId");
    this.set("deleteData.siteName", this.manifest.metadata.siteName);
    this.notifyPath("deleteData.siteName");
    this.set("deleteData.jwt", this.jwt);
    this.notifyPath("deleteData.jwt");
    this.$.deleteajax.generateRequest();
    const evt = new CustomEvent("simple-modal-hide", {
      bubbles: true,
      cancelable: true,
      detail: {}
    });
    window.dispatchEvent(evt);
  },
  /**
   * node deleted response
   */
  _handleDeleteResponse: function(response) {
    const evt = new CustomEvent("simple-toast-show", {
      bubbles: true,
      cancelable: true,
      detail: {
        text: `Deleted ${this.__deleteNodeResponse.title}`,
        duration: 3000
      }
    });
    this.dispatchEvent(evt);
    this.fire("haxcms-trigger-update", true);
  },
  /**
   * Establish certain global settings in HAX once it claims to be ready to go
   */
  _storeReadyToGo: function(event) {
    if (event.detail) {
      window.HaxStore.instance.connectionRewrites.appendJwt = "jwt";
      window.HaxStore.instance.haxPanel.align = "left";
      window.HaxStore.instance.haxPanel.hidePanelOps = true;
    }
  },
  /**
   * notice publishing callback changing state
   */
  _publishingChanged: function(newValue, oldValue) {
    if (newValue) {
      const evt = new CustomEvent("simple-toast-show", {
        bubbles: true,
        cancelable: true,
        detail: {
          text: "Publishing...",
          duration: 0
        }
      });
      window.dispatchEvent(evt);
    } else if (!newValue && oldValue) {
      const evt = new CustomEvent("simple-toast-show", {
        bubbles: true,
        cancelable: true,
        detail: {
          text: "Publishing...",
          duration: 3000
        }
      });
      window.dispatchEvent(evt);
    }
  },
  /**
   * react to manifest being changed
   */
  _manifestChanged: function(newValue) {
    if (this.activeItem && newValue.metadata) {
      // set upload manager to point to this location in a more dynamic fashion
      window.HaxStore.instance.connectionRewrites.appendUploadEndPoint =
        "siteName=" +
        newValue.metadata.siteName +
        "&nodeId=" +
        this.activeItem.id;
    }
  },
  /**
   * update the internal active item
   */
  _newActiveItem: function(e) {
    this.set("activeItem", e.detail);
    this.notifyPath("activeItem.*");
  },
  /**
   * active item changed
   */
  _activeItemChanged: function(newValue, oldValue) {
    if (newValue && this.manifest) {
      // set upload manager to point to this location in a more dynamic fashion
      window.HaxStore.instance.connectionRewrites.appendUploadEndPoint =
        "siteName=" +
        this.manifest.metadata.siteName +
        "&nodeId=" +
        newValue.id;
    }
  },
  /**
   * handle update responses for nodes and outlines
   */
  _handleNodeResponse: function(e) {
    // node response may include the item that got updated
    // it also may be a new path so let's ensure that's reflected
    if (
      typeof e.detail.location !== "undefined" &&
      this.activeItem.location !== e.detail.location
    ) {
      window.location(e.detail.location);
      window.history.pushState({}, null, e.detail.location);
      window.dispatchEvent(new PopStateEvent("popstate"));
      const active = this.manifest.items.find(i => {
        return i.id === e.detail.id;
      });
      this.activeItem = active;
      this.dispatchEvent(
        new CustomEvent("json-outline-schema-active-item-changed", {
          bubbles: true,
          cancelable: true,
          detail: active
        })
      );
    }
    const evt = new CustomEvent("simple-toast-show", {
      bubbles: true,
      cancelable: true,
      detail: {
        text: "Page saved!",
        duration: 4000
      }
    });
    window.dispatchEvent(evt);
    // updates the manifest
    this.fire("haxcms-trigger-update", true);
    // updates the node contents itself
    this.fire("haxcms-trigger-update-node", true);
  },
  _handleOutlineResponse: function(e) {
    // trigger a refresh of the data in node
    const evt = new CustomEvent("simple-toast-show", {
      bubbles: true,
      cancelable: true,
      detail: {
        text: "Outline saved!",
        duration: 3000
      }
    });
    window.dispatchEvent(evt);
    this.fire("haxcms-trigger-update", true);
  },
  _handleManifestResponse: function(e) {
    // trigger a refresh of the data in node
    const evt = new CustomEvent("simple-toast-show", {
      bubbles: true,
      cancelable: true,
      detail: {
        text: "Site details saved!",
        duration: 3000
      }
    });
    this.dispatchEvent(evt);
    this.fire("haxcms-trigger-update", true);
  },
  _handlePublishResponse: function(e) {
    let data = e.detail.response;
    // show the published response
    let content = document.createElement("span");
    content.innerHTML = `
    <a href="${data.url}" target="_blank">
      <paper-button raised style="color:yellow;text-transform: none;font-weight: bold;">
      ${data.label}
      </paper-button>
    </a>`;
    const evt = new CustomEvent("simple-toast-show", {
      bubbles: true,
      cancelable: true,
      detail: {
        text: data.response,
        duration: 5000,
        slot: content.cloneNode(true)
      }
    });
    window.dispatchEvent(evt);
  },
  /**
   * Save node event
   */
  saveNode: function(e) {
    this.set("updateNodeData", {});
    this.set("updateNodeData.siteName", this.manifest.metadata.siteName);
    this.notifyPath("updateNodeData.siteName");
    this.set(
      "updateNodeData.body",
      window.HaxStore.instance.activeHaxBody.haxToContent()
    );
    this.notifyPath("updateNodeData.body");
    this.set("updateNodeData.nodeId", this.activeItem.id);
    this.notifyPath("updateNodeData.nodeId");
    this.set("updateNodeData.jwt", this.jwt);
    this.notifyPath("updateNodeData.jwt");
    // send the request
    if (this.saveNodePath) {
      this.$.nodeupdateajax.generateRequest();
    }
  },
  /**
   * Save node event
   */
  saveNodeDetails: function(e) {
    this.set("updateNodeData", {});
    this.set("updateNodeData.siteName", this.manifest.metadata.siteName);
    this.notifyPath("updateNodeData.siteName");
    this.set("updateNodeData.nodeId", e.detail.id);
    this.notifyPath("updateNodeData.nodeId");
    this.set("updateNodeData.details", e.detail);
    this.notifyPath("updateNodeData.details");
    this.set("updateNodeData.jwt", this.jwt);
    this.notifyPath("updateNodeData.jwt");
    // send the request
    if (this.saveNodePath) {
      this.$.nodeupdateajax.generateRequest();
    }
  },
  /**
   * Save the outline based on an event firing.
   */
  saveOutline: function(e) {
    // now let's work on the outline
    this.set("updateOutlineData.siteName", this.manifest.metadata.siteName);
    this.notifyPath("updateOutlineData.siteName");
    this.set("updateOutlineData.items", e.detail);
    this.notifyPath("updateOutlineData.items");
    this.set("updateOutlineData.jwt", this.jwt);
    this.notifyPath("updateOutlineData.jwt");
    if (this.saveOutlinePath) {
      this.$.outlineupdateajax.generateRequest();
    }
  },
  /**
   * Save the outline based on an event firing.
   */
  saveManifest: function(e) {
    // now let's work on the outline
    this.set("updateManifestData.siteName", this.manifest.metadata.siteName);
    this.notifyPath("updateManifestData.siteName");
    this.set("updateManifestData.manifest", e.detail);
    this.notifyPath("updateManifestData.manifest");
    this.set("updateManifestData.jwt", this.jwt);
    this.notifyPath("updateManifestData.jwt");
    if (this.saveManifestPath) {
      this.$.manifestupdateajax.generateRequest();
    }
  },
  /**
   * Save the outline based on an event firing.
   */
  publishSite: function(e) {
    this.set("publishSiteData.siteName", this.manifest.metadata.siteName);
    this.notifyPath("publishSiteData.siteName");
    this.set("publishSiteData.jwt", this.jwt);
    this.notifyPath("publishSiteData.jwt");
    if (this.publishSitePath) {
      this.$.publishajax.generateRequest();
    }
  },
  /**
   * Notice body of content has changed and import into HAX
   */
  _bodyChanged: function(e) {
    window.HaxStore.instance.activeHaxBody.importContent(e.detail);
  }
});
