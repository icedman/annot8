<template>

<div v-if="a8.selection">
  <a class="annot8-button" @click="a8.annotate()">Annotate</a>
  <a class="annot8-button" @click="a8.annotate('green')">Green Tag</a>
</div>

</template>

<script>
export default {
    props: {
        a8: Object
    }
}
</script>
