import { diff } from '../utils'
import { sizestr } from '@/utils/utils'

export default {
  methods: {
    initDomainQuotaInfo (paramter) {
      const domainQuota = [
        {
          title: '申请配额信息',
          items: [
            {
              field: 'cpu',
              title: 'CPU',
              formatter: ({ cellVal, row }) => {
                return `${paramter.cpu || 0}核（${diff(row.domainQuota.cpu, paramter.cpu, '核')}）`
              },
            },
            {
              field: 'memory',
              title: '内存',
              formatter: ({ cellVal, row }) => {
                return `${sizestr(paramter.memory || 0, 'M', 1024)}（${diff(row.domainQuota.memory, paramter.memory, 'sizestr')}）`
              },
            },
            {
              field: 'storage',
              title: '存储',
              formatter: ({ cellVal, row }) => {
                return `${sizestr(paramter.storage || 0, 'M', 1024)}（${diff(row.domainQuota.storage, paramter.storage, 'sizestr')}）`
              },
            },
            {
              field: 'image',
              title: '镜像',
              formatter: ({ cellVal, row }) => {
                return `${paramter.image || 0}（${diff(row.domainQuota.image, paramter.image)}）`
              },
            },
            {
              field: 'port',
              title: 'IP地址',
              formatter: ({ cellVal, row }) => {
                return `${paramter.port || 0}（${diff(row.domainQuota.port, paramter.port)}）`
              },
            },
            {
              field: 'isolated_device',
              title: 'GPU',
              formatter: ({ cellVal, row }) => {
                return `${paramter.isolated_device || 0}（${diff(row.domainQuota.isolated_device, paramter.isolated_device)}）`
              },
            },
            {
              field: 'eip',
              title: '弹性公网IP',
              formatter: ({ cellVal, row }) => {
                return `${paramter.eip || 0}（${diff(row.domainQuota.eip, paramter.eip)}）`
              },
            },
            {
              field: 'snapshot',
              title: '快照',
              formatter: ({ cellVal, row }) => {
                return `${paramter.snapshot || 0}（${diff(row.domainQuota.snapshot, paramter.snapshot)}）`
              },
            },
            {
              field: 'bucket',
              title: '桶',
              formatter: ({ cellVal, row }) => {
                return `${paramter.bucket || 0}（${diff(row.domainQuota.bucket, paramter.bucket)}）`
              },
            },
            {
              field: 'object_cnt',
              title: '对象数量',
              formatter: ({ cellVal, row }) => {
                return `${paramter.object_cnt || 0}（${diff(row.domainQuota.object_cnt, paramter.object_cnt)}）`
              },
            },
            {
              field: 'object_gb',
              title: '对象大小',
              formatter: ({ cellVal, row }) => {
                return `${sizestr(paramter.object_gb || 0, 'M', 1024)}（${diff(row.domainQuota.object_gb, paramter.object_gb, 'sizestr')}）`
              },
            },
            {
              field: 'secgroup',
              title: '安全组',
              formatter: ({ cellVal, row }) => {
                return `${paramter.secgroup || 0}（${diff(row.domainQuota.secgroup, paramter.secgroup)}）`
              },
            },
            {
              field: 'rds',
              title: 'RDS实例',
              formatter: ({ cellVal, row }) => {
                return `${paramter.rds || 0}（${diff(row.domainQuota.rds, paramter.rds)}）`
              },
            },
            {
              field: 'cache',
              title: 'Redis实例',
              formatter: ({ cellVal, row }) => {
                return `${paramter.cache || 0}（${diff(row.domainQuota.cache, paramter.cache)}）`
              },
            },
            {
              field: 'loadbalancer',
              title: '负载均衡',
              formatter: ({ cellVal, row }) => {
                return `${paramter.loadbalancer || 0}（${diff(row.domainQuota.loadbalancer, paramter.loadbalancer)}）`
              },
            },
            {
              field: 'cloudaccount',
              title: '云账号',
              formatter: ({ cellVal, row }) => {
                return `${paramter.cloudaccount || 0}（${diff(row.domainQuota.cloudaccount, paramter.cloudaccount)}）`
              },
            },
            {
              field: 'globalvpc',
              title: '全局VPC',
              formatter: ({ cellVal, row }) => {
                return `${paramter.globalvpc || 0}（${diff(row.domainQuota.globalvpc, paramter.globalvpc)}）`
              },
            },
            {
              field: 'group',
              title: '组',
              formatter: ({ cellVal, row }) => {
                return `${paramter.group || 0}（${diff(row.domainQuota.group, paramter.group)}）`
              },
            },
            {
              field: 'policy',
              title: '权限',
              formatter: ({ cellVal, row }) => {
                return `${paramter.policy || 0}（${diff(row.domainQuota.policy, paramter.policy)}）`
              },
            },
            {
              field: 'project',
              title: '项目',
              formatter: ({ cellVal, row }) => {
                return `${paramter.project || 0}（${diff(row.domainQuota.project, paramter.project)}）`
              },
            },
            {
              field: 'role',
              title: '角色',
              formatter: ({ cellVal, row }) => {
                return `${paramter.role || 0}（${diff(row.domainQuota.role, paramter.role)}）`
              },
            },
            {
              field: 'user',
              title: '用户',
              formatter: ({ cellVal, row }) => {
                return `${paramter.user || 0}（${diff(row.domainQuota.user, paramter.user)}）`
              },
            },
            {
              field: 'host',
              title: '宿主机',
              formatter: ({ cellVal, row }) => {
                return `${paramter.host || 0}（${diff(row.domainQuota.host, paramter.host)}）`
              },
            },
            {
              field: 'vpc',
              title: 'VPC',
              formatter: ({ cellVal, row }) => {
                return `${paramter.vpc || 0}（${diff(row.domainQuota.vpc, paramter.vpc)}）`
              },
            },
          ],
        },
        {
          title: `${this.$t('dictionary.domain')}配额使用情况`,
          items: [
            {
              field: 'cpu',
              title: 'CPU',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.cpu || 0}核（已使用${row.domainQuota['usage.cpu'] || 0}核）`
              },
            },
            {
              field: 'memory',
              title: '内存',
              formatter: ({ cellVal, row }) => {
                return `${sizestr(row.domainQuota.memory, 'M', 1024)}（已使用${sizestr(row.domainQuota['usage.memory'] || 0, 'M', 1024)}）`
              },
            },
            {
              field: 'storage',
              title: '存储',
              formatter: ({ cellVal, row }) => {
                return `${sizestr(row.domainQuota.storage, 'M', 1024)}（已使用${sizestr(row.domainQuota['usage.storage'] || 0, 'M', 1024)}）`
              },
            },
            {
              field: 'image',
              title: '镜像',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.image || 0}个（已使用${row.domainQuota['usage.image'] || 0}个）`
              },
            },
            {
              field: 'port',
              title: 'IP地址',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.port || 0}个（已使用${row.domainQuota['usage.port'] || 0}个）`
              },
            },
            {
              field: 'isolated_device',
              title: 'GPU',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.isolated_device || 0}个（已使用${row.domainQuota['usage.isolated_device'] || 0}个）`
              },
            },
            {
              field: 'eip',
              title: '弹性公网IP',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.eip || 0}个（已使用${row.domainQuota['usage.eip'] || 0}个）`
              },
            },
            {
              field: 'snapshot',
              title: '快照',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.snapshot || 0}个（已使用${row.domainQuota['usage.snapshot'] || 0}个）`
              },
            },
            {
              field: 'bucket',
              title: '桶',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.bucket || 0}个（已使用${row.domainQuota['usage.bucket'] || 0}个）`
              },
            },
            {
              field: 'object_cnt',
              title: '对象数量',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.object_cnt || 0}个（已使用${row.domainQuota['usage.object_cnt'] || 0}个）`
              },
            },
            {
              field: 'object_gb',
              title: '对象大小',
              formatter: ({ cellVal, row }) => {
                return `${sizestr(row.domainQuota.object_gb, 'M', 1024)}（已使用${sizestr(row.domainQuota['usage.object_gb'] || 0, 'M', 1024)}）`
              },
            },
            {
              field: 'secgroup',
              title: '安全组',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.secgroup || 0}个（已使用${row.domainQuota['usage.secgroup'] || 0}个）`
              },
            },
            {
              field: 'rds',
              title: 'RDS实例',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.rds || 0}个（已使用${row.domainQuota['usage.rds'] || 0}个）`
              },
            },
            {
              field: 'cache',
              title: 'Redis实例',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.cache || 0}个（已使用${row.domainQuota['usage.cache'] || 0}个）`
              },
            },
            {
              field: 'loadbalancer',
              title: '负载均衡',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.loadbalancer || 0}个（已使用${row.domainQuota['usage.loadbalancer'] || 0}个）`
              },
            },
            {
              field: 'cloudaccount',
              title: '云账号',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.cloudaccount || 0}个（已使用${row.domainQuota['usage.cloudaccount'] || 0}个）`
              },
            },
            {
              field: 'globalvpc',
              title: '全局VPC',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.globalvpc || 0}个（已使用${row.domainQuota['usage.globalvpc'] || 0}个）`
              },
            },
            {
              field: 'group',
              title: '组',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.group || 0}个（已使用${row.domainQuota['usage.group'] || 0}个）`
              },
            },
            {
              field: 'policy',
              title: '权限',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.policy || 0}个（已使用${row.domainQuota['usage.policy'] || 0}个）`
              },
            },
            {
              field: 'project',
              title: '项目',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.project || 0}个（已使用${row.domainQuota['usage.project'] || 0}个）`
              },
            },
            {
              field: 'role',
              title: '角色',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.role || 0}个（已使用${row.domainQuota['usage.role'] || 0}个）`
              },
            },
            {
              field: 'user',
              title: '用户',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.user || 0}个（已使用${row.domainQuota['usage.user'] || 0}个）`
              },
            },
            {
              field: 'host',
              title: '宿主机',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.host || 0}个（已使用${row.domainQuota['usage.host'] || 0}个）`
              },
            },
            {
              field: 'vpc',
              title: 'VPC',
              formatter: ({ cellVal, row }) => {
                return `${row.domainQuota.vpc || 0}个（已使用${row.domainQuota['usage.vpc'] || 0}个）`
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
