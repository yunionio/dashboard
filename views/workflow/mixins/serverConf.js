import { getServerConf } from '../utils'
import { ALL_STORAGE } from '@Compute/constants'
import { HYPERVISORS_MAP } from '@/constants'
import BrandIcon from '@/sections/BrandIcon'
import i18n from '@/locales'

export default {
  methods: {
    async getApplyMachineData () {
      try {
        const serverParam = JSON.parse(this.data.variables['server-create-paramter'] || this.data.variables.paramter || '{}')
        const skuInfo = await this.getSkuInfo(serverParam.sku)
        this.detailsData.skuInfo = skuInfo.data.data[0] || {}
        const regionInfo = await this.getRegionInfo(serverParam.prefer_region)
        this.detailsData.regionInfo = regionInfo.data || {}
        if (serverParam.prefer_zone) {
          const zoneInfo = await this.getZoneInfo(serverParam.prefer_zone)
          this.detailsData.zoneInfo = zoneInfo.data || {}
        }
      } catch (error) {
        this.$notification.error({
          message: i18n.t('common_426'),
          description:
            i18n.t('common_427'),
        })
        this.loaded = true
        throw error
      }
    },
    initServerInfo () {
      const serverInfo = [
        {
          title: i18n.t('common_385'),
          items: [
            {
              field: 'name',
              title: i18n.t('common_186'),
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                return serverConf.generate_name
              },
            },
            {
              field: 'region',
              title: i18n.t('common_282'),
              formatter: ({ cellValue, row }) => {
                if (row.zoneInfo && row.zoneInfo.name) {
                  return `${row.regionInfo && row.regionInfo.name} ${row.zoneInfo && row.zoneInfo.name}`
                }
                return row.regionInfo && row.regionInfo.name
              },
            },
            {
              field: 'hypervisor',
              title: i18n.t('common_283'),
              slots: {
                default: ({ row }, h) => {
                  const serverConf = getServerConf(row)
                  const brand = HYPERVISORS_MAP[serverConf.hypervisor] && HYPERVISORS_MAP[serverConf.hypervisor].brand
                  if (!brand) return '-'
                  return [
                    <BrandIcon name={ brand } />,
                  ]
                },
              },
            },
            {
              field: 'config',
              title: i18n.t('common_428'),
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                const cpu = serverConf.vcpu_count || (row.skuInfo && row.skuInfo.cpu_core_count)
                const memory = serverConf.vmem_size || (row.skuInfo && row.skuInfo.memory_size_mb)
                return (cpu || '-') + i18n.t('common_429') + ((memory / 1024) || '-') + 'GB'
              },
            },
            {
              field: 'count',
              title: i18n.t('common_430'),
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                return serverConf.__count__ + i18n.t('common_431')
              },
            },
            {
              field: 'sysdisks',
              title: i18n.t('common_432'),
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                return this.getDiskInfo(row, serverConf).sysDisk || '-'
              },
            },
            {
              field: 'disks',
              title: i18n.t('common_433'),
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                return this.getDiskInfo(row, serverConf).dataDisk || '-'
              },
            },
            {
              field: 'cdrom',
              title: 'ISO',
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                const cdrom = serverConf.cdrom
                if (!cdrom) return '-'
                const idx = cdrom.indexOf('(')
                return cdrom.substring(0, idx)
              },
            },
            {
              field: 'isolated_devices',
              title: 'GPU',
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                if (!serverConf.isolated_devices) return '-'
                const gpuArr = serverConf.isolated_devices
                const gpu = {}
                gpuArr.forEach((item) => {
                  if (!gpu[`${item.vendor}/${item.model}`]) {
                    gpu[`${item.vendor}/${item.model}`] = 1
                  } else {
                    gpu[`${item.vendor}/${item.model}`] += 1
                  }
                })
                let str = ''
                for (const k in gpu) {
                  const n = gpu[k]
                  str += i18n.t('common_434', [n, k])
                }
                return str.slice(1)
              },
            },
            {
              field: 'project',
              title: i18n.t('table.title.owner_project'),
              formatter: ({ cellValue, row }) => {
                const v = this.variables
                const domain = v.project_domain
                const project = v.project_name || v.project
                if (!project) return '-'
                return `${domain}/${project}`
              },
            },
            {
              field: 'duration',
              title: i18n.t('common_435'),
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                const durationUnit = {
                  h: i18n.t('common_11'),
                  w: i18n.t('common_417'),
                  d: i18n.t('common_12'),
                  m: i18n.t('common_13'),
                  y: i18n.t('common_14'),
                }
                if (serverConf.duration) {
                  const duration = parseInt(serverConf.duration)
                  const unit = serverConf.duration.substr(-1)
                  return i18n.t('common_436', [duration, durationUnit[unit.toLowerCase()]])
                }
                return '-'
              },
            },
          ],
        },
      ]
      this.extraInfo.push(...serverInfo)
    },
    getSkuInfo (name) {
      const params = { name: name, limit: 1 }
      if (this.allPublic[this.data.hypervisor]) {
        params.public_cloud = true
      }
      return new this.$Manager('serverskus').list({ params })
    },
    getRegionInfo (region) {
      return new this.$Manager('cloudregions').get({ id: region })
    },
    getZoneInfo (zone) {
      return new this.$Manager('zones').get({ id: zone })
    },
    getProcessInstance (pid) {
      return new this.$Manager('historic-process-instances', 'v1').get({ id: pid })
    },
    getServerInfo (serverIds) {
      if (!Array.isArray(serverIds)) {
        serverIds = [serverIds]
      }
      return new this.$Manager('servers').list({ filter: `id.in(${serverIds.join(',')})` })
    },
    initDeleteServeInfo (variables) {
      let servers = JSON.parse(variables.parameter)
      if (servers.length === 0) {
        this.fetchServerInfo(variables.ids || [])
          .then((res) => {
            servers = res.data
            this.deleteServers = servers
          })
      } else {
        this.deleteServers = servers
      }
    },
    getDiskInfo (row, serverConf) {
      const sdiks = serverConf.disks
      if (!sdiks) return {}
      const dataDisk = {}
      const sysDisk = {}
      let image = '-'
      const sysDisks = sdiks.filter(v => v.disk_type === 'sys')
      const dataDisks = sdiks.filter(v => v.disk_type !== 'sys')
      if (sysDisks && sysDisks.length > 0) {
        const sysKey = sysDisks[0].backend || 'local'
        image = sysDisks[0].image || sysDisks[0].image_id || '-'
        sysDisk[sysKey] = this._dealSize(sysDisks)
      }
      if (dataDisks && dataDisks.length > 0) {
        const NEW_ALL_STORAGE = { ...ALL_STORAGE }
        dataDisks.forEach((item) => {
          if (!ALL_STORAGE[item.backend]) {
            NEW_ALL_STORAGE[item.backend] = {
              label: item.backend,
              max: 500,
              min: 1,
              sysMax: 500,
              sysMin: 10,
              value: item.backend,
            }
          }
        })
        for (const k in NEW_ALL_STORAGE) {
          const e = NEW_ALL_STORAGE[k] || { key: k, value: k }
          const sameType = dataDisks.filter(v => (v.backend || 'local') === e.value)
          if (sameType && sameType.length) {
            dataDisk[k] = this._dealSize(sameType)
          }
        }
      }
      if (serverConf.cdrom && dataDisks.length > 0) {
        image = dataDisks[0].image
      }
      return {
        sysDisk: this._diskStringify(sysDisk) || '-',
        dataDisk: this._diskStringify(dataDisk) || '-',
        image,
      }
    },
    _diskStringify (diskObj) {
      let str = ''
      const storageArr = Object.values(ALL_STORAGE)
      for (const k in diskObj) {
        const num = diskObj[k]
        const disk = storageArr.find(v => v.value === k)
        if (disk) {
          str += `、${parseInt(num / 1024)}GB（${disk.label}）`
        } else {
          str += `、${parseInt(num / 1024)}GB（${k}）`
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
