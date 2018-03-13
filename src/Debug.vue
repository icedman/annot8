<template>

<div>
  <h2>Annotator</h2>

  <a class="annot8-button" v-if="a8.annotations.length == 0" @click="a8.loadSample()">Load Sample</a>
  <a class="annot8-button" v-if="a8.selection" @click="a8.annotate()">Annotate</a>
  <a class="annot8-button" v-if="a8.selection" @click="a8.annotate('green')">Green Tag</a>
  <a class="annot8-button" v-if="a8.lastFocus!=null" @click="a8.erase(a8.lastFocus)">Remove</a>
  <a class="annot8-button" v-if="a8.annotations.length" @click="a8.draw()">Redraw</a>
  <a class="annot8-button" @click="a8.toggleRenderer()">Toggle Renderer</a>

  <br>
  <hr>

  Focus: {{a8.focus}}<br>
  Quote: {{a8.selectionQuote}}<br>
  Range: {{a8.selectionRange}}<br>
  Tag:   {{a8.tag}}<br>
  Elm: {{a8.root.offsetLeft}}, {{a8.root.offsetTop}}<br>
  Errors:

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
