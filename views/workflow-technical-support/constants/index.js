import i18n from '@/locales'

export const statusMap = {
  OPEN: {
    text: i18n.t('common.workflow.open'),
    color: '#f6a100',
  },
  PENDING: {
    text: i18n.t('common.workflow.pending'),
    color: '#7ed321',
  },
  IN_PROGRESS: {
    text: i18n.t('common.workflow.in_progress'),
    color: '#8a94a6',
  },
  REOPEN: {
    text: i18n.t('common.workflow.reopen'),
    color: '#f6a100',
  },
  CLOSED: {
    text: i18n.t('common.workflow.closed'),
    color: '#f6a100',
  },
}
