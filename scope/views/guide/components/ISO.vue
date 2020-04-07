<template>
  <a-form :form="form.fc" v-bind="formItemLayout">
    <a-form-item label="途径" required>
      <a-radio-group v-model="channel">
        <a-radio-button v-for="(v, k) in $t('isoChannelOptions')" :key="k" :value="k"> {{ v }} </a-radio-button>
      </a-radio-group>
    </a-form-item>
    <keep-alive>
      <component :is="`iso-${channel}`" ref="ISO_FORM" />
    </keep-alive>
  </a-form>
</template>

<script>
// import * as R from 'ramda'
import ISOUpload from './ISOUpload'
import ISOImport from './ISOImport'
export default {
  name: 'GuideIso',
  components: {
    'iso-upload': ISOUpload,
    'iso-import': ISOImport,
  },
  data () {
    return {
      loading: false,
      channel: 'import',
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  inject: ['formItemLayout'],
  methods: {
    async doSubmit () {
      try {
        await this.$refs['ISO_FORM'].doSubmit(this.form.fc)
        return true
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
