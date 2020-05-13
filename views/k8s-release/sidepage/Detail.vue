<template>
  <detail
    :showDesc="false"
    :showName="false"
    :hiddenKeys="['project_domain', 'tenant', 'updated_at']"
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { k8sStatusColumn } from '@K8S/utils/tableColumns'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'K8sReleaseDetail',
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
          title: '名称',
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
          field: 'metadata',
          title: '应用',
          formatter: ({ row }) => `${row.chart}/${row.chart_version || ''}`,
        },
        k8sStatusColumn({ statusModule: 'release' }),
        {
          field: 'cluster',
          title: '集群',
        },
        {
          field: 'namespace',
          title: '命名空间',
        },
        {
          field: 'version',
          title: '版本',
        },
      ],
    }
  },
}
</script>
