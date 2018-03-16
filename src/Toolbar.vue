<template>
<div class="annot8-toolbar-container annot8-disableSelection" style="z-index:999":style="getContainerStylePosition">
  <div class="annot8-toolbar" :style="getStylePosition">
  <div class="annot8-toolbar-inner">

    <div class="annot8-toolbar-button"
      :class="'annot8-'+btn.action"
      :data-tag="getButtonDataTag(btn)"
      @click="clickButton(btn)" v-for="btn in toolbarButtons">
      <span class="annot8-toolbar-icon" v-html="btn.icon"></span>
    </div>

  </div>
  </div>
</div>
</template>

<script>
import { _ } from './libs.js';

export default {
  data() { return {
    forceMobile: false, // for testing only!
    toolbarRect: { width:0, height:0, spyInterval: 0 },
    buttons: [],
    currentToolbar: ''
  }},

  props: {
    a8: Object
  },
  computed: {
    toolbarButtons() {
      return this.buttons.filter(b=>b.tool === this.a8.showToolbar);
    },

    getContainerStylePosition() {
      if (this.a8.isMobile || this.forceMobile) {
        return [ { position: 'fixed', bottom: '0px'} ];
      }
      return [ { position: 'absolute', top: '0px', left: '0px' } ];
    },

    getStylePosition() {
      if (this.a8.isMobile || this.forceMobile) {
        return [ { bottom: '0px' } ];
      }
      var show = this.a8.showToolbar != '';
      var opacity = !show || !this.toolbarRect.width ||
        this.toolbarRect.spyInterval ? 0: 1;
      var bounds = this.a8.selectionBounds;
      var left = bounds.x + (bounds.width/2) - (this.toolbarRect.width/2);
      var top = bounds.y - this.toolbarRect.height;

      // force within screen
      var tw = this.toolbarRect.width * 1.2;
      if (left + tw + 40 > window.screen.availWidth) {
        left = window.screen.availWidth - tw - 40;
      } else if (left < 40) {
        left = 40;
      }
      if (top < 0) {
        top = bounds.y + bounds.height + 10;
        this.a8.log(bounds);
        this.a8.log(top);
      }

      return [
        { position: 'absolute' },
        { top: top + 'px' },
        { left: left + 'px' },
        { bottom: '' },
        { visibility: !show ? 'hidden': 'visible' },
        { opacity: opacity }
      ];
    },
  },
  mounted() {
    // re-parent the toolbar
    try {
      document.body.appendChild(this.$el);
    } catch(e) {
      // console.log(e);
    }

    var intervalId = setInterval(()=>{
      this.buttons = [];
      this.createButtons();
      if (this.buttons.length > 0) {
        clearInterval(intervalId);
      }
    }, 150);

  },
  methods: {
    getButtonDataTag(btn) {
      if (btn.action == 'tags') {
        return this.a8.currentTag;
      }
      return btn.tag;
    },
    createButtons() {
      // create the buttons
      if (this.$config.buttons) {
        var btns = [];
        this.$config.buttons.forEach((btn)=>{
          btn.icon = document.querySelector(btn.icon).outerHTML;
          btns.push(btn);
        });
        this.buttons = btns;
      }
      this.computeToolbarSize();
    },

    clickButton(btn) {
      var params = {
        id:this.a8.lastFocus,
        tag:btn.tag || this.a8.currentTag
      };

      if (typeof(btn.action) === 'function') {
        btn.action(this.a8.currentAnnotation);
        this.a8.clearSelection();
        return;
      }

      switch(btn.action) {
        case 'annotate': {
          if (this.a8.showToolbar =='edit') {
            this.a8.erase(this.a8.lastFocus);
            return;
          }
          this.a8.annotate(params);
          break;
        }
        case 'tags': {
          if (this.a8.currentToolbar == 'tags') {
            this.a8.currentToolbar = '';
          } else {
            this.a8.currentToolbar = 'tags';
          }
          break;
        }
      }
    },

    computeToolbarSize: _.debounce(function() {
      if (this.toolbarRect.spyInterval) {
        clearInterval(this.toolbarRect.spyInterval);
      }
      // lots of timeouts/delays
      this.toolbarRect.spyInterval = setInterval(()=>{
        var toolbarElement = this.$el.querySelector('.annot8-toolbar');
        if (toolbarElement && toolbarElement.offsetWidth) {
          this.toolbarRect.height = toolbarElement.offsetHeight + 4;
          this.toolbarRect.width = toolbarElement.offsetWidth;
          clearInterval(this.toolbarRect.spyInterval);
          this.toolbarRect.spyInterval = 0;
        }
      }, 1);
    }, 50)
  }
}
</script>
