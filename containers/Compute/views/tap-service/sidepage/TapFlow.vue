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
import {
  getNameDescriptionTableColumn,
  getTimeTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getTenantFilter, getDomainFilter, getRegionFilter, getBrandFilter, getAccountFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'

export default {
  name: 'TapFlowList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
      default: () => ({
        details: true,
      }),
    },
    data: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'tap_flows',
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
            this.createDialog('TapFlowCreateDialog', {
              tapService: this.data,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
      ],
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          formRules: [
            { required: true, message: this.$t('compute.text_210') },
          ],
          slotCallback: row => {
            return row.name
          },
        }),
        getEnabledTableColumn(),
        {
          title: this.$t('compute.tap'),
          field: 'tap',
        },
        {
          title: this.$t('compute.text_175'),
          field: 'type',
        },
        {
          title: this.$t('compute.source'),
          field: 'source',
        },
        {
          title: this.$t('compute.source_ip'),
          field: 'source_ips',
        },
        {
          title: this.$t('compute.source_mac'),
          field: 'mac_addr',
        },
        {
          title: this.$t('compute.vlan_id'),
          field: 'vlan_id',
        },
        {
          title: this.$t('compute.tap_direction'),
          field: 'direction',
        },
        getTimeTableColumn(),
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'isProjectMode']),
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>
