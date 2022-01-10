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
  getRegionTableColumn,
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
        // {
        //   field: 'host.name',
        //   title: this.$t('compute.text_654'),
        //   minWidth: 150,
        //   showOverflow: 'title',
        // },
        {
          field: 'storagecache',
          title: this.$t('compute.text_654'),
          minWidth: 150,
          showOverflow: 'title',
          slots: {
            default: ({ row }) => {
              return row.storagecache
            },
          },
        },
        getStatusTableColumn({ statusModule: 'imageCache' }),
        getTimeTableColumn({ title: this.$t('compute.text_691'), field: 'updated_at' }),
        getBrandTableColumn({ field: 'host.brand' }),
        getRegionTableColumn({ field: 'host.region' }),
        {
          field: 'host.account',
          title: this.$t('compute.text_269'),
          width: 100,
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
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
              refresh: this.refresh,
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
