<template>
  <detail
    :on-manager="onManager"
    :data="detailData"
    :extra-info="extraInfo"
    :base-info="baseInfo"
    :name-rules="[{ required: true, message: $t('compute.text_210') }]"
    :columns="serverColumns"
    auto-hidden-columns-key="server_hidden_columns"
    status-module="container"
    resource="servers" />
</template>

<script>
import 'codemirror/theme/material.css'
import {
  ALL_STORAGE,
  SERVER_TYPE,
  GPU_DEV_TYPE_OPTION_MAP,
} from '@Compute/constants/index'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import {
  getUserTagColumn,
} from '@/utils/common/detailColumn'
import {
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getSwitchTableColumn,
  getBillingTypeTableColumn,
  getOsArch,
  getIpsTableColumn,
  getStatusTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { findPlatform } from '@/utils/common/hypervisor'
import { HYPERVISORS_MAP } from '@/constants'
import { sizestr } from '@/utils/utils'

export default {
  name: 'VmContainerInstanceDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    serverColumns: Array,
  },
  data () {
    return {
      baseInfo: [
        getStatusTableColumn({
          field: 'power_states',
          title: this.$t('compute.power_states'),
          statusModule: 'container',
        }),
        {
          field: 'project_domain',
          hiddenField: 'tenant',
          title: this.$t('dictionary.domain'),
          formatter: ({ row }) => {
            if (!row.domain_id) return '-'
            return <side-page-trigger permission="domains_get" name="DomainSidePage" id={row.domain_id} vm={this}>{row.project_domain}</side-page-trigger>
          },
        },
        {
          field: 'tenant',
          title: this.$t('dictionary.project'),
          formatter: ({ row }) => {
            if (!row.tenant_id) return '-'
            return <side-page-trigger permission="projects_get" name="ProjectSidePage" id={row.tenant_id} vm={this}>{row.tenant}</side-page-trigger>
          },
        },
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          field: 'hostname',
          hiddenField: 'name',
          title: this.$t('common_388'),
          label: this.$t('common_388'),
          showDesc: false,
          resource: 'servers',
          formRules: [{ required: true, message: this.$t('common.tips.input', [this.$t('common_388')]) }],
        }),
        getOsArch(),
        getUserTagColumn({
          onManager: this.onManager,
          resource: 'server',
          columns: () => this.serverColumns,
          tipName: this.$t('dictionary.server'),
          editCheck: (row) => row.hypervisor !== 'bingocloud',
        }),
        {
          field: 'containers',
          title: this.$t('compute.container', []),
          slots: {
            default: ({ row }) => {
              if (!row.containerTotal) return 0
              return [<a onClick={() => this.$emit('tab-change', 'container-list')}>{row.containerTotal}</a>]
            },
          },
        },
        {
          field: 'port_mapping',
          title: this.$t('compute.repo.port_mapping'),
          slots: {
            default: ({ row }) => {
              const colors = ['pink', 'red', 'orange', 'green', 'cyan', 'blue', 'purple']
              let port_mappings = []
              if (row.nics) {
                row.nics.forEach(item => {
                  if (item.port_mappings) {
                    port_mappings = port_mappings.concat(item.port_mappings)
                  }
                })
              }
              if (port_mappings.length > 0) {
                return port_mappings.map((item, idx) => {
                  const color = colors[idx % 7]
                  return <p>
                    <a-tag color={color}>
                      {this.$t('compute.repo.container_port')}: {item.port} = {this.$t('compute.repo.host_port')}: {item.host_port} {item.protocol.toUpperCase()}
                    </a-tag>
                  </p>
                })
              }
              return '-'
            },
          },
        },
        getBrandTableColumn(),
        getBillingTypeTableColumn(),
        {
          field: 'password',
          title: this.$t('table.title.init_keypair'),
          minWidth: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={row.id} resourceType='servers' />]
            },
          },
        },
      ],
      containerTotal: 0,
    }
  },
  computed: {
    detailData () {
      return {
        ...this.data,
        containerTotal: this.containerTotal,
      }
    },
    diskInfos () {
      const disksInfo = this.data.disks_info
      if (!disksInfo) return {}
      const dataDisk = {}
      const dataDisks = disksInfo.filter(v => v.disk_type === 'data')

      if (dataDisks && dataDisks.length > 0) {
        for (const k in ALL_STORAGE) {
          const e = ALL_STORAGE[k]
          const sameType = dataDisks.filter(v => v.storage_type === e.value)
          if (sameType && sameType.length) {
            dataDisk[k] = this._dealSize(sameType)
          }
        }
      }

      return {
        dataDisk: this._diskStringify(dataDisk),
      }
    },
    extraInfo () {
      const infos = [
        {
          title: this.$t('compute.text_368'),
          items: [
            getIpsTableColumn({ field: 'ip', title: 'IP', vm: this, hidden: () => this.$isScopedPolicyMenuHidden('server_hidden_columns.ips') }),
            getCopyWithContentTableColumn({
              field: 'macs',
              title: 'MAC',
              hideField: true,
              slotCallback: row => {
                return row.macs || '-'
              },
              hidden: () => this.$isScopedPolicyMenuHidden('server_hidden_columns.macs'),
            }),
            {
              field: 'host',
              title: this.$t('compute.text_111'),
              sortable: true,
              showOverflow: 'ellipsis',
              minWidth: 100,
              slots: {
                default: ({ row }) => {
                  if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public || row.hypervisor === HYPERVISORS_MAP.hcso.hypervisor || row.hypervisor === HYPERVISORS_MAP.hcs.hypervisor) {
                    return '-'
                  }
                  const text = row.host || '-'
                  return [
                    <list-body-cell-wrap copy hideField={true} field='host' row={row} message={text}>
                      <side-page-trigger permission='hosts_get' name='HostSidePage' id={row.host_id} vm={this}>{row.host}</side-page-trigger>
                    </list-body-cell-wrap>,
                  ]
                },
              },
              hidden: () => this.$store.getters.isProjectMode || this.$isScopedPolicyMenuHidden('server_hidden_columns.host'),
            },
            {
              field: 'secgroups',
              title: this.$t('compute.text_105'),
              slots: {
                default: ({ row }) => {
                  if (!row.secgroups) return '-'
                  return row.secgroups.map((item) => {
                    return <list-body-cell-wrap copy hideField={true} field='name' row={item} message={item.name}>
                      <side-page-trigger permission='secgroups_get' name='SecGroupSidePage' id={item.id} vm={this}>{item.name}</side-page-trigger>
                    </list-body-cell-wrap>
                  })
                },
              },
              hidden: () => this.$isScopedPolicyMenuHidden('server_hidden_columns.secgroups'),
            },
            getCopyWithContentTableColumn({
              field: 'vpc',
              title: 'VPC',
              hideField: true,
              slotCallback: row => {
                if (!row.vpc) return '-'
                return [
                  <side-page-trigger permission='vpcs_get' name='VpcSidePage' id={row.vpc_id} vm={this}>{row.vpc}</side-page-trigger>,
                ]
              },
              hidden: () => this.$store.getters.isProjectMode || this.$isScopedPolicyMenuHidden('server_hidden_columns.vpc'),
            }),
            {
              field: 'vcpu_count',
              title: 'CPU',
              formatter: ({ row }) => {
                if (row.hypervisor === HYPERVISORS_MAP.esxi.key && row.cpu_sockets) {
                  return `CPU: ${row.vcpu_count}${this.$t('compute.text_167')}（${this.$t('compute.slots_number')}：${row.cpu_sockets}）`
                }
                return row.vcpu_count + this.$t('compute.text_167')
              },
              hidden: () => this.$isScopedPolicyMenuHidden('server_hidden_columns.vcpu_count'),
            },
            {
              field: 'vmem_size',
              title: this.$t('compute.text_369'),
              formatter: ({ row }) => {
                return (row.vmem_size / 1024) + 'GB'
              },
              hidden: () => this.$isScopedPolicyMenuHidden('server_hidden_columns.vmem_size'),
            },
            {
              field: 'dataDisk',
              title: this.$t('compute.text_50'),
              formatter: ({ row }) => {
                if (!this.diskInfos.dataDisk) return '-'
                return <a onClick={() => this.$emit('tab-change', 'disk-list')}>{this.diskInfos.dataDisk}</a>
              },
              hidden: () => this.$isScopedPolicyMenuHidden('server_hidden_columns.disk'),
            },
            {
              field: 'isolated_devices',
              title: this.$t('compute.text_113'),
              formatter: ({ row }) => {
                if (!row.isolated_devices && !row.gpu_count) return '-'
                const gpuArr = row.isolated_devices || []
                const obj = {}
                const devTypeMap = {}
                const ids = {}
                gpuArr.forEach(val => {
                  if (val.dev_type !== 'USB') {
                    if (!obj[val.model]) {
                      obj[val.model] = 1
                    } else {
                      obj[val.model] += 1
                    }
                    ids[val.model] = val.id
                    devTypeMap[val.model] = val.dev_type
                  }
                })
                if (Object.keys(obj).length === 0) {
                  if (row.gpu_count && row.gpu_model) {
                    return this.$t('compute.text_370', [row.gpu_count, row.gpu_model])
                  } else {
                    return '-'
                  }
                }
                return Object.keys(obj).map(k => {
                  const gpuLabel = `${GPU_DEV_TYPE_OPTION_MAP[devTypeMap[k]]?.label || devTypeMap[k]}-${k}`
                  return <side-page-trigger permission='isolated_devices_get' name='GpuSidePage' id={ids[k]} vm={this}>{this.$t('compute.text_370', [obj[k], gpuLabel])}</side-page-trigger>
                })
              },
            },
            {
              field: 'monitor_url',
              title: this.$t('compute.monitor_url.prompt'),
              formatter: ({ row }) => {
                return row.monitor_url
              },
            },
          ],
        },
        {
          title: this.$t('compute.text_371'),
          items: [
            getSwitchTableColumn({
              field: 'disable_delete',
              title: this.$t('common.text00076'),
              change: val => {
                this.onManager('update', {
                  id: this.data.id,
                  managerArgs: {
                    data: { disable_delete: val },
                  },
                })
              },
            }),
          ],
          hidden: () => this.$isScopedPolicyMenuHidden('server_hidden_columns.perform_action'),
        },
      ]
      return infos
    },
  },
  created () {
    this.fetchContainers()
  },
  methods: {
    async fetchContainers () {
      try {
        const containerManager = new this.$Manager('containers')
        const res = await containerManager.list({
          params: {
            scope: this.$store.getters.scope,
            guest_id: this.data.id,
          },
        })
        this.containerTotal = res.data.total
      } catch (error) {
        this.containerTotal = 0
        throw error
      }
    },
    _diskStringify (diskObj) {
      let str = ''
      const storageArr = Object.values(ALL_STORAGE)

      for (const k in diskObj) {
        const num = diskObj[k]
        const disk = storageArr.find(v => v.value === k)
        if (disk) {
          str += `、${sizestr(num, 'M', 1024)}（${disk.label}）`
        } else {
          str += `、${sizestr(num, 'M', 1024)}（${k}）`
        }
      }
      return str.slice(1)
    },
    _dealSize (sameType) {
      const sameType1 = sameType.map(v => {
        const size = +v.size
        return size
      })
      return sameType1.reduce((a, b) => {
        return a + b
      })
    },
  },
}
</script>
