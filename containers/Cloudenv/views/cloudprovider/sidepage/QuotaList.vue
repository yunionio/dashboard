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
          cloudprovider_id: this.data.id,
        },
        filterOptions: {
          name: {
            label: this.$t('cloudenv.text_95'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          quota_type: {
            label: this.$t('cloudenv.text_360'),
            filter: true,
            formatter: val => {
              return `quota_type.contains("${val}")`
            },
          },
          cloudregion: {
            label: this.$t('cloudenv.text_10'),
            // filter: true,
            // formatter: val => {
            //   return `cloudregion.contains("${val}")`
            // },
          },
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('cloudenv.text_95'),
          minWidth: 150,
          slots: {
            default: ({ row }, h) => {
              const { name } = row
              const text = this.$t('cloudproviderquotaNames')[name] || name
              return [
                <list-body-cell-wrap hideField copy field={'name'} row={row} message={text}>
                  {text}
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        getCopyWithContentTableColumn({
          field: 'quota_type',
          title: this.$t('cloudenv.text_360'),
        }),
        getCopyWithContentTableColumn({
          field: 'cloudregion',
          title: this.$t('cloudenv.text_10'),
        }),
        {
          field: 'used_count',
          title: this.$t('cloudenv.text_361'),
          minWidth: 330,
          sortable: true,
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
                    <span style={{ fontSize: '12px', paddingLeft: '20px' }}>{uc}（{this.$t('common.total', [mc])}）</span>
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
