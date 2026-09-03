<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator" @change="handleMachineChange">
      <a-radio-button :value="opt.value" v-for="opt in machineOptions" :key="opt.value">{{ opt.text }}</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'Machine',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    formDraftKind: {
      type: String,
      default: 'selection',
    },
    decorator: {
      type: Array,
      required: true,
    },
    form: {
      type: Object,
    },
    isArm: {
      type: Boolean,
      required: true,
    },
    showDefault: {
      type: Boolean,
    },
  },
  computed: {
    machineOptions () {
      var options = []
      if (this.showDefault) {
        options.push({
          text: this.$t('compute.text_1'),
          value: '',
        })
      }
      if (this.isArm) {
        options.push(
          {
            text: 'VIRT',
            value: 'virt',
          },
        )
      } else {
        options.push(
          {
            text: 'PC',
            value: 'pc',
          },
          {
            text: 'Q35',
            value: 'q35',
          },
        )
      }
      return options
    },
    selectableMachineValues () {
      return this.machineOptions.map(item => item.value)
    },
  },
  watch: {
    selectableMachineValues: {
      immediate: true,
      handler () {
        this.$nextTick(() => {
          this.restoreFormFieldDraftFields()
          this.ensureValidMachine()
        })
      },
    },
  },
  methods: {
    handleMachineChange (e) {
      this.$emit('change', { value: e.target.value })
    },
    /** 架构切换后当前值不在选项里时落到第一项（避免 radio 无选中） */
    ensureValidMachine () {
      const field = Array.isArray(this.decorator) ? this.decorator[0] : 'machine'
      const fc = this.resolveFormFc()
      if (!fc || !this.selectableMachineValues.length) return
      const current = fc.getFieldValue(field)
      if (this.selectableMachineValues.includes(current)) return
      const next = this.selectableMachineValues[0]
      if (next === undefined) return
      this.applyFormFieldValues({ [field]: next })
    },
    serializeFormFieldDraft () {
      const field = Array.isArray(this.decorator) ? this.decorator[0] : 'machine'
      const value = this.resolveFormFc()?.getFieldValue?.(field)
      if (value === undefined || value === null) return undefined
      return value
    },
    applyCreateFormFieldDraft (draft) {
      if (draft === undefined || draft === null) return
      if (!this.selectableMachineValues.includes(draft)) return
      const field = Array.isArray(this.decorator) ? this.decorator[0] : 'machine'
      const fc = this.resolveFormFc()
      if (!fc) return
      const current = fc.getFieldValue(field)
      if (current === draft || String(current) === String(draft)) return
      this.applyFormFieldValues({ [field]: draft })
    },
  },
}
</script>
