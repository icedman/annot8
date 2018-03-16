<template>
  <div class="annot8-app">

    <debugger v-if="debug" :a8="Me">
    </debugger>

    <toolbar :a8="Me">
    </toolbar>

    <highlights-canvas
      :zIndex="zIndex"
      :svg="svg"
      :active="focus"
      :left="canvas.left"
      :top="canvas.top"
      :width="canvas.width"
      :height="canvas.height"
      :highlights="highlights"
      :a8="Me">
    </highlights-canvas>

    <div style="display:none">
      <a target="_blank" id="annot8_twitter_link" href=""></a>
      <a target="_blank" id="annot8_facebook_link" href=""></a>
    </div>

    <icons/>

  </div>
</template>

<script>
import EventSpy from './eventSpy.js';
import _ from './libs.js';
import { toRange, fromRange } from 'xpath-range';

import Toolbar from './Toolbar.vue';
import Highlights from './Highlights.vue';
import Debug from './Debug.vue';
import Icons from './Icons.vue';

export default {
  name: 'annot8-app',

  data () {

    return {
      selector: 'article',
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
        height: 40
      },

      selectionBounds: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },

      mobile: null,
      currentToolbar: ''
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
        return this.currentToolbar || 'create';
      }
      if (this.selection === null && this.focus !== null) {
        return this.currentToolbar || 'edit';
      }
      return '';
    }
  },

  mounted () {
    // load config
    this.selector = this.$config.selector;
    this.svg = this.$config.svg;
    this.debug = this.$config.debug;

    this.root = document.querySelector(this.selector);
    if (!this.root) {
      this.root = document.querySelector('.' + this.selector);
    }
    if (!this.root) {
      this.root = document.querySelector('#' + this.selector);
    }
    if (!this.root) {
      return;
    }

    // re-parent the canvas
    try {
      // this.root.appendChild(this.$el);
      this.root.insertBefore(this.$el, this.root.firstElementChild);
    } catch(e) {
      //
    }

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

  destroyed () {
    EventSpy.stop();
  },

  methods: {

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
      this.selection = sel;
      this.range = range ? fromRange(range, this.root) : null;
      this.selectionBounds.ready = false;
      this.calculateSelectionBounds(range);
      if (range) {
        this.focus = null;
      }
    }, 50),

    onDocumentResized: _.debounce(function() {
      this.draw();
    }, 150),

    onMouseUp: _.debounce(function(pos) {
      this.focus = null;
      var pad = 2;

      // make relative
      pos.x = pos.x - window.scrollX;
      pos.y = pos.y - window.scrollY;

      // get hit highlight
      var rects = [];
      document.querySelectorAll('.annot8-hl').forEach( n=> {
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
          setTimeout(() => {
            this.calculateBoundsFromRects(rects);
          }, 250);
        }
      });
    }, 150),

    loadSample() {
      const data = [
        {
          quote: 'Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but a',
          range: '{ "start": "/p[2]/text()[2]", "end": "/p[2]/text()[2]", "startOffset": 70, "endOffset": 281 }',
        }
      ];

      this.annotations = [ ...data ];
      this.draw();
      this.clearSelection();
    },

    _createAnnotation() {
      this.annotations.push({
          quote: this.selection.toString(),
          range: JSON.stringify(this.range),
          rects: [],
          tag: this.tag
        });
    },

    _updateAnnotation(id) {
      var annotation = this.annotations[id];
      if (annotation) {
        annotation.tag = this.tag;
      }
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
        this.annotations.splice(idx,1);
        this.draw();
        this.clearSelection();
        this.lastFocus = null;
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

    // draw is actually computing the drawRect
    draw() {
      this.annotations.forEach(a=> { this.drawAnnotation(a) });

      // first, position the canvas
      var canvasRect = this.root.getBoundingClientRect();
      this.canvas.top = this.root.offsetTop;
      this.canvas.left = this.root.offsetLeft;
      // this.canvas.top = 0;//this.canvas.top || this.canvas.y;
      // this.canvas.left = 0;//this.canvas.left || this.canvas.x;
      this.canvas.width = canvasRect.width;
      this.canvas.height = canvasRect.height;

      // this.canvas = this.calculateBoundsFromRects(this.root.getClientRects());
      // this.canvas.left = this.canvas.left || this.canvas.x;
      // this.canvas.top = this.canvas.top || this.canvas.y;

      // account for margins
      try {
        var marginTop = window.getComputedStyle(document.querySelector('html'))['margin-top'];
        if (marginTop && false) {
          marginTop = parseInt(marginTop)
          this.canvas.top += marginTop;
        }
      } catch(e) {
        //
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

    onRead: _.debounce(function() {
      var source = this.$config.source;
      var url = `${source.baseUrl}${source.read}`;
      this.$http({method:'get',url:url})
      .then((data)=>{
        console.log(data);
        this.loadSample();
      })
      .catch(err=>{
        console.log(err);
      })
    }, 50),

    onCreate(annotation) {
    },

    onUpdate(annotation) {
    },

    onDelete(annotation) {
    }
  },

  components: {
    'toolbar': Toolbar,
    'highlights-canvas': Highlights,
    'debugger': Debug,
    'icons': Icons
  }
}
</script>

<style lang="sass">
@import './assets/main.scss';
</style>
