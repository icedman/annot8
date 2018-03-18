<template>
<div class="annot8-modal-container" v-show="show">
<div class="annot8-modal-inner">

  <div class="annot8-modal-body" :class="edit ? 'annot8-edit-mode':null">
  <textarea v-if="edit" rows="4"
    style="min-width:288px;max-width:288px" class="form-control" v-model="comment"></textarea>
    <div class="annot8-modal-text" v-if="!edit">{{comment}}</div>
<div>

<button v-if="!edit && canEdit" @click="edit=true" class="annot8-modal-button" style="float:right;">
<svg viewBox="0 0 1515 1515" witdh="12" height="12"><path d="M363 1387l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7L305 986q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832H0v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z"/></svg>
</button>
<button v-if="edit" @click="save" class="annot8-modal-button" style="float:right;">
<svg viewBox="0 0 1550 1188" witdh="12" height="12"><path d="M1550 232q0 40-28 68l-724 724-136 136q-28 28-68 28t-68-28l-136-136L28 662Q0 634 0 594t28-68l136-136q28-28 68-28t68 28l294 295 656-657q28-28 68-28t68 28l136 136q28 28 28 68z"/></svg>
</button>

<div style="float:right; line-height:14px; padding:8px; padding-right:0px">
<span class="author">{{author}}</span>
<span class="created">{{created}}</span>
</div>

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
      dirty: false,
      edit: false
    };
  },

  computed: {
    canEdit() {
      if (this.$config.authorEmail) {
        if (this.a8.focus == null) {
          return false;
        }
        if (this.$config.authorEmail == 
          this.a8.annotations[this.a8.focus].author_email) {
          return true;
        }
      }
      return false;
    },

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
      this.edit = false;
    }
  },
}
</script>
