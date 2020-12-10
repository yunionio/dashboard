import { diff } from '../utils'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'

export default {
  methods: {
    initDomainQuotaInfo (paramter) {
      const domainQuota = [
        {
          title: i18n.t('common_404'),
          items: [
            {
              field: 'cpu',
              title: 'CPU',
              formatter: ({ cellVal, row }) => {
                return `${paramter.cpu || 0}${i18n.t('common_390')}(${diff(row.domainQuota.cpu, paramter.cpu, i18n.t('common_390'))})`
              },
            },
            {
              field: 'memory',
              title: i18n.t('common_236'),
              formatter: ({ cellVal, row }) => {
                return `${sizestr(paramter.memory || 0, 'M', 1024)}(${diff(row.domainQuota.memory, paramter.memory, 'sizestr')})`
              },
            },
            {
              field: 'storage',
              title: i18n.t('common_237'),
              formatter: ({ cellVal, row }) => {
                return `${sizestr(paramter.storage || 0, 'M', 1024)}(${diff(row.domainQuota.storage, paramter.storage, 'sizestr')})`
              },
            },
            {
              field: 'image',
              title: i18n.t('common_238'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.image || 0}(${diff(row.domainQuota.image, paramter.image)})`
              },
            },
            {
              field: 'port',
              title: i18n.t('common_240'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.port || 0}(${diff(row.domainQuota.port, paramter.port)})`
              },
            },
            {
              field: 'eport',
              title: i18n.t('common.eport'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.eport || 0}(${diff(row.domainQuota.eport, paramter.eport)})`
              },
            },
            {
              field: 'isolated_device',
              title: 'GPU',
              formatter: ({ cellVal, row }) => {
                return `${paramter.isolated_device || 0}(${diff(row.domainQuota.isolated_device, paramter.isolated_device)})`
              },
            },
            {
              field: 'eip',
              title: i18n.t('common_241'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.eip || 0}(${diff(row.domainQuota.eip, paramter.eip)})`
              },
            },
            {
              field: 'snapshot',
              title: i18n.t('common_242'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.snapshot || 0}(${diff(row.domainQuota.snapshot, paramter.snapshot)})`
              },
            },
            {
              field: 'instance_snapshot',
              title: i18n.t('common.text00023'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.instance_snapshot || 0}(${diff(row.domainQuota.instance_snapshot, paramter.instance_snapshot)})`
              },
            },
            {
              field: 'bucket',
              title: i18n.t('common_243'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.bucket || 0}(${diff(row.domainQuota.bucket, paramter.bucket)})`
              },
            },
            {
              field: 'object_cnt',
              title: i18n.t('common_65'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.object_cnt || 0}(${diff(row.domainQuota.object_cnt, paramter.object_cnt)})`
              },
            },
            {
              field: 'object_gb',
              title: i18n.t('common_244'),
              formatter: ({ cellVal, row }) => {
                return `${sizestr(paramter.object_gb || 0, 'M', 1024)}(${diff(row.domainQuota.object_gb, paramter.object_gb, 'sizestr')})`
              },
            },
            {
              field: 'secgroup',
              title: i18n.t('common_245'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.secgroup || 0}(${diff(row.domainQuota.secgroup, paramter.secgroup)})`
              },
            },
            {
              field: 'rds',
              title: i18n.t('common_246'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.rds || 0}(${diff(row.domainQuota.rds, paramter.rds)})`
              },
            },
            {
              field: 'cache',
              title: i18n.t('common_247'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.cache || 0}(${diff(row.domainQuota.cache, paramter.cache)})`
              },
            },
            {
              field: 'loadbalancer',
              title: i18n.t('common_248'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.loadbalancer || 0}(${diff(row.domainQuota.loadbalancer, paramter.loadbalancer)})`
              },
            },
            {
              field: 'cloudaccount',
              title: i18n.t('common_295'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.cloudaccount || 0}(${diff(row.domainQuota.cloudaccount, paramter.cloudaccount)})`
              },
            },
            {
              field: 'globalvpc',
              title: i18n.t('common_307'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.globalvpc || 0}(${diff(row.domainQuota.globalvpc, paramter.globalvpc)})`
              },
            },
            {
              field: 'group',
              title: i18n.t('common_308'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.group || 0}(${diff(row.domainQuota.group, paramter.group)})`
              },
            },
            {
              field: 'policy',
              title: i18n.t('common_309'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.policy || 0}(${diff(row.domainQuota.policy, paramter.policy)})`
              },
            },
            {
              field: 'project',
              title: i18n.t('common_310'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.project || 0}(${diff(row.domainQuota.project, paramter.project)})`
              },
            },
            {
              field: 'role',
              title: i18n.t('common_311'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.role || 0}(${diff(row.domainQuota.role, paramter.role)})`
              },
            },
            {
              field: 'user',
              title: i18n.t('common_312'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.user || 0}(${diff(row.domainQuota.user, paramter.user)})`
              },
            },
            {
              field: 'host',
              title: i18n.t('common_305'),
              formatter: ({ cellVal, row }) => {
                return `${paramter.host || 0}(${diff(row.domainQuota.host, paramter.host)})`
              },
            },
            {
              field: 'vpc',
              title: 'VPC',
              formatter: ({ cellVal, row }) => {
                return `${paramter.vpc || 0}(${diff(row.domainQuota.vpc, paramter.vpc)})`
              },
            },
          ],
        },
        {
          title: this.$t('common_406', [this.$t('dictionary.domain')]),
          items: [
            {
              field: 'cpu',
              title: 'CPU',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.cpu || 0}${i18n.t('common_390')}(${i18n.t('common_407')}${row.domainQuota['usage.cpu'] || 0}${i18n.t('common_390')})`
              },
            },
            {
              field: 'memory',
              title: i18n.t('common_236'),
              formatter: ({ cellVal, row }) => {
                return `${sizestr(row.domainQuota.memory, 'M', 1024)}(${i18n.t('common_407')}${sizestr(row.domainQuota['usage.memory'] || 0, 'M', 1024)})`
              },
            },
            {
              field: 'storage',
              title: i18n.t('common_237'),
              formatter: ({ cellVal, row }) => {
                return `${sizestr(row.domainQuota.storage, 'M', 1024)}(${i18n.t('common_407')}${sizestr(row.domainQuota['usage.storage'] || 0, 'M', 1024)})`
              },
            },
            {
              field: 'image',
              title: i18n.t('common_238'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.image || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.image'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'port',
              title: i18n.t('common_240'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.port || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.port'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'eport',
              title: i18n.t('common.eport'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.eport || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.eport'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'isolated_device',
              title: 'GPU',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.isolated_device || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.isolated_device'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'eip',
              title: i18n.t('common_241'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.eip || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.eip'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'snapshot',
              title: i18n.t('common_242'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.snapshot || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.snapshot'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'instance_snapshot',
              title: i18n.t('common.text00023'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.instance_snapshot || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.instance_snapshot'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'bucket',
              title: i18n.t('common_243'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.bucket || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.bucket'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'object_cnt',
              title: i18n.t('common_65'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.object_cnt || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.object_cnt'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'object_gb',
              title: i18n.t('common_244'),
              formatter: ({ cellVal, row }) => {
                return `${sizestr(row.domainQuota.object_gb, 'M', 1024)}(${i18n.t('common_407')}${sizestr(row.domainQuota['usage.object_gb'] || 0, 'M', 1024)})`
              },
            },
            {
              field: 'secgroup',
              title: i18n.t('common_245'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.secgroup || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.secgroup'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'rds',
              title: i18n.t('common_246'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.rds || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.rds'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'cache',
              title: i18n.t('common_246'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.cache || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.cache'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'loadbalancer',
              title: i18n.t('common_248'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.loadbalancer || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.loadbalancer'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'cloudaccount',
              title: i18n.t('common_295'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.cloudaccount || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.cloudaccount'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'globalvpc',
              title: i18n.t('common_307'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.globalvpc || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.globalvpc'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'group',
              title: i18n.t('common_308'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.group || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.group'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'policy',
              title: i18n.t('common_309'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.policy || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.policy'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'project',
              title: i18n.t('common_310'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.project || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.project'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'role',
              title: i18n.t('common_311'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.role || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.role'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'user',
              title: i18n.t('common_312'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.user || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.user'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'host',
              title: i18n.t('common_305'),
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.host || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.host'] || 0}${i18n.t('common_411')})`
              },
            },
            {
              field: 'vpc',
              title: 'VPC',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.vpc || 0}${i18n.t('common_411')}(${i18n.t('common_407')}${row.domainQuota['usage.vpc'] || 0}${i18n.t('common_411')})`
              },
            },
          ],
        },
      ]
      this.extraInfo.push(...domainQuota)
    },
    getDomainQuotaData (domain) {
      if (this.detailsData.variables.domain_source_quota) {
        this.detailsData.domainQuota = this.detailsData.variables.domain_source_quota
      } else {
        new this.$Manager('process-instances', 'v1')
          .get({ id: 'quotas', params: { domain } })
          .then((res) => {
            this.detailsData.domainQuota = res.data.domain || {}
          })
          .catch(() => {
            this.detailsData.domainQuota = {}
          })
      }
    },
  },
}
