<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'CloudproviderList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
    },
    cloudaccountListRefresh: {
      type: Function,
    },
    id: String,
  },
  data () {
    const ownerDomain = list => this.$store.getters.isAdminMode || list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
    const isAccountDomain = data => data.share_mode === 'account_domain'
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudproviders',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.cloudaccount).flat(),
        filterOptions: {
          name: {
            label: this.$t('cloudenv.text_95'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          action: () => {
            this.createDialog('cloudproviderCreateDialog', {
              data: this.data,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.data.brand === 'Azure',
              tooltip: this.data.brand !== 'Azure' && this.$t('cloudenv.text_333'),
            }
          },
        },
        {
          label: this.$t('cloudenv.text_334'),
          action: () => {
            this.list.batchPerformAction('enable', null).then(() => {
              this.$bus.$emit('CloudAccountListSingleRefresh', [this.data.id])
            })
          },
          meta: () => {
            const isDisable = !!this.list.selectedItems.find(item => !item.enabled)
            return {
              validate: this.list.selectedItems.length && ownerDomain(this.list) && isDisable,
            }
          },
        },
        {
          label: this.$t('cloudenv.text_335'),
          action: () => {
            this.list.batchPerformAction('disable', null).then(() => {
              this.$bus.$emit('CloudAccountListSingleRefresh', [this.data.id])
            })
          },
          meta: () => {
            const isEnable = !!this.list.selectedItems.find(item => item.enabled)
            return {
              validate: this.list.selectedItems.length && ownerDomain(this.list) && isEnable,
            }
          },
        },
        {
          label: this.$t('cloudenv.text_294', [this.$t('dictionary.project')]),
          action: () => {
            if (isAccountDomain(this.data)) {
              this.createDialog('ChangeProjectDialog', {
                name: this.$t('dictionary.cloudprovider'),
                data: this.list.selectedItems,
                columns: this.columns,
                onManager: this.onManager,
                alertMessage: this.$t('cloudenv.text_336', [this.$t('dictionary.project'), this.$t('dictionary.domain'), this.$t('dictionary.domain')]),
              })
            } else {
              this.createDialog('ChangeOwenrDialog', {
                name: this.$t('dictionary.cloudprovider'),
                data: this.list.selectedItems,
                columns: this.columns,
                onManager: this.onManager,
                action: 'change-project',
                resource: 'cloudproviders',
                alertMessage: this.$t('cloudenv.text_336', [this.$t('dictionary.project'), this.$t('dictionary.domain'), this.$t('dictionary.domain')]),
              })
            }
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length && this.list.selectedItems.every(val => val.enabled) && ownerDomain(this.list),
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('cloudaccount-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CloudproviderSidePage', {
        id: row.id,
        resource: 'cloudproviders',
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
