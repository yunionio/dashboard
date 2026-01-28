<template>
  <div
    class="search-box-wrap ant-input d-flex align-items-center justify-content-between"
    :class="{ 'ant-input-number-focused': focus }"
    v-clickoutside="handleWrapClickoutside"
    @click="handleWrapClick"
    ref="search-box-wrap">
    <ul class="clearfix">
      <template v-for="(item, key) of filteredValue">
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
    <icon type="search" class="cursor-pointer" />
  </div>
</template>

<script>
import * as R from 'ramda'
import i18n from '@/locales'
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
    defaultSearchKey: {
      type: [String, Function],
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
    filteredValue () {
      const filteredValue = {}
      const keys = Object.keys(this.value).filter(key => !key.startsWith('__condition_'))
      keys.map(key => {
        filteredValue[key] = this.value[key]
      })
      return filteredValue
    },
    // 缓存 options 的 keys，避免重复计算
    optionsKeys () {
      return Object.keys(this.options)
    },
    // 缓存 IP key，避免重复查找
    ipKey () {
      return this.optionsKeys.find(v => v === 'ip') ||
             this.optionsKeys.find(v => v.startsWith('ip') || v.endsWith('ip'))
    },
    // 缓存 ID key，避免重复查找
    idKey () {
      return this.optionsKeys.find(v => v === 'id') ||
             this.optionsKeys.find(v => v.endsWith('id'))
    },
    // 为每个 dropdown 配置创建 Map 索引（label -> key），优化查找性能
    dropdownItemMaps () {
      const maps = {}
      for (const key in this.options) {
        const config = this.options[key]
        if (config.dropdown && config.items && Array.isArray(config.items)) {
          const map = new Map()
          config.items.forEach(item => {
            if (item.label) {
              map.set(item.label, item.key)
            }
          })
          maps[key] = map
        }
      }
      return maps
    },
  },
  watch: {
    value (val) {
      if (R.isEmpty(this.newValues) && !R.isEmpty(val)) {
        this.handleSearch(val)
      }
    },
  },
  created () {
    // 选择的key分隔符
    this.keySeparator = ': '
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
      // this.$refs.completer.handleOk()
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
        if (key.startsWith('__condition_')) {
          this.newValues[key] = value
          return
        }
        if (Array.isArray(value)) {
          const whiteList = ['created_at', 'received_at', 'recv_at', 'start_time']
          const monthList = ['month']
          if (!whiteList.includes(key) && !this.options[key].is_time) {
            value = value.filter((item) => {
              if (R.is(Boolean, item)) return true
              return item?.trim().length > 0
            }).map(v => {
              if (R.is(Boolean, v)) return v
              return v?.trim()
            })
          }
          if (monthList.includes(key)) {
            value = value.map(v => {
              if (R.is(Boolean, v)) return v
              return v?.trim()
            })
          }
          if (value.length === 0) {
            return
          }
        }
        if (this.options[key].dropdown) {
          const config = this.options[key]
          if (config.date || config.month) {
            this.newValues[key] = value
          } else {
            // 优化：使用 Map 索引替代 R.find，从 O(n) 优化到 O(1)
            const itemMap = this.dropdownItemMaps[key]
            if (itemMap) {
              this.newValues[key] = value.map(item => {
                return itemMap.get(item) || item
              })
            } else {
              // 降级方案：如果 Map 不存在，使用原来的方法
              this.newValues[key] = value.map(item => {
                const op = R.find(R.propEq('label', item))(config.items || [])
                if (op) return op.key
                return item
              })
            }
          }
        } else {
          let newKey = key
          let newValues = value
          if (this.autocompleterSearch && !this.autocompleterSearch.includes(this.keySeparator)) {
            // 优化：使用缓存的 keys
            newValues = (value.map(item => { return item.split('|') })).flat()
            const isIpv4 = newValues.some(item => {
              return /(^[0-9]{1,3}\.)|(^\.[0-9]{1,3})/.test(item) &&
               !/[a-zA-Z]+/.test(item) &&
                value[0].split('.').every(v => v <= 255)
            })
            const isUUID = newValues.some(item => /[a-f\d]{4}(?:[a-f\d]{4}-){4}[a-f\d]{12}/.test(item))
            const ipv6Regexp = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
            const isIpv6 = newValues.some(item => ipv6Regexp.test(item) || /^([0-9a-fA-F]{1,4}:)/.test(item))
            const isIp = isIpv4 || isIpv6

            if (isIp && this.ipKey) {
              newKey = this.ipKey
            } else if (isUUID && this.idKey) {
              newKey = this.idKey
            } else {
              if (this.options[this.defaultSearchKey]) {
                newKey = this.defaultSearchKey
              }
            }
          }
          this.newValues[newKey] = newValues
        }
      }, values)
      // 优化：使用 $nextTick 延迟非关键更新，让 UI 先响应
      this.$nextTick(() => {
        this.$emit('input', this.newValues)
      })
    },
    /**
     * @description 删除标签事件
     */
    handleRemoveTag (key) {
      const newValues = { ...this.value }
      delete newValues[key]
      delete newValues[`__condition_${key}`]
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
  height: 30px;
  position: relative;
  padding-left: 30px;
  > ul {
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
    margin: 0;
    padding: 0;
    list-style: none;
    > li {
      // position: relative;
      height: 20px;
      float: left;
    }
  }
  .help-tips {
    position: absolute;
    font-size: 12px;
    line-height: 24px;
    top: 2px;
    left: 30px;
    right: 36px;
  }
  .cursor-pointer{
    position: absolute;
    left: 10px;
  }
}
</style>
