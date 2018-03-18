<template>
<div class="annot8-modal-container" v-show="show">
<div class="annot8-modal-inner">

  <div class="annot8-modal-body">
  <textarea rows="4"
    style="min-width:298px;max-width:298px" class="form-control"
    v-model="comment">
  </textarea>
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
      a8: state
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
      set: _.debounce(function(value) {
        this.a8.comment({comment:value});
      }, 500)
    }
  },

  methods: {
  },
}
</script>
