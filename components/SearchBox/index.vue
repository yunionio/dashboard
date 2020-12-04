<template>
  <div
    class="search-box-wrap ant-input d-flex align-items-center justify-content-between"
    :class="{ 'ant-input-number-focused': focus }"
    v-clickoutside="handleWrapClickoutside"
    @click="handleWrapClick"
    ref="search-box-wrap">
    <ul class="clearfix">
      <template v-for="(item, key) of value">
        <li :key="key" class="mb-1 mt-1">
          <tag
            :value="item"
            :all-value="newValues"
            :id="key"
            :focus="focus"
            :options="options"
            :key-separator="keySeparator"
            :value-separator="valueSeparator"
            :fetch-distinct-field="fetchDistinctField"
            @remove="handleRemoveTag"
            @update-show="handleUpdateShow"
            @confirm="handleSearch"
            @update-focus="handleUpdateFocus"
            @date-editing-change="editing => dateEditing = editing" />
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
          :default-search-key="defaultSearchKey"
          :fetch-distinct-field="fetchDistinctField"
          :search.sync="autocompleterSearch"
          @focus-input="focusInput"
          @confirm="handleSearch"
          @remove-tag="handleRemoveTag"
          @update-show="handleUpdateShow" />
      </li>
    </ul>
    <div v-if="!hidePlaceholder" class="text-weak help-tips text-truncate">{{ placeholder }}</div>
    <a-icon type="search" class="cursor-pointer" @click.stop="search" />
  </div>
</template>

<script>
import * as R from 'ramda'
import AutoCompleter from './AutoCompleter'
import Tag from './Tag'
import i18n from '@/locales'

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
    defaultSearchKey: {
      type: String,
      default: 'search',
    },
    placeholder: {
      type: String,
      default: i18n.t('common.text00015'),
    },
    fetchDistinctField: Function,
  },
  data () {
    return {
      // wrap 是否被 focus
      focus: false,
      // 是否显示过滤选提示器
      showCompleter: false,
      newValues: {},
      // 同步input的输入value
      autocompleterSearch: '',
      dateEditing: false,
    }
  },
  computed: {
    hidePlaceholder () {
      return (!R.isEmpty(this.autocompleterSearch) && this.focus) || !R.isEmpty(this.value)
    },
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
      // e.stopPropagation()
      if (!this.dateEditing) {
        this.focus = true
        this.showCompleter = true
        this.$nextTick(() => {
          e.target.id !== 'dropdownSearchInput' && this.focusInput()
        })
      }
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
      this.newValues = {}
      R.forEachObjIndexed((value, key) => {
        if (this.options[key].dropdown) {
          const config = this.options[key]
          if (config.date) {
            this.newValues[key] = value
          } else {
            this.newValues[key] = value.map(item => {
              const op = R.find(R.propEq('label', item))(config.items)
              if (op) return op.key
              return item
            })
          }
        } else {
          this.newValues[key] = value
        }
      }, values)
      this.$emit('input', this.newValues)
    },
    /**
     * @description 删除标签事件
     */
    handleRemoveTag (key) {
      const newValues = { ...this.value }
      delete newValues[key]
      this.showCompleter = false
      this.newValues = newValues
      this.$emit('input', newValues)
    },
    /**
     * @description 更新showCompleter值
     * @param {Boolean} show 是否显示
     */
    handleUpdateShow (show) {
      this.showCompleter = show
    },
    search () {
      // this.$emit('input', this.newValues)
      this.$refs.completer.handleOk()
    },
    handleUpdateFocus (focus) {
      this.focus = focus
    },
  },
}
</script>

<style lang="less" scoped>
.search-box-wrap {
  width: 100%;
  height: auto;
  position: relative;
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
    position: absolute;
    font-size: 12px;
    line-height: 24px;
    top: 7px;
    left: 12px;
    right: 36px;
  }
}
</style>
