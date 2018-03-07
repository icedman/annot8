<template>
<div>

<!-- SVG based renderer -->
<svg v-if="svg"
    class="annot8-canvas annot8-canvas-svg disableSelection"
    :width="width" :height="height"
    style="z-index:-1; position: absolute; top:0px; left:0px"
    :style="getStylePosition">
  <rect class="annot8-hl"
    :class="[
      (h.idx==active ? 'annot8-active' : null),
      (h.tag!='' ? 'annot8-hl-' + h.tag : null),
    ]"
    v-for="(h, index) in highlights"
    :x="h.x"
    :y="h.y"
    :width="h.width"
    :height="h.height"
    :key="index"/>
</svg>

<!-- HTML5 based renderer -->
<div v-if="!svg" class="annot8-canvas annot8-canvas-html disableSelection"
    style="display:block;z-index:-1; position: absolute; top:0px; left:0px"
    :style="getStyleRect">
  <div class="annot8-hl"
    :class="[
      (h.idx==active ? 'annot8-active' : null),
      (h.tag!='' ? 'annot8-hl-' + h.tag : null),
    ]"
    v-for="(h, index) in highlights"
    style='position:absolute;display:block'
    :style="[ {'top': h.y + 'px' }, {'left': h.x + 'px' }, {'width': h.width + 'px' } , {'height': h.height + 'px' }]">
  </div>
</div>

</div>
</template>

<script>
export default {
  props: {
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
      return [ {'top': (this.top + 1) + 'px' }, {'left': (this.left + 1) + 'px' } ];
    },
    getStyleRect() {
      return [ {'top': (this.top + 1) + 'px' }, {'left': (this.left + 1) + 'px' },
               {'width': (this.width - 2) + 'px' }, {'height': (this.height - 2) + 'px' } ];
    },
  }
}
</script>

<style scoped>
.disableSelection {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    outline: 0;
}
</style>
