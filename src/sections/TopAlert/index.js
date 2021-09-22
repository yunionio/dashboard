import * as R from 'ramda'
import { mapGetters } from 'vuex'
import storage from '@/utils/storage'

export default {
  name: 'TopAlert',
  computed: {
    ...mapGetters(['common']),
    topAlert () {
      return this.common.topAlert || {}
    },
  },
  methods: {
    renderMessageChildren (messageOptions = []) {
      return messageOptions.map(item => {
        if (R.is(Array, item)) {
          return this.$createElement(...R.clone(item))
        }
        return this.$createElement('span', item)
      })
    },
    renderMessage (key, { alertProps, messageOptions, interval = 1000 * 60 * 60 * 24 } = {}) {
      return this.$createElement('a-alert', {
        class: 'mb-2',
        props: {
          type: 'warning',
          closable: true,
          ...alertProps,
        },
        on: {
          close: () => {
            const storageTopAlert = storage.get('topAlert') || {}
            const newStorageTopAlert = { ...storageTopAlert }
            newStorageTopAlert[key] = this.$moment().valueOf() + interval
            storage.set('topAlert', newStorageTopAlert)
          },
        },
        scopedSlots: {
          message: () => {
            return this.renderMessageChildren(messageOptions)
          },
        },
      })
    },
  },
  render () {
    if (!R.isEmpty(this.topAlert) && !R.isNil(this.topAlert)) {
      const items = []
      const storageTopAlert = storage.get('topAlert') || {}
      R.forEachObjIndexed((value, key) => {
        const time = storageTopAlert[key]
        if (!time || this.$moment().valueOf() > time) {
          if (key === 'apiServer') {
            const url = value.messageOptions[1][2]
            if (url !== location.origin) {
              const message = this.renderMessage(key, value)
              items.push(message)
            }
          } else {
            const message = this.renderMessage(key, value)
            items.push(message)
          }
        }
      }, this.topAlert)
      return this.$createElement('div', { class: 'top-alert' }, items)
    }
    return null
  },
}
