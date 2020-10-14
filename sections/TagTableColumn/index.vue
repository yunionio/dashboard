<template>
  <a-popover
    destroy-tooltip-on-hide
    overlay-class-name="tag-table-column-wrap">
    <template slot="title">
      <div class="d-flex align-items-center">
        <div class="flex-fill">{{$t('common_267')}}</div>
        <template v-if="validate.validate">
          <a-button type="link" class="font-weight-normal p-0" @click="handleEdit" v-if="!inBaseDialog && !!onManager">{{$t('common_105')}}</a-button>
        </template>
        <template v-else>
          <a-tooltip :title="validate.tooltip">
            <a-button type="link" class="font-weight-normal p-0" disabled>{{$t('common_105')}}</a-button>
          </a-tooltip>
        </template>
      </div>
    </template>
    <template slot="content">
      <div class="tag-table-column">
        <template v-if="tags.length <= 0">
          <loader :no-data-text="$t('common_268')" />
        </template>
        <template v-else>
          <template v-for="item of tags">
            <span
              class="tag mb-1 text-truncate d-inline-block"
              :title="item.title"
              :key="`${item.key}${item.value}`"
              :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
              {{ item.title }}
            </span>
          </template>
        </template>
      </div>
    </template>
    <icon type="res-tag" :class="iconClass" />
  </a-popover>
</template>

<script>
import * as R from 'ramda'
import { filterUserTag, getTagColor, getTagTitle } from '@/utils/common/tag'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TagTableColumn',
  mixins: [WindowsMixin],
  props: {
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
    resource: {
      type: String,
      required: true,
    },
    onManager: {
      type: Function,
    },
    columns: [Array, Function],
    tipName: String,
  },
  inject: {
    // 是否处于BaseDialog中
    inBaseDialog: {
      default: false,
    },
  },
  computed: {
    data () {
      const data = filterUserTag({
        metadata: this.metadata,
        ignoreKeys: this.ignoreKeys,
        needExt: this.needExt,
      })
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
    iconClass () {
      return this.tags.length <= 0 ? 'text-color-help' : 'primary-color'
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
.tag-table-column {
  max-width: 300px;
  .wrap {
    margin: 0;
  }
  & ::v-deep .ant-empty-image {
    height: 46px;
  }
}
.tag {
  max-width: 100%;
  line-height: 20px;
  margin-right: 10px;
  padding: 0 6px 0 4px;
  font-size: 12px;
  border-style: solid;
  border-width: 1px;
}
</style>
