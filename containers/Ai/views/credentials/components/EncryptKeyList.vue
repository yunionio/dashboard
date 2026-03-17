<template>
  <div>
    <page-list
      :list="list"
      :columns="columns"
      :singleActions="singleActions"
      :group-actions="groupActions"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import windows from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'CredentialList',
  mixins: [windows, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      dialog: {
        visible: false,
      },
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'credentials',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          id: {
            label: 'ID',
            filter: true,
            formatter: val => {
              return `id.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('scope.encrypt_key.title.name'), key: 'name' },
          { label: this.$t('scope.text_15'), key: 'enabled' },
          { label: this.$t('scope.text_16'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('scope.text_17'),
          action: () => {
            this.createDialog('CredentialEncryptKeyCreate', {
              title: this.$t('scope.create_encrypt_key'),
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('scope.text_18'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('scope.text_18'),
              name: this.$t('common_631'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  computed: mapGetters(['userInfo']),
  created () {
    this.list.fetchData()
  },
  methods: {
    refresh () {
      this.list.refresh()
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        type: 'enc_key',
        scope: undefined,
      }
      return ret
    },
  },
}
</script>
