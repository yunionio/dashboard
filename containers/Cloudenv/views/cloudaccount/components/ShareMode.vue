<template>
  <div v-if="shareModeShow">
    <!-- 共享范围选择 -->
    <a-form-item :label="$t('cloudenv.text_282')" :extra="extra">
      <a-radio-group v-decorator="decorators.share_mode">
        <template v-for="item of shareModeOptions">
          <a-radio-button :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
        </template>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('dictionary.domain')" v-if="providerDomainMode">
      <template v-if="providerDomainLoaded">
        <a-select
          v-decorator="decorators.provider_shared_domains"
          @search="fetchProviderDomains"
          :filterOption="false"
          :placeholder="$t('cloudenv.text_284', [this.$t('dictionary.domain')])"
          mode="multiple"
          @select="val => handleHasAllSelect(val, 'provider_shared_domains')"
          @deselect="val => handleDeselect(val, 'provider_shared_domains')">
          <template v-for="item of providerDomains">
            <a-select-option :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
          </template>
        </a-select>
      </template>
      <template v-else>
        <a-spin />
      </template>
    </a-form-item>
    <a-form-item :label="$t('dictionary.domain')" v-if="systemMode">
      <template v-if="systemDomainLoaded">
        <a-select
          v-decorator="decorators.system_shared_domains"
          @search="fetchSystemDomains"
          :filterOption="false"
          :placeholder="$t('cloudenv.text_284', [this.$t('dictionary.domain')])"
          mode="multiple"
          @select="val => handleHasAllSelect(val, 'system_shared_domains')"
          @deselect="val => handleDeselect(val, 'system_shared_domains')">
          <template v-for="item of systemDomains">
            <a-select-option :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
          </template>
        </a-select>
      </template>
      <template v-else>
        <a-spin />
      </template>
    </a-form-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ShareMode',
  props: {
    fd: {
      type: Object,
    },
  },
  data () {
    return {
      decorators: {
        share_mode: [
          'share_mode',
          {
            initialValue: 'account_domain',
            rules: [{ required: true }],
          },
        ],
        provider_shared_domains: [
          'provider_shared_domains',
          {
            initialValue: [],
            rules: [{ required: true, message: this.$t('cloudenv.text_284', [this.$t('dictionary.domain')]) }],
          },
        ],
        system_shared_domains: [
          'system_shared_domains',
          {
            initialValue: [],
            rules: [{ required: true, message: this.$t('cloudenv.text_284', [this.$t('dictionary.domain')]) }],
          },
        ],
      },
      shareModeOptions: [
        { key: 'account_domain', label: this.$t('cloudenv.text_285') },
        { key: 'provider_domain', label: this.$t('cloudenv.text_286') },
        { key: 'system', label: this.$t('cloudenv.text_287') },
      ],
      providerDomainLoaded: false,
      providerDomains: [],
      systemDomainLoaded: false,
      systemDomains: [],
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable', 'isAdminMode']),
    shareModeShow () {
      return this.l3PermissionEnable && this.isAdminMode
    },
    extra () {
      const shareModeExtra = {
        account_domain: this.$t('cloudenv.text_288', [this.$t('dictionary.cloudaccount'), this.$t('dictionary.domain'), this.$t('dictionary.project'), this.$t('dictionary.cloudaccount')]),
        provider_domain: this.$t('cloudenv.text_293', [this.$t('dictionary.domain'), this.$t('dictionary.project'), this.$t('dictionary.cloudaccount'), this.$t('dictionary.project')]),
        system: this.$t('cloudenv.text_296', [this.$t('dictionary.domain'), this.$t('dictionary.project'), this.$t('dictionary.cloudaccount')]),
      }
      return shareModeExtra[this.fd.share_mode]
    },
    accountDomainMode () {
      return this.fd.share_mode === 'account_domain'
    },
    providerDomainMode () {
      return this.fd.share_mode === 'provider_domain'
    },
    systemMode () {
      return this.fd.share_mode === 'system'
    },
  },
  watch: {
    providerDomainMode: {
      handler (val) {
        if (val) {
          this.$nextTick(() => {
            this.fetchProviderDomains()
          })
        }
      },
      immediate: true,
    },
    systemMode: {
      handler (val) {
        if (val) {
          this.$nextTick(() => {
            this.fetchSystemDomains()
          })
        }
      },
      immediate: true,
    },
  },
  beforeDestroy () {
    this.dm = null
  },
  created () {
    this.dm = new this.$Manager('domains', 'v1')
  },
  methods: {
    async fetchProviderDomains (query) {
      try {
        const data = await this.fetchDomains(query)
        this.providerDomains = data
        this.providerDomainLoaded = true
      } catch (error) {
        throw error
      }
    },
    async fetchSystemDomains (query) {
      try {
        const data = await this.fetchDomains(query)
        this.systemDomains = data
        this.systemDomainLoaded = true
      } catch (error) {
        throw error
      }
    },
    async fetchDomains (query, p = {}) {
      const params = {
        details: true,
        scope: this.scope,
        limit: 20,
        ...p,
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.dm.list({
          params,
        })
        const data = response.data.data || []
        data.unshift({ id: 'all', name: this.$t('cloudenv.text_297') })
        return data
      } catch (error) {
        throw error
      }
    },
    // 全部与选择项互斥交互
    handleHasAllSelect (val, field) {
      let newVal = []
      if (val === 'all') {
        newVal = ['all']
      } else {
        newVal = [...this.fd[field]]
        const allIndex = newVal.indexOf('all')
        const valIndex = newVal.indexOf(val)
        if (valIndex === -1) {
          newVal.push(val)
        }
        if (allIndex !== -1) {
          newVal.splice(allIndex, 1)
        }
      }
      this.$nextTick(() => {
        this.fd[field] = newVal
      })
    },
    // 取消选中
    handleDeselect (val, field) {
      const newVal = [...this.fd[field]]
      const valIndex = newVal.indexOf(val)
      if (valIndex !== -1) {
        newVal.splice(valIndex, 1)
      }
      this.fd[field] = newVal
    },
    setPublic (ids, data) {
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: this.params.steadyStatus,
        managerArgs: {
          action: 'public',
          data,
        },
      })
    },
    setPrivate (ids) {
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: this.params.steadyStatus,
        managerArgs: {
          action: 'private',
        },
      })
    },
  },
}
</script>
