<template>
  <div
    class="search-box-wrap ant-input"
    :class="{ 'focus': focus }"
    v-clickoutside="blurHandle"
    @click="wrapClickHandle">
    <ul class="clearfix">
      <li v-for="(item, key) of value" :key="key" class="mb-1 mt-1">
        <a-tag
          class="tag"
          :style="tagStyles"
          :closable="focus"
          @close="tagRemoveHandle($event, key)">{{ getTag(key, item) }}</a-tag>
      </li>
      <li class="mb-1 mt-1">
        <div class="tags-space">
          <input
            v-show="focus"
            ref="input"
            class="search-input"
            v-model="entry"
            v-input-autowidth="{ maxWidth: '500px', minWidth: '5px', comfortZone: 0 }"
            @keydown.enter="inputEnterHandle"
            @keydown.delete="inputDeleteHandle"
            @input="inputHandle" />
          <div class="autocomplete" v-if="showDropdown">
            <ul class="autocomplete-menu">
              <li v-if="!dropdownMode">
                <span class="autocomplete-empty text-weak">选择资源属性进行过滤</span>
              </li>
              <template v-if="dropdownMode">
                <li
                  v-for="item of dropdownItems"
                  :key="item.key">
                  <span>
                    <a-checkbox
                      class="w-100"
                      :checked="dropdownChecked.includes(item.key)"
                      :value="item.key"
                      @change="checkHandle">{{ item.label }}</a-checkbox>
                  </span>
                </li>
                <li class="actions">
                  <div>
                    <span @click="dropdownConfirm($event)">确定</span>
                    <span @click="removeSelectProperty($event)">取消</span>
                  </div>
                </li>
              </template>
              <template v-else v-for="(item, key) of options">
                <li
                  v-if="!value.hasOwnProperty(key)"
                  :key="key">
                  <span @click="propertyClick($event, key, item)">{{ item.label }}</span>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </li>
      <li class="mb-1 mt-1">
        <div class="text-weak help-tips">关键字用“|”分隔，过滤标签用回车键分隔</div>
      </li>
    </ul>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'SearchBox',
  props: {
    options: {
      type: Object,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      // wrap 是否被 focus
      focus: false,
      // 是否显示下拉菜单
      showDropdown: false,
      // 当前选中的属性key
      currentSelectProperty: null,
      // 输入的值
      entry: '',
      dropdownChecked: [],
    }
  },
  computed: {
    tagStyles () {
      const styles = { maxWidth: 'initial' }
      if (!this.focus) {
        styles.maxWidth = '140px'
      }
      return styles
    },
    currentSelectPropertyOptions () {
      return this.currentSelectProperty && this.options[this.currentSelectProperty]
    },
    dropdownMode () {
      return this.currentSelectPropertyOptions && this.options[this.currentSelectProperty]['dropdown']
    },
    dropdownItems () {
      return this.dropdownMode && this.options[this.currentSelectProperty]['items']
    },
    entrySplitArr () {
      return this.entry.split(this.entryJoinSymbol)
    },
    entryKey () {
      return this.entrySplitArr && this.entrySplitArr[0]
    },
    entryValue () {
      return this.entrySplitArr && this.entrySplitArr[1]
    },
  },
  created () {
    this.entryJoinSymbol = '：'
    this.keywordJoinSymbol = '|'
  },
  mounted () {
    this.input = this.$refs.input
  },
  methods: {
    wrapClickHandle () {
      this.focus = true
      this.$nextTick(() => {
        this.input.focus()
      })
      this.showDropdown = true
    },
    blurHandle () {
      this.focus = false
      this.showDropdown = false
    },
    inputEnterHandle () {
      if (R.isNil(this.currentSelectProperty) || R.isEmpty(this.currentSelectProperty)) return
      let value
      if (this.dropdownMode) {
        value = this.dropdownChecked
      } else {
        value = this.entryValue
      }
      if (R.isNil(value) || R.isEmpty(value)) {
        return
      }
      const newValue = {
        ...this.value,
        [this.currentSelectProperty]: value,
      }
      this.$emit('input', newValue)
      this.entry = ''
      this.showDropdown = false
      this.currentSelectProperty = null
      this.dropdownChecked = []
    },
    inputHandle () {
      if (this.currentSelectProperty) {
        if (this.entryKey !== this.currentSelectPropertyOptions.label) {
          this.currentSelectProperty = null
          this.showDropdown = true
        }
      }
      if (this.dropdownItems && this.entryValue) {
        const keywords = this.entryValue.split(this.keywordJoinSymbol)
        this.dropdownChecked = keywords.map(value => {
          const target = this.dropdownItems.find(item => item.label === value)
          if (target) return target.key
        }).filter(item => !!item)
      }
    },
    propertyClick (e, key, item) {
      e.stopPropagation()
      this.currentSelectProperty = key
      this.entry = `${item.label}${this.entryJoinSymbol}`
      if (!this.dropdownMode) {
        this.showDropdown = false
      }
      this.input.focus()
    },
    removeSelectProperty (e) {
      e.stopPropagation()
      this.currentSelectProperty = null
      this.entry = ''
      this.input.focus()
    },
    checkHandle (e) {
      e.stopPropagation()
      const value = e.target.value
      const index = this.dropdownChecked.indexOf(value)
      const hasValue = index !== -1
      const multiple = this.currentSelectPropertyOptions.multiple
      if (hasValue) {
        if (multiple) {
          this.dropdownChecked.splice(index, 1)
        }
      } else {
        if (multiple) {
          this.dropdownChecked.push(value)
        } else {
          this.dropdownChecked = [value]
        }
      }
    },
    getTag (key, value) {
      const label = this.options[key]['label']
      let ret = `${label}${this.entryJoinSymbol}`
      if (R.is(String, value)) {
        ret += value
        return ret
      }
      if (R.is(Array, value)) {
        ret += value.map(value => {
          const target = this.options[key]['items'].find(item => item.key === value)
          if (target) return target.label
        }).filter(item => !!item).join(this.keywordJoinSymbol)
        return ret
      }
    },
    dropdownConfirm (e) {
      e.stopPropagation()
      this.inputEnterHandle()
    },
    tagRemoveHandle (e, key) {
      e.stopPropagation()
      const newValue = { ...this.value }
      delete newValue[key]
      this.showDropdown = false
      this.$emit('input', newValue)
    },
    inputDeleteHandle (e) {
      e.stopPropagation()
      if (this.entry.length === 0) {
        const tagKeys = Object.keys(this.value)
        if (tagKeys.length === 0) return
        const lastKey = tagKeys[tagKeys.length - 1]
        this.tagRemoveHandle(e, lastKey)
      }
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
  .tag {
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
  }
  .tags-space {
    cursor: text;
  }
  .search-input {
    border: none;
    outline: 0;
    padding: 0 0 0 2px;
    margin: 0;
    height: 20px;
    font-size: 12px;
  }
  .autocomplete {
    height: auto;
    right: -180px;
    position: absolute;
    top: 28px;
    text-align: left;
    width: 180px;
    box-shadow: 1px 1.73px 3px 0 rgba(0,0,0,.1);
    border: 1px solid #ddd;
    background-color: #fff;
    z-index: 88;
  }
  .autocomplete-menu {
    font-size: 12px;
    overflow-y: auto;
    background-color: #fff;
    max-height: 500px;
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
        &.autocomplete-empty {
          cursor: default;
        }
      }
      &:hover {
        background-color: #f2f2f2;
        > span {
          &.autocomplete-empty {
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
    .actions {
      > div {
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
        }
      }
    }
  }
  &.focus {
    border-color: #40a9ff;
    outline: 0;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    border-right-width: 1px !important;
  }
}
</style>
