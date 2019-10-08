<template>
  <div>
    <page-header title="宿主机" />
    <page-body>
      <host-list />
    </page-body>
  </div>
</template>

<script>
import HostList from './components/List'

export default {
  name: 'HostIndex',
  components: {
    HostList,
  },
}
</script>
