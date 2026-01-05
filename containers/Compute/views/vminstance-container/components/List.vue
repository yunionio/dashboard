<template>
  <page-list
    :fixed="true"
    show-tag-filter
    show-tag-columns
    show-tag-columns2
    show-tag-config
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions"
    :defaultSearchKey="defaultSearchKey"
    :refresh-method="handleListRefresh"
    :tag-config-params="tagConfigParams"
    :tableOverviewIndexs="tableOverviewIndexs"
    :show-single-actions="!isTemplate"
    :show-page="!isTemplate" />
</template>

<script>
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
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
  name: 'VmContainerInstanceList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
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
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: {
          status: Object.values(expectStatus.container).flat(),
        },
        filter,
        filterOptions,
        responseData: this.responseData,
        hiddenColumns: ['is_gpu', 'metadata', 'instance_type', 'os_type', 'vpc', 'host', 'account', 'created_at', 'macs', 'os_arch', 'vcpu_count', 'vmem_size', 'disk', 'power_states'],
        autoHiddenFilterKey: 'server_hidden_columns',
      }),
      groupActions: [
        // 新建
        {
          label: this.$t('compute.perform_create'),
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
        },
        // 开机
        {
          label: this.$t('compute.text_272'),
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
        },
        // 批量关机
        {
          label: this.$t('compute.text_273'),
          action: () => {
            this.createDialog('VmShutDownDialog', {
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
        },
        // 重启
        {
          label: this.$t('compute.text_274'),
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
        },
        // 同步状态
        {
          label: this.$t('compute.perform_sync_status'),
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
        },
        /* 批量操作 */
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              // 更改项目
              {
                label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                action: (obj) => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    resource: 'servers',
                  })
                },
              },
              // 到期释放
              {
                label: this.$t('compute.text_1132'),
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('compute.vminstance-container'),
                    alert: this.$t('compute.repo.helper.set_duration.alert'),
                  })
                },
                meta: () => {
                  const ret = { validate: true }
                  // 包年包月机器，不支持此操作
                  const isSomePrepaid = this.list.selectedItems.some((item) => {
                    return item.billing_type === 'prepaid'
                  })
                  if (isSomePrepaid) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.text_285')
                    return ret
                  }
                  // 暂只支持同时操作已设置到期或未设置到期释放的机器
                  const isSomeExpired = this.list.selectedItems.some((item) => {
                    return item.release_at
                  })
                  const isSomeNotExpired = this.list.selectedItems.some((item) => {
                    return !item.release_at
                  })
                  if (isSomeExpired && isSomeNotExpired) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.text_1133')
                    return ret
                  }
                  return ret
                },
              },
              // 编辑标签
              {
                label: this.$t('compute.text_283'),
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'server',
                    },
                    mode: 'add',
                  })
                },
                meta: () => {
                  const ret = { validate: true }
                  return ret
                },
              },
              // 推送配置
              {
                label: this.$t('compute.sync_config'),
                permission: 'server_perform_sync_config',
                action: () => {
                  this.createDialog('VmSyncConfigDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  const isAllRunningReady = this.list.selectedItems.every(item => (item.status === 'running' || item.status === 'ready'))
                  if (!isAllRunningReady) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.text_1126')
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_sync_config'),
              },
              // 设置删除保护
              disableDeleteAction(Object.assign(this, {}), {
                name: this.$t('compute.vminstance-container'),
              }),
              // 删除
              {
                label: this.$t('compute.perform_delete'),
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
      return true
    },
    exportDataOptions () {
      const ret = {
        isOpenExportUsernamePassword: false,
        downloadType: 'local',
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.external_id'), key: 'external_id' },
        ],
        fixedItems: [
          { key: 'metadata.os_distribution', label: this.$t('table.title.os') },
          { key: 'disk', label: this.$t('table.title.disk') + '(M)' },
          { key: 'vmem_size', label: this.$t('table.title.vmem_size') + '(M)' },
          { key: 'eip', title: this.$t('common.eip') },
          { key: 'ips', title: 'IP' },
          { key: 'is_gpu', title: `${this.$t('table.title.type')}(${this.$t('compute.text_113')}${this.$t('dictionary.server')})` },
        ],
        hiddenFields: ['os_dist', 'elastic_ip', 'ip'],
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
