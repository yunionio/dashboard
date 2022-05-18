import { getDocsUrl } from '@/utils/utils'
import i18n from '@/locales'

// 认证源认证类型帮助文档链接
export function docs (scope) {
  const docsUrl = getDocsUrl(scope)
  const idpUrl = `${docsUrl}auth_security/iam/tutorial/idp`
  return {
    // google_oidc: `${idpUrl}/#${i18n.t('system.google_oidc_doc')}`,
    github_oidc: `${idpUrl}/create_oidc/#${i18n.t('system.github_oidc_doc')}`,
    azure_oidc: `${idpUrl}/create_oidc/#${i18n.t('system.azure_oidc_doc')}`,
    azure_ad_saml: `${idpUrl}/create_saml/#${i18n.t('system.azure_ad_saml_doc')}`,
    saml: `${idpUrl}/create_saml/#${i18n.t('system.saml_doc')}`,
    feishu_oauth2: `${idpUrl}/create_oauth2/#${i18n.t('system.feishu_oauth2_doc')}`,
    dingtalk_oauth2: `${idpUrl}/create_oauth2/#${i18n.t('system.dingtalk_oauth2_doc')}`,
    qywechat_oauth2: `${idpUrl}/create_oauth2/#${i18n.t('system.qywechat_oauth2_doc')}`,
  }
}
