<template>
<div class="annot8-toolbar-container annot8-disableSelection" :style="getContainerStylePosition">
  <div v-if="showCreateToolbar||showEditToolbar" class="annot8-toolbar" :style="getStylePosition">
    <div v-if="showCreateToolbar">
      <a class="annot8-toolbar-button btn btn-primary" @click="a8.annotate()">Annotate</a>
      <a class="annot8-toolbar-button btn btn-primary" @click="a8.annotate({tag:'green'})">Green</a>
    </div>

    <div v-if="showEditToolbar">
      <a class="annot8-toolbar-button btn btn-primary" @click="a8.erase(a8.lastFocus)">Remove</a>
      <a class="annot8-toolbar-button btn btn-primary" @click="changeColor('green')">Green</a>
    </div>
  </div>
</div>
</template>

<script>
export default {
  data() { return {
    forceMobile: true,
    toolbarRect: { width:60, height:24, spyInterval: 0 },
    element: null
  }},

  props: {
    a8: Object
  },
  computed: {
    getContainerStylePosition() { 
      if (this.a8.isMobile || this.forceMobile) {
        return [ { position: 'fixed', bottom: '0px'} ];  
      }
      return null;
    },

    getStylePosition() {
      if (this.a8.isMobile || this.forceMobile) {
        return [ { bottom: '0px' } ];
      }
      var bounds = this.a8.selectionBounds;
      var left = bounds.x + (bounds.width/2) - (this.toolbarRect.width/2);
      var top = bounds.y - this.toolbarRect.height;
      return [
        { position: 'absolute' },
        { top: top + 'px' },
        { left: left + 'px' },
        { bottom: '' },
      ];
    },
    showCreateToolbar() {
      if (!this.a8.selectionBounds.ready && !this.a8.isMobile)
        return false;
      return (this.a8.selection && this.a8.focus === null);
    },
    showEditToolbar() {
      if (!this.a8.selectionBounds.ready && !this.a8.isMobile)
        return false;
      return (this.a8.selection === null && this.a8.focus !== null);
    }
  },
  mounted() {
    setTimeout(()=>{
      this.element = this.$el.querySelector('.annot8-toolbar');
    }, 2000);

    this.toolbarRect.spyInterval = setInterval(()=>{
      if (this.element && this.element.offsetWidth) {
        this.toolbarRect.height = this.element.offsetHeight + 4;
        this.toolbarRect.width = this.element.offsetWidth;
        clearInterval(this.toolbarRect.spyInterval);
      }
    }, 500);
  },
  methods: {
    changeColor(color) {
      var params = {id:this.a8.lastFocus, tag:color};
      this.a8.annotate(params);
    }
  }
}
</script>
