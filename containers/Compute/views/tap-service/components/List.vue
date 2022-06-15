<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :placeholder="$t('common.default_search_key', [$t('compute.text_228')])" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import globalSearchMixins from '@/mixins/globalSearch'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  name: 'TapServiceList',
  mixins: [WindowsMixin, ListMixin, globalSearchMixins, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
      default: () => ({
        details: true,
      }),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'tap_services',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          id: {
            label: 'ID',
          },
          description: getDescriptionFilter(),
          // ip: {
          //   label: this.$t('compute.text_985'),
          // },
          // ports: {
          //   label: this.$t('compute.text_349'),
          // },
          // region: getRegionFilter(),
          // cloudaccount: getAccountFilter(),
          // brand: getBrandFilter('brands', ['VMware', 'OneCloud']),
          // projects: getTenantFilter(),
          // project_domains: getDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: [],
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'tapservices_create',
          action: () => {
            this.$router.push({
              name: 'TapServiceCreate',
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              ...getEnabledSwitchActions(this, undefined, ['tapservices_perform_enable', 'tapservices_perform_disable'], {
                metas: [
                  () => {
                    const isEnable = !!this.list.selectedItems.find(item => item.enabled)
                    return {
                      validate: this.list.selectedItems.length && !isEnable,
                    }
                  },
                  () => {
                    const isDisable = !!this.list.selectedItems.find(item => !item.enabled)
                    return {
                      validate: this.list.selectedItems.length && !isDisable,
                    }
                  },
                ],
                resourceName: this.$t('dictionary.tap_service'),
              }),
              {
                label: this.$t('cloudenv.text_108'),
                permission: 'tapservices_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectItems,
                    columns: this.columns,
                    title: this.$t('compute.perform_delete'),
                    name: this.$t('dictionary.tap_service'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: true,
                  }
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length > 0,
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'isProjectMode']),
  },
  created () {
    this.initSidePageTab('tap-service-detail')
    this.list.fetchData()
    this.$bus.$on('tap-service-refresh', () => {
      this.list.refresh()
    })
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'TapServiceSidePage', {
        id: row.id,
        resource: 'tap_services',
        getParams: this.getParam,
        tab: 'tap-service-detail',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
