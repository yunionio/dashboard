import { getIncrementFlag } from '@System/views/workflow/utils'
import { getRequestT } from '@/utils/utils'

export default {
  methods: {
    initProjectQuotaInfo (paramter) {
      const projectQuota = [
        {
          title: '申请配额信息',
          items: [
            {
              field: 'cpu',
              title: 'CPU',
              formatter: ({ cellValue, row }) => {
                return `${paramter.cpu || 0}核（${getIncrementFlag(paramter.cpu, row.projectQuota['cpu']) || 0}核）`
              },
            },
            {
              field: 'memory',
              title: '内存',
              formatter: ({ cellValue, row }) => {
                const memory = Math.floor(paramter.memory / 1024) || 0
                return `${memory}GB（${getIncrementFlag(memory, Math.floor(row.projectQuota['memory'] / 1024)) || 0}GB）`
              },
            },
            {
              field: 'storage',
              title: '存储',
              formatter: ({ cellValue, row }) => {
                const storage = Math.floor(paramter.storage / 1024) || 0
                return `${storage}GB（${getIncrementFlag(storage, Math.floor(row.projectQuota['storage'] / 1024)) || 0}GB）`
              },
            },
            {
              field: 'image',
              title: '镜像',
              formatter: ({ cellValue, row }) => {
                return `${paramter.image || 0}个（${getIncrementFlag(paramter.image, row.projectQuota['image']) || 0}个）`
              },
            },
            {
              field: 'port',
              title: 'IP地址',
              formatter: ({ cellValue, row }) => {
                return `${paramter.port || 0}个（${getIncrementFlag(paramter.port, row.projectQuota['port']) || 0}个）`
              },
            },
            {
              field: 'isolated_device',
              title: 'GPU',
              formatter: ({ cellValue, row }) => {
                return `${paramter.isolated_device || 0}个（${getIncrementFlag(paramter.isolated_device, row.projectQuota['isolated_device']) || 0}个）`
              },
            },
            {
              field: 'eip',
              title: '弹性公网IP',
              formatter: ({ cellValue, row }) => {
                return `${paramter.eip || 0}个（${getIncrementFlag(paramter.eip, row.projectQuota['eip']) || 0}个）`
              },
            },
            {
              field: 'snapshot',
              title: '快照',
              formatter: ({ cellValue, row }) => {
                return `${paramter.snapshot}个（${getIncrementFlag(paramter.snapshot, row.projectQuota['snapshot']) || 0}个）`
              },
            },
            {
              field: 'bucket',
              title: '桶',
              formatter: ({ cellValue, row }) => {
                return `${paramter.bucket || 0}个（${getIncrementFlag(paramter.bucket, row.projectQuota['bucket']) || 0}个）`
              },
            },
            {
              field: 'object_cnt',
              title: '对象数量',
              formatter: ({ cellValue, row }) => {
                return `${paramter.object_cnt}个（${getIncrementFlag(paramter.object_cnt, row.projectQuota['object_cnt']) || 0}个）`
              },
            },
            {
              field: 'object_gb',
              title: '对象大小',
              formatter: ({ cellValue, row }) => {
                const objectGb = Math.floor(paramter.object_gb / 1024) || 0
                return `${objectGb}GB（${getIncrementFlag(objectGb, Math.floor(row.projectQuota['object_gb'] / 1024)) || 0}GB）`
              },
            },
            {
              field: 'secgroup',
              title: '安全组',
              formatter: ({ cellValue, row }) => {
                return `${paramter.secgroup || 0}个（${getIncrementFlag(paramter.secgroup, row.projectQuota['secgroup']) || 0}个）`
              },
            },
            {
              field: 'rds',
              title: 'RDS实例',
              formatter: ({ cellValue, row }) => {
                return `${paramter.rds || 0}个（${getIncrementFlag(paramter.rds, row.projectQuota['rds']) || 0}个）`
              },
            },
            {
              field: 'cache',
              title: 'Redis实例',
              formatter: ({ cellValue, row }) => {
                return `${paramter.cache || 0}个（${getIncrementFlag(paramter.cache, row.projectQuota['cache']) || 0}个）`
              },
            },
            {
              field: 'loadbalancer',
              title: '负载均衡',
              formatter: ({ cellValue, row }) => {
                return `${paramter.loadbalancer || 0}个（${getIncrementFlag(paramter.loadbalancer, row.projectQuota['loadbalancer']) || 0}个）`
              },
            },
          ],
        },
        {
          title: `${this.$t('dictionary.project')}配额使用情况`,
          items: [
            {
              field: 'cpu',
              title: 'CPU',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.cpu || 0}核（已使用${row.projectQuota['usage.cpu'] || 0}核）`
              },
            },
            {
              field: 'memory',
              title: '内存',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.memory / 1024 || 0}GB（已使用${row.projectQuota['usage.memory'] / 1024 || 0}GB）`
              },
            },
            {
              field: 'storage',
              title: '存储',
              formatter: ({ cellValue, row }) => {
                return `${Math.floor(row.projectQuota.storage / 1024)}GB（已使用${Math.floor(row.projectQuota['usage.storage'] / 1024 || 0)}GB）`
              },
            },
            {
              field: 'image',
              title: '镜像',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.image || 0}个（已使用${row.projectQuota['usage.image'] || 0}个）`
              },
            },
            {
              field: 'port',
              title: 'IP地址',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.port || 0}个（已使用${row.projectQuota['usage.port'] || 0}个）`
              },
            },
            {
              field: 'isolated_device',
              title: 'GPU',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.isolated_device || 0}个（已使用${row.projectQuota['usage.isolated_device'] || 0}个）`
              },
            },
            {
              field: 'eip',
              title: '弹性公网IP',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.eip || 0}个（已使用${row.projectQuota['usage.eip'] || 0}个）`
              },
            },
            {
              field: 'snapshot',
              title: '快照',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.snapshot || 0}个（已使用${row.projectQuota['usage.snapshot'] || 0}个）`
              },
            },
            {
              field: 'bucket',
              title: '桶',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.bucket || 0}个（已使用${row.projectQuota['usage.bucket'] || 0}个）`
              },
            },
            {
              field: 'object_cnt',
              title: '对象数量',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.object_cnt || 0}个（已使用${row.projectQuota['usage.object_cnt'] || 0}个）`
              },
            },
            {
              field: 'object_gb',
              title: '对象大小',
              formatter: ({ cellValue, row }) => {
                return `${Math.floor(row.projectQuota.object_gb / 1024)}GB（已使用${Math.floor(row.projectQuota['usage.object_gb'] / 1024 || 0)}GB）`
              },
            },
            {
              field: 'secgroup',
              title: '安全组',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.secgroup || 0}个（已使用${row.projectQuota['usage.secgroup'] || 0}个）`
              },
            },
            {
              field: 'rds',
              title: 'RDS实例',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.rds || 0}个（已使用${row.projectQuota['usage.rds'] || 0}个）`
              },
            },
            {
              field: 'cache',
              title: 'Redis实例',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.cache || 0}个（已使用${row.projectQuota['usage.cache'] || 0}个）`
              },
            },
            {
              field: 'loadbalancer',
              title: '负载均衡',
              formatter: ({ cellValue, row }) => {
                return `${row.projectQuota.loadbalancer || 0}个（已使用${row.projectQuota['usage.loadbalancer'] || 0}个）`
              },
            },
          ],
        },
      ]
      this.extraInfo.push(...projectQuota)
    },
    getProjectQuotaData (tenant) {
      new this.$Manager('process-instances', 'v1')
        .get({ id: 'quotas', params: { tenant, $t: getRequestT() } })
        .then((res) => {
          this.detailsData.projectQuota = res.data.project
        })
        .catch(() => {
          this.detailsData.projectQuota = {}
        })
    },
    getProjectDomainQuotaData (domain) {
      new this.$Manager('process-instances', 'v1')
        .get({ id: 'quotas', params: { domain, $t: getRequestT() } })
        .then((res) => {
          this.detailsData.projectDomainQuota = res.data.domain
        })
        .catch(() => {
          this.detailsData.projectDomainQuota = {}
        })
    },
  },
}
