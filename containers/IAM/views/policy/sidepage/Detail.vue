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
import { isCE } from '@/utils/utils'
import { getTagColor } from '@/utils/common/tag'
import PolicyViewer from '../components/PolicyViewer'

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
          field: 'domain_tags',
          title: this.$t('iam.domain_tag'),
          slots: {
            default: ({ row }, h) => {
              const ret = []
              if (row.domain_tags) {
                row.domain_tags.map(item => {
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
          hidden: () => isCE(),
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
        {
          field: 'org_nodes',
          title: this.$t('dictionary.organization'),
          slots: {
            default: ({ row }) => {
              const { org_nodes = [] } = row
              if (org_nodes.length) {
                const list = org_nodes.map(item => <a-tag class="mr-1 mb-1">{this.getTag(item)}</a-tag>)
                return [...list]
              }
              return '-'
            },
          },
          hidden: () => isCE(),
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
              title: this.$t('iam.res_policy'),
              slots: {
                default: ({ row }) => {
                  return <PolicyViewer policy={row} service={'compute'} resource={'servers'} />
                },
              },
            },
            {
              field: 'policy.policy',
              title: this.$t('iam.other_policy'),
              slots: {
                default: ({ row }) => {
                  return <PolicyViewer policy={row} excludeResources={['servers']} />
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
  methods: {
    getTag (tag) {
      const { tags = [] } = tag
      const ret = tags.map(item => {
        const { key, value } = item
        if (value) {
          return `${key.replace('org:', '')}:${value}`
        } else {
          return key.replace('org:', '')
        }
      })
      return ret.join(' - ')
    },
  },
}
</script>
