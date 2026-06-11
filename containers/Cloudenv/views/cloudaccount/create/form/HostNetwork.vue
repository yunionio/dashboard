<template>
  <a-form :form="form.fc" v-bind="formLayout">
    <prepare-nets :prepareNetData="prepareNetData" type="host" />
    <prepare-nets-form :form="form" :prepareNetData="prepareNetData" type="host" />
  </a-form>
</template>

<script>
import createMixin from './components/createMixin'
import PrepareNets from '../components/PrepareNets'
import PrepareNetsForm from '../components/PrepareNetsForm'

export default {
  name: 'HostNetworkCreate',
  components: {
    PrepareNets,
    PrepareNetsForm,
  },
  mixins: [createMixin],
  props: {
    prepareNetData: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      keepAliveFields: true,
    }
  },
}
</script>
