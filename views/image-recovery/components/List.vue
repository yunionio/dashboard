<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter, getOsTypeFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'

export default {
  name: 'ImageRecoveryList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'images',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.image).flat(),
        apiVersion: 'v1',
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter(),
          os_type: getOsTypeFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_398'), key: 'disk_format' },
          { label: this.$t('table.title.image_size'), key: 'size' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('table.title.image_type'), key: 'is_standard' },
          { label: this.$t('compute.text_243'), key: 'created_at' },
          { label: this.$t('table.title.checksum'), key: 'checksum' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_477'),
          permission: 'images_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_477'),
              name: this.$t('dictionary.image'),
              requestParams: { override_pending_delete: true },
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
        {
          label: this.$t('compute.text_478'),
          permission: 'images_perform_cancel_delete',
          action: () => {
            this.createDialog('ImageRestoreDialog', {
              title: this.$t('compute.text_478'),
              data: this.list.selectedItems,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: () => {
            if (this.list.selectedItems.length > 0 && this.list.selectedItems.find(v => v.status === 'deleting') === undefined) {
              return {
                validate: true,
              }
            }
            return {
              validate: false,
            }
          },
        },
      ],
    }
  },
  watch: {
    cloudEnv (val) {
      this.list.resource = this[`${val}Fetcher`]
      this.list.fetchData(0)
    },
  },
  created () {
    this.sm = new this.$Manager('images', 'v1')
    this.vm = new this.$Manager('guestimages', 'v1')
    this.list.fetchData()
  },
  methods: {
    getParams () {
      if (this.cloudEnv === 'images') {
        return {
          details: true,
          pending_delete: true,
          is_guest_image: false,
        }
      }
      return {
        details: true,
        pending_delete: true,
      }
    },
    imagesFetcher (params) {
      return this.sm.list({ params })
    },
    guestimagesFetcher (params) {
      return this.vm.list({ params })
    },
  },
}
</script>
