<template>
<div>
<!--
  <ul>
  <li v-for="(highlight, index) in highlights">{{highlight}}</li>
  </ul>
-->
<svg class="disableSelection" :width="width" :height="height" style="border: 2px solid red; z-index:-1; position: absolute; top:0px; left:0px" :style="getStylePosition">
  <rect class="annot8-hl" :class="[ (h.idx==active ? 'annot8-active' : null) ]" v-for="(h, index) in highlights"
        :x="h.x"
        :y="h.y"
        :width="h.width"
        :height="h.height"
        :key="index"/>
</svg>
</div>
</template>

<script>
export default {
  props: {
    top: Number,
    left: Number,
    width: Number,
    height: Number,
    highlights: Array,
    active: Number
  },

  computed: {
    getStylePosition() {
      return [ {'top': this.top + 'px' }, {'left': this.left + 'px' }];
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
