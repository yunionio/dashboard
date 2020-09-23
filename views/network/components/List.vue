<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :singleActions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows.js'
import { getBrandFilter, getAccountFilter, getTenantFilter } from '@/utils/common/tableFilter'
import ListMixin from '@/mixins/list'
import GlobalSearchMixin from '@/mixins/globalSearch'
import expectStatus from '@/constants/expectStatus'
// import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'NetworkList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    showSearchbox: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    const brandFilter = getBrandFilter('network_manage_brands')
    if (!R.find(R.propEq('key', 'OneCloud'))(brandFilter.items)) {
      brandFilter.items.push({ key: 'OneCloud', label: 'OneCloud' })
    }
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'networks',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.network).flat(),
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          ip: {
            label: 'IP',
            distinctField: {
              type: 'extra_field',
              key: 'ip',
            },
          },
          status: {
            label: '状态',
            dropdown: true,
            items: [
              { label: '初始化', key: 'init' },
              { label: '正在创建', key: 'pending' },
              { label: '正常', key: 'available' },
              { label: '异常', key: 'failed' },
              { label: '开始删除', key: 'start_delete' },
              { label: '正在删除', key: 'deleting' },
              { label: '已删除', key: 'deleted' },
              { label: '删除失败', key: 'delete_failed' },
              { label: '未知', key: 'unknown' },
            ],
            filter: true,
            formatter: val => {
              return `status.in(${val})`
            },
          },
          server_type: {
            label: '类型',
            dropdown: true,
            items: [
              { label: '物理机', key: 'baremetal' },
              { label: '容器', key: 'container' },
              { label: '虚拟机', key: 'guest' },
              { label: 'PXE', key: 'pxe' },
              { label: 'IPMI', key: 'ipmi' },
            ],
          },
          brand: brandFilter,
          cloudaccount: getAccountFilter(),
          projects: getTenantFilter(),
          region: {
            label: '区域',
          },
          vpc: {
            label: 'VPC',
          },
          wire: {
            label: '二层网络',
            // filter: true,
            // formatter: val => {
            //   return `wire.contains("${val}")`
            // },
          },
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '开始IP', key: 'guest_ip_start' },
          { label: '结束IP', key: 'guest_ip_end' },
          { label: '类型', key: 'server_type' },
          { label: '状态', key: 'status' },
          { label: '使用情况', key: 'ports' },
          { label: '平台', key: 'brand' },
          { label: '二层网络', key: 'wire' },
          { label: 'VLAN', key: 'vlan_id' },
          { label: 'VPC', key: 'vpc' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '云账号', key: 'account' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'networks_create',
          action: () => {
            this.$router.push(`${this.$route.path}/create`)
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: '修改属性',
                permission: 'networks_update',
                action: () => {
                  this.$router.push({ path: '/network/batch-edit', query: { id: this.list.selectedItems.map((item) => { return item.id }) } })
                },
                meta: (row) => {
                  const isOneCloud = this.list.selectedItems.every(item => item.brand === 'OneCloud')
                  return {
                    validate: isOneCloud,
                    tooltip: !isOneCloud && '只有OneCloud主机支持此操作',
                  }
                },
              },
              {
                label: `更改${this.$t('dictionary.project')}`,
                permission: 'networks_perform_change_owner',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    name: this.$t('dictionary.network'),
                    onManager: this.onManager,
                    resource: 'networks',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: '',
                  }
                  if (this.isProjectMode) {
                    ret.tooltip = `仅系统或${this.$t('dictionary.domain')}管理员支持该操作`
                    return ret
                  }
                  const f = this.eachValidates((obj) => {
                    return this.isPower(obj)
                  })
                  return {
                    validate: f,
                  }
                },
              },
              // getSetPublicAction(this, {
              //   name: this.$t('dictionary.network'),
              //   scope: 'project',
              //   resource: 'networks',
              // }),
              // {
              //   label: '设置共享',
              //   permission: 'networks_perform_public',
              //   action: () => {
              //     this.createDialog('SetPublicDialog', {
              //       data: this.list.selectedItems,
              //       columns: this.columns,
              //       onManager: this.onManager,
              //     })
              //   },
              //   meta: () => {
              //     const f = this.eachValidates((obj) => {
              //       return this.isPower(obj)
              //     })
              //     return {
              //       validate: f,
              //     }
              //   },
              // },
              // {
              //   label: '分割IP子网',
              //   permission: 'networks_perform_split',
              //   action: () => {
              //     this.createDialog('NetworkSplitDialog', {
              //       data: this.list.selectedItems,
              //       columns: this.columns,
              //       list: this.list,
              //     })
              //   },
              //   meta: () => {
              //     const f = this.eachValidates((obj) => {
              //       if (this.isPower(obj)) {
              //         if (obj.external_id && obj.external_id.length > 0) { // 是公网 IP
              //           return false
              //         } else {
              //           return true
              //         }
              //       }
              //     })
              //     return {
              //       validate: f,
              //       tooltip: '公网IP不支持该操作',
              //     }
              //   },
              // },
              {
                label: '合并IP子网',
                permission: 'networks_perform_merge',
                action: () => {
                  this.createDialog('NetworkConcatDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    itemData: {
                      IPfrom: this.IPfromObj.IPfrom,
                      nameFrom: this.IPfromObj.name,
                      IPto: this.IPtoObj.IPto,
                      nameTo: this.IPtoObj.name,
                    },
                  })
                },
                meta: () => {
                  let tooltip = ''
                  if (this.list.selectedItems.length === 2) {
                    if (this.list.selectedItems.every(v => v.external_id && v.external_id.length > 0)) { // 是公网 IP
                      tooltip = '公网 IP 不支持该操作'
                    } else {
                      if (!this.link(this.list.selectedItems)) {
                        tooltip = '请选择规范的两个IP子网'
                      }
                    }
                  } else {
                    tooltip = '请选择两个IP子网'
                  }
                  return {
                    validate: this.allowConcat,
                    tooltip,
                  }
                },
              },
              {
                label: '同步状态',
                permission: 'networks_perform_syncstatus',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
                meta: () => {
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    return {
                      validate: false,
                      tooltip: '权限不足',
                    }
                  }
                  if (this.list.selectedItems.some(v => v.brand.toLowerCase() === 'onecloud')) {
                    return {
                      validate: false,
                      tooltip: '选中项中不能包含本地IDC资源',
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: '删除',
                permission: 'networks_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    name: this.$t('dictionary.network'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selected.length,
            }
          },
        },
      ],
      IPfromObj: { IPfrom: '', name: '' },
      IPtoObj: { IPto: '', name: '' },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
    allowConcat () {
      if (this.list.selectedItems.length === 2) {
        if (this.list.selectedItems.every(v => v.external_id && v.external_id.length > 0)) { // 是公网 IP
          return false
        }
        return this.link(this.list.selectedItems)
      }
      return false
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
    this.initSidePageTab('network-detail')
    this.list.fetchData()
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
    eachValidates (callback) {
      let f = true
      if (this.list.selectedItems && this.list.selectedItems.length > 0) {
        for (let i = 0; i < this.list.selectedItems.length; i++) {
          const item = this.list.selectedItems[i]
          if (callback && !callback(item)) {
            f = false
            break
          }
        }
      } else {
        f = false
      }
      return f
    },
    _border (first, second) {
      const firstArr = first.split('.')
      const secondArr = second.split('.')
      const firstNum = Number(firstArr[firstArr.length - 1])
      const secondNum = Number(secondArr[secondArr.length - 1])
      const diff = firstNum - secondNum
      return Math.abs(diff) === 1
    },
    _comparePre (first, second) {
      const firstArr = first.split('.')
      const secondArr = second.split('.')
      firstArr.pop()
      secondArr.pop()
      return firstArr.join('') === secondArr.join('')
    },
    link ([first, second]) {
      const start = 'guest_ip_start'
      const end = 'guest_ip_end'
      if (this._border(first[end], second[start]) && this._comparePre(first[end], second[start])) {
        this.IPfromObj = {
          IPfrom: first[start],
          name: first.name,
        }
        this.IPtoObj = {
          IPto: second[end],
          name: second.name,
        }
        return true
      } else if (this._border(second[end], first[start]) && this._comparePre(second[end], first[start])) {
        this.IPfromObj = {
          IPfrom: second[start],
          name: second.name,
        }
        this.IPtoObj = {
          IPto: first[end],
          name: first.name,
        }
        return true
      } else {
        return false
      }
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'NetworkSidePage', {
        id: row.id,
        resource: 'networks',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
