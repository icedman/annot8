<template>
<div class="annot8-canvas-container">
<!-- SVG based renderer -->

<svg v-if="svg"
    class="annot8-canvas annot8-disableSelection annot8-canvas-svg"
    :width="width" :height="height"
    style="position: absolute; top:0px; left:0px"
    :style="getStylePosition">
  <rect class="annot8-hl"
    :class="[ getHighlightClass(h) ]"
    v-for="(h, index) in highlights"
    :x="h.x"
    :y="h.y"
    :width="h.width"
    :height="h.height"
    :key="index"
    :data-idx="h.idx"/>
</svg>

<!-- HTML5 based renderer -->
<div class="annot8-canvas annot8-disableSelection annot8-canvas-html"
    style="display:block;position: absolute; top:0px; left:0px"
    :style="getStyleRect">
  <div class="annot8-hl"
    :class="[ getHighlightClass(h) ]"
    v-for="(h, index) in highlights"
    style='position:absolute;display:block'
    :style="[ {'top': h.y + 'px' }, {'left': h.x + 'px' }, {'width': h.width + 'px' } , {'height': h.height + 'px' }]"
    :data-idx="h.idx">
  </div>
</div>

</div>
</template>

<script>
export default {
  props: {
    zIndex: Number,
    svg: Boolean,
    top: Number,
    left: Number,
    width: Number,
    height: Number,
    highlights: Array,
    active: Number
  },

  computed: {
    getStylePosition() {
      var container = document.querySelector('.annot8-canvas-container');
      var offset = container.style.paddingTop;
      return [ { 'z-index': (this.zIndex || -1) }, { 'top': (this.top + 1) + 'px' }, {'left': (this.left + 1) + 'px' } ];
    },
    getStyleRect() {
      return [ { 'z-index': (this.zIndex || -1) },
               {'top': (this.top + 1) + 'px' }, {'left': (this.left + 1) + 'px' },
               {'width': (this.width - 2) + 'px' }, {'height': (this.height - 2) + 'px' } ];
    },
  },

  methods: {
    getHighlightClass(h) {
      return [ (h.idx==this.active ? 'annot8-active' : null),
               (h.tag && h.tag!='' ? 'annot8-hl-' + h.tag : null) ];
    },
  },

  mounted() {
    // try {
      // document.body.appendChild(this.$parent.root);
    // } catch(e) {
      // console.log(e);
    // }
  }
}
</script>
