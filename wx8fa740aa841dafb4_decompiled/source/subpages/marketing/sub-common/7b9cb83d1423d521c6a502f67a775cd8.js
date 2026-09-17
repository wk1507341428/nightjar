!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [7677],
    {
      73926: function (e, n, i) {
        var t = i(74165),
          r = i(15861),
          a = i(29439),
          o = i(67294),
          s = i(71515),
          c = i(78061),
          d = i(96856),
          l = i(31707),
          u = i(80459),
          f = i(85893);
        n.Z = function (e) {
          var n = e.brands,
            i = void 0 === n ? [] : n,
            m = e.selectedBrands,
            _ = void 0 === m ? [] : m,
            p = e.onSelect,
            v = void 0 === p ? function () {} : p,
            x = e.initialDisplayCount,
            h = void 0 === x ? 12 : x,
            b = e.pIndex,
            g = (0, l.v9)(function (e) {
              return e.regionauth;
            }).regionauthInfo,
            w = void 0 === g ? {} : g,
            k = (0, o.useState)(!1),
            N = (0, a.Z)(k, 2),
            j = N[0],
            G = N[1],
            Z = j ? i : i.slice(0, h),
            C = i.length > h;
          return (0, f.jsx)(s.G7, {
            className: "brand-filter",
            children: (0, f.jsxs)(s.G7, {
              className: "brand-filter__grid",
              children: [
                null == Z
                  ? void 0
                  : Z.map(function (e, n) {
                      return (0, f.jsx)(
                        s.G7,
                        {
                          className: (0, d.AK)("brand-filter__item", {
                            "brand-filter__item--selected": _.some(function (
                              n
                            ) {
                              return n.id === e.id;
                            }),
                          }),
                          onClick: (0, r.Z)(
                            (0, t.Z)().mark(function i() {
                              return (0, t.Z)().wrap(function (i) {
                                for (;;)
                                  switch ((i.prev = i.next)) {
                                    case 0:
                                      return (
                                        (i.next = 2),
                                        (0, u.setFlowClickGio)({
                                          position: b,
                                          index: n + 1,
                                          moduleName_var: "商品标签筛选",
                                          title: e.name,
                                          regionauth_code:
                                            (null == w
                                              ? void 0
                                              : w.regionauth_code) || "-",
                                        })
                                      );
                                    case 2:
                                      v(e);
                                    case 3:
                                    case "end":
                                      return i.stop();
                                  }
                              }, i);
                            })
                          ),
                          children: e.name,
                        },
                        e.id
                      );
                    }),
                C &&
                  (0, f.jsxs)(s.G7, {
                    className: "brand-filter__item brand-filter__item--more",
                    onClick: function () {
                      G(!j);
                    },
                    children: [
                      "更多",
                      " ",
                      (0, f.jsx)(c.Ko, {
                        src: j ? "fv_expand_up.png" : "fv_expand_down.png",
                        className: "brand-filter__item-icon",
                        mode: "aspectFill",
                      }),
                    ],
                  }),
              ],
            }),
          });
        };
      },
    },
  ]);
})();
