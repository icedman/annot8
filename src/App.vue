<template>
  <div class="annot8-app" :class="[debug?'annot8-debug':'']">
    <debugger v-if="debug" :a8="Me">
    </debugger>

    <icons/>

    <toolbar :a8="Me">
    </toolbar>

    <highlights-canvas
      :zIndex="zIndex"
      :svg="svg"
      :active="focus"
      :left="canvas.left"
      :top="canvas.top"
      :offX="canvas.offX"
      :offY="canvas.offY"
      :width="canvas.width"
      :height="canvas.height"
      :highlights="highlights"
      :a8="Me">
    </highlights-canvas>

    <div style="display:none">
      <a target="_blank" id="annot8_twitter_link" href="" @click="openShareLink"></a>
      <a target="_blank" id="annot8_facebook_link" href="" @click="openShareLink"></a>
    </div>

    <modal-dialog :show="showDialog" @close="showModal = false" :a8="Me">
    </modal-dialog>

  </div>
</template>

<script>
import EventSpy from './eventSpy.js';
import { _ } from './libs.js';
import { toRange, fromRange } from 'xpath-range';

import Toolbar from './Toolbar.vue';
import Highlights from './Highlights.vue';
import Debug from './Debug.vue';
import Dialog from './Dialog.vue';
import Icons from './Icons.vue';

export default {
  name: 'annot8-app',

  data () {

    return {
      selector: [ 'article' ],
      svg: false,
      debug: false,
      zIndex: -1,

      errors: [],

      tag: null,
      root: {},
      focus: null,
      lastFocus: null,
      selection: null,
      range: null,
      annotations: [],
      highlights: [],

      canvas: {
        top: 0,
        left: 0,
        width: 600,
        height: 40,
        offX: null,
        offY: null
      },

      selectionBounds: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },

      mobile: null,
      currentToolbar: '',
      showDialog: false
    }
  },

  computed: {

    Me() {
      return this;
    },

    currentAnnotation() {
      var annotation = this.annotations[this.lastFocus];
      if (annotation) {
        return Object.assign({tag:''}, annotation);
      }
      return {
        quote: this.selectionQuote
      }
    },

    currentTag() {
      var annotation = this.annotations[this.lastFocus];
      if (annotation) {
        return annotation.tag;
      }
      return this.tag;
    },

    selectionQuote() {
      var sel = this.selection || '';
      if (sel == '' && this.focus !== null) {
        sel = this.annotations[this.focus].quote;
      }
      return sel.toString();
    },

    selectionRange() {
      if (!this.range && this.focus !== null) {
        return this.annotations[this.focus].range || {};
      }
      if (!this.range) {
        return {};
      }
      return this.range;
    },

    isMobile() {
      if (this.mobile != null) {
        return this.mobile;
      }

      try {
        var navigator = window.navigator;
        this.mobile = ( navigator.userAgent.match(/Android/i)
          || navigator.userAgent.match(/webOS/i)
          || navigator.userAgent.match(/iPhone/i)
          || navigator.userAgent.match(/iPad/i)
          || navigator.userAgent.match(/iPod/i)
          || navigator.userAgent.match(/BlackBerry/i)
          || navigator.userAgent.match(/Windows Phone/i)
        );
      } catch(e) {
        this.log(e);
      }

      return this.mobile;
    },

    showToolbar() {
      if (!this.selectionBounds.ready) {
        return '';
      }
      if (this.selection && this.focus === null) {
        this.showDialog = false;
        return this.currentToolbar || 'create';
      }
      if (this.selection === null && this.focus !== null) {
        this.showDialog = false;
        return this.currentToolbar || 'edit';
      }
      return '';
    }
  },

  mounted () {
    this.init();
  },

  destroyed () {
    EventSpy.stop();
  },

  methods: {
    init() {
      // load config
      this.selector = this.$config.selector;
      this.svg = this.$config.svg;
      this.debug = this.$config.debug;

      // find selector
      this.root = document.body;
      for(var sel of this.selector) {
        var elm = document.querySelector(sel);
        if (elm) {
          this.root = elm;
          this.selector = sel;
          break;
        }
      }

      // re-parent the canvas
      try {
        this.root.appendChild(this.$el);
      } catch(e) {
      }

      // get margin hint
      for(var sheet of document.styleSheets) {
        try {
          for(var rule of sheet.rules) {
            if (rule.selectorText.indexOf('html') != -1) {
              if (rule.cssText.indexOf('!important') != -1) {
                console.log(rule.cssText);
              }
            }
          }
        } catch(e) {
          // skip errors
        }
      }

      // run!
      EventSpy.start(this.root,
        /* selection callback */
        (sel, range) => {
          this.onSelectionChanged(sel, range);
        },
        /* resize callback */
        () => {
          this.onDocumentResized();
        },
        /* mouse callback */
        (pos) => {
          // this.log(pos);
          this.onMouseUp(pos);
        }
      );

      window.Annot8 = this;
      setTimeout(() => {
        this.draw();
      }, 500);

      this.onRead();
    },

    calculateSelectionBounds: _.debounce(function(range) {
      if (range == null)
        return;

      if (this.isMobile) {
        this.selectionBounds.ready = true;
        return;
      }

      try {
        var rect = this.calculateBoundsFromRects(range.getClientRects());
        this.selectionBounds = rect;
        this.selectionBounds.ready = true;
      } catch(e) {
        this.log(e);
      }
    }, 450),

    calculateBoundsFromRects: function(rects) {
      var rect = {};

      for(var clientRect of rects) {
        var x = clientRect.x || clientRect.left;
        var y = clientRect.y || clientRect.top;
        var x2 = x + (clientRect.width || 0);
        var y2 = y + (clientRect.height || 0);

        if (rect.x > x || !rect.x) {
          rect.x = x;
        }
        if (rect.y > y || !rect.y) {
          rect.y = y;
        }
        if (rect.x2 < x2 || !rect.x2) {
          rect.x2 = x2;
        }
        if (rect.y2 < y2 || !rect.y2) {
          rect.y2 = y2;
        }
      }

      rect.width = rect.x2 - rect.x;
      rect.height = rect.y2 - rect.y;
      rect.ready = true;

      // ??
      rect.x = rect.x + window.scrollX;
      rect.y = rect.y + window.scrollY;

      return rect;
    },

    onSelectionChanged: _.debounce(function(sel, range) {
      // this.log('onSelectionChanged');
      this.selection = sel;
      this.range = range ? fromRange(range, this.root) : null;
      this.selectionBounds.ready = false;
      this.calculateSelectionBounds(range);
      if (range) {
        this.focus = null;
      }
    }, 50),

    onDocumentResized: _.debounce(function() {
      // this.log('onDocumentResized');
      this.draw();
    }, 150),

    onMouseUp: _.debounce(function(pos) {
      // this.log('onMouseUp');
      this.focus = null;
      var pad = 2;
      // make relative
      pos.x = pos.x - window.scrollX;
      pos.y = pos.y - window.scrollY;

      // get hit highlight
      var rects = [];
      var timeoutId;
      document.querySelectorAll('.annot8-hl').forEach( n=> {
        // if (this.focus != null)
        //   return;

        var h = n.getClientRects()[0];
        h.x = h.x || h.left;
        h.y = h.y || h.top;
        var left = h.x - pad;
        var right = h.x + h.width + pad;
        var top = h.y - pad;
        var bottom = h.y + h.height + pad;
        if (left < pos.x && right > pos.x &&
            top < pos.y && bottom > pos.y) {
          this.focus = parseInt(n.dataset.idx);
          this.lastFocus = this.focus;
          // rects.push({x:h.x, y:h.y, width:h.right-h.left, height:h.bottom-h.top});
          rects.push({x:pos.x, y:h.y, width:2, height:h.bottom-h.top});
        }

        if (this.focus >=0) {
          if (timeoutId != null) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            var rect = this.calculateBoundsFromRects(rects);
            this.selectionBounds = rect;
            this.selectionBounds.ready = true;
          }, 250);
        }
      });
    }, 50),

    loadData(annotations) {
      this.annotations = [];

      annotations.forEach(a=> {
        this.annotations.push(Object.assign({},a));
      });

      this.draw();
      this.clearSelection();
    },

    _createAnnotation() {
      var annotation = {
          quote: this.selection.toString(),
          range: JSON.stringify(this.range),
          rects: [],
          tag: this.tag
        };
      this.annotations.push(annotation);
      this.onCreate(annotation);

      // select latest highlight
      setTimeout(() => {
        this.focus = this.annotations.length-1;
        this.lastFocus = this.focus;
        this.selectionBounds.ready = true;
      }, 250);
    },

    _updateAnnotation(id) {
      var annotation = this.annotations[id];
      if (annotation) {
        annotation.tag = this.tag;
      }
      this.onUpdate(annotation);
    },

    annotate(params) {
      params = params || {};
      this.tag = params.tag || '';

      if (this.selection) {
        this._createAnnotation();
      } else if (params.id != undefined) {
        this._updateAnnotation(params.id);
      }

      this.draw();
      this.clearSelection();
      this.currentToolbar = '';
    },

    erase(idx) {
      try {
        var annotation = this.annotations[idx];
        this.annotations.splice(idx,1);
        this.draw();
        this.clearSelection();
        this.lastFocus = null;
        this.onDelete(annotation);
      } catch(e) {

      }
    },

    setZIndices() {
      let elm = this.root;
      let z = 1;
      while(elm && elm !== document.body) {
        if (!elm.style.zIndex) {
          elm.style.zIndex = z++;
        }
        elm = elm.parentElement;
      }
    },

    accountForOffsets: _.debounce(function() {
      var canvas = document.querySelector('.annot8-canvas');
      var canvasRect = canvas.getBoundingClientRect();
      var rootRect = this.root.getBoundingClientRect();
      this.canvas.offX = rootRect.left - canvasRect.left;
      this.canvas.offY = rootRect.top - canvasRect.top;
    }, 250),

    // draw is actually computing the drawRect
    draw() {
      this.annotations.forEach(a=> { this.drawAnnotation(a) });

      // first, position the canvas
      var canvasRect = this.root.getBoundingClientRect();
      this.canvas.top = this.root.offsetTop;
      this.canvas.left = this.root.offsetLeft;
      this.canvas.width = canvasRect.width;
      this.canvas.height = canvasRect.height;

      if (this.canvas.offX == null || this.canvas.offY == null) {
        this.accountForOffsets();
      }

      // check first element
      try {
        var firstElementRect = this.root.firstElement.getBoundingClientRect();
      } catch(e) {
        //
      }

      var rects = [];
      var idx = 0;
      this.annotations.forEach(a=> {
        a.rects.forEach(r=> {
          // some error checking
          if (!r) {
            return;
          }
          rects.push({
            x: r.x - 2,
            y: r.y - 2,
            width: r.width,
            height: r.height,
            idx: idx,
            tag: a.tag,
          });
        });
        idx++;
      });

      this.highlights = rects;

      // necessary fixes
      this.setZIndices();
    },

    drawAnnotation(annotation) {
      annotation.rects = [];

      var obj = JSON.parse(annotation.range)
      var range = null;
      try {
        range = toRange(obj.start, obj.startOffset, obj.end, obj.endOffset, this.root);
      } catch(e) {
        // document modified?
        // mark for removal?
        this.log(e);
        return;
      }

      var bound = this.root.getBoundingClientRect();

      // use X,Y
      bound.x = bound.x || bound.left;
      bound.y = bound.y || bound.top;

      var rects = range.getClientRects();
      for(var i=0;i<rects.length;i++) {
        var rect = rects.item(i);

        // use X,Y
        rect.x = rect.x || rect.left;
        rect.y = rect.y || rect.top;

        // make relative
        rect.y = rect.y - bound.y;
        rect.x = rect.x - bound.x;
        annotation.rects.push(rect);
      }
    },

    clearSelection() {
      if (window.getSelection) {
          if (window.getSelection().empty) {  // Chrome
              window.getSelection().empty();
          } else if (window.getSelection().removeAllRanges) {  // Firefox
              window.getSelection().removeAllRanges();
          }
      } else if (document.selection) {  // IE?
          document.selection.empty();
      }

      this.selection = null;
      this.range = null;
      this.focus = null;
      // this.lastFocus = null;
    },

    toggleRenderer() {
      this.svg = !this.svg;
    },

    log(error) {
      if (!this.debug) {
        return;
      }
      this.errors.push(error);
    },

    onRead() {
      var source = this.$config.source;
      if (typeof(source.read) == 'function') {
        source.read(this.$http)
        .then((data) => {
          this.loadData(data);
        })
        .catch((err) => {
          this.log(err);
        });
        return;
      }
    },

    onCreate(annotation) {
      var source = this.$config.source;
      if (typeof(source.create) == 'function') {
        source.create(this.$http, this.annotations, annotation)
        .then((data) => {
          // this.loadData(data);
        })
        .catch((err) => {
          this.log(err);
        });
        return;
      }
    },

    onUpdate(annotation) {
      var source = this.$config.source;
      if (typeof(source.update) == 'function') {
        source.update(this.$http, this.annotations, annotation)
        .then((data) => {
          // this.loadData(data);
        })
        .catch((err) => {
          this.log(err);
        });
        return;
      }
    },

    onDelete(annotation) {
      var source = this.$config.source;
      if (typeof(source.delete) == 'function') {
        source.delete(this.$http, this.annotations, annotation)
        .then((data) => {
          // this.loadData(data);
        })
        .catch((err) => {
          this.log(err);
        });
      }
    },

    openShareLink(event) {
      event.preventDefault();
      window.open(event.srcElement.href, '', 
        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    }
  },

  components: {
    'toolbar': Toolbar,
    'highlights-canvas': Highlights,
    'debugger': Debug,
    'modal-dialog': Dialog,
    'icons': Icons
  }
}
</script>

<style lang="sass">
@import './assets/main.scss';
</style>
