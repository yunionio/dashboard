import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
} from '@/utils/common/tableFilter'
import { sizestr } from '@/utils/utils'

export default {
  data () {
    return {
      diskProps: {
        list: this.$list.createList(this, {
          resource: 'disks',
          getParams: {
            tenant: this.params.data[0]?.tenant_id,
            filter: 'status.in(\'ready\')',
            unused: false,
            brand: ['Aliyun', 'OneCloud', 'Qcloud'],
          },
          filterOptions: {
            name: getNameFilter(),
          },
        }),
        columns: [
          getNameDescriptionTableColumn({
            onManager: this.onManager,
            hideField: true,
            formRules: [
              { required: true, message: this.$t('compute.text_210') },
              { validator: this.$validate('resourceCreateName') },
            ],
            slotCallback: row => {
              return (
                <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
              )
            },
          }),
          getStatusTableColumn({ statusModule: 'disk' }),
          {
            field: 'disk_size',
            title: this.$t('table.title.disk_size'),
            minWidth: 50,
            formatter: ({ cellValue }) => {
              return sizestr(cellValue, 'M', 1024)
            },
          },
          {
            field: 'disk_type',
            title: this.$t('table.title.disk_type'),
            width: 70,
            formatter: ({ cellValue }) => {
              return cellValue === 'sys' ? this.$t('compute.text_49') : this.$t('compute.text_50')
            },
          },
          {
            field: 'guest',
            title: this.$t('res.server'),
            minWidth: 100,
            showOverflow: 'ellipsis',
            slots: {
              default: ({ row }, h) => {
                if (!row.guest || row.guests.length <= 0) return '-'
                const guests = row.guests.map((guest, index) => {
                  return <side-page-trigger permission="server_get" name="VmInstanceSidePage" id={guest.id} vm={this} tab="vm-instance-detail">
                    {guest.name}
                    <status status={ guest.status } statusModule='server'/>
                  </side-page-trigger>
                })
                return [
                  <div>
                    { guests }
                  </div>,
                ]
              },
            },
          },
          getBrandTableColumn(),
        ],
      },
    }
  },
}
