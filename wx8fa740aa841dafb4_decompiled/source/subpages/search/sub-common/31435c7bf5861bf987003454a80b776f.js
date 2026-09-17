!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [4508],
    {
      38012: function (t, e, i) {
        var n = i(29439),
          o = i(67294),
          r = i(71515),
          l = i(96856),
          c = i(90057),
          s = i(80459),
          a = i(31707),
          u = i(78061),
          d = i(85893),
          f = { curIdx: 0, sortOrder: 1 };
        function _(t) {
          var e = (0, a.v9)(function (t) {
              return t.regionauth;
            }).regionauthInfo,
            i = void 0 === e ? {} : e,
            _ = t.list,
            p =
              void 0 === _
                ? [
                    { title: "综合" },
                    { title: "销量" },
                    {
                      title: "价格",
                      icon: "fv_filter_sort",
                      down: "fv_filter_sort_down",
                      up: "fv_filter_sort_up",
                      type: "sort",
                    },
                  ]
                : _,
            v = t.className,
            m = t.custom,
            x = t.current,
            h = t.showFilter,
            g = void 0 === h || h,
            w = t.onFilter,
            N = void 0 === w ? function () {} : w,
            k = t.onChange,
            j = void 0 === k ? function () {} : k,
            C = (0, c.x)(f),
            b = (0, n.Z)(C, 2),
            y = b[0],
            G = b[1],
            F = y.curIdx,
            I = y.sortOrder;
          (0, o.useEffect)(
            function () {
              G(function (t) {
                t.curIdx = x;
              });
            },
            [x]
          );
          var K = function (t, e) {
            return F !== t
              ? "".concat(e.icon, ".png")
              : -1 === I
              ? "".concat(e.icon, "_down.png")
              : 1 === I
              ? "".concat(e.icon, "_up.png")
              : void 0;
          };
          return (0, d.jsxs)(r.G7, {
            className: (0, l.AK)("sp-filter-line", v),
            style: { backgroundColor: t.backgroundColor },
            children: [
              (0, d.jsx)(r.G7, {
                className: "filter-line-body",
                children:
                  m &&
                  (null == p
                    ? void 0
                    : p.map(function (t, e) {
                        return (0, d.jsxs)(
                          r.G7,
                          {
                            className: (0, l.AK)("sp-filter-line__item", {
                              "sp-filter-line__item--active": F === e,
                            }),
                            onClick: function () {
                              return (function (t) {
                                var e =
                                    arguments.length > 1 &&
                                    void 0 !== arguments[1]
                                      ? arguments[1]
                                      : "",
                                  n =
                                    arguments.length > 2 &&
                                    void 0 !== arguments[2]
                                      ? arguments[2]
                                      : "";
                                (0, s.setFlowClickGio)({
                                  position: 1,
                                  index: t + 1,
                                  moduleName_var: "上方排序点击",
                                  title: "".concat(n, "排序"),
                                  regionauth_code:
                                    (null == i ? void 0 : i.regionauth_code) ||
                                    "-",
                                });
                                var o = 1;
                                "sort" === e && (o = t === F ? -1 * I : 1),
                                  G(function (e) {
                                    (e.curIdx = t), (e.sortOrder = o);
                                  }),
                                  j({ current: t, sort: o, type: e });
                              })(e, t.type, t.title);
                            },
                            children: [
                              (0, d.jsx)(r.xv, {
                                className: "sp-filter-line__item-text",
                                children: t.title,
                              }),
                              "sort" === t.type &&
                                (0, d.jsx)(u.Ko, {
                                  src: K(e, t),
                                  className: "sp-filter-line__item-icon",
                                  width: 24,
                                }),
                            ],
                          },
                          "sp-filter-line-item__".concat(e)
                        );
                      })),
              }),
              g &&
                (0, d.jsxs)(r.G7, {
                  className: "sp-filter-line__filter",
                  onClick: function () {
                    (0, s.setFlowClickGio)({
                      position: 1,
                      index: 1,
                      moduleName_var: "右上角筛选器点击",
                      title: "筛选",
                      regionauth_code:
                        (null == i ? void 0 : i.regionauth_code) || "-",
                    }),
                      N();
                  },
                  children: [
                    (0, d.jsx)(r.xv, {
                      className: "sp-filter-line__filter-text",
                      children: "筛选",
                    }),
                    (0, d.jsx)(u.Ko, {
                      src: "fv_filter.png",
                      className: "sp-filter-line__filter-icon",
                      mode: "aspectFill",
                    }),
                  ],
                }),
            ],
          });
        }
        (_.defaultProps = { backgroundColor: "#fff" }), (e.Z = _);
      },
    },
  ]);
})();
