<template>
  <div>
    <page-header :title="$t('k8s.text_21')" />
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
