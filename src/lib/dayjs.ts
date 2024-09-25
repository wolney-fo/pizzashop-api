import dayjs from 'dayjs'
import 'dayjs/locale/en-ca'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.locale('en-ca')
dayjs.extend(LocalizedFormat)

export default dayjs
