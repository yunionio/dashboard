<template>
  <div class="cursor-text">
    <autosize-input
      ref="input"
      v-show="focus"
      :value="search"
      :input-style="{ border: 'none', outline: 0, padding: '0 0 0 2px', margin: 0, height: '20px', fontSize: '12px' }"
      @keydown.13="handleInputEnter"
      @keydown.delete="handleInputDelete"
      @input="handleInput" />
    <div class="auto-completer-wrap" v-show="show">
      <ul class="auto-completer-items">
        <li v-show="!isDropdown">
          <span class="empty text-weak">{{ $t('common.text00014') }}</span>
        </li>
        <template v-if="isDropdown">
          <!-- 如果有配置项则渲染 -->
          <template v-if="config.items">
            <li
              v-for="item of config.items"
              :key="item.key">
              <span>
                <a-checkbox
                  class="w-100 text-truncate"
                  :checked="selectValue && selectValue.includes(item.key)"
                  :value="item.key"
                  @change="handleValueChange">{{ item.label }}</a-checkbox>
              </span>
            </li>
          </template>
          <template v-else>
            <!-- 如果需要获取 distinct field -->
            <template v-if="config.distinctField">
              <li class="loading"><loader loading /></li>
            </template>
            <template v-else>
              <li class="no-data"><loader /></li>
            </template>
          </template>
        </template>
        <template v-else v-for="(item, key) of options">
          <li v-show="!value.hasOwnProperty(key)" :key="key">
            <span @click="handleKeyClick($event, key, item)" class="text-truncate">{{ item.label }}</span>
          </li>
        </template>
      </ul>
      <div class="actions" v-if="isDropdown">
        <span @click="handleConfirm($event)" :class="{ disabled: !selectValue || (selectValue && selectValue.length <= 0) }">{{$t('common.ok')}}</span>
        <span @click="handleCancel($event)">{{$t('common.cancel')}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'AutoCompleter',
  props: {
    focus: {
      type: Boolean,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
    show: {
      type: Boolean,
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
    defaultSearchKey: String,
    fetchDistinctField: Function,
  },
  data () {
    return {
      // 当前选中的筛选key
      selectKey: null,
      // 选中的筛选值
      selectValue: [],
      // input 输入的值
      search: '',
    }
  },
  computed: {
    // 获取当前选择的key的配置
    config () {
      return this.selectKey && this.options[this.selectKey]
    },
    // 配置项是否使用了dropdown模式
    isDropdown () {
      return this.config && this.config.dropdown
    },
  },
  watch: {
    search (val) {
      this.$emit('update:search', val)
    },
  },
  methods: {
    clear () {
      this.$emit('update-show', false)
      this.search = ''
      this.selectKey = null
      this.selectValue = []
    },
    /**
     * @description key选中事件
     * @param {Object} event
     * @param {String} key
     * @param {Object} config
     */
    async handleKeyClick (e, key, item) {
      e.stopPropagation()
      this.selectKey = key
      this.search = `${item.label}${this.keySeparator}`
      if (!this.isDropdown) {
        this.$emit('update-show', false)
      } else {
        if (this.config.distinctField) {
          try {
            const values = await this.fetchDistinctField(item)
            this.$set(item, 'items', values)
          } catch (error) {
            throw error
          }
        }
      }
      this.$emit('focus-input')
    },
    /**
     * @description value选中事件
     * @param {Object} event
     */
    handleValueChange (e) {
      e.stopPropagation()
      const value = e.target.value
      const index = this.selectValue.indexOf(value)
      const hasValue = index !== -1
      const multiple = this.config.multiple
      if (hasValue) {
        if (multiple) {
          this.selectValue.splice(index, 1)
        }
      } else {
        if (multiple) {
          this.selectValue.push(value)
        } else {
          this.selectValue = [value]
        }
      }
      let labels = this.selectValue
      if (this.isDropdown) {
        labels = labels.map(item => {
          const op = R.find(R.propEq('key', item))(this.config.items)
          if (op) return op.label
          return item
        })
      }
      this.search = `${this.config.label}${this.keySeparator}${labels.join(this.valueSeparator)}`
    },
    /**
     * @description 拼装参数，调用搜索
     */
    handleOk () {
      const selectKeyEmpty = R.isNil(this.selectKey) || R.isEmpty(this.selectKey)
      if (selectKeyEmpty) {
        if (this.options[this.defaultSearchKey] && R.trim(this.search)) {
          this.selectValue = [this.search]
          this.selectKey = this.defaultSearchKey
          this.search = `${this.options[this.defaultSearchKey].label}${this.keySeparator}${this.search}`
        } else {
          if (R.is(Object, this.value) && !R.isEmpty(this.value)) {
            this.$emit('confirm', this.value)
          }
          return
        }
      }
      const selectValueEmpty = R.isNil(this.selectValue) || R.isEmpty(this.selectValue)
      if (selectValueEmpty) return
      let value = this.search.split(this.keySeparator)[1]
      value = value.split(this.valueSeparator)
      if (R.isNil(value) || R.isEmpty(value)) {
        return
      }
      const newValue = {
        ...this.value,
        [this.selectKey]: value,
      }
      this.$emit('confirm', newValue)
      this.clear()
    },
    /**
     * @description 确定事件
     * @param {Object} event
     */
    handleConfirm (e) {
      e.stopPropagation()
      this.handleOk()
    },
    /**
     * @description 取消事件
     * @param {Object} event
     */
    handleCancel (e) {
      e.stopPropagation()
      this.clear()
      this.$emit('focus-input')
      this.$emit('update-show', true)
    },
    /**
     * @description 输入框回车按键事件
     */
    handleInputEnter (e) {
      e.stopPropagation()
      this.handleOk()
    },
    /**
     * @description 输入删除按键事件
     */
    handleInputDelete (e) {
      e.stopPropagation()
      if (this.search.length === 0) {
        const keys = Object.keys(this.value)
        if (keys.length === 0) return
        const lastKey = keys[keys.length - 1]
        this.$emit('remove-tag', lastKey)
      }
    },
    /**
     * @description 输入事件
     */
    handleInput (e) {
      e.stopPropagation()
      this.search = e.target.value
      let value = (e.target.value && e.target.value.split(this.keySeparator)) || []
      value = value[1] && value[1].split(this.valueSeparator)
      if (this.isDropdown) {
        if (!value) {
          this.selectKey = null
          return
        }
        this.selectValue = value.map(item => {
          const op = R.find(R.propEq('label', item))(this.config.items)
          if (op) return op.key
        }).filter(item => !!item)
        if (!this.config.multiple && this.selectValue.length) this.selectValue = this.selectValue[0]
      } else {
        this.selectValue = value || []
      }
    },
  },
}
</script>

<style lang="less" scoped>
.auto-completer-wrap {
  height: auto;
  right: -200px;
  position: absolute;
  top: 28px;
  text-align: left;
  width: 200px;
  box-shadow: 1px 1.73px 3px 0 rgba(0,0,0,.1);
  border: 1px solid #ddd;
  background-color: #fff;
  z-index: 88;
}
.search-input {
  border: none;
  outline: 0;
  padding: 0 0 0 2px;
  margin: 0;
  height: 20px;
  font-size: 12px;
}
.auto-completer-items {
  font-size: 12px;
  overflow: hidden;
  overflow-y: auto;
  background-color: #fff;
  // max-height: 400px;
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
.cursor-text {
  cursor: text;
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
