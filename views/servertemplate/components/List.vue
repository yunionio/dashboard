<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
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
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servertemplates',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          tenant: getTenantFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '项目', key: 'tenant' },
          { label: '创建时间', key: 'created_at' },
        ],
      },
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
          permission: 'servertemplates_create',
          action: () => {
            this.$router.push({
              path: '/servertemplate/create?source=servertemplate',
              query: {
                type: this.cloudEnv === 'onpremise' ? 'idc' : this.cloudEnv || 'idc',
              },
            })
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
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
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
    getParam () {
      const ret = {
        details: true,
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
  },
}
</script>
