<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator" @change="handleBiosChange">
      <a-radio-button v-if="showDefault" value="">{{ $t('compute.text_1') }}</a-radio-button>
      <a-tooltip :title="$t('compute.text_1362')" v-if="isArm">
        <a-radio-button value="BIOS" :disabled="isArm">BIOS</a-radio-button>
      </a-tooltip>
      <a-radio-button v-else value="BIOS" :disabled="uefi">BIOS</a-radio-button>
      <a-radio-button value="UEFI">UEFI</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'BIOS',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    /** selection：radio 类，local + session 双写、可跨 tab 回填 */
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
    uefi: {
      type: Boolean,
    },
    isArm: {
      type: Boolean,
    },
    showDefault: {
      type: Boolean,
    },
  },
  computed: {
    /** 当前可选值（禁用项不参与草稿回填） */
    selectableBiosOptions () {
      const opts = []
      if (this.showDefault) opts.push('')
      if (!this.isArm && !this.uefi) opts.push('BIOS')
      opts.push('UEFI')
      return opts
    },
  },
  watch: {
    selectableBiosOptions: {
      immediate: true,
      handler () {
        this.$nextTick(() => this.restoreFormFieldDraftFields())
      },
    },
  },
  methods: {
    handleBiosChange (e) {
      this.$emit('change', e.target.value)
    },
    serializeFormFieldDraft () {
      const field = Array.isArray(this.decorator) ? this.decorator[0] : 'bios'
      const fc = this.resolveFormFc()
      const value = fc?.getFieldValue?.(field)
      // '' 表示「默认」，需可落盘
      if (value === undefined || value === null) return undefined
      return value
    },
    applyCreateFormFieldDraft (draft) {
      if (draft === undefined || draft === null) return
      if (!this.selectableBiosOptions.includes(draft)) return
      const field = Array.isArray(this.decorator) ? this.decorator[0] : 'bios'
      const fc = this.resolveFormFc()
      if (!fc) return
      const current = fc.getFieldValue(field)
      if (current === draft || String(current) === String(draft)) return
      this.applyFormFieldValues({ [field]: draft })
    },
  },
}
</script>
