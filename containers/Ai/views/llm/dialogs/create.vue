<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
          <template v-slot:extra>
            <name-repeated res="llms" :name="form.fd.name" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('aice.llm_type')">
          <a-radio-group
            class="llm-type-picker"
            button-style="solid"
            v-decorator="decorators.llm_type">
            <a-radio-button v-for="opt in llmTypeOptions" :key="opt.id" :value="opt.id">
              {{ opt.name }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('aice.llm_sku')">
          <base-select
            v-decorator="decorators.llm_sku_id"
            resource="llm_skus"
            :select-props="{
              placeholder: $t('common.tips.select', [$t('aice.llm_sku')]),
            }"
            :params="llmSkuParams" />
        </a-form-item>
        <a-form-item :label="$t('aice.bandwidth_mb')">
          <a-input-number
            v-decorator="decorators.bandwidth_mb"
            :min="1"
            :max="10000"
            :step="1"
            :precision="0" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.host')">
          <base-select
            v-decorator="decorators.prefer_host"
            resource="hosts"
            :select-props="{
              placeholder: $t('common.tips.select', [$t('dictionary.host')]),
              allowClear: true,
            }"
            :params="hostParams" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_104')" class="mb-0">
          <server-network
            :form="form"
            :decorator="decorators.network"
            :network-list-params="networkParams"
            :schedtag-params="resourcesParams.schedtag"
            :network-resource-mapper="networkResourceMapper"
            :hiddenNetworkOptions="['schedtag']"
            defaultNetworkType="default"
            :hiddenAdd="true"
            :isDialog="true" />
        </a-form-item>
        <template v-if="form.fd.llm_type === 'openclaw'">
          <a-divider orientation="left" class="openclaw-section-divider">{{ $t('aice.openclaw.section.chat_channels') }}</a-divider>
          <a-form-item :label="$t('aice.openclaw.channels')" :extra="$t('aice.openclaw.channels_extra')">
            <a-select
              v-decorator="decorators.openclaw_channels"
              mode="multiple"
              :placeholder="$t('aice.openclaw.channel_select_placeholder')"
              allow-clear
              show-search
              :filter-option="filterChannelOption"
              style="width: 100%; max-width: 400px;">
              <a-select-option v-for="opt in channelOptionsForSelect" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <template v-if="filteredChannelSections.length > 0">
            <div class="openclaw-channel-config-hint text-color-secondary mb-2">
              {{ $t('aice.openclaw.channel_config_hint') }}
            </div>
            <a-tabs
              :activeKey="openclawChannelActiveTab || (filteredChannelSections[0] && filteredChannelSections[0].sectionKey)"
              class="openclaw-channel-tabs"
              :animated="false"
              @change="openclawChannelActiveTab = $event">
              <a-tab-pane
                v-for="section in filteredChannelSections"
                :key="section.sectionKey"
                :forceRender="true">
                <span slot="tab" class="openclaw-tab-with-close">
                  {{ $t(section.sectionLabelKey) }}
                  <a-icon type="close" class="openclaw-tab-close" @click.prevent.stop="closeChannelTab(section.sectionKey)" />
                </span>
                <a-form-item :label="$t('aice.openclaw.credential_mode.label')">
                  <a-radio-group
                    :value="openclawChannelCredentialMode[section.sectionKey] || 'new'"
                    @change="e => $set(openclawChannelCredentialMode, section.sectionKey, e.target.value)">
                    <a-radio value="new">{{ $t('aice.openclaw.credential_mode.new') }}</a-radio>
                    <a-radio value="existing">{{ $t('aice.openclaw.credential_mode.existing') }}</a-radio>
                  </a-radio-group>
                </a-form-item>
                <template v-if="(openclawChannelCredentialMode[section.sectionKey] || 'new') === 'existing'">
                  <a-form-item :label="$t('aice.container_secret')">
                    <base-select
                      v-model="openclawChannelCredentialId[section.sectionKey]"
                      resource="credentials"
                      :params="credentialParamsForChannel(section.sectionKey)"
                      :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.container_secret')]) }"
                      @change="val => onChannelCredentialChange(section.sectionKey, val)" />
                  </a-form-item>
                  <a-form-item :label="$t('aice.container_secret.export_keys')" :extra="$t('aice.container_secret.export_keys_tip')">
                    <a-checkbox-group
                      :value="openclawChannelExportKeys[section.sectionKey] || []"
                      @change="val => $set(openclawChannelExportKeys, section.sectionKey, val)">
                      <a-checkbox v-for="k in (openclawChannelBlobKeys[section.sectionKey] || [])" :key="k" :value="k">{{ k }}</a-checkbox>
                    </a-checkbox-group>
                  </a-form-item>
                </template>
                <template v-else>
                  <a-form-item :label="$t('aice.openclaw.new_credential_name')" :extra="$t('aice.openclaw.new_credential_name_tip')" :required="true">
                    <a-input
                      :value="openclawChannelNewCredentialName[section.sectionKey]"
                      :placeholder="$t('common.tips.input', [$t('aice.openclaw.new_credential_name')])"
                      @change="e => $set(openclawChannelNewCredentialName, section.sectionKey, e.target.value)" />
                  </a-form-item>
                  <div class="openclaw-new-blob-section">
                    <div v-for="v in section.vars" :key="v.envKey" class="openclaw-new-blob-row mb-2">
                      <a-form-item
                        :label="v.envKey"
                        :extra="($te(v.descriptionKey) ? $t(v.descriptionKey) : '') + ' ' + $t('aice.openclaw.channel_var_optional')">
                        <a-input-password
                          v-if="isSecretEnvKey(v.envKey)"
                          :value="(openclawChannelBlob[section.sectionKey] || {})[v.envKey]"
                          :placeholder="v.defaultValue || v.envKey"
                          allow-clear
                          @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.value)" />
                        <a-input
                          v-else
                          :value="(openclawChannelBlob[section.sectionKey] || {})[v.envKey]"
                          :placeholder="v.defaultValue || v.envKey"
                          allow-clear
                          @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.value)" />
                      </a-form-item>
                    </div>
                  </div>
                </template>
              </a-tab-pane>
            </a-tabs>
          </template>
        </template>
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_495')">
          <a-switch v-decorator="decorators.auto_start" :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm from '@/utils/validate'
import NameRepeated from '@/sections/NameRepeated'
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import { LLM_TYPE_OPTIONS, getParamsForType } from '../../llm-sku/llmTypeConfig'
import { OPENCLAW_CHANNEL_SECTIONS, OPENCLAW_CHANNEL_OPTIONS } from '../../llm-sku/openclawChannelConfig'

export default {
  name: 'LlmCreateDialog',
  provide () {
    return {
      form: this.form,
    }
  },
  components: {
    NameRepeated,
    ServerNetwork,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const defaultLlmType = (LLM_TYPE_OPTIONS[0] && LLM_TYPE_OPTIONS[0].id) || 'ollama'
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
          llm_type: defaultLlmType,
        },
        fi: {
          networkList: [],
          capability: {
            max_nic_count: 8,
          },
        },
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, validator: this.$validate('resourceName') },
            ],
          },
        ],
        llm_type: [
          'llm_type',
          {
            initialValue: defaultLlmType,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_type')]) },
            ],
          },
        ],
        llm_sku_id: [
          'llm_sku_id',
          {
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_sku')]) },
            ],
          },
        ],
        bandwidth_mb: [
          'bandwidth_mb',
          {
            initialValue: 30,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.bandwidth_mb')]) },
            ],
          },
        ],
        prefer_host: [
          'prefer_host',
          {
            rules: [
              { required: false, message: this.$t('common.tips.select', [this.$t('dictionary.host')]) },
            ],
          },
        ],
        network: {
          networkType: [
            'networkType',
            {
              initialValue: NETWORK_OPTIONS_MAP.default.key,
            },
          ],
          networkConfig: {
            vpcs: i => [
              `vpcs[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_194'),
                }],
              },
            ],
            networks: i => [
              `networks[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_217'),
                }],
              },
            ],
            ips: (i, networkData) => [
              `networkIps[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    validator: validateForm('IPv4'),
                  },
                ],
              },
            ],
            macs: (i, networkData) => [
              `networkMacs[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    validator: validateForm('mac'),
                  },
                ],
              },
            ],
          },
          networkSchedtag: {
            schedtags: i => [
              `networkSchedtags[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `networkPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('common_256'),
                }],
              },
            ],
          },
        },
        auto_start: [
          'auto_start',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
        openclaw_channels: [
          'openclaw_channels',
          { initialValue: [], rules: [] },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      openclawChannelCredentialMode: {},
      openclawChannelCredentialId: {},
      openclawChannelBlobKeys: {},
      openclawChannelExportKeys: {},
      openclawChannelNewCredentialName: {},
      openclawChannelBlob: {},
      openclawChannelActiveTab: '',
    }
  },
  computed: {
    networkParams () {
      const ret = {
        scope: this.$store.getters.scope,
        limit: 20,
        usable: true,
        server_type: ['guest', 'host'],
        vpc: this.form.fd.vpc,
      }
      return ret
    },
    resourcesParams () {
      const schedtag = {
        limit: 1024,
        'filter.0': 'resource_type.equals(networks)',
      }
      return {
        schedtag,
      }
    },
    llmTypeOptions () {
      return LLM_TYPE_OPTIONS.map(opt => ({ id: opt.id, name: this.$t(opt.name) }))
    },
    llmSkuParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        ...getParamsForType(this.form.fd.llm_type),
      }
    },
    hostParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        host_status: 'online',
        host_type: 'container',
      }
    },
    channelOptionsForSelect () {
      return OPENCLAW_CHANNEL_OPTIONS.map(opt => ({
        value: opt.value,
        label: this.$te(opt.label) ? this.$t(opt.label) : opt.label,
      }))
    },
    filteredChannelSections () {
      const channels = this.form.fd.openclaw_channels || []
      if (channels.length === 0) return []
      const set = new Set(channels)
      return OPENCLAW_CHANNEL_SECTIONS.filter(s => set.has(s.sectionKey))
    },
  },
  watch: {
    'form.fd.llm_type' (val, oldVal) {
      if (val === oldVal) return
      this.form.fc.setFieldsValue({ llm_sku_id: undefined })
    },
    filteredChannelSections (sections) {
      ;(sections || []).forEach(s => this.ensureChannelState(s.sectionKey))
    },
  },
  methods: {
    credentialParamsForChannel (channelKey) {
      const base = {
        scope: this.$store.getters.scope,
        filter: 'type.equals(container_secret)',
      }
      return {
        ...base,
        'filter.0': 'type.equals(container_secret)',
        'filter.1': '__meta__.user:openclaw_usage.equals(channel)',
        'filter.2': `__meta__.user:openclaw_name.equals(${channelKey})`,
      }
    },
    ensureChannelState (channelKey) {
      if (!this.openclawChannelCredentialMode[channelKey]) this.$set(this.openclawChannelCredentialMode, channelKey, 'new')
      if (!this.openclawChannelCredentialId[channelKey]) this.$set(this.openclawChannelCredentialId, channelKey, undefined)
      if (!this.openclawChannelBlobKeys[channelKey]) this.$set(this.openclawChannelBlobKeys, channelKey, [])
      if (!this.openclawChannelExportKeys[channelKey]) this.$set(this.openclawChannelExportKeys, channelKey, [])
      if (this.openclawChannelNewCredentialName[channelKey] === undefined) this.$set(this.openclawChannelNewCredentialName, channelKey, '')
      if (!this.openclawChannelBlob[channelKey]) this.$set(this.openclawChannelBlob, channelKey, {})
    },
    async fetchCredentialBlobKeys (credentialId) {
      if (!credentialId) return []
      const manager = new this.$Manager('credentials', 'v1')
      const { data } = await manager.get({ id: credentialId })
      const blob = data?.blob
      let obj = blob
      if (typeof blob === 'string') {
        try { obj = JSON.parse(blob) } catch (e) { obj = {} }
      }
      if (obj && typeof obj === 'object') {
        return Object.keys(obj)
      }
      return []
    },
    async onChannelCredentialChange (channelKey, credentialId) {
      this.ensureChannelState(channelKey)
      this.$set(this.openclawChannelCredentialId, channelKey, credentialId)
      this.$set(this.openclawChannelExportKeys, channelKey, [])
      try {
        const keys = await this.fetchCredentialBlobKeys(credentialId)
        this.$set(this.openclawChannelBlobKeys, channelKey, keys)
      } catch (e) {
        this.$set(this.openclawChannelBlobKeys, channelKey, [])
      }
    },
    closeChannelTab (sectionKey) {
      const channels = (this.form.fd.openclaw_channels || []).filter(k => k !== sectionKey)
      this.form.fc.setFieldsValue({ openclaw_channels: channels })
      this.$set(this.form.fd, 'openclaw_channels', channels)
      if (this.openclawChannelActiveTab === sectionKey && channels.length > 0) {
        this.openclawChannelActiveTab = channels[0]
      } else if (channels.length === 0) {
        this.openclawChannelActiveTab = ''
      }
      this.$delete(this.openclawChannelCredentialMode, sectionKey)
      this.$delete(this.openclawChannelCredentialId, sectionKey)
      this.$delete(this.openclawChannelBlobKeys, sectionKey)
      this.$delete(this.openclawChannelExportKeys, sectionKey)
      this.$delete(this.openclawChannelNewCredentialName, sectionKey)
    },
    filterChannelOption (input, option) {
      const value = option.componentOptions && option.componentOptions.propsData && option.componentOptions.propsData.value
      if (value == null) return true
      const opt = this.channelOptionsForSelect.find(o => o.value === value)
      const label = opt ? opt.label : (this.$te(value) ? this.$t(value) : String(value))
      return String(label).toLowerCase().indexOf((input || '').toLowerCase()) >= 0
    },
    isSecretEnvKey (envKey) {
      const lower = (envKey || '').toLowerCase()
      return lower.includes('key') || lower.includes('secret') || lower.includes('token') || lower.includes('password')
    },
    networkResourceMapper (list) {
      return (list || []).map(val => {
        const isHostSubnet = val.server_type === 'host'
        if (!isHostSubnet) return val
        return {
          ...val,
          name: `${val.name}（Host IP 子网）`,
        }
      })
    },
    async genNetworks (values) {
      let ret = [{ exit: false }]
      // 指定 IP 子网
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.manual.key) {
        ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = {
            network: value,
          }
          if (this.form.fd.networkIps) {
            const address = this.form.fd.networkIps[key]
            if (address) {
              obj.address = address
            }
          }
          if (this.form.fd.networkMacs) {
            const mac = this.form.fd.networkMacs[key]
            if (mac) {
              obj.mac = mac
            }
          }
          ret.push(obj)
        }, values.networks)
      }
      // 指定 调度标签
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
        ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = {
            id: value,
          }
          const strategy = this.form.fd.networkPolicys[key]
          if (strategy) {
            obj.strategy = strategy
          }
          ret.push({
            schedtags: [obj],
          })
        }, values.networkSchedtags)
      }
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const networks = await this.genNetworks(values)
        const data = {
          generate_name: values.name,
          llm_sku_id: values.llm_sku_id,
          bandwidth_mb: values.bandwidth_mb,
          prefer_host: values.prefer_host,
          auto_start: values.auto_start,
          nets: networks,
        }
        if (this.form.fd.llm_type === 'openclaw') {
          const channelsSelected = values.openclaw_channels || []
          const channels = []
          const credManager = new this.$Manager('credentials', 'v1')
          for (let i = 0; i < channelsSelected.length; i++) {
            const channelKey = channelsSelected[i]
            this.ensureChannelState(channelKey)
            const mode = this.openclawChannelCredentialMode[channelKey] || 'new'
            let credentialId
            let exportKeys
            if (mode === 'existing') {
              credentialId = this.openclawChannelCredentialId[channelKey]
              if (!credentialId) {
                this.$message.warning(this.$t('common.tips.select', [this.$t('aice.container_secret')]))
                this.loading = false
                return
              }
              exportKeys = this.openclawChannelExportKeys[channelKey] || []
            } else {
              const nameTrim = (this.openclawChannelNewCredentialName[channelKey] || '').trim()
              if (!nameTrim) {
                this.$message.warning(this.$t('common.tips.input', [this.$t('aice.openclaw.new_credential_name')]))
                this.loading = false
                return
              }
              const raw = this.openclawChannelBlob[channelKey] || {}
              const blob = {}
              Object.keys(raw).forEach(k => {
                const v = (raw[k] || '').trim()
                if (v) blob[k] = v
              })
              if (Object.keys(blob).length === 0) {
                this.$message.warning(this.$t('aice.openclaw.provider_filter_empty'))
                this.loading = false
                return
              }
              const { data: credData } = await credManager.create({
                data: {
                  type: 'container_secret',
                  name: nameTrim,
                  blob,
                  __meta__: {
                    'user:openclaw_usage': 'channel',
                    'user:openclaw_name': channelKey,
                  },
                },
              })
              credentialId = credData.id
              exportKeys = Object.keys(blob)
            }
            channels.push({
              name: channelKey,
              credential: { id: credentialId, export_keys: exportKeys },
            })
          }
          if (channels.length) {
            data.llm_spec = { openclaw: { channels } }
          }
        }
        await this.params.onManager('create', {
          managerArgs: { data },
        })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.llm-type-picker ::v-deep .ant-radio-button-wrapper {
  height: 36px;
  line-height: 34px;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 8px;
}
.llm-type-picker ::v-deep .ant-radio-button-wrapper:first-child {
  border-radius: 4px;
}
.llm-type-picker ::v-deep .ant-radio-button-wrapper:last-child {
  border-radius: 4px;
}
.openclaw-channel-tabs { margin-top: 8px; }
.openclaw-section-divider { margin-top: 20px; }
.openclaw-tab-with-close { display: inline-flex; align-items: center; gap: 6px; }
.openclaw-tab-close { font-size: 12px; cursor: pointer; opacity: 0.6; }
.openclaw-tab-close:hover { opacity: 1; }
.openclaw-new-blob-section { margin-top: 8px; }
.openclaw-new-blob-row ::v-deep .ant-form-item-label { padding-bottom: 4px; }
</style>
