<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { RES_TYPES } from '../utils'
import { STRATEGY_OPT } from '@Cloudenv/constants/sched'
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

const getParams = { details: true }

export default {
  name: 'SchedtagList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'schedtags',
        getParams,
        filterOptions: {
          name: getNameFilter(),
          default_strategy: {
            label: this.$t('cloudenv.text_413'),
            dropdown: true,
            multiple: true,
            items: STRATEGY_OPT,
          },
          resource_type: {
            label: this.$t('cloudenv.text_384'),
            dropdown: true,
            multiple: true,
            items: Object.keys(RES_TYPES).map(key => {
              return { label: RES_TYPES[key], key }
            }),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('cloudenv.text_413'), key: 'default_strategy' },
          { label: this.$t('cloudenv.text_384'), key: 'resource_type' },
          { label: this.$t('cloudenv.text_417'), key: 'resource_count' },
          { label: this.$t('cloudenv.text_418'), key: 'dynamic_schedtag_count' },
          { label: this.$t('cloudenv.text_419'), key: 'schedpolicy_count' },
        ],
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          action: () => {
            this.createDialog('CreateSchedtagDialog', {
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = {
              validate: true,
              tooltip: null,
              buttonType: 'primary',
            }
            if (!this.isAdminMode) {
              ret.validate = false
            }
            return ret
          },
        },
        {
          label: this.$t('table.action.set_tag'),
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              params: {
                resources: 'schedtag',
              },
              mode: 'add',
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
        {
          label: this.$t('cloudenv.text_108'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('cloudenv.text_420'),
              name: this.$t('dictionary.schedtag'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = {
              validate: this.list.allowDelete(),
              tooltip: null,
            }
            if (!this.isAdminMode) {
              ret.validate = false
            }
            return ret
          },
        },
      ],
    }
  },
  computed: mapGetters(['isAdminMode']),
  created () {
    this.initSidePageTab('schedtag-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SchedtagSidePage', {
        id: row.id,
        resource: 'schedtags',
        getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
