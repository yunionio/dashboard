<template>
  <div>
    <template v-for="item of options">
      <template v-if="item.actions">
        <dropmenus :key="item.label" :label="item.label" :actions="item.actions" :row="row" :button-mode="buttonMode" />
      </template>
      <template v-else>
        <action-button
          class="mr-2"
          :key="item.label"
          :option="getOption(item)"
          :row="row"
          :button-mode="buttonMode"
          @action-click="actionClick" />
      </template>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import ActionButton from './ActionButton'
import Dropmenus from './Dropmenus'

export default {
  name: 'PageListActions',
  components: {
    Dropmenus,
    ActionButton,
  },
  props: {
    row: {
      type: Object,
    },
    options: {
      type: Array,
      required: true,
    },
    // 是否使用按钮样式
    buttonMode: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    getOption (item) {
      return {
        ...item,
        meta: this.getMeta(item),
      }
    },
    getMeta (item) {
      const { validate = true, ...rest } = R.is(Function, item.meta) ? item.meta(this.row) : {}
      return {
        validate,
        ...rest,
      }
    },
    actionClick () {
      this.$emit('action-click')
    },
  },
}
</script>
