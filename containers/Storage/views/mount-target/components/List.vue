<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getStatusFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'MountTargetList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
    },
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'mount_targets',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.mountTarget).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          status: getStatusFilter('mountTarget'),
        },
        responseData: this.responseData,
        hiddenColumns: ['name', 'created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('storage.text_41'), key: 'status' },
          { label: this.$t('dictionary.vpc'), key: 'vpc' },
          { label: this.$t('dictionary.network'), key: 'network' },
          { label: this.$t('dictionary.access_group'), key: 'access_group' },
          { label: this.$t('storage.mount.target.domain.name'), key: 'domain_name' },
          { label: this.$t('storage.created_at'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('storage.text_31'),
          permission: 'mount_targets_create',
          action: () => {
            this.createDialog('MountTargetCreateDialog', {
              title: this.$t('storage.text_31'),
              data: this.data,
              refresh: this.refresh,
              onManager: this.onManager,
            })
          },
          meta: () => {
            if (this.data.status !== 'available') {
              return {
                validate: false,
                tooltip: this.$t('storage.filesystem.not.available.tooltip'),
              }
            }
            if (this.data.mount_target_count_limit > 0 && this.list.total >= this.data.mount_target_count_limit) {
              return {
                validate: false,
                tooltip: this.$t('storage.mount.target.max.count', [this.data.mount_target_count_limit]),
              }
            }
            const ret = { ...this.$isOwner(this.data), buttonType: 'primary' }
            if (!ret.validate) return ret
            return ret
          },
          hidden: () => this.hiddenActions.includes('create'),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('mount-target-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        detail: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'MountTargetSidePage', {
        id: row.id,
        resource: 'mount_targets',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
