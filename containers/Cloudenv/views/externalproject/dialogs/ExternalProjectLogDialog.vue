<template>
  <base-dialog @cancel="cancelDialog" :width="1000">
    <div slot="header">{{$t('bill.record_detail')}}</div>
    <div slot="body">
      <dialog-table :data="recordList" :columns="columns" :showOverflow="true" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ExternalProjectLogDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      recordList: [],
      columns: [
        {
          field: 'ops_time',
          title: this.$t('bill.action_time'),
          formatter: ({ row }) => {
            return this.$moment(row.ops_time).format()
          },
        },
        {
          field: 'action',
          title: this.$t('bill.action'),
          formatter: ({ row }) => {
            const { action } = row._i18n || {}
            return action
          },
        },
        {
          field: 'change_text',
          title: this.$t('bill.change_text'),
          width: 200,
          slots: {
            default: ({ row }) => {
              let { notes = {} } = row
              if (R.is(String, notes)) {
                notes = JSON.parse(notes)
              }
              const ret = []
              if (notes.old_domain && notes.old_project) {
                ret.push(<div>{this.$t('cloudenv.old_sth', [this.$t('dictionary.domain')])}: {notes.old_domain}</div>)
                ret.push(<div>{this.$t('cloudenv.old_sth', [this.$t('dictionary.project')])}: {notes.old_project}</div>)
              }
              if (notes.new_domain && notes.new_project) {
                ret.push(<div>{this.$t('cloudenv.new_sth', [this.$t('dictionary.domain')])}: {notes.new_domain}</div>)
                ret.push(<div>{this.$t('cloudenv.new_sth', [this.$t('dictionary.project')])}: {notes.new_project}</div>)
              }
              return ret
            },
          },
        },
        {
          field: 'user',
          title: this.$t('table.title.sponsor'),
        },
      ],
    }
  },
  created () {
    this.$l = new this.$Manager('actions', 'v1')
    this.fetchRecords()
  },
  methods: {
    async fetchRecords () {
      const { id } = this.params.data[0]
      try {
        const { data = {} } = await this.$l.list({
          params: {
            filter: [`obj_id.in('${id}')`],
            limit: 10,
            scope: this.$store.getters.scope,
          },
        })
        this.recordList = data.data.filter(item => {
          return item.notes
        })
      } catch (err) {

      }
    },
  },
}
</script>
