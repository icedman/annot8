<template>
  <div v-show="show">
        <div class="annot8-modal-container">

<div class="annot8-modal-body">
<textarea xxxv-model="this.a8.currentAnnotation.quote" rows="5"
  style="min-width:298px;max-width:298px" class="form-control">
</textarea>
</div>

        </div>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
    a8: Object
  },

  data: function () {
    return {
    };
  },
  methods: {
  },
}
</script>

<style scoped>
.annot8-modal-container {
    width: 300px;
    padding: 8px;
    margin: 0px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
}

.annot8-modal-header h3 {
    margin-top: 0;
    color: #42b983;
}

.annot8-modal-body {
    margin: 0px 0;
}

textarea.form-control {
  padding:0px;
  border: 0px;
}
</style>
