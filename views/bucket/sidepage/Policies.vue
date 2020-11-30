<template>
  <div>
    <a-alert banner v-if="!isQcloud">
      <template #message>
        <p>{{$t('storage.text_148')}}</p>
        <p>{{$t('storage.text_258')}}</p>
      </template>
    </a-alert>
    <page-list
      v-else
      :list="list"
      :showSearchbox="false"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'BucketPolicyList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    resId: String,
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
    },
  },
  data () {
    const isQcloud = this.data.provider === HYPERVISORS_MAP.qcloud.provider
    return {
      list: this.$list.createList(this, {
        id: 'BucketPolicyList',
        resource: 'policy',
        ctx: [['buckets', this.resId]],
        getParams: this.getParam,
      }),
      groupActions: [
        {
          label: this.$t('storage.text_31'),
          action: () => {
            this.createDialog('CreatePolicyDialog', {
              title: this.$t('storage.text_259'),
              bucketID: this.resId,
              onManager: this.onManager,
              refresh: this.refresh,
              bucketData: this.data,
            })
          },
          meta: () => {
            if (this.$store.getters.scope === 'project' && this.data.tenant_id !== this.$store.getters.auth.tenant) {
              return {
                buttonType: 'primary',
                validate: false,
                tooltip: this.$t('storage.text_257'),
              }
            }
            return {
              buttonType: 'primary',
              ...this.$isOwner(this.data),
            }
          },
        },
        {
          label: this.$t('storage.text_36'),
          action: () => {
            this.createDialog('DeletePolicyDialog', {
              title: this.$t('storage.text_36'),
              name: this.$t('storage.text_259'),
              data: this.list.selectedItems,
              bucketID: this.resId,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: () => {
            if (this.list.selectedItems.length === 0) return { validate: false }
            if (this.$store.getters.scope === 'project' && this.data.tenant_id !== this.$store.getters.auth.tenant) {
              return {
                validate: false,
                tooltip: this.$t('storage.text_257'),
              }
            }
            return this.$isOwner(this.data)
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('storage.text_36'),
          action: (row) => {
            this.createDialog('DeletePolicyDialog', {
              title: this.$t('storage.text_36'),
              name: this.$t('storage.text_259'),
              data: [row],
              bucketID: this.resId,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: () => {
            if (this.$store.getters.scope === 'project' && this.data.tenant_id !== this.$store.getters.auth.tenant) {
              return {
                validate: false,
                tooltip: this.$t('storage.text_257'),
              }
            }
            return this.$isOwner(this.data)
          },
        },
      ],
      columns: [
        {
          field: 'Effect',
          title: this.$t('storage.text_239'),
          formatter: ({ row }) => {
            const obj = {
              Allow: this.$t('storage.text_217'),
              Deny: this.$t('storage.text_218'),
            }
            return obj[row.Effect]
          },
        },
        {
          field: 'principal',
          title: this.$t('storage.text_260'),
          slots: {
            default: ({ row }) => {
              const principal_id = row.principal_id || []
              return principal_id.map(item => {
                const item_arr = item.split(':')
                if (item_arr[0] === item_arr[1]) return (<div>根账号</div>)
                return (<div>子账号</div>)
              })
            },
          },
        },
        {
          field: 'principal_id',
          title: this.$t('storage.text_261'),
          slots: {
            default: ({ row }) => {
              const principal_id = row.principal_id || []
              return principal_id.map(item => {
                const item_arr = item.split(':')
                return (<list-body-cell-wrap hideField copy title={ item_arr[1] } message={ item_arr[1] }>
                  <span>{ item_arr[1] }</span>
                </list-body-cell-wrap>)
              })
            },
          },
        },
        {
          field: 'resource_path',
          title: this.$t('storage.text_262'),
          slots: {
            default: ({ row }) => {
              const resource_path = row.resource_path || []
              return resource_path.map(item => {
                return (<list-body-cell-wrap hideField copy title={ item } message={ item }>
                  <span>{ item }</span>
                </list-body-cell-wrap>)
              })
            },
          },
        },
        {
          field: 'canned_action',
          title: this.$t('storage.text_263'),
          formatter: ({ row }) => {
            const obj = {
              Read: this.$t('storage.text_252'),
              ReadWrite: this.$t('storage.text_264'),
              FullControl: this.$t('storage.text_254'),
            }
            return obj[row.canned_action] || row.canned_action
          },
        },
      ],
      isQcloud,
    }
  },
  created () {
    if (this.data.provider === HYPERVISORS_MAP.qcloud.provider) {
      this.list.fetchData()
    }
  },
}
</script>
