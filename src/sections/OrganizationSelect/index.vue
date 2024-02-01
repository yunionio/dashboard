<template>
  <base-select
    v-model="selected"
    :select-props="{placeholder:$t('common.tips.select', [$t('bill.organization_level')]), ...otherProps}"
    @change="selecteChange">
    <template slot="optionTemplate">
      <a-select-option v-for="(item, index) in orgNodeOpts" :key="index" :value="item.id">
        <span class="oc-selected-display-none" :style="{paddingLeft: `${(item.level - 1) * 15}px`}" />{{ item.name }}
      </a-select-option>
    </template>
  </base-select>
</template>

<script>
export default {
  name: 'OrganizationSelect',
  props: {
    multiple: {
      type: Boolean,
      default: true,
    },
    value: {
      type: Array || String,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      selected: this.value,
      orgNodeOpts: [],
    }
  },
  computed: {
    otherProps () {
      if (this.multiple) {
        return { mode: 'multiple' }
      }
      return {}
    },
  },
  watch: {
    params: {
      handler: function () {
        this.fetchData()
      },
      deep: true,
    },
  },
  created () {
    this.$rM = new this.$Manager('organizations', 'v1')
    this.$oM = new this.$Manager('organization_nodes', 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      try {
        const orgs = await this.$rM.list({
          params: {
            scope: this.$store.getters.scope,
            enabled: true,
          },
        })
        const { data: orgList = [] } = orgs.data
        if (!orgList.length) {
          this.orgNodeOpts = []
          return
        }
        const res = await this.$oM.list({
          params: {
            org_id: orgList[0].id,
            ...this.params,
          },
        })
        const { data = [] } = res.data
        data.sort((a, b) => {
          if (a.level === b.level) {
            return a.weight - b.weight
          }
          return a.level - b.level
        })
        const ret = []
        data.map(item => {
          if (item.level === 1) {
            ret.push(item)
          } else {
            const idx = ret.findIndex(i => item.level - 1 === i.level && item.full_label.includes(i.full_label))
            if (idx > -1) {
              ret.splice(idx + 1, 0, item)
            }
          }
        })
        this.orgNodeOpts = ret
      } catch (err) {}
    },
    selecteChange (val) {
      this.$emit('change', val)
    },
  },
}
</script>
