<template>
  <div class="d-flex flex-wrap icon-radio">
    <template v-for="(item, i) of options">
      <div class="item d-flex p-2 mr-3 align-items-center" :class="{ active: value.includes(item.key) }" :key="i" @click="_ => change(item)">
        <icon style="font-size: 24px;" v-if="item.icon" v-bind="{type: item.icon}" :style="item.style || {}" />
        <img v-else :src="item.img" />
        <h5 class="flex-fill" v-if="!item.labelHidden">{{ item.label }}</h5>
      </div>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
export default {
  name: 'IconCheckbox',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    change (item) {
      const arr = R.clone(this.value)
      const itemKeyIndex = arr.indexOf(item.key)
      if (itemKeyIndex >= 0) {
        arr.splice(itemKeyIndex, 1)
      } else {
        arr.push(item.key)
      }
      this.$emit('change', arr)
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
