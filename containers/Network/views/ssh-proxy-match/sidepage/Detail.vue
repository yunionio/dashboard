<template>
  <detail
      :on-manager="onManager"
      :data="data"
      :base-info="baseInfo"
      :extra-info="extraInfo" />
</template>

<script>
export default {
  name: 'SshProxyMatchDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    columns: Array,
  },
  data () {
    return {
      baseInfo: [],
      extraInfo: [],
    }
  },
}
</script>
