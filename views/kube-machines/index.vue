<template>
  <div>
    <page-header title="节点" />
    <page-body>
      <kubemachines-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import KubemachinesList from './components/List'

export default {
  name: 'KubemachinesIndex',
  components: {
    KubemachinesList,
  },
  data () {
    return {
      listId: 'KubemachinesList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
