<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :placeholder="$t('common.default_search_key', [$t('compute.text_228')])" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getTenantFilter, getDomainFilter, getRegionFilter, getBrandFilter, getAccountFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import globalSearchMixins from '@/mixins/globalSearch'

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
          ip: {
            label: this.$t('compute.text_985'),
          },
          ports: {
            label: this.$t('compute.text_349'),
          },
          region: getRegionFilter(),
          cloudaccount: getAccountFilter(),
          brand: getBrandFilter('brands', ['VMware', 'OneCloud']),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
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
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'isProjectMode']),
  },
  created () {
    this.initSidePageTab('tap-service-detail')
    this.list.fetchData()
    // this.$bus.$on('secgroup-list-refresh', () => {
    //   this.list.refresh()
    // })
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
