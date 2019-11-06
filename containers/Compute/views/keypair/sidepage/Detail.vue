<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
export default {
  name: 'KeyPairDetail',
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
        {
          field: 'fingerprint',
          title: '指纹',
        },
        {
          field: 'scheme',
          title: '类型',
        },
        {
          field: 'linked_guest_count',
          title: '关联主机数',
        },
      ],
    }
  },
}
</script>
