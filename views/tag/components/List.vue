<template>
  <vxe-grid
    ref="grid"
    highlight-hover-row
    highlight-current-row
    show-header-overflow="title"
    :data="data"
    :columns="columns">
    <template v-slot:empty>
      <loader :loading="loading" />
    </template>
  </vxe-grid>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import { getTagColor, getTagTitle } from '@/utils/common/tag'

export default {
  name: 'TagList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  data () {
    return {
      loading: false,
      data: [],
      columns: [
        {
          field: 'key',
          title: '标签（键：值）',
          showOverflow: 'ellipsis',
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              let trigger = <a onClick={ () => this.createSidePageForList('TagSidePage', { resId: row.id, data: row, windowData: this.windowData }) }>{ row.name }</a>
              if (this.$options.name !== 'TagList') {
                trigger = <span>{ row.name }</span>
              }
              return [
                <list-body-cell-wrap copy field='name' row={row} hideField>{ trigger }</list-body-cell-wrap>,
              ]
            },
          },
        },
        {
          field: 'count',
          title: '绑定资源数量',
          width: 120,
          formatter: ({ row }) => {
            return `${row.count || 0}`
          },
        },
        {
          field: 'color',
          title: '颜色',
          width: 60,
          slots: {
            default: ({ row }) => {
              return [<span style={{ display: 'inline-block', backgroundColor: row.color, width: '10px', height: '10px' }} />]
            },
          },
        },
      ],
    }
  },
  computed: mapGetters(['scope']),
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('metadatas')
    this.initSidePageTab('tag-detail')
    this.fetchData()
    this.$bus.$on('TagListUnbindResourceCallback', this.unbindResourceCallback, this)
  },
  methods: {
    fetchData () {
      this.loading = true
      return new Promise((resolve, reject) => {
        this.manager.get({
          id: 'tag-value-pairs',
          params: {
            scope: this.scope,
            ...this.getParams,
          },
        }).then(response => {
          const data = (response.data.data || []).map(item => {
            return {
              // 前端模拟name
              name: getTagTitle(item.key, item.value),
              color: getTagColor(item.key, item.value),
              ...item,
            }
          })
          data.sort((a, b) => a.key.localeCompare(b.key))
          this.data = data
          this.loading = false
          resolve(response)
        }).catch(error => {
          this.loading = false
          reject(error)
        })
      })
    },
    async unbindResourceCallback ({ tagData }) {
      try {
        await this.fetchData()
        this.destroySidePages()
        const data = R.find(R.propEq('key', tagData.key))(this.data)
        if (data) {
          this.createSidePageForList('TagSidePage', { resId: data.id, data, windowData: this.windowData })
          this.$refs.grid.setCurrentRow(data)
        }
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
