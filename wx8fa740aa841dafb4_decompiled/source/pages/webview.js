!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [4280],
    {
      69282: function (n, e, r) {
        var t = r(32180),
          o = (r(67294), r(92954)),
          c = r(71515),
          a = r(85893);
        var u = function () {
          var n,
            e = (
              null === (n = (0, o.getCurrentInstance)().router) || void 0 === n
                ? void 0
                : n.params
            ).url,
            r = decodeURIComponent(e);
          return (0, a.jsx)(c.G7, {
            className: "page-webview-index",
            children: (0, a.jsx)(c.kh, { src: r }),
          });
        };
        Page(
          (0, t.createPageConfig)(
            u,
            "pages/webview",
            { root: { cn: [] } },
            {} || {}
          )
        );
      },
    },
    function (n) {
      n.O(0, [2107, 1216], function () {
        return (function (e) {
          return n((n.s = e));
        })(69282);
      }),
        n.O();
    },
  ]);
})();
