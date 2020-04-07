<template>
  <page-list
    :showGroupActions="false"
    :showSearchbox="false"
    :list="list"
    :columns="columns" />
</template>

<script>
import { MEDIUM_TYPES } from '@Storage/constants/index.js'
import { getNameDescriptionTableColumn, getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'GuideStorageList',
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'storages',
        getParams: {
          filter: 'storage_type.contains("local")',
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
    }
  },
  computed: {
    columns () {
      return [
        {
          field: 'zone',
          title: '可用区',
        },
        getNameDescriptionTableColumn({
          title: '本地存储名称',
          showDesc: false,
        }),
        {
          field: 'custom_ip',
          title: 'IP',
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              let cellWrap = []
              if (row.access_ip) {
                cellWrap.push(
                  <div class="d-flex">
                  管理IP：<list-body-cell-wrap row={row} field="access_ip" copy />
                  </div>
                )
              }
              if (row.ipmi_ip) {
                cellWrap.push(
                  <div class="d-flex">
                    带外IP：<list-body-cell-wrap row={row} field="ipmi_ip" copy />
                  </div>
                )
              }
              return cellWrap
            },
          },
        },
        getEnabledTableColumn(),
        {
          field: 'medium_type',
          title: '存储类型',
          slots: {
            default: ({ row }) => {
              return [
                <a-radio-group defaultValue={row.medium_type} onChange={(e) => this.handleChangeType(e, row)}>
                  {Object.keys(MEDIUM_TYPES).map(k => (
                    <a-radio-button value={k}>{MEDIUM_TYPES[k]}</a-radio-button>
                  ))}
                </a-radio-group>,
              ]
            },
          },
        },
      ]
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    async handleChangeType (e, row) {
      console.log(e)
      try {
        this.list.singleUpdate(row.id, {
          medium_type: e.target.value,
        })
      } catch (err) {
        throw err
      }
    },
    submit () {
      return true
    },
  },
}
</script>
