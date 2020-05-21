<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>

export default {
  name: 'LoadbalancerclusterDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'zone',
          title: '可用区',
          formatter: ({ row }) => {
            return `${row.region} ${row.zone}`
          },
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
