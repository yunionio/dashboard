<template>
  <a-table bordered :dataSource="quotaOptions" :columns="quotaOptionsColumns" :pagination="false">
    <template slot="remaining" slot-scope="text" v-if="l3PermissionEnable">
      {{ text }}
    </template>
    <template slot="val" slot-scope="text, record">
      <a-tooltip>
        <!-- {{ `范围：负数 ~ ${record.max === Infinity ? $t('system.text_84') : record.max}` }} -->
        <template slot="title">{{$t('system.text_83')}}</template>
        <a-input-number
          class="input-number"
          :controls="false"
          v-model="quota[record.key]"
          @change="changeHandle(quota, record.key)" />
      </a-tooltip>
    </template>
  </a-table>
</template>

<script>
import { mapGetters } from 'vuex'
import { QUOTA_KEYS } from '@/constants/quota'
import { initQuota, domainQuotaOptions } from '@/utils/quota'

export default {
  name: 'QuotaSet',
  props: {
    domain: {
      type: String,
    },
    tenant: {
      type: String,
    },
    isClone: {
      type: Boolean,
    },
    mdf: {
      type: String,
    },
  },
  data () {
    return {
      quota: initQuota(this.mdf),
      quotaOptions: [
        {
          key: 'cpu',
          label: 'CPU',
          max: 0,
          step: 10,
          unit: this.$t('system.text_85'),
          remaining: 0,
        },
        {
          key: 'memory',
          label: this.$t('system.text_86'),
          max: 0,
          step: 1024,
          unit: 'GB',
          remaining: 0,
        },
        {
          key: 'storage',
          label: this.$t('system.text_87'),
          max: 0,
          step: 10,
          unit: 'GB',
          remaining: 0,
        },
        {
          key: 'image',
          label: this.$t('system.text_26'),
          max: 0,
          step: 5,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'count',
          label: this.$t('system.text_89'),
          max: 0,
          step: 5,
          unit: this.$t('system.text_90'),
          remaining: 0,
        },
        {
          key: 'port',
          label: this.$t('system.text_91'),
          max: 0,
          step: 10,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'eport',
          label: this.$t('system.eport_name'),
          max: 0,
          step: 10,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'isolated_device',
          label: 'GPU',
          max: 0,
          step: 10,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'eip',
          label: this.$t('system.text_92'),
          max: 0,
          step: 1,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'snapshot',
          label: this.$t('system.text_93'),
          max: 0,
          step: 1,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'instance_snapshot',
          label: this.$t('system.text_409'),
          max: 0,
          step: 1,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'bucket',
          label: this.$t('system.text_94'),
          max: 0,
          step: 1,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'object_gb',
          label: this.$t('system.text_95'),
          max: 0,
          step: 10,
          unit: 'GB',
          remaining: 0,
        },
        {
          key: 'object_cnt',
          label: this.$t('system.text_96'),
          max: 0,
          step: 1,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        // 项目配额
        {
          key: 'secgroup',
          label: this.$t('system.text_97'),
          max: 0,
          step: 1,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        // 区域配额
        {
          key: 'rds',
          label: this.$t('system.text_98'),
          max: 0,
          step: 1,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'cache',
          label: this.$t('system.text_99'),
          max: 0,
          step: 1,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
        {
          key: 'loadbalancer',
          label: this.$t('system.text_100'),
          max: 0,
          step: 1,
          unit: this.$t('system.text_88'),
          remaining: 0,
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'l3PermissionEnable']),
    quotaOptionsColumns () {
      const quotaCols = [
        {
          title: this.$t('system.text_101'),
          dataIndex: 'label',
        },
        // {
        //   title: `${this.$t('dictionary.domain')}剩余可分配配额`,
        //   dataIndex: 'remaining',
        //   scopedSlots: { customRender: 'remaining' },
        // },
        {
          title: this.$t('system.text_102'),
          dataIndex: 'val',
          scopedSlots: { customRender: 'val' },
        },
        {
          title: this.$t('system.text_103'),
          dataIndex: 'unit',
        },
      ]
      // if (!this.l3PermissionEnable || this.mdf === 'domain') {
      //   quotaCols.splice(1, 1)
      // }
      return quotaCols
    },
    isDomain () {
      return this.mdf === 'domain'
    },
  },
  watch: {
    domain: {
      handler: function () {
        if (this.l3PermissionEnable) {
          this.fetchQuotas()
        }
      },
      immediate: true,
    },
  },
  created () {
    if (this.isDomain) {
      this.quotaOptions = this.quotaOptions.concat(domainQuotaOptions)
    }
    // 初始化最大值
    for (let i = 0, len = this.quotaOptions.length; i < len; i++) {
      if (this.isAdminMode) {
        this.quotaOptions[i].max = Infinity
      }
    }
    if (!this.isAdminMode) {
      if (!this.l3PermissionEnable) {
        this.quota = {
          ...initQuota(this.mdf),
        }
      }
    }
  },
  methods: {
    fetchQuotas () {
      this.fetchQuotasByProject()
      this.fetchQuotasByHost()
      this.fetchQuotasByRegion()
      this.fetchQuotasByImage()
    },
    fetchTenantQuotasByProject () {
      const manager = new this.$Manager('project_quotas')
      const params = {
        tenant: this.tenant,
      }
      manager.rpc({ methodname: 'GetQuota', params }).then(res => {
        const ret = {}
        for (const key in this.quota) {
          if (QUOTA_KEYS.PROJECT.includes(key)) {
            const val = res.data[key] || 0
            ret[key] = parseInt(val) || 0
          }
        }
        this.quota = { ...this.quota, ...ret }
      })
    },
    fetchTenantQuotasByImage () {
      const manager = new this.$Manager('image_quotas')
      const params = {
        tenant: this.tenant,
      }
      manager.rpc({ methodname: 'GetQuota', params }).then(res => {
        const ret = {}
        for (const key in this.quota) {
          if (QUOTA_KEYS.IMAGE.includes(key)) {
            const val = res.data[key] || 0
            ret[key] = parseInt(val) || 0
          }
        }
        this.quota = { ...this.quota, ...ret }
      })
    },
    fetchTenantQuotasByRegion () {
      const manager = new this.$Manager('region_quotas')
      const params = {
        tenant: this.tenant,
      }
      manager.rpc({ methodname: 'GetQuota', params }).then(res => {
        const ret = {}
        for (const key in this.quota) {
          if (QUOTA_KEYS.REGION.includes(key)) {
            const val = res.data[key] || 0
            ret[key] = parseInt(val) || 0
          }
        }
        this.quota = { ...this.quota, ...ret }
      })
    },
    fetchTenantQuotasByHost () {
      const manager = new this.$Manager('quotas')
      const params = {
        tenant: this.tenant,
      }
      manager.rpc({ methodname: 'GetQuota', params }).then(res => {
        const ret = {}
        for (const key in this.quota) {
          if (QUOTA_KEYS.HOST.includes(key)) {
            let val = res.data[key] || 0
            if (key === 'memory') {
              val = val / 1024
            }
            if (key === 'storage') {
              val = val / 1024
            }
            ret[key] = parseInt(val) || 0
          }
        }
        this.quota = { ...this.quota, ...ret }
      })
    },
    fetchQuotasByProject () {
      const manager = new this.$Manager('project_quotas')
      const params = {
        domain: this.domain,
      }
      manager.rpc({ methodname: 'GetQuota', params }).then(res => {
        let hasNegativeNumber = false
        const resData = res.data.data[0] || {}
        for (let i = 0, len = this.quotaOptions.length; i < len; i++) {
          const key = this.quotaOptions[i].key
          if (!QUOTA_KEYS.PROJECT.includes(key)) continue
          const total = resData[key] || 0
          const usage = resData[`usage.${key}`] || 0
          const remaining = total - usage
          this.quotaOptions[i].max = this.isAdminMode ? Infinity : parseInt(remaining) || 0
          this.quotaOptions[i].remaining = parseInt(remaining) || 0
          if (remaining <= 0) {
            hasNegativeNumber = true
          }
        }
        if (hasNegativeNumber) {
          this.remaining = false
        }
        if (this.isClone) {
          this.fetchTenantQuotasByProject()
        } else {
          // 设置默认值
          this.quota = {
            ...initQuota(this.mdf),
          }
        }
      })
    },
    fetchQuotasByImage () {
      const manager = new this.$Manager('image_quotas')
      const params = {
        domain: this.domain,
      }
      manager.rpc({ methodname: 'GetQuota', params }).then(res => {
        let hasNegativeNumber = false
        const resData = res.data.data[0] || {}
        for (let i = 0, len = this.quotaOptions.length; i < len; i++) {
          const key = this.quotaOptions[i].key
          if (!QUOTA_KEYS.IMAGE.includes(key)) continue
          const total = resData[key] || 0
          const usage = resData[`usage.${key}`] || 0
          const remaining = total - usage
          this.quotaOptions[i].max = this.isAdminMode ? Infinity : parseInt(remaining) || 0
          this.quotaOptions[i].remaining = parseInt(remaining) || 0
          if (remaining <= 0) {
            hasNegativeNumber = true
          }
        }
        if (hasNegativeNumber) {
          this.remaining = false
        }
        if (this.isClone) {
          this.fetchTenantQuotasByImage()
        } else {
          // 设置默认值
          this.quota = {
            ...initQuota(this.mdf),
          }
        }
      })
    },
    fetchQuotasByRegion () {
      const manager = new this.$Manager('region_quotas')
      const params = {
        domain: this.domain,
      }
      manager.rpc({ methodname: 'GetQuota', params }).then(res => {
        let hasNegativeNumber = false
        const resData = res.data.data[0] || {}
        for (let i = 0, len = this.quotaOptions.length; i < len; i++) {
          const key = this.quotaOptions[i].key
          if (!QUOTA_KEYS.REGION.includes(key)) continue
          const total = resData[key] || 0
          const usage = resData[`usage.${key}`] || 0
          const remaining = total - usage
          this.quotaOptions[i].max = this.isAdminMode ? Infinity : parseInt(remaining) || 0
          this.quotaOptions[i].remaining = parseInt(remaining) || 0
          if (remaining <= 0) {
            hasNegativeNumber = true
          }
        }
        if (hasNegativeNumber) {
          this.remaining = false
        }
        if (this.isClone) {
          this.fetchTenantQuotasByRegion()
        } else {
          // 设置默认值
          this.quota = {
            ...initQuota(this.mdf),
          }
        }
      })
    },
    fetchQuotasByHost () {
      const manager = new this.$Manager('quotas')
      const params = {
        domain: this.domain,
      }
      manager.rpc({ methodname: 'GetQuota', params }).then(res => {
        let hasNegativeNumber = false
        const resData = res.data.data[0] || {}
        for (let i = 0, len = this.quotaOptions.length; i < len; i++) {
          const key = this.quotaOptions[i].key
          if (!QUOTA_KEYS.HOST.includes(key)) continue
          let total = resData[key] || 0
          let usage = resData[`usage.${key}`] || 0
          if (key === 'memory') {
            total = total / 1024
            usage = usage / 1024
          }
          if (key === 'storage') {
            total = total / 1024
            usage = usage / 1024
          }
          const remaining = total - usage
          this.quotaOptions[i].max = this.isAdminMode ? Infinity : parseInt(remaining) || 0
          this.quotaOptions[i].remaining = parseInt(remaining) || 0
          if (remaining <= 0) {
            hasNegativeNumber = true
          }
        }
        if (hasNegativeNumber) {
          this.remaining = false
        }
        if (this.isClone) {
          this.fetchTenantQuotasByHost()
        } else {
          // 设置默认值
          this.quota = {
            ...initQuota(this.mdf),
          }
        }
      })
    },
    async doQuotaSet (data) {
      try {
        await this.doQuotaSetByProject(data)
      } catch (error) {
        this.$notification.error({
          message: this.$t('system.text_74'),
          description: this.$t('system.text_104'),
        })
      }
      try {
        await this.doQuotaSetByHost(data)
      } catch (error) {
        this.$notification.error({
          message: this.$t('system.text_74'),
          description: this.$t('system.text_105'),
        })
      }
      try {
        await this.doQuotaSetByImage(data)
      } catch (error) {
        this.$notification.error({
          message: this.$t('system.text_74'),
          description: this.$t('system.text_106'),
        })
      }
      try {
        await this.doQuotaSetByRegion(data)
      } catch (error) {
        this.$notification.error({
          message: this.$t('system.text_74'),
          description: this.$t('system.text_107'),
        })
      }
      if (this.isDomain) {
        try {
          await this.doQuotaSetByDomain(data)
        } catch (error) {
          this.$notification.error({
            message: this.$t('system.text_74'),
            description: this.$t('system.text_108'),
          })
        }
        try {
          await this.doQuotaSetByIdentity(data)
        } catch (error) {
          this.$notification.error({
            message: this.$t('system.text_74'),
            description: this.$t('system.text_109'),
          })
        }
        try {
          await this.doQuotaSetByInfras(data)
        } catch (error) {
          this.$notification.error({
            message: this.$t('system.text_74'),
            description: this.$t('system.text_110'),
          })
        }
      }
    },
    doQuotaSetByProject (data) {
      return new Promise((resolve, reject) => {
        const manager = new this.$Manager('project_quotas')
        const params = {
          scope: this.$store.getters.scope,
          ...data,
          action: 'replace',
        }
        if (this.isAdminMode) {
          params.cascade = true
        }
        params.secgroup = this.quota.secgroup
        manager.rpc({ methodname: 'DoQuotaSet', params }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    doQuotaSetByImage (data) {
      return new Promise((resolve, reject) => {
        const manager = new this.$Manager('image_quotas')
        const params = {
          scope: this.$store.getters.scope,
          ...data,
          action: 'replace',
        }
        if (this.isAdminMode) {
          params.cascade = true
        }
        params.image = this.quota.image
        manager.rpc({ methodname: 'DoQuotaSet', params }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    doQuotaSetByRegion (data) {
      return new Promise((resolve, reject) => {
        const manager = new this.$Manager('region_quotas')
        const params = {
          scope: this.$store.getters.scope,
          ...data,
          action: 'replace',
        }
        if (this.isAdminMode) {
          params.cascade = true
        }
        params.port = this.quota.port
        params.eport = this.quota.eport
        params.eip = this.quota.eip
        params.snapshot = this.quota.snapshot
        params.instance_snapshot = this.quota.instance_snapshot
        params.bucket = this.quota.bucket
        params.object_gb = this.quota.object_gb
        params.object_cnt = this.quota.object_cnt
        params.secgroup = this.quota.secgroup
        params.rds = this.quota.rds
        params.cache = this.quota.cache
        params.loadbalancer = this.quota.loadbalancer
        manager.rpc({ methodname: 'DoQuotaSet', params }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    doQuotaSetByHost (data) {
      return new Promise((resolve, reject) => {
        const manager = new this.$Manager('quotas')
        const params = {
          scope: this.$store.getters.scope,
          ...data,
          action: 'replace',
        }
        if (this.isAdminMode) {
          params.cascade = true
        }
        params.cpu = this.quota.cpu
        params.memory = this.quota.memory * 1024
        params.storage = this.quota.storage * 1024
        params.count = this.quota.count
        params.bw = this.quota.port * 10000
        params.isolated_device = this.quota.isolated_device
        manager.rpc({ methodname: 'DoQuotaSet', params }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    doQuotaSetByDomain (data) {
      return new Promise((resolve, reject) => {
        const manager = new this.$Manager('domain_quotas')
        const params = {
          scope: this.$store.getters.scope,
          ...data,
          action: 'replace',
        }
        if (this.isAdminMode) {
          params.cascade = true
        }
        params.cloudaccount = this.quota.cloudaccount
        params.globalvpc = this.quota.globalvpc
        manager.rpc({ methodname: 'DoQuotaSet', params }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    doQuotaSetByIdentity (data) {
      return new Promise((resolve, reject) => {
        const manager = new this.$Manager('identity_quotas')
        const params = {
          scope: this.$store.getters.scope,
          ...data,
          action: 'replace',
        }
        if (this.isAdminMode) {
          params.cascade = true
        }
        params.group = this.quota.group
        params.policy = this.quota.policy
        params.project = this.quota.project
        params.role = this.quota.role
        params.user = this.quota.user
        manager.rpc({ methodname: 'DoQuotaSet', params }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    doQuotaSetByInfras (data) {
      return new Promise((resolve, reject) => {
        const manager = new this.$Manager('infras_quotas')
        const params = {
          scope: this.$store.getters.scope,
          ...data,
          action: 'replace',
        }
        if (this.isAdminMode) {
          params.cascade = true
        }
        params.host = this.quota.host
        params.vpc = this.quota.vpc
        manager.rpc({ methodname: 'DoQuotaSet', params }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    changeHandle (obj, key) {
      if (!obj[key]) {
        obj[key] = 0
      }
    },
  },
}
</script>
