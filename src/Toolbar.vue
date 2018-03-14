<template>
<div class="annot8-toolbar-container annot8-disableSelection" style="z-index:999":style="getContainerStylePosition">
  <div class="annot8-toolbar" :style="getStylePosition">
  <div class="annot8-toolbar-inner">

    <span v-if="showCreateToolbar">
    <div class="annot8-toolbar-button" :class="['annot8-'+btn.action]"
      @click="clickButton(btn)" v-for="btn in getButtons('create')">
      <span class="annot8-toolbar-icon" v-html="btn.icon"></span>
    </div>
    </span>

    <span v-if="showEditToolbar">
    <div class="annot8-toolbar-button" :class="[ 'annot8-'+btn.action, 'annot8-'+a8.currentTag]"
      @click="clickButton(btn)" v-for="btn in getButtons('edit')">
      <span class="annot8-toolbar-icon" v-html="btn.icon"></span>
    </div>
    </span>

  </div>
  </div>
</div>
</template>

<script>
import _ from 'lodash';

export default {
  data() { return {
    forceMobile: false, // for testing only!
    toolbarRect: { width:0, height:0, spyInterval: 0 },
    buttons: [],
    currentToolbar: null
  }},

  props: {
    a8: Object
  },
  computed: {
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
      var show = this.showCreateToolbar || this.showEditToolbar;
      var opacity = !show || !this.toolbarRect.width ||
        this.toolbarRect.spyInterval ? 0: 1;
      var bounds = this.a8.selectionBounds;
      var left = bounds.x + (bounds.width/2) - (this.toolbarRect.width/2);
      var top = bounds.y - this.toolbarRect.height;

      var tw = this.toolbarRect.width;
      if (left + tw > window.screen.availWidth) {
        left = window.screen.availWidth - tw - this.toolbarRect.width;
      } else if (left < 40) {
        left = 40;
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
    showCreateToolbar() {
      if (!this.a8.selectionBounds.ready && !this.a8.isMobile)
        return false;
      return this._setCurrentToolbar('create', (this.a8.selection && this.a8.focus === null));
    },
    showEditToolbar() {
      if (!this.a8.selectionBounds.ready && !this.a8.isMobile)
        return false;
      return this._setCurrentToolbar('edit', (this.a8.selection === null && this.a8.focus !== null));
    }
  },
  mounted() {
    // re-parent the toolbar
    try {
      document.body.appendChild(this.$el);
    } catch(e) {
      // console.log(e);
    }

    setTimeout(()=>{
      this.buttons = [];
      this.createButtons();
    }, 50);

  },
  methods: {
    getButtons(tool) {
      return this.buttons.filter(b=>b.tool==tool);
    },

    createButtons() {
      // create the buttons
      if (this.$config.buttons) {
        this.$config.buttons.forEach((btn)=>{
          btn.icon = document.querySelector(btn.icon).outerHTML;
          this.buttons.push(btn);
        })
      }

      this.computeToolbarSize();
    },

    _setCurrentToolbar(tool, res) {
      if (!res) {
        return false;
      }
      if (tool != this.currentToolbar) {
        this.computeToolbarSize();
      }
      this.currentToolbar = tool;
      return true;
    },

    changeColor(color) {
      var params = {id:this.a8.lastFocus, tag:color};
      this.a8.annotate(params);
    },

    clickButton(btn) {
      var params = {id:this.a8.lastFocus, tag:'yellow'};
      if (typeof(btn.action) === 'function') {
        btn.action(this.a8.currentAnnotation);
        this.a8.clearSelection();
        return;
      }
      switch(btn.action) {
        case 'annotate': {
          if (this.showEditToolbar) {
            this.a8.erase(this.a8.lastFocus);
            return;
          }
          this.a8.annotate(params);
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
