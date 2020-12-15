<template>
  <div>
    <template v-for="item of options">
      <!-- 一组操作，下拉形式展示 -->
      <template v-if="item.actions">
        <dropmenus
          v-if="!getDeepHidden(item)"
          :group="group"
          :key="item.label"
          :item="item"
          :row="row"
          :button-type="buttonType"
          :button-size="buttonSize"
          :button-style="buttonStyle"
          :button-block="buttonBlock"
          @clear-selected="clearSelected" />
      </template>
      <!-- 单个操作 -->
      <template v-else>
        <action-button
          v-if="!getHidden(item)"
          :key="item.label"
          :item="item"
          :row="row"
          :button-type="buttonType"
          :button-size="buttonSize"
          :button-block="buttonBlock"
          :class="{ 'ml-2': group }"
          :button-style="buttonStyle"
          @clear-selected="clearSelected" />
      </template>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
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
  methods: {
    // 清除已选项
    clearSelected () {
      this.$emit('clear-selected')
    },
    getHidden (item) {
      return R.is(Function, item.hidden) ? item.hidden(this.row) : item.hidden === true
    },
    getDeepHidden (item) {
      if (this.getHidden(item)) {
        return true
      }
      // 默认隐藏，当遇到任意一个不隐藏的按钮，直接跳出循环返回
      let hidden = true
      const options = item.actions(this.row)
      for (let i = 0, len = options.length; i < len; i++) {
        const option = options[i]
        if (option.submenus) {
          for (let j = 0, jlen = option.submenus.length; j < jlen; j++) {
            const sub = option.submenus[j]
            const subHidden = this.getHidden(sub)
            if (!subHidden) {
              hidden = false
              break
            }
          }
        } else {
          const optionHidden = this.getHidden(option)
          if (!optionHidden) {
            hidden = false
            break
          }
        }
      }
      return hidden
    },
  },
}
</script>
