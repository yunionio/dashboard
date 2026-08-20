<template>
  <div>
    <a-form-item>
      <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorator.kickstart_enabled" :disabled="enableDisabled" />
    </a-form-item>
    <a-form-item v-if="form.fd.kickstart_enabled" :extra="$t('compute.kickstart_placeholder')">
      <code-mirror v-if="form.fd.kickstart_enabled" v-decorator="decorator.kickstart_config" :options="cmOptions" />
    </a-form-item>
  </div>
</template>

<script>
import 'codemirror/theme/material.css'
import 'codemirror/addon/edit/matchbrackets'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
export default {
  name: 'Kickstart',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    decorator: {
      type: Object,
      required: true,
    },
    form: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        theme: 'material',
        mode: 'application/json',
        lint: true,
        matchBrackets: true,
      },
    }
  },
  computed: {
    enableDisabled () {
      const { os_distribution = '' } = this.form.fi?.imageMsg?.properties || this.form.fi?.imageMsg?.info?.properties || {}
      return !['centos', 'rhel', 'openeuler', 'ubuntu'].some(item => os_distribution.toLowerCase().includes(item))
    },
  },
  watch: {
    enableDisabled: {
      handler (val, oldVal) {
        if (val) {
          this.form.fc.setFieldsValue({
            [this.decorator.kickstart_enabled[0]]: false,
          })
        }
      },
    },
    'form.fd.kickstart_enabled' (val) {
      if (!val) {
        if (this.form && this.form.fc) {
          this.form.fc.setFieldsValue({
            [this.decorator.kickstart_config[0]]: undefined,
          })
        }
        if (this.form && this.form.fd) this.$delete(this.form.fd, this.decorator.kickstart_config[0])
      }
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
    },
    'form.fd.kickstart_config' () {
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
    },
  },
  methods: {
    getCreateFormFieldDraftSnapshot () {
      const fc = this.form?.fc
      if (!fc) return undefined
      const enabled = !!fc.getFieldValue(this.decorator.kickstart_enabled[0])
      if (!enabled) {
        return { kickstart_enabled: false, kickstart_config: '' }
      }
      return {
        kickstart_enabled: true,
        kickstart_config: fc.getFieldValue(this.decorator.kickstart_config[0]) || '',
      }
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.form?.fc || this.enableDisabled) return
      const enableKey = this.decorator.kickstart_enabled[0]
      const configKey = this.decorator.kickstart_config[0]
      const values = {}
      if (draft.kickstart_enabled === false) {
        values[enableKey] = false
        values[configKey] = undefined
      } else if (draft.kickstart_enabled) {
        values[enableKey] = true
        if (draft.kickstart_config) values[configKey] = draft.kickstart_config
      }
      if (Object.keys(values).length) this.form.fc.setFieldsValue(values)
    },
  },
}
</script>

<style scoped>

</style>
