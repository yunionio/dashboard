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
import {
  getNameDescriptionTableColumn,
  getTimeTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

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
          // id: {
          //   label: 'ID',
          // },
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
      singleActions: [
        {
          label: this.$t('compute.perform_delete'),
          permission: 'tapflows_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              name: this.$t('dictionary.tap_flow'),
              onManager: this.onManager,
              success: () => {
                this.$bus.$emit('tap-service-refresh')
              },
            })
          },
          meta: () => {
            const ret = {
              validate: true,
            }
            return ret
          },
        },
        {
          label: this.$t('cloudenv.text_311'),
          actions: obj => {
            return [
              // 启用禁用
              ...getEnabledSwitchActions(this, obj, ['tapflows_perform_enable', 'tapflows_perform_disable'], {
                metas: [
                  () => {
                    const ret = {
                      validate: !obj.enabled,
                    }
                    return ret
                  },
                  () => {
                    const ret = {
                      validate: obj.enabled,
                    }
                    return ret
                  },
                ],
                resourceName: this.$t('dictionary.tap_flow'),
              }),
            ]
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'tapservices_create',
          action: () => {
            this.createDialog('TapFlowCreateDialog', {
              tapService: this.data,
              onManager: this.onManager,
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
              ...getEnabledSwitchActions(this, undefined, ['tapflows_perform_enable', 'tapflows_perform_disable'], {
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
                resourceName: this.$t('dictionary.tap_flow'),
              }),
              {
                label: this.$t('cloudenv.text_108'),
                permission: 'tapflows_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectItems,
                    columns: this.columns,
                    title: this.$t('compute.perform_delete'),
                    name: this.$t('dictionary.tap_flow'),
                    onManager: this.onManager,
                    success: () => {
                      this.$bus.$emit('tap-service-refresh')
                    },
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
