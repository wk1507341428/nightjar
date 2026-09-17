!(function () {
  "use strict";
  require("./sub-vendors.js"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [949],
      {
        31879: function (e, n, t) {
          var a = t(32180),
            _ = t(93433),
            i = t(45987),
            r = t(74165),
            o = t(15861),
            c = t(1413),
            s = t(29439),
            g = t(67294),
            l = t(92954),
            m = t.n(l),
            u = t(71515),
            d = t(78061),
            h = t(90057),
            p = t(96856),
            x = t(1696),
            f = t(27741),
            v = t(80459),
            k = t(85893),
            j = ["list", "total_count"],
            y = { list: [], info: {}, navigateMantle: !1 };
          var N = function () {
            var e,
              n =
                (null === (e = (0, l.useRouter)()) || void 0 === e
                  ? void 0
                  : e.params) || {},
              t = n.id,
              a = n.noRegionauth,
              N = void 0 !== a && a,
              G = (0, h.x)(y),
              w = (0, s.Z)(G, 2),
              b = w[0],
              Z = w[1],
              K = b.list,
              F = b.info,
              I = b.navigateMantle,
              P = (0, g.useRef)(null),
              R = (0, g.useRef)(!0),
              S = (0, l.getCurrentInstance)();
            (0, g.useEffect)(
              function () {
                var e;
                t &&
                  (null == P ||
                    null === (e = P.current) ||
                    void 0 === e ||
                    e.reset());
              },
              [t]
            ),
              (0, l.useDidShow)(function () {
                var e;
                p.N_.postCenterTask({
                  ruleId:
                    null == S ||
                    null === (e = S.router) ||
                    void 0 === e ||
                    null === (e = e.params) ||
                    void 0 === e
                      ? void 0
                      : e.ruleId,
                });
              }),
              (0, g.useEffect)(
                function () {
                  K.length > 0 &&
                    K.forEach(function (e, n) {
                      m().nextTick(function () {
                        (0,
                        v.GoodsModuleExposure)(S.page, { wrap: "#page-category-ranking__content__item-".concat(e.itemId), params: (0, c.Z)((0, c.Z)({}, e), {}, { moduleName_var: "".concat(F.category_name, "热卖榜"), modulePosition_var: 1, flowPosition_var: n + 1 }) });
                      });
                    });
                },
                [K]
              );
            var C = (function () {
                var e = (0, o.Z)(
                  (0, r.Z)().mark(function e(n) {
                    var t, a, _, i;
                    return (0, r.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), p.N_.getRouteParams();
                          case 2:
                            (t = e.sent),
                              (a = t.previousPage),
                              (_ = t.searchModule),
                              (i = t.keyword),
                              a &&
                                _ &&
                                i &&
                                (0, v.setSearchResultGio)({
                                  searchWord: i,
                                  searchModule: _,
                                  sourceEntrance: a,
                                  resultNumber: n || 0,
                                  ifSearchResult: "其他",
                                });
                          case 7:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })(),
              M = (function () {
                var e = (0, o.Z)(
                  (0, r.Z)().mark(function e(n) {
                    var a, o, c, s, g, l, m, u, d, h;
                    return (0, r.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (a = n.pageIndex),
                              (o = n.pageSize),
                              (c = void 0 === o ? 10 : o),
                              (e.next = 3),
                              x.Z.seckill.getRankingGoodsList(t, {
                                page: a,
                                pageSize: c,
                                noRegionauth: N,
                              })
                            );
                          case 3:
                            return (
                              (s = e.sent),
                              (l = (g = s || {}).list),
                              (m = void 0 === l ? [] : l),
                              (u = g.total_count),
                              (d = (0, i.Z)(g, j)),
                              (h = (0, p.D9)(m, f.Z.goods.SECKILL_GOODS_ITEM)),
                              Z(function (e) {
                                (e.list = [].concat(
                                  (0, _.Z)(e.list),
                                  (0, _.Z)(h)
                                )),
                                  (e.info = d || {});
                              }),
                              1 == a && R.current && ((R.current = !1), C(u)),
                              e.abrupt("return", { total: u })
                            );
                          case 9:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })();
            return (0, k.jsx)(d.nO, {
              className: (0, p.AK)("page-category-ranking", {
                "page-category-ranking-mantle": I,
              }),
              immersive: !0,
              navigateMantle: I,
              navigateBackgroundColor: "#1F1000",
              renderNavigation: I
                ? (0, k.jsxs)(u.G7, {
                    className:
                      "flex items-center  justify-items-center h-full w-full text-white page-category-ranking__navigation__title",
                    children: [F.category_name, "热卖榜"],
                  })
                : null,
              renderNavigationLeft: (0, k.jsx)(d.Ko, {
                src: "fv_white_back_1.png",
                height: 48,
                width: 24,
                mode: "heightFix",
                onClick: function () {
                  return m().navigateBack();
                },
              }),
              navigationLeftBlockWidthFull: !0,
              children: (0, k.jsxs)(u.pf, {
                className: "page-category-ranking__scroll-view",
                scrollY: !0,
                style: { height: "100%" },
                onScroll: function (e) {
                  Z(function (n) {
                    n.navigateMantle = e.detail.scrollTop > 120;
                  });
                },
                children: [
                  (0, k.jsxs)(u.G7, {
                    className: "page-category-ranking__header",
                    children: [
                      F.background &&
                        (0, k.jsx)(d.Ko, {
                          src: F.background,
                          mode: "aspectFill",
                          className: "page-category-ranking__header__cover",
                        }),
                      (0, k.jsxs)(u.G7, {
                        className: "page-category-ranking__header__content",
                        children: [
                          (0, k.jsxs)(u.G7, {
                            className:
                              "page-category-ranking__header__content__title_box",
                            children: [
                              (0, k.jsx)(d.Ko, {
                                src: "fv_ranking_logo_left.png",
                                width: 58,
                                height: 116,
                                className:
                                  "page-category-ranking__header__logo_left",
                              }),
                              (0, k.jsxs)(u.xv, {
                                className:
                                  "page-category-ranking__header__content__title",
                                children: [F.category_name, "热卖榜"],
                              }),
                              (0, k.jsx)(u.xv, {
                                className:
                                  "page-category-ranking__header__content__subtitle",
                                children: F.intro,
                              }),
                              (0, k.jsx)(d.Ko, {
                                src: "fv_ranking_logo_right.png",
                                width: 58,
                                height: 116,
                                className:
                                  "page-category-ranking__header__logo_right",
                              }),
                            ],
                          }),
                          (0, k.jsx)(u.G7, {
                            className:
                              "page-category-ranking__header__content__line",
                            children: "专柜正品｜销量好｜口碑佳｜回头客多",
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, k.jsx)(d.B, {
                    scrollY: !0,
                    ref: P,
                    auto: !1,
                    fetch: M,
                    renderMore: function () {
                      return (0, k.jsx)(k.Fragment, {});
                    },
                    children: (0, k.jsx)(u.G7, {
                      className: "page-category-ranking__content",
                      children:
                        (null == K ? void 0 : K.length) &&
                        K.map(function (e, n) {
                          var t, a, _;
                          return (0, k.jsxs)(
                            u.G7,
                            {
                              className: "page-category-ranking__content__item",
                              id: "page-category-ranking__content__item-".concat(
                                e.itemId
                              ),
                              children: [
                                (0, k.jsxs)(u.G7, {
                                  className:
                                    "page-category-ranking__content__item__main",
                                  children: [
                                    (0, k.jsxs)(u.G7, {
                                      className:
                                        "page-category-ranking__content__item__main__rank",
                                      children: [
                                        (0, k.jsx)(d.Ko, {
                                          src: e.img,
                                          mode: "aspectFill",
                                          width: 204,
                                          height: 204,
                                          placeholderColor: "#f2f3f5",
                                        }),
                                        (0, k.jsx)(u.G7, {
                                          className:
                                            "page-category-ranking__content__item__main__rank__text",
                                          children: (0, k.jsx)(u.xv, {
                                            className:
                                              "page-category-ranking__content__item__main__rank__text__number",
                                            children:
                                              n < 3
                                                ? "TOP.".concat(n + 1)
                                                : n + 1,
                                          }),
                                        }),
                                      ],
                                    }),
                                    (0, k.jsxs)(u.G7, {
                                      className:
                                        "page-category-ranking__content__item__main__info",
                                      children: [
                                        (0, k.jsxs)(u.G7, {
                                          className:
                                            "page-category-ranking__content__item__main__info__shop",
                                          onClick: function () {
                                            m().navigateTo({
                                              url: "/subpages/store/index?id=".concat(
                                                e.distributorId
                                              ),
                                            });
                                          },
                                          children: [
                                            (0, k.jsxs)(u.G7, {
                                              className:
                                                "page-category-ranking__content__item__main__info__shop__text",
                                              children: [
                                                (0, k.jsx)(d.Ko, {
                                                  src: "fv_storefront.png",
                                                  width: 24,
                                                  height: 24,
                                                }),
                                                e.shopName,
                                              ],
                                            }),
                                            (0, k.jsx)(d.Ko, {
                                              src: "fv_ranking_right.png",
                                              width: 32,
                                              height: 32,
                                            }),
                                          ],
                                        }),
                                        (0, k.jsxs)(u.G7, {
                                          className:
                                            "page-category-ranking__content__item__main__info__name_box",
                                          onClick: function () {
                                            m().navigateTo({
                                              url: "/pages/item/espier-detail?id=".concat(
                                                e.itemId
                                              ),
                                            });
                                          },
                                          children: [
                                            (0, k.jsxs)(u.G7, {
                                              className:
                                                "page-category-ranking__content__item__main__info__name",
                                              children: [
                                                e.promotionSkill &&
                                                  (0, k.jsx)(u.G7, {
                                                    className:
                                                      "page-category-ranking__content__item__main__info__name__img",
                                                    children: (0, k.jsx)(d.Ko, {
                                                      src: "fv_activity_seckill.png",
                                                      mode: "heightFix",
                                                      width: 62,
                                                      height: 31,
                                                    }),
                                                  }),
                                                (null ===
                                                  (t = e.memberPreference) ||
                                                void 0 === t
                                                  ? void 0
                                                  : t.marketing_name) &&
                                                  (0, k.jsx)(u.G7, {
                                                    className:
                                                      "page-category-ranking__content__item__main__info__name__img",
                                                    children: (0, k.jsx)(d.Ko, {
                                                      src: "fv_member_preference.png",
                                                      mode: "heightFix",
                                                      height: 32,
                                                    }),
                                                  }),
                                                e.itemName,
                                              ],
                                            }),
                                            (0, k.jsxs)(u.G7, {
                                              className:
                                                "page-category-ranking__content__item__main__info__tag",
                                              children: [
                                                null === (a = e.promotion) ||
                                                void 0 === a
                                                  ? void 0
                                                  : a.map(function (e, n) {
                                                      return (0,
                                                      k.jsx)(d.$r, { label: e.tag_name, type: e.type }, n);
                                                    }),
                                                null === (_ = e.couponList) ||
                                                void 0 === _
                                                  ? void 0
                                                  : _.map(function (e, n) {
                                                      return (0,
                                                      k.jsx)(d.$r, { label: e.discount_rule, type: "warning" }, n);
                                                    }),
                                              ],
                                            }),
                                            (0, k.jsxs)(u.G7, {
                                              className:
                                                "page-category-ranking__content__item__main__info__price",
                                              children: [
                                                (0, k.jsxs)(u.G7, {
                                                  className:
                                                    "page-category-ranking__content__item__main__info__price__left",
                                                  children: [
                                                    (0, k.jsx)(d.qq, {
                                                      value: e.price,
                                                      size: 34,
                                                      weight: 600,
                                                      color: "#1A1A1A",
                                                    }),
                                                    Number(e.marketPrice || 0) >
                                                      0 &&
                                                      Number(
                                                        e.marketPrice || 0
                                                      ) >
                                                        Number(e.price || 0) &&
                                                      (0, k.jsx)(d.qq, {
                                                        lineThrough: !0,
                                                        noSymbol: !0,
                                                        value: e.marketPrice,
                                                        size: 24,
                                                        weight: 400,
                                                        color: "#BFBFBF",
                                                      }),
                                                    e.discountRate &&
                                                      (0, k.jsxs)(u.G7, {
                                                        className:
                                                          "page-category-ranking__content__item__main__info__price__discount",
                                                        children: [
                                                          (0, k.jsx)(u.xv, {
                                                            className:
                                                              "page-category-ranking__content__item__main__info__price__discount__number",
                                                            children:
                                                              e.discountRate,
                                                          }),
                                                          (0, k.jsx)(u.xv, {
                                                            className:
                                                              "page-category-ranking__content__item__main__info__price__discount__unit",
                                                            children: "折",
                                                          }),
                                                        ],
                                                      }),
                                                  ],
                                                }),
                                                (0, k.jsxs)(u.G7, {
                                                  className:
                                                    "page-category-ranking__content__item__main__info__price__right",
                                                  children: [
                                                    (0, k.jsx)(d.Ko, {
                                                      src: "fv_fire_hot.png",
                                                      width: 24,
                                                      height: 24,
                                                    }),
                                                    (0, k.jsx)(u.xv, {
                                                      className:
                                                        "page-category-ranking__content__item__main__info__price__right__text",
                                                      children: e.score,
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                0 == n &&
                                  (null == F ? void 0 : F.top1_intro) &&
                                  (0, k.jsx)(u.G7, {
                                    className:
                                      "page-category-ranking__content__item__reason",
                                    children: (0, k.jsxs)(u.xv, {
                                      className:
                                        "page-category-ranking__content__item__reason__text",
                                      children: [
                                        (0, k.jsx)(u.xv, {
                                          className:
                                            "page-category-ranking__content__item__reason__title",
                                          children: "上榜理由：",
                                        }),
                                        (0, k.jsx)(u.xv, {
                                          children:
                                            null == F ? void 0 : F.top1_intro,
                                        }),
                                      ],
                                    }),
                                  }),
                                1 == n &&
                                  (null == F ? void 0 : F.top2_intro) &&
                                  (0, k.jsx)(u.G7, {
                                    className:
                                      "page-category-ranking__content__item__reason",
                                    children: (0, k.jsxs)(u.xv, {
                                      className:
                                        "page-category-ranking__content__item__reason__text",
                                      children: [
                                        (0, k.jsx)(u.xv, {
                                          className:
                                            "page-category-ranking__content__item__reason__title",
                                          children: "上榜理由：",
                                        }),
                                        (0, k.jsx)(u.xv, {
                                          children:
                                            null == F ? void 0 : F.top2_intro,
                                        }),
                                      ],
                                    }),
                                  }),
                                2 == n &&
                                  (null == F ? void 0 : F.top3_intro) &&
                                  (0, k.jsx)(u.G7, {
                                    className:
                                      "page-category-ranking__content__item__reason",
                                    children: (0, k.jsxs)(u.xv, {
                                      className:
                                        "page-category-ranking__content__item__reason__text",
                                      children: [
                                        (0, k.jsx)(u.xv, {
                                          className:
                                            "page-category-ranking__content__item__reason__title",
                                          children: "上榜理由：",
                                        }),
                                        (0, k.jsx)(u.xv, {
                                          children:
                                            null == F ? void 0 : F.top3_intro,
                                        }),
                                      ],
                                    }),
                                  }),
                              ],
                            },
                            e.itemId
                          );
                        }),
                    }),
                  }),
                ],
              }),
            });
          };
          Page(
            (0, a.createPageConfig)(
              N,
              "subpages/marketing/category-ranking",
              { root: { cn: [] } },
              { navigationStyle: "custom" } || {}
            )
          );
        },
      },
      function (e) {
        e.O(0, [2107, 1216, 8592], function () {
          return (function (n) {
            return e((e.s = n));
          })(31879);
        }),
          e.O();
      },
    ]);
})();
