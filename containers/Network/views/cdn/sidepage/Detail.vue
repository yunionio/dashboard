<template>
  <detail
    :on-manager="onManager"
    :data="data"
    resource="cdn_domains"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="cdnDomain" />
</template>

<script>

import { mapGetters } from 'vuex'
import i18n from '@/locales'
import { getAreaColumn, getServiceTypeColumn, getCnameTableColumn, getDomainTableColumn } from '../mixins/columns'
import {
  getUserTagColumn,
} from '@/utils/common/detailColumn'
import {
  getPublicScopeTableColumn,
  getBrandTableColumn,
  getSwitchTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

const emptyTableColumn = {
  field: '',
  title: ' ',
  slots: {
    default: () => {
      return ' '
    },
  },
}

const getTypeTableColumn = (item) => {
  return {
    field: 'type',
    title: i18n.t('network.cdn.source_type'),
    slots: {
      default: () => {
        if (item.type) {
          return i18n.te(`network.cdn.origin_type.${item.type}`) ? i18n.t(`network.cdn.origin_type.${item.type}`) : item.type
        }
        return '-'
      },
    },
  }
}

const getOriginTableColumn = (item) => {
  return {
    field: 'origin',
    title: i18n.t('network.cdn.source_origin'),
    slots: {
      default: () => {
        return item.origin || '-'
      },
    },
  }
}

const getProtocolTableColumn = (item) => {
  return {
    field: 'protocol',
    title: i18n.t('network.cdn.source_protocol'),
    slots: {
      default: () => {
        return item.protocol || '-'
      },
    },
  }
}

const getServerNameTableColumn = (item) => {
  return {
    field: 'server_name',
    title: i18n.t('network.cdn.source_server_name'),
    slots: {
      default: () => {
        return item.server_name || '-'
      },
    },
  }
}

export default {
  name: 'CdnDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'cdn_domains', columns: () => this.columns, tipName: this.$t('dictionary.cdn_domain') }),
        getPublicScopeTableColumn({ vm: this, resource: 'cdn_domains' }),
        getBrandTableColumn(),
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
    originItem () {
      const originItem = {
        title: this.$t('network.cdn.source_station'),
        items: [],
      }
      const { origins = [] } = this.data
      if (!origins.length) return []
      origins.map(item => {
        originItem.items.push(getTypeTableColumn(item))
        originItem.items.push(getProtocolTableColumn(item))
        originItem.items.push(getOriginTableColumn(item))
        originItem.items.push(getServerNameTableColumn(item))
        originItem.items.push(emptyTableColumn)
      })
      return [originItem]
    },
    extraInfo () {
      return [
        {
          title: this.$t('network.text_308'),
          items: [
            getAreaColumn(),
            getServiceTypeColumn(),
            getCnameTableColumn({}),
            getDomainTableColumn({}),
          ],
        },
        ...this.originItem,
        {
          title: this.$t('network.text_38'),
          items: [
            getSwitchTableColumn({
              field: 'disable_delete',
              title: this.$t('common.text00076'),
              disabled: !this.isOwner(this.data),
              change: val => {
                this.onManager('update', {
                  id: this.data.id,
                  managerArgs: {
                    data: { disable_delete: val },
                  },
                })
              },
            }),
          ],
        },
      ]
    },
  },
  methods: {
    isOwner (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return false
    },
  },
}
</script>
