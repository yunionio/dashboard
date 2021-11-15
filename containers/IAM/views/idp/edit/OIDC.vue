<template>
  <div>
    <a-form-item label="ClientID">
      <a-input v-decorator="decorators.client_id" :placeholder="$t('common_525')" />
    </a-form-item>
    <a-form-item label="ClientSecret">
      <a-input v-decorator="decorators.client_secret" :placeholder="$t('common_526')" />
      <div slot="extra" v-bind="offsetWrapperCol">
        <a-checkbox v-model="isEndpoint">
          {{this.$t('common_557')}}
        </a-checkbox>
      </div>
    </a-form-item>
    <a-form-item v-if="isEndpoint" label="Endpoint">
      <a-input v-decorator="decorators.endpoint" :placeholder="$t('common_530')" />
    </a-form-item>
    <template v-else>
      <a-form-item label="Scopes">
        <a-input v-decorator="decorators.scopes" :placeholder="$t('common_531')" />
        <div class="align-items-center d-flex" style="line-height: 1">
          <span class="text-color-help flex-grow-1">{{$t('common_532')}}</span>
          <span class="text-right text-color-help">{{$t('compute.text_798', [ total ])}}</span> &nbsp; | &nbsp; <a-button @click="handleClearScopes" class="pl-0 pr-0" type="link">{{$t('compute.text_799')}}</a-button>
        </div>
      </a-form-item>
      <a-form-item label="AuthUrl">
        <a-input v-decorator="decorators.auth_url" :placeholder="$t('common_533')" />
      </a-form-item>
      <a-form-item label="TokenUrl">
        <a-input v-decorator="decorators.token_url" :placeholder="$t('common_534')" />
      </a-form-item>
      <a-form-item label="UserinfoUrl">
        <a-input v-decorator="decorators.userinfo_url" :placeholder="$t('common_535')" />
      </a-form-item>
    </template>
  </div>
</template>
<script>
export default {
  name: 'IdpEditOIDC',
  props: {
    fc: {
      type: Object,
    },
    fd: {
      type: Object,
      required: true,
    },
    offsetWrapperCol: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      isEndpoint: false,
      decorators: {
        client_id: ['client_id', {
          rules: [{ required: true, message: this.$t('common_525') }],
        }],
        client_secret: ['client_secret', {
          rules: [{ required: true, message: this.$t('common_526') }],
        }],
        endpoint: ['endpoint', {
          rules: [{ required: true, message: this.$t('common_530') }],
        }],
        scopes: ['scopes', {
          rules: [{ required: true, message: this.$t('common_531') }],
        }],
        auth_url: ['auth_url', {
          rules: [{ required: true, message: this.$t('common_533') }],
        }],
        token_url: ['token_url', {
          rules: [{ required: true, message: this.$t('common_534') }],
        }],
        userinfo_url: ['userinfo_url', {
          rules: [{ required: true, message: this.$t('common_535') }],
        }],
      },
    }
  },
  computed: {
    total () {
      const { scopes } = this.fd
      const lines = (scopes && scopes.split(/,/).filter((item) => item.length > 0)) || []
      return lines.length
    },
  },
  methods: {
    handleClearScopes () {
      this.fc.setFieldsValue({
        scopes: undefined,
      })
    },
  },
}
</script>
