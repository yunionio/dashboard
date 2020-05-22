<template>
  <div class="d-flex">
    <a-form-item class="flex-fill">
      <a-select v-decorator="decorators.metric_type">
        <a-select-option v-for="item in typeOpts" :key="item.key">{{ item.label }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item class="flex-fill">
      <a-select v-decorator="decorators.metric_type">
        <a-select-option v-for="item in metricOpts" :key="item.key">{{ item.label }}</a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>

<script>
export default {
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    typeOpts: {
      type: Array,
      default: () => [],
    },
    metricOpts: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<style>

</style>
