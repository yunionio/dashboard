<template>
  <div>
    <a-row>
      <a-col :span="10">
        <a-select
          :value="area_code"
          showSearch
          style="width: 100%"
          @change="handleCountryChange">
          <a-select-option v-for="c in countries" :key="c.value" :value="c.value" :label="c.label">
            {{`${c.label}(+${c.value})`}}
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="14">
          <a-input :value="mobile" @change="handleMobileChange" />
      </a-col>
    </a-row>
  </div>
</template>

<script>

export default {
  name: 'MobileInput',
  props: {
    value: {
    },
  },
  data () {
    const value = this.value || {}
    const countries = Object.entries(this.$t('countries')).map((c) => { return { value: c[0], label: c[1] } }).sort((a, b) => { return a.value > b.value })
    return {
      area_code: value.area_code || '86',
      mobile: value.mobile || '',
      countries: countries,
    }
  },
  watch: {
    value (val = {}) {
      this.area_code = val.area_code || '86'
      this.mobile = val.mobile || ''
    },
  },
  methods: {
    handleMobileChange (e) {
      this.handleChange({ mobile: e.target.value })
    },
    handleCountryChange (e) {
      this.handleChange({ area_code: e })
    },
    handleChange (val = {}) {
      this.$emit('change', Object.assign({}, { area_code: this.area_code, mobile: this.mobile }, val))
    },
  },
}
</script>

<style scoped>

</style>
