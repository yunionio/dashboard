<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <dialog-table v-if="columns && columns.length" :data="externalprojects" :columns="columns" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <!-- <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button> -->
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import {
  getProjectTableColumn,
  getAccountTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'ExternalProjectsDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      externalprojects: [],
      title: this.$t('system.text_402'),
    }
  },
  computed: {
    columns () {
      return [
        {
          field: 'name',
          title: this.$t('system.text_402'),
          minWidth: 120,
          slots: {
            default: ({ row }, h) => {
              return row.name
            },
          },
        },
        getBrandTableColumn(),
        getAccountTableColumn(),
        getProjectTableColumn({ title: this.$t('table.title.local_project') }),
      ]
    },
  },
  created () {
    this.manager = new this.$Manager('externalprojects')
    this.fetchExternalProjects()
  },
  methods: {
    fetchExternalProjects () {
      const params = {
        scope: this.$store.getters.scope,
        tenant: this.params.data.id,
      }
      this.manager.list({ params })
        .then((res) => {
          this.externalprojects = res.data.data
        })
        .catch((error) => {
          this.externalprojects = []
          throw error
        })
    },
  },
}
</script>
