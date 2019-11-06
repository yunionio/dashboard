<template>
  <div>
    <page-header title="主机组" />
    <page-body>
      <instance-group-list />
    </page-body>
  </div>
</template>

<script>
import InstanceGroupList from './components/List'

export default {
  name: 'InstanceGroupIndex',
  components: {
    InstanceGroupList,
  },
}
</script>
