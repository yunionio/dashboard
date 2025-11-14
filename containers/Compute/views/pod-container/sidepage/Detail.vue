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
import jsYaml from 'js-yaml'
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
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
        readOnly: true,
      },
    }
  },
  computed: {
    detailData () {
      return {
        ...this.data,
      }
    },
    extraInfo () {
      return [
        {
          field: 'info',
          title: this.$t('compute.source_data'),
          slots: {
            default: ({ row }) => {
              const yamlInfo = jsYaml.safeDump(row)
              return [<div class="pod-container-yaml"><code-mirror value={yamlInfo} options={this.cmOptions} /></div>]
            },
          },
        },
      ]
    },
  },
  created () { },
  methods: {},
}
</script>
<style lang="less">
.pod-container-yaml {
  .CodeMirror {
    height: calc(100vh - 310px);
    min-height: calc(100vh - 310px);
    max-height: 80vh;
  }
}
</style>
