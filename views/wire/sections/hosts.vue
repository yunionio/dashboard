<template>
  <div style="padding-top: 15px" v-if="hosts.length > 0">
    <span style="font-size: larger;font-weight: bold;">{{ $t('network.wire.hosts') + ': ' }}</span>
    <a-tag class="mb-2" v-for="item in hosts" :key="item.id">{{ item.name }}</a-tag>
  </div>
</template>

<script>
export default {
  name: 'HostColumn',
  props: {
    hosts: {
      type: [],
      required: true,
    },
  },
}
</script>
