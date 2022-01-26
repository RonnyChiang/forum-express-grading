const dayjs = require('dayjs') // 載入 dayjs 套件
const { options } = require('../routes')
module.exports = {
  // 取得當年年份作為 currentYear 的屬性值，並導出
  currentYear: () => dayjs().year(),
  // 判斷當前使用者與欲管理使用者id相同
  isSelf: (a, b, options) => {
    if (a === b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  }
}

