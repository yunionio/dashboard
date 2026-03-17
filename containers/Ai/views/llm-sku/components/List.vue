<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { filterOptions } from '../utils/filters'

export default {
  name: 'PhoneSpecList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'llm_skus',
        getParams: this.getParam,
        filterOptions,
        hiddenColumns: [],
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            if (this.isApplyType) {
              this.$router.push('/app-llm-sku/create')
            } else {
              this.$router.push('/llm-sku/create')
            }
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
        },
        {
          label: this.$t('table.action.delete'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('aice.spec'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = { validate: this.list.selected.length }
            if (this.list.selectedItems.some(item => !item.can_delete)) {
              ret.validate = false
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  computed: {
    isApplyType () {
      return this.$route.path.includes('app-llm')
    },
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('aice.spec'),
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      ret.filter = R.is(Array, ret.filters) ? ret.filters : (R.is(String, ret.filters) ? [ret.filters] : [])
      ret.filter.push(`llm_type.${this.isApplyType ? 'notin' : 'in'}(vllm,ollama)`)
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LlmSkuSidePage', {
        id: row.id,
        resource: 'llm_skus',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

<style>
</style>
