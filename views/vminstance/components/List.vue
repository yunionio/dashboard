<template>
  <page-list
    show-tag-filter
    show-tag-columns
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { cloudEnabled, cloudUnabledTip } from '../utils'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { SERVER_TYPE } from '@Compute/constants'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getBrandFilter,
  getStatusFilter,
  getTenantFilter,
  getAccountFilter,
  getIpFilter,
  getHostFilter,
} from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'VmInstanceList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
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
        refreshInterval: 5,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.server).flat(),
          checkBackup: (val) => {
            return val.metadata && (val.metadata.create_backup || val.metadata.switch_backup)
          },
        },
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter('compute_engine_brands'),
          ips: getIpFilter(),
          status: getStatusFilter('server'),
          os_type: {
            label: '系统类型',
            dropdown: true,
            multiple: true,
            items: [
              { label: 'Windows', key: 'windows' },
              { label: 'Linux', key: 'linux' },
              { label: 'VMware', key: 'VMWare' },
            ],
            filter: true,
            formatter: val => {
              return `os_type.in(${val})`
            },
          },
          projects: getTenantFilter(),
          billing_type: {
            label: '计费方式',
            dropdown: true,
            items: [
              { label: '按量付费', key: 'postpaid' },
              { label: '包年包月', key: 'prepaid' },
            ],
          },
          cloudaccount: getAccountFilter(),
          host: getHostFilter(),
          gpu: {
            label: '类型',
            dropdown: true,
            items: [
              { label: `通用${this.$t('dictionary.server')}`, key: false },
              { label: `GPU${this.$t('dictionary.server')}`, key: true },
            ],
          },
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '外部ID', key: 'external_id' },
          { label: '名称', key: 'name' },
          { label: '私网IP', key: 'ips' },
          { label: '外网IP', key: 'eip' },
          { label: 'CPU', key: 'vcpu_count' },
          { label: '内存(MB)', key: 'vmem_size' },
          { label: '磁盘(MB)', key: 'disk' },
          { label: '实例类型', key: 'instance_type' },
          { label: '操作系统', key: 'os_distribution' },
          { label: '状态', key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'hypervisor' },
          { label: '宿主机', key: 'host' },
          { label: '云账号', key: 'manager' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '计费方式', key: 'billing_type' },
          { label: '用户标签', key: 'user_tags' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'server_create',
          action: () => {
            this.$router.push({
              path: '/vminstance/create',
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
          label: '开机',
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
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => item.status === 'ready')
            return ret
          },
        },
        {
          label: '关机',
          permission: 'server_perform_stop',
          action: () => {
            this.createDialog('VmShutDownDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => item.status === 'running')
            return ret
          },
        },
        {
          label: '重启',
          permission: 'server_perform_restart',
          action: () => {
            this.createDialog('VmRestartDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => ['running', 'stop_fail'].includes(item.status))
            return ret
          },
        },
        {
          label: '批量操作',
          actions: () => {
            return [
              {
                label: '修改属性',
                action: () => {
                  this.createDialog('VmUpdateDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
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
                label: '重置密码',
                permission: 'server_perform_deploy',
                action: () => {
                  this.createDialog('VmResetPasswordDialog', {
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
                  const isBindKeypair = this.list.selectedItems.some((item) => { return item.keypair_id && item.keypair_id.toLowerCase() !== 'none' })
                  if (isBindKeypair) {
                    ret.validate = false
                    ret.tooltip = '已绑定密钥的云服务器无法重置密码'
                    return ret
                  }
                  return {
                    validate: cloudEnabled('resetPassword', this.list.selectedItems),
                    tooltip: cloudUnabledTip('resetPassword', this.list.selectedItems),
                  }
                },
              },
              {
                label: '调整配置',
                permission: 'server_perform_change_config',
                action: () => {
                  this.$router.push({
                    name: 'VMInstanceAdjustConfig',
                    query: {
                      id: this.list.selectedItems.map((item) => { return item.id }),
                    },
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (this.isSameHyper) {
                    const isSomePrepaid = this.list.selectedItems.some((item) => { return item.billing_type === 'prepaid' })
                    if (isSomePrepaid) {
                      ret.validate = false
                      ret.tooltip = this.isAdminMode ? '包年包月机器，不支持此操作' : '包年包月资源池的资源不支持此操作'
                      return ret
                    }
                    const isSomeBackupHost = this.list.selectedItems.some((item) => { return item.backup_host_id })
                    if (isSomeBackupHost) {
                      ret.validate = false
                      ret.tooltip = '高可用机器，不支持此操作'
                      return ret
                    }
                    ret.validate = cloudEnabled('adjustConfig', this.list.selectedItems)
                    ret.tooltip = cloudUnabledTip('adjustConfig', this.list.selectedItems)
                    // const googleItems = this.list.selectedItems.filter(val => val.brand === typeClouds.brandMap.Google.key)
                    // if (googleItems && googleItems.length) { // 谷歌云 windows 仅支持关机下操作，linux 支持 开关机
                    //   ret.validate = googleItems.every(val => {
                    //     const os = val.os_type.toLowerCase()
                    //     if (os.includes('windows')) {
                    //       return val.status === 'ready'
                    //     }
                    //     if (os.includes('linux')) {
                    //       return val.status === 'ready' || val.status === 'running'
                    //     }
                    //     return true
                    //   })
                    //   if (!ret.validate) {
                    //     ret.tooltip = '谷歌云Windows虚拟机仅支持关机下操作，Linux虚拟机支持开机和关机下操作'
                    //   }
                    // }
                    return ret
                  }
                  ret.validate = false
                  ret.tooltip = '请选择同一平台下的资源'
                  return ret
                },
              },
              {
                label: `更改${this.$t('dictionary.project')}`,
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.server'),
                    resource: 'servers',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (!this.isAdminMode && !this.isDomainMode) {
                    ret.validate = false
                    ret.tooltip = `仅系统或${this.$t('dictionary.domain')}管理员支持该操作`
                    return ret
                  }
                  const domains = this.list.selectedItems.map(item => item.domain_id)
                  if (R.uniq(domains).length !== 1) {
                    ret.validate = false
                    ret.tooltip = `请选择同一个${this.$t('dictionary.domain')}下的机器`
                    return ret
                  }
                  return ret
                },
              },
              {
                label: '同步状态',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
              },
              {
                label: '设置GPU卡',
                action: () => {
                  this.createDialog('VmAttachGpuDialog', {
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
                  const isAllReady = this.list.selectedItems.every((item) => { return item.status === 'ready' })
                  const isAllIdc = this.list.selectedItems.every((item) => {
                    return findPlatform(item.hypervisor, 'hypervisor') === SERVER_TYPE.idc
                  })
                  const isAllAdmin = this.list.selectedItems.every((item) => {
                    return this.isAdminMode
                  })
                  // 如果是 VMware提示不支持
                  const isSomeVMware = this.list.selectedItems.some((item) => {
                    return item.hypervisor === 'esxi'
                  })
                  if (!isAllAdmin) {
                    ret.validate = false
                    ret.tooltip = '暂只有系统管理员支持该操作'
                    return ret
                  }
                  if (!isAllReady) {
                    ret.validate = false
                    ret.tooltip = '请选择关机的机器进行操作'
                    return ret
                  }
                  if (!isAllIdc) {
                    ret.validate = false
                    ret.tooltip = '请选择本地IDC的机器进行操作'
                    return ret
                  }
                  if (isSomeVMware) {
                    ret.validate = false
                    ret.tooltip = 'VMware暂不支持该操作'
                    return ret
                  }
                  return ret
                },
              },
              {
                label: '关联安全组',
                permission: 'server_perform_add_secgroup',
                action: () => {
                  this.createDialog('VmSetSecgroupDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: cloudEnabled('assignSecgroup', this.list.selectedItems),
                    tooltip: cloudUnabledTip('assignSecgroup', this.list.selectedItems),
                  }
                  return ret
                },
              },
              {
                label: '编辑标签',
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
              },
              // {
              //   label: '加入资源池',
              //   action: () => {
              //     this.createDialog('VmJoinResourceDialog', {
              //       data: this.list.selectedItems,
              //       columns: this.columns,
              //       onManager: this.onManager,
              //     })
              //   },
              //   meta: () => {
              //     const ret = {
              //       validate: true,
              //       tooltip: null,
              //     }
              //     const isAllPublic = this.list.selectedItems.every(item => findPlatform(item.hypervisor) === SERVER_TYPE.public)
              //     const isAllPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
              //     if (!isAllPublic) {
              //       ret.validate = false
              //       ret.tooltip = '仅公有云支持此操作'
              //     }
              //     if (!isAllPrepaid) {
              //       ret.validate = false
              //       ret.tooltip = '仅包年包月的资源支持此操作'
              //     }
              //     return ret
              //   },
              // },
              {
                label: '续费',
                action: () => {
                  this.createDialog('VmResourceFeeDialog', {
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
                  const isAllPublic = this.list.selectedItems.every(item => findPlatform(item.hypervisor) === SERVER_TYPE.public)
                  const isAllPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                  if (!isAllPublic) {
                    ret.validate = false
                    ret.tooltip = '仅公有云支持此操作'
                  }
                  if (!isAllPrepaid) {
                    ret.validate = false
                    ret.tooltip = '仅包年包月的资源支持此操作'
                  }
                  return ret
                },
              },
              {
                label: '自动续费设置',
                action: () => {
                  this.createDialog('VmResourceRenewFeeDialog', {
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
                  const isAllPublic = this.list.selectedItems.every(item => findPlatform(item.hypervisor) === SERVER_TYPE.public)
                  const isAllPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                  if (!isAllPublic) {
                    ret.validate = false
                    ret.tooltip = '仅公有云支持此操作'
                  }
                  if (!isAllPrepaid) {
                    ret.validate = false
                    ret.tooltip = '仅包年包月的资源支持此操作'
                  }
                  return ret
                },
              },
              {
                label: '公网IP转EIP',
                action: () => {
                  this.createDialog('VmPublicIpToEipDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const isSomeBindEip = this.list.selectedItems.some((item) => { return item.eip && item.eip_mode === 'elastic_ip' })
                  const isAllBindPublicIp = this.list.selectedItems.every((item) => { return item.eip_mode === 'public_ip' })
                  if (isSomeBindEip) {
                    ret.tooltip = '已绑定弹性公网IP的虚拟机不支持该操作'
                    return ret
                  }
                  if (!isAllBindPublicIp) {
                    ret.tooltip = '只有已分配公网IP的虚拟机支持该操作'
                    return ret
                  }
                  ret.validate = cloudEnabled('publicIpToEip', this.list.selectedItems)
                  ret.tooltip = cloudUnabledTip('publicIpToEip', this.list.selectedItems)
                  return ret
                },
              },
              {
                label: '设置源/目标检查',
                action: () => {
                  this.createDialog('VmSourceTargetCheckDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = { validate: true, tooltip: null }
                  const isAllOneCloud = this.list.selectedItems.every((item) => { return item.hypervisor === typeClouds.hypervisorMap.kvm.key })
                  const isOk = this.list.selectedItems.every((item) => { return ['running', 'ready'].includes(item.status) })
                  if (!isAllOneCloud) {
                    ret.validate = false
                    ret.tooltip = '暂只有OneCloud平台支持该操作'
                    return ret
                  }
                  if (!isOk) {
                    ret.validate = false
                    ret.tooltip = '只有运行中或关机状态的主机支持此操作'
                    return ret
                  }
                  return ret
                },
              },
              {
                label: '迁移',
                action: () => {
                  this.createDialog('VmTransferDialog', {
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
                  let isOk = this.list.selectedItems.every((item) => {
                    return ['running', 'ready', 'unknown'].includes(item.status)
                  })
                  if (isOk) {
                    isOk = this.list.selectedItems.every((item) => {
                      if (item.backup_host_id) {
                        return false
                      }
                      if (item.status === 'running') {
                        return !item.is_gpu && !item.cdrom
                      }
                    })
                  }
                  if (!isOk) {
                    ret.validate = false
                    return ret
                  }
                  if (!this.isAdminMode) {
                    ret.validate = false
                    return ret
                  }
                  if (this.list.selectedItems.some(item => item.hypervisor !== 'kvm')) {
                    ret.validate = false
                    return ret
                  }
                  return ret
                },
              },
              {
                label: '挂起',
                permission: 'server_perform_suspend',
                action: () => {
                  this.createDialog('VmSuspendDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const isAllVMware = this.list.selectedItems.every(item => item.hypervisor === typeClouds.hypervisorMap.esxi.key)
                  const isAllRunning = this.list.selectedItems.every(item => item.status === 'running')
                  if (!isAllVMware) {
                    ret.validate = false
                    ret.tooltip = '仅VMware支持此操作'
                    return ret
                  }
                  if (!isAllRunning) {
                    ret.validate = false
                    ret.tooltip = '请选择开机的机器进行操作'
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
              },
              {
                label: '恢复',
                permission: 'server_perform_resume',
                action: () => {
                  this.createDialog('VmResumeDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const isAllVMware = this.list.selectedItems.every(item => item.hypervisor === typeClouds.hypervisorMap.esxi.key)
                  const isAllSuspend = this.list.selectedItems.every(item => item.status === 'suspend')
                  if (!isAllVMware) {
                    ret.validate = false
                    ret.tooltip = '仅VMware支持此操作'
                    return ret
                  }
                  if (!isAllSuspend) {
                    ret.validate = false
                    ret.tooltip = '请选择挂起的机器进行操作'
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
              },
              {
                label: '重装系统',
                permission: 'server_perform_rebuild_root',
                action: () => {
                  this.createDialog('VmRebuildRootDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  if (this.isSameHyper) {
                    ret.validate = cloudEnabled('rebuildRoot', this.list.selectedItems)
                    ret.tooltip = cloudUnabledTip('rebuildRoot', this.list.selectedItems)
                    return ret
                  }
                  ret.validate = false
                  ret.tooltip = '请选择同一平台下的资源'
                  return ret
                },
              },
              {
                label: '到期释放',
                permission: 'server_perform_cancel_expire',
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  // 包年包月机器，不支持此操作
                  const isSomePrepaid = this.list.selectedItems.some((item) => {
                    return item.billing_type === 'prepaid'
                  })
                  if (isSomePrepaid) {
                    ret.tooltip = '包年包月机器，不支持此操作'
                    return ret
                  }
                  // 暂只支持同时操作已设置到期或未设置到期释放的机器
                  const isSomeExpired = this.list.selectedItems.some((item) => {
                    return item.expired_at
                  })
                  const isSomeNotExpired = this.list.selectedItems.some((item) => {
                    return !item.expired_at
                  })
                  if (isSomeExpired && isSomeNotExpired) {
                    ret.tooltip = '暂只支持同时操作已设置到期释放'
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
              },
              disableDeleteAction(this, { name: this.$t('dictionary.server') }),
              {
                label: '删除',
                permission: 'server_delete',
                action: () => {
                  this.createDialog('DeleteVmDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    title: '删除',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (this.list.selectedItems.some(item => !item.can_delete)) {
                    ret.validate = false
                    return ret
                  }
                  return ret
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
      execLoading: false,
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
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('vm-instance-detail')
    this.list.fetchData()
    this.$bus.$on('VMInstanceListSingleUpdate', args => {
      this.list.singleUpdate(...args)
    }, this)
    this.$bus.$on('VMInstanceListSingleRefresh', args => {
      this.list.singleRefresh(...args)
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        filter: 'hypervisor.notin(baremetal,container)',
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'VmInstanceSidePage', {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
