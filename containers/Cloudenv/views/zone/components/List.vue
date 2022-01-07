<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'ZoneList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
    disableCreate: Boolean,
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'zones',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('cloudenv.text_424'), key: 'hosts' },
          { label: this.$t('cloudenv.text_476'), key: 'hosts_enabled' },
          { label: this.$t('cloudenv.text_477'), key: 'baremetals' },
          { label: this.$t('cloudenv.text_478'), key: 'baremetals_enabled' },
          { label: this.$t('cloudenv.text_229'), key: 'wires' },
        ],
        getParams: {
          cloud_env: 'private_or_onpremise',
          with_meta: true,
          show_emulated: true,
        },
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          permission: 'zones_create',
          action: () => {
            this.createDialog('CreateZoneDialog', {
              title: this.$t('cloudenv.text_479'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !this.disableCreate,
            }
          },
          hidden: () => this.hiddenActions.includes('create'),
        },
        {
          label: this.$t('cloudenv.text_108'),
          permission: 'zones_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              name: this.$t('cloudenv.text_11'),
              title: this.$t('cloudenv.text_108'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('zone-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ZoneSidePage', {
        id: row.id,
        resource: 'zones',
        getParams: this.getParams,
      }, {
        list: this.list,
        hiddenActions: this.hiddenActions,
      })
    },
  },
}
</script>
