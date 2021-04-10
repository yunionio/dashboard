<template>
  <a-form class="mb-4  d-flex" v-if="ruleOpts.length > 0">
    <div class="pr-2">
      <a-radio-group v-model="type" @change="handleTypeChange">
        <a-radio-button :value="1">{{$t('network.text_138')}}</a-radio-button>
        <a-radio-button :value="2">{{$t('network.text_141')}}</a-radio-button>
      </a-radio-group>
    </div>
    <div style="width: 240px" v-if="type === 2">
      <a-select :placeholder="$t('network.text_486')" @change="handleRuleChange">
        <a-select-option v-for="item in ruleOpts" :key="item.id" :value="item.id" :row="item">{{item.name}}</a-select-option>
      </a-select>
    </div>
  </a-form>
</template>

<script>
export default {
  name: 'LbRuleDashboardFilterForm',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      type: 1,
      ruleOpts: [],
    }
  },
  created () {
    this.qeuyrFetchRules()
  },
  methods: {
    handleRuleChange (id, vnode) {
      if (vnode && vnode.data && vnode.data.attrs) {
        const { row = {} } = vnode.data.attrs
        row.type = this.type
        row.listener_type = this.data.listener_type
        this.$emit('change', row)
      }
    },
    handleTypeChange ({ target }) {
      if (target.value === 1) {
        this.$emit('change', undefined)
      }
    },
    async qeuyrFetchRules () {
      this.loading = true
      const manager = new this.$Manager('loadbalancerlistenerrules')
      try {
        const params = {
          limit: 0,
          scope: this.$store.getters.scope,
          listener: this.data.id,
        }
        const { data = {} } = await manager.list({ params })
        this.ruleOpts = (data.data || [])
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
