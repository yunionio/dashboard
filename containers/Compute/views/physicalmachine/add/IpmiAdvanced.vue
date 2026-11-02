<template>
  <advance-config-block collapsible>
    <a-form-item :label="$t('compute.ipmi_port')" :extra="$t('compute.ipmi_port_extra')">
      <a-input-number
        v-decorator="decorators.ipmi_port"
        :min="1"
        :max="65535"
        :precision="0"
        style="width: 200px" />
    </a-form-item>
    <a-form-item :label="$t('compute.ipmi_redfish_port')" :extra="$t('compute.ipmi_redfish_port_extra')" class="mb-0">
      <a-input-number
        v-decorator="decorators.ipmi_redfish_port"
        :min="1"
        :max="65535"
        :precision="0"
        style="width: 200px" />
    </a-form-item>
  </advance-config-block>
</template>

<script>
export default {
  name: 'PhysicalmachineIpmiAdvanced',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
  },
}
</script>
