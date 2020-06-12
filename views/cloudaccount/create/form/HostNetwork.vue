<template>
  <a-form :form="form.fc" v-bind="formLayout">
    <prepare-nets :prepareNetData="prepareNetData" type="host" />
    <prepare-nets-form :form="form" :prepareNetData="prepareNetData" type="host" />
  </a-form>
</template>

<script>
import PrepareNets from '../components/PrepareNets'
import PrepareNetsForm from '../components/PrepareNetsForm'
import createMixin from './components/createMixin'

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
