export default {
  /**
   * Принимает кол-во и склонение тайтлов, возвращает правильное склонение в зависимости от кол-ва.
   *
   * @param {Integer} number
   * @param {Array<String>} titles
   * @returns {String}
   */
  declOfNum: function (number, titles) {
    let cases = [2, 0, 1, 1, 1, 2]
    return titles[
      number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]
    ]
  },
  lvlToString: function (lvl) {
    if (lvl === 0) return ''
    return ' +' + lvl
  }
}
