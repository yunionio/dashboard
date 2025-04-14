<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :extra-info="extraInfo"
    :base-info="baseInfo"
    :name-rules="[{ required: true, message: $t('compute.text_210') }]"
    status-module="server"
    resource="servers" />
</template>

<script>
import 'codemirror/theme/material.css'
import * as R from 'ramda'
import {
  getUserTagColumn,
  // getExtTagColumn,
} from '@/utils/common/detailColumn'
import { ALL_STORAGE, SERVER_TYPE, GPU_DEV_TYPE_OPTION_MAP } from '@Compute/constants/index'
import {
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getSwitchTableColumn,
  getBillingTypeTableColumn,
  getOsArch,
  getIpsTableColumn,
  getServerMonitorAgentInstallStatus,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { findPlatform } from '@/utils/common/hypervisor'
import { BRAND_MAP, HYPERVISORS_MAP } from '@/constants'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { sizestr, sizestrWithUnit } from '@/utils/utils'

export default {
  name: 'VmInstanceDetail',
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
        {
          field: 'hostname',
          title: this.$t('common_388'),
        },
        getOsArch(),
        getUserTagColumn({
          onManager: this.onManager,
          resource: 'server',
          columns: () => this.serverColumns,
          tipName: this.$t('dictionary.server'),
          editCheck: (row) => row.hypervisor !== 'bingocloud',
        }),
        // getExtTagColumn({ onManager: this.onManager, resource: 'server', columns: () => this.serverColumns, tipName: this.$t('dictionary.server') }),
        getServerMonitorAgentInstallStatus(),
        {
          field: 'keypair',
          title: this.$t('compute.text_33'),
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
      imageExist: false,
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        line: true,
        theme: 'material',
        mode: 'text/x-yaml',
        readOnly: true,
      },
      cmdline: '',
      showCmdline: false,
    }
  },
  computed: {
    isOpenStack () {
      const brand = this.data.brand
      return brand === BRAND_MAP.OpenStack.brand
    },
    isKvm () {
      const { brand } = this.data
      return brand === BRAND_MAP.OneCloud.brand
    },
    diskInfos () {
      const disksInfo = this.data.disks_info
      if (!disksInfo) return {}
      const dataDisk = {}
      const sysDisk = {}
      let image = '-'
      let imageId
      const sysDisks = disksInfo.filter(v => v.disk_type === 'sys')
      const dataDisks = disksInfo.filter(v => v.disk_type === 'data')
      if (sysDisks && sysDisks.length > 0) {
        const sysKey = sysDisks[0].storage_type
        image = sysDisks[0].image || '-'
        imageId = sysDisks[0].image_id
        sysDisk[sysKey] = this._dealSize(sysDisks)
        if (sysDisks[0].auto_reset) {
          sysDisk.auto_reset = true
        }
      }
      if (dataDisks && dataDisks.length > 0) {
        for (const k in ALL_STORAGE) {
          const e = ALL_STORAGE[k]
          let sameType = dataDisks.filter(v => v.storage_type === e.value)
          if (this.isOpenStack) {
            sameType = dataDisks.filter(v => v.storage_type.includes(e.value))
          }
          if (sameType && sameType.length) {
            dataDisk[k] = this._dealSize(sameType)
          }
        }
        if (dataDisks.some(v => v.auto_reset)) {
          dataDisk.auto_reset = true
        }
      }
      if (this.data.cdrom && dataDisks.length > 0) {
        image = dataDisks[0].image
        imageId = dataDisks[0].image_id
      }

      return {
        sysDisk: this._diskStringify(sysDisk),
        dataDisk: this._diskStringify(dataDisk),
        image,
        imageId,
      }
    },
    extraInfo () {
      const backupInfo = []
      if (this.data.backup_host_name) {
        backupInfo.push({
          title: this.$t('compute.backup_setting'),
          items: [
            {
              field: 'backup_host_name',
              title: this.$t('compute.text_1163'),
              slots: {
                default: ({ row }) => {
                  if (!row.backup_host_name) return '-'
                  return [
                    <side-page-trigger permission='hosts_get' name='HostSidePage' id={row.backup_host_id} vm={this}>{row.backup_host_name}</side-page-trigger>,
                  ]
                },
              },
              hidden: () => this.$store.getters.isProjectMode,
            },
            getStatusTableColumn({
              field: 'backup_host_status',
              title: this.$t('compute.backup_host_status'),
              statusModule: 'host',
              hidden: () => this.$store.getters.isProjectMode,
            }),
            {
              field: 'backup_guest_status',
              title: this.$t('compute.backup_status'),
              slots: {
                default: ({ row }) => {
                  return [
                    <div class='d-flex'>
                      <div class='text-truncate'>
                        <status status={row.backup_guest_status} statusModule={'server'} />
                      </div>
                      <div>
                        <a-button type='link' style="height: 14px" disabled={row.backup_guest_status !== 'ready'} onClick={this.startBackup}><icon type='start' style="transform:translateX(4px)" />{this.$t('compute.start_backup')}</a-button>
                      </div>
                    </div>,
                  ]
                },
              },
            },
            {
              field: 'backup_sync_status',
              title: this.$t('compute.backup_sync_status'),
              slots: {
                default: ({ row }) => {
                  return [
                    <div class='d-flex'>
                      <div class='text-truncate'>
                        <status status={row.backup_guest_sync_status} statusModule={'backup_sync'} />
                      </div>
                      <div>
                        <a-button type='link' style="height: 14px" disabled={row.backup_guest_sync_status !== 'ready'} onClick={this.switchBackup}><icon type='switch' style="transform:translateX(4px)" />{this.$t('compute.switch_backup')}</a-button>
                      </div>
                    </div>,
                  ]
                },
              },
            },
          ],
        })
      }
      const infos = [
        {
          title: this.$t('compute.text_368'),
          items: [
            {
              field: 'os_type',
              title: this.$t('compute.text_267'),
              formatter: ({ row }) => {
                const distribution = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type
                const { os_version: version = '' } = row.metadata || {}
                return distribution + (version === '-' ? '' : version)
              },
            },
            getIpsTableColumn({ field: 'ip', title: 'IP', vm: this }),
            getCopyWithContentTableColumn({
              field: 'macs',
              title: 'MAC',
              hideField: true,
              slotCallback: row => {
                return row.macs || '-'
              },
            }),
            getCopyWithContentTableColumn({
              field: 'image',
              title: this.$t('compute.text_97'),
              hideField: true,
              message: this.diskInfos.image,
              slotCallback: (row) => {
                if (!this.diskInfos.image || this.diskInfos.image === '-') return '-'
                if (!this.imageExist) return this.diskInfos.image
                return [
                  <side-page-trigger permission='images_get' name='SystemImageSidePage' id={this.diskInfos.imageId} vm={this}>{this.diskInfos.image}</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'host',
              title: this.$t('compute.text_111'),
              sortable: true,
              showOverflow: 'ellipsis',
              minWidth: 100,
              slots: {
                default: ({ row }) => {
                  if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public || row.hypervisor === HYPERVISORS_MAP.hcso.hypervisor) {
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
              hidden: () => this.$store.getters.isProjectMode,
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
              hidden: () => this.$store.getters.isProjectMode,
            }),
            {
              field: 'vcpu_count',
              title: 'CPU',
              formatter: ({ row }) => {
                return row.vcpu_count + this.$t('compute.text_167')
              },
            },
            {
              field: 'vmem_size',
              title: this.$t('compute.text_369'),
              formatter: ({ row }) => {
                return (row.vmem_size / 1024) + 'GB'
              },
            },
            {
              field: 'sysDisk',
              title: this.$t('compute.text_49'),
              formatter: ({ row }) => {
                if (!this.diskInfos.sysDisk) return '-'
                return <a onClick={() => this.$emit('tab-change', 'disk-list-for-vm-instance-sidepage')}>{this.diskInfos.sysDisk}</a>
              },
            },
            {
              field: 'dataDisk',
              title: this.$t('compute.text_50'),
              formatter: ({ row }) => {
                if (!this.diskInfos.dataDisk) return '-'
                return <a onClick={() => this.$emit('tab-change', 'disk-list-for-vm-instance-sidepage')}>{this.diskInfos.dataDisk}</a>
              },
            },
            (() => {
              function getCdromInfo (row) {
                if (!row.cdrom) return '-'
                let cdrom = `${row.cdrom}`
                if (Array.isArray(row.cdrom) && row.cdrom.length > 0) {
                  cdrom = row.cdrom[0].detail
                }
                const idx = cdrom.indexOf('(')
                return cdrom.substring(0, idx)
              }
              return getCopyWithContentTableColumn({
                field: 'cdrom',
                title: 'ISO',
                hideField: true,
                message: getCdromInfo,
                slotCallback: row => {
                  if (!row.cdrom) return '-'
                  let cdrom = `${row.cdrom}`
                  if (Array.isArray(row.cdrom) && row.cdrom.length > 0) {
                    cdrom = row.cdrom[0].detail
                  }
                  const idx = cdrom.indexOf('(')
                  const id = cdrom.substring(idx + 1, cdrom.indexOf('/'))
                  return [
                    <side-page-trigger permission='images_get' name='SystemImageSidePage' id={id} vm={this}>{cdrom.substring(0, idx) || '-'}</side-page-trigger>,
                  ]
                },
              })
            })(),
            {
              field: 'isolated_devices',
              title: 'GPU',
              formatter: ({ row }) => {
                if (!row.isolated_devices) return '-'
                const gpuArr = row.isolated_devices
                const obj = {}
                const ids = {}
                gpuArr.forEach(val => {
                  if (val.dev_type) {
                    if (!obj[val.model]) {
                      obj[val.model] = 1
                    } else {
                      obj[val.model] += 1
                    }
                    ids[val.model] = val.id
                  }
                })
                if (Object.keys(obj).length === 0) {
                  return '-'
                }
                return Object.keys(obj).map(k => {
                  const gpuLabel = `${GPU_DEV_TYPE_OPTION_MAP[gpuArr[0].dev_type]?.label}-${k}`
                  return <side-page-trigger permission='isolated_devices_get' name='GpuSidePage' id={ids[k]} vm={this}>{this.$t('compute.text_370', [obj[k], gpuLabel])}</side-page-trigger>
                })
              },
            },
            {
              field: 'isolated_devices',
              title: 'USB',
              formatter: ({ row }) => {
                if (!row.isolated_devices) return '-'
                const gpuArr = row.isolated_devices
                const obj = {}
                const ids = {}
                gpuArr.forEach(val => {
                  if (val.dev_type === 'USB') {
                    if (!obj[val.model]) {
                      obj[val.model] = 1
                    } else {
                      obj[val.model] += 1
                    }
                    ids[val.model] = val.id
                  }
                })
                if (Object.keys(obj).length === 0) {
                  return '-'
                }
                return Object.keys(obj).map(k => {
                  return <side-page-trigger permission='isolated_devices_get' name='GpuSidePage' id={ids[k]} vm={this}>{this.$t('compute.text_370', [obj[k], k])}</side-page-trigger>
                })
              },
            },
            {
              field: 'is_daemon',
              title: this.$t('compute.text_494'),
              formatter: ({ row }) => {
                if (row.is_daemon) {
                  return this.$t('table.title.on')
                } else {
                  return this.$t('table.title.off')
                }
              },
            },
            {
              field: 'bandwidth',
              title: this.$t('compute.max_bandwidth'),
              slots: {
                default: ({ row }) => {
                  return row.internet_max_bandwidth_out ? sizestrWithUnit(row.internet_max_bandwidth_out, 'M', 1024) + '/s' : '-'
                },
              },
            },
            {
              field: 'monitor_url',
              title: this.$t('compute.monitor_url.prompt'),
              formatter: ({ row }) => {
                return row.monitor_url
              },
            },
            {
              field: 'bios',
              title: this.$t('compute.bios'),
              formatter: ({ row }) => {
                return row.bios || 'BIOS'
              },
            },
          ],
        },
        {
          title: this.$t('compute.title.encryption'),
          items: [
            {
              field: 'encrypt_key_id',
              title: this.$t('compute.title.encryption_key'),
              formatter: ({ callValue, row }) => {
                if (row.encrypt_key_id) {
                  if (row.encrypt_key && row.encrypt_alg) {
                    return row.encrypt_key + ' (' + row.encrypt_key_id + ')'
                  } else {
                    return row.encrypt_key_id
                  }
                } else {
                  return this.$t('compute.no_encryption')
                }
              },
            },
            {
              field: 'encrypt_alg',
              title: this.$t('compute.title.encrypt_alg'),
              formatter: ({ callValue, row }) => {
                if (row.encrypt_alg) {
                  return row.encrypt_alg.toUpperCase()
                } else {
                  return '-'
                }
              },
            },
            {
              field: 'encrypt_key_user',
              title: this.$t('compute.title.encrypt_key_user'),
              formatter: ({ callValue, row }) => {
                if (row.encrypt_key_user) {
                  return row.encrypt_key_user + ' / ' + row.encrypt_key_user_domain
                } else {
                  return '-'
                }
              },
            },
          ],
        },
        ...backupInfo,
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
        },
      ]
      if (this.isKvm && this.cmdline) {
        infos[infos.length - 1].items.unshift({
          field: 'metadata',
          title: this.$t('compute.qemu_cmdline'),
          slots: {
            default: ({ row }, h) => {
              return [
                <a-button type="link" class="mb-2" style="height: 21px;padding:0" onclick={this.viewCmdline}>{this.showCmdline ? this.$t('table.title.off') : this.$t('compute.text_958')}</a-button>,
                <code-mirror style={this.showCmdline ? {} : { visibility: 'hidden', height: '0px' }} value={this.cmdline} view-height="300px" options={this.cmOptions} />]
            },
          },
        })
      }
      return infos
    },
  },
  watch: {
    diskInfos: {
      handler: 'checkImage',
      immediate: true,
    },
    'data.agent_status': {
      handler: function (val, oldval) {
        if (oldval === 'applying') {
          if (val === 'succeed' || val === 'failed') {
            this.baseInfo[3] = getServerMonitorAgentInstallStatus()
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },
  created () {
    this.initQemuInfo()
  },
  methods: {
    _diskStringify (diskObj) {
      let str = ''
      const storageArr = Object.values(ALL_STORAGE)
      for (const k in diskObj) {
        if (k === 'auto_reset') continue
        const num = diskObj[k]
        const disk = storageArr.find(v => v.value === k)
        if (disk) {
          str += `、${sizestr(num, 'M', 1024)}（${disk.label}${diskObj.auto_reset ? ' ' + this.$t('compute.shutdown_auto_reset') : ''}）`
        } else {
          str += `、${sizestr(num, 'M', 1024)}（${k}${diskObj.auto_reset ? ' ' + this.$t('compute.shutdown_auto_reset') : ''}）`
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
    checkImage () {
      new this.$Manager('images', 'v1')
        .list({ params: { id: this.diskInfos.imageId, scope: this.$store.getters.scope } })
        .then(({ data }) => {
          this.imageExist = !R.isEmpty(data.data)
        })
        .catch(() => {
          this.imageExist = false
        })
    },
    viewCmdline () {
      this.showCmdline = !this.showCmdline
    },
    async initQemuInfo () {
      try {
        if (this.isKvm) {
          const res = await this.onManager('getSpecific', {
            id: this.data.id,
            managerArgs: {
              spec: 'qemu-info',
            },
          })
          const { cmdline = '' } = res.data
          this.cmdline = cmdline
        }
      } catch (err) {
        console.error(err)
      }
    },
    switchBackup () {
      this.createDialog('VmSwitchBackup2Dialog', {
        data: [this.data],
        onManager: this.onManager,
        columns: this.serverColumns,
      })
    },
    startBackup () {
      this.createDialog('VmStartBackupDialog', {
        data: [this.data],
        onManager: this.onManager,
        columns: this.serverColumns,
      })
    },
  },
}
</script>
