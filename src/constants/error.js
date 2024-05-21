import i18n from '@/locales'

export default {
  ForbiddenError: i18n.t('error_title.ForbiddenError'),
  NotFoundError: i18n.t('notify.NotFoundError'),
  IncorrectUsernameOrPassword: i18n.t('notify.IncorrectUsernameOrPassword'),
  InvalidCredentialError: i18n.t('notify.InvalidCredentialError'),
  TooManyFailedAttempts: i18n.t('notify.TooManyFailedAttempts'),
  InputParameterError: i18n.t('notify.InputParameterError'),
  UserLocked: i18n.t('notify.UserLocked'),
  InvalidIdpStatus: i18n.t('notify.InvalidIdpStatus'),
  DuplicateNameError: i18n.t('notify.DuplicateNameError'),
}

export const DETAIL_ERRMSG = {
  findUserByMobile: i18n.t('notify.FindUserByMobile'),
  TooManyFailedAttempts: i18n.t('notify.TooManyFailedAttempts'),
  WrongCaptchaLength: i18n.t('notify.WrongCaptchaLength'),
  InvalidIdpStatus: i18n.t('notify.InvalidIdpStatusDetail'),
}
