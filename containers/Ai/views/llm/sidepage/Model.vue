<template>
  <vxe-grid resizable :data="list" :columns="columns" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { sizestr } from '@/utils/utils'

export default {
  name: 'LlmModelList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => { },
    },
    resId: String,
  },
  data () {
    return {
      list: [],
      columns: [
        {
          field: 'name',
          title: this.$t('aice.model'),
        },
        {
          field: 'id',
          title: 'ID',
        },
        {
          field: 'tag',
          title: 'Tag',
        },
        {
          field: 'size',
          title: 'Size',
          formatter: ({ row }) => {
            return sizestr(row.size, 'B', 1024)
          },
        },
        {
          field: '_action',
          title: this.$t('table.title._action'),
          slots: {
            default: ({ row }) => {
              return [
                <a-button type="link" size="small" onClick={ () => {
                  this.createDialog('LlmModelSaveInstantModelDialog', {
                    data: [row],
                    resId: this.resId,
                    actionText: this.$t('aice.save_as_instant_model'),
                    success: () => {
                      //
                    },
                  })
                } }>{this.$t('aice.save_as_instant_model')}</a-button>,
              ]
            },
          },
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('aice.image'),
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const response = await new this.$Manager(`llms/${this.resId}/probed-models`, 'v2').list({
        params: {
          scope: this.$store.getters.scope,
        },
      })
      const { data } = response
      const keys = Object.keys(data)
      this.list = keys.map(key => {
        return {
          id: data[key].model_id,
          ...data[key],
        }
      })
    },
  },
}
</script>

<style>
</style>
