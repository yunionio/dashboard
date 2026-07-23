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
          v-if="!isEditMode && !isCatalogMode"
          class="llm-type-picker"
          button-style="solid"
          v-decorator="decorators.llm_type"
          @change="onLlmTypeChange">
          <a-radio-button v-for="opt in llmTypeOptions" :key="opt.id" :value="opt.id">
            {{ opt.name }}
          </a-radio-button>
        </a-radio-group>
        <a-label v-else-if="isEditMode || isCatalogMode">{{ llmTypeName }}</a-label>
      </a-form-item>
      <template v-if="form.fd.llm_type === 'dify'">
        <a-form-item :label="$t('aice.dify_api_image')">
          <llm-image-select
            v-decorator="decorators.dify_api_image_id"
            :params="{ ...appImageParams, $t: 'dify_api_image' }"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.dify_api_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_plugin_image')">
          <llm-image-select
            v-decorator="decorators.dify_plugin_image_id"
            :params="{ ...appImageParams, $t: 'dify_plugin_image' }"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.dify_plugin_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_sandbox_image')">
          <llm-image-select
            v-decorator="decorators.dify_sandbox_image_id"
            :params="{ ...appImageParams, $t: 'dify_sandbox_image' }"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.dify_sandbox_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_ssrf_image')">
          <llm-image-select
            v-decorator="decorators.dify_ssrf_image_id"
            :params="{ ...appImageParams, $t: 'dify_ssr_image' }"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.dify_ssr_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_weaviate_image')">
          <llm-image-select
            v-decorator="decorators.dify_weaviate_image_id"
            :params="{ ...appImageParams, $t: 'dify_weaviate_image' }"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.dify_weaviate_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.dify_web_image')">
          <llm-image-select
            v-decorator="decorators.dify_web_image_id"
            :params="{ ...appImageParams, $t: 'dify_web_image' }"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.dify_web_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.nginx_image')">
          <llm-image-select
            v-decorator="decorators.nginx_image_id"
            :params="{ ...appImageParams, $t: 'nginx_image' }"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.nginx_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.postgres_image')">
          <llm-image-select
            v-decorator="decorators.postgres_image_id"
            :params="{ ...appImageParams, $t: 'postgres_image' }"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.postgres_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.redis_image')">
          <llm-image-select
            v-decorator="decorators.redis_image_id"
            :params="{ ...appImageParams, $t: 'redis_image' }"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.redis_image')]) }" />
        </a-form-item>
      </template>
      <a-form-item v-else :label="$t('aice.llm_image')">
        <catalog-llm-image-select
          v-if="isCatalogImportMode"
          ref="catalogImageSelect"
          v-decorator="decorators.llm_image_id"
          :llm-type="catalogLlmType"
          :auto-select-default="false"
          :select-props="{ placeholder: $t('common.tips.select', [$t('aice.llm_image')]) }"
          @catalog-loaded="onCatalogImagesLoaded" />
        <llm-image-select
          v-else
          v-decorator="decorators.llm_image_id"
          :params="appImageParams"
          :select-props="{ placeholder: $t('common.tips.select', [$t('aice.llm_image')]) }" />
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
        <a-form-item
          v-else-if="field.component === 'llm-gpu-devices-editor'"
          :key="field.fieldKey"
          :label="$t(field.label)">
          <llm-gpu-devices-editor
            v-decorator="decorators[field.fieldKey]" />
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
          :label="$t('aice.backend_parameters')">
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
          <div class="text-color-help">{{ $t('aice.backend_parameters.help') }}</div>
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

      <a-form-item
        v-if="isLocalPathImportMode"
        :label="$t('aice.local_path_import.prefer_hosts')"
        :extra="$t('aice.local_path_import.prefer_hosts_extra')">
        <base-select
          v-decorator="decorators.prefer_hosts"
          resource="hosts"
          :params="localPathHostParams"
          :select-props="{
            mode: 'multiple',
            placeholder: $t('common.tips.select', [$t('dictionary.host')]),
          }" />
      </a-form-item>
      <a-form-item
        v-if="isLocalPathImportMode"
        :label="$t('aice.local_path_import.host_model_path')"
        :extra="$t('aice.local_path_import.host_model_path_extra')">
        <a-input
          v-decorator="decorators.local_path"
          :placeholder="$t('aice.local_path_import.host_model_path_placeholder')"
          @change="onLocalPathInputChange" />
        <a-alert
          v-if="localPathMountPreview"
          type="info"
          show-icon
          class="mt-2"
          :message="$t('aice.local_path_import.mount_preview', [localPathMountPreview.hostPath, localPathMountPreview.mountPath])" />
        <a-button
          v-if="!localPathAdvancedHostPaths"
          type="link"
          class="mt-1 pl-0"
          @click="enableLocalPathAdvancedHostPaths">
          {{ $t('aice.local_path_import.advanced_host_paths') }}
        </a-button>
      </a-form-item>

      <a-form-item v-if="!isLocalPathImportMode || localPathAdvancedHostPaths" :label="$t('aice.host_paths')" :extra="$t('aice.host_paths.extra')">
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
            <a-row :gutter="8" v-if="form.fd[`host_path_auto_create_${hp.key}`]">
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
                <a-col :span="8" v-if="isApplyType">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.container_index')">
                      <a-input v-decorator="decorators.host_paths.container_index(hp.key, c.key)" :placeholder="$t('aice.host_paths.container_index.placeholder')" />
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
                <a-col :span="isApplyType ? 8 : 12">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.mount_path')">
                      <a-input v-decorator="decorators.host_paths.mount_path(hp.key, c.key)" :placeholder="$t('aice.host_paths.mount_path.placeholder')" />
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
                <a-col :span="isApplyType ? 8 : 12">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.propagation')">
                      <a-select v-decorator="decorators.host_paths.propagation(hp.key, c.key)" :placeholder="$t('common.tips.select', [$t('aice.host_paths.propagation')])" optionLabelProp="label" :dropdownMatchSelectWidth="false">
                        <a-select-option value="private" label="private">private - {{ $t('aice.host_paths.propagation.private') }}</a-select-option>
                        <a-select-option value="rslave" label="rslave">rslave - {{ $t('aice.host_paths.propagation.rslave') }}</a-select-option>
                        <a-select-option value="rshared" label="rshared">rshared - {{ $t('aice.host_paths.propagation.rshared') }}</a-select-option>
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
import LlmImageSelect from '@Ai/sections/LlmImageSelect'
import CatalogLlmImageSelect from '@Ai/sections/CatalogLlmImageSelect'
import LlmGpuDevicesEditor from '@Ai/sections/LlmGpuDevicesEditor'
import {
  buildCatalogImageGroups,
  fetchCommunityImageItems,
  getCatalogImportFormDefaults,
  isBundleItem,
  listLocalLlmImages,
  resolveCatalogImageValue,
} from '@Ai/utils/communityImages'
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'
import {
  backendToLlmType,
  buildCatalogSkuModelParams,
  buildHuggingfaceSkuImportParams,
  buildInstantModelCreateData,
  catalogTypeUsesMountedModels,
  defaultNameFromSpec,
  getCatalogMountedModelIds,
  getCatalogSpecId,
  getPreferredModelFromSpec,
} from '@Ai/utils/catalogSpec'
import {
  buildLocalPathHostPaths,
  describeLocalPathMount,
  getLocalPathPreferredModel,
  normalizePreferHosts,
} from '@Ai/utils/localPathImport'
import {
  aggregateDevicesToRows,
  createEmptyDeviceRow,
  expandRowsToDevices,
  isValidDeviceRows,
} from '@Ai/utils/deviceFormUtils'
import {
  formValuesToBackendParameters,
  mergeBackendParameters,
  normalizeCatalogBackendParameters,
  resolveSkuBackendParameters,
} from '@Ai/utils/backendParameters'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated'
import { isRequired } from '@/utils/validate'
import { uuid } from '@/utils/utils'
import { dict } from '../constants/constant'
import { LLM_TYPE_OPTIONS, LLM_TYPE_FORM_CONFIG, getParamsForType, getDefaultPortMappingsForType, getDefaultSkuSpecForType } from '../constants/llmTypeConfig'

const getInitVal = (list, key, property) => {
  const target = list.filter(item => item.key === key)
  return target.length ? target[0][property] : ''
}

export default {
  name: 'LlmSkuCreateForm',
  components: {
    DomainProject,
    LlmImageSelect,
    CatalogLlmImageSelect,
    LlmGpuDevicesEditor,
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
    catalogSet: {
      type: Object,
      default: null,
    },
    catalogSpec: {
      type: Object,
      default: null,
    },
    catalogSubmitType: {
      type: String,
      default: 'import',
    },
    importMode: {
      type: String,
      default: null,
    },
  },
  data () {
    const data = this.mode === 'edit' && this.editData ? this.editData : {}
    const llmRouteCtx = parseLlmRoute(this.$route.path)
    const isApplyType = llmRouteCtx.isApplyType
    const isDesktopType = llmRouteCtx.isDesktopType
    const catalogLlmTypeInit = this.catalogSpec ? backendToLlmType(this.catalogSpec.backend) : null
    const catalogResourceDefaults = this.catalogSpec ? { cpu: 4, memory: 8192 } : null
    const isLocalPathImportInit = this.importMode === 'local_path'
    const localPathResourceDefaults = isLocalPathImportInit
      ? { ...getDefaultSkuSpecForType('vllm'), memory: 8192 }
      : null
    let llmTypeOptions
    if (isDesktopType) {
      llmTypeOptions = LLM_TYPE_OPTIONS.filter(opt => opt.id === 'desktop')
    } else if (isApplyType) {
      llmTypeOptions = LLM_TYPE_OPTIONS.filter(opt => !['vllm', 'ollama', 'sglang', 'desktop'].includes(opt.id))
    } else if (isLocalPathImportInit) {
      llmTypeOptions = LLM_TYPE_OPTIONS.filter(opt => ['vllm', 'sglang'].includes(opt.id))
    } else {
      llmTypeOptions = LLM_TYPE_OPTIONS.filter(opt => ['vllm', 'ollama', 'sglang'].includes(opt.id))
    }
    const {
      domain_id,
      project_domain,
      tenant_id,
      tenant,
      name,
      llm_type: rowLlmType,
      cpu = localPathResourceDefaults?.cpu ?? catalogResourceDefaults?.cpu ?? 2,
      memory = localPathResourceDefaults?.memory ?? catalogResourceDefaults?.memory ?? 2048,
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
    const defaultLlmTypeForInit = catalogLlmTypeInit || (llmTypeOptions[0] && llmTypeOptions[0].id) || (isDesktopType ? 'desktop' : (isApplyType ? 'openclaw' : 'ollama'))
    const initialLlmTypeForSpec = catalogLlmTypeInit || rowLlmType || defaultLlmTypeForInit
    const catalogNameInit = this.catalogSpec
      ? defaultNameFromSpec(this.catalogSpec, this.catalogSet, catalogLlmTypeInit)
      : null
    const isCatalogImport = !!getCatalogSpecId(this.catalogSpec) && this.catalogSubmitType === 'import'
    const isLocalPathImport = this.importMode === 'local_path'
    const deviceRowsInit = aggregateDevicesToRows(devices)
    const deviceInitialValue = deviceRowsInit.length ? deviceRowsInit : [createEmptyDeviceRow()]
    const typeLlmSpec = (llmSpec && (initialLlmTypeForSpec === 'vllm' || initialLlmTypeForSpec === 'sglang') && llmSpec[initialLlmTypeForSpec])
      ? llmSpec[initialLlmTypeForSpec]
      : {}
    const catalogPreferredInit = this.catalogSpec ? getPreferredModelFromSpec(this.catalogSpec) : ''
    const preferredModelInit = catalogPreferredInit
      ? String(catalogPreferredInit)
      : (rowPreferredModel != null && rowPreferredModel !== ''
        ? String(rowPreferredModel)
        : (typeLlmSpec.preferred_model != null ? String(typeLlmSpec.preferred_model) : ''))
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
    const defaultLlmType = defaultLlmTypeForInit
    // edit 模式沿用已有 port_mappings；create 模式按所选 llm_type 预填默认端口（用户可删除/新增）
    const initialLlmType = initialLlmTypeForSpec
    const portMappingsSource = (this.mode === 'edit')
      ? port_mappings
      : (port_mappings.length > 0 ? port_mappings : getDefaultPortMappingsForType(initialLlmType))
    const portMappings = portMappingsSource.map(item => ({ ...item, key: uuid() }))
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
    const customizedArgsSource = resolveSkuBackendParameters(data, initialLlmTypeForSpec)
    const customizedArgsRows = customizedArgsSource.map((row) => ({
      key: uuid(),
      argKey: row != null && row.key != null ? String(row.key) : '',
      argValue: row != null && row.value != null ? String(row.value) : '',
    }))
    return {
      loading: false,
      // 暂时隐藏 openclaw 创建/编辑时的「Agent 个性化配置」区块，恢复时改为 true
      showAgentPersonalization: false,
      llmRouteCtx,
      isApplyType,
      isDesktopType,
      llmTypeOptions: llmTypeOptions.map(opt => ({ id: opt.id, name: this.$t(opt.name) })),
      dict,
      portMappings,
      hostPathRows: hostPathRows.length ? hostPathRows : [],
      localPathAdvancedHostPaths: false,
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
            initialValue: catalogNameInit || name,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) },
            ],
          },
        ],
        local_path: [
          'local_path',
          {
            initialValue: '',
            rules: [
              { required: true, message: this.$t('aice.local_path_import.path_required') },
              { pattern: /^\//, message: this.$t('aice.local_path_import.path_absolute') },
            ],
          },
        ],
        prefer_hosts: [
          'prefer_hosts',
          {
            initialValue: [],
            rules: [
              {
                type: 'array',
                required: true,
                min: 1,
                message: this.$t('aice.local_path_import.prefer_hosts_required'),
              },
            ],
          },
        ],
        llm_image_id: [
          'llm_image_id',
          {
            initialValue: isCatalogImport ? undefined : llm_image_id,
            trigger: 'input',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_image')]) },
            ],
          },
        ],
        dify_api_image_id: [
          'dify_api_image_id',
          {
            initialValue: dify_api_image_id,
            trigger: 'input',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_api_image')]) },
            ],
          },
        ],
        dify_plugin_image_id: [
          'dify_plugin_image_id',
          {
            initialValue: dify_plugin_image_id,
            trigger: 'input',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_plugin_image')]) },
            ],
          },
        ],
        dify_sandbox_image_id: [
          'dify_sandbox_image_id',
          {
            initialValue: dify_sandbox_image_id,
            trigger: 'input',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_sandbox_image')]) },
            ],
          },
        ],
        dify_ssrf_image_id: [
          'dify_ssrf_image_id',
          {
            initialValue: dify_ssrf_image_id,
            trigger: 'input',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_ssr_image')]) },
            ],
          },
        ],
        llm_type: [
          'llm_type',
          {
            initialValue: catalogLlmTypeInit || rowLlmType || defaultLlmType,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_type')]) },
            ],
          },
        ],
        dify_weaviate_image_id: [
          'dify_weaviate_image_id',
          {
            initialValue: dify_weaviate_image_id,
            trigger: 'input',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_weaviate_image')]) },
            ],
          },
        ],
        dify_web_image_id: [
          'dify_web_image_id',
          {
            initialValue: dify_web_image_id,
            trigger: 'input',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.dify_web_image')]) },
            ],
          },
        ],
        nginx_image_id: [
          'nginx_image_id',
          {
            initialValue: nginx_image_id,
            trigger: 'input',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.nginx_image')]) },
            ],
          },
        ],
        postgres_image_id: [
          'postgres_image_id',
          {
            initialValue: postgres_image_id,
            trigger: 'input',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.postgres_image')]) },
            ],
          },
        ],
        redis_image_id: [
          'redis_image_id',
          {
            initialValue: redis_image_id,
            trigger: 'input',
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
            initialValue: mounted_models || [],
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
            initialValue: deviceInitialValue,
            valuePropName: 'value',
            trigger: 'change',
            rules: [
              {
                validator: (rule, value, callback) => {
                  const type = (this.isCatalogMode || this.isLocalPathImportMode)
                    ? this.catalogLlmType
                    : (this.form?.fd?.llm_type)
                  const field = (LLM_TYPE_FORM_CONFIG[type] || []).find(f => f.fieldKey === 'device')
                  const hasInjectedDevice = (this.isCatalogMode && this.catalogSubmitType === 'import' && !this.isApplyType && !this.isDesktopType) || this.isLocalPathSku
                  const required = !!(field?.rules?.some(r => r.required) || hasInjectedDevice || isCatalogImport || isLocalPathImport)
                  if (!isValidDeviceRows(value, { allowEmpty: !required })) {
                    callback(new Error(this.$t('common.tips.select', [this.$t('aice.devices')])))
                    return
                  }
                  callback()
                },
                trigger: 'change',
              },
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
              initialValue: getHostPathRow(rowKey)?.type || 'directory',
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
              initialValue: getHostPathContainerRow(hpKey, cKey)?.containerIndex ?? (isApplyType ? undefined : 0),
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
            { initialValue: getHostPathContainerRow(hpKey, cKey)?.propagation || 'rslave' },
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
      catalogImageItemsById: {},
      catalogImportDefaultsApplied: false,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isCatalogImportMode () {
      return this.isCatalogMode && this.catalogSubmitType === 'import' && !this.isApplyType && !this.isDesktopType && !this.isLocalPathImportMode
    },
    isLocalPathImportMode () {
      return this.importMode === 'local_path'
    },
    isLocalPathSku () {
      if (this.isLocalPathImportMode) return true
      if (!this.isEditMode) return false
      const source = this.editData?.source ?? this.form?.fd?.source
      return String(source || '').trim() === 'local_path'
    },
    localPathMountPreview () {
      if (!this.isLocalPathImportMode) return null
      const path = String(this.form.fd.local_path || '').trim()
      if (!path) return null
      return describeLocalPathMount(path, this.form.fd.llm_type || 'vllm')
    },
    localPathHostParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        host_status: 'online',
        host_type: 'container',
      }
    },
    isEditMode () {
      return this.mode === 'edit'
    },
    isCatalogMode () {
      return !!getCatalogSpecId(this.catalogSpec)
    },
    catalogLlmType () {
      if (this.isLocalPathImportMode) return this.form?.fd?.llm_type || 'vllm'
      return this.catalogSpec ? backendToLlmType(this.catalogSpec.backend) : ''
    },
    llmTypeName () {
      const cur = (this.isCatalogMode || this.isLocalPathImportMode) ? this.catalogLlmType : this.form?.fd?.llm_type
      const opt = this.llmTypeOptions.find(o => o.id === cur)
      return (opt && this.$t(opt.name)) || cur || '-'
    },
    currentTypeFields () {
      const type = (this.isCatalogMode || this.isLocalPathImportMode) ? this.catalogLlmType : (this.form.fd.llm_type || 'ollama')
      let base = LLM_TYPE_FORM_CONFIG[type] || []
      if (this.isCatalogMode) {
        base = base.filter(f => f.fieldKey !== 'mounted_models' && f.fieldKey !== 'preferred_model')
      }
      if (this.isLocalPathSku) {
        base = base.filter(f => f.fieldKey !== 'mounted_models' && f.fieldKey !== 'preferred_model')
      }
      if ((this.isCatalogMode && this.catalogSubmitType === 'import' && !this.isApplyType && !this.isDesktopType) || this.isLocalPathSku) {
        if (!base.some(f => f.fieldKey === 'device')) {
          base = [
            ...base,
            {
              fieldKey: 'device',
              label: 'aice.devices',
              component: 'llm-gpu-devices-editor',
            },
          ]
        }
      }
      if (type !== 'vllm' && type !== 'sglang') return base
      const out = []
      let customizedAdded = false
      base.forEach((f) => {
        out.push(f)
        if (f.fieldKey === 'preferred_model') {
          out.push({ fieldKey: '__customized_args__', component: 'customized-args' })
          customizedAdded = true
        }
      })
      if (!customizedAdded) {
        out.push({ fieldKey: '__customized_args__', component: 'customized-args' })
      }
      return out
    },
    appImageParams () {
      const llmType = (this.isCatalogMode || this.isLocalPathImportMode) ? this.catalogLlmType : this.form.fd.llm_type
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        details: true,
        $t: 1,
        ...getParamsForType(llmType),
      }
    },
    mountedModelParams () {
      const llmType = this.isCatalogMode ? this.catalogLlmType : this.form.fd.llm_type
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        ...getParamsForType(llmType),
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
      // 切换 llm_type 时重置端口映射为新类型的默认值（仅 create 模式）。
      // 用 splice 原地修改以保留 decorator 闭包对 portMappings 的引用；
      // 再调一次 setFieldsValue 确保新行的 protocol/container_port 初值被写入 form。
      if (!this.isEditMode) {
        const next = getDefaultPortMappingsForType(val).map(item => ({ ...item, key: uuid() }))
        this.portMappings.splice(0, this.portMappings.length, ...next)
        this.$nextTick(() => {
          const fields = {}
          next.forEach(item => {
            fields[`protocol[${item.key}]`] = item.protocol
            fields[`container_port[${item.key}]`] = item.container_port
          })
          this.form.fc.setFieldsValue(fields)
        })
      }
      if (this.isLocalPathImportMode && this.localPathAdvancedHostPaths) {
        const path = String(this.form.fd.local_path || '').trim()
        if (path) {
          this.$nextTick(() => this.syncLocalPathHostPathRows(path))
        }
      }
    },
  },
  mounted () {
    if (this.isCatalogMode) {
      this.$nextTick(() => this.applyCatalogSpec())
    } else if (this.isLocalPathImportMode) {
      this.$nextTick(() => this.applyLocalPathImportDefaults())
    }
  },
  methods: {
    resolveCreateLlmType (values = {}) {
      if (this.isCatalogMode) {
        return this.catalogLlmType
      }
      const raw = values.llm_type ??
        this.form.fc?.getFieldValue?.('llm_type') ??
        this.form.fd?.llm_type
      const llmType = String(raw || '').trim()
      if (this.isLocalPathImportMode) {
        if (llmType === 'vllm' || llmType === 'sglang') return llmType
        return 'vllm'
      }
      return llmType || 'ollama'
    },
    applyLocalPathImportDefaults () {
      if (!this.form?.fc) return
      const llmType = this.resolveCreateLlmType()
      const defaults = { ...getDefaultSkuSpecForType('vllm'), memory: 8192 }
      this.form.fc.setFieldsValue({
        llm_type: llmType,
        cpu: defaults.cpu,
        memory: defaults.memory / 1024,
      })
      this.$set(this.form.fd, 'llm_type', llmType)
    },
    applyCatalogSpec () {
      if (!this.catalogSpec || !this.form?.fc) return
      const llmType = this.catalogLlmType
      this.form.fc.setFieldsValue({
        llm_type: llmType,
        name: defaultNameFromSpec(this.catalogSpec, this.catalogSet, llmType),
      })
      if (this.isCatalogImportMode) {
        this.loadCatalogImportDefaults(llmType)
        return
      }
      this.form.fc.setFieldsValue({
        cpu: 4,
        memory: 8,
      })
      if (!this.isEditMode) {
        const next = getDefaultPortMappingsForType(llmType).map(item => ({ ...item, key: uuid() }))
        this.portMappings.splice(0, this.portMappings.length, ...next)
        this.$nextTick(() => {
          const pmFields = {}
          next.forEach(item => {
            pmFields[`protocol[${item.key}]`] = item.protocol
            pmFields[`container_port[${item.key}]`] = item.container_port
          })
          this.form.fc.setFieldsValue(pmFields)
        })
      }
    },
    async loadCatalogImportDefaults (llmType) {
      if (this.catalogImportDefaultsApplied) return
      try {
        const catalogManager = new this.$Manager('llm_images_catalogs', 'v1')
        const imagesManager = new this.$Manager('llm_images')
        const catalogItems = await fetchCommunityImageItems([llmType], catalogManager)
        const localImages = await listLocalLlmImages(
          imagesManager,
          llmType,
          this.$store.getters.scope,
        )
        const groups = buildCatalogImageGroups(catalogItems, localImages)
        const catalogItem = groups.communityItems[0] || catalogItems.find(item => item.image && !isBundleItem(item)) || null
        const defaults = getCatalogImportFormDefaults(catalogItem)
        if (catalogItem?.id) {
          this.catalogImageItemsById = { ...this.catalogImageItemsById, [catalogItem.id]: catalogItem }
        }
        catalogItems.forEach(item => {
          if (item?.id) this.catalogImageItemsById[item.id] = item
        })
        this.form.fc.setFieldsValue({
          cpu: defaults.cpu,
          memory: defaults.memory,
          volume_size: defaults.volume_size,
          bandwidth: defaults.bandwidth,
        })
        if (!this.isEditMode && defaults.portMappings?.length) {
          const next = defaults.portMappings.map(item => ({ ...item, key: uuid() }))
          this.portMappings.splice(0, this.portMappings.length, ...next)
          this.$nextTick(() => {
            const pmFields = {}
            next.forEach(item => {
              pmFields[`protocol[${item.key}]`] = item.protocol
              pmFields[`container_port[${item.key}]`] = item.container_port
            })
            this.form.fc.setFieldsValue(pmFields)
          })
        }
        this.catalogImportDefaultsApplied = true
      } catch (e) {
        // 预填失败不阻断表单
      }
    },
    onCatalogImagesLoaded ({ catalogItemsById }) {
      if (catalogItemsById) {
        this.catalogImageItemsById = { ...this.catalogImageItemsById, ...catalogItemsById }
      }
    },
    async resolveImportFormImageId (llmImageId) {
      const catalogMap = {
        ...this.catalogImageItemsById,
        ...(this.$refs.catalogImageSelect?.catalogItemsById || {}),
      }
      const localImageMap = this.$refs.catalogImageSelect?.localImageMap || {}
      const imagesManager = new this.$Manager('llm_images')
      return resolveCatalogImageValue(
        llmImageId,
        catalogMap,
        imagesManager,
        localImageMap,
        this.$store.getters.scope,
      )
    },
    _assembleSkuData (values) {
      const {
        project,
        name,
        llm_type,
        phone_image,
        llm_image_id,
        cpu,
        memory,
        volume_size,
        bandwidth,
        protocol,
        container_port,
        customized_arg_key,
        customized_arg_value,
      } = values
      const effectiveLlmType = this.isEditMode
        ? (this.form.fd.llm_type || llm_type)
        : this.resolveCreateLlmType({ llm_type })
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
      const port_mappings = this.portMappings.map(item => ({
        protocol: protocol[item.key],
        container_port: container_port[item.key],
      }))
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
        const containers = {};
        (hp.containerRows || []).forEach(c => {
          const composite = `${hpKey}__${c.key}`
          const idx = values[`host_path_container_index_${composite}`] ?? (this.isApplyType ? undefined : 0)
          const mountPath = values[`host_path_mount_path_${composite}`]
          if (idx == null || mountPath == null || String(mountPath).trim() === '') return
          const k = String(idx).trim()
          if (!k) return
          const m = { mount_path: String(mountPath).trim(), read_only: !!values[`host_path_read_only_${composite}`] }
          const prop = values[`host_path_propagation_${composite}`]
          if (prop != null && String(prop).trim() !== '') m.propagation = String(prop).trim()
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
      if (port_mappings.length > 0) data.port_mappings = port_mappings
      if (host_paths.length > 0) data.host_paths = host_paths
      if (!this.isEditMode && effectiveLlmType) {
        data.llm_type = effectiveLlmType
        data.llm_sku = { [effectiveLlmType]: {} }
      }
      typeFieldKeys.forEach(key => {
        const v = pickTypeValues[key]
        if (v === undefined) return
        if ((effectiveLlmType === 'vllm' || effectiveLlmType === 'sglang') && key === 'preferred_model') return
        if (key === 'device') {
          const expanded = expandRowsToDevices(v)
          if (expanded.length) data.devices = expanded
        } else {
          data[key] = v
        }
      })
      if (effectiveLlmType === 'vllm' || effectiveLlmType === 'sglang' || effectiveLlmType === 'ollama') {
        const isCatalogImport = this.isCatalogMode && this.catalogSubmitType === 'import'
        const typeSpec = {}
        if (!isCatalogImport) {
          const pm = pickTypeValues.preferred_model
          const preferredStr = pm != null ? String(pm).trim() : ''
          if (preferredStr !== '') typeSpec.preferred_model = preferredStr
        }
        if (effectiveLlmType === 'vllm' || effectiveLlmType === 'sglang') {
          const backend_parameters = formValuesToBackendParameters(
            this.customizedArgsRows,
            customized_arg_key,
            customized_arg_value,
          )
          if (this.isEditMode || backend_parameters.length > 0) {
            data.backend_parameters = backend_parameters
          }
          if (this.isEditMode) {
            typeSpec.customized_args = []
          }
        }
        if (Object.keys(typeSpec).length > 0) {
          data.llm_spec = { [effectiveLlmType]: typeSpec }
        } else if (this.isEditMode && (effectiveLlmType === 'vllm' || effectiveLlmType === 'sglang')) {
          data.llm_spec = { [effectiveLlmType]: { customized_args: [] } }
        }
      }
      if (!this.isEditMode) {
        data.generate_name = name
        data.project_id = project?.key || this.userInfo.projectId
      }
      return data
    },
    async resolveCatalogMountedModelIds () {
      const llmType = this.catalogLlmType
      if (!catalogTypeUsesMountedModels(llmType)) return []

      const preset = getCatalogMountedModelIds(this.catalogSpec)
      if (preset && preset.length > 0) return preset

      const createData = buildInstantModelCreateData(
        this.catalogSpec,
        llmType,
        defaultNameFromSpec(this.catalogSpec, this.catalogSet, llmType),
      )
      if (!createData) return []

      const manager = new this.$Manager('llm_instant_models')
      const scope = this.$store.getters.scope
      try {
        const listRes = await manager.list({
          params: {
            scope,
            llm_type: llmType,
            model_name: createData.model_name,
            limit: 20,
          },
        })
        const items = listRes.data?.data || []
        const wantTag = createData.model_tag || 'main'
        const found = items.find((item) => {
          const nameOk = !createData.model_name || item.model_name === createData.model_name
          const tagOk = !createData.model_tag || (item.model_tag || 'main') === wantTag
          const repoOk = !createData.repo_id || item.repo_id === createData.repo_id
          return nameOk && tagOk && repoOk
        })
        if (found?.id) return [found.id]
      } catch (e) {
        // 列表失败时继续尝试创建
      }

      const res = await manager.create({ data: createData })
      const id = res.data?.id
      return id ? [id] : []
    },
    mergeCatalogBackendParameters (data) {
      const llmType = this.catalogLlmType
      if (llmType !== 'vllm' && llmType !== 'sglang') return data
      const catalogParams = normalizeCatalogBackendParameters(this.catalogSpec)
      const formParams = data.backend_parameters || []
      const merged = mergeBackendParameters(catalogParams, formParams)
      if (merged.length > 0 || catalogParams.length > 0 || formParams.length > 0) {
        data.backend_parameters = merged
      }
      return data
    },
    async buildCatalogSkuPayload () {
      const values = await this.form.fc.validateFields()
      if (this.isCatalogImportMode && values.llm_image_id) {
        values.llm_image_id = await this.resolveImportFormImageId(values.llm_image_id)
      }
      const data = this._assembleSkuData(values)
      const llmType = this.catalogLlmType

      data.llm_model_spec_id = getCatalogSpecId(this.catalogSpec)
      data.llm_type = llmType

      // HF / model-sets 导入：目录模型字段 + 表单 backend_parameters 合并
      if (this.catalogSubmitType === 'import') {
        const hfImport = buildHuggingfaceSkuImportParams(this.catalogSpec, llmType, {
          catalogSet: this.catalogSet,
        })
        const formTypeSpec = data.llm_spec?.[llmType]
        const catTypeSpec = hfImport.llm_spec?.[llmType]
        const payload = { ...data, ...hfImport }
        if (catTypeSpec || formTypeSpec) {
          payload.llm_spec = {
            [llmType]: {
              ...catTypeSpec,
              ...formTypeSpec,
            },
          }
        }
        return this.mergeCatalogBackendParameters(payload)
      }

      const mountedModelIds = await this.resolveCatalogMountedModelIds()
      const catalogModel = buildCatalogSkuModelParams(this.catalogSpec, llmType, mountedModelIds)
      if (catalogModel.model_spec) data.model_spec = catalogModel.model_spec
      if (catalogModel.mounted_models && catalogModel.mounted_models.length > 0) {
        data.mounted_models = catalogModel.mounted_models
      }

      const catTypeSpec = catalogModel.llm_spec?.[llmType]
      const formTypeSpec = data.llm_spec?.[llmType]
      if (catTypeSpec || formTypeSpec) {
        data.llm_spec = { [llmType]: { ...catTypeSpec, ...formTypeSpec } }
      }

      return this.mergeCatalogBackendParameters(data)
    },
    async handleCatalogImport () {
      this.loading = true
      try {
        const manager = new this.$Manager('llm_skus')
        const data = await this.buildCatalogSkuPayload()
        await manager.create({ data })
        this.$message.success(this.$t('common.success'))
        this.$emit('success')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async buildLocalPathSkuPayload () {
      const values = await this.form.fc.validateFields()
      const mergedValues = { ...this.form.fc.getFieldsValue(), ...values }
      const llmType = this.resolveCreateLlmType(mergedValues)
      const data = this._assembleSkuData({ ...mergedValues, llm_type: llmType })
      delete data.llm_sku
      const localPath = String(mergedValues.local_path || '').trim()
      const preferredModel = getLocalPathPreferredModel(localPath)
      const hostPaths = this.localPathAdvancedHostPaths && data.host_paths?.length
        ? data.host_paths
        : buildLocalPathHostPaths(localPath, llmType)
      const formTypeSpec = data.llm_spec?.[llmType] || {}
      const preferHosts = normalizePreferHosts(mergedValues.prefer_hosts)
      return {
        ...data,
        llm_type: llmType,
        source: 'local_path',
        local_path: localPath,
        prefer_hosts: preferHosts,
        host_paths: hostPaths,
        categories: ['llm'],
        generate_name: data.name,
        llm_spec: {
          [llmType]: {
            ...formTypeSpec,
            preferred_model: preferredModel,
          },
        },
      }
    },
    async handleLocalPathImport () {
      this.loading = true
      try {
        const manager = new this.$Manager('llm_skus')
        const data = await this.buildLocalPathSkuPayload()
        await manager.create({ data })
        this.$message.success(this.$t('common.success'))
        this.$emit('success')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    onLlmTypeChange (e) {
      const val = e?.target?.value ?? e
      if (val) {
        this.$set(this.form.fd, 'llm_type', val)
      }
    },
    onLocalPathInputChange (e) {
      const path = String(e?.target?.value ?? e ?? '').trim()
      this.$set(this.form.fd, 'local_path', path)
      if (!this.localPathAdvancedHostPaths) return
      this.syncLocalPathHostPathRows(path)
    },
    enableLocalPathAdvancedHostPaths () {
      this.localPathAdvancedHostPaths = true
      if (!this.hostPathRows.length) {
        this.addHostPath()
      }
      const path = String(this.form.fd.local_path || '').trim()
      if (path) {
        this.$nextTick(() => this.syncLocalPathHostPathRows(path))
      }
    },
    syncLocalPathHostPathRows (hostPath) {
      const paths = buildLocalPathHostPaths(hostPath, this.form.fd.llm_type || 'vllm')
      const hp = paths[0]
      if (!hp || !this.hostPathRows.length) return
      const row = this.hostPathRows[0]
      const hpKey = row.key
      this.form.fc.setFieldsValue({
        [`host_path_type_${hpKey}`]: hp.type,
        [`host_path_path_${hpKey}`]: hp.path,
        [`host_path_auto_create_${hpKey}`]: hp.auto_create,
      })
      const container = hp.containers?.[0]
      const cRow = row.containerRows?.[0]
      if (container && cRow) {
        const composite = `${hpKey}__${cRow.key}`
        this.form.fc.setFieldsValue({
          [`host_path_container_index_${composite}`]: '0',
          [`host_path_mount_path_${composite}`]: container.mount_path,
          [`host_path_read_only_${composite}`]: container.read_only,
          [`host_path_propagation_${composite}`]: container.propagation,
        })
      }
    },
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
          request_sync_image,
          dify_api_image_id,
          dify_plugin_image_id,
          dify_sandbox_image_id,
          dify_ssrf_image_id,
          dify_weaviate_image_id,
          dify_web_image_id,
          nginx_image_id,
          postgres_image_id,
          redis_image_id,
        } = values
        const data = this._assembleSkuData(values)
        const effectiveLlmType = data.llm_type
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
