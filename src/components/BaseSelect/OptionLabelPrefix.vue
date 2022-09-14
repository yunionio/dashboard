<template>
  <div>
    <slot name="optionLabelTemplate" />
  </div>
</template>

<script>
export default {
  props: {
    nameKey: String,
    data: Object,
  },
}
</script>
