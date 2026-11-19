<template>
  <div>
    <page-header :title="$t('aice.llm_deployment_create')" />
    <page-body needMarginBottom>
      <a-form
        :form="form.fc"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
        class="mt-4">
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
          <template v-slot:extra>
            <name-repeated res="llm_deployments" :name="form.fd.name" />
          </template>
        </a-form-item>

        <a-form-item :label="$t('aice.llm_sku')">
          <llm-sku-select
            v-decorator="decorators.llm_sku_id"
            :params="skuParams"
            :select-props="{
              placeholder: $t('common.tips.select', [$t('aice.llm_sku')]),
            }"
            @change="handleSkuChange" />
        </a-form-item>

        <a-form-item
          v-if="showPreferHosts"
          :label="$t('aice.local_path_import.prefer_hosts')"
          :extra="isLocalPathSku ? $t('aice.local_path_import.prefer_hosts_deploy_hint') : $t('aice.llm_deployment.prefer_hosts_distributed_hint')">
          <base-select
            v-decorator="decorators.prefer_hosts"
            resource="hosts"
            :params="localPathHostParams"
            :select-props="{
              mode: 'multiple',
              placeholder: $t('common.tips.select', [$t('dictionary.host')]),
            }" />
        </a-form-item>

        <a-divider orientation="left">{{ $t('aice.llm_deployment.create.deployment') }}</a-divider>

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

        <a-form-item :label="$t('aice.llm_deployment.distributed_inference')" :extra="distributedSwitchHint">
          <a-switch
            v-decorator="decorators.distributed_inference"
            :disabled="distributedSwitchDisabled"
            @change="handleDistributedChange" />
        </a-form-item>

        <a-form-item v-if="distributedOn" :label="$t('aice.llm_deployment.parallel_mode')" :extra="parallelModeHint">
          <a-select v-decorator="decorators.parallel_mode" @change="handleParallelModeChange">
            <a-select-option
              v-for="opt in parallelModeOptions"
              :key="opt.value"
              :value="opt.value"
              :disabled="opt.disabled"
              :title="opt.disabled ? opt.disabledReason : opt.hint">
              {{ opt.label }}
              <span v-if="opt.disabled" class="text-color-help">({{ opt.disabledReason }})</span>
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="distributedOn" :label="$t('aice.llm_deployment.placement_strategy')">
          <a-select v-decorator="decorators.placement_strategy">
            <a-select-option value="spread">{{ $t('aice.llm_deployment.placement_strategy.spread') }}</a-select-option>
            <a-select-option value="binpack">{{ $t('aice.llm_deployment.placement_strategy.binpack') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="distributedOn" :label="$t('aice.llm_deployment.nnodes')" :extra="$t('aice.llm_deployment.nnodes_hint')">
          <a-input-number
            v-decorator="decorators.nnodes"
            :min="2"
            :precision="0"
            :placeholder="$t('aice.llm_deployment.nnodes_auto')" />
        </a-form-item>

        <a-form-item v-if="pipelineParallelVisible" :label="$t('aice.llm_deployment.pipeline_parallel_size')" :extra="$t('aice.llm_deployment.pipeline_parallel_size_hint')">
          <a-input-number
            v-decorator="decorators.pipeline_parallel_size"
            :min="1"
            :precision="0"
            :placeholder="$t('aice.llm_deployment.pipeline_parallel_size_auto')" />
        </a-form-item>

        <a-form-item v-if="distributedOn" class="mb-0">
          <topology-preview-card
            :sku-manager="skuManager"
            :sku-id="form.fd.llm_sku_id"
            :sku-detail="selectedSkuDetail"
            :distributed-inference="distributedOn"
            :parallel-mode="form.fd.parallel_mode"
            :nnodes="form.fd.nnodes"
            :pipeline-parallel-size="form.fd.pipeline_parallel_size"
            :placement-strategy="form.fd.placement_strategy"
            :prefer-hosts="form.fd.prefer_hosts" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.create') }}</a-button>
        <a-button class="ml-2" @click="handleCancel">{{ $t('common.cancel') }}</a-button>
        <side-errors
          :error-title="$t('aice.llm_deployment.create.schedulable_check.title')"
          :errors="errors"
          @update:errors="errors = {}" />
      </template>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import LlmSkuSelect from '@Ai/sections/LlmSkuSelect'
import { normalizePreferHosts } from '@Ai/utils/localPathImport'
import { checkSkuSchedulable, getSchedulableCheckErrors } from '@Ai/utils/skuSchedulableCheck'
import NameRepeated from '@/sections/NameRepeated'
import SideErrors from '@/sections/SideErrors'
import { Manager } from '@/utils/manager'
import { uuid } from '@/utils/utils'
import validateForm from '@/utils/validate'
import TopologyPreviewCard from '../components/TopologyPreviewCard'
import { getParallelModeOptions, PARALLEL_MODES } from '../utils/topology'

export default {
  name: 'LlmDeploymentCreate',
  components: { LlmSkuSelect, ServerNetwork, NameRepeated, SideErrors, TopologyPreviewCard },
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      loading: false,
      selectedSkuDetail: null,
      errors: {},
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
        fi: {
          networkList: [],
          capability: { max_nic_count: 8 },
        },
      },
      decorators: {
        name: ['name', {
          validateTrigger: 'blur',
          validateFirst: true,
          rules: [
            { required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) },
            { validator: this.$validate('resourceName') },
          ],
        }],
        llm_sku_id: ['llm_sku_id', {
          rules: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_sku')]) }],
        }],
        prefer_hosts: [
          'prefer_hosts',
          {
            initialValue: [],
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (!this.showPreferHosts) {
                    callback()
                    return
                  }
                  // local_path models require a host whitelist; for distributed
                  // inference the list is an optional placement hint.
                  if (!this.isLocalPathSku) {
                    callback()
                    return
                  }
                  const hosts = normalizePreferHosts(value)
                  if (hosts.length === 0) {
                    callback(this.$t('aice.local_path_import.prefer_hosts_required'))
                    return
                  }
                  callback()
                },
              },
            ],
          },
        ],
        distributed_inference: ['distributed_inference', {
          valuePropName: 'checked',
          initialValue: false,
        }],
        parallel_mode: ['parallel_mode', {
          initialValue: PARALLEL_MODES.PP,
        }],
        placement_strategy: ['placement_strategy', {
          initialValue: 'spread',
        }],
        nnodes: ['nnodes'],
        pipeline_parallel_size: ['pipeline_parallel_size'],
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
      manager: new Manager('llm_deployments'),
      skuManager: new Manager('llm_skus'),
    }
  },
  computed: {
    isLocalPathSku () {
      return this.selectedSkuDetail?.source === 'local_path'
    },
    distributedOn () {
      return !!this.form.fd.distributed_inference
    },
    distributedSupported () {
      const llmType = this.selectedSkuDetail?.llm_type
      return llmType === 'vllm' || llmType === 'sglang'
    },
    distributedSwitchDisabled () {
      return !!this.selectedSkuDetail && !this.distributedSupported
    },
    distributedSwitchHint () {
      if (this.distributedSwitchDisabled) {
        return this.$t('aice.llm_deployment.distributed_inference_unsupported')
      }
      return this.$t('aice.llm_deployment.distributed_inference_hint')
    },
    parallelModeOptions () {
      return getParallelModeOptions(this.selectedSkuDetail?.llm_type)
    },
    parallelModeHint () {
      const mode = this.form.fd.parallel_mode || PARALLEL_MODES.PP
      const opt = this.parallelModeOptions.find(o => o.value === mode)
      return opt?.hint || ''
    },
    pipelineParallelVisible () {
      const mode = this.form.fd.parallel_mode || PARALLEL_MODES.PP
      return this.distributedOn && mode === PARALLEL_MODES.PP
    },
    showPreferHosts () {
      return this.isLocalPathSku || this.distributedOn
    },
    localPathHostParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        host_status: 'online',
        host_type: 'container',
      }
    },
    skuParams () {
      return {
        scope: this.$store.getters.scope,
        details: true,
        limit: 20,
        filter: [
          'status.equals(ready)',
          'llm_type.in(vllm,ollama,sglang)',
        ],
      }
    },
    networkParams () {
      return {
        scope: this.$store.getters.scope,
        limit: 20,
        usable: true,
        host_type: 'container',
        filter: 'server_type.in(guest,hostlocal)',
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
  },
  created () {
    const skuId = this.$route.query.from_sku
    if (skuId) {
      this.applyFromSku(skuId)
    }
  },
  methods: {
    async loadSkuDetail (skuId) {
      if (!skuId) {
        this.selectedSkuDetail = null
        this.form.fc.setFieldsValue({ prefer_hosts: [] })
        return
      }
      try {
        const { data } = await this.skuManager.get({ id: skuId })
        this.selectedSkuDetail = data
        if (data?.llm_type !== 'vllm' && data?.llm_type !== 'sglang') {
          // Reset a stale distributed flag and pipeline pin: the backend
          // rejects them for other types.
          this.form.fc.setFieldsValue({ distributed_inference: false, parallel_mode: PARALLEL_MODES.PP, nnodes: null, pipeline_parallel_size: null })
          this.$set(this.form.fd, 'distributed_inference', false)
          this.$set(this.form.fd, 'parallel_mode', PARALLEL_MODES.PP)
          this.$set(this.form.fd, 'nnodes', null)
          this.$set(this.form.fd, 'pipeline_parallel_size', null)
        }
        if (data?.source === 'local_path') {
          const hosts = normalizePreferHosts(data.prefer_hosts)
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({ prefer_hosts: hosts })
          })
        } else {
          this.form.fc.setFieldsValue({ prefer_hosts: [] })
        }
      } catch (error) {
        this.selectedSkuDetail = null
        throw error
      }
    },
    handleSkuChange (skuId) {
      this.errors = {}
      this.loadSkuDetail(skuId)
    },
    // Distributed fields only apply while the switch is on; clear them when it
    // is turned off so stale values are never submitted.
    handleDistributedChange (checked) {
      if (!checked) {
        this.form.fc.setFieldsValue({ nnodes: null, parallel_mode: PARALLEL_MODES.PP, pipeline_parallel_size: null })
        this.$set(this.form.fd, 'nnodes', null)
        this.$set(this.form.fd, 'parallel_mode', PARALLEL_MODES.PP)
        this.$set(this.form.fd, 'pipeline_parallel_size', null)
      }
    },
    // Pipeline parallelism is only configurable in PP mode; drop a stale pin
    // when the user switches to DP so it is never submitted.
    handleParallelModeChange (mode) {
      if (mode === PARALLEL_MODES.DP) {
        this.form.fc.setFieldsValue({ pipeline_parallel_size: null })
        this.$set(this.form.fd, 'pipeline_parallel_size', null)
      }
    },
    applyFromSku (skuId) {
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ llm_sku_id: skuId })
        this.loadSkuDetail(skuId)
      })
    },
    networkResourceMapper (list) {
      return (list || []).filter(val => val.server_type === 'guest' || val.server_type === 'hostlocal')
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
      return [{ exit: false }]
    },
    buildPayload (values) {
      const distributedInference = this.distributedSupported && !!values.distributed_inference
      const payload = {
        name: values.name,
        llm_sku_id: values.llm_sku_id,
        replicas: 1,
        placement_strategy: values.placement_strategy || 'spread',
        access_policy: 'authed',
        distributed_inference: distributedInference,
        nets: this.genNetworks(values),
      }
      if (distributedInference && values.nnodes != null && Number(values.nnodes) > 0) {
        payload.nnodes = Number(values.nnodes)
      }
      const parallelMode = values.parallel_mode || PARALLEL_MODES.PP
      // Pipeline parallelism is only configurable in PP mode; omit it for DP.
      if (distributedInference && parallelMode === PARALLEL_MODES.PP && values.pipeline_parallel_size != null && Number(values.pipeline_parallel_size) > 0) {
        payload.pipeline_parallel_size = Number(values.pipeline_parallel_size)
      }
      if (distributedInference && this.distributedSupported) {
        payload.parallel_mode = parallelMode
      }
      if (this.showPreferHosts) {
        const preferHosts = normalizePreferHosts(values.prefer_hosts)
        if (preferHosts.length > 0) {
          payload.prefer_hosts = preferHosts
        }
      }
      return payload
    },
    handleCancel () {
      this.$router.back()
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.loading = true
        this.errors = {}
        const payload = this.buildPayload(values)
        const { data: check } = await checkSkuSchedulable(this.skuManager, values.llm_sku_id, {
          distributed_inference: !!payload.distributed_inference,
          parallel_mode: payload.parallel_mode || 'pp',
          prefer_hosts: payload.prefer_hosts || [],
          placement_strategy: payload.placement_strategy,
          nnodes: payload.nnodes || 0,
          pipeline_parallel_size: payload.pipeline_parallel_size || 0,
        })
        if (!check.schedulable) {
          this.errors = getSchedulableCheckErrors(check)
          return
        }
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
