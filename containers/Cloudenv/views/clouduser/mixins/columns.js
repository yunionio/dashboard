import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: this.$t('cloudenv.clouduser_list_t1'),
        edit: false,
        slotCallback: row => {
          return (
            <side-page-trigger
              permission='clouduser_get'
              name='ClouduserSidePage'
              id={row.id}
              list={this.list}
              vm={this}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn({
        field: 'is_console_login',
        title: this.$t('cloudenv.clouduser_list_t5'),
        minWidth: 100,
      }),
      getStatusTableColumn({ statusModule: 'clouduser' }),
      {
        field: 'password',
        title: this.$t('cloudenv.clouduser_list_t2'),
        width: 50,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={ row.id } resourceType='cloudusers' />]
          },
        },
      },
      {
        field: 'iam_login_url',
        title: this.$t('cloudenv.clouduser_list_t3'),
        minWidth: 120,
        showOverflow: 'title',
        slots: {
          default: ({ row }) => {
            if (!row.iam_login_url) return '-'
            return [<help-link href={ row.iam_login_url } />]
          },
        },
      },
      getCopyWithContentTableColumn({
        field: 'owner_name',
        title: this.$t('cloudenv.clouduser_list_t4'),
      }),
      getBrandTableColumn({ field: 'provider' }),
      getCopyWithContentTableColumn({
        field: 'cloudaccount',
        title: this.$t('common.text00108'),
      }),
      getCopyWithContentTableColumn({
        field: 'manager',
        title: this.$t('common_624', [this.$t('dictionary.cloudprovider')]),
      }),
    ]
  },
}
