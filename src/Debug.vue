<template>

<div class="annot8-disableSelection">
  <h2>Annotator</h2>

  <a class="annot8-button" v-if="a8.annotations.length == 0" @click="a8.loadSample()">Load Sample</a>
  <a class="annot8-button" v-if="a8.selection" @click="a8.annotate()">Annotate</a>
  <a class="annot8-button" v-if="a8.selection" @click="a8.annotate({tag:'green'})">Green Tag</a>
  <a class="annot8-button" v-if="a8.focus!=null" @click="a8.erase(a8.lastFocus)">Remove</a>
  <a class="annot8-button" v-if="a8.annotations.length" @click="a8.draw()">Redraw</a>
  <!-- <a class="annot8-button" @click="a8.toggleRenderer()">Toggle Renderer</a> -->
  <a class="annot8-button" @click="a8.errors = []">Clear Log</a>

  <br>
  <hr>

  Mobile: {{a8.isMobile}}<br>
  Toolbar:{{a8.showToolbar}}<br>
  Focus: {{a8.focus}}<br>
  Quote: {{a8.selectionQuote}}<br>
  Range: {{a8.selectionRange}}<br>
  Rect:  {{a8.selectionBounds}}<br>
  Tag:   {{a8.tag}}<br>
  Elm: {{a8.root.offsetLeft}}, {{a8.root.offsetTop}}<br>
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
    props: {
        a8: Object
    }
}
</script>
