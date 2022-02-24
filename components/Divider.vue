<template>
    <div :style="style" class="custom-divider"></div>
</template>

<script>
    export default {
      name: "Divider",
      props: ['color', 'height', 'space'],
      computed: {
        style() {
          return `margin-bottom: ${this.space}px; margin-top: ${this.space}px; height: ${this.height}px; background-color: ${this.color};`;
        }
      }
    }
</script>

<style scoped>

</style>
