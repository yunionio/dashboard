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
  // getPackageNameTableColumn,
  // getPackageVersionTableColumn,
  // getAppImageTableColumn,
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
        getAppSizeTableColumn(),
      ],
      extraInfo: [
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
    mountPaths () {
      if (!this.data.mounts || !Array.isArray(this.data.mounts)) {
        return ''
      }
      return this.data.mounts.join('\n')
    },
  },
}
</script>
