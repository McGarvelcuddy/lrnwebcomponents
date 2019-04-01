import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { afterNextRender } from "@polymer/polymer/lib/utils/render-status.js";
import { microTask } from "@polymer/polymer/lib/utils/async.js";
import { store } from "@lrnwebcomponents/haxcms-elements/lib/core/haxcms-site-store.js";
import { autorun, toJS } from "mobx";
import "@lrnwebcomponents/haxcms-elements/lib/ui-components/active-item/site-active-title.js";
/**
 * `simple-blog-post`
 * `A simple blog and associated elements`
 */
class SimpleBlogPost extends PolymerElement {
  /**
   * Store the tag name to make it easier to obtain directly.
   * @notice function name must be here for tooling to operate correctly
   */
  static get tag() {
    return "simple-blog-post";
  }
  // render function
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          min-height: 80vh;
        }
        main {
          transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          opacity: 1;
          visibility: visible;
        }
        @media only screen and (max-width: 900px) {
          main {
            padding: 0 32px;
          }
        }
        section {
          width: 100%;
          font-family: Linux Libertine;
          color: #333;
        }
        section ::slotted(*) {
          font-weight: 400;
          font-style: normal;
          font-size: 22px;
          line-height: 30px;
          margin: 0;
          padding-bottom: 30px;
          color: #333;
          -webkit-hyphens: auto;
          -moz-hyphens: auto;
          hyphens: auto;
        }
        :host([has-image]) .article-image {
          position: absolute;
          background-color: var(--haxcms-color, black);
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
        .post-image-image {
          background-size: cover;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          text-indent: -9999px;
          padding-top: 33%;
          z-index: 1;
        }
        .post-meta {
          font-family: Open Sans, MundoSans, "Helvetica Neue", Arial, Helvetica,
            sans-serif;
        }
        :host([has-image]) .post-meta {
          position: absolute;
          bottom: 80px;
          left: 30%;
          right: 30%;
          padding-top: 60px;
          z-index: 9;
          font-family: Open Sans, MundoSans, "Helvetica Neue", Arial, Helvetica,
            sans-serif;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }
        site-active-title {
          --site-active-title-heading: {
            font-weight: 700;
            font-style: normal;
            letter-spacing: -0.04em;
            font-size: 50px;
            line-height: 1.1;
            color: black;
          }
        }
        :host([has-image]) site-active-title {
          --site-active-title-heading: {
            font-weight: 700;
            font-style: normal;
            letter-spacing: -0.04em;
            font-size: 50px;
            line-height: 1.1;
            margin-bottom: 16px;
            text-shadow: 0 1px 16px rgba(0, 0, 0, 0.5),
              0 0 1px rgba(0, 0, 0, 0.5);
            color: white;
          }
        }
        /**
       * Hide the slotted content during edit mode
       */
        :host([edit-mode]) #slot {
          display: none;
        }
      </style>
      <main>
        <article>
          <div class="article-image">
            <template is="dom-if" if="[[hasImage]]">
              <div
                id="image"
                class="post-image-image"
                style\$='background-image: url("[[image]]");'
              ></div>
            </template>
            <div class="post-meta">
              <site-active-title></site-active-title>
            </div>
          </div>
          <section id="contentcontainer">
            <div id="slot"><slot></slot></div>
          </section>
        </article>
      </main>
    `;
  }

  static get properties() {
    return {
      /**
       * calculate if we have a header image.
       */
      hasImage: {
        type: Boolean,
        observer: "_hasImageChanged",
        reflectToAttribute: true
      },
      /**
       * editting state for the page
       */
      editMode: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },
      image: {
        type: String
      }
    };
  }

  /**
   * Ready life cycle
   */
  constructor() {
    super();
    this.__disposer = [];
    afterNextRender(this, function() {
      window.addEventListener("scroll", this._scrollListener.bind(this));
      autorun(reaction => {
        const fields = toJS(store.activeItemFields);
        this.hasImage = this._computeHasImage(fields);
        if (this.hasImage) {
          this.image = fields.images[0].src;
        }
        this.__disposer.push(reaction);
      });
    });
  }

  /**
   * Detatched life cycle
   */
  disconnectedCallback() {
    window.removeEventListener("scroll", this._scrollListener.bind(this));
    for (var i in this.__disposer) {
      this.__disposer[i].dispose();
    }
    super.disconnectedCallback();
  }

  /**
   * Scroll event listener to do image effects.
   */
  _scrollListener(e) {
    if (this.hasImage) {
      let top =
        (window.pageYOffset || document.scrollTop) - (document.clientTop || 0);
      if (top < 0 || top > 1500) {
        return;
      }
      this.shadowRoot.querySelector("#image").style.transform =
        "translate3d(0px, " + top / 3 + "px, 0px)";
      this.shadowRoot.querySelector("#image").style.opacity =
        1 - Math.max(top / 700, 0);
    }
  }

  /**
   * image has changed, ensure we set padding appropriately.
   */
  _hasImageChanged(newValue, oldValue) {
    if (newValue) {
      microTask.run(() => {
        let rect = this.shadowRoot
          .querySelector("#image")
          .getBoundingClientRect();
        this.$.contentcontainer.style.paddingTop = rect.height + "px";
      });
    } else {
      this.$.contentcontainer.style.paddingTop = null;
    }
  }

  /**
   * see if there's an image in the metadata blob.
   */
  _computeHasImage(fields) {
    if (
      fields &&
      typeof fields.images !== typeof undefined &&
      typeof fields.images[0] !== typeof undefined &&
      typeof fields.images[0].src !== typeof undefined
    ) {
      return true;
    }
    return false;
  }
}
window.customElements.define(SimpleBlogPost.tag, SimpleBlogPost);
export { SimpleBlogPost };
