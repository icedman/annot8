<template>
  <div id="app">
    <h2>Annotator</h2>
    Focus: {{focus}}<br>
    Quote: {{selectionQuote}}<br>
    Range: {{selectionRange}}<br>
    Elm: {{root.offsetLeft}}, {{root.offsetTop}}<br>
    Errors:
    <ul>
      <li v-for="(e,index) in errors">{{e}}</li>
    </ul>
    <hr>
    <button class="button is-primary" v-if="annotations.length == 0" @click="load()">Load</button>
    <button class="button is-primary" v-if="selection" @click="annotate()">Annotate</button>
    <button class="button is-primary" v-if="focus!=null" @click="erase(focus)">Remove</button>
    <button class="button is-primary" v-if="annotations.length" @click="draw()">Draw</button>
    <table class="table">
      <tr v-for="(annotation, index) in annotations">
        <td>{{ annotation.quote }}</td>
        <td>{{ annotation.range }}</td>
      </tr>
    </table>

    <highlights-canvas
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
import Highlights from './Highlights.vue';
import _ from 'lodash';
import { toRange, fromRange } from 'xpath-range';

export default {
  name: 'app',

  data () {

    const data = [
        {
          quote: 'Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but a',
          range: '{ "start": "/p[2]/text()[2]", "end": "/p[2]/text()[2]", "startOffset": 70, "endOffset": 281 }',
        }
      ];

    return {
      errors: [],
      svg: false,
      root: {},
      focus: null,
      selection: null,
      range: null,
      annotations: [],
      highlights: [],
      sampleData: data,
      canvas: {
        top: 0,
        left: 0,
        width: 400,
        height: 400
      }
    }
  },

  computed: {
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
    this.root = document.querySelector('.annotated-content');
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
    this.load();
    // this.draw();
  },

  methods: {

    onSelectionChanged: _.debounce(function(sel, range) {
      this.selection = sel;
      this.range = range ? fromRange(range, this.root) : null;
      window.r = range;
    }, 250),

    onDocumentResized: _.debounce(function() {
      this.draw();
    }, 150),

    onMouseUp: function(pos) {
      this.focus = null;

      pos.x = pos.x + window.scrollX - this.root.offsetLeft;
      pos.y = pos.y + window.scrollY - this.root.offsetTop;

      this.errors.push(pos);

      // find
      var pad = 2;
      for(var h of this.highlights) {
        var left = h.x - pad;
        var right = h.x + h.width + pad;
        var top = h.y - pad;
        var bottom = h.y + h.height + pad;
        if (left < pos.x && right > pos.x &&
            top < pos.y && bottom > pos.y) {
          this.focus = h.idx;
        }
      }

    },

    load() {
      this.annotations = [ ...this.sampleData ];
      this.draw();
      this.clearSelection();
    },

    annotate() {
      if (!this.selection)
        return;

      this.annotations.push({
        quote: this.selection.toString(),
        range: JSON.stringify(this.range),
        rects: []
      });

      this.draw();
      this.clearSelection();
    },

    erase(idx) {
      this.annotations.splice(idx,1);
      this.draw();
      this.clearSelection();
    },

    draw() {
      try {
        this.annotations.forEach(a=> { this.computeRects(a) });

        var canvasRect = this.root.getBoundingClientRect();
        // var canvasRect = { top:0,left:0,width:0,height:0 }
        this.canvas.top = this.root.offsetTop;
        this.canvas.left = this.root.offsetLeft;
        this.canvas.width = canvasRect.width;
        this.canvas.height = canvasRect.height;

        var rects = [];
        var idx = 0;
        this.annotations.forEach(a=> {
          a.rects.forEach(r=> {
            rects.push({
              x: r.x,// - this.canvas.left - 1,
              y: r.y,// - this.canvas.top - 1,
              width: r.width,
              height: r.height,
              idx: idx
            });
          });
          idx++;
        });

        this.highlights = rects;
      } catch(e) {
        this.errors.push(e);
      }
    },

    computeRects(annotation) {
      var obj = JSON.parse(annotation.range);
      var range = toRange(obj.start, obj.startOffset, obj.end, obj.endOffset, this.root);
      var bound = this.root.getBoundingClientRect();
      bound.x = bound.x || bound.left;
      bound.y = bound.y || bound.top;

      var rects = range.getClientRects();
      annotation.rects = [];
      for(var i=0;i<rects.length;i++) {
        // this.errors.push(rects.item(i));
        var rect = rects.item(i);//.toJSON();
        rect.x = rect.x || rect.left;
        rect.y = rect.y || rect.top;
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
    },
  },

  components: {
    'highlights-canvas': Highlights
  }
}
</script>

<style lang="sass" scoped>
/*@import '~bulma/bulma.sass';*/
</style>
