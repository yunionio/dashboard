<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator" @change="handleVdiChange">
      <a-radio-button v-if="showDefault" value="">{{ $t('compute.text_1') }}</a-radio-button>
      <a-radio-button value="vnc">VNC</a-radio-button>
      <a-radio-button value="spice">SPICE</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'VDI',
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
    showDefault: {
      type: Boolean,
    },
  },
  computed: {
    selectableVdiOptions () {
      const opts = []
      if (this.showDefault) opts.push('')
      opts.push('vnc', 'spice')
      return opts
    },
  },
  watch: {
    selectableVdiOptions: {
      immediate: true,
      handler () {
        this.$nextTick(() => this.restoreFormFieldDraftFields())
      },
    },
  },
  methods: {
    handleVdiChange (e) {
      this.$emit('change', { value: e.target.value })
    },
    serializeFormFieldDraft () {
      const field = Array.isArray(this.decorator) ? this.decorator[0] : 'vdi'
      const value = this.resolveFormFc()?.getFieldValue?.(field)
      if (value === undefined || value === null) return undefined
      return value
    },
    applyCreateFormFieldDraft (draft) {
      if (draft === undefined || draft === null) return
      if (!this.selectableVdiOptions.includes(draft)) return
      const field = Array.isArray(this.decorator) ? this.decorator[0] : 'vdi'
      const fc = this.resolveFormFc()
      if (!fc) return
      const current = fc.getFieldValue(field)
      if (current === draft || String(current) === String(draft)) return
      this.applyFormFieldValues({ [field]: draft })
    },
  },
}
</script>
