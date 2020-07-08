<template>
  <page-list
    show-tag-filter
    show-tag-columns
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
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
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import {
  getProjectTableColumn,
  getRegionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getCopyWithContentTableColumn,
  getIpsTableColumn,
  getNameDescriptionTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'ServerList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
    data: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
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
          tenant: getTenantFilter(),
          billing_type: {
            label: '计费方式',
            dropdown: true,
            items: [
              { label: '按量付费', key: 'postpaid' },
              { label: '包年包月', key: 'prepaid' },
            ],
          },
          account: getAccountFilter(),
          host: getHostFilter(),
          gpu: {
            label: '类型',
            dropdown: true,
            items: [
              { label: '通用云服务器', key: false },
              { label: 'GPU云服务器', key: true },
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
      singleActions: [
        {
          label: '解绑',
          permission: 'server_perform_assign_secgroup',
          action: (obj) => {
            this.createDialog('UnbindSecgroupDialog', {
              data: [obj],
              detailData: this.data,
              columns: this.columns,
              title: '解绑',
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: (obj) => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = ['running', 'ready'].includes(obj.status)
            return ret
          },
        },
      ],
      groupActions: [
        {
          label: `关联${this.$t('dictionary.server')}`,
          permission: 'server_perform_assign_secgroup',
          action: () => {
            this.createDialog('SetServerDialog', {
              data: [this.data],
              columns: this.columns,
              title: `关联${this.$t('dictionary.server')}`,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
        },
        {
          label: '解绑',
          permission: 'server_perform_assign_secgroup',
          action: () => {
            this.createDialog('UnbindSecgroupDialog', {
              data: this.list.selectedItems,
              detailData: this.data,
              columns: this.columns,
              title: '解绑',
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => ['running', 'ready'].includes(item.status))
            return ret
          },
        },
      ],
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
    this.initColumn()
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
    openVmSetDurationDialog (obj) {
      this.createDialog('VmSetDurationDialog', {
        data: [obj],
        columns: this.columns,
        onManager: this.onManager,
        refresh: this.refresh,
      })
    },
    initColumn () {
      this.columns = [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          addLock: true,
          addBackup: true,
          formRules: [
            { required: true, message: '请输入名称' },
            { validator: this.$validate('resourceCreateName') },
          ],
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'server', columns: () => this.columns }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'password',
          title: '密码',
          width: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
            },
          },
        },
        {
          field: 'secgroups',
          title: '安全组',
          width: 80,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue = [] }) => {
            return cellValue.map(item => item.name).join(',')
          },
        },
        {
          field: 'billing_type',
          title: '计费方式',
          width: 120,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              const ret = []
              if (row.billing_type === 'postpaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>按量付费</div>)
              } else if (row.billing_type === 'prepaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>包年包月</div>)
              }
              if (row.expired_at) {
                const time = this.$moment(row.expired_at).format()
                let tooltipCon = <div slot="help"></div>
                if (row.billing_type === 'postpaid') {
                  if (hasPermission({ key: 'server_perform_cancel_expire' })) {
                    tooltipCon = <div slot="help">虚拟机会在 { time } 释放，<span class="link-color" style="cursor: pointer" onClick={ () => this.openVmSetDurationDialog(row) }>去设置</span></div>
                  } else {
                    tooltipCon = <div slot="help">虚拟机会在 { time } 释放</div>
                  }
                } else if (row.billing_type === 'prepaid') {
                  if (row.auto_renew) {
                    tooltipCon = <div slot="help">虚拟机会在 { time } 释放，到期自动续费</div>
                  } else {
                    tooltipCon = <div slot="help">虚拟机会在 { time } 释放，到期不续费</div>
                  }
                }
                const help = <a-tooltip overlayStyle={{ zIndex: '999' }}>
                  <template slot="title">
                    { tooltipCon }
                  </template>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
                let dateArr = this.$moment(row.expired_at).fromNow().split(' ')
                let date = dateArr.join('')
                let seconds = this.$moment(row.expired_at).diff(new Date()) / 1000
                let textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
                let text = seconds < 0 ? '已过期' : `${date.substring(0, date.length - 1)}后到期`
                ret.push(<div style={{ color: textColor }}>{ text } { help }</div>)
              }
              return ret
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC' }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        getRegionTableColumn(),
      ]
    },
  },
}
</script>
