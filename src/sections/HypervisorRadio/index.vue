<template>
  <a-form-item class="mb-0">
    <span v-if="isEmpty">{{$t('compute.hypervisor_empty_tips')}}</span>
    <a-radio-group v-else v-decorator="decorator" @change="changeHandle">
      <template v-for="item in hypervisorOpts">
        <a-tooltip :title="disabledHypervisorMap[item.key]" :key="item.key">
          <a-radio-button
            :value="item.key"
            :disabled="disabledHypervisorMap[item.key]">
            {{ getLabel(item) }}
          </a-radio-button>
        </a-tooltip>
      </template>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import * as R from 'ramda'
import { HYPERVISORS_GROUP, HYPERVISORS_MAP } from '@/constants'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'ProviderRadio',
  mixins: [createFormFieldDraftMixin],
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      validator: val => Object.keys(HYPERVISORS_GROUP).includes(val),
    },
    hypervisors: {
      type: Array,
      validator: val => R.isEmpty(val) || val.every(hyper => Object.keys(HYPERVISORS_MAP).includes(hyper)),
    },
    ignoreBaremetal: { // 忽略裸金属服务器
      type: Boolean,
      default: true,
    },
    disabledHypervisorMap: {
      type: Object,
      default () {
        return {}
      },
    },
    formDraftKey: {
      type: String,
      default: '',
    },
  },
  inject: {
    form: { default: undefined },
  },
  computed: {
    hypervisorOpts () {
      let hyperItems = []
      const hyperGroup = HYPERVISORS_GROUP[this.type]
      if (hyperGroup) {
        hyperItems = Object.values(hyperGroup)
      }
      hyperItems = this.hypervisors.map(val => HYPERVISORS_MAP[val])
      if (this.ignoreBaremetal) {
        hyperItems = hyperItems.filter(val => val.key !== 'baremetal')
      }
      return hyperItems.filter(Boolean)
    },
    isEmpty () {
      return !this.hypervisorOpts?.length
    },
  },
  watch: {
    hypervisorOpts: {
      immediate: true,
      handler (opts) {
        this.$nextTick(() => this.tryRestoreHypervisorDraft(opts))
      },
    },
  },
  methods: {
    changeHandle (e) {
      const value = e.target.value
      this.writeFormFieldDraft(value)
      this.$emit('change', value)
    },
    getLabel (item) {
      if (!item) return ''
      if (item.key === HYPERVISORS_MAP.kvm.key) {
        return this.type === 'private' ? HYPERVISORS_MAP.cloudpods.label : HYPERVISORS_MAP.kvm.label
      }
      return item.label
    },
    tryRestoreHypervisorDraft (opts) {
      if (!Array.isArray(opts) || !opts.length) return
      const hit = this.matchFormFieldDraftInOptions(opts)
      let next = hit?.key
      if (next && this.disabledHypervisorMap?.[next]) next = undefined
      // options 变化：草稿命中则回填，否则第一项（不写草稿）
      if (!next) {
        const first = opts.find(item => item?.key && !this.disabledHypervisorMap?.[item.key])
        next = first?.key
      }
      if (!next) return
      const fieldName = Array.isArray(this.decorator) ? this.decorator[0] : 'hypervisor'
      const current = this.form?.fc?.getFieldValue?.(fieldName)
      if (current === next) return
      if (this.form?.fc) {
        this.form.fc.setFieldsValue({ [fieldName]: next })
      }
      this.$emit('change', next)
    },
    serializeFormFieldDraft () {
      const fieldName = Array.isArray(this.decorator) ? this.decorator[0] : 'hypervisor'
      const value = this.form?.fc?.getFieldValue?.(fieldName)
      return value || undefined
    },
  },
}
</script>
