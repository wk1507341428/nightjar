!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [9246],
    {
      57394: function (n, e, o) {
        var i = o(29439),
          a = o(67294),
          s = (o(92954), o(71515)),
          c = o(90057),
          r = o(62049),
          t = o(78061),
          l = o(85893),
          d = {
            keywords: "",
            selectArea: [],
            isSpAddressOpened: !1,
            searchConditionVis: !1,
            searchCondition: "",
          };
        function u(n) {
          var e = n.placeholder,
            o = void 0 === e ? "搜索" : e,
            u = (n.isFixTop, n.isShowArea),
            f = void 0 !== u && u,
            h = n.isShowSearchCondition,
            v = void 0 !== h && h,
            p = n.searchConditionList,
            C =
              void 0 === p
                ? [
                    { label: "手机号", value: "phone" },
                    { label: "客户名称", value: "custonmerName" },
                  ]
                : p,
            x = n.onConfirm,
            m = void 0 === x ? function () {} : x,
            w = n.onSelectArea,
            j = void 0 === w ? function () {} : w,
            g = n.onHandleSearch,
            b = void 0 === g ? function () {} : g,
            k = (0, c.x)(d),
            A = (0, i.Z)(k, 2),
            G = A[0],
            N = A[1],
            y = G.keywords,
            S = G.selectArea,
            O = G.isSpAddressOpened,
            Z = G.searchCondition;
          G.searchConditionVis,
            (0, a.useEffect)(
              function () {
                if (v) {
                  var n = C.length ? C[0].value : "";
                  N(function (e) {
                    e.searchCondition = n;
                  });
                }
              },
              [C]
            );
          var V = (0, a.useMemo)(
            function () {
              var n;
              return (
                (null ===
                  (n = C.find(function (n) {
                    return n.value == Z;
                  })) || void 0 === n
                  ? void 0
                  : n.label) || ""
              );
            },
            [Z]
          );
          return (0, l.jsxs)(s.G7, {
            className: "sp-search-input",
            children: [
              f &&
                (0, l.jsxs)(s.G7, {
                  className: "area",
                  onClick: function () {
                    N(function (n) {
                      n.isSpAddressOpened = !0;
                    });
                  },
                  children: [
                    (0, l.jsx)(s.G7, {
                      className: "area-val",
                      children: S.join("") || "请选择区域",
                    }),
                    S.length > 0
                      ? (0, l.jsx)(s.G7, {
                          className: "iconfont icon-guanbi area-clear-icon",
                          onClick: function (n) {
                            n.stopPropagation(),
                              N(function (n) {
                                n.selectArea = [];
                              }),
                              j && j({ type: "area", value: [] });
                          },
                        })
                      : (0, l.jsx)(s.G7, {
                          className: "iconfont icon-arrowDown area-icon",
                        }),
                  ],
                }),
              (0, l.jsxs)(s.G7, {
                className: "search-input",
                children: [
                  v &&
                    (0, l.jsx)(l.Fragment, {
                      children: (0, l.jsx)(s.cW, {
                        mode: "selector",
                        rangeKey: "label",
                        range: C,
                        onChange: function (n) {
                          var e,
                            o =
                              (null === (e = C[n.target.value]) || void 0 === e
                                ? void 0
                                : e.value) || "";
                          N(function (n) {
                            n.searchCondition = o;
                          }),
                            b(C[n.target.value]);
                        },
                        children: (0, l.jsxs)(s.G7, {
                          className: "search-condition",
                          onClick: function () {
                            N(function (n) {
                              n.searchConditionVis = !0;
                            });
                          },
                          children: [
                            V,
                            (0, l.jsx)(s.G7, {
                              className:
                                "iconfont icon-arrowDown search-condition-icon",
                            }),
                          ],
                        }),
                      }),
                    }),
                  !v &&
                    (0, l.jsx)(s.G7, { className: "iconfont icon-sousuo-01" }),
                  (0, l.jsx)(r.Z, {
                    value: y,
                    name: "keywords",
                    placeholder: o,
                    onChange: function (n) {
                      N(function (e) {
                        e.keywords = n;
                      });
                    },
                    onBlur: function () {
                      m(v ? { key: Z, keywords: y } : y);
                    },
                  }),
                ],
              }),
              (0, l.jsx)(t.sh, {
                isOpened: O,
                onClose: function () {
                  N(function (n) {
                    n.isSpAddressOpened = !1;
                  });
                },
                onChange: function (n) {
                  var e = (0, i.Z)(n, 3),
                    o = e[0].label,
                    a = e[1].label,
                    s = e[2].label;
                  N(function (n) {
                    n.selectArea = [o, a, s];
                  }),
                    j && j({ type: "area", value: [o, a, s] });
                },
              }),
            ],
          });
        }
        (u.options = { addGlobalClass: !0 }), (e.Z = u);
      },
    },
  ]);
})();
