import { html, css } from "lit-element/lit-element.js";
import { SimpleColors } from "@lrnwebcomponents/simple-colors/simple-colors.js";
import "@polymer/paper-styles/paper-styles.js";
import "@polymer/iron-pages/iron-pages.js";
import { winEventsElement } from "@lrnwebcomponents/utils/utils.js";
/**
 * @deprecatedApply - required for @apply / invoking @apply css var convention
 */
import "@polymer/polymer/lib/elements/custom-style.js";
/**
 * `hax-manager`
 * @customElement hax-manager
 * `A LRN element for brokering the UI for api endpoints both in querying and uploading of new media to eventually bubble up an event for hax-body to have content inserted into it. This is a wiring closet of sorts to ensure we can talk to any backend that's returning a slew of widgets / media to insert.`
 * @microcopy - the mental model for this element
 * - hax-manager - the modal for selecting a app for getting something added to hax-body. This will bubble an event up to an app which will then invoke the haxInsert function on hax-body in order to get the selected item onto the body area for usage.
 * - hax-body - the body tag that's beening clicked / focused and built; our WYSIWYG replacement.
 * - hax-panel - a panel off to the side that has possible options. Clicking in this panel is most likely what invokes hax-manager to display though this is also managed by a higher app (lrnapp-book in initial development)
 * - app - an API end point for querying and returning possible items for insert. For example, if a youtube is a source then it'll be expected to return data that can be mapped in such a way that it can display a grid of videos. Hitting vimeo we'd expect the same thing; enough data to be able to assemble a grid of videos to select / work with.
 * - endpoints - much of hax-manager is about routing data to and from the current application to backends. So uploads need to go some place, this is managing the UI aspect of that transaction while expecting to be fed an endpoint to handle the backend aspect.
 */
class HaxManager extends winEventsElement(SimpleColors) {
  /**
   * LitElement life cycle - styles addition
   */
  static get styles() {
    return [
      ...super.styles,
      css`
        :host {
          display: block;
          color: var(--hax-color-text);
        }
        app-drawer:not(:defined),
        hax-preview:not(:defined),
        hax-app-browser:not(:defined),
        hax-gizmo-browser:not(:defined),
        iron-icon:not(:defined) {
          display: none;
        }
        #dialog {
          color: var(--hax-color-text);
          z-index: 10000;
          padding: 56px 0;
          margin-top: 56px;
          --app-drawer-width: 400px;
        }
        #closedialog {
          float: right;
          top: 124px;
          right: 0;
          position: absolute;
          padding: 8px;
          margin: 0;
          background-color: var(--hax-color-menu-heading-bg, #eeeeee);
          color: var(--hax-color-menu-heading-color, black);
          background-color: transparent;
          width: 40px;
          height: 40px;
          min-width: unset;
        }
        :host([active-page="0"]) #dialog {
          --app-drawer-width: 300px;
        }
        :host([active-page="1"]) #dialog {
          --app-drawer-width: 60%;
        }
        :host([active-page="2"]) #dialog {
          --app-drawer-width: 60%;
        }
        :host([active-step]) #dialog {
          --app-drawer-width: 60%;
        }
        :host([searching]) #dialog {
          --app-drawer-width: 60%;
        }
        @media screen and (max-width: 800px) {
          :host([active-page="0"]) #dialog {
            --app-drawer-width: 50%;
          }
          :host([active-page="1"]) #dialog,
          :host([active-page="2"]) #dialog,
          :host([active-step]) #dialog,
          :host([searching]) #dialog {
            --app-drawer-width: 80%;
          }
        }
        .title {
          position: relative;
          padding: 16px;
          outline: 0;
          font-weight: 600;
          text-align: left;
          margin: 0;
          background-color: var(--hax-color-menu-heading-bg);
          font-size: 18px;
          line-height: 18px;
          font-family: "Noto Serif", serif;
          color: var(--hax-color-menu-heading-color);
        }

        #preview {
          height: 100%;
        }
        vaadin-upload {
          --primary-color: var(--hax-color-accent1);
          --primary-font-color: #ffffff;
          --dark-primary-color: #ffffff;
          --light-primary-color: var(--hax-color-accent1);
          --error-color: darkred;
          color: #ffffff;
          display: block;
          padding: 16px !important;
        }
        vaadin-upload[dragover] {
          border-color: #396;
        }
        vaadin-upload-file {
          --disabled-text-color: #222222;
        }
        .add-area-content-wrapper {
          padding: 0 16px;
        }
        .add-url-area,
        .add-upload-area {
          margin: 16px 0;
        }
        .url-description {
          font-size: 18px;
          color: #000000;
          line-height: 22px;
          font-family: sans-serif;
          letter-spacing: 1px;
        }
        #steppages {
          height: 100%;
        }
        #newassetconfigure {
          width: 100%;
          margin: 0;
          padding: 16px;
          background-color: var(--hax-color-menu-heading-bg, #eeeeee);
          color: var(--hax-color-menu-heading-color, black);
        }
        paper-input {
          color: var(--hax-color-text);
        }
        @media screen and (max-width: 550px) {
          .hide-on-mobile {
            opacity: 0;
            visibility: hidden;
            position: absolute;
            left: -9999px;
          }
          .page-area.hax-manager {
            padding: 6px;
          }
        }
      `
    ];
  }
  /**
   * HTMLElement life cycle
   */
  constructor() {
    super();
    this.__winEvents = {
      "hax-store-property-updated": "_haxStorePropertyUpdated",
      "hax-app-picker-selection": "_haxAppPickerSelection",
      "place-holder-file-drop": "_placeHolderFileDrop"
    };
    this.opened = false;
    this.editExistingNode = false;
    this.addTitle = "Upload media";
    this.activeStep = 0;
    this.searching = false;
    this.activePage = 0;
    this.canSupportUploads = false;
    this.appList = [];
    this.__allowUpload = false;
    import("@lrnwebcomponents/hax-body/lib/hax-manager-deps.js");
  }
  /**
   * LitElement life cycle - styles addition
   */
  render() {
    return html`
      <custom-style>
        <style>
          @import url("https://fonts.googleapis.com/css?family=Noto+Serif");
          #dialog {
            --app-drawer-content-container: {
              background-color: #ffffff;
            }
          }
          vaadin-upload {
            --vaadin-upload-button-add-wrapper: {
              border: 2px solid #ffffff;
              background-color: var(--hax-color-accent1);
              color: #ffffff;
              display: block;
            }
            --vaadin-upload-buttons-primary: {
              display: block;
              width: 100%;
              flex: unset;
              -webkit-flex: unset;
            }
            --vaadin-upload-button-add: {
              color: #000000;
              display: block;
              flex: unset;
              -webkit-flex: unset;
              text-align: center;
            }
            --vaadin-upload-drop-label: {
              color: #ffffff;
              display: block;
              padding: 8px;
            }
            --vaadin-upload-drop-label-dragover: {
              color: #ffffff;
            }
            --vaadin-upload-file-list: {
              padding: 8px;
              margin: 0;
              color: #ffffff;
            }
            --vaadin-upload-file: {
              color: #ffffff;
            }
          }
        </style>
      </custom-style>
      <app-drawer
        id="dialog"
        .opened="${this.opened}"
        @opened-changed="${this.openedChanged}"
        disable-swipe=""
      >
        <div
          class="dialog-contents"
          id="dialogcontent"
          style="height: 100%; overflow: auto;"
        >
          <iron-pages
            id="steppages"
            .selected="${this.activeStep}"
            @selected-changed="${this.activeStepChanged}"
            fallback-selection="select"
            role="main"
          >
            <div data-value="select">
              <iron-pages
                id="activepage"
                @selected-changed="${this.activePageChanged}"
                .selected="${this.activePage}"
                fallback-selection="link"
              >
                <div class="page-area add-area">
                  <h3 class="title">
                    <iron-icon icon="icons:file-upload"></iron-icon> ${this
                      .addTitle}
                  </h3>
                  <div class="add-area-content-wrapper">
                    <div class="add-url-area">
                      <paper-input
                        id="url"
                        label="URL"
                        type="url"
                        auto-validate=""
                      ></paper-input>
                      <div class="url-description">
                        Add an existing resource / link
                      </div>
                    </div>
                    <div class="add-upload-area">
                      <vaadin-upload
                        @upload-before="${this._fileAboutToUpload}"
                        @upload-response="${this._fileUploadResponse}"
                        form-data-name="file-upload"
                        id="fileupload"
                        ?hidden="${!this.canSupportUploads}"
                      ></vaadin-upload>
                    </div>
                    <paper-button
                      @click="${this.newAssetConfigure}"
                      id="newassetconfigure"
                      raised=""
                      >Configure item</paper-button
                    >
                  </div>
                </div>
                <div class="page-area">
                  <hax-app-browser id="appbrowser">
                    <slot></slot>
                  </hax-app-browser>
                </div>
                <div class="page-area">
                  <hax-gizmo-browser id="gizmobrowser"></hax-gizmo-browser>
                </div>
              </iron-pages>
            </div>
            <div style="height:100%;">
              <hax-preview id="preview"></hax-preview>
            </div>
          </iron-pages>
          <paper-button
            id="closedialog"
            @click="${this.closeEvent}"
            ?hidden="${this.activeStep === 0 ? false : true}"
          >
            <iron-icon icon="icons:cancel" title="Close dialog"></iron-icon>
          </paper-button>
        </div>
      </app-drawer>
    `;
  }
  static get tag() {
    return "hax-manager";
  }

  static get properties() {
    return {
      /**
       * Track visibility status.
       */
      opened: {
        type: Boolean,
        reflect: true
      },
      /**
       * Title when open.
       */
      editExistingNode: {
        type: Boolean,
        attribute: "edit-existing-node"
      },
      /**
       * Title when open.
       */
      editTitle: {
        type: String,
        attribute: "edit-title"
      },
      /**
       * Active title
       */
      addTitle: {
        type: String,
        attribute: "add-title"
      },
      /**
       * Active step currently selected
       */
      activeStep: {
        type: Number,
        reflect: true,
        attribute: "active-step"
      },
      /**
       * Searching mode
       */
      searching: {
        type: Boolean,
        reflect: true
      },
      /**
       * Active page currently selected
       */
      activePage: {
        type: Number,
        reflect: true,
        attribute: "active-page"
      },
      /**
       * If this can support uploads or not based on presense of a backend
       * this property is synced down from the store
       */
      canSupportUploads: {
        type: Boolean,
        attribute: "can-support-uploads"
      },
      /**
       * Active element
       */
      activeHaxElement: {
        type: Object
      },
      /**
       * List of apps so they can be added
       */
      appList: {
        type: Array
      },
      /**
       * Helper so we can upload after prompting where to go.
       */
      __allowUpload: {
        type: Boolean
      }
    };
  }

  activePageChanged(e) {
    this.activePage = e.detail.value;
  }
  openedChanged(e) {
    this.opened = e.detail.value;
    if (this.opened) {
      import("@lrnwebcomponents/hax-body/lib/hax-manager-openeddeps.js");
    }
  }
  activeStepChanged(e) {
    this.activeStep = Number(e.detail.value);
  }
  /**
   * LitElement life cycle - ready state
   */
  firstUpdated(changedProperties) {
    if (super.firstUpdated) {
      super.firstUpdated(changedProperties);
    }
    this.dispatchEvent(
      new CustomEvent("hax-register-core-piece", {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: {
          piece: "haxManager",
          object: this
        }
      })
    );
  }
  /**
   * LitElement life cycle - properties changed
   */
  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName == "editExistingNode") {
        this.editTitle = this._computeEditTitle(this[propName]);
      }
      if (propName == "activeStep") {
        this._activeStepChanged(this[propName], oldValue);
      }
      if (propName == "activePage") {
        this._activePageChanged(this[propName], oldValue);
      }
      if (propName == "activeHaxElement" && this[propName] !== oldValue) {
        this._activeHaxElementChanged(this[propName], oldValue);
      }
      if (propName == "opened") {
        this._openedChanged(this[propName], oldValue);
      }
    });
  }

  /**
   * compute title for edit mode
   */
  _computeEditTitle(updateExisting) {
    if (typeof this.activeHaxElement !== typeof undefined && updateExisting) {
      return "Update";
    } else {
      return "Insert";
    }
  }

  /**
   * A file event was detected from a drag and drop in the interface, most likely
   * from a place-holder tag
   */
  _placeHolderFileDrop(e) {
    // reset the manager back to the first page
    this.resetManager();
    // trigger a self open request
    window.HaxStore.write("openDrawer", this, this);
    // reference the active place holder element since place holders are
    // the only things possible for seeing these
    window.HaxStore.instance.activePlaceHolder = e.detail.placeHolderElement;
    this.editExistingNode = true;
    // ! I can't believe this actually works. This takes the event
    // ! that was a drop event else where on the page and then repoints
    // ! it to simulate the drop event using the same event structure that
    // ! would have happened if they had used this element in the first place
    this.shadowRoot.querySelector("#fileupload")._onDrop(e.detail);
  }

  /**
   * Respond to uploading a file
   */
  _fileAboutToUpload(e) {
    if (!this.__allowUpload) {
      // cancel the event so we can jump in
      e.preventDefault();
      e.stopPropagation();
      // look for a match as to what gizmo types it supports
      let values = {
        source: e.detail.file.name,
        type: e.detail.file.type
      };
      // we have no clue what this is.. let's try and guess..
      var type = window.HaxStore.guessGizmoType(values);
      // find targets that support this type
      let targets = window.HaxStore.getHaxAppStoreTargets(type);
      // make sure we have targets
      if (targets.length === 1) {
        this._haxAppPickerSelection({ detail: targets[0] });
      } else if (targets.length !== 0) {
        window.HaxStore.instance.haxAppPicker.presentOptions(
          targets,
          type,
          "Where would you like to upload this " + type + "?",
          "app"
        );
      } else {
        window.HaxStore.toast(
          "Sorry, you don't have a storage location that can handle " +
            type +
            " uploads!",
          5000
        );
      }
    } else {
      this.__allowUpload = false;
    }
  }

  /**
   * Event for an app being selected from a picker
   * This happens when multiple upload targets support the given type
   */
  _haxAppPickerSelection(e) {
    // details for where to upload the file
    let connection = e.detail.connection;
    this.__appUsed = e.detail;
    this.shadowRoot.querySelector("#fileupload").method =
      connection.operations.add.method;
    let requestEndPoint = connection.protocol + "://" + connection.url;
    // ensure we build a url correctly
    if (requestEndPoint.substr(requestEndPoint.length - 1) != "/") {
      requestEndPoint += "/";
    }
    // support local end point modification
    if (typeof connection.operations.add.endPoint !== typeof undefined) {
      requestEndPoint += connection.operations.add.endPoint;
    }
    // support jwt hijacking
    if (
      window.HaxStore.instance.connectionRewrites.appendUploadEndPoint != null
    ) {
      requestEndPoint +=
        "?" + window.HaxStore.instance.connectionRewrites.appendUploadEndPoint;
    }
    if (window.HaxStore.instance.connectionRewrites.appendJwt != null) {
      requestEndPoint +=
        "&" +
        window.HaxStore.instance.connectionRewrites.appendJwt +
        "=" +
        localStorage.getItem(
          window.HaxStore.instance.connectionRewrites.appendJwt
        );
    }
    this.shadowRoot.querySelector("#fileupload").headers = connection.headers;
    this.shadowRoot.querySelector("#fileupload").target = requestEndPoint;
    // invoke file uploading...
    this.__allowUpload = true;
    this.shadowRoot.querySelector("#fileupload").uploadFiles();
  }

  /**
   * Respond to successful file upload, now inject url into url field and
   * do a gizmo guess from there!
   */
  _fileUploadResponse(e) {
    this.editExistingNode = true;
    // convert response to object
    let response = JSON.parse(e.detail.xhr.response);
    // access the app that did the upload
    let map = this.__appUsed.connection.operations.add.resultMap;
    let data = {};
    let item = {};
    // look for the items element to draw our data from at its root
    if (
      typeof this._resolveObjectPath(map.item, response) !== typeof undefined
    ) {
      data = this._resolveObjectPath(map.item, response);
    }
    item.type = map.defaultGizmoType;
    // pull in prop matches
    for (var prop in map.gizmo) {
      item[prop] = this._resolveObjectPath(map.gizmo[prop], data);
    }
    // another sanity check, if we don't have a url but have a source bind that too
    if (
      typeof item.url === typeof undefined &&
      typeof item.source !== typeof undefined
    ) {
      item.url = item.source;
    }
    // gizmo type is also supported in the mapping element itself
    // Think an asset management backend as opposed to a specific
    // type of asset like video. If the item coming across can
    // effectively check what kind of gizmo is required for it
    // to work then we need to support that asset declaring the
    // gizmo type needed
    if (typeof map.gizmo.type !== typeof undefined) {
      item.type = this._resolveObjectPath(map.gizmo.type, data);
    }
    this.shadowRoot.querySelector("#url").value = item.url;
    // @todo put in logic to support the response actually
    // just outright returning a haxElement. This is rare
    // but if the HAX developer has control over the endpoint
    // then they could get HAX to streamline some workflows
    // or by-pass the gizmo selection step to improve UX
    // for end users even further. Examples could be a media
    // management system that has remote rendering (cms-token)
    // or a highly specific endpoint that we know we can only
    // present in one way effectively Box / Google doc viewer.
    this.newAssetConfigure();
  }

  /**
   * Notice page changed.
   */
  _activePageChanged(newValue, oldValue) {
    // typecast later on to ensure we have the exact page value
    if (typeof newValue !== typeof undefined) {
      this.searching = false;
      if (
        Number(newValue) === 1 &&
        this.shadowRoot.querySelector("#appbrowser")
      ) {
        this.shadowRoot.querySelector("#appbrowser").resetBrowser();
      } else if (
        Number(newValue) === 2 &&
        this.shadowRoot.querySelector("#gizmobrowser")
      ) {
        this.shadowRoot.querySelector("#gizmobrowser").resetBrowser();
      }
    }
  }

  /**
   * Store updated, sync.
   */
  _haxStorePropertyUpdated(e) {
    if (
      e.detail &&
      typeof e.detail.value !== typeof undefined &&
      e.detail.property
    ) {
      this[e.detail.property] = e.detail.value;
    }
  }
  /**
   * Notice active element changed.
   */
  _activeHaxElementChanged(newValue, oldValue) {
    if (typeof oldValue !== typeof undefined) {
      this.shadowRoot.querySelector("#preview").advancedForm = false;
      if (newValue && typeof newValue.tag === typeof undefined) {
        this.resetManager(this.activePage);
        this.shadowRoot.querySelector("#preview").activeHaxElement = {};
      } else {
        // reset files so it doesn't bloat up
        this.shadowRoot.querySelector("#fileupload").set("files", []);
        this.shadowRoot.querySelector("#dialog").scrollTop = 0;
        this.selectStep("configure");
      }
    }
  }
  /**
   * Bubble up insert event.
   */
  insertHaxElement(e) {
    // bubble up the inject event / element to the body
    let previewNode = this.shadowRoot.querySelector("#preview").previewNode;
    previewNode.removeAttribute("hax-preview-mode");
    // trickery to get it into the DOM but the preview not disappear
    if (previewNode.getAttribute("data-hax-slot") != null) {
      previewNode.setAttribute(
        "slot",
        previewNode.getAttribute("data-hax-slot")
      );
      previewNode.removeAttribute("data-hax-slot");
    }
    let element = window.HaxStore.nodeToHaxElement(previewNode);
    element.replace = this.editExistingNode;
    if (typeof this.activeHaxElement.__type !== typeof undefined) {
      element.__type = this.activeHaxElement.__type;
    }
    element.replacement = previewNode;
    this.dispatchEvent(
      new CustomEvent("hax-insert-content", {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: element
      })
    );
    let toast = "New element added!";
    if (this.editExistingNode) {
      toast = "Element updated!";
    }
    window.HaxStore.toast(toast, 2000);
    // close window
    window.HaxStore.write("openDrawer", false, this);
  }
  /**
   * Reset things on the display to their defaults.
   */
  resetManager(activePage = 0) {
    this.selectStep("select");
    this.activePage = activePage;
    document.body.style.overflow = null;
    this.appList = [...window.HaxStore.instance.appList];
    this.searching = false;
    window.HaxStore.write("activeApp", null, this);
    this.editExistingNode = false;
    this.shadowRoot.querySelector("#url").value = "";
    this.shadowRoot.querySelector("#fileupload").headers = "";
    this.shadowRoot.querySelector("#fileupload").method = "";
    this.shadowRoot.querySelector("#fileupload").target = "";
    this.shadowRoot
      .querySelector("#preview")
      .shadowRoot.querySelector("#ppanel1").style.flex = "";
    this.shadowRoot
      .querySelector("#preview")
      .shadowRoot.querySelector("#ppanel2").style.flex = "";
    this.__allowUpload = false;
  }

  /**
   * Cancel interaction with the modal
   */
  closeEvent(e) {
    // reset and close dialog
    this.opened = false;
  }

  /**
   * Open state change.
   */
  _openedChanged(newValue, oldValue) {
    if (oldValue && !newValue) {
      document.body.style.overflow = null;
    } else if (newValue && !oldValue) {
      document.body.style.overflow = "hidden";
    }
    if (!newValue && window.HaxStore.instance.openDrawer === this) {
      window.HaxStore.write("openDrawer", false, this);
    }
  }

  /**
   * Respond to the modal closing
   */
  close(e) {
    if (
      typeof e === typeof undefined ||
      e.target === this.shadowRoot.querySelector("#dialog") ||
      e.target === this.shadowRoot.querySelector("#closedialog")
    ) {
      // reset the active element which will force this to reset the manager
      window.HaxStore.write("activeHaxElement", {}, this);
      this.opened = false;
      this.resetManager();
    }
  }

  /**
   * Open the dialog
   */
  open(e) {
    this.opened = true;
  }

  /**
   * Configure asset after upload or URL passed in.
   */
  newAssetConfigure() {
    let values = {
      source: this.shadowRoot.querySelector("#url").value
    };
    // we have no clue what this is.. let's try and guess..
    let type = window.HaxStore.guessGizmoType(values);
    let haxElements = window.HaxStore.guessGizmo(type, values);
    // see if we got anything
    if (haxElements.length > 0) {
      if (haxElements.length === 1) {
        if (typeof haxElements[0].tag !== typeof undefined) {
          window.HaxStore.write("activeHaxElement", haxElements[0], this);
        }
      } else {
        // hand off to hax-app-picker to deal with the rest of this
        window.HaxStore.instance.haxAppPicker.presentOptions(
          haxElements,
          type,
          "Pick how to present the " + type,
          "gizmo"
        );
      }
    } else {
      window.HaxStore.toast(
        "Sorry, HAX doesn't know how to handle that type of link yet."
      );
    }
  }

  /**
   * Set step to configure or insert
   */
  selectStep(step) {
    if (step == "configure") {
      this.activeStep = 1;
    } else {
      this.activeStep = 0;
    }
  }

  /**
   * Notice step changes
   */
  _activeStepChanged(newValue, oldValue) {
    if (newValue || !newValue) {
      window.dispatchEvent(new Event("resize"));
    }
  }

  /**
   * Helper to take a multi-dimensional object and convert
   * it's reference into the real value. This allows for variable input defined
   * in a string to actually hit the deeper part of an object structure.
   */
  _resolveObjectPath(path, obj) {
    return path.split(".").reduce(function(prev, curr) {
      return prev ? prev[curr] : null;
    }, obj || self);
  }
}
window.customElements.define(HaxManager.tag, HaxManager);
export { HaxManager };
