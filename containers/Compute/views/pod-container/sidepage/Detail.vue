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
import ContainerImageMixin from '../mixins/containerImage'
import {
  getImageTableColumn,
  getContainerImageTableColumn,
  getEnvTableColumn,
  getCommandTableColumn,
  getArgsTableColumn,
  getCapabilitiesTableColumn,
  getLxcfsTableColumn,
  getOverlayTableColumn,
} from '../utils/columns'

export default {
  name: 'VmPodContainerDetail',
  mixins: [WindowsMixin, ContainerImageMixin],
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
        getContainerImageTableColumn({ vm: this }),
        getImageTableColumn(),
        getEnvTableColumn(),
        getCommandTableColumn(),
        getArgsTableColumn(),
        getCapabilitiesTableColumn(),
        getLxcfsTableColumn(),
        getOverlayTableColumn(),
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
    containerImageId () {
      return this.data?.spec?.container_image_id || ''
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
  watch: {
    containerImageId: {
      immediate: true,
      handler (val) {
        if (val) this.fetchContainerImageNames([val])
      },
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
