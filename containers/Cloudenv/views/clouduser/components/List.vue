<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import get from 'lodash/get'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'ClouduserList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
    cloudaccount: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudusers',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.clouduser).flat(),
        filterOptions: {
          name: {
            label: this.$t('cloudenv.clouduser_list_t1'),
          },
          owner_name: {
            label: this.$t('cloudenv.clouduser_list_t4'),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.clouduser_list_t1'), key: 'name' },
          { label: this.$t('cloudenv.clouduser_list_t5'), key: 'is_console_login' },
          { label: this.$t('cloudenv.text_98'), key: 'status' },
          { label: this.$t('cloudenv.clouduser_list_t3'), key: 'iam_login_url' },
          { label: this.$t('cloudenv.clouduser_list_t4'), key: 'owner_name' },
        ],
      },
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'clouduser_create',
          action: () => {
            this.createDialog('ClouduserCreateDialog', {
              onManager: this.onManager,
              cloudaccount: this.cloudaccount,
              defaultDomainId: this.userInfo.projectDomainId,
              defaultProjectId: this.userInfo.projectId,
              userId: this.userInfo.id,
            })
          },
          meta: () => {
            return {
              validate: (this.$store.getters.isAdminMode || get(this.cloudaccount, 'domain_id') === this.$store.getters.userInfo.projectDomainId) && this.isNormalStatus(),
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: this.$t('common.delete'),
                permission: 'clouduser_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('common.delete'),
                    name: this.$t('dictionary.clouduser'),
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length > 0 && (this.$store.getters.isAdminMode || get(this.cloudaccount, 'domain_id') === this.$store.getters.userInfo.projectDomainId) && this.isNormalStatus(),
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.initSidePageTab('clouduser-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>
