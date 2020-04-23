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
    cloudEnvOptions: {
      type: Array,
    },
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
          { label: this.$t('dictionary.project'), key: 'tenant' },
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
              path: '/servertemplate/create',
              query: {
                type: this.cloudEnv === 'onpremise' ? 'idc' : this.cloudEnv || this._cloudEnv,
                source: 'servertemplate',
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !!this._cloudEnv,
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
          label: `新建${this.$t('dictionary.server')}`,
          permission: 'server_create',
          action: obj => {
            this.$router.push({
              path: '/servertemplate/create-server',
              query: {
                id: obj.id,
              },
            })
          },
        },
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
  computed: {
    _cloudEnv () {
      if (this.cloudEnvOptions && this.cloudEnvOptions.length > 0) {
        const idc = this.cloudEnvOptions.find(item => item.key === 'idc')
        if (idc && idc.key) {
          return idc.key
        }
        const item = this.cloudEnvOptions.find(item => item.key) || {}
        return item.key
      }
      return ''
    },
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
