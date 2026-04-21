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
      <template v-if="form.fd.llm_type === 'dify'">
        <a-form-item :label="$t('aice.dify_api_image')">
          <base-select
            v-decorator="decorators.dify_api_image_id"
            resource="llm_images"
            :params="{ ...appImageParams, $t: 'dify_api_image' }"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.dify_api_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_plugin_image')">
          <base-select
            v-decorator="decorators.dify_plugin_image_id"
            resource="llm_images"
            :params="{ ...appImageParams, $t: 'dify_plugin_image' }"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.dify_plugin_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_sandbox_image')">
          <base-select
            v-decorator="decorators.dify_sandbox_image_id"
            resource="llm_images"
            :params="{ ...appImageParams, $t: 'dify_sandbox_image' }"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.dify_sandbox_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_ssrf_image')">
          <base-select
            v-decorator="decorators.dify_ssrf_image_id"
            resource="llm_images"
            :params="{ ...appImageParams, $t: 'dify_ssr_image' }"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.dify_ssr_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_weaviate_image')">
          <base-select
            v-decorator="decorators.dify_weaviate_image_id"
            resource="llm_images"
            :params="{ ...appImageParams, $t: 'dify_weaviate_image' }"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.dify_weaviate_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_web_image')">
          <base-select
            v-decorator="decorators.dify_web_image_id"
            resource="llm_images"
            :params="{ ...appImageParams, $t: 'dify_web_image' }"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.dify_web_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.nginx_image')">
          <base-select
            v-decorator="decorators.nginx_image_id"
            resource="llm_images"
            :params="{ ...appImageParams, $t: 'nginx_image' }"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.nginx_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.postgres_image')">
          <base-select
            v-decorator="decorators.postgres_image_id"
            resource="llm_images"
            :params="{ ...appImageParams, $t: 'postgres_image' }"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.postgres_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.redis_image')">
          <base-select
            v-decorator="decorators.redis_image_id"
            resource="llm_images"
            :params="{ ...appImageParams, $t: 'redis_image' }"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.redis_image')]) }" />
        </a-form-item>
      </template>
      <a-form-item v-else :label="$t('aice.llm_image')">
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
        <a-form-item
          v-else-if="field.component === 'input'"
          :key="field.fieldKey"
          :label="$t(field.label)">
          <a-input
            v-decorator="decorators[field.fieldKey]"
            :placeholder="field.props && field.props.placeholderKey ? $t('common.tips.input', [$t(field.props.placeholderKey)]) : ''" />
        </a-form-item>
        <a-form-item
          v-else-if="field.component === 'customized-args'"
          :key="field.fieldKey"
          :label="$t('aice.customized_args')">
          <a-row v-for="item in customizedArgsRows" :key="item.key" :gutter="4">
            <a-col :span="11">
              <a-form-item>
                <a-input
                  v-decorator="decorators.customized_args.argKey(item.key)"
                  :placeholder="$t('common.tips.input', [$t('aice.customized_arg_key')])" />
              </a-form-item>
            </a-col>
            <a-col :span="11">
              <a-form-item>
                <a-input
                  v-decorator="decorators.customized_args.argValue(item.key)"
                  :placeholder="$t('common.tips.input', [$t('aice.customized_arg_value')])" />
              </a-form-item>
            </a-col>
            <a-col :span="2">
              <a-button shape="circle" icon="minus" size="small" @click="delCustomizedArg(item)" class="mt-2 ml-2" />
            </a-col>
          </a-row>
          <a-row>
            <a-col>
              <div class="d-flex align-items-center">
                <a-button type="primary" shape="circle" icon="plus" size="small" @click="addCustomizedArg" />
                <a-button type="link" @click="addCustomizedArg">{{ $t('aice.add_customized_arg') }}</a-button>
              </div>
            </a-col>
          </a-row>
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
      <a-form-item :label="$t('aice.container_port_mapping')" :extra="$t('aice.container_port_mapping_tip')">
        <a-row v-for="item in portMappings" :key="item.key" :gutter="4">
          <a-col :span="11">
            <a-form-item>
              <base-select
                v-decorator="decorators.port_mapppings.protocol(item.key)"
                :options="dict.protocolArr" />
            </a-form-item>
          </a-col>
          <a-col :span="11">
            <a-form-item>
              <a-input
                v-decorator="decorators.port_mapppings.container_port(item.key)"
                :placeholder="$t('common.tips.input', [$t('aice.container_port')])" />
            </a-form-item>
          </a-col>
          <a-col :span="2">
            <a-button shape="circle" icon="minus" size="small" @click="del(item)" class="mt-2 ml-2" />
          </a-col>
        </a-row>
        <a-row>
          <a-col>
            <div class="d-flex align-items-center">
              <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
              <a-button type="link" @click="add">{{$t('aice.add_port_mapping')}}</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form-item>

      <a-form-item :label="$t('aice.host_paths')" :extra="$t('aice.host_paths.extra')">
        <div v-for="hp in hostPathRows" :key="hp.key" style="display: flex; align-items: stretch; gap: 10px; margin-bottom: 12px;">
          <div style="flex: 1; border: 1px solid #e8e8e8; border-radius: 4px; padding: 12px;">
            <a-row :gutter="8">
              <a-col :span="8">
                <a-form-item>
                  <fixed-label-filter :label="$t('aice.host_paths.type')">
                    <a-select v-decorator="decorators.host_paths.type(hp.key)" :placeholder="$t('common.tips.select', [$t('aice.host_paths.type')])">
                      <a-select-option value="directory">directory</a-select-option>
                      <a-select-option value="file">file</a-select-option>
                    </a-select>
                  </fixed-label-filter>
                </a-form-item>
              </a-col>
              <a-col :span="16">
                <a-form-item>
                  <fixed-label-filter :label="$t('aice.host_paths.path')">
                    <a-input v-decorator="decorators.host_paths.path(hp.key)" :placeholder="$t('aice.host_paths.path.placeholder')" />
                  </fixed-label-filter>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="8">
              <a-col :span="24">
                <a-form-item>
                  <a-checkbox v-decorator="decorators.host_paths.auto_create(hp.key)">{{ $t('aice.host_paths.auto_create') }}</a-checkbox>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="8" v-if="form.fc.getFieldValue(`host_path_auto_create_${hp.key}`)">
              <a-col :span="8">
                <a-form-item>
                  <fixed-label-filter :label="$t('aice.host_paths.auto_create_config.uid')">
                    <a-input v-decorator="decorators.host_paths.auto_uid(hp.key)" :placeholder="$t('aice.host_paths.auto_create_config.uid.placeholder')" />
                  </fixed-label-filter>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item>
                  <fixed-label-filter :label="$t('aice.host_paths.auto_create_config.gid')">
                    <a-input v-decorator="decorators.host_paths.auto_gid(hp.key)" :placeholder="$t('aice.host_paths.auto_create_config.gid.placeholder')" />
                  </fixed-label-filter>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item>
                  <fixed-label-filter :label="$t('aice.host_paths.permissions')">
                    <a-input v-decorator="decorators.host_paths.auto_perm(hp.key)" :placeholder="$t('aice.host_paths.permissions.placeholder')" />
                  </fixed-label-filter>
                </a-form-item>
              </a-col>
            </a-row>

            <div style="margin: 8px 0; font-weight: 500;">{{ $t('aice.host_paths.containers') }}</div>
            <div v-for="c in hp.containerRows" :key="c.key">
              <a-row :gutter="8">
                <a-col :span="8">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.container_index')">
                      <a-input v-decorator="decorators.host_paths.container_index(hp.key, c.key)" :placeholder="$t('aice.host_paths.container_index.placeholder')" />
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.mount_path')">
                      <a-input v-decorator="decorators.host_paths.mount_path(hp.key, c.key)" :placeholder="$t('aice.host_paths.mount_path.placeholder')" />
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.propagation')">
                      <a-select v-decorator="decorators.host_paths.propagation(hp.key, c.key)" :placeholder="$t('common.tips.select', [$t('aice.host_paths.propagation')])">
                        <a-select-option value="private">private</a-select-option>
                        <a-select-option value="rslave">rslave</a-select-option>
                        <a-select-option value="rshared">rshared</a-select-option>
                      </a-select>
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
                <!-- <a-col :span="2">
                  <a-button shape="circle" icon="minus" size="small" class="mt-2 ml-2" @click="delHostPathContainer(hp, c)" />
                </a-col> -->
              </a-row>
              <a-row :gutter="8">
                <a-col :span="4">
                  <a-form-item>
                    <a-checkbox v-decorator="decorators.host_paths.read_only(hp.key, c.key)">{{ $t('aice.host_paths.read_only') }}</a-checkbox>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- <div class="d-flex align-items-center">
              <a-button type="primary" shape="circle" icon="plus" size="small" @click="addHostPathContainer(hp)" />
              <a-button type="link" @click="addHostPathContainer(hp)">添加容器挂载</a-button>
            </div> -->
          </div>

          <div style="width: 34px; display: flex; align-items: center; justify-content: center;">
            <a-button shape="circle" icon="minus" size="small" @click="delHostPath(hp)" />
          </div>
        </div>

        <div class="d-flex align-items-center">
          <a-button type="primary" shape="circle" icon="plus" size="small" @click="addHostPath" />
          <a-button type="link" @click="addHostPath">{{ $t('aice.host_paths.add') }}</a-button>
        </div>
      </a-form-item>

    </a-form>
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

const getInitVal = (list, key, property) => {
  const target = list.filter(item => item.key === key)
  return target.length ? target[0][property] : ''
}

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
      port_mappings = [],
      preferred_model: rowPreferredModel,
      host_paths: hostPaths = [],
    } = data
    const preferredModelInit = rowPreferredModel != null && rowPreferredModel !== ''
      ? String(rowPreferredModel)
      : (llmSpec?.vllm?.preferred_model != null ? String(llmSpec.vllm.preferred_model) : '')
    const {
      dify_api_image_id,
      dify_plugin_image_id,
      dify_sandbox_image_id,
      dify_ssrf_image_id,
      dify_weaviate_image_id,
      dify_web_image_id,
      nginx_image_id,
      postgres_image_id,
      redis_image_id,
    } = llmSpec?.dify || {}
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
    const portMappings = port_mappings.map(item => ({ ...item, key: uuid() }))
    const hostPathRows = (Array.isArray(hostPaths) ? hostPaths : []).map(hp => {
      const containerRows = hp && hp.containers && typeof hp.containers === 'object'
        ? Object.keys(hp.containers).map(k => ({ key: uuid(), containerIndex: String(k), ...(hp.containers[k] || {}) }))
        : []
      return {
        key: uuid(),
        ...hp,
        containerRows: containerRows.length ? containerRows : [{ key: uuid() }],
      }
    })
    const getHostPathRow = (rowKey) => hostPathRows.find(hp => hp.key === rowKey)
    const getHostPathContainerRow = (hpKey, cKey) => {
      const hp = getHostPathRow(hpKey)
      return hp && Array.isArray(hp.containerRows) ? hp.containerRows.find(c => c.key === cKey) : undefined
    }
    let customizedArgsSource = data.customized_args ?? llmSpec?.vllm?.customized_args ?? []
    if (!Array.isArray(customizedArgsSource)) customizedArgsSource = []
    const customizedArgsRows = customizedArgsSource.map((row) => ({
      key: uuid(),
      argKey: row != null && row.key != null ? String(row.key) : '',
      argValue: row != null && row.value != null ? String(row.value) : '',
    }))
    return {
      loading: false,
      // 暂时隐藏 openclaw 创建/编辑时的「Agent 个性化配置」区块，恢复时改为 true
      showAgentPersonalization: false,
      isApplyType,
      llmTypeOptions: llmTypeOptions.map(opt => ({ id: opt.id, name: this.$t(opt.name) })),
      dict,
      portMappings,
      hostPathRows: hostPathRows.length ? hostPathRows : [],
      customizedArgsRows,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
          // 须与 decorators.llm_type.initialValue 一致，否则 currentTypeFields / v-if 与真实选中类型不同步，初始化不展示类型字段
          llm_type: rowLlmType || defaultLlmType,
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
        dify_api_image_id: [
          'dify_api_image_id',
          {
            initialValue: dify_api_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_api_image')]) },
            ],
          },
        ],
        dify_plugin_image_id: [
          'dify_plugin_image_id',
          {
            initialValue: dify_plugin_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_plugin_image')]) },
            ],
          },
        ],
        dify_sandbox_image_id: [
          'dify_sandbox_image_id',
          {
            initialValue: dify_sandbox_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_sandbox_image')]) },
            ],
          },
        ],
        dify_ssrf_image_id: [
          'dify_ssrf_image_id',
          {
            initialValue: dify_ssrf_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_ssr_image')]) },
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
        dify_weaviate_image_id: [
          'dify_weaviate_image_id',
          {
            initialValue: dify_weaviate_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_weaviate_image')]) },
            ],
          },
        ],
        dify_web_image_id: [
          'dify_web_image_id',
          {
            initialValue: dify_web_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_web_image')]) },
            ],
          },
        ],
        nginx_image_id: [
          'nginx_image_id',
          {
            initialValue: nginx_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.nginx_image')]) },
            ],
          },
        ],
        postgres_image_id: [
          'postgres_image_id',
          {
            initialValue: postgres_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.postgres_image')]) },
            ],
          },
        ],
        redis_image_id: [
          'redis_image_id',
          {
            initialValue: redis_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.redis_image')]) },
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
        preferred_model: [
          'preferred_model',
          {
            initialValue: preferredModelInit,
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
            initialValue: devices && devices.length > 0 ? devices.map(v => v.model) : [],
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
        port_mapppings: {
          protocol: i => [
            `protocol[${i}]`,
            {
              initialValue: getInitVal(portMappings, i, 'protocol'),
            },
          ],
          container_port: i => [
            `container_port[${i}]`,
            {
              initialValue: getInitVal(portMappings, i, 'container_port'),
              rules: [
                { type: 'number', min: 0, max: 65535, message: this.$t('aice.container_port.message'), trigger: 'blur', transform: (v) => parseInt(v) },
              ],
            },
          ],
        },
        customized_args: {
          argKey: rowKey => [
            `customized_arg_key[${rowKey}]`,
            { initialValue: getInitVal(customizedArgsRows, rowKey, 'argKey') },
          ],
          argValue: rowKey => [
            `customized_arg_value[${rowKey}]`,
            { initialValue: getInitVal(customizedArgsRows, rowKey, 'argValue') },
          ],
        },
        host_paths: {
          type: rowKey => [
            `host_path_type_${rowKey}`,
            {
              initialValue: getHostPathRow(rowKey)?.type,
              rules: [{ required: true, message: this.$t('aice.host_paths.type.required') }],
            },
          ],
          path: rowKey => [
            `host_path_path_${rowKey}`,
            {
              initialValue: getHostPathRow(rowKey)?.path,
              rules: [{ required: true, message: this.$t('aice.host_paths.path.required') }],
            },
          ],
          auto_create: rowKey => [
            `host_path_auto_create_${rowKey}`,
            { valuePropName: 'checked', initialValue: !!getHostPathRow(rowKey)?.auto_create },
          ],
          auto_uid: rowKey => [
            `host_path_auto_uid_${rowKey}`,
            { initialValue: getHostPathRow(rowKey)?.auto_create_config?.uid },
          ],
          auto_gid: rowKey => [
            `host_path_auto_gid_${rowKey}`,
            { initialValue: getHostPathRow(rowKey)?.auto_create_config?.gid },
          ],
          auto_perm: rowKey => [
            `host_path_auto_perm_${rowKey}`,
            { initialValue: getHostPathRow(rowKey)?.auto_create_config?.permissions },
          ],
          container_index: (hpKey, cKey) => [
            `host_path_container_index_${hpKey}__${cKey}`,
            {
              initialValue: getHostPathContainerRow(hpKey, cKey)?.containerIndex,
              rules: [{ required: true, message: this.$t('aice.host_paths.container_index.required') }],
            },
          ],
          mount_path: (hpKey, cKey) => [
            `host_path_mount_path_${hpKey}__${cKey}`,
            {
              initialValue: getHostPathContainerRow(hpKey, cKey)?.mount_path,
              rules: [{ required: true, message: this.$t('aice.host_paths.mount_path.required') }],
            },
          ],
          read_only: (hpKey, cKey) => [
            `host_path_read_only_${hpKey}__${cKey}`,
            { valuePropName: 'checked', initialValue: !!getHostPathContainerRow(hpKey, cKey)?.read_only },
          ],
          propagation: (hpKey, cKey) => [
            `host_path_propagation_${hpKey}__${cKey}`,
            { initialValue: getHostPathContainerRow(hpKey, cKey)?.propagation },
          ],
          fs_user: (hpKey, cKey) => [
            `host_path_fs_user_${hpKey}__${cKey}`,
            { initialValue: getHostPathContainerRow(hpKey, cKey)?.fs_user },
          ],
          fs_group: (hpKey, cKey) => [
            `host_path_fs_group_${hpKey}__${cKey}`,
            { initialValue: getHostPathContainerRow(hpKey, cKey)?.fs_group },
          ],
        },
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
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
      const base = LLM_TYPE_FORM_CONFIG[type] || []
      if (type !== 'vllm') return base
      const out = []
      base.forEach((f) => {
        out.push(f)
        if (f.fieldKey === 'preferred_model') {
          out.push({ fieldKey: '__customized_args__', component: 'customized-args' })
        }
      })
      return out
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
    add () {
      this.portMappings.push({ key: uuid() })
    },
    del (item) {
      const idx = this.portMappings.findIndex(v => v.key === item.key)
      this.portMappings.splice(idx, 1)
    },
    addCustomizedArg () {
      this.customizedArgsRows.push({ key: uuid(), argKey: '', argValue: '' })
    },
    delCustomizedArg (item) {
      const idx = this.customizedArgsRows.findIndex(v => v.key === item.key)
      if (idx >= 0) this.customizedArgsRows.splice(idx, 1)
    },
    addHostPath () {
      this.hostPathRows.push({ key: uuid(), containerRows: [{ key: uuid() }] })
    },
    delHostPath (hp) {
      const idx = this.hostPathRows.findIndex(v => v.key === hp.key)
      if (idx >= 0) this.hostPathRows.splice(idx, 1)
    },
    addHostPathContainer (hp) {
      if (!hp.containerRows) this.$set(hp, 'containerRows', [])
      hp.containerRows.push({ key: uuid() })
    },
    delHostPathContainer (hp, c) {
      const rows = hp.containerRows || []
      const idx = rows.findIndex(v => v.key === c.key)
      if (idx >= 0) rows.splice(idx, 1)
    },
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
          dify_api_image_id,
          dify_plugin_image_id,
          dify_sandbox_image_id,
          dify_ssrf_image_id,
          dify_weaviate_image_id,
          dify_web_image_id,
          nginx_image_id,
          postgres_image_id,
          redis_image_id,
          cpu,
          memory,
          volume_size,
          bandwidth,
          protocol,
          container_port,
          customized_arg_key,
          customized_arg_value,
        } = values
        const effectiveLlmType = this.isEditMode ? this.form.fd.llm_type : llm_type
        const typeFields = this.currentTypeFields
        const typeFieldKeys = typeFields.filter(f => f.fieldKey !== '__customized_args__').map(f => f.fieldKey)
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
        const port_mappings = this.portMappings.map(item => {
          return {
            protocol: protocol[item.key],
            container_port: container_port[item.key],
          }
        })
        const host_paths = this.hostPathRows.map(hp => {
          const hpKey = hp.key
          const type = values[`host_path_type_${hpKey}`]
          const path = values[`host_path_path_${hpKey}`]
          const autoCreate = !!values[`host_path_auto_create_${hpKey}`]
          const out = { type, path }
          if (autoCreate) {
            out.auto_create = true
            const uid = values[`host_path_auto_uid_${hpKey}`]
            const gid = values[`host_path_auto_gid_${hpKey}`]
            const perm = values[`host_path_auto_perm_${hpKey}`]
            const cfg = {}
            if (uid !== undefined && uid !== null && uid !== '') cfg.uid = uid
            if (gid !== undefined && gid !== null && gid !== '') cfg.gid = gid
            if (perm != null && String(perm).trim() !== '') cfg.permissions = String(perm).trim()
            if (Object.keys(cfg).length > 0) out.auto_create_config = cfg
          }
          const containers = {}
          ;(hp.containerRows || []).forEach(c => {
            const composite = `${hpKey}__${c.key}`
            const idx = values[`host_path_container_index_${composite}`]
            const mountPath = values[`host_path_mount_path_${composite}`]
            if (idx == null || mountPath == null || String(mountPath).trim() === '') return
            const k = String(idx).trim()
            if (!k) return
            const m = { mount_path: String(mountPath).trim(), read_only: !!values[`host_path_read_only_${composite}`] }
            const prop = values[`host_path_propagation_${composite}`]
            if (prop != null && String(prop).trim() !== '') m.propagation = String(prop).trim()
            const fu = values[`host_path_fs_user_${composite}`]
            const fg = values[`host_path_fs_group_${composite}`]
            if (fu !== undefined && fu !== null && fu !== '') m.fs_user = fu
            if (fg !== undefined && fg !== null && fg !== '') m.fs_group = fg
            containers[k] = m
          })
          if (Object.keys(containers).length > 0) out.containers = containers
          return out
        }).filter(v => v && v.type && v.path)
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
        if (port_mappings.length > 0) {
          data.port_mappings = port_mappings
        }
        if (host_paths.length > 0) {
          data.host_paths = host_paths
        }
        if (!this.isEditMode) {
          data.llm_type = effectiveLlmType
          // 默认填入 llm_sku，空对象即可，如 openclaw => llm_sku: { openclaw: {} }
          data.llm_sku = { [effectiveLlmType]: {} }
        }
        typeFieldKeys.forEach(key => {
          const v = pickTypeValues[key]
          if (v === undefined) return
          if (effectiveLlmType === 'vllm' && key === 'preferred_model') return
          if (key === 'device') {
            data.devices = v.map(k => ({ model: k }))
          } else {
            data[key] = v
          }
        })
        if (effectiveLlmType === 'vllm') {
          const vllm = {}
          const pm = pickTypeValues.preferred_model
          const preferredStr = pm != null ? String(pm).trim() : ''
          if (preferredStr !== '') {
            vllm.preferred_model = preferredStr
          }
          const customized_args = this.customizedArgsRows
            .map((item) => ({
              key: customized_arg_key?.[item.key] != null ? String(customized_arg_key[item.key]).trim() : '',
              value: customized_arg_value?.[item.key] != null ? String(customized_arg_value[item.key]).trim() : '',
            }))
            .filter((row) => row.key !== '' || row.value !== '')
          if (customized_args.length > 0) {
            vllm.customized_args = customized_args
          }
          if (Object.keys(vllm).length > 0) {
            data.llm_spec = { vllm }
          }
        }
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
        if (effectiveLlmType === 'dify') {
          data.llm_spec = {
            dify: {
              dify_api_image_id: dify_api_image_id,
              dify_plugin_image_id: dify_plugin_image_id,
              dify_sandbox_image_id: dify_sandbox_image_id,
              dify_ssrf_image_id: dify_ssrf_image_id,
              dify_weaviate_image_id: dify_weaviate_image_id,
              dify_web_image_id: dify_web_image_id,
              nginx_image_id: nginx_image_id,
              postgres_image_id: postgres_image_id,
              redis_image_id: redis_image_id,
            },
          }
          delete data.llm_image_id
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
