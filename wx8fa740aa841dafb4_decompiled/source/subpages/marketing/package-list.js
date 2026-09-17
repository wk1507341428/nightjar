!(function () {
  "use strict";
  require("./sub-vendors.js"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [9882],
      {
        5954: function (e, a, n) {
          var t = n(32180),
            i = n(74165),
            c = n(15861),
            r = n(29439),
            s = n(67294),
            o = n(31707),
            u = n(92954),
            p = n.n(u),
            d = n(45557),
            l = n(71515),
            m = n(90057),
            f = n(78061),
            k = n(37042),
            g = n(96856),
            h = n(1696),
            x = n(1413),
            I = n(27741),
            _ = n(85893),
            v = {
              mainGoods: null,
              makeUpGoods: [],
              skuPanelOpen: !1,
              skuInfo: null,
              curGoodsType: 0,
              curMakeUpGoodsIndex: 0,
              selection: new Set(),
              main_package_price: null,
              package_price: null,
            },
            G = s.memo(f.C3);
          function b(e) {
            var a = this,
              n = e.info,
              t = e.onChange,
              o = (0, m.x)(v),
              u = (0, r.Z)(o, 2),
              p = u[0],
              d = u[1],
              k = p.mainGoods,
              b = p.makeUpGoods,
              j = p.skuPanelOpen,
              Z = p.skuInfo,
              y = p.selection,
              C = p.curGoodsType,
              N = p.curMakeUpGoodsIndex,
              P = p.main_package_price,
              O = p.package_price;
            (0, s.useEffect)(function () {
              w();
            }, []),
              (0, s.useEffect)(
                function () {
                  k && b && S();
                },
                [y]
              ),
              (0, s.useEffect)(
                function () {
                  k && b && S();
                },
                [k, b]
              );
            var w = (function () {
                var e = (0, c.Z)(
                  (0, i.Z)().mark(function e() {
                    var a, t, c, r, s;
                    return (0, i.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (e.next = 2), h.Z.item.packageDetail(n.package_id)
                            );
                          case 2:
                            (a = e.sent),
                              (t = a.itemLists),
                              (c = a.mainItem),
                              (r = a.main_package_price),
                              (s = a.package_price),
                              d(function (e) {
                                (e.mainGoods = (0, g.D9)(
                                  c,
                                  I.Z.goods.GOODS_INFO
                                )),
                                  t.forEach(function (e) {
                                    e.spec_items.forEach(function (e) {
                                      e.price = s[e.item_id].price;
                                    });
                                  }),
                                  (e.makeUpGoods = (0, g.D9)(
                                    t,
                                    I.Z.goods.GOODS_INFO
                                  )),
                                  (e.main_package_price = r),
                                  (e.package_price = s);
                              });
                          case 8:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              D = function (e, a, n) {
                d(function (t) {
                  (t.skuInfo = n),
                    (t.skuPanelOpen = !0),
                    (t.curGoodsType = e),
                    (t.curMakeUpGoodsIndex = a);
                });
              },
              T = function (e, a) {
                var n = e.itemId,
                  t = new Set();
                y.forEach(function (e) {
                  t.add(e);
                }),
                  a ? t.add(n) : t.delete(n),
                  d(function (e) {
                    e.selection = t;
                  });
              },
              S = function () {
                var e,
                  a = [],
                  n = 0;
                k.nospec
                  ? ((e = k.itemId), (n += k.packagePrice))
                  : k.curItem &&
                    ((e = k.curItem.itemId), (n += P[e].price / 100)),
                  b.forEach(function (e) {
                    y.has(e.itemId) &&
                      (e.nospec
                        ? (a.push(e.itemId), (n += e.packagePrice))
                        : e.curItem
                        ? (a.push(e.curItem.itemId),
                          (n += O[e.curItem.itemId].price / 100))
                        : a.push(null));
                  }),
                  t && t({ itemId: e, sitemIds: a, packageTotalPrice: n });
              };
            return (0, _.jsxs)(l.G7, {
              className: "comp-packageitem",
              children: [
                (0, _.jsx)(l.G7, {
                  className: "main-goods",
                  children: "主商品",
                }),
                (0, _.jsx)(f.Pg, {
                  info: k,
                  onSelectSku: D.bind(this, 0, null),
                }),
                (0, _.jsx)(l.G7, {
                  className: "select-goods",
                  children: "可选商品",
                }),
                null == b
                  ? void 0
                  : b.map(function (e, n) {
                      return (0,
                      _.jsxs)(l.G7, { className: "makeup-goods-item", children: [(0, _.jsx)(f.bM, { checked: y.has(e.itemId), onChange: T.bind(a, e) }), (0, _.jsx)(f.Pg, { info: e, onSelectSku: D.bind(a, 1, n) })] }, "makeup-goods-item__".concat(n));
                    }),
                (0, _.jsx)(G, {
                  hideInputNumber: !0,
                  open: j,
                  info: Z,
                  type: "picker",
                  onClose: function () {
                    d(function (e) {
                      e.skuPanelOpen = !1;
                    });
                  },
                  onChange: function (e, a) {
                    d(
                      0 == C
                        ? function (n) {
                            (n.mainGoods.specText = e),
                              (n.mainGoods.curItem = a);
                          }
                        : function (n) {
                            (n.makeUpGoods[N].specText = e),
                              (n.makeUpGoods[N].curItem = (0, x.Z)(
                                (0, x.Z)({}, a),
                                {},
                                { price: O[a.itemId].price / 100 }
                              ));
                          }
                    );
                  },
                }),
              ],
            });
          }
          b.options = { addGlobalClass: !0 };
          var j = b,
            Z = { list: [] };
          function y(e) {
            var a,
              n = this,
              t = (0, u.getCurrentInstance)(),
              s =
                (null == t || null === (a = t.router) || void 0 === a
                  ? void 0
                  : a.params) || {},
              x = s.id,
              I = s.distributor_id,
              v = (0, o.I0)(),
              G = (0, m.x)(Z),
              b = (0, r.Z)(G, 2),
              y = b[0],
              C = b[1],
              N = y.list,
              P = (function () {
                var e = (0, c.Z)(
                  (0, i.Z)().mark(function e(a) {
                    var n, t, c, r, s;
                    return (0, i.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (n = a.pageIndex),
                              (t = a.pageSize),
                              (e.next = 3),
                              h.Z.item.packageList({
                                item_id: x,
                                page: n,
                                pageSize: t,
                              })
                            );
                          case 3:
                            return (
                              (c = e.sent),
                              (r = c.list),
                              (s = c.total_count),
                              r.forEach(function (e) {
                                (e.packageTotalPrice = 0),
                                  (e.packageData = {
                                    itemId: null,
                                    sitemIds: [],
                                  });
                              }),
                              C(function (e) {
                                e.list = r;
                              }),
                              e.abrupt("return", { total: s })
                            );
                          case 9:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (a) {
                  return e.apply(this, arguments);
                };
              })(),
              O = function (e, a) {
                var n = a.itemId,
                  t = a.sitemIds,
                  i = a.packageTotalPrice;
                C(function (a) {
                  (a.list[e].packageTotalPrice = i),
                    (a.list[e].packageData = { itemId: n, sitemIds: t });
                });
              },
              w = (function () {
                var e = (0, c.Z)(
                  (0, i.Z)().mark(function e(a) {
                    var n, t, c;
                    return (0, i.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (N[a].packageData.itemId) {
                              e.next = 3;
                              break;
                            }
                            return (
                              (0, g.CF)("请选择主商品规格"), e.abrupt("return")
                            );
                          case 3:
                            if (0 != N[a].packageData.sitemIds.length) {
                              e.next = 6;
                              break;
                            }
                            return (
                              (0, g.CF)("请选择可选商品"), e.abrupt("return")
                            );
                          case 6:
                            if (
                              !(
                                N[a].packageData.sitemIds.findIndex(function (
                                  e
                                ) {
                                  return !e;
                                }) > -1
                              )
                            ) {
                              e.next = 10;
                              break;
                            }
                            return (
                              (0, g.CF)("可选商品未选择规格"),
                              e.abrupt("return")
                            );
                          case 10:
                            return (
                              g.cM.debug(
                                "packageData: ".concat(
                                  JSON.stringify(N[a].packageData)
                                )
                              ),
                              (n = N[a].packageData),
                              (t = n.itemId),
                              (c = n.sitemIds),
                              (e.next = 14),
                              v(
                                (0, k.Z5)({
                                  isAccumulate: !0,
                                  item_id: t,
                                  items_id: c,
                                  num: 1,
                                  shop_type: "distributor",
                                  activity_id: N[a].package_id,
                                  activity_type: "package",
                                  distributor_id: I,
                                })
                              )
                            );
                          case 14:
                            return (
                              (e.next = 16),
                              v((0, k.tx)({ shop_type: "distributor" }))
                            );
                          case 16:
                            p().navigateBack();
                          case 17:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (a) {
                  return e.apply(this, arguments);
                };
              })();
            return (0, _.jsx)(f.nO, {
              className: "page-marketing-packagelist",
              children: (0, _.jsx)(f.B, {
                fetch: P,
                children:
                  null == N
                    ? void 0
                    : N.map(function (e, a) {
                        return (0,
                        _.jsxs)(l.G7, { className: "package-item", children: [(0, _.jsx)(l.G7, { className: "package-item-hd", children: (0, _.jsx)(l.xv, { className: "package-item-title", children: e.package_name }) }), (0, _.jsx)(l.G7, { className: "package-item-bd", children: (0, _.jsx)(j, { info: e, onChange: O.bind(n, a) }) }), (0, _.jsxs)(l.G7, { className: "package-item-ft", children: [(0, _.jsxs)(l.G7, { children: ["组合价：", (0, _.jsx)(f.qq, { value: e.packageTotalPrice })] }), (0, _.jsx)(l.G7, { className: "btn-wrap", children: (0, _.jsx)(f.vC, { onChange: w.bind(n, a), children: (0, _.jsx)(d.Z, { type: "primary", circle: !0, children: "加入购物车" }) }) })] })] });
                      }),
              }),
            });
          }
          y.options = { addGlobalClass: !0 };
          var C = y;
          Page(
            (0, t.createPageConfig)(
              C,
              "subpages/marketing/package-list",
              { root: { cn: [] } },
              { navigationBarTitleText: "组合优惠" } || {}
            )
          );
        },
      },
      function (e) {
        e.O(0, [2107, 1216, 8592], function () {
          return (function (a) {
            return e((e.s = a));
          })(5954);
        }),
          e.O();
      },
    ]);
})();
