<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: '',
  props: {
    title: {
      required: false,
      default: '特定動画表示',
    },
  },
  setup() {
    return {}
  },
  head(): any {
    return {
      title: this.title,
    }
  },
})
</script>

<style lang="scss" scoped></style>
