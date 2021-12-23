<template>
  <div class="d-flex">
    <div class="c-left">
      <res-vpc name="vpc01" />
      <res-wire name="wire01" />
    </div>
    <div class="c-right">
      <ul class="list">
        <li class="item d-flex">
          <res-ipsubnet name="ipsubnet" desc="192.168.1.0/24" />
          <res-common type="vminstance" name="vmtest" :multiple="true" />
          <res-common type="lb" name="lb01" />
          <res-common type="rds" name="rds01" />
        </li>
        <li class="item d-flex">
          <res-ipsubnet name="ipsubnet" desc="192.168.1.0/23" />
          <res-common type="vminstance" name="vmtest2" />
          <res-common type="lb" name="lb02" />
          <!-- <res-common type="rds" name="rds02" /> -->
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ResVpc from './ResVpc'
import ResWire from './ResWire'
import ResIpsubnet from './ResIpsubnet'
import ResCommon from './ResCommon'

export default {
  name: 'WireTopology',
  components: {
    ResVpc,
    ResWire,
    ResIpsubnet,
    ResCommon,
  },
  data () {
    return {}
  },
}
</script>

<style lang="scss" scoped>
@import "index.scss";
</style>
