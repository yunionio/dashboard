<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="image"
    resource="instant_apps" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getEnabledTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getAppImageTableColumn,
  getAppSizeTableColumn,
  getAppCacheStatusColumn,
  getModelIdTableColumn,
  getModelNameTableColumn,
  getLlmTypeTableColumn,
} from '../utils/columns'

export default {
  name: 'InstantAppDetail',
  mixins: [WindowsMixin],
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
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        readOnly: true,
        theme: 'material',
        mode: 'text/plain',
      },
      baseInfo: [
        // getPackageNameTableColumn(),
        // getPackageVersionTableColumn(),
        // getAppImageTableColumn({ vm: this }),
        getEnabledTableColumn(),
        getEnabledTableColumn({
          field: 'auto_cache',
          title: this.$t('aice.mounted_apps.auto_cache'),
        }),
        getAppCacheStatusColumn(),
        getModelIdTableColumn(),
        getModelNameTableColumn(),
        getLlmTypeTableColumn(),
        getPublicScopeTableColumn(),
        getAppImageTableColumn({ vm: this }),
        getAppSizeTableColumn(),
      ],
      extraInfo: [
        {
          field: 'import_progress',
          title: this.$t('aice.llm_image.progress'),
          hidden: () => !this.showImportProgress,
          slots: {
            default: ({ row }) => {
              const progress = Math.ceil(+row.progress * 100) / 100
              return [
                <a-progress
                  percent={progress}
                  show-info={true}
                  size="small"
                  status="active" />,
              ]
            },
          },
        },
        {
          field: 'mounts',
          title: this.$t('aice.mounted_apps.mounts'),
          slots: {
            default: ({ row }, h) => {
              return [
                <code-mirror value={ this.mountPaths } options={ this.cmOptions } />]
            },
          },
        },
      ],
    }
  },
  computed: {
    showImportProgress () {
      const progress = +this.data.progress
      if (!(progress > 0 && progress < 100)) return false
      return ['init', 'packaging', 'saving', 'queued', 'converting'].includes(this.data.status)
    },
    mountPaths () {
      if (!this.data.mounts || !Array.isArray(this.data.mounts)) {
        return ''
      }
      return this.data.mounts.join('\n')
    },
  },
}
</script>
