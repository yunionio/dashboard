import { mapGetters } from 'vuex'
import { getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  computed: {
    ...mapGetters(['isProjectMode']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('storage.text_100'),
        permission: 'server_perform_syncstatus',
        action: (row) => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: row.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: row => {
          return {
            validate: row.status !== 'sync_status',
          }
        },
      },
      {
        label: i18n.t('storage.text_65'),
        actions: row => {
          return [
            {
              label: i18n.t('storage.text_99'),
              permission: 'buckets_perform_limit',
              action: row => {
                this.createDialog('BucketUpdateBucketLimitDialog', {
                  title: i18n.t('storage.text_99'),
                  data: [row],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
            },
            getSetPublicAction(this, {
              name: this.$t('dictionary.bucket'),
              scope: 'project',
              resource: 'buckets',
            }),
            {
              label: i18n.t('storage.text_138'),
              action: row => {
                this.createDialog('ObjectsUpdateAclDialog', {
                  title: i18n.t('storage.text_138'),
                  data: [row],
                  bucket: row,
                  resName: row.name,
                  columns: this.columns,
                  list: this.list,
                  refresh: this.refresh,
                })
              },
              // meta: row => {
              //   return {
              //     validate: this.list.selectedItems.every(row => !this.isDir(row.key)),
              //   }
              // },
            },
            {
              label: this.$t('storage.text_96', [this.$t('dictionary.project')]),
              permission: 'buckets_perform_change_owner',
              action: row => {
                this.createDialog('ChangeOwenrDialog', {
                  name: i18n.t('storage.text_18'),
                  data: [row],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  resource: 'buckets',
                })
              },
              meta: (obj) => {
                if (obj.is_public) {
                  return {
                    validate: false,
                    tooltip: i18n.t('common_614'),
                  }
                }
                const ret = {
                  validate: false,
                  tooltip: '',
                }
                if (this.isProjectMode) {
                  ret.tooltip = i18n.t('common_601')
                  return ret
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: i18n.t('storage.text_205'),
              action: row => {
                this.createDialog('SetAntiLeechDialog', {
                  data: [row],
                  name: i18n.t('storage.text_18'),
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
            },
            {
              label: i18n.t('storage.text_183'),
              action: row => {
                this.$router.push({
                  path: '/bucket/setstaticwebsit',
                  query: {
                    id: row.id,
                  },
                })
              },
            },
            {
              label: i18n.t('storage.text_36'),
              permission: 'buckets_delete',
              action: row => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [row],
                  columns: this.columns,
                  title: i18n.t('storage.text_36'),
                  name: i18n.t('storage.text_18'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: (row) => this.$getDeleteResult(row),
            },
          ]
        },
      },
    ]
  },
}
