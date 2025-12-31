<template>
  <div class="usage-quota" :class="{ 'is-template': isTemplate }">
    <h3>{{ title }}</h3>
    <p>{{ value }}</p>
  </div>
</template>

<script>
export default {
  name: 'UsageQuota',
  props: {
    title: {
      type: String,
    },
    value: {
      type: [Number, String],
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
.usage-quota {
  width: 100%;
  height: 84px;
  padding: 20px 10px;
  margin-bottom: 16px;
  box-sizing: border-box;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
  h3 {
    font-size: 14px;
    font-weight: normal;
  }
  p{
    color: #3591FF;
  }
  &.is-template {
    box-shadow: none;
    border: 1px solid #e5e6eb;
  }
}
</style>
