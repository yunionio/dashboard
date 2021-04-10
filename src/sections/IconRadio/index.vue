<template>
  <div class="d-flex flex-wrap icon-radio">
    <template v-for="(item, i) of options">
      <div class="item d-flex p-2 mr-3 align-items-center" :class="{ active: value === item.key }" :key="i" @click="() => change(item)">
        <icon style="font-size: 24px;" v-if="item.icon" v-bind="item.icon" :style="item.style || {}" />
        <img v-else :src="item.img" />
        <h5 class="flex-fill" v-if="!item.labelHidden">{{ item.label }}</h5>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'IconRadio',
  props: {
    value: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    change (item) {
      this.$emit('change', item.key)
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../styles/less/theme.less';

.icon-radio {
  .item {
    width: 120px;
    cursor: pointer;
    display: block;
    font-size: 14px;
    margin-bottom: 10px;
    border: 1px solid #eee;
    text-align: center;
    border-radius: 3px;
    box-sizing: border-box;
    &.active {
      border-color: @primary-color;
      h5 {
        color: @primary-color;
      }
    }
    h5 {
      margin: 0;
      font-size: 13px;
      font-weight: 400;
    }
  }
}
</style>
