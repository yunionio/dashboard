<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import {
  getStatusTableColumn,
  getTimeTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import { getBrandFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'systemImageCacheList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'CacheListForSystemImageSidePage',
        resource: 'storagecachedimages',
        apiVersion: 'v2',
        idKey: 'storagecache_id',
        getParams: {
          cachedimage_id: this.resId,
          details: true,
        },
        filterOptions: {
          brand: getBrandFilter('compute_engine_brands'),
        },
      }),
      columns: [
        {
          field: 'hosts',
          title: this.$t('compute.text_111'),
          minWidth: 240,
          showOverflow: 'title',
          slots: {
            default: ({ row }) => {
              if (!row.hosts) {
                return '-'
              }
              const ret = []
              for (let i = 0; i < row.hosts.length; i++) {
                const host = row.hosts[i]
                const host_id = row.host_info[i].id
                ret.push(
                  <list-body-cell-wrap copy hideField={true} field='host' row={row} message={host}>
                    <side-page-trigger permission='hosts_get' name='HostSidePage' id={host_id} vm={this}>{host}</side-page-trigger>
                  </list-body-cell-wrap>,
                )
              }
              return ret
            },
          },
        },
        {
          field: 'storages',
          title: this.$t('compute.text_99'),
          minWidth: 300,
          showOverflow: 'title',
          slots: {
            default: ({ row }) => {
              if (!row.storages) {
                return '-'
              }
              const ret = []
              for (let i = 0; i < row.storages.length; i++) {
                const storage = row.storages[i]
                const storage_id = row.storage_info[i].id
                ret.push(
                  <list-body-cell-wrap copy hideField={true} field='storage' row={row} message={storage}>
                    <side-page-trigger permission='storages_get' name='BlockStorageSidePage' id={storage_id} vm={this}>{storage}</side-page-trigger>
                  </list-body-cell-wrap>,
                )
              }
              return ret
            },
          },
        },
        /* {
          field: 'path',
          title: this.$t('compute.text_654'),
          minWidth: 150,
          showOverflow: 'title',
          slots: {
            default: ({ row }) => {
              return row.path || '-'
            },
          },
        }, */
        getStatusTableColumn({ statusModule: 'imageCache' }),
        getTimeTableColumn({ title: this.$t('compute.text_691'), field: 'updated_at' }),
        getBrandTableColumn({ field: 'brand' }),
        {
          field: 'account',
          title: this.$t('compute.text_269'),
          width: 100,
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.image_cache.perform_precache'),
          permission: 'storagecachedimages_create',
          actions: (obj) => {
            return [
              {
                label: 'IDC',
                action: () => {
                  this.createCache('onpremise', obj)
                },
              },
              {
                label: this.$t('compute.text_400'),
                action: () => {
                  this.createCache('private', obj)
                },
              },
              {
                label: this.$t('compute.text_401'),
                action: () => {
                  this.createCache('public', obj)
                },
              },
            ]
          },
          meta: () => ({
            buttonType: 'primary',
          }),
          hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_create_cache_list'),
        },
        {
          label: this.$t('compute.image_cache.perform_batch_precache'),
          permission: 'storagecachedimages_create',
          action: (obj) => {
            this.createDialog('ImageBatchCreateCache', {
              data: [obj],
              columns: this.columns,
              title: this.$t('compute.image_cache.perform_batch_precache'),
              onManager: this.onManager,
              imageId: this.resId,
              refresh: this.refresh,
            })
          },
          hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_create_cache_list'),
        },
        {
          label: this.$t('compute.perform_delete'),
          permission: 'storagecachedimages_delete',
          action: (obj) => {
            this.createDialog('DeleteCacheDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            for (let i = 0; i < this.list.selectedItems.length; i++) {
              const result = this.$getDeleteResult(this.list.selectedItems[i])
              if (!result.validate) {
                return result
              }
            }
            if (this.list.selectedItems.length > 0) {
              return {
                validate: true,
                tooltip: '',
              }
            }
            return {
              validate: false,
              tooltip: '',
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.perform_delete'),
          permission: 'storagecachedimages_delete',
          action: (obj) => {
            this.createDialog('DeleteCacheDialog', {
              data: [obj],
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              onManager: this.onManager,
              imageId: this.resId,
              refresh: this.list.refresh,
            })
          },
          meta: (obj) => {
            return this.$getDeleteResult(obj)
          },
        },
      ],
      ids: '',
      timer: '',
    }
  },
  created () {
    this.list.fetchData()
  },
  mounted () {
    const steadyStatus = Object.values(expectStatus.imageCache).flat()

    this.timer = setInterval(() => {
      let preStatusNum = 0

      R.forEachObjIndexed((value, key) => {
        if (!steadyStatus.includes(value.data?.status)) {
          preStatusNum++
        }
      }, this.list.data)

      if (preStatusNum !== 0) {
        this.list.refresh()
      }
    }, 10000)
  },
  destroyed () {
    clearInterval(this.timer)
  },
  methods: {
    createCache (title, obj) {
      this.createDialog('ImageCreateCache', {
        data: [obj],
        columns: this.columns,
        title,
        onManager: this.onManager,
        imageId: this.resId,
        refresh: this.refresh,
      })
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'HostSidePage', {
        id: row.host.id,
        resource: 'hosts',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
