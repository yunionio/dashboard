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
import ColumnsMixin from '../mixins/columns'
import WindowsMixin from '@/mixins/windows'
import { getTagColor, getTagTitle } from '@/utils/common/tag'

export default {
  name: 'TagList',
  mixins: [WindowsMixin, ColumnsMixin],
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
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'TagSidePage', {
        id: row.key,
        resource: async params => {
          try {
            const response = await this.manager.get({
              id: 'tag-value-pairs',
              params: {
                ...params,
                key: row.key,
                value: row.value,
              },
            })
            return { data: response.data.data[0] }
          } catch (error) {
            throw error
          }
        },
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
