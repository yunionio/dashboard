import { getStatusTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      {
        field: 'addr',
        title: i18n.t('network.text_213'),
        slots: {
          default: ({ row }, h) => {
            let text = '-'
            if (row.ip_addr) {
              text = row.ip_addr
            }
            if (row.ip6_addr) {
              text = row.ip6_addr
            }
            return [
              <list-body-cell-wrap row={{ text: text }} field="text" copy />,
            ]
          },
        },
      },
      getStatusTableColumn({ statusModule: 'reservedip' }),
      {
        field: 'notes',
        title: i18n.t('network.text_668'),
        minWidth: 100,
        slots: {
          default: ({ row }, h) => {
            return [
              h('list-body-cell-wrap', {
                props: {
                  formRules: [
                    { required: true, message: i18n.t('network.text_671') },
                  ],
                  row,
                  edit: true,
                  copy: true,
                  onManager: this.onManager,
                  field: 'notes',
                },
              }),
            ]
          },
        },
      },
      getTimeTableColumn({ field: 'expired_at', title: this.$t('network.reserved_ip.expire.title'), fromNow: true }),
      getTimeTableColumn(),
    ]
  },
}
