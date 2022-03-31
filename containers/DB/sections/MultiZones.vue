<template>
  <div>
    <a-form-item class="mb-0">
      <a-checkbox :value="checked" @change="onChecked">
        {{ $t('db.redis.replicas_zones') }}
      </a-checkbox>
      <div v-for="(z, i) of this.selectedZones" :key="i">
        <span>{{ $t('db.redis.replicas', [i + 1]) + '  ' }}</span>
        <base-select
            class="w-50"
            v-model="selectedZones[i]"
            isDefaultSelect
            filterable
            :key="'slave_zone_'+i+z"
            :options="options"
            @change="onChange"
            style="display: inline-block;" />
      </div>
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'MultiZones',
  props: {
    form: {
      type: Object,
    },
    options: {
      type: Array,
    },
  },
  data () {
    return {
      checked: false,
      selectedZones: undefined,
    }
  },
  watch: {
    'form.fd.sku.replicas_num' () {
      this.resetZones()
    },
    'form.fd.zone' () {
      this.resetZones()
    },
  },
  methods: {
    getDefaultSelectZone (mainZone) {
      const options = this.options.filter(v => v.id !== mainZone)
      if (options && options.length > 0) {
        return options[0].id
      }
    },
    resetZones () {
      if (!this.checked) {
        this.selectedZones = undefined
      } else {
        const selectedZones = []
        const mainZone = this.form.fd.zone || ''
        const defaultSelectZone = this.getDefaultSelectZone(mainZone)
        const replicasNumber = this.form.fd.sku.replicas_num || 0
        for (let i = 0; i < replicasNumber; i++) {
          selectedZones.push(defaultSelectZone || mainZone)
        }
        this.selectedZones = selectedZones
      }
      this.form.fc.setFieldsValue({ slave_zones: this.selectedZones })
    },
    onChecked (v) {
      this.checked = v.target.checked
      this.resetZones()
    },
    onChange () {
      this.form.fc.setFieldsValue({ slave_zones: this.selectedZones })
    },
  },
}
</script>

<style scoped>

</style>
