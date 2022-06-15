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
import { getNameFilter, getDescriptionFilter, getEnabledFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
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
          description: getDescriptionFilter(),
          enabled: getEnabledFilter(),
          // type: {
          //   label: this.$t('compute.text_175'),
          //   dropdown: true,
          //   items: [
          //     { label: this.$t('compute.host_port'), key: 'host' },
          //     { label: this.$t('compute.guest_port'), key: 'guest' },
          //   ],
          // },
          // target: getNameFilter({ field: 'target', label: this.$t('compute.target_name') }),
          // target_ips: {
          //   label: this.$t('compute.target_ip'),
          // },
          mac_addr: getNameFilter({ field: 'mac_addr', label: this.$t('compute.target_mac') }),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('table.title.enable_status'), key: 'enabled' },
          { label: this.$t('compute.text_175'), key: 'type' },
          { label: this.$t('compute.target_name'), key: 'target' },
          { label: this.$t('compute.target_ip'), key: 'target_ips' },
          { label: this.$t('compute.target_mac'), key: 'mac_addr' },
          { label: this.$t('compute.flow_count'), key: 'flow_count' },
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
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
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('compute.perform_delete'),
                    name: this.$t('dictionary.tap_service'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                  }
                  if (this.list.selectedItems.some(item => item.flow_count)) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.tap_service_delete_tip')
                  }
                  return ret
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
