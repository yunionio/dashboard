<template>
  <div class="llm-sku-create-form">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('aice.project')">
        <domain-project
          v-if="!isEditMode"
          :fc="form.fc"
          :fd="form.fd"
          :form-layout="formItemLayout"
          :decorators="{ project: decorators.project, domain: decorators.domain }" />
        <a-label v-if="isEditMode">{{ projectName }}</a-label>
      </a-form-item>
      <a-form-item :label="$t('common.name')">
        <a-input v-decorator="decorators.name" v-if="!isEditMode" />
        <template v-slot:extra v-if="!isEditMode">
          <name-repeated res="llm_skus" :name="form.fd.name" :default-text="$t('aice.name_repeat_extra')" />
        </template>
        <a-label v-if="isEditMode">{{ modelName }}</a-label>
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
      <a-form-item :label="$t('aice.llm_image')">
        <base-select
          v-decorator="decorators.llm_image_id"
          resource="llm_images"
          :params="appImageParams"
          :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.llm_image')]) }" />
      </a-form-item>
      <a-form-item :label="$t('aice.cpu')">
        <a-input-number
          v-decorator="decorators.cpu"
          :min="2"
          :step="2"
          :precision="0" /> {{ $t('aice.cpu.unit') }}
      </a-form-item>
      <a-form-item :label="$t('aice.memory')">
        <a-input-number
          v-decorator="decorators.memory"
          :min="2"
          :step="2"
          :precision="0" /> GB
      </a-form-item>
      <a-form-item :label="$t('aice.disk')">
        <a-input-number
          v-decorator="decorators.volume_size"
          :min="10"
          :step="32"
          :precision="0" /> GB
      </a-form-item>
      <a-form-item :label="$t('aice.bandwidth')">
        <a-input-number
          v-decorator="decorators.bandwidth"
          :min="1"
          :max="10000"
          :step="1"
          :precision="0" /> MB
      </a-form-item>
      <template v-for="field in currentTypeFields">
        <a-form-item
          v-if="field.component === 'base-select'"
          :key="field.fieldKey"
          :label="$t(field.label)">
          <base-select
            v-decorator="decorators[field.fieldKey]"
            v-bind="getBaseSelectProps(field)" />
        </a-form-item>
        <a-form-item v-else-if="field.component === 'input-number'" :key="field.fieldKey" :label="$t(field.label)">
          <a-input-number
            v-decorator="decorators[field.fieldKey]"
            v-bind="field.props" />
          <template v-if="field.suffixKey">{{ $t(field.suffixKey) }}</template>
          <template v-else-if="field.suffix">{{ field.suffix }}</template>
        </a-form-item>
      </template>
      <template v-if="form.fd.llm_type === 'openclaw'">
        <a-divider orientation="left" class="openclaw-section-divider">{{ $t('aice.openclaw.section.ai_providers') }}</a-divider>
        <a-form-item :label="$t('aice.openclaw.provider_filter')" :extra="$t('aice.openclaw.provider_select_tip')">
          <a-select
            v-model="openclawSelectedProviders"
            mode="multiple"
            :placeholder="$t('aice.openclaw.provider_filter_placeholder')"
            allow-clear
            show-search
            :filter-option="filterProviderOption"
            style="width: 100%; max-width: 400px;">
            <a-select-option v-for="opt in providerOptionsForSelect" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-tabs
          v-if="providerTabList.length > 0"
          :activeKey="openclawProviderActiveKey"
          type="card"
          class="openclaw-provider-tabs"
          :animated="false"
          @change="openclawProviderActiveTab = $event">
          <a-tab-pane
            v-for="item in providerTabList"
            :key="item.key"
            :forceRender="true">
            <span slot="tab" class="openclaw-tab-with-close">
              {{ $t(item.labelKey) }}{{ item.required ? ' *' : '' }}
              <a-icon type="close" class="openclaw-tab-close" @click.prevent.stop="closeProviderTab(item.key)" />
            </span>

            <a-form-item :label="$t('aice.openclaw.credential_mode.label')">
              <a-radio-group
                :value="openclawProviderCredentialMode[item.key] || 'new'"
                @change="e => $set(openclawProviderCredentialMode, item.key, e.target.value)">
                <a-radio value="new">{{ $t('aice.openclaw.credential_mode.new') }}</a-radio>
                <a-radio value="existing">{{ $t('aice.openclaw.credential_mode.existing') }}</a-radio>
              </a-radio-group>
            </a-form-item>

            <template v-if="(openclawProviderCredentialMode[item.key] || 'new') === 'existing'">
              <a-form-item :label="$t('aice.container_secret')">
                <base-select
                  v-model="openclawProviderCredentialId[item.key]"
                  resource="credentials"
                  :params="credentialParamsForProvider(item.key)"
                  :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.container_secret')]) }"
                  @change="val => onProviderCredentialChange(item.key, val)" />
              </a-form-item>
              <a-form-item :label="$t('aice.container_secret.export_keys')" :extra="$t('aice.container_secret.export_keys_tip')">
                <a-checkbox-group
                  :value="openclawProviderExportKeys[item.key] || []"
                  @change="val => $set(openclawProviderExportKeys, item.key, val)">
                  <a-checkbox v-for="k in (openclawProviderBlobKeys[item.key] || [])" :key="k" :value="k">{{ k }}</a-checkbox>
                </a-checkbox-group>
              </a-form-item>
            </template>

            <template v-else>
              <a-form-item :label="$t('aice.openclaw.new_credential_name')" :extra="$t('aice.openclaw.new_credential_name_tip')" :required="true">
                <a-input
                  :value="openclawProviderNewCredentialName[item.key]"
                  :placeholder="$t('common.tips.input', [$t('aice.openclaw.new_credential_name')])"
                  @change="e => $set(openclawProviderNewCredentialName, item.key, e.target.value)" />
              </a-form-item>
              <div class="openclaw-new-blob-section">
                <div v-for="v in item.vars" :key="v.envKey" class="openclaw-new-blob-row mb-2">
                  <a-form-item
                    :label="v.envKey"
                    :required="item.required"
                    :extra="(item.required ? $t('aice.openclaw.required_hint') + ' ' : '') + ($te(v.descriptionKey) ? $t(v.descriptionKey) : '')">
                    <a-input-password
                      v-if="isSecretEnvKey(v.envKey)"
                      :value="(openclawProviderBlob[item.key] || {})[v.envKey]"
                      :placeholder="v.envKey"
                      allow-clear
                      @change="e => $set(openclawProviderBlob[item.key], v.envKey, e.target.value)" />
                    <a-input
                      v-else
                      :value="(openclawProviderBlob[item.key] || {})[v.envKey]"
                      :placeholder="v.envKey"
                      allow-clear
                      @change="e => $set(openclawProviderBlob[item.key], v.envKey, e.target.value)" />
                  </a-form-item>
                  <a-form-item
                    v-if="v.overrideUrlKey"
                    :label="v.overrideUrlKey"
                    :extra="($te('aice.openclaw.env.' + v.overrideUrlKey) ? $t('aice.openclaw.env.' + v.overrideUrlKey) : '') + ' ' + $t('aice.openclaw.override_url_optional')"
                    class="openclaw-override-url mt-1">
                    <a-input
                      :value="(openclawProviderBlob[item.key] || {})[v.overrideUrlKey]"
                      :placeholder="overrideUrlPlaceholder(v.overrideUrlKey)"
                      allow-clear
                      @change="e => $set(openclawProviderBlob[item.key], v.overrideUrlKey, e.target.value)" />
                  </a-form-item>
                </div>
              </div>
            </template>
          </a-tab-pane>
        </a-tabs>
        <div v-else class="openclaw-filter-empty text-color-secondary">
          {{ openclawSelectedProviders.length === 0 ? $t('aice.openclaw.provider_select_first') : $t('aice.openclaw.provider_filter_empty') }}
        </div>
      </template>
      <a-divider
        v-if="form.fd.llm_type === 'openclaw'"
        key="section-agent-personalization"
        orientation="left"
        class="openclaw-section-divider">
        {{ $t('aice.openclaw.section.agent_personalization') }}
      </a-divider>
      <a-form-item
        v-if="form.fd.llm_type === 'openclaw'"
        :label="$t('aice.openclaw.workspace_templates')"
        :extra="$t('aice.openclaw.workspace_templates_tip')">
        <div class="openclaw-template-item">
          <div class="openclaw-template-title">AGENTS.md</div>
          <a-textarea
            v-decorator="decorators.openclaw_agents_md"
            :auto-size="{ minRows: 3, maxRows: 10 }"
            :placeholder="'AGENTS.md'" />
        </div>
        <div class="openclaw-template-item">
          <div class="openclaw-template-title">SOUL.md</div>
          <a-textarea
            v-decorator="decorators.openclaw_soul_md"
            :auto-size="{ minRows: 3, maxRows: 10 }"
            :placeholder="'SOUL.md'" />
        </div>
        <div class="openclaw-template-item mb-0">
          <div class="openclaw-template-title">USER.md</div>
          <a-textarea
            v-decorator="decorators.openclaw_user_md"
            :auto-size="{ minRows: 3, maxRows: 10 }"
            :placeholder="'USER.md'" />
        </div>
      </a-form-item>
    </a-form>
    <div class="form-footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated'
import { isRequired } from '@/utils/validate'
import { uuid } from '@/utils/utils'
import { dict } from '../constant'
import { LLM_TYPE_OPTIONS, LLM_TYPE_FORM_CONFIG, getParamsForType } from '../llmTypeConfig'
import { OPENCLAW_PROVIDER_SECTIONS, OPENCLAW_PROVIDER_OPTIONS } from '../openclawProviderConfig'

export default {
  name: 'LlmSkuCreateForm',
  components: {
    DomainProject,
    NameRepeated,
  },
  mixins: [WindowsMixin],
  props: {
    mode: {
      type: String,
      default: 'create',
      validator: v => ['create', 'edit'].includes(v),
    },
    editData: {
      type: Object,
      default: () => ({}),
    },
    onManager: {
      type: Function,
      default: null,
    },
  },
  data () {
    const data = this.mode === 'edit' && this.editData ? this.editData : {}
    const {
      domain_id,
      project_domain,
      tenant_id,
      tenant,
      name,
      llm_type: rowLlmType,
      cpu = 2,
      memory = 2048,
      volume = { size: 10240, storage_type: 'local', template_id: undefined },
      image_id,
      envs = [],
      llm_image_id,
      devices,
      mounted_models = [],
      mounted_apps = [],
      llm_spec: llmSpec,
      openclaw: openclawConf = {},
    } = data
    // openclaw 优先来自 llm_spec.openclaw，其次兼容旧的顶层 openclaw 字段
    let openclawConfObj = llmSpec?.openclaw ?? openclawConf
    if (typeof openclawConfObj === 'string') {
      try { openclawConfObj = JSON.parse(openclawConfObj) } catch (e) { openclawConfObj = {} }
    }
    if (!openclawConfObj || typeof openclawConfObj !== 'object') openclawConfObj = {}
    const openclawProvidersInit = Array.isArray(openclawConfObj?.providers) ? openclawConfObj.providers : []
    const openclawSelectedProvidersInit = openclawProvidersInit
      .map(p => p && p.name ? `aice.openclaw.provider.${p.name}` : null)
      .filter(Boolean)
    const providerCredentialIdInit = {}
    const providerExportKeysInit = {}
    openclawProvidersInit.forEach(p => {
      const k = p && p.name ? `aice.openclaw.provider.${p.name}` : null
      if (!k) return
      providerCredentialIdInit[k] = p?.credential?.id
      providerExportKeysInit[k] = p?.credential?.export_keys || []
    })
    let openclawWorkspaceTemplates = openclawConfObj?.workspace_templates
    if (typeof openclawWorkspaceTemplates === 'string') {
      try { openclawWorkspaceTemplates = JSON.parse(openclawWorkspaceTemplates) } catch (e) { openclawWorkspaceTemplates = {} }
    }
    if (!openclawWorkspaceTemplates || typeof openclawWorkspaceTemplates !== 'object') openclawWorkspaceTemplates = {}
    const envVars = (envs || []).map(item => ({ env_key: item.key, env_value: item.value, key: uuid() }))
    return {
      loading: false,
      dict,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
          llm_type: rowLlmType || (LLM_TYPE_OPTIONS[0] && LLM_TYPE_OPTIONS[0].id) || 'openclaw',
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            initialValue: { key: domain_id, label: project_domain },
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: { key: tenant_id, label: tenant },
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            initialValue: name,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) },
            ],
          },
        ],
        llm_image_id: [
          'llm_image_id',
          {
            initialValue: llm_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_image')]) },
            ],
          },
        ],
        llm_type: [
          'llm_type',
          {
            initialValue: rowLlmType || (LLM_TYPE_OPTIONS[0] && LLM_TYPE_OPTIONS[0].id) || 'openclaw',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_type')]) },
            ],
          },
        ],
        openclaw_agents_md: [
          'openclaw_agents_md',
          {
            initialValue: openclawWorkspaceTemplates['AGENTS.md'] || openclawWorkspaceTemplates.agents_md,
          },
        ],
        openclaw_soul_md: [
          'openclaw_soul_md',
          {
            initialValue: openclawWorkspaceTemplates['SOUL.md'] || openclawWorkspaceTemplates.soul_md,
          },
        ],
        openclaw_user_md: [
          'openclaw_user_md',
          {
            initialValue: openclawWorkspaceTemplates['USER.md'] || openclawWorkspaceTemplates.user_md,
          },
        ],
        mounted_models: [
          'mounted_models',
          {
            initialValue: mounted_models.map(v => v.id),
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.model')]) },
            ],
          },
        ],
        bandwidth: [
          'bandwidth',
          {
            initialValue: 100,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.bandwidth')]) },
            ],
          },
        ],
        cpu: [
          'cpu',
          {
            initialValue: cpu,
            rules: [
              { required: true, message: this.$t('common.tips.input', ['CPU']) },
            ],
          },
        ],
        memory: [
          'memory',
          {
            initialValue: memory / 1024,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.memory')]) },
            ],
          },
        ],
        volume_size: [
          'volume_size',
          {
            initialValue: volume.size / 1024,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.disk')]) },
            ],
          },
        ],
        phone_image: [
          'phone_image',
          {
            initialValue: image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.image')]) },
            ],
          },
        ],
        request_sync_image: [
          'request_sync_image',
          {
            initialValue: false,
          },
        ],
        device: [
          'device',
          {
            initialValue: devices && devices[0]?.model,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.devices')]) },
            ],
          },
        ],
        mounted_apps: [
          'mounted_apps',
          {
            initialValue: mounted_apps || [],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 18 },
        labelCol: { span: 5 },
      },
      envVars,
      projectName: (project_domain != null && tenant != null) ? `${project_domain}/${tenant}` : '',
      modelName: name || '',
      audioImageParams: { limit: 20, scope: this.$store.getters.scope, $t: 2 },
      streamImageParams: { limit: 20, scope: this.$store.getters.scope, $t: 3 },
      OPENCLAW_PROVIDER_SECTIONS,
      openclawSelectedProviders: openclawSelectedProvidersInit,
      openclawProviderCredentialMode: {},
      openclawProviderCredentialId: providerCredentialIdInit,
      openclawProviderBlobKeys: providerExportKeysInit,
      openclawProviderExportKeys: providerExportKeysInit,
      openclawProviderNewCredentialName: {},
      openclawProviderBlob: {},
      openclawProviderActiveTab: '',
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    providerOptionsForSelect () {
      return OPENCLAW_PROVIDER_OPTIONS.map(key => ({
        value: key,
        label: this.$te(key) ? this.$t(key) : key,
      }))
    },
    filteredProviderSections () {
      const selected = this.openclawSelectedProviders || []
      if (selected.length === 0) return []
      const set = new Set(selected)
      return this.OPENCLAW_PROVIDER_SECTIONS.map(section => {
        const vars = section.vars.filter(v => set.has(v.providerLabelKey))
        return vars.length ? { ...section, vars } : null
      }).filter(Boolean)
    },
    providerTabList () {
      const selected = this.openclawSelectedProviders || []
      if (selected.length === 0) return []
      const list = []
      selected.forEach(providerLabelKey => {
        const vars = []
        let required = false
        this.OPENCLAW_PROVIDER_SECTIONS.forEach(section => {
          section.vars.forEach(v => {
            if (v.providerLabelKey === providerLabelKey) {
              vars.push(v)
              if (section.required) required = true
            }
          })
        })
        if (vars.length) list.push({ key: providerLabelKey, labelKey: providerLabelKey, vars, required })
      })
      return list
    },
    openclawProviderActiveKey () {
      const list = this.providerTabList
      if (!list.length) return ''
      const keys = list.map(t => t.key)
      return keys.includes(this.openclawProviderActiveTab) ? this.openclawProviderActiveTab : (keys[0] || '')
    },
    isEditMode () {
      return this.mode === 'edit'
    },
    llmTypeOptions () {
      return LLM_TYPE_OPTIONS.map(opt => ({ id: opt.id, name: this.$t(opt.name) }))
    },
    currentTypeFields () {
      const type = this.form.fd.llm_type || 'ollama'
      return LLM_TYPE_FORM_CONFIG[type] || []
    },
    appImageParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        $t: 1,
        ...getParamsForType(this.form.fd.llm_type),
      }
    },
    mountedModelParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        ...getParamsForType(this.form.fd.llm_type),
      }
    },
    credentialParams () {
      return {
        scope: this.$store.getters.scope,
        filter: 'type.equals(container_secret)',
      }
    },
    specList () {
      const list = Object.values(this.$store.getters.capability?.pci_model_types || {}).filter(item => item.hypervisor === 'pod')
      return list.map(item => ({ key: item.model, label: item.model }))
    },
  },
  watch: {
    'form.fd.llm_type' (val, oldVal) {
      if (val === oldVal) return
      if (oldVal === 'openclaw' && val !== 'openclaw') {
        this.openclawSelectedProviders = []
        this.openclawProviderActiveTab = ''
        this.openclawProviderCredentialMode = {}
        this.openclawProviderCredentialId = {}
        this.openclawProviderBlobKeys = {}
        this.openclawProviderExportKeys = {}
        this.openclawProviderNewCredentialName = {}
        this.form.fc.setFieldsValue({
          openclaw_agents_md: undefined,
          openclaw_soul_md: undefined,
          openclaw_user_md: undefined,
        })
      }
    },
    providerTabList (list) {
      const keys = (list || []).map(t => t.key)
      if (keys.length && !keys.includes(this.openclawProviderActiveTab)) {
        this.openclawProviderActiveTab = keys[0] || ''
      }
    },
    openclawSelectedProviders: {
      handler (list) {
        ;(list || []).forEach((providerKey) => {
          this.ensureProviderState(providerKey)
        })
      },
      deep: true,
    },
  },
  created () {
    // 初始化 providers 的 blob 输入结构（按 key 分组）
    this.OPENCLAW_PROVIDER_SECTIONS.forEach(section => {
      section.vars.forEach(({ providerLabelKey, envKey, overrideUrlKey }) => {
        if (!this.openclawProviderBlob[providerLabelKey]) this.$set(this.openclawProviderBlob, providerLabelKey, {})
        if (this.openclawProviderBlob[providerLabelKey][envKey] === undefined) this.$set(this.openclawProviderBlob[providerLabelKey], envKey, '')
        if (overrideUrlKey) {
          if (this.openclawProviderBlob[providerLabelKey][overrideUrlKey] === undefined) this.$set(this.openclawProviderBlob[providerLabelKey], overrideUrlKey, '')
        }
      })
    })
  },
  methods: {
    credentialParamsForProvider (providerKey) {
      const base = this.credentialParams
      const shortName = this.providerShortName(providerKey)
      return {
        ...base,
        'filter.0': 'type.equals(container_secret)',
        'filter.1': '__meta__.user:openclaw_usage.equals(provider)',
        'filter.2': `__meta__.user:openclaw_name.equals(${shortName})`,
      }
    },
    providerShortName (providerKey) {
      const s = String(providerKey || '')
      const parts = s.split('.')
      return parts[parts.length - 1] || s
    },
    ensureProviderState (providerKey) {
      if (!this.openclawProviderCredentialMode[providerKey]) this.$set(this.openclawProviderCredentialMode, providerKey, 'new')
      if (!this.openclawProviderCredentialId[providerKey]) this.$set(this.openclawProviderCredentialId, providerKey, undefined)
      if (!this.openclawProviderBlobKeys[providerKey]) this.$set(this.openclawProviderBlobKeys, providerKey, [])
      if (!this.openclawProviderExportKeys[providerKey]) this.$set(this.openclawProviderExportKeys, providerKey, [])
      if (this.openclawProviderNewCredentialName[providerKey] === undefined) this.$set(this.openclawProviderNewCredentialName, providerKey, '')
      if (!this.openclawProviderBlob[providerKey]) this.$set(this.openclawProviderBlob, providerKey, {})
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
    async onProviderCredentialChange (providerKey, credentialId) {
      this.ensureProviderState(providerKey)
      this.$set(this.openclawProviderCredentialId, providerKey, credentialId)
      this.$set(this.openclawProviderExportKeys, providerKey, [])
      try {
        const keys = await this.fetchCredentialBlobKeys(credentialId)
        this.$set(this.openclawProviderBlobKeys, providerKey, keys)
      } catch (e) {
        this.$set(this.openclawProviderBlobKeys, providerKey, [])
      }
    },
    closeProviderTab (providerKey) {
      const next = this.openclawSelectedProviders.filter(k => k !== providerKey)
      this.openclawSelectedProviders = next
      if (this.openclawProviderActiveTab === providerKey && next.length > 0) {
        this.openclawProviderActiveTab = next[0]
      } else if (next.length === 0) {
        this.openclawProviderActiveTab = ''
      }
      this.$delete(this.openclawProviderCredentialMode, providerKey)
      this.$delete(this.openclawProviderCredentialId, providerKey)
      this.$delete(this.openclawProviderBlobKeys, providerKey)
      this.$delete(this.openclawProviderExportKeys, providerKey)
      this.$delete(this.openclawProviderNewCredentialName, providerKey)
    },
    handleCancel () {
      this.$emit('cancel')
    },
    filterProviderOption (input, option) {
      const value = option.componentOptions && option.componentOptions.propsData && option.componentOptions.propsData.value
      if (value == null) return true
      const label = this.$te(value) ? this.$t(value) : String(value)
      return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0
    },
    isSecretEnvKey (envKey) {
      const lower = (envKey || '').toLowerCase()
      return lower.includes('key') || lower.includes('secret') || lower.includes('token') || lower.includes('password')
    },
    overrideUrlPlaceholder (overrideUrlKey) {
      const defaults = {
        MOONSHOT_BASE_URL: 'https://api.moonshot.cn/v1',
        KIMI_BASE_URL: 'https://api.moonshot.ai/anthropic',
      }
      return defaults[overrideUrlKey] || 'https://...'
    },
    getBaseSelectProps (field) {
      const { props } = field
      const selectProps = {
        placeholder: this.$t('common.tips.select', [this.$t(props.placeholderKey)]),
        ...(props.selectProps || {}),
      }
      if (props.resource) {
        const paramsKeyMap = {
          appImageParams: 'appImageParams',
          mountedModelParams: 'mountedModelParams',
          credentialParams: 'credentialParams',
        }
        const paramsKey = paramsKeyMap[props.paramsKey] || 'mountedModelParams'
        return {
          resource: props.resource,
          params: this[paramsKey],
          selectProps,
          remote: props.remote || false,
        }
      }
      const options = props.optionsKey ? this[props.optionsKey] : []
      return { options, selectProps }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const manager = new this.$Manager('llm_skus')
        const values = await this.form.fc.validateFields()
        const {
          project,
          name,
          llm_type,
          phone_image,
          request_sync_image,
          llm_image_id,
          cpu,
          memory,
          volume_size,
          bandwidth,
        } = values
        const typeFields = this.currentTypeFields
        const typeFieldKeys = typeFields.map(f => f.fieldKey)
        const pickTypeValues = {}
        typeFieldKeys.forEach(key => {
          if (values[key] !== undefined) pickTypeValues[key] = values[key]
        })

        const volumes = [{
          containers: this.mode === 'edit' && this.editData && this.editData.volumes && this.editData.volumes[0] ? this.editData.volumes[0].containers : {
            1: { mount_path: '/etc/wolf', sub_directory: 'wolf' },
            2: {
              mount_path: '/home/retro',
              sub_directory: 'home',
              overlay: {
                lower_dir: ['/opt/steam-data/steam', '/opt/steam-data/games'],
                use_disk_image: false,
              },
            },
          },
          size_mb: (volume_size ?? 10) * 1024,
        }]
        const data = {
          name,
          llm_type,
          llm_image_id,
          image_id: phone_image,
          cpu,
          memory: (memory ?? 2) * 1024,
          bandwidth: bandwidth ?? 100,
          volumes,
          disk_size: volumes[0].size_mb,
          app_type: 'steam',
        }
        typeFieldKeys.forEach(key => {
          const v = pickTypeValues[key]
          if (v === undefined) return
          if (key === 'device') {
            data.devices = [{ model: v }]
          } else {
            data[key] = v
          }
        })
        if (llm_type === 'openclaw') {
          const providersSelected = this.openclawSelectedProviders || []
          if (!providersSelected.length) {
            this.$message.warning(this.$t('aice.openclaw.provider_select_first'))
            this.loading = false
            return
          }
          const credManager = new this.$Manager('credentials', 'v1')
          const providers = []
          for (let i = 0; i < providersSelected.length; i++) {
            const providerKey = providersSelected[i]
            this.ensureProviderState(providerKey)
            const mode = this.openclawProviderCredentialMode[providerKey] || 'new'
            let credentialId
            let exportKeys
            if (mode === 'existing') {
              credentialId = this.openclawProviderCredentialId[providerKey]
              if (!credentialId) {
                this.$message.warning(this.$t('common.tips.select', [this.$t('aice.container_secret')]))
                this.loading = false
                return
              }
              exportKeys = this.openclawProviderExportKeys[providerKey] || []
            } else {
              const nameTrim = (this.openclawProviderNewCredentialName[providerKey] || '').trim()
              if (!nameTrim) {
                this.$message.warning(this.$t('common.tips.input', [this.$t('aice.openclaw.new_credential_name')]))
                this.loading = false
                return
              }
              const raw = this.openclawProviderBlob[providerKey] || {}
              const blob = {}
              Object.keys(raw).forEach(k => {
                const v = (raw[k] || '').trim()
                if (v) blob[k] = v
              })
              if (Object.keys(blob).length === 0) {
                this.$message.warning(this.$t('aice.openclaw.ai_providers.at_least_one'))
                this.loading = false
                return
              }
              const { data: credData } = await credManager.create({
                data: {
                  type: 'container_secret',
                  name: nameTrim,
                  blob,
                  __meta__: {
                    'user:openclaw_usage': 'provider',
                    'user:openclaw_name': this.providerShortName(providerKey),
                  },
                },
              })
              credentialId = credData.id
              exportKeys = Object.keys(blob)
            }
            providers.push({
              name: this.providerShortName(providerKey),
              credential: { id: credentialId, export_keys: exportKeys },
            })
          }

          const openclaw = { providers }
          const workspace_templates = {}
          const agents = (values.openclaw_agents_md || '').trim()
          const soul = (values.openclaw_soul_md || '').trim()
          const user = (values.openclaw_user_md || '').trim()
          if (agents) workspace_templates.agents_md = agents
          if (soul) workspace_templates.soul_md = soul
          if (user) workspace_templates.user_md = user
          if (Object.keys(workspace_templates).length > 0) openclaw.workspace_templates = workspace_templates
          data.llm_spec = { openclaw }
        }
        if (this.mode === 'edit' && this.onManager && this.editData) {
          if (request_sync_image) data.request_sync_image = true
          await this.onManager('update', {
            id: this.editData.id,
            managerArgs: { data },
          })
        } else {
          data.generate_name = name
          data.project_id = project?.key || this.userInfo.projectId
          await manager.create({ data })
        }
        this.$message.success(this.$t('common.success'))
        this.$emit('success')
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
.llm-sku-create-form .form-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}
.openclaw-channel-tabs { margin-top: 8px; }
.openclaw-provider-tabs { margin-top: 8px; }
.llm-type-picker ::v-deep .ant-radio-button-wrapper {
  height: 36px;
  line-height: 34px;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 8px;
}
.llm-type-picker ::v-deep .ant-radio-button-wrapper:first-child { border-radius: 4px; }
.llm-type-picker ::v-deep .ant-radio-button-wrapper:last-child { border-radius: 4px; }
.openclaw-template-item { margin-bottom: 12px; }
.openclaw-template-title { font-weight: 500; margin-bottom: 6px; }
.openclaw-section-divider { margin-top: 20px; }
.openclaw-credential-intro { color: rgba(0, 0, 0, 0.65); font-size: 13px; }
.openclaw-credential-mode { margin-bottom: 0; }
.openclaw-configured-providers { font-weight: 500; }
.openclaw-new-blob-section-title { font-weight: 600; margin-bottom: 8px; font-size: 13px; }
.openclaw-new-blob-row ::v-deep .ant-form-item-label { padding-bottom: 4px; }
.openclaw-filter-empty { padding: 12px 0; font-size: 13px; }
.openclaw-tab-with-close { display: inline-flex; align-items: center; gap: 6px; }
.openclaw-tab-close { font-size: 12px; cursor: pointer; opacity: 0.6; }
.openclaw-tab-close:hover { opacity: 1; }
</style>
