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
  },
  methods: {
    getCreateFormFieldDraftSnapshot () {
      const fc = this.form?.fc
      if (!fc) return undefined
      return {
        kickstart_enabled: fc.getFieldValue('kickstart_enabled'),
        kickstart_config: fc.getFieldValue('kickstart_config'),
      }
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.form?.fc || this.enableDisabled) return
      const values = {}
      if (draft.kickstart_enabled != null) values.kickstart_enabled = draft.kickstart_enabled
      if (draft.kickstart_config) values.kickstart_config = draft.kickstart_config
      if (Object.keys(values).length) this.form.fc.setFieldsValue(values)
    },
  },
}
</script>

<style scoped>

</style>
