<template>
  <div class="cloudaccount pt-2">
    <a-alert type="info" show-icon class="mt-2 mb-2" v-if="$store.getters.isAdminMode">
      <template slot="message">{{ $t('cloudenv.select_region_tips') }}</template>
    </a-alert>
    <page-list
      :showSync="false"
      :showSearchbox="false"
      :showPage="false"
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import { getNameFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SelectRegion',
  mixins: [WindowsMixin],
  props: {
    account: {
      type: Object,
      required: true,
    },
    createFormData: {
      type: Object,
      required: true,
    },
  },
  data () {
    // const ownerDomain = obj => this.$store.getters.isAdminMode || obj.cloudaccount_domain_id === this.$store.getters.userInfo.projectDomainId

    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: () => this.fetchData(),
        getParams: {},
        responseData: this.responseData,
        filterOptions: {
          name: getNameFilter(),
          enabled: getEnabledFilter({ label: this.$t('cloudenv.text_98') }),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'status',
          title: this.$t('common.status'),
          slots: {
            default: ({ row }) => {
              return [
                <status status={ row.status } statusModule='region' />,
              ]
            },
          },
        },
      ],
      groupActions: [
        // {
        //   label: this.$t('cloudenv.text_363'),
        //   action: () => {
        //     this.createDialog('SetRegionAutoSyncDialog', {
        //       data: this.list.selectedItems,
        //       columns: this.columns,
        //       refresh: this.refresh,
        //       cloudproviderId: this.cloudproviderId,
        //     })
        //   },
        //   meta: () => {
        //     return {
        //       validate: this.list.selectedItems.length,
        //     }
        //   },
        // },
      ],
      singleActions: [
        // {
        //   label: this.$t('cloudenv.text_363'),
        //   action: obj => {
        //     this.createDialog('SetRegionAutoSyncDialog', {
        //       data: [obj],
        //       columns: this.columns,
        //       refresh: this.refresh,
        //       cloudproviderId: this.cloudproviderId,
        //     })
        //   },
        //   meta: obj => {
        //     return {
        //       validate: ownerDomain(obj),
        //     }
        //   },
        // },
      ],
    }
  },
  computed: {
    chooseRegions () {
      return this.list.selectedItems
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    fetchData () {
      const response = { data: {} }
      const data = this.account.sub_accounts.cloudregions
      response.data.data = data
      return response
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        resolve()
      })
    },
  },
}
</script>
