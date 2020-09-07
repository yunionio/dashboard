<template>
  <detail
    :showDesc="false"
    :showName="false"
    :hiddenKeys="['project_domain', 'tenant', 'status', 'updated_at']"
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { isPublicTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'K8sRepoDetail',
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
      baseInfo: [
        {
          field: 'name',
          title: this.$t('helm.text_16'),
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ this.data } onManager={ this.onManager } field='name' title={ row.name } />
                </div>,
              ]
            },
          },
        },
        {
          field: 'type',
          title: this.$t('helm.text_92'),
          minWidth: 80,
          formatter: ({ row }) => {
            if (row.type === 'internal') return this.$t('helm.text_14')
            if (row.type === 'external') return this.$t('helm.text_15')
            return '-'
          },
        },
        {
          field: 'mountedBy',
          title: this.$t('helm.text_102'),
          formatter: ({ row }) => row.mountedBy ? row.mountedBy.length : '-',
        },
        {
          field: 'url',
          title: this.$t('helm.text_96'),
        },
        isPublicTableColumn(),
      ],
    }
  },
}
</script>
