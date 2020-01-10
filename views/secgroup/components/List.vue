<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :expand-config="{ lazy: true, loadMethod: loadRules }"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import {
  getProjectTableColumn,
  getNameDescriptionTableColumn,
  isPublicTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { getTenantFilter } from '@/utils/common/tableFilter'
import globalSearchMixins from '@/mixins/globalSearch'

export default {
  name: 'SecgroupList',
  mixins: [WindowsMixin, globalSearchMixins],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
      default: () => ({
        details: true,
      }),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'secgroups',
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
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '关联实例', key: 'guest_cnt' },
          { label: '共享范围', key: 'public_scope' },
          { label: '状态', key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'SecGroupSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'guest_cnt',
          title: '关联实例',
          width: 70,
        },
        isPublicTableColumn(),
        {
          field: 'rules',
          title: '规则预览(策略，来源，协议，端口)',
          width: 220,
          type: 'expand',
          slots: {
            content: ({ row }, h) => {
              const inList = []
              const outList = []
              row.rules.forEach(obj => {
                let text = ''
                if (obj.action) text += `${obj.action}`
                if (obj.cidr) text += `，${obj.cidr}`
                if (obj.protocol) text += `，${obj.protocol}`
                if (obj.ports) text += `，${obj.ports}`
                if (obj.direction === 'in') {
                  inList.push({
                    value: text,
                  })
                } else if (obj.direction === 'out') {
                  outList.push({
                    value: text,
                  })
                }
              })
              const ret = []
              if (inList.length > 0) {
                ret.push(
                  <div class='mb-2 d-flex'>
                    <div class='flex-grow-0 flex-shrink-0'>出方向：</div>
                    <div>{ outList.map(item => <a-tag class='mb-2'>{ item.value }</a-tag>) }</div>
                  </div>
                )
              }
              if (outList.length > 0) {
                ret.push(
                  <div class='d-flex'>
                    <div class='flex-grow-0 flex-shrink-0'>入方向：</div>
                    <div>{ inList.map(item => <a-tag class='mb-2'>{ item.value }</a-tag>) }</div>
                  </div>
                )
              }
              if (ret.length <= 0) {
                ret.push(
                  <div>暂无规则</div>
                )
              }
              return ret
            },
          },
        },
        getProjectTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'secgroups_create',
          action: () => {
            this.createDialog('CreateSecgroupDialog', {
              title: '新建',
              list: this.list,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '批量追加规则',
          permission: 'secgroups_performAction',
          action: () => {
            this.createDialog('AddRulesDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '批量追加规则',
              list: this.list,
            })
          },
          meta: () => {
            if (this.list.selectedItems.length > 0) {
              if (this.isAdminMode) {
                return {
                  validate: true,
                }
              } else {
                return {
                  validate: this.list.selectedItems.every(val => !val.is_public),
                }
              }
            }
            return {
              validate: false,
              tooltip: '请选择私有安全组',
            }
          },
        },
        {
          label: '删除',
          permission: 'secgroups_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
          meta: (obj) => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
      singleActions: [
        {
          label: '关联云服务器',
          permission: 'server_perform_assign_secgroup',
          action: (obj) => {
            this.createDialog('SetServerDialog', {
              data: [obj],
              columns: this.columns,
              title: '关联云服务器',
              list: this.list,
            })
          },
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: `更改${this.$t('dictionary.project')}`,
                permission: 'secgroups_create',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  if (this.$store.getters.isAdminMode || this.$store.getters.isDomainMode) {
                    return {
                      validate: this.isPower(obj),
                    }
                  }
                  return {
                    validate: false,
                  }
                },
              },
              {
                label: '设置为私有',
                permission: 'secgroups_create',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'private',
                    },
                  })
                },
                meta: () => {
                  if (this.$store.getters.isAdminMode || this.$store.getters.isDomainMode) {
                    if (this.isPower(obj)) {
                      return {
                        validate: obj.is_public,
                      }
                    }
                  }
                  return {
                    validate: false,
                  }
                },
              },
              {
                label: '设置为共享',
                permission: 'secgroups_create',
                action: () => {
                  this.createDialog('SetPublicDialog', {
                    data: [obj],
                    title: '设置为共享',
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  if (this.$store.getters.isAdminMode || this.$store.getters.isDomainMode) {
                    if (this.isPower(obj)) {
                      return {
                        validate: !obj.is_public,
                      }
                    }
                  }
                  return {
                    validate: false,
                  }
                },
              },
              {
                label: '克隆',
                // permission: 'secgroups_create',
                action: () => {
                  this.createDialog('CloneSecgroupDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '克隆',
                    list: this.list,
                  })
                },
                meta: () => {
                  const pArr = this.$store.getters.permission && this.$store.getters.permission['secgroups_create']
                  const val = pArr[pArr.length - 1]
                  if (val === 'deny') {
                    return {
                      validate: false,
                    }
                  }
                  if (val === 'guest' || val === 'user' || val === 'allow') {
                    const isSystemResource = this.$store.getters.scopeResource && this.$store.getters.scopeResource.system.includes(pArr[1])
                    const isDomainResource = this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes(pArr[1])
                    if (isSystemResource) {
                      if (!this.$store.getters.isAdminMode) {
                        return {
                          validate: false,
                        }
                      }
                    }
                    if (isDomainResource) {
                      if (!this.$store.getters.isDomainMode && !this.$store.getters.isAdminMode) {
                        return {
                          validate: false,
                        }
                      }
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: '合并安全组',
                permission: 'secgroups_create',
                action: () => {
                  this.createDialog('ConcatSecgroupDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '合并安全组',
                    list: this.list,
                  })
                },
                meta: () => {
                  return {
                    validate: this.isPower(obj),
                  }
                },
              },
              {
                label: '删除',
                permission: 'secgroups_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除',
                    list: this.list,
                  })
                },
                meta: () => {
                  return {
                    validate: this.isPower(obj) && this.$getDeleteResult(obj).validate,
                    tooltip: !this.$getDeleteResult(obj).validate ? this.$getDeleteResult(obj).tooltip : '',
                  }
                },
              },
            ]
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  created () {
    this.initSidePageTab('secgroup-detail')
    this.list.fetchData()
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    async loadRules ({ row }) {
      let manager = new this.$Manager('secgrouprules')
      try {
        const response = await manager.list({
          params: {
            secgroup: row.id,
            scope: this.$store.getters.scope,
            limit: 0,
          },
        })
        row.rules = response.data.data || []
        return response
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
  },
}
</script>
