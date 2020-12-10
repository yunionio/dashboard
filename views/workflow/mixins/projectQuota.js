import { getIncrementFlag } from '../utils'
import { getRequestT } from '@/utils/utils'
import i18n from '@/locales'

export default {
  methods: {
    initProjectQuotaInfo (paramter) {
      const projectQuota = [
        {
          title: i18n.t('common_404'),
          items: [
            {
              field: 'cpu',
              title: 'CPU',
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_420', [paramter.cpu || 0, getIncrementFlag(paramter.cpu, row.projectQuota.cpu) || 0])
              },
            },
            {
              field: 'memory',
              title: i18n.t('common_236'),
              formatter: ({ cellValue, row }) => {
                const memory = Math.floor(paramter.memory / 1024) || 0
                return `${memory}GB(${getIncrementFlag(memory, Math.floor(row.projectQuota.memory / 1024)) || 0}GB)`
              },
            },
            {
              field: 'storage',
              title: i18n.t('common_237'),
              formatter: ({ cellValue, row }) => {
                const storage = Math.floor(paramter.storage / 1024) || 0
                return `${storage}GB(${getIncrementFlag(storage, Math.floor(row.projectQuota.storage / 1024)) || 0}GB)`
              },
            },
            {
              field: 'image',
              title: i18n.t('common_238'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.image || 0, getIncrementFlag(paramter.image, row.projectQuota.image) || 0])
              },
            },
            {
              field: 'port',
              title: i18n.t('common_240'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.port || 0, getIncrementFlag(paramter.port, row.projectQuota.port) || 0])
              },
            },
            {
              field: 'eport',
              title: i18n.t('common.eport'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.eport || 0, getIncrementFlag(paramter.eport, row.projectQuota.eport) || 0])
              },
            },
            {
              field: 'isolated_device',
              title: 'GPU',
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.isolated_device || 0, getIncrementFlag(paramter.isolated_device, row.projectQuota.isolated_device) || 0])
              },
            },
            {
              field: 'eip',
              title: i18n.t('common_241'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.eip || 0, getIncrementFlag(paramter.eip, row.projectQuota.eip) || 0])
              },
            },
            {
              field: 'snapshot',
              title: i18n.t('common_242'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.snapshot, getIncrementFlag(paramter.snapshot, row.projectQuota.snapshot) || 0])
              },
            },
            {
              field: 'instance_snapshot',
              title: i18n.t('common.text00023'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.instance_snapshot, getIncrementFlag(paramter.instance_snapshot, row.projectQuota.instance_snapshot) || 0])
              },
            },
            {
              field: 'bucket',
              title: i18n.t('common_243'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.bucket || 0, getIncrementFlag(paramter.bucket, row.projectQuota.bucket) || 0])
              },
            },
            {
              field: 'object_cnt',
              title: i18n.t('common_65'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.object_cnt, getIncrementFlag(paramter.object_cnt, row.projectQuota.object_cnt) || 0])
              },
            },
            {
              field: 'object_gb',
              title: i18n.t('common_244'),
              formatter: ({ cellValue, row }) => {
                const objectGb = Math.floor(paramter.object_gb / 1024) || 0
                return `${objectGb}GB(${getIncrementFlag(objectGb, Math.floor(row.projectQuota.object_gb / 1024)) || 0}GB)`
              },
            },
            {
              field: 'secgroup',
              title: i18n.t('common_245'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.secgroup || 0, getIncrementFlag(paramter.secgroup, row.projectQuota.secgroup) || 0])
              },
            },
            {
              field: 'rds',
              title: i18n.t('common_246'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.rds || 0, getIncrementFlag(paramter.rds, row.projectQuota.rds) || 0])
              },
            },
            {
              field: 'cache',
              title: i18n.t('common_247'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.cache || 0, getIncrementFlag(paramter.cache, row.projectQuota.cache) || 0])
              },
            },
            {
              field: 'loadbalancer',
              title: i18n.t('common_248'),
              formatter: ({ cellValue, row }) => {
                return i18n.t('common_421', [paramter.loadbalancer || 0, getIncrementFlag(paramter.loadbalancer, row.projectQuota.loadbalancer) || 0])
              },
            },
          ],
        },
        {
          title: this.$t('common_406', [i18n.t('dictionary.project')]),
          items: [
            {
              field: 'cpu',
              title: 'CPU',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.cpu || 0}${i18n.t('common_390')}(${i18n.t('common_407')}${row.projectQuota['usage.cpu'] || 0}${i18n.t('common_390')})`
              },
            },
            {
              field: 'memory',
              title: i18n.t('common_236'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.memory / 1024 || 0}GB(${i18n.t('common_407')}${row.projectQuota['usage.memory'] / 1024 || 0}GB)`
              },
            },
            {
              field: 'storage',
              title: i18n.t('common_237'),
              formatter: ({ cellValue, row }) => {
                return `${Math.floor(row.projectQuota.storage / 1024)}GB(${i18n.t('common_407')}${Math.floor(row.projectQuota['usage.storage'] / 1024 || 0)}GB)`
              },
            },
            {
              field: 'image',
              title: i18n.t('common_238'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.image || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.image'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'port',
              title: i18n.t('common_240'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.port || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.port'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'eport',
              title: i18n.t('common.eport'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.eport || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.eport'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'isolated_device',
              title: 'GPU',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.isolated_device || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.isolated_device'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'eip',
              title: i18n.t('common_241'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.eip || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.eip'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'snapshot',
              title: i18n.t('common_242'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.snapshot || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.snapshot'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'instance_snapshot',
              title: i18n.t('common.text00023'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.instance_snapshot || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.instance_snapshot'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'bucket',
              title: i18n.t('common_243'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.bucket || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.bucket'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'object_cnt',
              title: i18n.t('common_65'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.object_cnt || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.object_cnt'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'object_gb',
              title: i18n.t('common_244'),
              formatter: ({ cellValue, row }) => {
                return `${Math.floor(row.projectQuota.object_gb / 1024)}GB(${i18n.t('common_407')}${Math.floor(row.projectQuota['usage.object_gb'] / 1024 || 0)}GB)`
              },
            },
            {
              field: 'secgroup',
              title: i18n.t('common_245'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.secgroup || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.secgroup'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'rds',
              title: i18n.t('common_246'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.rds || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.rds'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'cache',
              title: i18n.t('common_246'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.cache || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.cache'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'loadbalancer',
              title: i18n.t('common_248'),
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.loadbalancer || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.projectQuota['usage.loadbalancer'] || 0}${i18n.t('common_411')})`
              },
            },
          ],
        },
      ]
      this.extraInfo.push(...projectQuota)
    },
    getProjectQuotaData (tenant) {
      if (this.detailsData.variables.project_source_quota) {
        this.detailsData.projectQuota = this.detailsData.variables.project_source_quota
      } else {
        new this.$Manager('process-instances', 'v1')
          .get({ id: 'quotas', params: { tenant, $t: getRequestT() } })
          .then((res) => {
            this.detailsData.projectQuota = res.data.project
          })
          .catch(() => {
            this.detailsData.projectQuota = {}
          })
      }
    },
    getProjectDomainQuotaData (domain) {
      if (this.detailsData.variables.domain_source_quota) {
        this.detailsData.projectDomainQuota = this.detailsData.variables.domain_source_quota
      } else {
        new this.$Manager('process-instances', 'v1')
          .get({ id: 'quotas', params: { domain, $t: getRequestT() } })
          .then((res) => {
            this.detailsData.projectDomainQuota = res.data.domain
          })
          .catch(() => {
            this.detailsData.projectDomainQuota = {}
          })
      }
    },
  },
}
