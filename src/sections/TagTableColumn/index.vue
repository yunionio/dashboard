<template>
  <a-popover destroy-tooltip-on-hide overlay-class-name="tag-table-column-wrap">
    <template slot="title">
      <div class="d-flex align-items-center">
        <div class="flex-fill">{{customTitle ? customTitle : $t('common_267')}}</div>
        <template v-if="validate.validate">
          <a-button
            type="link"
            class="font-weight-normal p-0"
            @click="handleEdit"
            v-if="!inBaseDialog && (!!onManager || !!manager)">{{$t('common_105')}}</a-button>
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
              :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">{{ item.title }}</span>
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
import { hasPermission } from '@/utils/auth'

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
    supportKeyStarts: Array,
    needExt: Boolean,
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
    customTitle: String,
    list: {
      type: Object,
    },
    canEdit: Boolean,
    tagParams: {
      type: Object,
      default: () => { return {} },
    },
    refresh: {
      type: Function,
    },
    manager: {
      type: Object,
    },
    idKey: {
      type: String,
      default: 'id',
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
      const data = filterUserTag({
        metadata: this.metadata,
        ignoreKeys: this.ignoreKeys,
        ignorePrefix: this.ignorePrefix,
        supportKeyStarts: this.supportKeyStarts,
      })
      return data
    },
    tags () {
      let ret = this.data.arr.filter((item) => {
        // return item.key.startsWith('user:') || item.key.startsWith('sys:') || (this.needExt && item.key.startsWith('ext:'))
        return this.supportKeyStarts.some(s => item.key.startsWith(s))
      }).map(item => {
        const rgb = getTagColor(item.key, item.value, 'rgb')
        const strRgb = rgb.join(',')
        return {
          title: getTagTitle(item.key, item.value),
          color: `rgb(${strRgb})`,
          backgroundColor: `rgba(${strRgb},.1)`,
          ...item,
        }
      })
      // 根据title去重，相同的value只显示一个
      ret = R.uniqBy(item => item.title, ret)
      return ret
    },
    iconClass () {
      return this.tags.length <= 0 ? 'text-color-help' : 'primary-color'
    },
    params () {
      return { resources: this.resource, ...this.tagParams }
    },
    isPermission () {
      return this.canEdit && hasPermission({ key: `${this.resource}_perform_set_user_metadata` })
    },
    validate () {
      if (this.isPermission) {
        return this.$isOwner(this.row)
      }
      return { validate: false, tooltip: this.$t('common_716') }
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
        metadata: this.metadata,
        data: [this.row],
        columns,
        manager: this.manager,
        onManager: this.onManager,
        params: this.params,
        tipName: this.tipName,
        idKey: this.idKey,
        list: this.list,
        refresh: this.refresh,
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
    .data-empty {
      margin-top: 0;
    }
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
