<template>
  <div>
    <template v-for="item of tags">
      <span
        class="tag text-truncate d-inline-block"
        :key="`${item.key}${item.value}`"
        :title="item.title"
        :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">{{ item.title }}</span>
    </template>
    <template v-if="showEdit">
      <span
        class="tag edit text-truncate d-inline-block"
        key="edit-tag-btn"
        @click="handleEdit"><a-icon class="mr-1" type="edit" style="font-size: 12px;" />{{ $t('table.action.set_tag') }}</span>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { filterUserTag, filterExtTag, getTagColor, getTagTitle } from '@/utils/common/tag'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TagDetailColumn',
  mixins: [WindowsMixin],
  props: {
    type: String,
    showEdit: Boolean,
    row: {
      type: Object,
      required: true,
    },
    metadata: {
      type: Object,
      required: true,
    },
    ignoreKeys: Array,
    needExt: Boolean,
    needUser: Boolean,
    resource: {
      type: String,
    },
    onManager: {
      type: Function,
    },
    columns: [Array, Function],
    tipName: String,
    ignorePrefix: {
      type: Boolean,
      default: false,
    },
  },
  inject: {
    // 是否处于BaseDialog中
    inBaseDialog: {
      default: false,
    },
  },
  computed: {
    data () {
      let data = { arr: [], obj: {} }
      if (this.type === 'user') {
        data = filterUserTag({
          metadata: this.metadata,
          ignoreKeys: this.ignoreKeys,
          needExt: this.needExt,
          ignorePrefix: this.ignorePrefix,
        })
      }
      if (this.type === 'ext') {
        data = filterExtTag({
          metadata: this.metadata,
          ignoreKeys: this.ignoreKeys,
          needUser: this.needUser,
          ignorePrefix: this.ignorePrefix,
        })
      }
      return data
    },
    tags () {
      const ret = this.data.arr.map(item => {
        const rgb = getTagColor(item.key, item.value, 'rgb')
        const strRgb = rgb.join(',')
        return {
          title: getTagTitle(item.key, item.value),
          color: `rgb(${strRgb})`,
          backgroundColor: `rgba(${strRgb},.1)`,
          ...item,
        }
      })
      return ret
    },
    params () {
      return { resources: this.resource }
    },
    validate () {
      return this.$isOwner(this.row)
    },
  },
  methods: {
    handleEdit (e) {
      e.stopPropagation()
      let columns
      if (this.columns) {
        columns = R.is(Function, this.columns) ? this.columns() : this.columns
      }
      this.createDialog('SetTagDialog', {
        data: [this.row],
        columns,
        onManager: this.onManager,
        params: this.params,
        tipName: this.tipName,
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../styles/less/theme.less';

.tag {
  max-width: 100%;
  line-height: 20px;
  margin-right: 10px;
  padding: 0 6px 0 4px;
  font-size: 12px;
  border-style: solid;
  border-width: 1px;
  &.edit {
    border-style: dotted;
    cursor: pointer;
    border-color: #97a4b6;
    &:hover {
      color: @primary-color;
      border-color: @primary-color;
    }
  }
}
</style>
