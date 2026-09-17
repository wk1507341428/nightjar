!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [6758],
    {
      14368: function (e, t, n) {
        var r = n(1413),
          i = n(93433),
          c = n(74165),
          o = n(15861),
          a = n(29439),
          s = n(92954),
          l = n.n(s),
          u = n(67294),
          d = n(71515),
          f = n(90057),
          p = n(96856),
          v = n(78061),
          _ = n(31707),
          x = n(80459),
          y = n(1696),
          h = n(82212),
          m = n(67914),
          w = n(73926),
          g = n(12868),
          C = n(85893),
          b = n(32180).window,
          Z = {
            selectedCategory: [],
            currentCategory: 0,
            filters: [],
            activeView: "",
            expandedCategories: [],
            activeTab: 0,
          },
          k = function (e) {
            var t = e.visible,
              n = void 0 !== t && t,
              s = e.title,
              k = void 0 === s ? "商品筛选" : s,
              N = e.selectedFilters,
              j = void 0 === N ? [] : N,
              G = e.hideItem,
              I = void 0 === G ? [] : G,
              F = e.onClose,
              S = void 0 === F ? function () {} : F,
              A = e.onConfirm,
              T = void 0 === A ? function () {} : A,
              V = e.onReset,
              Y = void 0 === V ? function () {} : V,
              E = e.newFilter,
              J = void 0 === E ? null : E,
              K = l().getSystemInfoSync().screenHeight,
              P = (0, f.x)(Z),
              R = (0, a.Z)(P, 2),
              q = R[0],
              W = R[1],
              B = (0, u.useRef)(!1),
              H = (0, _.v9)(function (e) {
                return e.regionauth;
              }).regionauthInfo,
              O = void 0 === H ? {} : H,
              $ = (0, u.useRef)([]),
              z = q.selectedCategory,
              D = q.currentCategory,
              L = q.filters,
              M = q.activeView,
              Q = q.expandedCategories,
              U = q.activeTab;
            (0, u.useEffect)(
              function () {
                n && X();
              },
              [n]
            ),
              (0, u.useEffect)(
                function () {
                  W(function (e) {
                    e.selectedCategory = j;
                  });
                },
                [j]
              );
            var X = (function () {
                var e = (0, o.Z)(
                  (0, c.Z)().mark(function e() {
                    var t, n;
                    return (0, c.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.prev = 0),
                                (e.next = 3),
                                y.Z.item.getFilter({
                                  filter: JSON.stringify(J),
                                })
                              );
                            case 3:
                              return (t = e.sent), (e.next = 6), (0, g.k)(t);
                            case 6:
                              (n = (n = e.sent).filter(function (e) {
                                return (
                                  -1 ==
                                    I.findIndex(function (t) {
                                      return e.type == t;
                                    }) &&
                                  ("spec" != e.type ||
                                    ("spec" == e.type &&
                                      e.options.children.length > 0))
                                );
                              })),
                                W(function (e) {
                                  (e.filters = n),
                                    n.length > 0 &&
                                      ((e.activeView = "filter_".concat(
                                        n[0].type
                                      )),
                                      (e.activeTab = "tab_".concat(n[0].type)));
                                }),
                                (e.next = 14);
                              break;
                            case 11:
                              (e.prev = 11),
                                (e.t0 = e.catch(0)),
                                console.error("获取筛选数据失败", e.t0);
                            case 14:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 11]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              ee = function (e) {
                var t = z.find(function (t) {
                  return t.id === e.id;
                });
                W(function (n) {
                  if (["spec", "category", "discount"].includes(e.type))
                    n.selectedCategory = t
                      ? z.filter(function (t) {
                          return t.id !== e.id;
                        })
                      : [].concat((0, i.Z)(z), [e]);
                  else {
                    var r = z.filter(function (t) {
                      return t.type !== e.type;
                    });
                    t && "price" !== e.type
                      ? (n.selectedCategory = r.filter(function (t) {
                          return t.id !== e.id;
                        }))
                      : (n.selectedCategory = [].concat((0, i.Z)(r), [e]));
                  }
                });
              },
              te = (function () {
                var e = (0, o.Z)(
                  (0, c.Z)().mark(function e(t) {
                    var n, r;
                    return (0, c.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            (n = t.id),
                              t.children,
                              t.index,
                              t.pIndex,
                              (r = Q.find(function (e) {
                                return e === n;
                              })),
                              W(function (e) {
                                e.expandedCategories = r
                                  ? Q.filter(function (e) {
                                      return e !== n;
                                    })
                                  : [].concat((0, i.Z)(Q), [n]);
                              });
                          case 3:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t) {
                  return e.apply(this, arguments);
                };
              })(),
              ne = (0, u.useCallback)(
                function () {
                  (0, x.setFlowClickGio)({
                    position: 1,
                    index: 1,
                    moduleName_var: "筛选点击",
                    title: "重置筛选点击",
                    regionauth_code:
                      (null == O ? void 0 : O.regionauth_code) || "-",
                  }),
                    Y && Y();
                },
                [Y]
              ),
              re = (0, u.useCallback)(
                function () {
                  (0, x.setFlowClickGio)({
                    position: 1,
                    index: 2,
                    moduleName_var: "筛选点击",
                    title: "确定筛选点击",
                    regionauth_code:
                      (null == O ? void 0 : O.regionauth_code) || "-",
                  }),
                    T && T(z);
                },
                [z, T]
              ),
              ie = (0, p.P2)(function () {
                var e = K - (0, p.pI)(960) + (0, p.pI)(96),
                  t = (function () {
                    var t = (0, o.Z)(
                      (0, c.Z)().mark(function t() {
                        var n, r, i;
                        return (0, c.Z)().wrap(function (t) {
                          for (;;)
                            switch ((t.prev = t.next)) {
                              case 0:
                                (n = (0, c.Z)().mark(function t(n) {
                                  var r;
                                  return (0, c.Z)().wrap(function (t) {
                                    for (;;)
                                      switch ((t.prev = t.next)) {
                                        case 0:
                                          return (
                                            (r = L[n]),
                                            (t.next = 3),
                                            (0, p.T$)(
                                              "#filter_".concat(
                                                r.type,
                                                "_title"
                                              )
                                            )
                                          );
                                        case 3:
                                          if (!(t.sent.top >= e)) {
                                            t.next = 7;
                                            break;
                                          }
                                          return (
                                            W(function (e) {
                                              (e.currentCategory = n),
                                                (e.activeView = null);
                                            }),
                                            t.abrupt("return", { v: void 0 })
                                          );
                                        case 7:
                                        case "end":
                                          return t.stop();
                                      }
                                  }, t);
                                })),
                                  (i = 0);
                              case 2:
                                if (!(i < L.length)) {
                                  t.next = 10;
                                  break;
                                }
                                return t.delegateYield(n(i), "t0", 4);
                              case 4:
                                if (!(r = t.t0)) {
                                  t.next = 7;
                                  break;
                                }
                                return t.abrupt("return", r.v);
                              case 7:
                                i++, (t.next = 2);
                                break;
                              case 10:
                              case "end":
                                return t.stop();
                            }
                        }, t);
                      })
                    );
                    return function () {
                      return t.apply(this, arguments);
                    };
                  })();
                b.requestAnimationFrame ? b.requestAnimationFrame(t) : t();
              }, 70),
              ce = function (e, t) {
                return ["category", "spec"].includes(e.type)
                  ? (0, C.jsx)(h.Z, {
                      categories: e.options.children,
                      selectedCategory: z,
                      onSelect: function (t) {
                        return ee(
                          (0, r.Z)((0, r.Z)({}, t), {}, { type: e.type })
                        );
                      },
                      onExpand: te,
                      expandedCategories: Q,
                      pIndex: t + 1,
                    })
                  : "price" === e.type
                  ? (0, C.jsx)(m.Z, {
                      minPrice:
                        null ===
                          (n = z.filter(function (e) {
                            return "price" === e.type;
                          })[0]) || void 0 === n
                          ? void 0
                          : n.min,
                      maxPrice:
                        null ===
                          (i = z.filter(function (e) {
                            return "price" === e.type;
                          })[0]) || void 0 === i
                          ? void 0
                          : i.max,
                      onChange: function (t) {
                        return ee(
                          (0, r.Z)((0, r.Z)({}, t), {}, { type: e.type })
                        );
                      },
                      pIndex: t + 1,
                    })
                  : "brand" === e.type
                  ? (0, C.jsx)(w.Z, {
                      brands: e.options.children,
                      selectedBrands: z,
                      onSelect: function (t) {
                        return ee(
                          (0, r.Z)((0, r.Z)({}, t), {}, { type: e.type })
                        );
                      },
                      pIndex: t + 1,
                    })
                  : (0, C.jsx)(d.G7, {
                      className: "sp-filter-drawer__content-item-tags",
                      children: (0, C.jsx)(v.Yf, {
                        tags: e.options.children,
                        selectedTags: z,
                        onSelect: function (t) {
                          return ee(
                            (0, r.Z)((0, r.Z)({}, t), {}, { type: e.type })
                          );
                        },
                        pIndex: t + 1,
                      }),
                    });
                var n, i;
              };
            return (0, C.jsxs)(d.G7, {
              className: (0, p.AK)("sp-filter-drawer", { hide: !n, active: n }),
              children: [
                (0, C.jsx)(d.G7, {
                  className: "sp-filter-drawer__mask",
                  onClick: S,
                }),
                (0, C.jsxs)(d.G7, {
                  className: "sp-filter-drawer__content",
                  children: [
                    (0, C.jsxs)(d.G7, {
                      className: "sp-filter-drawer__header",
                      children: [
                        (0, C.jsx)(d.xv, {
                          className: "sp-filter-drawer__title",
                          children: k,
                        }),
                        (0, C.jsx)(v.Ko, {
                          className: "sp-filter-drawer__close",
                          src: "fv_close.png",
                          width: 40,
                          onClick: function () {
                            (0, x.setFlowClickGio)({
                              position: 1,
                              index: 1,
                              moduleName_var: "关闭筛选",
                              title: "关闭筛选",
                              regionauth_code:
                                (null == O ? void 0 : O.regionauth_code) || "-",
                            }),
                              S();
                          },
                        }),
                      ],
                    }),
                    (0, C.jsxs)(d.G7, {
                      className: "sp-filter-drawer__body",
                      children: [
                        (0, C.jsx)(d.pf, {
                          scrollY: !0,
                          className: "sp-filter-drawer__sidebar",
                          scrollWithAnimation: !0,
                          "scroll-into-view": U,
                          children:
                            null == L
                              ? void 0
                              : L.map(function (e, t) {
                                  return (0, C.jsx)(
                                    d.G7,
                                    {
                                      id: "tab_".concat(e.type),
                                      className: (0, p.AK)(
                                        "sp-filter-drawer__category",
                                        {
                                          "sp-filter-drawer__category--active":
                                            D === t,
                                        }
                                      ),
                                      onClick: function () {
                                        return (function (e) {
                                          var t = e.category,
                                            n = e.index,
                                            r = e.title;
                                          (0, x.setFlowClickGio)({
                                            position: 1,
                                            index: n + 1,
                                            moduleName_var: "左侧类别导航",
                                            title: r,
                                            regionauth_code:
                                              (null == O
                                                ? void 0
                                                : O.regionauth_code) || "-",
                                          }),
                                            (B.current = !0),
                                            W(function (e) {
                                              (e.activeView = "filter_".concat(
                                                t
                                              )),
                                                (e.activeTab = "tab_".concat(
                                                  t
                                                )),
                                                (e.currentCategory = n);
                                            });
                                        })({
                                          category: e.type,
                                          index: t,
                                          title: e.title,
                                        });
                                      },
                                      children: e.title,
                                    },
                                    t
                                  );
                                }),
                        }),
                        (0, C.jsx)(d.pf, {
                          scrollY: !0,
                          className: "sp-filter-drawer__content-area",
                          scrollWithAnimation: !0,
                          "scroll-into-view": M,
                          onScroll: ie,
                          children:
                            null == L
                              ? void 0
                              : L.map(function (e, t) {
                                  return (0,
                                  C.jsxs)(d.G7, { id: "filter_".concat(e.type), className: "sp-filter-drawer__content-item", ref: $[t], children: [(0, C.jsx)(d.G7, { className: "sp-filter-drawer__content-item-title", id: "filter_".concat(e.type, "_title"), children: e.options.label }), ce(e, t)] }, t);
                                }),
                        }),
                      ],
                    }),
                    (0, C.jsxs)(d.G7, {
                      className: "sp-filter-drawer__footer",
                      children: [
                        (0, C.jsx)(d.G7, {
                          className:
                            "sp-filter-drawer__btn sp-filter-drawer__btn--reset",
                          onClick: ne,
                          children: "重置选择",
                        }),
                        (0, C.jsx)(d.G7, {
                          className:
                            "sp-filter-drawer__btn sp-filter-drawer__btn--confirm",
                          onClick: re,
                          children: "确定筛选",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            });
          };
        (k.options = { addGlobalClass: !0 }), (t.Z = k);
      },
    },
  ]);
})();
