<template>
  <base-select
    v-model="value"
    remote
    resource="domains"
    :params="domainParams"
    :select-props="{ placeholder: $t('rules.domain') }"
    @change="handleChange" />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DomainSelect',
  props: {
    value: String,
    label: String,
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters(['scope', 'userInfo']),
    userDomain () {
      return {
        id: this.userInfo.projectDomainId,
        name: this.userInfo.projectDomain,
      }
    },
    domainParams () {
      return {
        scope: this.scope,
        limit: 20,
        ...this.params,
      }
    },
  },
  beforeDestroy () {
  },
  created () {
  },
  methods: {
    handleChange (val) {
      this.$emit('change', val)
      this.$emit('input', val)
    },
  },
}
</script>
