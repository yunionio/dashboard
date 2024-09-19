<template>
  <page-list
    :fixed="true"
    show-tag-filter
    show-tag-columns
    show-tag-columns2
    show-tag-config
    :list="list"
    :columns="columns"
    :show-single-actions="showActions"
    :show-group-actions="showGroupActions && showActions"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :before-show-menu="beforeShowMenu"
    :refresh-method="handleListRefresh"
    :tag-config-params="tagConfigParams"
    :tableOverviewIndexs="tableOverviewIndexs" />
</template>

<script>
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import ResStatusFilterMixin from '@/mixins/resStatusFilterMixin'
import {
  getNameFilter,
  getBrandFilter,
  getStatusFilter,
  getDomainFilter,
  getTenantFilter,
  getHostFilter,
  getVpcFilter,
  getOsArchFilter,
  getRegionFilter,
  getZoneFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import { getIpsTableColumn } from '@/utils/common/tableColumn'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { typeClouds } from '@/utils/common/hypervisor'
import GlobalSearchMixin from '@/mixins/globalSearch'
import regexp from '@/utils/regexp'
import { Manager } from '@/utils/manager'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'VMContainerInstanceList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResStatusFilterMixin],
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
    hiddenFilterOptions: {
      type: Array,
      default: () => ([]),
    },
    tableOverviewIndexs: {
      type: Array,
    },
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    const filter = {}
    if (this.$route.query.id) {
      filter.id = [this.$route.query.id]
    }

    const filterOptions = {
      external_id: {
        label: this.$t('table.title.external_id'),
      },
      id: {
        label: this.$t('table.title.id'),
      },
      name: getNameFilter(),
      description: getDescriptionFilter(),
      brand: getBrandFilter('compute_engine_brands'),
      ip_addr: {
        label: 'IP',
        hiddenField: 'ips',
      },
      status: getStatusFilter('server'),
      power_states: getStatusFilter({ title: this.$t('compute.power_states'), statusModule: 'server', field: 'power_states' }),
      projects: getTenantFilter(),
      project_domains: getDomainFilter(),
      billing_type: {
        label: this.$t('table.title.bill_type'),
        dropdown: true,
        items: [
          { label: this.$t('billingType.postpaid'), key: 'postpaid' },
          { label: this.$t('billingType.prepaid'), key: 'prepaid' },
        ],
      },
      host: getHostFilter(),
      region: getRegionFilter(),
      zone_ids: getZoneFilter(),
      vpc: getVpcFilter(),
      os_arch: getOsArchFilter(),
      vcpu_count: {
        label: 'CPU',
      },
      created_at: getCreatedAtFilter(),
    }
    this.hiddenFilterOptions.forEach(key => {
      delete filterOptions[key]
    })
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.container).flat(),
        },
        filter,
        filterOptions,
        responseData: this.responseData,
        hiddenColumns: ['is_gpu', 'metadata', 'instance_type', 'os_type', 'vpc', 'host', 'account', 'created_at', 'macs', 'os_arch', 'vcpu_count', 'vmem_size', 'disk', 'power_states'],
        autoHiddenFilterKey: 'server_hidden_columns',
        fetchDataCb: (res) => {
          const { totals = {} } = res.data
          this.$emit('resStatisticsChange', totals)
        },
      }),
      groupActions: [
        // 新建
        {
          label: this.$t('compute.perform_create'),
          permission: 'server_create',
          action: () => {
            this.$openNewWindowForMenuHook('vminstance_configured_callback_address.create_callback_address', () => {
              this.$router.push({
                path: '/vminstance-container/create',
                query: {
                  type: this.cloudEnv === 'onpremise' ? 'idc' : this.cloudEnv || 'idc',
                },
              })
            })
          },
          meta: () => {
            const ret = {
              buttonType: 'primary',
              validate: !this.cloudEnvEmpty,
              tooltip: this.cloudEnvEmpty ? this.$t('common.no_platform_available') : '',
            }
            if (ret.validate && !this.hasContainerHost) {
              ret.validate = false
              ret.tooltip = this.$t('compute.no_enabled_container_host')
            }
            return ret
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_create') || this.hiddenActions.includes('create'),
        },
        // 开机
        {
          label: this.$t('compute.text_272'),
          permission: 'server_perform_start',
          action: () => {
            const ids = this.list.selectedItems.map(item => item.id)
            this.list.onManager('batchPerformAction', {
              steadyStatus: 'running',
              id: ids,
              managerArgs: {
                action: 'start',
              },
            })
          },
          meta: () => {
            const ret = { validate: true, tooltip: null }
            if (this.list.selectedItems.length === 0) {
              ret.validate = false
              return ret
            }
            const isStatusOk = this.list.selectedItems.every(item => ['ready'].includes(item.status))
            if (!isStatusOk) {
              ret.validate = false
              return ret
            }
            return ret
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
        },
        // 关机
        {
          label: this.$t('compute.text_273'),
          permission: 'server_perform_stop',
          action: () => {
            this.createDialog('VmContainerShutDownDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = { validate: true, tooltip: null }
            if (this.list.selectedItems.length === 0) {
              ret.validate = false
              return ret
            }
            const isStatusOk = this.list.selectedItems.every(item => ['running'].includes(item.status))
            if (!isStatusOk) {
              ret.validate = false
              return ret
            }
            return ret
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_stop'),
        },
        // 重启
        {
          label: this.$t('compute.text_274'),
          permission: 'server_perform_restart',
          action: () => {
            this.createDialog('VmContainerRestartDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = { validate: true, tooltip: null }
            if (this.list.selectedItems.length === 0) {
              ret.validate = false
              return ret
            }
            const isStatusOk = this.list.selectedItems.every(item => ['running'].includes(item.status))
            if (!isStatusOk) {
              ret.validate = false
              return ret
            }
            return ret
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_restart'),
        },
        // 同步状态
        {
          label: this.$t('compute.perform_sync_status'),
          permission: 'server_perform_syncstatus',
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['running', 'ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
          hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_syncstatus'),
        },
        /* 批量操作 */
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              // 设置删除保护
              disableDeleteAction(Object.assign(this, {
                permission: 'server_update',
              }), {
                name: this.$t('compute.vminstance-container'),
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_set_delete_protection'),
              }),
              // 删除
              {
                label: this.$t('compute.perform_delete'),
                permission: 'server_delete',
                action: () => {
                  this.createDialog('DeleteVmContainerDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    title: this.$t('compute.perform_delete'),
                  })
                },
                meta: () => {
                  return this.$getDeleteResult(this.list.selectedItems)
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_delete'),
              },
            ]
          },
          meta: () => {
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems)
            return ret
          },
        },
      ],
      execLoading: false,
      tagConfigParams: {
        title: this.$t('common.text00124'),
        resource: 'servers',
        queryTreeId: 'project-tag-value-tree',
      },
      hasContainerHost: false,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    isSameHyper () {
      if (this.list.selectedItems.length > 0) {
        const arr = this.list.selectedItems.map(v => v.hypervisor)
        const noRepeatArr = Array.from(new Set(arr))
        return noRepeatArr.length === 1
      }
      return true
    },
    isSameArch () {
      if (this.list.selectedItems[0] && (this.list.selectedItems[0].hypervisor.toLowerCase() === 'hcso' || this.list.selectedItems[0].hypervisor.toLowerCase() === 'hcs')) {
        const instancetype = this.list.selectedItems[0].instance_type || ''
        const isArm = instancetype.startsWith('k')
        return this.list.selectedItems.every(item => item.instance_type && item.instance_type.startsWith('k') === isArm)
      }
      return true
    },
    showActions () {
      return !this.$isScopedPolicyMenuHidden('server_hidden_columns.perform_action')
    },
    exportDataOptions () {
      const ret = {
        isOpenExportUsernamePassword: false,
        downloadType: 'local',
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.external_id'), key: 'external_id' },
        ],
        async beforeExport () {
          const checkOpenExportUsernamePassword = async () => {
            try {
              const configM = new Manager('services', 'v1')
              const servicesRes = await configM.list({ params: { type: 'compute_v2' } })
              const serviceId = servicesRes.data.data?.[0]?.id
              const configData = await configM.getSpecific({ id: serviceId, spec: 'config' })
              const { enable_export_username_password = false } = configData.data?.config?.default
              ret.isOpenExportUsernamePassword = enable_export_username_password
              return enable_export_username_password
            } catch (error) {
              console.log('fetch compute_v2 service config error!!!')
            }
          }

          const isOpenExportUsernamePassword = await checkOpenExportUsernamePassword()
          ret.isOpenExportUsernamePassword = isOpenExportUsernamePassword

          ret.items.forEach(item => {
            if (item.field === 'extra_user') {
              item.hidden = !isOpenExportUsernamePassword
            }
            if (item.field === 'extra_password') {
              item.hidden = !isOpenExportUsernamePassword
            }
          })
        },
        async callback (data, selectedExportKeys) {
          if (!ret.isOpenExportUsernamePassword) {
            return data
          }
          if (!selectedExportKeys.includes('extra_user') && !selectedExportKeys.includes('extra_password')) {
            return data
          }

          const manager = new Manager('servers')
          const allPromise = data.map(async item => {
            let username = ''
            let password = ''

            try {
              const { data } = await manager.objectRpc({
                methodname: 'GetLoginInfo',
                objId: item.id,
              })
              username = data.username
              password = data.password
            } catch (error) {
              console.log(`server: ${item.id}, login info fetch error!!!`)
            }

            return Promise.resolve({ id: item.id, username, password })
          })

          const results = Promise.all(allPromise).then(values => {
            const realData = data.map(item => {
              const curObj = values.find(v => v.id === item.id)
              return {
                ...item,
                extra_user: curObj.username,
                extra_password: curObj.password,
              }
            })
            return realData
          })
          return results
        },
      }

      this.columns.map(col => {
        if (col.field === 'ips') {
          ret.items.push(getIpsTableColumn({ field: 'elastic_ip', title: this.$t('common.eip'), vm: this, onlyElastic: true }))
          ret.items.push(getIpsTableColumn({ field: 'ip', title: 'IP', vm: this, noElastic: true }))
        } else if (!(col.hidden && col.hidden()) && col.field !== 'password') {
          ret.items.push({
            field: col.field,
            title: col.title || col.label,
            formatter: col.formatter,
          })
        } else if (col.field === 'password') {
          ret.items.push({ field: 'extra_user', title: this.$t('compute.text_566') })
          ret.items.push({ field: 'extra_password', title: this.$t('common_328') })
        }

        if (col.field === 'region') {
          ret.items.push({ field: 'zone', title: this.$t('compute.text_270') })
        }
      })
      return ret
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
    this.fetchHost()
    this.initSidePageTab('detail')
    this.list.fetchData().then(() => {
      this.$nextTick(() => {
        if (this.$route.query.id && this.list.data[this.$route.query.id]) {
          this.handleOpenSidepage(this.list.data[this.$route.query.id].data)
        }
      })
    })
    this.$bus.$on('VMInstanceListSingleUpdate', args => {
      this.list.singleUpdate(...args)
    }, this)
    this.$bus.$on('VMInstanceListSingleRefresh', args => {
      this.list.singleRefresh(...args)
    }, this)
  },
  methods: {
    fetchHost () {
      try {
        new this.$Manager('hosts').list({
          params: {
            limit: 1,
            enabled: true,
            host_type: 'container',
          },
        }).then(res => {
          const list = res.data?.data || []
          this.hasContainerHost = list.length > 0
        })
      } catch (err) { }
    },
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        filter: 'hypervisor.in(pod)',
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'VmContainerInstanceSidePage', {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
      }, {
        list: this.list,
        tab,
      })
    },
    beforeShowMenu () {
      return this.$store.dispatch('scopedPolicy/get', {
        category: ['vminstance_hidden_menus', 'vminstance_configured_callback_address'],
      })
    },
    defaultSearchKey (search) {
      if (regexp.isIPv4(search)) {
        return 'ip_addr'
      }
    },
    handleListRefresh () {
      this.list.refresh()
      // 新建按钮无法点击时，刷新云资源情况
      this.cloudEnvEmpty && this.$store.dispatch('auth/getCapabilities')
    },
    hasSomeCloud (selectItems, clouds = [typeClouds.hypervisorMap.bingocloud.key]) {
      const ret = { validate: true, tooltip: '' }
      const hasList = selectItems.filter(item => clouds.includes(item.hypervisor))
      if (hasList && hasList[0]) {
        ret.validate = false
        ret.tooltip = this.$t('compute.text_473', [typeClouds.hypervisorMap[hasList[0].hypervisor].label])
      }
      return ret
    },
  },
}
</script>
