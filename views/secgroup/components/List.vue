<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import SecgroupDropList from './SecgroupDropList'
import {
  getProjectTableColumn,
  getNameDescriptionTableColumn,
  isPublicTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SecgroupList',
  mixins: [WindowsMixin],
  props: {
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
        resource: 'secgroups',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
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
          title: '规则预览(策略，CIDR，协议，端口)',
          width: 220,
          slots: {
            default: ({ row }, h) => {
              return [
                <SecgroupDropList objId={ row.id } />,
              ]
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
                label: '更改项目',
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
                permission: 'secgroups_create',
                action: () => {
                  this.createDialog('CloneSecgroupDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '克隆',
                    list: this.list,
                  })
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
                    validate: this.isPower,
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
                meta: () => this.$getDeleteResult(obj),
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
  },
}
</script>
