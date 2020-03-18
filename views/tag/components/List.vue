<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import { getTagColor, getTagTitle } from '@/utils/common/tag'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'TagList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: params => this.listResource(params),
        getParams: this.getParams,
        filterOptions: {
          key: {
            label: '键',
          },
          value: {
            label: '值',
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: '键', key: 'key' },
          { label: '值', key: 'value' },
        ],
      },
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('metadatas')
    this.initSidePageTab('tag-detail')
    this.list.fetchData()
    this.$bus.$on('TagListUnbindResourceCallback', this.unbindResourceCallback, this)
  },
  methods: {
    async listResource (params) {
      try {
        const response = await this.manager.get({
          id: 'tag-value-pairs',
          params,
        })
        const data = (response.data.data || []).map(item => {
          return {
            // 前端模拟id
            id: `${item.key}$$${item.value}`,
            // 前端模拟name
            name: getTagTitle(item.key, item.value),
            color: getTagColor(item.key, item.value),
            ...item,
          }
        })
        response.data.data = data
        return response
      } catch (error) {
        throw error
      }
    },
    async detailResource (params, row) {
      try {
        const response = await this.manager.get({
          id: 'tag-value-pairs',
          params: {
            ...params,
            key: row.key,
            value: row.value,
          },
        })
        let item = response.data && response.data.data && response.data.data.length && response.data.data[0]
        if (!item) return { data: {} }
        item = {
          id: `${item.key}$$${item.value}`,
          // 前端模拟name
          name: getTagTitle(item.key, item.value),
          color: getTagColor(item.key, item.value),
          ...item,
        }
        return { data: item }
      } catch (error) {
        throw error
      }
    },
    async unbindResourceCallback ({ tagData }) {
      try {
        await this.refresh()
        this.destroySidePages()
      } catch (error) {
        throw error
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'TagSidePage', {
        id: row.key,
        resource: params => this.detailResource(params, row),
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
