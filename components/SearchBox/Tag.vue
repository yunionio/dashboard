<template>
  <div @click="handleWrapClick">
    <a-popover
      v-model="visible"
      trigger="click"
      destroyTooltipOnHide
      placement="bottomLeft"
      overlayClassName="search-box-tag-popover-wrap"
      :getPopupContainer="getPopupContainer"
      :align="{offset: [0, 0]}">
      <div class="auto-completer-wrap" slot="content" :style="{ width: isDate ? '300px' : '200px' }">
        <ul class="auto-completer-items">
          <template v-if="isDropdown">
            <!-- 如果有配置项则渲染 -->
            <template v-if="config.items">
              <li
                v-for="item of config.items"
                :key="item.key">
                <span>
                  <a-checkbox
                    class="w-100 text-truncate"
                    :checked="newValue && newValue.includes(item.key)"
                    :value="item.key"
                    @change="handleValueChange">{{ item.label }}</a-checkbox>
                </span>
              </li>
            </template>
            <!-- 如果需要渲染时间选择器 -->
            <template v-else-if="isDate">
              <date-select
                :value="newValue"
                @change="handleDateChange"
                :getPopupContainer="getDateSelectPopupContainer"
                @date-editing-change="editing => $emit('date-editing-change', editing)" />
            </template>
          </template>
          <template v-else>
            <a-input :value="newValue.join(valueSeparator)" ref="input" @keydown.13="handleConfirm" @change="handleInputChange" />
          </template>
        </ul>
        <div class="actions">
          <span @click="handleConfirm($event)" :class="{ disabled: confirmDisable }">{{$t('common.ok')}}</span>
          <span @click="handleCancel($event)">{{$t('common.cancel')}}</span>
        </div>
      </div>
      <a-tag class="tag" closable @close="handleClose($event)">{{ label }}</a-tag>
    </a-popover>
  </div>
</template>

<script>
import * as R from 'ramda'
import DateSelect from './DateSelect'

export default {
  name: 'Tag',
  components: {
    DateSelect,
  },
  props: {
    value: {
      type: Array,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    focus: {
      type: Boolean,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
    keySeparator: {
      type: String,
      required: true,
    },
    valueSeparator: {
      type: String,
      required: true,
    },
    fetchDistinctField: Function,
    allValue: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      visible: false,
      newValue: [...this.value],
    }
  },
  computed: {
    label () {
      const label = this.options[this.id].label
      let ret = `${label}${this.keySeparator}`
      if (this.isDate) {
        if (this.value[0] && this.value[1]) {
          ret += this.value.join('-')
        } else if (this.value[0]) {
          ret += `<${this.value[0]}`
        } else if (this.value[1]) {
          ret += `>${this.value[1]}`
        }
      } else {
        ret += this.value.map(value => {
          if (this.options[this.id].items) {
            const target = this.options[this.id].items.find(item => item.key === value)
            if (target) return target.label
          }
          return value
        }).filter(item => !!item).join(this.valueSeparator)
      }
      return ret
    },
    config () {
      return this.options[this.id]
    },
    // 配置项是否使用了dropdown模式
    isDropdown () {
      return this.config && this.config.dropdown
    },
    // 是否为时间选择模式
    isDate () {
      return this.config && this.config.date
    },
    confirmDisable () {
      if (this.isDropdown) {
        return R.isEmpty(this.newValue) || R.isNil(this.newValue)
      }
      return R.isEmpty(R.trim(this.newValue[0]))
    },
  },
  watch: {
    visible (val) {
      if (!val) {
        this.newValue = [...this.value]
      }
    },
  },
  methods: {
    handleClose (e) {
      e.stopPropagation()
      this.$emit('remove', this.id)
    },
    async handleWrapClick (e) {
      e.stopPropagation()
      this.$emit('update-show', false)
      if (!this.isDropdown) {
        this.$nextTick(() => {
          if (this.$refs.input) this.$refs.input.focus()
        })
      }
    },
    handleConfirm (e) {
      e.stopPropagation()
      if (this.confirmDisable) return
      this.visible = false
      this.$emit('update-focus', false)
      this.$emit('confirm', {
        ...this.allValue,
        [this.id]: this.newValue,
      })
    },
    handleCancel (e) {
      e.stopPropagation()
      this.newValue = this.value
      this.visible = false
      this.$emit('update-focus', false)
    },
    handleValueChange (e) {
      e.stopPropagation()
      const value = e.target.value
      const index = this.newValue.indexOf(value)
      const hasValue = index !== -1
      const multiple = this.config.multiple
      if (hasValue) {
        if (multiple) {
          this.newValue.splice(index, 1)
        }
      } else {
        if (multiple) {
          this.newValue.push(value)
        } else {
          this.newValue = [value]
        }
      }
    },
    handleDateChange (val) {
      const values = val[0]
      let labelArr
      if (values[0] && values[1]) {
        labelArr = values.map(item => item.format('YYYY-MM-DD HH:mm:ss'))
      } else if (values[0]) {
        labelArr = [values[0].format('YYYY-MM-DD HH:mm:ss'), null]
      } else if (values[1]) {
        labelArr = [null, values[1].format('YYYY-MM-DD HH:mm:ss')]
      }
      this.newValue = labelArr
    },
    handleInputChange (e) {
      let val = e.target.value
      val = val.split(this.valueSeparator)
      this.newValue = val
    },
    getPopupContainer (trigger) {
      return trigger.parentNode
    },
    getDateSelectPopupContainer (trigger) {
      return this.$parent.$refs['search-box-wrap']
    },
  },
}
</script>

<style lang="less">
.search-box-tag-popover-wrap {
  .ant-popover-inner-content {
    padding: 0;
  }
}
</style>

<style lang="less" scoped>
.tag {
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
}
.auto-completer-wrap {
  width: 200px;
}
.auto-completer-items {
  font-size: 12px;
  overflow: hidden;
  overflow-y: auto;
  background-color: #fff;
  max-height: 400px;
  list-style: none;
  margin: 0;
  padding: 0;
  > li {
    > span {
      line-height: 30px;
      height: 30px;
      display: block;
      padding: 0 10px;
      cursor: pointer;
      &.empty {
        cursor: default;
      }
    }
    &:hover {
      background-color: #f2f2f2;
      > span {
        &.empty {
          background-color: #fff;
        }
      }
    }
    &.actions {
      &:hover {
        background-color: #fff;
      }
    }
  }
  .loading {
    &:hover {
      background-color: #fff;
    }
  }
  .no-data {
    &:hover {
      background-color: #fff;
    }
  }
}
.actions {
  border-top: 1px solid #ddd;
  > span {
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-size: 12px;
    display: inline-block;
    box-sizing: border-box;
    width: 50%;
    color: #000;
    &:first-child {
      border-right: 1px solid #ddd;
      color: #006eff;
    }
    &:hover {
      background-color: #f2f2f2;
    }
    &.disabled {
      cursor: not-allowed;
      background-color: #f5f5f5;
      color: rgba(0, 0, 0, 0.25);
    }
  }
}
</style>
