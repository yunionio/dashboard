<template>
  <div>
    <page-header :title="$t('aice.llm_deployment_create')" />
    <page-body needMarginBottom>
      <a-alert
        v-if="catalogContext"
        type="info"
        show-icon
        class="mb-3"
        :message="$t('aice.llm_catalog.from', [catalogContext.title])"
        :description="catalogContext.description" />
      <a-form
        :form="form.fc"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
        class="mt-4">
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
        </a-form-item>

        <a-divider orientation="left">{{ $t('aice.llm_deployment.create.mode') }}</a-divider>
        <a-form-item :label="$t('aice.llm_deployment.create.mode')">
          <a-radio-group v-decorator="decorators.mode" button-style="solid">
            <a-radio-button value="reuse">{{ $t('aice.llm_deployment.create.mode.reuse') }}</a-radio-button>
            <a-radio-button value="auto">{{ $t('aice.llm_deployment.create.mode.auto') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <!-- Mode A: reuse existing SKU -->
        <template v-if="form.fd.mode === 'reuse'">
          <a-form-item :label="$t('aice.llm_sku')">
            <base-select
              class="llm-sku-select"
              v-decorator="decorators.llm_sku_id"
              resource="llm_skus"
              :params="skuParams"
              dropdown-item-word-wrap
              :select-props="{
                placeholder: $t('common.tips.select', [$t('aice.llm_sku')]),
                dropdownStyle: { minWidth: '520px' },
              }">
              <template #optionLabelTemplate="{ item }">
                <div class="llm-sku-option">
                  <div class="oc-selected-display-none">
                    <div class="text-truncate" :title="item.name">{{ item.name }}</div>
                    <div
                      class="text-color-secondary mt-1 text-truncate"
                      style="font-size: 12px"
                      :title="formatLlmSkuConfig(item)">
                      {{ formatLlmSkuConfig(item) }}
                    </div>
                  </div>
                  <div
                    class="oc-dropdown-display-none llm-sku-option__selected text-truncate"
                    :title="`${item.name} (${formatLlmSkuConfig(item)})`">
                    <span>{{ item.name }}</span>
                    <span class="text-color-secondary"> ({{ formatLlmSkuConfig(item) }})</span>
                  </div>
                </div>
              </template>
            </base-select>
          </a-form-item>
        </template>

        <!-- Mode B/C: auto-create SKU (+ optional InstantModel) -->
        <template v-else>
          <a-form-item :label="$t('aice.llm_type')">
            <a-radio-group v-decorator="decorators.llm_type" button-style="solid" @change="onLlmTypeChange">
              <a-radio-button value="ollama">Ollama</a-radio-button>
              <a-radio-button value="vllm">vLLM</a-radio-button>
              <a-radio-button value="sglang">SGLang</a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item :label="$t('aice.llm_image')">
            <base-select
              v-decorator="decorators.llm_image_id"
              resource="llm_images"
              :params="imageParams"
              :select-props="{ placeholder: $t('common.tips.select', [$t('aice.llm_image')]) }" />
          </a-form-item>

          <a-divider orientation="left">{{ $t('aice.llm_deployment.create.resources') }}</a-divider>

          <a-form-item label="CPU">
            <a-input-number v-decorator="decorators.cpu" :min="1" :max="128" /> {{ $t('compute.text_357') }}
          </a-form-item>
          <a-form-item :label="$t('compute.text_300')">
            <a-input-number v-decorator="decorators.memory" :min="512" :step="512" /> MB
          </a-form-item>
          <a-form-item :label="$t('aice.llm_deployment.create.disk_size')">
            <a-input-number v-decorator="decorators.disk_size" :min="1024" :step="1024" /> MB
          </a-form-item>

          <a-form-item :label="$t('aice.llm_deployment.create.devices')">
            <a-select
              v-decorator="decorators.devices"
              mode="multiple"
              :options="gpuOptions"
              :placeholder="$t('common.tips.select', [$t('aice.llm_deployment.create.devices')])" />
            <div class="text-color-help">
              {{ $t('aice.llm_deployment.create.devices.help') }}
            </div>
          </a-form-item>

          <a-form-item :label="$t('aice.llm_deployment.create.port_mappings')">
            <div v-for="(pm, idx) in portMappings" :key="pm.key" class="d-flex" style="margin-bottom: 8px;">
              <a-form-item style="margin-bottom: 0; margin-right: 8px;">
                <a-select v-decorator="decoratorsPortMapping.protocol(pm.key)" style="width: 90px;">
                  <a-select-option value="tcp">TCP</a-select-option>
                  <a-select-option value="udp">UDP</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item style="margin-bottom: 0; margin-right: 8px;">
                <a-input-number
                  v-decorator="decoratorsPortMapping.container_port(pm.key)"
                  :min="1"
                  :max="65535"
                  :placeholder="$t('aice.container_port')"
                  style="width: 180px;" />
              </a-form-item>
              <a-button shape="circle" icon="minus" size="small" @click="removePortMapping(idx)" />
            </div>
            <a-button type="link" icon="plus" @click="addPortMapping">{{ $t('aice.add_port_mapping') }}</a-button>
          </a-form-item>

          <a-divider orientation="left">{{ $t('aice.llm_deployment.create.model_source') }}</a-divider>

          <a-form-item :label="$t('aice.llm_deployment.create.import_model')">
            <a-switch v-decorator="decorators.import_model" />
            <div class="text-color-help">
              {{ $t('aice.llm_deployment.create.import_model.help') }}
            </div>
          </a-form-item>

          <template v-if="form.fd.import_model">
            <a-form-item :label="$t('aice.llm_deployment.create.model_name')">
              <a-input v-decorator="decorators.model_name" :placeholder="$t('aice.llm_deployment.create.model_name.placeholder')" />
            </a-form-item>
            <a-form-item :label="$t('aice.llm_deployment.create.model_tag')">
              <a-input v-decorator="decorators.model_tag" :placeholder="$t('aice.llm_deployment.create.model_tag.placeholder')" />
            </a-form-item>
            <a-form-item :label="$t('aice.llm_deployment.create.model_source')">
              <a-select v-decorator="decorators.model_source">
                <a-select-option value="">{{ $t('aice.llm_deployment.create.model_source.ollama_registry') }}</a-select-option>
                <a-select-option value="huggingface">HuggingFace</a-select-option>
                <a-select-option value="model_scope">ModelScope</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item v-if="form.fd.model_source === 'huggingface'" :label="$t('aice.llm_deployment.create.repo_id')">
              <a-input v-decorator="decorators.model_repo_id" placeholder="e.g. Qwen/Qwen3-8B" />
            </a-form-item>
          </template>

          <template v-else>
            <a-form-item :label="$t('aice.llm_deployment.create.mounted_models')">
              <base-select
                v-decorator="decorators.mounted_models"
                resource="llm_instant_models"
                :params="instantModelParams"
                :select-props="{
                  mode: 'multiple',
                  placeholder: $t('common.tips.select', [$t('aice.llm_deployment.create.mounted_models')]),
                }" />
            </a-form-item>
          </template>
        </template>

        <a-divider orientation="left">{{ $t('aice.llm_deployment.create.deployment') }}</a-divider>

        <a-form-item :label="$t('aice.llm_deployment.replicas')">
          <a-input-number v-decorator="decorators.replicas" :min="1" :max="100" />
        </a-form-item>
        <a-form-item :label="$t('aice.llm_deployment.placement_strategy')">
          <a-radio-group v-decorator="decorators.placement_strategy">
            <a-radio value="spread">{{ $t('aice.llm_deployment.placement_strategy.spread') }}</a-radio>
            <a-radio value="binpack">{{ $t('aice.llm_deployment.placement_strategy.binpack') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('aice.llm_deployment.access_policy')">
          <a-select v-decorator="decorators.access_policy">
            <a-select-option value="authed">{{ $t('aice.llm_deployment.access_policy.authed') }}</a-select-option>
            <a-select-option value="public">{{ $t('aice.llm_deployment.access_policy.public') }}</a-select-option>
            <a-select-option value="allowed_users">{{ $t('aice.llm_deployment.access_policy.allowed_users') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('aice.llm_deployment.auto_start')">
          <a-switch v-decorator="decorators.auto_start" />
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
        <a-form-item :label="$t('aice.host_paths')" :extra="$t('aice.host_paths.extra')">
            <div v-for="hp in hostPathRows" :key="hp.key" style="display: flex; align-items: stretch; gap: 10px; margin-bottom: 12px;">
              <div style="flex: 1; border: 1px solid #e8e8e8; border-radius: 4px; padding: 12px;">
                <a-row :gutter="8">
                  <a-col :span="8">
                    <a-form-item>
                      <fixed-label-filter :label="$t('aice.host_paths.type')">
                        <a-select v-decorator="decoratorsHostPaths.type(hp.key)" :placeholder="$t('common.tips.select', [$t('aice.host_paths.type')])">
                          <a-select-option value="directory">directory</a-select-option>
                          <a-select-option value="file">file</a-select-option>
                        </a-select>
                      </fixed-label-filter>
                    </a-form-item>
                  </a-col>
                  <a-col :span="16">
                    <a-form-item>
                      <fixed-label-filter :label="$t('aice.host_paths.path')">
                        <a-input v-decorator="decoratorsHostPaths.path(hp.key)" :placeholder="$t('aice.host_paths.path.placeholder')" />
                      </fixed-label-filter>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="8">
                  <a-col :span="24">
                    <a-form-item>
                      <a-checkbox v-decorator="decoratorsHostPaths.auto_create(hp.key)">{{ $t('aice.host_paths.auto_create') }}</a-checkbox>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="8" v-if="form.fd[`host_path_auto_create_${hp.key}`]">
                  <a-col :span="8">
                    <a-form-item>
                      <fixed-label-filter :label="$t('aice.host_paths.auto_create_config.uid')">
                        <a-input v-decorator="decoratorsHostPaths.auto_uid(hp.key)" :placeholder="$t('aice.host_paths.auto_create_config.uid.placeholder')" />
                      </fixed-label-filter>
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item>
                      <fixed-label-filter :label="$t('aice.host_paths.auto_create_config.gid')">
                        <a-input v-decorator="decoratorsHostPaths.auto_gid(hp.key)" :placeholder="$t('aice.host_paths.auto_create_config.gid.placeholder')" />
                      </fixed-label-filter>
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item>
                      <fixed-label-filter :label="$t('aice.host_paths.permissions')">
                        <a-input v-decorator="decoratorsHostPaths.auto_perm(hp.key)" :placeholder="$t('aice.host_paths.permissions.placeholder')" />
                      </fixed-label-filter>
                    </a-form-item>
                  </a-col>
                </a-row>
                <div style="margin: 8px 0; font-weight: 500;">{{ $t('aice.host_paths.containers') }}</div>
                <div v-for="c in hp.containerRows" :key="c.key">
                  <input type="hidden" v-decorator="decoratorsHostPaths.container_index(hp.key, c.key)" />
                  <a-row :gutter="8">
                    <a-col :span="12">
                      <a-form-item>
                        <fixed-label-filter :label="$t('aice.host_paths.mount_path')">
                          <a-input v-decorator="decoratorsHostPaths.mount_path(hp.key, c.key)" :placeholder="$t('aice.host_paths.mount_path.placeholder')" />
                        </fixed-label-filter>
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item>
                        <fixed-label-filter :label="$t('aice.host_paths.propagation')">
                          <a-select v-decorator="decoratorsHostPaths.propagation(hp.key, c.key)" :placeholder="$t('common.tips.select', [$t('aice.host_paths.propagation')])" optionLabelProp="label" :dropdownMatchSelectWidth="false">
                            <a-select-option value="private" label="private">private - {{ $t('aice.host_paths.propagation.private') }}</a-select-option>
                            <a-select-option value="rslave" label="rslave">rslave - {{ $t('aice.host_paths.propagation.rslave') }}</a-select-option>
                            <a-select-option value="rshared" label="rshared">rshared - {{ $t('aice.host_paths.propagation.rshared') }}</a-select-option>
                          </a-select>
                        </fixed-label-filter>
                      </a-form-item>
                    </a-col>
                  </a-row>
                  <a-row :gutter="8">
                    <a-col :span="4">
                      <a-form-item>
                        <a-checkbox v-decorator="decoratorsHostPaths.read_only(hp.key, c.key)">{{ $t('aice.host_paths.read_only') }}</a-checkbox>
                      </a-form-item>
                    </a-col>
                  </a-row>
                </div>
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
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.create') }}</a-button>
        <a-button class="ml-2" @click="handleCancel">{{ $t('common.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { Manager } from '@/utils/manager'
import { uuid, sizestr } from '@/utils/utils'
import validateForm from '@/utils/validate'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import { getDefaultPortMappingsForType } from '@Ai/views/llm-sku/constants/llmTypeConfig'

const getInitVal = (list, key, property) => {
  const target = list.find(item => item.key === key)
  return target ? target[property] : undefined
}

export default {
  name: 'LlmDeploymentCreate',
  components: { ServerNetwork },
  data () {
    const defaultLlmType = 'ollama'
    const portMappings = getDefaultPortMappingsForType(defaultLlmType).map(item => ({ ...item, key: uuid() }))
    return {
      loading: false,
      portMappings,
      hostPathRows: [],
      catalogContext: null,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
          mode: 'reuse',
          llm_type: defaultLlmType,
          import_model: false,
          model_source: '',
          auto_start: true,
        },
        fi: {
          networkList: [],
          capability: { max_nic_count: 8 },
        },
      },
      decorators: {
        name: ['name', {
          rules: [{ required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) }],
        }],
        mode: ['mode', { initialValue: 'reuse' }],
        llm_sku_id: ['llm_sku_id', {
          rules: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_sku')]) }],
        }],
        llm_type: ['llm_type', { initialValue: defaultLlmType }],
        llm_image_id: ['llm_image_id', {
          rules: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_image')]) }],
        }],
        cpu: ['cpu', {
          initialValue: 4,
          rules: [{ required: true, message: this.$t('common.tips.input', ['CPU']) }],
        }],
        memory: ['memory', {
          initialValue: 8192,
          rules: [{ required: true, message: this.$t('common.tips.input', [this.$t('compute.text_300')]) }],
        }],
        disk_size: ['disk_size', {
          initialValue: 20480,
          rules: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_deployment.create.disk_size')]) }],
        }],
        devices: ['devices', { initialValue: [] }],
        mounted_models: ['mounted_models', {
          initialValue: [],
          rules: [{ required: true, type: 'array', message: this.$t('common.tips.select', [this.$t('aice.llm_deployment.create.mounted_models')]) }],
        }],
        import_model: ['import_model', { valuePropName: 'checked', initialValue: false }],
        model_name: ['model_name', {
          rules: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_deployment.create.model_name')]) }],
        }],
        model_tag: ['model_tag', {
          rules: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_deployment.create.model_tag')]) }],
        }],
        model_source: ['model_source', { initialValue: '' }],
        model_repo_id: ['model_repo_id', {}],
        replicas: ['replicas', {
          initialValue: 1,
          rules: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_deployment.replicas')]) }],
        }],
        placement_strategy: ['placement_strategy', { initialValue: 'spread' }],
        access_policy: ['access_policy', { initialValue: 'authed' }],
        auto_start: ['auto_start', { valuePropName: 'checked', initialValue: true }],
        network: {
          networkType: ['networkType', { initialValue: NETWORK_OPTIONS_MAP.default.key }],
          networkConfig: {
            vpcs: i => [`vpcs[${i}]`, {
              validateTrigger: ['change', 'blur'],
              rules: [{ required: true, message: this.$t('compute.text_194') }],
            }],
            networks: i => [`networks[${i}]`, {
              validateTrigger: ['change', 'blur'],
              rules: [{ required: true, message: this.$t('compute.text_217') }],
            }],
            ips: () => [`networkIps[${uuid()}]`, {
              validateFirst: true,
              validateTrigger: ['blur', 'change'],
              rules: [{ validator: validateForm('IPv4') }],
            }],
            macs: () => [`networkMacs[${uuid()}]`, {
              validateFirst: true,
              validateTrigger: ['blur', 'change'],
              rules: [{ validator: validateForm('mac') }],
            }],
          },
          networkSchedtag: {
            schedtags: i => [`networkSchedtags[${i}]`, {
              validateTrigger: ['change', 'blur'],
              rules: [{ required: true, message: this.$t('compute.text_123') }],
            }],
            policys: i => [`networkPolicys[${i}]`, {
              validateTrigger: ['blur', 'change'],
              rules: [{ required: true, message: this.$t('common_256') }],
            }],
          },
        },
      },
      decoratorsPortMapping: {
        protocol: rowKey => [`pm_protocol[${rowKey}]`, {
          initialValue: getInitVal(portMappings, rowKey, 'protocol') || 'tcp',
        }],
        container_port: rowKey => [`pm_container_port[${rowKey}]`, {
          initialValue: getInitVal(portMappings, rowKey, 'container_port'),
          rules: [{ type: 'number', min: 1, max: 65535, message: this.$t('aice.container_port.message'), transform: v => v != null ? Number(v) : v }],
        }],
      },
      decoratorsHostPaths: {
        type: rowKey => [`host_path_type_${rowKey}`, { initialValue: 'directory' }],
        path: rowKey => [`host_path_path_${rowKey}`, {
          rules: [{ required: true, message: this.$t('aice.host_paths.path.required') }],
        }],
        auto_create: rowKey => [`host_path_auto_create_${rowKey}`, { valuePropName: 'checked', initialValue: false }],
        auto_uid: rowKey => [`host_path_auto_uid_${rowKey}`, {}],
        auto_gid: rowKey => [`host_path_auto_gid_${rowKey}`, {}],
        auto_perm: rowKey => [`host_path_auto_perm_${rowKey}`, {}],
        container_index: (hpKey, cKey) => [`host_path_container_index_${hpKey}__${cKey}`, { initialValue: 0 }],
        mount_path: (hpKey, cKey) => [`host_path_mount_path_${hpKey}__${cKey}`, {
          rules: [{ required: true, message: this.$t('aice.host_paths.mount_path.required') }],
        }],
        read_only: (hpKey, cKey) => [`host_path_read_only_${hpKey}__${cKey}`, { valuePropName: 'checked', initialValue: false }],
        propagation: (hpKey, cKey) => [`host_path_propagation_${hpKey}__${cKey}`, { initialValue: 'rslave' }],
      },
      manager: new Manager('llm_deployments'),
    }
  },
  computed: {
    skuParams () {
      return { scope: this.$store.getters.scope, details: true, limit: 20, filter: ['llm_type.in(vllm,ollama,sglang)'] }
    },
    imageParams () {
      return { scope: this.$store.getters.scope, llm_type: this.form.fd.llm_type }
    },
    instantModelParams () {
      return { scope: this.$store.getters.scope, llm_type: this.form.fd.llm_type }
    },
    networkParams () {
      return {
        scope: this.$store.getters.scope,
        limit: 20,
        usable: true,
        host_type: 'container',
        vpc: this.form.fd.vpc,
      }
    },
    resourcesParams () {
      return {
        schedtag: {
          limit: 1024,
          filter: ['resource_type.equals(networks)'],
        },
      }
    },
    gpuOptions () {
      const types = this.$store.getters.capability?.pci_model_types || {}
      const list = Object.values(types).filter(item => item.hypervisor === 'pod')
      return list.map(item => ({ value: item.model, label: item.model }))
    },
  },
  created () {
    const specId = this.$route.query.from_spec
    if (specId) {
      this.loadModelSpec(specId)
      return
    }
    const skuId = this.$route.query.from_sku
    if (skuId) {
      this.applyFromSku(skuId)
    }
  },
  methods: {
    applyFromSku (skuId) {
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          mode: 'reuse',
          llm_sku_id: skuId,
        })
      })
    },
    formatLlmSkuMemory (memory) {
      if (memory == null) return '-'
      return sizestr(memory, 'M', 1024)
    },
    formatLlmSkuDisk (item) {
      const volumes = item.volumes || []
      if (!volumes.length) return '-'
      let size = 0
      volumes.forEach(v => { size += v.size_mb || 0 })
      return sizestr(size, 'M', 1024)
    },
    formatLlmSkuBandwidth (bandwidth) {
      if (bandwidth == null) return '-'
      if (bandwidth === 0) return `0(${this.$t('common.not_limited')})`
      return `${bandwidth}M`
    },
    formatLlmSkuConfig (item) {
      const parts = [
        `CPU ${item.cpu || '-'}`,
        `${this.$t('aice.memory')} ${this.formatLlmSkuMemory(item.memory)}`,
        `${this.$t('aice.disk')} ${this.formatLlmSkuDisk(item)}`,
      ]
      if (item.bandwidth != null) {
        parts.push(`${this.$t('aice.bandwidth')} ${this.formatLlmSkuBandwidth(item.bandwidth)}`)
      }
      if (item.image) {
        parts.push(`${this.$t('aice.image')}：${item.image}`)
      }
      return parts.join(' · ')
    },
    async loadModelSpec (id) {
      try {
        const mgr = new this.$Manager('llm_model_specs', 'v1')
        const res = await mgr.get({ id })
        // Manager.get unwraps the `llm_model_spec` envelope server-side; the
        // spec object is at res.data directly.
        const spec = res.data
        if (spec && spec.spec_id) {
          const titleParts = [spec.model_set_name, spec.backend, spec.quantization].filter(Boolean)
          this.catalogContext = {
            title: spec.name || titleParts.join(' · ') || spec.spec_id,
            description: this.$t('aice.llm_catalog.from_spec_help'),
          }
          this.$nextTick(() => this.applyModelSpec(spec))
        }
      } catch (e) {
        this.$message.error(this.$t('aice.llm_catalog.fetch_failed'))
      }
    },
    applyModelSpec (spec) {
      // Map GPUStack backend names → llm_type. Catalog uses display casing
      // ("vLLM", "Ollama", "SGLang"); deployment form uses lowercase enum.
      const backendMap = { vllm: 'vllm', ollama: 'ollama', sglang: 'sglang' }
      const backendKey = (spec.backend || 'ollama').toLowerCase()
      const llmType = backendMap[backendKey] || 'vllm'

      const fields = {
        mode: 'auto',
        llm_type: llmType,
        import_model: true,
      }
      // Source → deployment model_spec fields. GPUStack source is one of
      // huggingface / model_scope / local_path; OneCloud's import flow
      // supports huggingface and model_scope. local_path falls back to no
      // import (the user can manually mount the model).
      //
      // Backend's DownloadModel uses model_name as the full upstream repo path
      // (e.g. "Qwen/Qwen3-0.6B"), so model_name == repo_id here.
      switch (spec.source) {
        case 'huggingface': {
          fields.model_source = 'huggingface'
          fields.model_repo_id = spec.huggingface_repo_id || ''
          fields.model_name = spec.huggingface_repo_id || ''
          fields.model_tag = spec.huggingface_filename || 'main'
          break
        }
        case 'model_scope': {
          fields.model_source = 'model_scope'
          fields.model_repo_id = spec.model_scope_model_id || ''
          fields.model_name = spec.model_scope_model_id || ''
          fields.model_tag = spec.model_scope_file_path || 'main'
          break
        }
        case 'ollama': {
          // OneCloud convention: source='' identifies the bundled ollama
          // registry. model_name + tag look up the InstantModel import path.
          fields.model_source = ''
          fields.llm_type = 'ollama'
          fields.model_name = spec.ollama_model || ''
          fields.model_tag = spec.ollama_tag || 'latest'
          break
        }
        default:
          // local_path or unknown: user must complete the model fields manually.
          fields.import_model = false
      }
      this.form.fc.setFieldsValue(fields)

      // Reset port mappings to the type's defaults. GPUStack catalog doesn't
      // pin a container port; backend-specific defaults from llmTypeConfig apply.
      const next = getDefaultPortMappingsForType(llmType).map(item => ({ ...item, key: uuid() }))
      this.portMappings.splice(0, this.portMappings.length, ...next)
      this.$nextTick(() => {
        const pmFields = {}
        next.forEach(item => {
          pmFields[`pm_protocol[${item.key}]`] = item.protocol
          pmFields[`pm_container_port[${item.key}]`] = item.container_port
        })
        this.form.fc.setFieldsValue(pmFields)
      })
    },
    networkResourceMapper (list) {
      return (list || []).map(val => {
        if (val.server_type !== 'host') return val
        return { ...val, name: `${val.name}（Host IP 子网）` }
      })
    },
    onLlmTypeChange (e) {
      const next = getDefaultPortMappingsForType(e.target.value).map(item => ({ ...item, key: uuid() }))
      this.portMappings.splice(0, this.portMappings.length, ...next)
      this.$nextTick(() => {
        const fields = {}
        next.forEach(item => {
          fields[`pm_protocol[${item.key}]`] = item.protocol
          fields[`pm_container_port[${item.key}]`] = item.container_port
        })
        this.form.fc.setFieldsValue(fields)
      })
      this.form.fc.setFieldsValue({ llm_image_id: undefined })
    },
    addPortMapping () {
      this.portMappings.push({ key: uuid(), protocol: 'tcp', container_port: undefined })
    },
    removePortMapping (idx) {
      this.portMappings.splice(idx, 1)
    },
    addHostPath () {
      this.hostPathRows.push({ key: uuid(), containerRows: [{ key: uuid() }] })
    },
    delHostPath (hp) {
      const idx = this.hostPathRows.findIndex(v => v.key === hp.key)
      if (idx >= 0) this.hostPathRows.splice(idx, 1)
    },
    buildHostPaths (values) {
      return this.hostPathRows.map(hp => {
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
          const idx = values[`host_path_container_index_${composite}`] ?? 0
          const mountPath = values[`host_path_mount_path_${composite}`]
          if (mountPath == null || String(mountPath).trim() === '') return
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
    },
    genNetworks (values) {
      const networkType = this.form.fd.networkType
      if (networkType === NETWORK_OPTIONS_MAP.manual.key) {
        const ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = { network: value }
          if (values.networkIps?.[key]) obj.address = values.networkIps[key]
          if (values.networkMacs?.[key]) obj.mac = values.networkMacs[key]
          ret.push(obj)
        }, values.networks || {})
        return ret
      }
      if (networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
        const ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = { id: value }
          const strategy = values.networkPolicys?.[key]
          if (strategy) obj.strategy = strategy
          ret.push({ schedtags: [obj] })
        }, values.networkSchedtags || {})
        return ret
      }
      // default: let backend pick
      return [{ exit: false }]
    },
    buildPayload (values) {
      const payload = {
        name: values.name,
        replicas: values.replicas,
        placement_strategy: values.placement_strategy,
        access_policy: values.access_policy,
        auto_start: !!values.auto_start,
        nets: this.genNetworks(values),
      }
      const host_paths = this.buildHostPaths(values)
      if (host_paths.length > 0) payload.host_paths = host_paths
      if (values.mode === 'reuse') {
        payload.llm_sku_id = values.llm_sku_id
        return payload
      }
      const skuSpec = {
        llm_image_id: values.llm_image_id,
        llm_type: values.llm_type,
        cpu: values.cpu,
        memory: values.memory,
        volumes: [{ size_mb: values.disk_size, storage_type: 'local' }],
      }
      if (Array.isArray(values.devices) && values.devices.length > 0) {
        skuSpec.devices = values.devices.map(model => ({ model }))
      }
      const port_mappings = this.portMappings
        .map(pm => {
          const protocol = values.pm_protocol?.[pm.key] || 'tcp'
          const port = values.pm_container_port?.[pm.key]
          if (port == null || port === '') return null
          return { protocol, container_port: Number(port) }
        })
        .filter(Boolean)
      if (port_mappings.length > 0) skuSpec.port_mappings = port_mappings

      if (values.import_model) {
        payload.model_spec = {
          model_name: values.model_name,
          model_tag: values.model_tag,
          llm_type: values.llm_type,
          source: values.model_source || undefined,
          repo_id: values.model_repo_id || undefined,
        }
      } else if (Array.isArray(values.mounted_models) && values.mounted_models.length > 0) {
        skuSpec.mounted_models = values.mounted_models
      }
      payload.sku_spec = skuSpec
      return payload
    },
    handleCancel () {
      this.$router.back()
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.loading = true
        const payload = this.buildPayload(values)
        await this.manager.create({ data: payload })
        this.$message.success(this.$t('common.success'))
        this.$router.push({ name: 'LlmDeploymentList' })
      } catch (error) {
        this.loading = false
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.llm-sku-select {
  ::v-deep .ant-select-selection__rendered {
    overflow: hidden;
  }
  ::v-deep .ant-select-selection-selected-value {
    float: none;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
