<template>
  <a-form :form="form.fc" v-bind="formLayout">
    <prepare-nets :prepareNetData="prepareNetData" type="guest" />
    <prepare-nets-form :form="form" :prepareNetData="prepareNetData" type="guest" />
  </a-form>
</template>

<script>
import createMixin from './components/createMixin'
import PrepareNets from '../components/PrepareNets'
import PrepareNetsForm from '../components/PrepareNetsForm'

export default {
  name: 'GuestNetworkCreate',
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
