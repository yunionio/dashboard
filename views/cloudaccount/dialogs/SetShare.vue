<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_281')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.cloudaccount')" :count="params.data.length" :action="$t('cloudenv.text_281')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        ref="form"
        :model="fd"
        :rules="rules"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('cloudenv.text_282')" prop="share_mode" :extra="extra">
          <a-radio-group v-model="fd.share_mode">
            <template v-for="item of shareModeOptions">
              <a-radio-button :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
            </template>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item :label="$t('dictionary.domain')" prop="provider_shared_domains" v-if="providerDomainMode">
          <template v-if="providerDomainLoaded">
            <a-select
              :value="fd.provider_shared_domains"
              @search="fetchProviderDomains"
              :filterOption="false"
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
        </a-form-model-item>
        <a-form-model-item :label="$t('dictionary.domain')" prop="system_shared_domains" v-if="systemMode">
          <template v-if="systemDomainLoaded">
            <a-select
              :value="fd.system_shared_domains"
              @search="fetchSystemDomains"
              :filterOption="false"
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
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudaccountSetShareDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const isBatch = this.params.data.length >= 2
    let shareModeInitialValue = 'account_domain'
    let providerSharedDomainsInitialValue = []
    let systemSharedDomainsInitialValue = []
    // 只有单项操作时，才进行反显
    if (!isBatch && this.params.data[0].is_public) {
      const firstData = this.params.data[0]
      const { share_mode: shareMode, shared_domains: sharedDomains } = firstData
      // 共享云订阅
      if (shareMode === 'provider_domain') {
        shareModeInitialValue = 'provider_domain'
        // 为空时是全局
        if (R.isNil(sharedDomains) || R.isEmpty(sharedDomains)) {
          providerSharedDomainsInitialValue = ['all']
        } else {
          providerSharedDomainsInitialValue = sharedDomains.map(item => item.id)
        }
      }
      if (shareMode === 'system') {
        shareModeInitialValue = 'system'
        // 为空时是全局
        if (R.isNil(sharedDomains) || R.isEmpty(sharedDomains)) {
          systemSharedDomainsInitialValue = ['all']
        } else {
          systemSharedDomainsInitialValue = sharedDomains.map(item => item.id)
        }
      }
    }
    return {
      loading: false,
      fd: {
        share_mode: shareModeInitialValue,
        provider_shared_domains: providerSharedDomainsInitialValue,
        system_shared_domains: systemSharedDomainsInitialValue,
      },
      rules: {
        share_mode: [
          { required: true, message: this.$t('cloudenv.text_283') },
        ],
        provider_shared_domains: [
          { required: true, message: this.$t('cloudenv.text_284', [this.$t('dictionary.domain')]) },
        ],
        system_shared_domains: [
          { required: true, message: this.$t('cloudenv.text_284', [this.$t('dictionary.domain')]) },
        ],
      },
      shareModeOptions: [
        { key: 'account_domain', label: this.$t('cloudenv.text_285') },
        { key: 'provider_domain', label: this.$t('cloudenv.text_286') },
        { key: 'system', label: this.$t('cloudenv.text_287') },
      ],
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      isBatch,
      providerDomainLoaded: false,
      providerDomains: [],
      systemDomainLoaded: false,
      systemDomains: [],
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable']),
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
        let data = response.data.data || []
        if (!this.isBatch && this.params.data[0].shared_domains && this.params.data[0].shared_domains.length) {
          data = this.mergeSharedRes(data, this.params.data[0].shared_domains)
        }
        data.unshift({ id: 'all', name: this.$t('cloudenv.text_297') })
        return data
      } catch (error) {
        throw error
      }
    },
    // 合并已共享的资源，这样可以实现name的反显，不会有先显示id的问题
    mergeSharedRes (data, sharedData) {
      const ret = [...data]
      if (sharedData && sharedData.length > 0) {
        R.forEach(value => {
          const obj = R.find(R.propEq('id', value.id))(ret)
          if (!obj) {
            ret.push(obj)
          }
        })
      }
      return ret
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
        this.$refs.form.validate()
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
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        const ids = this.params.data.map(item => item.id)
        // 不共享
        if (this.accountDomainMode) {
          await this.setPrivate(ids)
        } else {
          const data = {
            share_mode: this.fd.share_mode,
          }
          // 共享云订阅
          if (this.providerDomainMode) {
            if (this.fd.provider_shared_domains[0] === 'all') {
              data.scope = 'system'
            } else {
              data.scope = 'domain'
              data.shared_domains = this.fd.provider_shared_domains
            }
          }
          // 共享云账号
          if (this.systemMode) {
            if (this.fd.system_shared_domains[0] === 'all') {
              data.scope = 'system'
            } else {
              data.scope = 'domain'
              data.shared_domains = this.fd.system_shared_domains
            }
          }
          await this.setPublic(ids, data)
        }
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
