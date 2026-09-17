!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [396],
    {
      73199: function (a, n, e) {
        e(67294);
        var s = e(71515),
          c = e(96856),
          l = e(85893);
        function t(a) {
          var n = a.list,
            e = a.value,
            t = a.children,
            i = a.className,
            o = void 0 === i ? "" : i,
            r = a.onChange,
            u = void 0 === r ? function () {} : r,
            d = function (a) {
              return (
                e == a.tag_id ||
                e == a.value ||
                e == a.plusValue ||
                e == a.minusValue
              );
            };
          return (0, l.jsxs)(s.G7, {
            className: (0, c.AK)("sp-tag-bar", o),
            children: [
              (0, l.jsx)(s.G7, {
                className: "tag-bar-hd",
                children: (0, l.jsx)(s.pf, {
                  className: "tag-container",
                  enableFlex: !0,
                  scrollX: !0,
                  enhanced: !0,
                  "show-scrollbar": !1,
                  style: (0, c.Tu)({ width: t ? "95%" : "100%" }),
                  children: (0, l.jsx)(s.G7, {
                    className: "tag-container-flex",
                    children:
                      null == n
                        ? void 0
                        : n.map(function (a, n) {
                            return (0, l.jsxs)(
                              s.G7,
                              {
                                className: (0, c.AK)("tag-item", {
                                  active: d(a),
                                }),
                                onClick: function () {
                                  u(n, a);
                                },
                                children: [
                                  a.tag_name,
                                  a.num ? "(".concat(a.num, ")") : "",
                                ],
                              },
                              "tag-item__".concat(n)
                            );
                          }),
                  }),
                }),
              }),
              (0, l.jsx)(s.G7, { className: "tag-bar-ft", children: t }),
            ],
          });
        }
        (t.options = { addGlobalClass: !0 }), (n.Z = t);
      },
    },
  ]);
})();
