<template>
  <div class="cloudaccount pt-2">
    <a-alert type="info" show-icon class="mt-2 mb-2" v-if="$store.getters.isAdminMode">
      <template slot="message">该配置可在云账号导入后在云账号详情页-订阅-区域进行修改，可根据资源分布配置，提高同步同步效率！</template>
    </a-alert>
    <page-list
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import { getNameFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import {
  getEnabledTableColumn,
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
        getEnabledTableColumn({ title: this.$t('cloudenv.text_97') }),
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
      this.list.responseData = { data }
      return response
    },
  },
}
</script>
