<template>
  <div
    class="search-box-wrap ant-input"
    :class="{ focus }"
    v-clickoutside="handleWrapClickoutside"
    @click="handleWrapClick">
    <ul class="clearfix">
      <template v-for="(item, key) of value">
        <li :key="key" class="mb-1 mt-1">
          <tag
            :value="item"
            :id="key"
            :focus="focus"
            :options="options"
            :key-separator="keySeparator"
            :value-separator="valueSeparator"
            @remove="handleRemoveTag" />
        </li>
      </template>
      <li class="mb-1 mt-1">
        <auto-completer
          ref="completer"
          :focus="focus"
          :options="options"
          :value="value"
          :show="showCompleter"
          :key-separator="keySeparator"
          :value-separator="valueSeparator"
          :list="list"
          :default-search-key="defaultSearchKey"
          @focus-input="focusInput"
          @confirm="handleSearch"
          @remove-tag="handleRemoveTag"
          @update-show="handleUpdateShow" />
      </li>
      <li class="mb-1 mt-1">
        <div class="text-weak help-tips">关键字用“|”分隔，过滤标签用回车键分隔</div>
      </li>
    </ul>
  </div>
</template>

<script>
import * as R from 'ramda'
import AutoCompleter from './AutoCompleter'
import Tag from './Tag'

export default {
  name: 'SearchBox',
  components: {
    AutoCompleter,
    Tag,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
      required: true,
    },
    defaultSearchKey: {
      type: String,
      default: 'name',
    },
  },
  data () {
    return {
      // wrap 是否被 focus
      focus: false,
      // 是否显示过滤选提示器
      showCompleter: false,
    }
  },
  created () {
    // 选择的key分隔符
    this.keySeparator = '：'
    // 多个value的分隔符
    this.valueSeparator = '|'
  },
  methods: {
    focusInput () {
      this.$refs.completer.$refs.input.focus()
    },
    /**
     * @description wrap点击事件
     */
    handleWrapClick (e) {
      e.stopPropagation()
      this.focus = true
      this.showCompleter = true
      this.$nextTick(() => {
        this.focusInput()
      })
    },
    /**
     * @description wrap clickoutside事件
     */
    handleWrapClickoutside () {
      this.focus = false
      this.showCompleter = false
    },
    /**
     * @description 搜索事件
     * @param {Object} values
     */
    handleSearch (values) {
      const newValues = {}
      R.forEachObjIndexed((value, key) => {
        if (this.options[key].dropdown) {
          const config = this.options[key]
          newValues[key] = value.map(item => {
            const op = R.find(R.propEq('label', item))(config.items)
            if (op) return op.key
            return item
          })
        } else {
          newValues[key] = value
        }
      }, values)
      this.$emit('input', newValues)
    },
    /**
     * @description 删除标签事件
     */
    handleRemoveTag (key) {
      const newValues = { ...this.value }
      delete newValues[key]
      this.showCompleter = false
      this.$emit('input', newValues)
    },
    /**
     * @description 更新showCompleter值
     * @param {Boolean} show 是否显示
     */
    handleUpdateShow (show) {
      this.showCompleter = show
    },
  },
}
</script>

<style lang="scss" scoped>
.search-box-wrap {
  width: 100%;
  height: auto;
  > ul {
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
    margin: 0;
    padding: 0;
    list-style: none;
    > li {
      position: relative;
      height: 20px;
      float: left;
    }
  }
  .help-tips {
    font-size: 12px;
    line-height: 24px;
  }
  &.focus {
    border-color: #40a9ff;
    outline: 0;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    border-right-width: 1px !important;
  }
}
</style>
