<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    statusModule="globalVpc" />
</template>

<script>
export default {
  name: 'GpuDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        // {
        //   field: 'model',
        //   title: '设备型号',
        // },
      ],
    }
  },
}
</script>
