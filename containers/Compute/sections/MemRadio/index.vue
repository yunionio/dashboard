<template>
  <a-form-item :extra="extra">
    <a-radio-group v-decorator="decorator" :disabled="disabled" @change="onChange">
      <a-radio-button v-show="showUnlimited" :key="0" :value="0">{{ $t('compute.unlimited') }}</a-radio-button>
      <a-radio-button v-for="item in options" :value="item" :key="item" :disabled="disableOptionHandle(item)">{{ item | format }}</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import { sizestrWithUnit } from '@/utils/utils'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'MemRadio',
  filters: {
    format (val) {
      return sizestrWithUnit(val, 'M', 1024)
    },
  },
  mixins: [createFormFieldDraftMixin],
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    disableOptions: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    extra: {
      type: String,
      default: '',
    },
    showUnlimited: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    options: {
      handler (opts) {
        this.$nextTick(() => this.tryRestoreMemDraft(opts))
      },
    },
  },
  methods: {
    disableOptionHandle (item) {
      return this.disableOptions.includes(item)
    },
    onChange (e) {
      const val = e && e.target ? e.target.value : undefined
      // 仅用户点选写草稿
      this.writeFormFieldDraft(val)
      this.$emit('change', val)
    },
    tryRestoreMemDraft (opts) {
      if (!this.formDraftKey || !Array.isArray(opts)) return
      const fieldName = Array.isArray(this.decorator) ? this.decorator[0] : 'vmem'
      const fc = this.form?.fc || this.form
      if (!fc?.getFieldValue) return
      const draft = this.readFormFieldDraft()
      // 无草稿：不覆盖，走页面原有 initialValue(2048) + cpuChange 默认 2G
      if (draft === null || draft === undefined || draft === '') return
      let next
      // 不限存的是 0，不在 options 内，需单独回填
      if (this.showUnlimited && (draft === 0 || draft === '0')) {
        next = 0
      } else if (!opts.length) {
        return
      } else {
        const hit = this.matchFormFieldDraftInOptions(opts, draft, {
          getId: item => item,
        })
        // 草稿不在 options：回退原先默认 2G，再不行用第一项
        if (hit != null) {
          next = hit
        } else if (opts.some(item => Number(item) === 2048)) {
          next = opts.find(item => Number(item) === 2048)
        } else {
          next = opts[0]
        }
      }
      if (next == null) return
      const current = fc.getFieldValue(fieldName)
      if (current === next || String(current) === String(next)) return
      if (fc.setFieldsValue) {
        fc.setFieldsValue({ [fieldName]: next })
      }
    },
    serializeFormFieldDraft () {
      const fieldName = Array.isArray(this.decorator) ? this.decorator[0] : 'vmem'
      const fc = this.form?.fc || this.form
      const value = fc?.getFieldValue?.(fieldName)
      // 0 表示不限，需可序列化
      return value != null && value !== '' ? value : undefined
    },
  },
}
</script>
