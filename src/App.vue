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
      :highlights="highlights">
    </highlights-canvas>

  </div>
</template>

<script>
import EventSpy from './eventSpy.js';
import _ from 'lodash';
import { toRange, fromRange } from 'xpath-range';

import Toolbar from './Toolbar.vue';
import Highlights from './Highlights.vue';
import Debug from './Debug.vue';

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
        width: 400,
        height: 400
      }
    }
  },

  computed: {

    Me() {
      return this;
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
      this.root.appendChild(this.$el);
      // this.root.insertBefore(this.$el, this.root.firstElementChild);
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
        this.onMouseUp(pos);
      }
    );

    window.Annot8 = this;
    setTimeout(() => {
      this.draw();
    }, 500);
  },

  destroyed () {
    EventSpy.stop();
  },

  methods: {

    onSelectionChanged: _.debounce(function(sel, range) {
      this.selection = sel;
      this.range = range ? fromRange(range, this.root) : null;
    }, 250),

    onDocumentResized: _.debounce(function() {
      this.draw();
    }, 150),

    onMouseUp: function(pos) {
      this.focus = null;
      var pad = 2;

      // make relative
      pos.x = pos.x - window.scrollX;
      pos.y = pos.y - window.scrollY;

      document.querySelectorAll('.annot8-hl').forEach( n=> {
        var h = n.getClientRects()[0];
        var left = h.x - pad;
        var right = h.x + h.width + pad;
        var top = h.y - pad;
        var bottom = h.y + h.height + pad;
        if (left < pos.x && right > pos.x &&
            top < pos.y && bottom > pos.y) {
          this.focus = parseInt(n.dataset.idx);
          this.lastFocus = this.focus;
        }
      });
    },

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

    annotate(tag) {
      if (!this.selection)
        return;

      this.tag = tag || '';

      this.annotations.push({
        quote: this.selection.toString(),
        range: JSON.stringify(this.range),
        rects: [],
        tag: this.tag
      });

      this.draw();
      this.clearSelection();
    },

    erase(idx) {
      console.log(idx);
      this.annotations.splice(idx,1);
      this.draw();
      this.clearSelection();
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
      try {
        this.annotations.forEach(a=> { this.drawAnnotation(a) });

        // first, position the canvas
        var canvasRect = this.root.getBoundingClientRect();
        this.canvas.top = this.root.offsetTop;
        this.canvas.left = this.root.offsetLeft;
        this.canvas.width = canvasRect.width;
        this.canvas.height = canvasRect.height;

        // account for margins
        try {
          var marginTop = window.getComputedStyle(document.querySelector('html'))['margin-top'];
          if (marginTop) {
            marginTop = parseInt(marginTop)
            this.canvas.top += marginTop;
          }
        } catch(e) {
          //
        }

        // check first element
        try {
          var firstElementRect = this.root.firstElement.getBoundingClientRect();
          console.log(firstElementRect);
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
      } catch(e) {
        this.errors.push(e);
      }

      // necessary fixes
      this.setZIndices();
    },

    drawAnnotation(annotation) {
      var obj = JSON.parse(annotation.range)
      var range = toRange(obj.start, obj.startOffset, obj.end, obj.endOffset, this.root);
      var bound = this.root.getBoundingClientRect();

      // use X,Y
      bound.x = bound.x || bound.left;
      bound.y = bound.y || bound.top;

      var rects = range.getClientRects();
      annotation.rects = [];
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
      this.lastFocus = null;
    },

    toggleRenderer() {
      this.svg = !this.svg;
    }
  },

  components: {
    'toolbar': Toolbar,
    'highlights-canvas': Highlights,
    'debugger': Debug
  }
}
</script>

<style scoped>
.annot8-app {
  margin:0px;
  margin-top:0px;
  margin-left:0px;
  padding:0px;
  padding-top:0px;
  padding-left:0px;
}
</style>
