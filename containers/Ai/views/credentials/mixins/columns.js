import {
  getCopyWithContentTableColumn,
  getEnabledTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  computed: {
    columns () {
      const { tag } = this.$vnode.componentOptions
      const secretColumn = {
        field: 'secret',
        title: 'Client Secret',
        hideField: true,
        width: 120,
        slots: {
          default: ({ row }, h) => {
            if (!row.blob) return '-'
            const blob = JSON.parse(row.blob)
            return [
              <a-popover>
                <template slot="content">
                  <div style="text-align: center;">
                    <div style="margin: 5px 0">{blob.secret}</div>
                    <copy class="ml-1" message={blob.secret} />
                  </div>
                </template>
                <a style="font-size:14px"><icon type="keypairs" /></a>
              </a-popover>,
            ]
          },
        },
      }
      if (tag === 'OpenIdList') {
        return [
          getCopyWithContentTableColumn({
            field: 'id',
            title: 'ClientID',
          }),
          secretColumn,
          getEnabledTableColumn(),
          getCopyWithContentTableColumn({
            field: 'blob',
            title: i18n.t('common_633'),
            hideField: true,
            slotCallback: (row) => {
              if (!row.blob) return '-'
              const blob = JSON.parse(row.blob)
              return blob.redirect_uri || '-'
            },
          }),
          getTimeTableColumn(),
        ]
      } else if (tag === 'EncryptKeyList') {
        return [
          getCopyWithContentTableColumn({
            field: 'id',
            title: i18n.t('scope.encrypt_key.title.id'),
          }),
          getCopyWithContentTableColumn({
            field: 'name',
            title: i18n.t('scope.encrypt_key.title.name'),
          }),
          getCopyWithContentTableColumn({
            field: 'blob',
            title: i18n.t('scope.encrypt_key.title.alg'),
            hideField: true,
            slotCallback: (row) => {
              if (!row.blob) return '-'
              const blob = JSON.parse(row.blob)
              return blob.alg.toUpperCase() || '-'
            },
          }),
          getEnabledTableColumn(),
          getTimeTableColumn(),
        ]
      }
      return [
        getCopyWithContentTableColumn({
          field: 'id',
          title: 'ID',
        }),
        secretColumn,
        getEnabledTableColumn(),
        getTimeTableColumn(),
      ]
    },
  },
}
