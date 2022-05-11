<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :is-edit-name="!data.is_system"
    :is-edit-desc="!data.is_system"
    :nameRules="nameRules" />
</template>

<script>
import {
  getEnabledTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import PolicyViewer from '../components/PolicyViewer'
import { getTagColor } from '@/utils/common/tag'

export default {
  name: 'PolicyDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getEnabledTableColumn(),
        {
          field: 'is_public',
          title: this.$t('system.text_431'),
          formatter: ({ cellValue }) => {
            return cellValue ? this.$t('system.text_432') : this.$t('system.text_433')
          },
        },
        {
          field: 'project_tags',
          title: this.$t('iam.project_tag'),
          slots: {
            default: ({ row }, h) => {
              const ret = []
              if (row.project_tags) {
                row.project_tags.map(item => {
                  const rgb = getTagColor(item.key, item.value, 'rgb')
                  const strRgb = rgb.join(',')
                  const style = `background:rgba(${strRgb},.1);border: solid 1px rgb(${strRgb});padding: 0px 6px 0 4px;line-height: 20px;margin-right:10px;overflow:hidden;max-width:100%;text-overflow: ellipsis;white-space: nowrap;`
                  ret.push(<span class="tag text-truncate d-inline-block" style={style}>{item.key.replace('user:', '')}:{item.value}</span>)
                })
                return <div>{...ret}</div>
              }
              return '-'
            },
          },
        },
        {
          field: 'object_tags',
          title: this.$t('iam.object_tag'),
          slots: {
            default: ({ row }, h) => {
              const ret = []
              if (row.object_tags) {
                row.object_tags.map(item => {
                  const rgb = getTagColor(item.key, item.value, 'rgb')
                  const strRgb = rgb.join(',')
                  const style = `background:rgba(${strRgb},.1);border: solid 1px rgb(${strRgb});padding: 0px 6px 0 4px;line-height: 20px;margin-right:10px;overflow:hidden;max-width:100%;text-overflow: ellipsis;white-space: nowrap;`
                  ret.push(<span class="tag text-truncate d-inline-block" style={style}>{item.key.replace('user:', '')}:{item.value}</span>)
                })
                return <div>{...ret}</div>
              }
              return '-'
            },
          },
        },
        getTagTableColumn({
          columns: () => this.columns,
          tipName: this.$t('dictionary.schedtag'),
        }),
      ],
      extraInfo: [
        {
          title: this.$t('dictionary.policy'),
          items: [
            {
              field: 'scope',
              title: this.$t('system.text_437'),
              formatter: ({ row }) => {
                return this.$t(`policyScopeLabel.${row.scope}`)
              },
            },
            {
              field: 'policy.policy',
              title: this.$t('system.text_438'),
              slots: {
                default: ({ row }) => {
                  return <PolicyViewer policy={ row } />
                },
              },
            },
          ],
        },
      ],
      nameRules: [
        { required: true, message: this.$t('system.text_168') },
      ],
    }
  },
}
</script>
