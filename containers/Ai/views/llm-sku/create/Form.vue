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
          v-if="!isEditMode"
          class="llm-type-picker"
          button-style="solid"
          v-decorator="decorators.llm_type">
          <a-radio-button v-for="opt in llmTypeOptions" :key="opt.id" :value="opt.id">
            {{ opt.name }}
          </a-radio-button>
        </a-radio-group>
        <a-label v-else>{{ llmTypeName }}</a-label>
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
      <!-- 暂时隐藏 Agent 个性化配置，恢复时将 showAgentPersonalization 改为 true -->
      <a-divider
        v-if="form.fd.llm_type === 'openclaw' && showAgentPersonalization"
        key="section-agent-personalization"
        orientation="left"
        class="openclaw-section-divider">
        {{ $t('aice.openclaw.section.agent_personalization') }}
      </a-divider>
      <a-form-item
        v-if="form.fd.llm_type === 'openclaw' && showAgentPersonalization"
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
    const isApplyType = this.$route.path.includes('app-llm')
    const llmTypeOptions = isApplyType ? LLM_TYPE_OPTIONS.filter(opt => opt.id !== 'vllm' && opt.id !== 'ollama') : LLM_TYPE_OPTIONS.filter(opt => opt.id === 'vllm' || opt.id === 'ollama')
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
    let openclawWorkspaceTemplates = openclawConfObj?.workspace_templates
    if (typeof openclawWorkspaceTemplates === 'string') {
      try { openclawWorkspaceTemplates = JSON.parse(openclawWorkspaceTemplates) } catch (e) { openclawWorkspaceTemplates = {} }
    }
    if (!openclawWorkspaceTemplates || typeof openclawWorkspaceTemplates !== 'object') openclawWorkspaceTemplates = {}
    const envVars = (envs || []).map(item => ({ env_key: item.key, env_value: item.value, key: uuid() }))
    const defaultLlmType = (llmTypeOptions[0] && llmTypeOptions[0].id) || (isApplyType ? 'openclaw' : 'ollama')
    return {
      loading: false,
      // 暂时隐藏 openclaw 创建/编辑时的「Agent 个性化配置」区块，恢复时改为 true
      showAgentPersonalization: false,
      isApplyType,
      llmTypeOptions: llmTypeOptions.map(opt => ({ id: opt.id, name: this.$t(opt.name) })),
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
            initialValue: rowLlmType || defaultLlmType,
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
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isEditMode () {
      return this.mode === 'edit'
    },
    llmTypeName () {
      const cur = this.form?.fd?.llm_type
      const opt = this.llmTypeOptions.find(o => o.id === cur)
      return (opt && opt.name) || cur || '-'
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
      const filter = ['type.equals(container_secret)']
      if (this.$store.getters.scope === 'project') {
        const uid = this.$store.getters.userInfo?.id
        if (uid) filter.push(`user_id.equals(${uid})`)
      }
      return {
        scope: this.$store.getters.scope,
        filter,
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
        this.form.fc.setFieldsValue({
          openclaw_agents_md: undefined,
          openclaw_soul_md: undefined,
          openclaw_user_md: undefined,
        })
      }
    },
  },
  methods: {
    handleCancel () {
      this.$emit('cancel')
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
        const effectiveLlmType = this.isEditMode ? this.form.fd.llm_type : llm_type
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
          llm_image_id,
          image_id: phone_image,
          cpu,
          memory: (memory ?? 2) * 1024,
          bandwidth: bandwidth ?? 100,
          volumes,
          disk_size: volumes[0].size_mb,
          app_type: 'steam',
        }
        if (!this.isEditMode) {
          data.llm_type = effectiveLlmType
          // 默认填入 llm_sku，空对象即可，如 openclaw => llm_sku: { openclaw: {} }
          data.llm_sku = { [effectiveLlmType]: {} }
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
        if (effectiveLlmType === 'openclaw') {
          const workspace_templates = {}
          const agents = (values.openclaw_agents_md || '').trim()
          const soul = (values.openclaw_soul_md || '').trim()
          const user = (values.openclaw_user_md || '').trim()
          if (agents) workspace_templates.agents_md = agents
          if (soul) workspace_templates.soul_md = soul
          if (user) workspace_templates.user_md = user
          if (Object.keys(workspace_templates).length > 0) {
            data.llm_spec = { openclaw: { workspace_templates } }
          }
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
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.openclaw-channel-tabs { margin-top: 8px; }
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
