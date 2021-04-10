<template>
  <zone-list :getParams="getParams" :disable-create="data.provider !== 'OneCloud'" id="ZoneListForCloudregionSidePage" />
</template>

<script>
import ZoneList from '@Cloudenv/views/zone/components/List'

export default {
  name: 'ZoneListForCloudregion',
  components: {
    ZoneList,
  },
  props: {
    resId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      getParams: {
        details: true,
        with_meta: true,
        cloud_env: 'private_or_onpremise',
        cloudregion_id: this.resId,
      },
    }
  },
}
</script>
