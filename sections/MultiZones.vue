<template>
  <div>
    <a-form-item class="mb-0">
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
      selectedZones: this.defaultZones(),
    }
  },
  watch: {
    'form.fd.sku.replicas_num' () {
      this.selectedZones = this.defaultZones()
      this.form.fc.setFieldsValue({ slave_zones: this.selectedZones })
    },
    'form.fd.zone' () {
      this.selectedZones = this.defaultZones()
      this.form.fc.setFieldsValue({ slave_zones: this.selectedZones })
    },
  },
  methods: {
    defaultZones () {
      const selectedZones = []
      const mainZone = this.form.fd.zone || ''
      const replicasNumber = this.form.fd.sku.replicas_num || 0
      for (let i = 0; i < replicasNumber; i++) {
        selectedZones.push(mainZone)
      }
      return selectedZones
    },
    onChange () {
      this.form.fc.setFieldsValue({ slave_zones: this.selectedZones })
    },
  },
}
</script>

<style scoped>

</style>
