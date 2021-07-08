<template>
  <a-select :value="selected" :dropdownMatchSelectWidth="false" @change="handleChange" style="padding: 2px;">
    <a-select-option v-for="m of options" :key="m.label" :value="m.value">
      {{ m.label }}
    </a-select-option>
  </a-select>
</template>

<script>
export default {
  name: 'MetricSelect',
  props: {
    value: {
      type: Object,
      required: true,
    },
    options: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    const value = this.value || {}
    return {
      selected: value.value || 0,
    }
  },
  watch: {
    value (val = {}) {
      this.selected = val.value || 0
    },
  },
  methods: {
    handleChange (v) {
      this.selected = v
      this.$emit('changeSelect', v)
      this.$emit('change', this.options[v])
    },
  },
}
</script>
