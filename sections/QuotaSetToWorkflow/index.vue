<template>
  <a-table bordered :dataSource="quotaOptions" :columns="quotaOptionsColumns" :pagination="false">
    <template slot="remaining" slot-scope="text" v-if="l3PermissionEnable">
      {{ text }}
    </template>
    <template slot="val" slot-scope="text, record">
      <a-tooltip>
        <template slot="title">
          {{ `${$t('common_235')}：${record.min || 0} ~ ${record.max === Infinity ? $t('common_216') : record.max}` }}
        </template>
        <a-input-number
          class="input-number"
          :controls="false"
          v-model="quota[record.key]"
          :min="record.min"
          :max="record.max"
          @change="changeHandle(quota, record.key)" />
      </a-tooltip>
    </template>
  </a-table>
</template>

<script>
import { mapGetters } from 'vuex'
import { initQuota } from '@/utils/quota'

export default {
  name: 'QuotaSetToWorkflow',
  props: {
    domain: {
      type: String,
    },
    tenant: {
      type: String,
    },
    sence: {
      type: String,
    },
  },
  data () {
    return {
      tenantDomainQuota: {},
      quota: initQuota(this.sence),
      quotaOptions: [
        {
          key: 'cpu',
          label: 'CPU',
          max: 0,
          step: 10,
          unit: this.$t('common_60'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'memory',
          label: this.$t('common_236'),
          max: 0,
          step: 1024,
          unit: 'GB',
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'storage',
          label: this.$t('common_237'),
          max: 0,
          step: 10,
          unit: 'GB',
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'image',
          label: this.$t('common_238'),
          max: 0,
          step: 5,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'count',
          label: this.$t('common_239'),
          max: 0,
          step: 5,
          unit: this.$t('common_62'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'port',
          label: this.$t('common_240'),
          max: 0,
          step: 10,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'isolated_device',
          label: 'GPU',
          max: 0,
          step: 10,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'eip',
          label: this.$t('common_241'),
          max: 0,
          step: 1,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'snapshot',
          label: this.$t('common_242'),
          max: 0,
          step: 1,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'bucket',
          label: this.$t('common_243'),
          max: 0,
          step: 1,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'object_gb',
          label: this.$t('common_244'),
          max: 0,
          step: 10,
          unit: 'GB',
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'object_cnt',
          label: this.$t('common_65'),
          max: 0,
          step: 1,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        // 项目配额
        {
          key: 'secgroup',
          label: this.$t('common_245'),
          max: 0,
          step: 1,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        // 区域配额
        {
          key: 'rds',
          label: this.$t('common_246'),
          max: 0,
          step: 1,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'cache',
          label: this.$t('common_247'),
          max: 0,
          step: 1,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
        {
          key: 'loadbalancer',
          label: this.$t('common_248'),
          max: 0,
          step: 1,
          unit: this.$t('common_61'),
          originQuota: 0,
          remaining: 0,
        },
      ],
      remainingQuota: [],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'l3PermissionEnable', 'scope', 'userInfo']),
    quotaOptionsColumns () {
      const quotaCols = [
        {
          title: this.$t('common_186'),
          dataIndex: 'label',
        },
        // {
        //   title: `${this.$t('dictionary.domain')}剩余可分配配额`,
        //   dataIndex: 'remaining',
        //   scopedSlots: { customRender: 'remaining' },
        // },
        {
          title: this.$t('common_249'),
          dataIndex: 'val',
          scopedSlots: { customRender: 'val' },
        },
        {
          title: this.$t('common_250'),
          dataIndex: 'unit',
        },
      ]
      return quotaCols
    },
    isProject () {
      return this.sence === 'project'
    },
    isDomain () {
      return this.sence === 'domain'
    },
  },
  watch: {
    tenant (tenantId) {
      this.fetchTenantQuota(tenantId)
    },
    domain (domainId) {
      this.fetchDomainQuota(domainId)
    },
  },
  created () {
    if (this.isProject) {
      this.fetchTenantQuota(this.tenant)
    }
    if (this.isDomain) {
      this.fetchDomainQuota(this.domain)
    }
  },
  methods: {
    async fetchTenantQuota (tenant) {
      try {
        const quotaList = ['project_quotas', 'image_quotas', 'region_quotas', 'quotas']
        const params = { tenant: tenant }
        const datas = quotaList.map((quota) => {
          return new this.$Manager(quota).rpc({ methodname: 'GetQuota', params })
        })
        const quotaDataList = await Promise.all(datas)
        const quotaData = {}
        quotaDataList.forEach(res => {
          const quota = res.data.data[0] || {}
          Object.assign(quotaData, quota)
        })
        for (let i = 0, len = this.quotaOptions.length; i < len; i++) {
          const key = this.quotaOptions[i].key
          let total = quotaData[key] || 0
          let usage = quotaData[`usage.${key}`] || 0
          if (key === 'memory') {
            total = total / 1024
            usage = usage / 1024
          }
          if (key === 'storage') {
            total = total / 1024
            usage = usage / 1024
          }
          quotaData[`usage.${key}`] = usage
          quotaData[`${key}`] = total
          const remaining = total - usage
          this.quotaOptions[i].min = usage
          this.quotaOptions[i].max = Infinity
          this.quotaOptions[i].remaining = parseInt(remaining) || 0
          this.quotaOptions[i].originQuota = total
        }
        this.quota = quotaData
      } catch (error) {
        this.$message.error(this.$t('common_251'))
        throw error
      }
    },
    async fetchDomainQuota (domain) {
      try {
        const quotaList = ['project_quotas', 'image_quotas', 'region_quotas', 'quotas', 'domain_quotas', 'identity_quotas', 'infras_quotas']
        const params = { domain: domain }
        const datas = quotaList.map((quota) => {
          return new this.$Manager(quota).rpc({ methodname: 'GetQuota', params })
        })
        const quotaDataList = await Promise.all(datas)
        const quotaData = {}
        quotaDataList.forEach(res => {
          const quota = res.data.data[0] || {}
          Object.assign(quotaData, quota)
        })
        for (let i = 0, len = this.quotaOptions.length; i < len; i++) {
          const key = this.quotaOptions[i].key
          let total = quotaData[key] || 0
          let usage = quotaData[`usage.${key}`] || 0
          if (key === 'memory') {
            total = total / 1024
            usage = usage / 1024
          }
          if (key === 'storage') {
            total = total / 1024
            usage = usage / 1024
          }
          quotaData[`usage.${key}`] = usage
          quotaData[`${key}`] = total
          const remaining = total - usage
          this.quotaOptions[i].min = usage
          this.quotaOptions[i].max = Infinity
          this.quotaOptions[i].remaining = parseInt(remaining) || 0
          this.quotaOptions[i].originQuota = total
        }
        this.quota = quotaData
      } catch (error) {
        this.$message.error(this.$t('common_251'))
        throw error
      }
    },
    changeHandle (obj, key) {
      if (!obj[key]) {
        obj[key] = 0
      }
    },
    getParams () {
      const params = {}
      params.cpu = this.quota.cpu
      params.memory = this.quota.memory * 1024
      params.storage = this.quota.storage * 1024
      params.image = this.quota.image
      params.port = this.quota.port
      params.count = this.quota.count
      params.bw = this.quota.port * 10000
      params.isolated_device = this.quota.isolated_device
      params.eip = this.quota.eip
      params.snapshot = this.quota.snapshot
      params.object_cnt = this.quota.object_cnt
      params.object_gb = this.quota.object_gb
      params.rds = this.quota.rds
      params.secgroup = this.quota.secgroup
      params.cache = this.quota.cache
      params.bucket = this.quota.bucket
      params.loadbalancer = this.quota.loadbalancer
      if (this.isDomain) {
        params.cloudaccount = this.quota.cloudaccount
        params.globalvpc = this.quota.globalvpc
        params.group = this.quota.group
        params.policy = this.quota.policy
        params.project = this.quota.project
        params.role = this.quota.role
        params.user = this.quota.user
        params.host = this.quota.host
        params.vpc = this.quota.vpc
      }
      return params
    },
  },
}
</script>
