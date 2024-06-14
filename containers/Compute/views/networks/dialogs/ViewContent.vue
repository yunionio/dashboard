<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-empty v-if="isEmpty" />
      <a-tag
        v-for="(item, idx) in params.data"
        :key="idx"
        :color="colors[idx % 7]"
        class="mb-2"
        style="width: '250px'">
        <template v-if="isNetwork">
          {{ item.ip_addr }}
        </template>
        <template v-else-if="isPort">
          {{$t('compute.port_mappings.port.title')}}: {{item.port}} = {{$t('compute.port_mappings.host_port.title')}}: {{item.host_port}} ({{item.protocol.toUpperCase()}})
        </template>
      </a-tag>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ViewContentDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      colors: ['pink', 'red', 'orange', 'green', 'cyan', 'blue', 'purple'],
    }
  },
  computed: {
    isEmpty () {
      return !this.params.data?.length > 0
    },
    isNetwork () {
      return this.params.type === 'network'
    },
    isPort () {
      return this.params.type === 'port'
    },
  },
  methods: {},
}
</script>
