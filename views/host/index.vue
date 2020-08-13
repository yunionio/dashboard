<template>
  <div>
    <page-header :title="$t('dictionary.host')" />
    <page-body>
      <server-error-status-tab
        resource="hosts"
        @getStatusCheckArr="getStatusCheckArr" />
      <host-list :get-params="listParams" :id="listId" />
    </page-body>
  </div>
</template>

<script>
import HostList from './components/List'
import ServerErrorStatusTab from '@Compute/sections/ServerErrorStatusTab'
export default {
  name: 'HostIndex',
  components: {
    HostList,
    ServerErrorStatusTab,
  },
  data () {
    return {
      listId: 'HostList',
      listParams: {
        details: true,
        baremetal: false,
      },
    }
  },
  methods: {
    getStatusCheckArr (statusCheckArr, statusArr, isFirstLoad) {
      if (statusCheckArr && statusCheckArr.length > 0) {
        this.filterParams = {
          statusCheckArr: statusCheckArr,
          statusArr: statusArr,
          isFirstLoad: isFirstLoad,
        }
      } else {
        this.filterParams = {
          statusCheckArr: [],
        }
      }
    },
  },
}
</script>
