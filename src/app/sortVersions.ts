/**
 * Sort logic for versions used by help.sap.com
 */
export default function sortVersions(e) {
  for (var t: any = [], n = [], r = 0, a = 0; a < e.length; a++) {
    var i = e[a];
    if (!/^(\d+\.)*\d+$/.test(i)) {
      var t = e.sort().reverse();
      return t.slice(0)
    }
    for (var o = i.split("."), s = 0; s < o.length; s++)
      o[s] = parseInt(o[s]);
    var l = {
      version: i,
      tokens: o
    };
    o.length > r && (r = o.length),
      n.push(l)
  }
  for (a = 0; a < n.length; a++)
    for (; n[a].tokens.length < r;)
      n[a].tokens.push(0);
  return n.sort(function (e, t) {
    for (var n = e.tokens, r = t.tokens, a = 0; a < n.length; a++) {
      if (n[a] === r[a] && a === n.length - 1)
        return 0;
      if (n[a] !== r[a])
        return n[a] > r[a] ? -1 : 1
    }
  }),
    t = n.map(function (e) {
      return e.version
    }),
    t.slice(0)
}
