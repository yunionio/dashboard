<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  // getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'CloudaccountQuotaList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'cloudproviderquotas',
        getParams: {
          details: false,
          cloudprovider_id: this.data.id,
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          quota_type: {
            label: '类型',
            filter: true,
            formatter: val => {
              return `quota_type.contains("${val}")`
            },
          },
          quota_range: {
            label: '位置',
            filter: true,
            formatter: val => {
              return `quota_range.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn(),
        getCopyWithContentTableColumn({
          field: 'quota_type',
          title: '类型',
        }),
        getCopyWithContentTableColumn({
          field: 'quota_range',
          title: '位置',
        }),
        {
          field: 'progress',
          title: '使用情况',
          minWidth: 330,
          slots: {
            default: ({ row }) => {
              const { used_count: uc, max_count: mc } = row
              const percent = uc / mc * 100
              const format = (percent, successPercent) => {
                return Math.round(percent) + '%'
              }
              let strokeColor = '#52c41a'
              if (Math.round(percent) > 60) {
                strokeColor = '#faad14'
              }
              if (Math.round(percent) > 80) {
                strokeColor = '#f5222d'
              }
              return [
                <a-row>
                  <a-col span={14}>
                    <a-progress status={'active'} strokeColor={strokeColor} format={format} size="small" percent={percent} />
                  </a-col>
                  <a-col span={10}>
                    <span style={{ fontSize: '12px', paddingLeft: '20px' }}>{uc}（共{mc}）</span>
                  </a-col>
                </a-row>,
              ]
            },
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
