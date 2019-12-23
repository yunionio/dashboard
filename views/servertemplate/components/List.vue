<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import {
  getNameDescriptionTableColumn,
  // isPublicTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import { getTenantFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ServertemplateList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'servertemplates',
        getParams: {
          details: true,
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          tenant: getTenantFilter(),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'ServertemplateSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        // isPublicTableColumn(),
        getProjectTableColumn(),
        {
          field: 'created_at',
          title: '创建时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          actions: () => {
            const createServer = type => {
              this.$router.push({
                path: '/servertemplate/create',
                query: {
                  type,
                  source: 'servertemplate',
                },
              })
            }
            return [
              {
                label: 'IDC',
                permission: 'servertemplates_create',
                action: () => {
                  createServer('idc')
                },
              },
              {
                label: '私有云',
                permission: 'servertemplates_create',
                action: () => {
                  createServer('private')
                },
              },
              {
                label: '公有云',
                permission: 'servertemplates_create',
                action: () => {
                  createServer('public')
                },
              },
            ]
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          permission: 'servertemplates_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
        // {
        //   label: '设置共享',
        //   permission: 'servertemplates_perform_public',
        //   action: obj => {
        //     this.createDialog('SetPublicDialog', {
        //       data: this.list.selectedItems,
        //       columns: this.columns,
        //       list: this.list,
        //     })
        //   },
        //   meta: () => {
        //     return {
        //       validate: this.list.selectedItems.length && this.list.selectedItems.every(this.isPower),
        //     }
        //   },
        // },
      ],
      singleActions: [
        // {
        //   label: '设置共享',
        //   permission: 'servertemplates_perform_public',
        //   action: obj => {
        //     this.createDialog('SetPublicDialog', {
        //       data: [obj],
        //       columns: this.columns,
        //       list: this.list,
        //     })
        //   },
        //   meta: obj => {
        //     return {
        //       validate: this.isPower(obj),
        //     }
        //   },
        // },
        {
          label: '删除',
          permission: 'servertemplates_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              list: this.list,
              name: '主机模板',
            })
          },
          meta: obj => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('servertemplate-detail')
  },
  methods: {
    isPower (obj) {
      if (this.$store.getters.isAdminMode) return true
      if (this.$store.getters.isDomainMode) return obj.domain_id === this.$store.getters.userInfo.projectDomainId
      return obj.tenant_id === this.$store.getters.userInfo.projectId
    },
  },
}
</script>
