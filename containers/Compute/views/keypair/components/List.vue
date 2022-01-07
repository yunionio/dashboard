<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { getNameFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'KeyPairList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'keypairs',
        getParams: this.getParam,
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_725'), key: 'public_key' },
          { label: this.$t('compute.text_726'), key: 'fingerprint' },
          { label: this.$t('compute.text_175'), key: 'scheme' },
          { label: this.$t('compute.text_699', [this.$t('dictionary.server')]), key: 'linked_guest_count' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'keypairs_create',
          action: () => {
            this.createDialog('CreateKeyPairDialog', {
              title: this.$t('compute.perform_create'),
              onManager: this.onManager,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('compute.perform_delete'),
          permission: 'keypairs_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              name: this.$t('dictionary.keypair'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('key-pair-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
        scope: 'user',
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'KeyPairSidePage', {
        id: row.id,
        resource: 'keypairs',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
