<template>
  <div>
    <page-list
      :list="list"
      :columns="templateListColumns || columns"
      :show-tag-filter="true"
      :show-tag-columns="true"
      :group-actions="groupActions"
      :single-actions="singleActions"
      :showSearchbox="showSearchbox"
      :showGroupActions="showGroupActions"
      :export-data-options="exportDataOptions"
      :show-single-actions="!isTemplate"
      :show-page="!isTemplate" />
  </div>
</template>

<script>
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getDescriptionFilter, getBrandFilter, getAccountFilter, getProjectDomainFilter, getRegionFilter, getCloudProviderFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'WafList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        apiVersion: 'v2',
        resource: 'waf_instances',
        getParams: { details: true },
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        filterOptions: {
          id: {
            label: this.$t('network.waf.id'),
          },
          external_id: {
            label: this.$t('table.title.external_id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          type: {
            label: this.$t('network.waf.type'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'type',
            },
          },
          brand: getBrandFilter(),
          account: getAccountFilter(),
          manager: getCloudProviderFilter(),
          project_domain: getProjectDomainFilter(),
          region: getRegionFilter(),
        },
        hiddenColumns: [],
        steadyStatus: {
          status: Object.values(expectStatus.waf).flat(),
        },
      }),
      groupActions: [
        {
          label: this.$t('table.action.set_tag'),
          permission: 'waf_instances_perform_set_user_metadata',
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              mode: 'add',
              params: {
                resources: 'waf_instance',
              },
              tipName: this.$t('network.waf'),
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
        {
          label: this.$t('cloudenv.text_108'),
          permission: 'waf_instances_delete',
          action: () => {
            this.createDialog('DeleteWafInstancesDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('network.waf.delete'),
              name: this.$t('network.waf'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        downloadType: 'local',
        title: this.$t('dictionary.waf_instance'),
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    refresh () {
      this.list.fetchData()
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'WafSidePage', {
        id: row.id,
        title: row.name,
        resource: 'waf_instances',
        apiVersion: 'v2',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
        tab,
      })
      this.initSidePageTab(tab)
    },
  },
}
</script>
