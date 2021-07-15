<template>
  <a-select :value="selected" @change="handleChange">
    <a-select-option v-for="o of options" :key="o.label" :value="o.id">
      {{ o.label }}
    </a-select-option>
  </a-select>
</template>

<script>
export default {
  name: 'BasicSelect',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      selected: this.value || '',
    }
  },
  watch: {
    value (val) {
      this.selected = val
    },
  },
  methods: {
    handleChange (v) {
      this.selected = v
      this.$emit('change', v)
    },
  },
}
</script>

<style scoped>

</style>
