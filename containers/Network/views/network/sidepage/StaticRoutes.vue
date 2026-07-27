<template>
  <div>
    <div class="mb-2">
      <a-button type="primary" @click="handleSetStaticRoutes">{{ $t('network.set_static_routes') }}</a-button>
    </div>
    <vxe-grid
      :data="routeList"
      :columns="listColumns"
      resizable>
      <template v-slot:empty>
        <loader :loading="false" />
      </template>
    </vxe-grid>
  </div>
</template>

<script>
import {
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

const parseStaticRoutes = (metadata = {}) => {
  const meta = metadata.static_routes
  if (!meta) return []
  try {
    const routes = typeof meta === 'string' ? JSON.parse(meta) : meta
    if (Array.isArray(routes)) {
      return routes.map((item, index) => {
        if (Array.isArray(item)) {
          return { id: `${item[1]}-${index}`, cidr: item[1], gateway: item[0] }
        }
        return { id: `${item.net || item.cidr}-${index}`, cidr: item.net || item.cidr, gateway: item.gw || item.gateway }
      }).filter(item => item.cidr && item.gateway)
    }
    return Object.keys(routes || {}).map((cidr, index) => ({
      id: `${cidr}-${index}`,
      cidr,
      gateway: routes[cidr],
    }))
  } catch (e) {
    return []
  }
}

export default {
  name: 'StaticRoutes',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    columns: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      listColumns: [
        getCopyWithContentTableColumn({
          field: 'cidr',
          title: this.$t('network.static_routes.net'),
        }),
        getCopyWithContentTableColumn({
          field: 'gateway',
          title: this.$t('network.static_routes.gw'),
        }),
      ],
    }
  },
  computed: {
    routeList () {
      return parseStaticRoutes(this.data.metadata)
    },
  },
  methods: {
    handleSetStaticRoutes () {
      this.createDialog('SetStaticRoutesDialog', {
        data: [this.data],
        columns: this.columns,
        listData: this.routeList,
        ok: () => {
          this.$emit('updateDetail')
          this.$emit('refresh')
        },
      })
    },
  },
}
</script>
