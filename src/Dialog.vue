<template>
<div class="annot8-modal-container" v-show="show">
<div class="annot8-modal-inner">

  <div class="annot8-modal-body">
  <textarea rows="4"
    style="min-width:288px;max-width:288px" class="form-control" v-model="comment"></textarea>

<div>
  <label class="author" style="float:left">{{created}}&nbsp;&nbsp;{{author}}</label>
  <button @click="save" class="annot8-modal-button" style="float:right;">
<svg viewBox="0 0 1550 1188" witdh="12" height="12"><path d="M1550 232q0 40-28 68l-724 724-136 136q-28 28-68 28t-68-28l-136-136L28 662Q0 634 0 594t28-68l136-136q28-28 68-28t68 28l294 295 656-657q28-28 68-28t68 28l136 136q28 28 28 68z"/></svg>
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
    author() {
      if (this.a8.focus == null) {
        return '';
      }
      return this.a8.annotations[this.a8.focus].author;
    },

    created() {
      if (this.a8.focus == null) {
        return '';
      }
      return this.a8.annotations[this.a8.focus].created;
    },

    comment: {
      get() { 
        if (this.a8.focus == null) {
          this.newComment = '';
          this.dirty = false;
          return '';
        }
        return this.a8.annotations[this.a8.focus].comment;
      },
      set(value) {
        this.dirty = true;
        this.newComment = value;
      }
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
