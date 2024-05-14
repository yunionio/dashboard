<template>
  <detail
    :on-manager="onManager"
    :data="detailData"
    :extra-info="extraInfo"
    :base-info="baseInfo"
    :name-rules="[{ required: true, message: $t('compute.text_210') }]"
    status-module="container"
    resource="containers" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getImageTableColumn,
  getEnvTableColumn,
  getCommandTableColumn,
  getArgsTableColumn,
} from '../utils/columns'

export default {
  name: 'VmPodContainerDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getImageTableColumn(),
        getEnvTableColumn(),
        getCommandTableColumn(),
        getArgsTableColumn(),
      ],
    }
  },
  computed: {
    detailData () {
      return {
        ...this.data,
      }
    },
  },
  created () { },
  methods: {},
}
</script>
