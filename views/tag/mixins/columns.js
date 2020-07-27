import i18n from '@/locales'
export default {
  created () {
    this.columns = [
      {
        field: 'key',
        title: i18n.t('cloudenv.text_473'),
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            let trigger = <a onClick={() => this.handleOpenSidepage(row)}>{ row.name }</a>
            // let trigger = <a onClick={ () => this.replaceSidePage('TagSidePage', { resId: row.id, data: row, windowData: this.windowData }) }>{ row.name }</a>
            if (this.$options.name !== 'TagList') {
              trigger = <span>{ row.name }</span>
            }
            return [
              <list-body-cell-wrap copy field='name' row={row} hideField>{ trigger }</list-body-cell-wrap>,
            ]
          },
        },
      },
      {
        field: 'count',
        title: i18n.t('cloudenv.text_474'),
        minWidth: 60,
        formatter: ({ row }) => {
          return `${row.count || 0}`
        },
      },
      {
        field: 'color',
        title: i18n.t('cloudenv.text_475'),
        width: 60,
        slots: {
          default: ({ row }) => {
            return [<span style={{ display: 'inline-block', backgroundColor: row.color, width: '10px', height: '10px' }} />]
          },
        },
      },
    ]
  },
}
