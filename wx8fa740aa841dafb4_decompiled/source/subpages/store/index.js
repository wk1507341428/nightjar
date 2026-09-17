!(function () {
  "use strict";
  require("./sub-common/899d73213da416588facf8e40fb36354.js"),
    require("./sub-common/7c9e96d4e67eed876cde3fb8eb9a7a6d.js"),
    require("./sub-common/9c36ef1738753403dbec58e763490484.js"),
    require("./sub-common/14338409af789766c313815505161df5.js"),
    require("./sub-common/de5bf73e54154c797a164e4122d0c0dc.js"),
    require("./sub-common/4167e5dedb0650e7db907e399b6a590f.js"),
    require("./sub-common/41fdb3fd793f3b42b690b58df803a6f4.js"),
    require("./sub-common/f586f63ff06ee16371885aba8635b8f1.js"),
    require("./sub-common/4bbea5a055fe8276004d2b0a53c911a4.js"),
    require("./sub-common/82f8cc24ac4107e308710e4de7eb4661.js"),
    require("./sub-common/6fb59393a70dea1ed8578b8f21bbaf07.js"),
    require("./sub-common/fd7eb236de4449263469ea99c14e228f.js"),
    require("./sub-common/31435c7bf5861bf987003454a80b776f.js"),
    require("./sub-common/209d88bfa71346c59d575002cc1dab65.js"),
    require("./sub-common/42cd5e48a3f84fca66dbc78b7568c54f.js"),
    require("./sub-common/7b9cb83d1423d521c6a502f67a775cd8.js"),
    require("./sub-common/9e06b0805cd226c23e1e3cab2329b411.js"),
    require("./sub-common/ca3b01c5698d177859143ce457deb158.js"),
    require("./sub-common/03af81d622adb2411fd11e6f0c1c2f5e.js"),
    require("./sub-common/847da300ae1911ce8862bccfb1d37ced.js"),
    require("./sub-common/9e8e829f282985b09050c317d8804b36.js"),
    require("./sub-common/8c6e156887d7890f00a2c77737716f3a.js"),
    require("./sub-common/88db826e1c9ed27d9611be95e496da7c.js"),
    require("./sub-common/c8103d06255907d1e165f9f0a647fb3e.js"),
    require("./sub-common/d73117510a6aa77ec2d8ef13b347a13c.js"),
    require("./sub-common/66c73cdbf64b40d1999588c9091697ca.js"),
    require("./sub-common/74ee74f95916bef6ef514b31ee03c4c8.js"),
    require("./sub-common/07685315e736f01f70accc1bedfed941.js"),
    require("./sub-common/345fe984afab6a5919df6f615acf2e48.js"),
    require("./sub-common/97e8f5e0d665eaccf444a406c1e347da.js"),
    require("./sub-common/ec8bdfe232eefc1b37fe14caf80f2bf9.js"),
    require("./sub-common/74f108c90ff8039d8a83bdd865ae040d.js"),
    require("./sub-common/46db6df93d0f1d11bc7b80b657b9f6cb.js"),
    require("./sub-common/bb473f59700a7d29e57fc2cfee60c24f.js"),
    require("./sub-common/66b151740e5633df09e4cea2ce468535.js"),
    require("./sub-common/1786a009125ab301b6ea90daf1eb4e66.js"),
    require("./sub-common/a2857225d80739908d9883ffdb650e55.js"),
    require("./sub-common/fd3b800d5857a986d75f72f07ac1fdf0.js"),
    require("./sub-common/ca3a11cb53ee5c11f817d9a41a9c0457.js"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [1732],
      {
        63615: function (e, t, n) {
          var o = n(32180),
            r = n(1413),
            i = n(93433),
            s = n(74165),
            a = n(15861),
            c = n(29439),
            u = n(67294),
            l = n(92954),
            d = n.n(l),
            f = n(71515),
            m = n(31707),
            p = n(52744),
            h = n(66341),
            g = n(96943),
            b = n(7616),
            v = n(21391),
            _ = n(78061),
            x = n(98178),
            j = n(48775),
            y = n(9453),
            I = n(70655),
            w = n(1696),
            N = n(97143),
            Z = n(27741),
            k = n(96856),
            G = n(90057),
            S = (n(79833), n(23493)),
            q = n.n(S),
            C = n(80129),
            F = n.n(C),
            L = n(83010),
            T = n(70242),
            O = n(37042),
            P = n(89679),
            R = n(80459),
            M = n(23577),
            D = n(85893),
            E = {
              wgts: [],
              showBackToTop: !1,
              loading: !0,
              isDefault: !1,
              storeInfo: null,
              distributorId: 0,
              info: null,
              skuPanelOpen: !1,
              open: !1,
              curFilterIdx: 0,
              posterModalOpen: !1,
              sharePanelOpen: !1,
              categoryList: [],
              leftList: [],
              rightList: [],
              newFilter: null,
              filterVisible: !1,
              selectedFilters: [],
              filterList: [
                { title: "综合" },
                { title: "折扣" },
                {
                  title: "价格",
                  icon: "fv_filter_sort",
                  down: "fv_filter_sort_down",
                  up: "fv_filter_sort_up",
                  type: "sort",
                },
              ],
              isFav: !1,
              isImmersive: !1,
              gNavbarH: 0,
              posterIsReady: !1,
              categoryId: "",
              mainCategoryId: "",
              gNavbarHeight: 0,
              scrollIntoContentItem: null,
              scrollY: 0,
              height: 0,
              loadingGoods: !1,
            };
          var H = function () {
            var e = (0, G.x)(E),
              t = (0, c.Z)(e, 2),
              n = t[0],
              o = t[1],
              S = (0, m.v9)(function (e) {
                return e.regionauth;
              }).regionauthInfo,
              C = (0, m.v9)(function (e) {
                return e.live;
              }).liveInfo,
              H = (0, u.useRef)(),
              Y = (0, u.useRef)(),
              z = (0, l.getCurrentInstance)(),
              A = n.wgts,
              V = n.loading,
              B = n.isDefault,
              K = n.distributorId,
              J = n.storeInfo,
              U = n.info,
              W = (n.skuPanelOpen, n.open, n.curFilterIdx),
              $ = n.sharePanelOpen,
              X = n.posterModalOpen,
              Q = n.categoryList,
              ee = n.leftList,
              te = n.rightList,
              ne = n.newFilter,
              oe = n.filterVisible,
              re = n.selectedFilters,
              ie = n.filterList,
              se = n.isFav,
              ae = n.isImmersive,
              ce = n.gNavbarH,
              ue = n.posterIsReady,
              le = n.categoryId,
              de = n.mainCategoryId,
              fe = n.gNavbarHeight,
              me = n.scrollIntoContentItem,
              pe = n.scrollY,
              he = (n.height, n.loadingGoods),
              ge = (0, m.I0)(),
              be = (0, u.useRef)(),
              ve = (0, P.Z)().getSystemConfig;
            (0, l.useDidShow)(function () {
              var e, t, n;
              we(),
                Ie(),
                null != z &&
                  null !== (e = z.router) &&
                  void 0 !== e &&
                  null !== (e = e.params) &&
                  void 0 !== e &&
                  e.ruleId &&
                  "fav" !=
                    (null == z ||
                    null === (t = z.router) ||
                    void 0 === t ||
                    null === (t = t.params) ||
                    void 0 === t
                      ? void 0
                      : t.type) &&
                  k.N_.postCenterTask({
                    ruleId:
                      null == z ||
                      null === (n = z.router) ||
                      void 0 === n ||
                      null === (n = n.params) ||
                      void 0 === n
                        ? void 0
                        : n.ruleId,
                  });
            }),
              (0, u.useEffect)(
                function () {
                  var e;
                  null != J &&
                    J.regionauth_id &&
                    null != J &&
                    J.distributor_id &&
                    (o(function (e) {
                      e.loadingGoods = !0;
                    }),
                    null === (e = Y.current) || void 0 === e || e.reset());
                },
                [
                  null == J ? void 0 : J.regionauth_id,
                  null == J ? void 0 : J.distributor_id,
                ]
              ),
              (0, u.useEffect)(
                function () {
                  K && _e();
                },
                [K]
              ),
              (0, l.useShareAppMessage)(function () {
                return Ze();
              }),
              (0, l.useShareTimeline)(function () {
                return Ze();
              });
            var _e = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e() {
                    var t, n, r;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (((t = !1), !v.Z.getAuthToken())) {
                              e.next = 7;
                              break;
                            }
                            return (e.next = 4), w.Z.member.storeIsFav(K);
                          case 4:
                            (n = e.sent), (r = n.is_fav), (t = r);
                          case 7:
                            o(function (e) {
                              e.isFav = t;
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
              xe = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e(t, n) {
                    var r, a, c, u;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (e.next = 2),
                              w.Z.shop.getShopCategoryList({
                                distributor_id: t,
                              })
                            );
                          case 2:
                            return (
                              (r = e.sent),
                              (e.next = 5),
                              w.Z.category.get({
                                distributor_id: t,
                                is_marketing_category: 1,
                              })
                            );
                          case 5:
                            return (
                              (a = e.sent),
                              (c =
                                (0, k.D9)(a, N.Z.shop.SHOP_CATEGORY_ITEM) ||
                                []),
                              (u =
                                (0, k.D9)(r, N.Z.shop.SHOP_CATEGORY_ITEM) ||
                                []),
                              o(function (e) {
                                e.categoryList = [
                                  { id: "", name: "全部商品", image: n },
                                ].concat((0, i.Z)(c), (0, i.Z)(u));
                              }),
                              (e.next = 11),
                              Ne(K)
                            );
                          case 11:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t, n) {
                  return e.apply(this, arguments);
                };
              })(),
              je = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e(t) {
                    var r, i, a, c, u, l, d, f, m, p, h, g;
                    return (0, s.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (r = t.pageIndex),
                                (i = t.pageSize),
                                (a = void 0 === i ? 10 : i),
                                (e.prev = 1),
                                (c = {
                                  page: r,
                                  pageSize: a,
                                  approve_status: "onsale,only_show",
                                  item_type: "normal",
                                  is_point: "false",
                                  distributor_id: K,
                                  marketing_category_id: le,
                                  main_category: de,
                                }),
                                null != J &&
                                  J.regionauth_id &&
                                  ((c.noRegionauth = !0),
                                  (c.regionauth_id =
                                    null == J ? void 0 : J.regionauth_id)),
                                (u = []),
                                re.forEach(function (e) {
                                  "category" == e.type
                                    ? (c.main_category = e.value)
                                    : "discount" == e.type
                                    ? (c.discount_rate = e.value)
                                    : "price" == e.type
                                    ? ((c.start_price = e.min),
                                      (c.end_price = e.max))
                                    : "brand" == e.type
                                    ? (c.distributor_id = e.id)
                                    : "spec" == e.type &&
                                      u.push({
                                        spec_id: e.attribute_id,
                                        spec_value_id: e.attribute_value_id,
                                      });
                                }),
                                1 == n.curFilterIdx
                                  ? (c.goodsSort = 6)
                                  : (2 == n.curFilterIdx ||
                                      3 == n.curFilterIdx) &&
                                    (c.goodsSort = n.sortOrder),
                                (e.next = 9),
                                w.Z.item.search(c)
                              );
                            case 9:
                              return (
                                (l = e.sent),
                                (d = l.list),
                                (f = l.total_count),
                                (m = l.newFilter),
                                l.specific_crowd,
                                (p = (0, k.D9)(d, Z.Z.goods.ITEM_LIST_GOODS)),
                                (h = p.filter(function (e, t) {
                                  if (t % 2 == 0) return e;
                                })),
                                (g = p.filter(function (e, t) {
                                  if (t % 2 == 1) return e;
                                })),
                                o(function (e) {
                                  (e.leftList[r - 1] = h),
                                    (e.rightList[r - 1] = g),
                                    (e.newFilter = m),
                                    (e.loadingGoods = !1);
                                }),
                                e.abrupt("return", { total: f })
                              );
                            case 22:
                              (e.prev = 22),
                                (e.t0 = e.catch(1)),
                                o(function (e) {
                                  e.loadingGoods = !1;
                                });
                            case 25:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[1, 22]]
                    );
                  })
                );
                return function (t) {
                  return e.apply(this, arguments);
                };
              })(),
              ye = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e() {
                    var t, n;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (t = d().getStorageSync(g.z2)),
                              (e.next = 3),
                              k.N_.getRouteParams()
                            );
                          case 3:
                            return (
                              (n = e.sent),
                              e.abrupt(
                                "return",
                                n && (n.id || n.dtid || n.uid) ? n : t
                              )
                            );
                          case 5:
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
              Ie = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e() {
                    var t, n;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), d().getSystemInfoSync();
                          case 2:
                            (t = e.sent),
                              (n = t.statusBarHeight),
                              o(function (e) {
                                e.statusBarHeight = n;
                              });
                          case 5:
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
              we = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e() {
                    var t, n, i, a, c, u, l, d, f, m, p, h, g, v, _, x, j, y, I;
                    return (0, s.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (e.prev = 0), (e.next = 3), ye();
                            case 3:
                              return (
                                (t = e.sent),
                                (n = t.id),
                                (i = t.dtid),
                                (a = t.uid),
                                (c = t.previousPage),
                                (u = t.searchModule),
                                (l = t.keyword),
                                (d = (0, k.ik)(n || i || a)),
                                (e.next = 13),
                                w.Z.distribution.merchantIsvaild({
                                  distributor_id: d,
                                })
                              );
                            case 13:
                              if (((f = e.sent), f.status)) {
                                e.next = 20;
                                break;
                              }
                              return (
                                o(function (e) {
                                  (e.isDefault = !0), (e.loading = !1);
                                }),
                                e.abrupt("return")
                              );
                            case 20:
                              return (
                                (e.next = 22),
                                w.Z.shop.getShop({
                                  distributor_id: d,
                                  show_score: 1,
                                  show_marketing_activity: 1,
                                })
                              );
                            case 22:
                              return (
                                (m = e.sent),
                                (e.next = 25),
                                w.Z.shop.getStoreShopTemplate({
                                  distributor_id: d,
                                })
                              );
                            case 25:
                              if (
                                ((p = e.sent),
                                (h = p.config),
                                (g = p.pages_template_id),
                                (v = (0, k.D9)(m, Z.Z.shop.STORE_INFO)),
                                (_ = null == S ? void 0 : S.regionauth_code),
                                null == v ||
                                  !v.regionauth_id ||
                                  (null == v ? void 0 : v.regionauth_id) ==
                                    (null == S ? void 0 : S.regionauth_id))
                              ) {
                                e.next = 42;
                                break;
                              }
                              return (
                                (e.next = 33),
                                w.Z.regionauth.getRegionauthList({
                                  noRegionauth: !0,
                                })
                              );
                            case 33:
                              return (
                                (x = e.sent),
                                (j = x.list),
                                (y = j.find(function (e) {
                                  return (
                                    e.regionauth_id ===
                                    (null == v ? void 0 : v.regionauth_id)
                                  );
                                })),
                                (e.next = 38),
                                ge((0, M.Lt)(y))
                              );
                            case 38:
                              return (
                                ve(y.regionauth_id),
                                (e.next = 41),
                                ge((0, M.TX)(y))
                              );
                            case 41:
                              _ = y.regionauth_code;
                            case 42:
                              if (
                                2 === (null == v ? void 0 : v.shop_status) ||
                                9 === (null == v ? void 0 : v.shop_status) ||
                                0 === (null == v ? void 0 : v.shop_status)
                              ) {
                                e.next = 51;
                                break;
                              }
                              return (
                                !C &&
                                  null != v &&
                                  v.channel_id &&
                                  null != v &&
                                  v.user_id &&
                                  (ge(
                                    (0, b.Sb)({
                                      liveId: v.channel_id,
                                      uid: v.user_id,
                                    })
                                  ),
                                  ge((0, b.Lo)(!0))),
                                (I =
                                  h &&
                                  h.map(function (e) {
                                    return (0,
                                    r.Z)((0, r.Z)({}, e), {}, { pages_template_id: g, pagetype: "店铺" });
                                  })),
                                o(function (e) {
                                  (e.wgts = I || []),
                                    (e.distributorId = d),
                                    (e.storeInfo = (0, r.Z)(
                                      (0, r.Z)({}, v),
                                      {},
                                      { regionauth_code: _ }
                                    )),
                                    (e.loading = !1);
                                }),
                                c &&
                                  u &&
                                  l &&
                                  (0, R.setSearchResultGio)({
                                    searchWord: l,
                                    searchModule: u,
                                    sourceEntrance: c,
                                    resultNumber: 0,
                                    ifSearchResult: "其他",
                                  }),
                                (e.next = 49),
                                xe(d, null == v ? void 0 : v.logo)
                              );
                            case 49:
                              e.next = 52;
                              break;
                            case 51:
                              o(function (e) {
                                (e.loading = !1), (e.isDefault = !0);
                              });
                            case 52:
                              e.next = 57;
                              break;
                            case 54:
                              (e.prev = 54),
                                (e.t0 = e.catch(0)),
                                o(function (e) {
                                  e.loading = !1;
                                });
                            case 57:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 54]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              Ne = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e(t) {
                    var n, o, r, i, a, c, u, l;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (a = {
                                distributor_id: t,
                                shop_type: "distributor",
                              }),
                              (e.next = 3),
                              w.Z.cart.get(a)
                            );
                          case 3:
                            (c = e.sent),
                              (u = c.valid_cart),
                              (l = {
                                shop_id:
                                  void 0 === u
                                    ? ""
                                    : (null === (n = u[0]) || void 0 === n
                                        ? void 0
                                        : n.shop_id) || "",
                                cart_total_num:
                                  void 0 === u
                                    ? ""
                                    : (null === (o = u[0]) || void 0 === o
                                        ? void 0
                                        : o.cart_total_num) || "",
                                total_fee:
                                  void 0 === u
                                    ? ""
                                    : (null === (r = u[0]) || void 0 === r
                                        ? void 0
                                        : r.total_fee) || "",
                                discount_fee:
                                  void 0 === u
                                    ? ""
                                    : (null === (i = u[0]) || void 0 === i
                                        ? void 0
                                        : i.discount_fee) || "",
                                storeDetails: void 0 === u ? "" : u[0] || {},
                              }),
                              ge((0, O.ho)(l));
                          case 7:
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
              Ze = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e() {
                    var t, n, o, r;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), ye();
                          case 2:
                            return (
                              (t = e.sent),
                              (n = t.id || t.dtid),
                              (o = {
                                dtid: n,
                                crmcode: null == S ? void 0 : S.regionauth_code,
                              }),
                              (r = "/subpages/store/index?".concat(
                                F().stringify(o)
                              )),
                              k.cM.debug("share path: ".concat(r)),
                              e.abrupt("return", {
                                title: null == J ? void 0 : J.name,
                                imageUrl: null == J ? void 0 : J.logo,
                                path: r,
                              })
                            );
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
              ke = q()(function (e) {
                var t = e.detail.scrollTop;
                o(function (e) {
                  (e.scrollY = t), (e.isImmersive = t > 100);
                });
              }, 90),
              Ge = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e() {
                    var t, n, i, a;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              ((0, R.setFlowClickGio)({
                                position: 1,
                                index: 1,
                                moduleName_var: "店铺关注",
                                title: se ? "取消关注" : "关注店铺",
                                regionauth_code:
                                  (null == S ? void 0 : S.regionauth_code) ||
                                  "-",
                              }),
                              !se)
                            ) {
                              e.next = 6;
                              break;
                            }
                            return (e.next = 4), w.Z.member.storeFavDel(K);
                          case 4:
                            e.next = 9;
                            break;
                          case 6:
                            return (e.next = 8), w.Z.member.storeFav(K);
                          case 8:
                            (0, R.setAuthorizationClickGio)(
                              (0, r.Z)(
                                {
                                  shopName: null == J ? void 0 : J.name,
                                  shopCode: null == J ? void 0 : J.shop_code,
                                },
                                J
                              )
                            );
                          case 9:
                            return (
                              !se &&
                                ((null != z &&
                                  null !== (t = z.router) &&
                                  void 0 !== t &&
                                  null !== (t = t.params) &&
                                  void 0 !== t &&
                                  t.ruleId) ||
                                  d()
                                    .getStorageSync("task_shop_list")
                                    .includes(K)) &&
                                k.N_.postCenterTask({
                                  ruleId:
                                    (null == z ||
                                    null === (n = z.router) ||
                                    void 0 === n ||
                                    null === (n = n.params) ||
                                    void 0 === n
                                      ? void 0
                                      : n.ruleId) ||
                                    d().getStorageSync("task_shop_rule_id"),
                                }),
                              (e.next = 12),
                              w.Z.member.storeIsFav(K)
                            );
                          case 12:
                            (i = e.sent),
                              (a = i.is_fav),
                              o(function (e) {
                                e.isFav = a;
                              });
                          case 15:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })();
            return (0, D.jsxs)(_.nO, {
              className: "page-store-index",
              isDefault: B,
              defaultMsg: "该店铺已下架，在别的店铺看看吧",
              loading: V,
              scrollToTopBtn: !0,
              ref: be,
              pageType: "store_home",
              adParams: { distributor_id: K },
              showLive: !0,
              renderNavigation: B
                ? (0, D.jsx)(D.Fragment, {})
                : V
                ? null
                : (0, D.jsxs)(f.G7, {
                    className: "page-store-index-title",
                    children: [
                      (0, D.jsx)(f.G7, {
                        className: "page-store-index-title-search",
                        children: (0, D.jsx)(_.mW, {
                          placeholder: "搜索品牌商品",
                          type: "store",
                          dtid: K,
                        }),
                      }),
                      (0, D.jsx)(f.G7, {
                        className: "page-store-index-title-icons",
                        children: (0, D.jsx)(f.G7, {
                          className: "page-store-index-title-icon-item",
                          children: (0, D.jsx)(_.Ko, {
                            src: "fv_reply.png",
                            className: "page-store-index-title-share-icon",
                            onClick: function () {
                              (0, R.setShareButtonClickGio)(
                                (0, r.Z)(
                                  {
                                    shopName: null == J ? void 0 : J.name,
                                    shopCode: null == J ? void 0 : J.shop_code,
                                  },
                                  J
                                )
                              ),
                                o(function (e) {
                                  e.sharePanelOpen = !0;
                                });
                            },
                          }),
                        }),
                      }),
                    ],
                  }),
              onReady: function (e) {
                o(function (t) {
                  (t.gNavbarH = e.gNavbarH), (t.height = e.height);
                });
              },
              children: [
                (0, D.jsxs)(x.ii, {
                  scrollY: !0,
                  style: { height: "100%" },
                  scrollIntoView: me,
                  onScroll: function (e) {
                    ke(e);
                  },
                  fetch: je,
                  ref: Y,
                  auto: !1,
                  pageSize: 10,
                  renderMore: (0, D.jsx)(D.Fragment, {}),
                  children: [
                    (0, D.jsx)(f.G7, {
                      className: "comp-shop-brand",
                      children: (0, D.jsxs)(f.G7, {
                        className: "shop-brand-hd",
                        children: [
                          (0, D.jsx)(_.Ko, {
                            className: "store-logo",
                            src: null == J ? void 0 : J.logo,
                            mode: "aspectFit",
                          }),
                          (0, D.jsxs)(f.G7, {
                            className: "store-info",
                            children: [
                              (0, D.jsx)(f.G7, {
                                className: "store-name",
                                children: null == J ? void 0 : J.name,
                              }),
                              (0, D.jsx)(f.G7, {
                                className: "store-address",
                                children: null == J ? void 0 : J.address,
                              }),
                              (null == J ? void 0 : J.phone) &&
                                (0, D.jsxs)(f.G7, {
                                  className: "store-phone",
                                  onClick: function () {
                                    (0, R.setFlowClickGio)({
                                      position: 1,
                                      index: 1,
                                      moduleName_var: "店铺联系方式",
                                      title: J.phone,
                                      regionauth_code:
                                        (null == S
                                          ? void 0
                                          : S.regionauth_code) || "-",
                                    }),
                                      d().makePhoneCall({
                                        phoneNumber: J.phone,
                                      });
                                  },
                                  children: [
                                    (0, D.jsx)(f.xv, {
                                      className:
                                        "phone-icon iconfont icon-a-iconphone",
                                    }),
                                    (0, D.jsx)(f.xv, { children: J.phone }),
                                  ],
                                }),
                            ],
                          }),
                          (0, D.jsxs)(f.G7, {
                            className: "comp-shop-brand-make",
                            children: [
                              (0, D.jsx)(I.Z, {
                                className: "comp-shop-brand-make-item",
                                onChange: Ge,
                                children: (0, D.jsx)(_.Ko, {
                                  src: se
                                    ? "fv_star_fav.png"
                                    : "fv_star_outline.png",
                                  width: se ? 56 : 40,
                                  height: se ? 56 : 40,
                                }),
                              }),
                              (0, D.jsx)(f.G7, {
                                className: "comp-shop-brand-make-item",
                                children: (0, D.jsx)(p.Z, {
                                  iconStyle: {
                                    width: "40rpx",
                                    height: "40rpx",
                                    fontSize: "40rpx",
                                  },
                                  townTag: (0, h.jJ)({
                                    regionauthId:
                                      null == J ? void 0 : J.regionauth_id,
                                    regionauthName:
                                      null == J ? void 0 : J.regionauth_name,
                                  }),
                                  callback: function () {
                                    (0, R.setFlowClickGio)({
                                      position: 1,
                                      index: 2,
                                      moduleName_var: "店铺客服",
                                      title: "客服",
                                      regionauth_code:
                                        (null == S
                                          ? void 0
                                          : S.regionauth_code) || "-",
                                    });
                                  },
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    (0, D.jsxs)(f.G7, {
                      className: "page-store-index-store-header",
                      style: {
                        opacity: ae ? 1 : 0,
                        top: "".concat(ce, "px"),
                        transform: ae ? "translateY(0)" : "translateY(-100%)",
                        transition: "all 0.3s ease-in-out",
                      },
                      children: [
                        (0, D.jsxs)(f.G7, {
                          className: "page-store-index-store-header-left",
                          children: [
                            (0, D.jsx)(_.Ko, {
                              src: null == J ? void 0 : J.logo,
                              width: 56,
                              height: 56,
                              className: "page-store-index-store-header-logo",
                              mode: "aspectFill",
                            }),
                            (0, D.jsx)(f.G7, {
                              className: "page-store-index-store-header-name",
                              children: null == J ? void 0 : J.name,
                            }),
                          ],
                        }),
                        (0, D.jsxs)(f.G7, {
                          className: "page-store-index-store-header-right",
                          children: [
                            (0, D.jsx)(f.G7, {
                              className: "page-store-index-store-header-icon",
                              children: (0, D.jsx)(I.Z, {
                                onChange: Ge,
                                children: (0, D.jsx)(_.Ko, {
                                  src: se
                                    ? "fv_star_fav.png"
                                    : "fv_star_outline.png",
                                  width: se ? 56 : 40,
                                  height: se ? 56 : 40,
                                }),
                              }),
                            }),
                            (0, D.jsx)(f.G7, {
                              className: "page-store-index-store-header-icon",
                              children: (0, D.jsx)(p.Z, {
                                iconStyle: {
                                  width: "40rpx",
                                  height: "40rpx",
                                  fontSize: "40rpx",
                                },
                                townTag: (0, h.jJ)({
                                  regionauthId:
                                    null == J ? void 0 : J.regionauth_id,
                                  regionauthName:
                                    null == J ? void 0 : J.regionauth_name,
                                }),
                                callback: function () {
                                  (0, R.setFlowClickGio)({
                                    position: 1,
                                    index: 2,
                                    moduleName_var: "店铺客服",
                                    title: "客服",
                                    regionauth_code:
                                      (null == S
                                        ? void 0
                                        : S.regionauth_code) || "-",
                                  });
                                },
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, D.jsx)(f.G7, {
                      className: "page-store-index-wgt",
                      children: (0, D.jsx)(T.B.Provider, {
                        value: {
                          distributorId: K,
                          gNavbarHeight: fe,
                          changeItem: function (e) {
                            o(function (t) {
                              t.scrollIntoContentItem = e;
                            }),
                              d().nextTick(function () {
                                o(function (e) {
                                  e.scrollIntoContentItem = null;
                                });
                              });
                          },
                          scrollY: pe,
                          scrollSelector: ".sp-scrollview-native",
                        },
                        children: (0, D.jsx)(L.Z, { wgts: A, dtid: K }),
                      }),
                    }),
                    (0, D.jsxs)(f.G7, {
                      className: "page-store-index-content",
                      children: [
                        (0, D.jsxs)(f.G7, {
                          className: "page-store-index-content-header",
                          style: { top: "80rpx" },
                          children: [
                            (0, D.jsx)(f.G7, {
                              className:
                                "page-store-index-content-header-category",
                              children: (0, D.jsx)(_.sm, {
                                data: Q,
                                onClick: function (e, t) {
                                  var n;
                                  (0, R.setFlowClickGio)({
                                    position: 1,
                                    index: t + 1,
                                    moduleName_var: "店铺类目",
                                    title: e.name,
                                    regionauth_code:
                                      (null == S
                                        ? void 0
                                        : S.regionauth_code) || "-",
                                  }),
                                    1 == (null == e ? void 0 : e.isMain)
                                      ? o(function (t) {
                                          (t.mainCategoryId = e.id),
                                            (t.categoryId = ""),
                                            (t.leftList = []),
                                            (t.rightList = []),
                                            (t.selectedFilters = []),
                                            (t.loadingGoods = !0);
                                        })
                                      : o(function (t) {
                                          (t.categoryId = e.id),
                                            (t.mainCategoryId = ""),
                                            (t.leftList = []),
                                            (t.rightList = []),
                                            (t.selectedFilters = []),
                                            (t.loadingGoods = !0);
                                        }),
                                    null === (n = Y.current) ||
                                      void 0 === n ||
                                      n.reset();
                                },
                              }),
                            }),
                            (0, D.jsx)(x.nw, {
                              custom: !0,
                              list: ie,
                              current: W,
                              onChange: function (e) {
                                var t;
                                o(function (t) {
                                  (t.loadingGoods = !0),
                                    (t.leftList = []),
                                    (t.rightList = []),
                                    (t.curFilterIdx = e.current || 0),
                                    (t.sortOrder = 1 == e.sort ? 3 : 2);
                                }),
                                  null === (t = Y.current) ||
                                    void 0 === t ||
                                    t.reset();
                              },
                              onFilter: function () {
                                o(function (e) {
                                  e.filterVisible = !0;
                                });
                              },
                            }),
                          ],
                        }),
                        (0, D.jsxs)(f.G7, {
                          className:
                            "page-store-index-content-goods-list pt-18 pl-24 pr-24 box-border",
                          style: { height: he ? "80vh" : void 0 },
                          children: [
                            (0, D.jsx)(f.G7, {
                              className:
                                "page-store-index-content-goods-list-left-container",
                              children:
                                null == ee
                                  ? void 0
                                  : ee.map(function (e, t) {
                                      return null == e
                                        ? void 0
                                        : e.map(function (e, n) {
                                            return (0,
                                            D.jsx)(f.G7, { className: "goods-item-wrap", id: "goods-item-l__".concat(t, "_").concat(n), children: (0, D.jsx)(j.T$, { className: "mb-18", width: 342, info: e, moduleName: "".concat(null == J ? void 0 : J.name, "店铺商品"), modulePosition: 1, flowPosition: "".concat(2 * n + 1) }, e.item_id) }, "goods-item-l__".concat(t, "_").concat(n));
                                          });
                                    }),
                            }),
                            (0, D.jsx)(f.G7, {
                              className:
                                "page-store-index-content-goods-list-right-container",
                              children:
                                null == te
                                  ? void 0
                                  : te.map(function (e, t) {
                                      return null == e
                                        ? void 0
                                        : e.map(function (e, n) {
                                            return (0,
                                            D.jsx)(f.G7, { className: "goods-item-wrap", children: (0, D.jsx)(j.T$, { className: "mb-18", width: 342, info: e, moduleName: "".concat(null == J ? void 0 : J.name, "店铺商品"), modulePosition: 1, flowPosition: "".concat(2 * n + 2) }, e.item_id) }, "goods-item-r__".concat(t, "_").concat(n));
                                          });
                                    }),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (0, D.jsx)(y.Z, {
                  open: $,
                  posterIsReady: ue && X,
                  title: "店铺分享至",
                  onClose: function () {
                    o(function (e) {
                      (e.sharePanelOpen = !1), (e.posterModalOpen = !1);
                    });
                  },
                  onCreatePoster: function () {
                    o(function (e) {
                      e.posterModalOpen = !0;
                    });
                  },
                  onSavePoster: function () {
                    H.current.saveToAlbum();
                  },
                  onShareEdit: function () {
                    var e = U.itemId,
                      t = U.companyId,
                      n = U.distributorId;
                    d().navigateTo({
                      url: "/subpage/pages/editShare/index?id="
                        .concat(e, "&dtid=")
                        .concat(n, "&company_id=")
                        .concat(t),
                    });
                  },
                }),
                X &&
                  (0, D.jsx)(_.UU, {
                    ref: H,
                    info: J,
                    type: "store",
                    onReadyPosterChange: function (e) {
                      o(function (t) {
                        t.posterIsReady = e;
                      });
                    },
                    onClose: function () {
                      o(function (e) {
                        e.posterModalOpen = !1;
                      });
                    },
                  }),
                ne
                  ? (0, D.jsx)(x.jl, {
                      visible: oe,
                      selectedFilters: re,
                      onClose: function () {
                        return o(function (e) {
                          e.filterVisible = !1;
                        });
                      },
                      onConfirm: function (e) {
                        var t;
                        o(function (t) {
                          (t.selectedFilters = e),
                            (t.leftList = []),
                            (t.rightList = []),
                            (t.filterVisible = !1),
                            (t.loadingGoods = !0);
                        }),
                          null === (t = Y.current) || void 0 === t || t.reset();
                      },
                      onReset: function () {
                        var e;
                        o(function (e) {
                          (e.selectedFilters = []),
                            (e.leftList = []),
                            (e.rightList = []),
                            (e.filterVisible = !1),
                            (e.loadingGoods = !0);
                        }),
                          null === (e = Y.current) || void 0 === e || e.reset();
                      },
                      newFilter: ne,
                      hideItem: ["brand"],
                    })
                  : null,
              ],
            });
          };
          (H.enableShareTimeline = !0),
            (H.enableShareAppMessage = !0),
            Page(
              (0, o.createPageConfig)(
                H,
                "subpages/store/index",
                { root: { cn: [] } },
                { navigationStyle: "custom" } || {}
              )
            );
        },
      },
      function (e) {
        e.O(
          0,
          [
            6758, 7531, 2881, 6437, 5014, 3096, 6010, 8206, 9246, 5710, 6549,
            6220, 1497, 1193, 2903, 4508, 9741, 7312, 7811, 7299, 1699, 761,
            7677, 2817, 9887, 3197, 9651, 5386, 7576, 4300, 998, 2224, 2302,
            8322, 3139, 7502, 8075, 6353, 3921, 7162, 4487, 9658, 5200, 9444,
            9934, 396, 7078, 5469, 2592, 3455, 7453, 1471, 5987, 1871, 7738,
            4539, 7191, 796, 8535, 4160, 3145, 3080, 9579, 1795, 2528, 5882,
            2107, 1216, 8592,
          ],
          function () {
            return (function (t) {
              return e((e.s = t));
            })(63615);
          }
        ),
          e.O();
      },
    ]);
})();
