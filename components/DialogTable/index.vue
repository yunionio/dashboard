<template>
  <div class="mb-2">
    <vxe-grid :data="data" :columns="columns" v-bind="{ ...vxeGridProps }" :max-height="280" />
  </div>
</template>

<script>
export default {
  name: 'DialogTable',
  props: {
    data: {
      type: Array,
      required: true,
      default: () => ([]),
    },
    columns: {
      type: Array,
      required: true,
      default: () => ([]),
    },
    vxeGridProps: { // vex-grid 的属性
      type: Object,
      required: false,
    },
  },
}
</script>
