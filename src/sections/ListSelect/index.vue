<template>
  <div class="ant-select w-100" @click="handleOpenSelect">
    <div
      class="ant-select-selection"
      :class="{
        'ant-select-selection--single': !multiple,
        'ant-select-selection--multiple': multiple,
      }">
      <div class="ant-select-selection__rendered">
        <template v-if="!showDetails">
          <div class="ant-select-selection__placeholder">{{ placeholder || $t('common.select') }}</div>
        </template>
        <template v-else>
          <template v-if="multiple">
            <ul>
              <template v-for="item of details">
                <li class="ant-select-selection__choice" :key="item[idKey]">
                  <div class="ant-select-selection__choice__content">{{ formatterLabel(item) }}</div>
                  <span class="ant-select-selection__choice__remove" @click.stop="handleRemove(item)">
                    <a-icon type="close" />
                  </span>
                </li>
              </template>
            </ul>
          </template>
          <template v-else>
            <div class="ant-select-selection-selected-value">{{ formatterLabel(details[0]) }}</div>
          </template>
        </template>
      </div>
      <template v-if="!multiple">
        <span class="ant-select-arrow"><a-icon type="down" /></span>
      </template>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { getRequestT } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ListSelect',
  mixins: [WindowsMixin],
  props: {
    listProps: {
      type: Object,
      required: true,
    },
    // 已选择的数据ID
    value: [Array, String],
    // 是否为多选
    multiple: {
      type: Boolean,
      default: true,
    },
    // 自定义格式化label
    formatter: Function,
    placeholder: String,
    dialogParams: {
      type: Object,
      default: () => ({}),
    },
  },
  provide: {
    inListSelect: true,
  },
  data () {
    return {
      // 传的value如果为空或字符串最终都转换为数组
      selected: R.isEmpty(this.value) || R.isNil(this.value) ? [] : R.is(String, this.value) ? [this.value] : this.value,
      details: [],
    }
  },
  computed: {
    idKey () {
      return this.listProps.list.idKey
    },
    showDetails () {
      return !R.isEmpty(this.details) && !R.isNil(this.details)
    },
  },
  watch: {
    details (newVal, oldVal) {
      if (!R.equals(newVal, oldVal)) this.$emit('update:items', newVal)
    },
    value (newVal, oldVal) {
      this.selected = R.isEmpty(this.value) || R.isNil(this.value) ? [] : R.is(String, this.value) ? [this.value] : this.value
      this.getDetails()
    },
  },
  created () {
    this.listProps.list.disableStorageLimit = true
    this.listProps.list.limit = 10
    if (!R.isNil(this.selected)) {
      this.getDetails()
    }
  },
  methods: {
    async getDetails () {
      if (R.isEmpty(this.selected)) {
        this.details = []
        return
      }
      try {
        const data = await this.listProps.list.fetchSelectedDetails(this.selected, {
          $t: getRequestT(),
        })
        this.details = data
      } catch (error) {
        throw error
      }
    },
    handleOpenSelect () {
      this.createDialog('ListSelectDialog', {
        listProps: this.listProps,
        selected: [...this.selected],
        details: [...this.details],
        ok: this.handleSelected,
        idKey: this.idKey,
        formatterLabel: this.formatterLabel,
        multiple: this.multiple,
        dialogParams: this.dialogParams,
      })
    },
    handleSelected (selected, details) {
      this.selected = selected
      this.details = details
      const val = this.multiple ? selected : selected[0]
      this.$emit('change', val)
      this.$emit('input', val)
    },
    handleRemove (item) {
      const id = item[this.idKey]
      const index = this.selected.indexOf(id)
      if (index !== -1) {
        this.details.splice(index, 1)
        this.selected.splice(index, 1)
      }
      this.$emit('change', this.selected)
      this.$emit('input', this.selected)
    },
    formatterLabel (row) {
      if (this.formatter) {
        return this.formatter(row, this.idKey)
      }
      return `${row.name} / ${row[this.idKey]}`
    },
  },
}
</script>
