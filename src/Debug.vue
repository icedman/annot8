<template>

<div class="annot8-disableSelection">
  <h2>Annotator</h2>

  <a class="annot8-button" v-if="a8.annotations.length == 0" @click="a8.loadSample()">Load Sample</a>
  <a class="annot8-button" v-if="a8.selection" @click="a8.annotate()">Annotate</a>
  <a class="annot8-button" v-if="a8.selection" @click="a8.annotate({tag:'tag2'})">Green Tag</a>
  <a class="annot8-button" v-if="a8.focus!=null" @click="a8.erase(a8.lastFocus)">Remove</a>

  <br>
  <hr>

  Mobile: {{$config.mobile}}<br>
  Toolbar:{{a8.showToolbar}}<br>
  Focus: {{a8.focus}}<br>
  Quote: {{a8.selectionQuote}}<br>
  Range: {{a8.selectionRange}}<br>
  Rect:  {{a8.selectionBounds}}<br>
  Tag:   {{a8.tag}}<br>
  Log:

  <ul>
    <li v-for="(e,index) in a8.errors">{{e}}</li>
  </ul>
  <hr>
  <table class="table">
    <tr v-for="(annotation, index) in a8.annotations">
      <td>{{ annotation.quote }}</td>
      <td>{{ annotation.range }}</td>
    </tr>
  </table>
</div>

</template>

<script>
export default {
    data() {
        var state = this.$store.state;
        return {
          a8: state
        }
    }
}
</script>

