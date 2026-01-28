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
      <div class="auto-completer-wrap" slot="content" :style="{ width: isDate || isMonth ? '300px' : '200px' }">
        <ul class="auto-completer-items">
          <template v-if="isDropdown">
            <!-- 如果有配置项则渲染 -->
            <template v-if="config.items">
              <a-input-search
                id="dropdownSearchInput"
                class="dropdown-search-input"
                :placeholder="$t('common.search')"
                @change="onSearch" />
              <li
                v-for="item of filteredItems"
                :key="item.key">
                <span>
                  <a-checkbox
                    class="w-100"
                    :checked="newValue && newValue.includes(item.key)"
                    :value="item.key"
                    @change="handleValueChange"><span class="text-wrap text-break" :title="item.label">{{ item.label }}</span></a-checkbox>
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
            <!-- 如果需要渲染月份选择器 -->
            <template v-else-if="isMonth">
              <month-select
                :value="newValue"
                @change="handleMonthChange"
                :getPopupContainer="getMonthSelectPopupContainer"
                @date-editing-change="editing => $emit('date-editing-change', editing)" />
            </template>
          </template>
          <template v-else>
            <a-input :value="newValue.join(valueSeparator)" ref="input" @keydown.13="handleConfirm" @change="handleInputChange" />
          </template>
        </ul>
        <div class="actions">
          <span @click="handleConfirm($event)" class="primary-color" :class="{ disabled: confirmDisable }">{{$t('common.ok')}}</span>
          <span @click="handleCancel($event)">{{$t('common.cancel')}}</span>
        </div>
      </div>
      <a-tag class="tag" closable @close="handleClose($event)">{{ getLabel(label) }}</a-tag>
    </a-popover>
  </div>
</template>

<script>
import * as R from 'ramda'
import DateSelect from './DateSelect'
import MonthSelect from './MonthSelect'

export default {
  name: 'Tag',
  components: {
    DateSelect,
    MonthSelect,
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
      dropdownSearch: '',
    }
  },
  computed: {
    // 为当前选项创建 Map 索引（key -> label），优化查找性能
    itemKeyMap () {
      const config = this.options[this.id]
      if (config && config.items && Array.isArray(config.items)) {
        const map = new Map()
        config.items.forEach(item => {
          map.set(item.key, item.label)
        })
        return map
      }
      return null
    },
    label () {
      const label = this.options[this.id].label
      let ret = `${label}${this.keySeparator}`
      if (this.isDate || this.isMonth) {
        if (this.value[0] && this.value[1]) {
          ret += this.value.join('~')
        } else if (this.value[0]) {
          ret += `<${this.value[0]}`
        } else if (this.value[1]) {
          ret += `>${this.value[1]}`
        }
      } else {
        // 优化：使用 Map 索引替代 find，从 O(n) 优化到 O(1)
        ret += this.value.map(value => {
          if (this.itemKeyMap) {
            const label = this.itemKeyMap.get(value)
            if (label) return label
          } else if (this.options[this.id].items && this.options[this.id].items.length) {
            // 降级方案：如果 Map 不存在，使用原来的方法
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
    // 是否为月份选择模式
    isMonth () {
      return this.config && this.config.month
    },
    confirmDisable () {
      if (this.isDropdown) {
        return R.isEmpty(this.newValue) || R.isNil(this.newValue)
      }
      return R.isEmpty(R.trim(this.newValue[0]))
    },
    // 过滤后的下拉选项（优化：使用计算属性替代方法调用）
    filteredItems () {
      const items = (this.config && this.config.items) || []
      if (!items.length) return []
      if (!this.dropdownSearch) return items
      const searchLower = this.dropdownSearch.toLowerCase()
      return items.filter(v => {
        if (!v.label) return true
        const label = v.label.toLowerCase()
        return label.includes(searchLower)
      })
    },
  },
  watch: {
    visible (val) {
      if (!val) {
        this.newValue = [...this.value]
      }
    },
  },
  created () {
    const conf = this.options[this.id]
    if (conf && conf.distinctField && !conf.items && this.fetchDistinctField) {
      try {
        this.fetchDistinctField(conf).then((values) => {
          this.$nextTick(() => {
            this.$set(conf, 'items', values)
          })
        })
      } catch (error) {
        throw error
      }
    }
  },
  methods: {
    onSearch (e) {
      this.dropdownSearch = e.target.value
    },
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
      this.dropdownSearch = ''
    },
    handleCancel (e) {
      e.stopPropagation()
      this.newValue = this.value
      this.visible = false
      this.$emit('update-focus', false)
      this.dropdownSearch = ''
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
        labelArr = values.map(item => item.local().format('YYYY-MM-DD HH:mm:ss'))
      } else if (values[0]) {
        labelArr = [values[0].local().format('YYYY-MM-DD HH:mm:ss'), null]
      } else if (values[1]) {
        labelArr = [null, values[1].local().format('YYYY-MM-DD HH:mm:ss')]
      }
      this.newValue = labelArr
    },
    handleMonthChange (val) {
      const values = val[0]
      let labelArr
      if (values[0] && values[1]) {
        labelArr = values.map(item => item.local().format('YYYY-MM'))
      } else if (values[0]) {
        labelArr = [values[0].local().format('YYYY-MM'), null]
      } else if (values[1]) {
        labelArr = [null, values[1].local().format('YYYY-MM')]
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
    getMonthSelectPopupContainer (trigger) {
      return this.$parent.$refs['search-box-wrap']
    },
    getLabel (label) {
      if (label.length > 40) {
        return `${label.slice(0, 40)}...`
      }
      return label
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
      display: block;
      padding: 6px 10px;
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
    &:first-child {
      border-right: 1px solid #ddd;
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

.dropdown-search-input ::v-deep .ant-input {
  border: none;
  border-bottom: 1px solid #d9d9d9;
}
</style>
