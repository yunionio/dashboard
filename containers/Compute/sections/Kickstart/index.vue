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
export default {
  name: 'Kickstart',
  props: {
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
}
</script>

<style scoped>

</style>
