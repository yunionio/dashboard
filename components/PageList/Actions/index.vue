<template>
  <div>
    <template v-for="item of options">
      <!-- 一组操作，下拉形式展示 -->
      <template v-if="item.actions">
        <dropmenus :group="group" :key="item.label" :item="item" :row="row" :button-type="buttonType" :button-size="buttonSize" :button-style="buttonStyle" :button-block="buttonBlock" />
      </template>
      <!-- 单个操作 -->
      <template v-else>
        <action-button
          :key="item.label"
          :item="item"
          :row="row"
          :button-type="buttonType"
          :button-size="buttonSize"
          :button-block="buttonBlock"
          :class="{ 'ml-2': group }"
          :button-style="buttonStyle" />
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
    buttonStyle: {
      type: Object,
    },
    group: {
      type: Boolean,
    },
    buttonBlock: {
      type: Boolean,
    },
  },
}
</script>
