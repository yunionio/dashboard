<template>
  <page-list
    :showGroupActions="false"
    :showSearchbox="false"
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import { getNameDescriptionTableColumn, getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'GuideHostList',
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'hosts',
        getParams: {},
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
        responseData: this.responseData,
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
        // {
        //   field: 'zone',
        //   title: '二层网络',
        // },
        getNameDescriptionTableColumn({
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
      ]
    },
    singleActions () {
      return [
        {
          label: '启用',
          action: (obj) => {
            this.list.singlePerformAction('enable', {
              id: obj.id,
            })
          },
          meta: (obj) => {
            return {
              validate: !obj.enabled,
            }
          },
        },
        {
          label: '禁用',
          action: (obj) => {
            this.list.singlePerformAction('disable', {
              id: obj.id,
            })
          },
          meta: (obj) => {
            return {
              validate: obj.enabled,
            }
          },
        },
      ]
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    // submit () {
    //   return true
    // },
  },
}
</script>
