import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('system.notify.topic.receiver.management'),
        action: (obj) => {
          this.sidePageTriggerHandle(this, 'NotifyTopicSidePage', {
            id: obj.id,
            resource: 'topics',
            apiVersion: 'v1',
            getParams: this.getParam,
          }, {
            list: this.list,
            tab: 'subscriber',
          })
        },
        meta: (obj) => {
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('system.text_225'),
        permission: 'topics_perform_enable',
        action: (obj) => {
          this.createDialog('DisableDialog', {
            title: i18n.t('system.text_225'),
            name: this.$t('dictionary.notify-topic'),
            columns: this.columns,
            data: [obj],
            ok: async () => {
              try {
                const response = await this.onManager('performAction', {
                  id: obj.id,
                  managerArgs: {
                    action: 'enable',
                  },
                })
                return response
              } catch (error) {
                throw error
              }
            },
          })
        },
        meta: (obj) => {
          return {
            validate: this.isAdminMode && !obj.enabled,
          }
        },
      },
      {
        label: i18n.t('system.text_226'),
        permission: 'topics_perform_disable',
        action: (obj) => {
          this.createDialog('DisableDialog', {
            title: i18n.t('system.text_226'),
            name: this.$t('dictionary.notify-topic'),
            columns: this.columns,
            data: [obj],
            ok: async () => {
              try {
                const response = await this.onManager('performAction', {
                  id: obj.id,
                  managerArgs: {
                    action: 'disable',
                  },
                })
                return response
              } catch (error) {
                throw error
              }
            },
          })
        },
        meta: (obj) => {
          return {
            validate: this.isAdminMode && obj.enabled,
          }
        },
      },
    ]
  },
}
