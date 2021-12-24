<template>
  <div class="d-flex res-topology vpc-topology">
    <div class="c-left">
      <res-vpc name="vpc01" />
    </div>
    <div class="c-right">
      <ul class="list">
        <li class="item d-flex">
          <res-ipsubnet v-if="!physical" name="ipsubnet" desc="192.168.1.0/24" />
          <res-wire v-else :physical="physical" name="wire" />
          <template v-if="!physical">
            <res-common type="lb" name="lb01" />
            <res-common type="rds" name="rds02" />
            <res-common type="rds" name="rds01" />
            <res-common type="rds" name="rds01" />
            <res-common type="rds" name="rds01" />
            <res-common type="rds" name="rds01" />
            <res-common type="rds" name="rds01" />
            <res-common type="rds" name="rds01" />
          </template>
          <template v-else>
            <res-common type="host" name="host" />
            <res-common type="host" name="host" />
            <res-common type="host" name="host" />
            <res-common type="host" name="host" />
          </template>
        </li>
        <li class="item d-flex">
          <res-ipsubnet v-if="!physical" name="ipsubnet" desc="192.168.1.0/24" />
          <res-wire v-else :physical="physical" name="wire" />
          <template v-if="!physical">
            <res-common type="lb" name="lb01" />
            <res-common type="rds" name="rds02" />
            <res-common type="rds" name="rds01" />
            <res-common type="rds" name="rds01" />
            <res-common type="rds" name="rds01" />
          </template>
          <template v-else>
            <res-common type="host" name="host" />
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ResVpc from '../ResVpc'
import ResWire from '../ResWire'
import ResIpsubnet from '../ResIpsubnet'
import ResCommon from '../ResCommon'

export default {
  name: 'VpcTopology',
  components: {
    ResVpc,
    ResWire,
    ResIpsubnet,
    ResCommon,
  },
  props: {
    physical: Boolean,
    dataSource: Object,
  },
  data () {
    return {}
  },
}
</script>

<style lang="scss" scoped>
@import "../index.scss";
</style>
