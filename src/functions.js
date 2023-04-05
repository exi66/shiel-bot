module.exports = {
  lvlToString: function(lvl) {
    if (lvl === 16 || lvl === 1) return 'I:';
    if (lvl === 17 || lvl === 2) return 'II:';
    if (lvl === 18 || lvl === 3) return 'III:';
    if (lvl === 19 || lvl === 4) return 'IV:';
    if (lvl === 20 || lvl === 5) return 'V:';
    if (lvl === 0) return '';
    return lvl;
  },
  escapeMarkdown: function (text) {
    let str = text.toString();
    let unescaped = str.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
    let escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, 
    return escaped;
  },
  declOfNum: function (number, titles) {
    let cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
  },
  formatDate: function (date) {
    return new Intl.DateTimeFormat('en-GB').format(date);
  },
};
