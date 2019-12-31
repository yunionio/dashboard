<template>
  <div>
    <page-header title="宿主机" />
    <page-body>
      <host-list :get-params="listParams" :id="listId" />
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
  data () {
    return {
      listId: 'HostList',
      listParams: {
        details: true,
        baremetal: false,
      },
    }
  },
}
</script>
