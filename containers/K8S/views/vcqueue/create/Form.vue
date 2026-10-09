<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input :disabled="isUpdate" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')">
        <cluster-select :disabled="isUpdate" v-decorator="decorators.cluster" @input="setCluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_parent')">
        <base-select
          v-decorator="decorators.parent"
          resource="vcqueues"
          version="v1"
          id-key="name"
          :need-params="true"
          :params="clusterListParams"
          :mapper="parentQueueMapper"
          :select-props="{ placeholder: $t('k8s.vc_parent') }" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_weight')">
        <a-input-number v-decorator="decorators.weight" :min="1" style="width: 200px" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_priority')">
        <a-input-number v-decorator="decorators.priority" style="width: 200px" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_reclaimable')">
        <a-switch v-decorator="decorators.reclaimable" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_guarantee')" :extra="$t('k8s.vc_guarantee_hint')">
        <a-input v-decorator="decorators.guaranteeCpu" :addonBefore="$t('k8s.vc_cpu')" class="mb-2" placeholder="2" />
        <a-input v-decorator="decorators.guaranteeMemory" :addonBefore="$t('k8s.vc_memory')" placeholder="4Gi" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_deserved')" :extra="$t('k8s.vc_deserved_hint')">
        <a-input v-decorator="decorators.deservedCpu" :addonBefore="$t('k8s.vc_cpu')" class="mb-2" placeholder="2" />
        <a-input v-decorator="decorators.deservedMemory" :addonBefore="$t('k8s.vc_memory')" placeholder="4Gi" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_capability')" :extra="$t('k8s.vc_capability_hint')">
        <a-input v-decorator="decorators.capabilityCpu" :addonBefore="$t('k8s.vc_cpu')" class="mb-2" placeholder="4" />
        <a-input v-decorator="decorators.capabilityMemory" :addonBefore="$t('k8s.vc_memory')" placeholder="8Gi" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import k8sCreateMixin from '@K8S/mixins/create'
import { normalizeDeservedFromGuarantee, validateQueueResources } from '../utils/validation'

const MESSAGE_KEYS = {
  deserved_cpu_required: 'k8s.vc_deserved_cpu_required',
  deserved_memory_required: 'k8s.vc_deserved_memory_required',
  deserved_cpu_lt_guarantee: 'k8s.vc_deserved_cpu_lt_guarantee',
  deserved_memory_lt_guarantee: 'k8s.vc_deserved_memory_lt_guarantee',
  deserved_cpu_gt_capability: 'k8s.vc_deserved_cpu_gt_capability',
  deserved_memory_gt_capability: 'k8s.vc_deserved_memory_gt_capability',
  invalid_quantity: 'k8s.vc_invalid_quantity',
}

export default {
  name: 'K8sVcqueueForm',
  components: {
    ClusterSelect,
  },
  mixins: [k8sCreateMixin],
  props: {
    isUpdate: {
      type: Boolean,
      default: false,
    },
    initial: {
      type: Object,
      default: null,
    },
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
      decorators: {
        name: [
          'name',
          {
            rules: [{ required: !this.isUpdate, message: this.$t('k8s.vc_required') }],
          },
        ],
        cluster: [
          'cluster',
          {
            rules: [{ required: !this.isUpdate, message: this.$t('k8s.vc_required') }],
          },
        ],
        parent: [
          'parent',
          { initialValue: 'root' },
        ],
        weight: [
          'weight',
          {
            initialValue: 1,
            rules: [{ required: true, message: this.$t('k8s.vc_weight_invalid') }],
          },
        ],
        priority: [
          'priority',
          { initialValue: 100 },
        ],
        reclaimable: [
          'reclaimable',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
        guaranteeCpu: ['guaranteeCpu'],
        guaranteeMemory: ['guaranteeMemory'],
        deservedCpu: ['deservedCpu'],
        deservedMemory: ['deservedMemory'],
        capabilityCpu: ['capabilityCpu'],
        capabilityMemory: ['capabilityMemory'],
      },
    }
  },
  computed: {
    clusterListParams () {
      if (!this.cluster) return {}
      return {
        cluster: this.cluster,
        limit: 0,
      }
    },
  },
  watch: {
    initial: {
      immediate: true,
      handler (val) {
        this.applyInitial(val)
      },
    },
  },
  methods: {
    parentQueueMapper (list) {
      const selfName = this.isUpdate && this.initial ? this.initial.name : ''
      if (!selfName) return list
      return list.filter(item => item.name !== selfName)
    },
    applyInitial (val) {
      if (!val) return
      const cluster = val.cluster_id || val.clusterID
      if (cluster) this.setCluster(cluster)
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          name: val.name,
          cluster,
          parent: val.parent || '',
          weight: val.weight || 1,
          priority: val.priority != null ? val.priority : 100,
          reclaimable: val.reclaimable !== false,
          guaranteeCpu: val.guaranteeCpu || '',
          guaranteeMemory: val.guaranteeMemory || '',
          deservedCpu: val.deservedCpu || '',
          deservedMemory: val.deservedMemory || '',
          capabilityCpu: val.capabilityCpu || '',
          capabilityMemory: val.capabilityMemory || '',
        })
      })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    buildPayload (values) {
      const weight = Number(values.weight)
      const priority = values.priority == null || values.priority === '' ? 100 : Number(values.priority)
      if (!Number.isInteger(weight) || weight < 1) {
        const error = new Error('weight')
        this.$message.error(this.$t('k8s.vc_weight_invalid'))
        throw error
      }
      if (!Number.isInteger(priority)) {
        const error = new Error('priority')
        this.$message.error(this.$t('k8s.vc_priority_invalid'))
        throw error
      }
      const name = (values.name || '').trim()
      if (!this.isUpdate && (name === 'root' || name === 'default')) {
        const error = new Error('reserved')
        this.$message.error(this.$t('k8s.vc_reserved_name'))
        throw error
      }
      const guarantee = {
        cpu: values.guaranteeCpu || '',
        memory: values.guaranteeMemory || '',
      }
      const capability = {
        cpu: values.capabilityCpu || '',
        memory: values.capabilityMemory || '',
      }
      const deservedInput = {
        cpu: values.deservedCpu || '',
        memory: values.deservedMemory || '',
      }
      const result = validateQueueResources(guarantee, capability, deservedInput)
      if (!result.valid) {
        const key = MESSAGE_KEYS[result.messages[0]] || 'k8s.vc_invalid_quantity'
        const error = new Error(result.messages[0])
        this.$message.error(this.$t(key))
        throw error
      }
      const deserved = normalizeDeservedFromGuarantee(guarantee, deservedInput)
      const payload = {
        cluster: values.cluster,
        weight,
        priority,
        reclaimable: values.reclaimable !== false,
        parent: (values.parent || '').trim(),
        guaranteeCpu: guarantee.cpu.trim(),
        guaranteeMemory: guarantee.memory.trim(),
        capabilityCpu: capability.cpu.trim(),
        capabilityMemory: capability.memory.trim(),
        deservedCpu: deserved.cpu.trim(),
        deservedMemory: deserved.memory.trim(),
      }
      if (!this.isUpdate) payload.name = name
      return payload
    },
    async doCreate () {
      const values = await this.validateForm()
      const data = this.buildPayload(values)
      await new this.$Manager('vcqueues', 'v1').create({ data })
      this.$message.success(this.$t('k8s.text_46'))
    },
    async doUpdate () {
      const values = await this.validateForm()
      const data = this.buildPayload(values)
      await new this.$Manager('vcqueues', 'v1').update({
        id: this.initial.id,
        data,
        params: { cluster: data.cluster },
      })
      this.$message.success(this.$t('k8s.text_46'))
    },
  },
}
</script>
