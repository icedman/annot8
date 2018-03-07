<template>
  <div id="app">
    <h2>Annotator</h2>
    Focus: {{focus}}<br>
    Quote: {{selectionQuote}}<br>
    Range: {{selectionRange}}
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
import Highlights from './Highlights.vue';

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
      root: null,
      focus: null,
      selection: null,
      range: null,
      annotations: [],
      highlights: [],
      sampleData: data,
      canvas: {
        top: 0,
        left: 0,
        width: 1400,
        height: 1400
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
    }
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
    this.draw();
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

      pos.x -= this.canvas.left;
      pos.y -= this.canvas.top;

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
      this.annotations.forEach(a=> { this.computeRects(a) });

      var canvasRect = this.root.getBoundingClientRect();
      this.canvas.top = canvasRect.top;
      this.canvas.left = canvasRect.left;
      this.canvas.width = canvasRect.width;
      this.canvas.height = canvasRect.height;

      var rects = [];
      var idx = 0;
      this.annotations.forEach(a=> {
        a.rects.forEach(r=> {
          rects.push({
            x: r.x - this.canvas.left - 1,
            y: r.y - this.canvas.top - 1,
            width: r.width,
            height: r.height,
            idx: idx
          });
        });
        idx++;
      });

      this.highlights = rects;
    },

    computeRects(annotation) {
      var obj = JSON.parse(annotation.range);
      var range = toRange(obj.start, obj.startOffset, obj.end, obj.endOffset, this.root);
      var rects = range.getClientRects();
      annotation.rects = [];
      for(var i=0;i<rects.length;i++) {
        var rect = rects.item(i).toJSON();
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
