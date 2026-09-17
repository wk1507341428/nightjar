!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [2302],
    {
      67914: function (e, i, r) {
        var a = r(29439),
          c = r(67294),
          l = r(71515),
          s = r(85893);
        i.Z = function (e) {
          var i = e.minPrice,
            r = void 0 === i ? "" : i,
            n = e.maxPrice,
            t = void 0 === n ? "" : n,
            p = e.onChange,
            u = void 0 === p ? function () {} : p,
            o = (0, c.useState)(r),
            f = (0, a.Z)(o, 2),
            _ = f[0],
            d = f[1],
            x = (0, c.useState)(t),
            m = (0, a.Z)(x, 2),
            h = m[0],
            v = m[1];
          (0, c.useEffect)(
            function () {
              d(r), v(t);
            },
            [r, t]
          );
          return (0, s.jsx)(l.G7, {
            className: "price-filter",
            children: (0, s.jsxs)(l.G7, {
              className: "price-filter__range",
              children: [
                (0, s.jsxs)(l.G7, {
                  className: "price-filter__input-wrapper",
                  children: [
                    (0, s.jsx)(l.xv, {
                      className: "price-filter__currency",
                      children: "¥",
                    }),
                    (0, s.jsx)(l.II, {
                      className: "price-filter__input",
                      type: "digit",
                      placeholder: "自定义最低价",
                      value: _,
                      onInput: function (e) {
                        var i = e.detail.value;
                        d(i), u({ min: i, max: h });
                      },
                      placeholderClass: "price-filter__placeholder",
                    }),
                  ],
                }),
                (0, s.jsx)(l.xv, { className: "price-filter__separator" }),
                (0, s.jsxs)(l.G7, {
                  className: "price-filter__input-wrapper",
                  children: [
                    (0, s.jsx)(l.xv, {
                      className: "price-filter__currency",
                      children: "¥",
                    }),
                    (0, s.jsx)(l.II, {
                      className: "price-filter__input",
                      type: "digit",
                      placeholder: "自定义最高价",
                      value: h,
                      onInput: function (e) {
                        var i = e.detail.value;
                        v(i), u({ min: _, max: i });
                      },
                      placeholderClass: "price-filter__placeholder",
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
