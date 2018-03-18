<template>
<div class="annot8-modal-container" v-show="show">
<div class="annot8-modal-inner">

  <div class="annot8-modal-body">
  <textarea rows="4"
    style="min-width:288px;max-width:288px" class="form-control"
    v-model="comment">
  </textarea>
  <div v-show="dirty">
  <button @click="save" class="annot8-modal-button" style="float:right;">
    Save
  </button>
  </div>
  </div>

</div>
</div>
</template>

<script>
import { _ } from './libs.js';

export default {
  props: {
    show: Boolean
  },

  data: function () {
    var state = this.$store.state;
    return {
      a8: state,
      newComment: '',
      dirty: false
    };
  },

  computed: {
    comment: {
      get() { 
        if (this.a8.focus == null) {
          return '';
        }
        return this.a8.annotations[this.a8.focus].comment;
      },
      set(value) {
        this.newComment = value;
        this.dirty = true;
      },
    }
  },

  methods: {
    save() {
      this.a8.comment({comment:this.newComment});
      this.a8.currentToolbar = '';
      this.a8.focus = null;
      this.dirty = false;
    },
  },
}
</script>
