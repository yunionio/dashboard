<template>
  <div>
   <page-header title="预留IP" />
   <page-body>
     <reserved-ip-list />
   </page-body>
  </div>
</template>

<script>
import ReservedIpList from './components/List'

export default {
  name: 'ReservedIPIndex',
  components: {
    ReservedIpList,
  },
}
</script>
