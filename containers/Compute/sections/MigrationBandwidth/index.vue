<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group @change="brandWidthChangeHandle" v-decorator="decorators.brandWidth">
        <a-radio-button v-for="item in brandWidthOptions" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="showDuration" class="mb-0">
      <a-input-group compact>
        <a-input class="w-25" type="number" suffix="M" v-decorator="decorators.customBrandWidth" @change="customBrandWidthChangeHandle" />
      </a-input-group>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'MigrationBandwidth',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => !R.isNil(val.brandWidth) && !R.isNil(val.customBrandWidth),
    },
    form: {
      type: Object,
    },
  },
  data () {
    return {
      brandWidthOptions: [
        { key: '-1', label: this.$t('compute.text_138') },
        { key: '100', label: '100M' },
        { key: '200', label: '200M' },
        { key: '300', label: '300M' },
        { key: '500', label: '500M' },
        { key: '1000', label: '1000M' },
        { key: 'custom', label: this.$t('compute.text_144') },
      ],
      showDuration: false,
    }
  },
  methods: {
    brandWidthChangeHandle (e) {
      this.form.fc.setFieldsValue({ brandWidth: e.target.value })

      if (e.target.value === 'custom') {
        this.showDuration = true
      } else {
        this.showDuration = false
      }
    },
    customBrandWidthChangeHandle (e) {
      const brandWidth = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value)
      this.form.fc.setFieldsValue({ customBrandWidth: brandWidth })
    },
  },
}
</script>

<style>

</style>
