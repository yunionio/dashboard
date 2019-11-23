<template>
  <div>
    <template v-for="item of options">
      <!-- 一组操作，下拉形式展示 -->
      <template v-if="item.actions">
        <dropmenus :group="group" :key="item.label" :item="item" :row="row" :button-type="buttonType" :button-size="buttonSize" />
      </template>
      <!-- 单个操作 -->
      <template v-else>
        <action-button
          :key="item.label"
          :item="item"
          :row="row"
          :button-type="buttonType"
          :button-size="buttonSize"
          :class="{ 'ml-2': group }"
          @clear-selected="clearSelected" />
      </template>
    </template>
  </div>
</template>

<script>
import Dropmenus from './Dropmenus'
import ActionButton from './ActionButton'

export default {
  name: 'PageListActions',
  components: {
    Dropmenus,
    ActionButton,
  },
  props: {
    // 有 row 则认为是列表每行的 actions
    row: {
      type: Object,
    },
    options: {
      type: Array,
      required: true,
    },
    buttonType: {
      type: String,
    },
    buttonSize: {
      type: String,
    },
    group: {
      type: Boolean,
    },
  },
  methods: {
    // 清除已选项
    clearSelected () {
      this.$emit('clear-selected')
    },
  },
}
</script>
