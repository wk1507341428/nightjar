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
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [3546],
      {
        16398: function (e, t, r) {
          var n = r(32180),
            i = r(1413),
            o = r(74165),
            a = r(15861),
            s = r(29439),
            c = r(67294),
            u = r(71515),
            l = r(92954),
            d = r.n(l),
            f = r(31707),
            m = r(90057),
            p = r(78061),
            g = r(98178),
            b = r(48775),
            h = r(27741),
            v = r(1696),
            _ = r(96856),
            x = r(96943),
            y = r(80459),
            j = r(90513),
            w = r(85893);
          function N(e) {
            var t = e.searchResultGio,
              r = void 0 === t ? function () {} : t,
              n = e.item,
              i = void 0 === n ? {} : n,
              o = e.showRegion,
              a =
                void 0 !== o && o
                  ? (function () {
                      var e =
                          arguments.length > 0 && void 0 !== arguments[0]
                            ? arguments[0]
                            : "",
                        t = String(e || "").trim();
                      return t ? (t.length >= 2 ? t.slice(0, 2) : t) : "";
                    })(i.regionauth_name)
                  : "",
              s = (function () {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : {},
                  t = e.category_name || "",
                  r = Number(e.item_num) || 0,
                  n = r > 0 ? "在售".concat(r, "件商品") : "";
                return t && n ? "".concat(t, "｜").concat(n) : t || n;
              })(i);
            return (0, w.jsxs)(u.G7, {
              className: (0, _.AK)(
                "subpage-search-component store-info",
                e.className
              ),
              onClick: function () {
                return r();
              },
              children: [
                (0, w.jsx)(p.Ko, {
                  className: "store-info__logo",
                  src: i.logo,
                  width: 108,
                  height: 108,
                  radius: 8,
                  mode: "aspectFill",
                }),
                (0, w.jsxs)(u.G7, {
                  className: "store-info__info",
                  children: [
                    (0, w.jsxs)(u.G7, {
                      className: "store-info__name-row",
                      children: [
                        a
                          ? (0, w.jsxs)(w.Fragment, {
                              children: [
                                (0, w.jsx)(u.xv, {
                                  className: "store-info__region",
                                  children: a,
                                }),
                                (0, w.jsx)(u.G7, {
                                  className: "store-info__dot",
                                }),
                              ],
                            })
                          : null,
                        (0, w.jsx)(u.xv, {
                          className: "store-info__name",
                          children: i.name,
                        }),
                      ],
                    }),
                    s
                      ? (0, w.jsx)(u.G7, {
                          className: "store-info__desc",
                          children: s,
                        })
                      : null,
                  ],
                }),
                (0, w.jsx)(u.G7, {
                  className: "store-info__btn",
                  onClick: function (e) {
                    e.stopPropagation(),
                      (function (e) {
                        if (null != e && e.link) {
                          var t = String(e.link).startsWith("/")
                            ? e.link
                            : "/".concat(e.link);
                          d().navigateTo({ url: t });
                        } else
                          d().navigateTo({
                            url: "/subpages/store/index?id=".concat(
                              (null == e ? void 0 : e.distributor_id) || ""
                            ),
                          });
                      })(i);
                  },
                  children: "进入店铺",
                }),
              ],
            });
          }
          (N.options = { addGlobalClass: !0 }),
            (N.defaultProps = { className: "", item: {}, showRegion: !1 });
          var k = N;
          function L(e) {
            var t = (function () {
              var t = (0, a.Z)(
                (0, o.Z)().mark(function t() {
                  var r;
                  return (0, o.Z)().wrap(function (t) {
                    for (;;)
                      switch ((t.prev = t.next)) {
                        case 0:
                          return (t.next = 2), e.onClickGio;
                        case 2:
                          if (((t.t0 = t.sent), !t.t0)) {
                            t.next = 5;
                            break;
                          }
                          e.onClickGio();
                        case 5:
                          null !== (r = e.info) &&
                            void 0 !== r &&
                            r.link_path &&
                            (0, _.bz)(JSON.parse(e.info.link_path));
                        case 6:
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
            return (0, w.jsx)(u.G7, {
              className: (0, _.AK)(
                "subpage-search-component brand-ad",
                e.className
              ),
              onClick: t,
              children: (0, w.jsx)(p.Ko, {
                className: "brand-ad__logo",
                mode: "widthFix",
                src: e.info.ad_pic,
                width: 702,
              }),
            });
          }
          (L.options = { addGlobalClass: !0 }),
            (L.defaultProps = { className: "", info: null });
          var R = L,
            I = r(81906);
          function G() {
            var e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : {},
              t = e.is_cross_region;
            return 1 == t || "1" === t || !0 === t;
          }
          function Z() {
            var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {};
            return !G(e);
          }
          function F() {
            var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : [];
            return e.some(function (e) {
              return G(e);
            });
          }
          function q(e) {
            if (null == e || "" === e) return e;
            var t = String(e);
            if (!/%[0-9A-Fa-f]{2}/.test(t)) return t;
            try {
              return decodeURIComponent(t.replace(/\+/g, " "));
            } catch (e) {
              return t;
            }
          }
          function C() {
            var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : [];
            return e.some(function (e) {
              return Z(e);
            });
          }
          var T = {
            brandSelect: [],
            bgImg: "",
            brandAdInfo: null,
            categoryList: [],
            curFilterIdx: 0,
            curTagIdx: 0,
            card_id: null,
            fixTop: 0,
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
            filterVisible: !1,
            gNavbarH: 0,
            hasChat: null,
            hasStore: !1,
            info: null,
            itemListLeft: [],
            itemListRight: [],
            keywords: "",
            newFilter: null,
            offsetHight: 0,
            routerParams: null,
            selectType: "picker",
            selectedFilters: [],
            sortOrder: null,
            storeList: [],
            searchResultEmpty: !1,
            tagList: [],
            virtualWaterfallHeight: 0,
            totalData: 0,
            scrollTop: 0,
          };
          function S() {
            var e,
              t,
              r,
              n,
              N = (0, l.useRouter)(),
              L = (0, m.x)(T),
              G = (0, s.Z)(L, 2),
              Z = G[0],
              S = G[1],
              P = (0, f.v9)(function (e) {
                return e.shop;
              }).shopInfo,
              A = (0, f.v9)(function (e) {
                return e.live;
              }).liveInfo,
              E = (0, f.v9)(function (e) {
                return e.regionauth;
              }).regionauthInfo,
              H = void 0 === E ? {} : E,
              O = (Z.totalData, (0, c.useRef)(null)),
              W = (0, c.useRef)(),
              V = (0, c.useRef)(""),
              D = (0, c.useRef)("0"),
              z = (0, c.useRef)(!1),
              K = (0, c.useRef)(!1),
              M = (0, c.useRef)(!0),
              J = (0, c.useRef)(!1);
            (0, c.useEffect)(function () {
              _.N_.getRouteParams(N.params).then(function (e) {
                (V.current = decodeURIComponent(
                  (null == e ? void 0 : e.keywords) || ""
                )),
                  $();
              });
            }, []);
            var B = function () {
                var e =
                  arguments.length > 0 &&
                  void 0 !== arguments[0] &&
                  arguments[0];
                d().nextTick(function () {
                  setTimeout(function () {
                    d()
                      .createSelectorQuery()
                      .select("#filter-container")
                      .boundingClientRect(function (t) {
                        if (t) {
                          var r = d().getWindowInfo().windowHeight;
                          S(function (e) {
                            (e.virtualWaterfallHeight = r - t.bottom),
                              (e.keywords = V.current);
                          }),
                            e &&
                              d().nextTick(function () {
                                var e;
                                null === (e = O.current) ||
                                  void 0 === e ||
                                  e.refresh();
                              });
                        }
                      })
                      .exec();
                  }, 500);
                });
              },
              U = (function () {
                var e = (0, a.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var r, n;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (!K.current) {
                              e.next = 2;
                              break;
                            }
                            return e.abrupt("return");
                          case 2:
                            if (
                              (r = Array.isArray(t)
                                ? t
                                    .filter(function (e) {
                                      return null != e && "" !== e;
                                    })
                                    .join(",")
                                : "")
                            ) {
                              e.next = 6;
                              break;
                            }
                            return (
                              S(function (e) {
                                e.categoryList = [];
                              }),
                              e.abrupt("return")
                            );
                          case 6:
                            return (
                              (e.next = 8),
                              v.Z.item.getSearchCategories({
                                category_id: r,
                                size: 100,
                              })
                            );
                          case 8:
                            (n = e.sent),
                              S(function (e) {
                                e.categoryList = n && n.length > 4 ? n : [];
                              }),
                              B(!1);
                          case 11:
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
              $ = (function () {
                var e = (0, a.Z)(
                  (0, o.Z)().mark(function e() {
                    var t, r, n, i, a, s;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (r = { input: V.current, size: 10 }),
                              "1" == D.current && (r.extend = "1"),
                              (e.next = 4),
                              v.Z.item.getSearchDistributor(r)
                            );
                          case 4:
                            (n = e.sent),
                              (a =
                                null ===
                                  (t = (i = n || []).find(function (e) {
                                    return "" !== e.banner;
                                  })) || void 0 === t
                                  ? void 0
                                  : t.banner),
                              (s = C(i)),
                              (z.current = s),
                              (K.current = i.length > 0),
                              0 == i.length
                                ? S(function (e) {
                                    (e.bgImg = ""),
                                      (e.storeList = []),
                                      (e.categoryList = []);
                                  })
                                : S(function (e) {
                                    (e.bgImg = a || ""),
                                      (e.storeList = i),
                                      (e.categoryList = []),
                                      s && (e.brandAdInfo = null);
                                  }),
                              B(!0);
                          case 12:
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
              Q = (function () {
                var e = (0, a.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var r,
                      n,
                      i,
                      a,
                      c,
                      u,
                      l,
                      d,
                      f,
                      m,
                      p,
                      g,
                      b,
                      w,
                      k,
                      L,
                      R,
                      I,
                      G,
                      F,
                      C,
                      T,
                      E,
                      W,
                      K,
                      B,
                      Q,
                      Y,
                      ee,
                      te,
                      re,
                      ne,
                      ie,
                      oe,
                      ae,
                      se,
                      ce,
                      ue,
                      le,
                      de,
                      fe,
                      me,
                      pe,
                      ge,
                      be;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (r = t.pageIndex),
                              (n = void 0 === r ? 1 : r),
                              (i = t.pageSize),
                              (a = N.params),
                              (c = a.tag_id),
                              (u = a.card_id),
                              (l = a.cat_id),
                              (d = a.main_cat_id),
                              (f = a.dtid),
                              (m = a.goodsSort),
                              (p = void 0 === m ? null : m),
                              (g = a.type),
                              (b = a.data_value),
                              (w = a.filters),
                              (k = a.category),
                              (L = a.main_category),
                              (R = a.start_price),
                              (I = a.end_price),
                              (G = a.discount_rate),
                              (F = a.distributor_id),
                              (C = a.searchModule),
                              (T = a.sourceEntrance),
                              (E = a.pages_template_id),
                              (W = a.noRegionauth),
                              (K = void 0 !== W && W),
                              (B = q(b)),
                              (Q = (0, j.nR)(w)),
                              (Y = {
                                page: n,
                                pageSize: i,
                                distributor_id: f,
                                keywords: V.current,
                                approve_status: "onsale,only_show",
                                item_type: "normal",
                                is_point: "false",
                                tag_id: c,
                                card_id: u,
                                goodsSort: p,
                              }),
                              K && (Y.noRegionauth = K),
                              ("items_group" != g && "items" != g) ||
                                ((Y.items_group_id = B),
                                E && (Y.pages_template_id = E)),
                              "price" == g &&
                                ((ee = B.split(",")),
                                (te = (0, s.Z)(ee, 2)),
                                (re = te[0]),
                                (ne = te[1]),
                                (Y.start_price = re),
                                (Y.end_price = ne)),
                              "discount" == g &&
                                (Y.discount_rate = (0, j.WF)(B)),
                              "main_category" == g && (Y.main_category = B),
                              "category" == g && (Y.category = B),
                              (0, j.VD)(Y, Q),
                              null != k && "" !== k && (Y.category = q(k)),
                              null != L && "" !== L && (Y.main_category = q(L)),
                              null != R && "" !== R && (Y.start_price = q(R)),
                              null != I && "" !== I && (Y.end_price = q(I)),
                              null != G && "" !== G && (Y.discount_rate = q(G)),
                              null != F &&
                                "" !== F &&
                                (Y.distributor_id = q(F)),
                              (ie = []),
                              Z.selectedFilters.forEach(function (e) {
                                "category" == e.type
                                  ? (Y.main_category = e.value)
                                  : "discount" == e.type
                                  ? (Y.discount_rate = e.value)
                                  : "price" == e.type
                                  ? ((Y.start_price = e.min),
                                    (Y.end_price = e.max))
                                  : "brand" == e.type
                                  ? (Y.distributor_id = e.id)
                                  : "spec" == e.type &&
                                    ie.push({
                                      spec_id: e.attribute_id,
                                      spec_value_id: e.attribute_value_id,
                                    });
                              }),
                              (Y.item_spec = ie),
                              1 == Z.curFilterIdx
                                ? (Y.goodsSort = 6)
                                : (2 == Z.curFilterIdx ||
                                    3 == Z.curFilterIdx) &&
                                  (Y.goodsSort = Z.sortOrder),
                              Z.curTagIdx && (Y.tag_id = Z.curTagIdx),
                              l && (Y.category = l),
                              d && (Y.category_id = d),
                              "1" == D.current && (Y.extend = "1"),
                              _.FJ &&
                                (all
                                  ? (Y.distributor_id = 0)
                                  : (Y.distributor_id = u
                                      ? null == P
                                        ? void 0
                                        : P.distributor_id
                                      : (0, _.ik)())),
                              (e.next = 29),
                              v.Z.item.search(Y)
                            );
                          case 29:
                            if (
                              ((oe = e.sent),
                              (ae = oe.list),
                              (se = oe.total_count),
                              (ce = oe.newFilter),
                              (ue = oe.call_category),
                              (le = (0, _.D9)(ae, h.Z.goods.ITEM_LIST_GOODS)),
                              (de = null),
                              (fe = ""),
                              "0" != D.current || 1 != n || 0 != se)
                            ) {
                              e.next = 42;
                              break;
                            }
                            return (
                              (D.current = "1"),
                              $(),
                              setTimeout(function () {
                                O.current.refresh();
                              }, 100),
                              e.abrupt("return", { total: se })
                            );
                          case 42:
                            if (
                              (1 == n && U(ue),
                              1 !== n || 0 !== se || z.current)
                            ) {
                              e.next = 49;
                              break;
                            }
                            return (e.next = 46), X();
                          case 46:
                            (de = e.sent),
                              "default" ==
                                (null === (me = de) || void 0 === me
                                  ? void 0
                                  : me.type) && (fe = "默认营销位"),
                              "keyword" ==
                                (null === (pe = de) || void 0 === pe
                                  ? void 0
                                  : pe.type) && (fe = "关键词营销");
                          case 49:
                            return (
                              (ge = le.filter(function (e, t) {
                                return t % 2 == 0;
                              })),
                              (be = le.filter(function (e, t) {
                                return t % 2 == 1;
                              })),
                              S(function (e) {
                                (e.itemListLeft[n - 1] = ge),
                                  (e.itemListRight[n - 1] = be),
                                  (e.newFilter = ce),
                                  (e.searchResultEmpty = 0 == se),
                                  (e.brandAdInfo =
                                    "[object Array]" ===
                                    Object.prototype.toString.call(de)
                                      ? null
                                      : de),
                                  (e.totalData = se || 0),
                                  0 == se && (e.virtualWaterfallHeight = 0);
                              }),
                              1 == n &&
                                M.current &&
                                ((M.current = !1),
                                x.FF[C] &&
                                  ((J.current = !0),
                                  (0, y.setSearchResultGio)({
                                    searchWord: V.current,
                                    searchModule: x.FF[C],
                                    sourceEntrance: T,
                                    resultNumber: se,
                                    ifSearchResult: 0 == se ? "否" : "是",
                                    townName:
                                      null == H ? void 0 : H.regionauth_code,
                                    liveId: null == A ? void 0 : A.liveId,
                                    noResultType: fe,
                                  }))),
                              e.abrupt("return", { total: se })
                            );
                          case 54:
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
              X = (function () {
                var e = (0, a.Z)(
                  (0, o.Z)().mark(function e() {
                    var t;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (t = {
                                input: V.current,
                                regionauth_id:
                                  null == H ? void 0 : H.regionauth_id,
                              }),
                              (e.next = 3),
                              v.Z.item.getNoresultAdplace(t)
                            );
                          case 3:
                            return e.abrupt("return", e.sent);
                          case 4:
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
              Y = (function () {
                var e = (0, a.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var r;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (e.next = 2),
                              (0, I.xV)({
                                keywords: t,
                                regionauth_id:
                                  null == H ? void 0 : H.regionauth_id,
                                previousPage:
                                  (null === (r = N.params) || void 0 === r
                                    ? void 0
                                    : r.sourceEntrance) || "",
                                replaceCurrentPage: !0,
                              })
                            );
                          case 2:
                            if (!e.sent) {
                              e.next = 5;
                              break;
                            }
                            return e.abrupt("return");
                          case 5:
                            (D.current = "0"),
                              (V.current = t),
                              S(function (e) {
                                (e.itemListLeft = []),
                                  (e.itemListRight = []),
                                  (e.brandAdInfo = null),
                                  (e.bgImg = ""),
                                  (e.storeList = []),
                                  (e.categoryList = []),
                                  (e.searchResultEmpty = !1);
                              }),
                              $();
                          case 9:
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
              ee = (function () {
                var e = (0, a.Z)(
                  (0, o.Z)().mark(function e(t, r, n) {
                    var i, a, s;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (!J.current) {
                              e.next = 4;
                              break;
                            }
                            return (
                              (i = N.params),
                              (a = i.searchModule),
                              (s = i.sourceEntrance),
                              (e.next = 4),
                              (0, y.setSearchClickResultGio)({
                                sourceEntrance: s,
                                searchModule: x.FF[a],
                                searchWord: V.current,
                                resultNumber: "-",
                                flowPosition: r,
                                flowType: n,
                                townName:
                                  null == H ? void 0 : H.regionauth_code,
                                shopName: null == t ? void 0 : t.shopName,
                                shopId: null == t ? void 0 : t.shopId,
                                liveId: null == A ? void 0 : A.liveId,
                                sku: null == t ? void 0 : t.sku_var,
                                skuName: null == t ? void 0 : t.skuName_var,
                                spu: null == t ? void 0 : t.spu_var,
                                spuName: null == t ? void 0 : t.spuName_var,
                                firstCategory:
                                  null == t ? void 0 : t.firstCategory_var,
                                secondCategory:
                                  null == t ? void 0 : t.secondCategory_var,
                                thirdCategory:
                                  (null == t ? void 0 : t.thirdCategory_var) ||
                                  t.category_name,
                                brandName: null == t ? void 0 : t.brandName_var,
                                productPrice:
                                  null == t ? void 0 : t.productPrice_var,
                                discount: null == t ? void 0 : t.discount_var,
                              })
                            );
                          case 4:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t, r, n) {
                  return e.apply(this, arguments);
                };
              })(),
              te = F(Z.storeList);
            return (0, w.jsxs)(p.nO, {
              className: "subpage-search-list",
              navigateBackgroundColor: "transparent",
              immersive: !0,
              scrollToTopBtn: !0,
              onScrollToTop: function () {
                S(function (e) {
                  e.scrollTop = 0 == Z.scrollTop ? -1 : 0;
                });
              },
              ref: W,
              renderNavigation: (0, w.jsx)(p.mW, {
                inputEnabled: !0,
                inputSearch: !0,
                value: Z.keywords,
                placeholder: "搜索商品",
                onSearch: Y,
                searchBtn: !0,
                btnOnSearch: !0,
              }),
              onReady: function (e) {
                var t = e.gNavbarH;
                S(function (e) {
                  e.gNavbarH = t;
                });
              },
              children: [
                Z.storeList.length > 0 &&
                  (0, w.jsx)(u.G7, {
                    className: "store-list__container pl-24 pr-24",
                    style: (0, _.Tu)({
                      "background-image": "url(".concat(Z.bgImg, ");"),
                      "padding-top": "".concat(
                        Z.gNavbarH + (Z.bgImg ? 60 : 12),
                        "px"
                      ),
                      backgroundSize: "cover",
                    }),
                    children:
                      null === (e = Z.storeList) || void 0 === e
                        ? void 0
                        : e.map(function (e, t) {
                            return (0, w.jsx)(
                              k,
                              {
                                className: "store-item",
                                type: "searchList",
                                item: e,
                                showRegion: te,
                                searchResultGio: function () {
                                  ee(
                                    (0, i.Z)(
                                      (0, i.Z)({}, e),
                                      {},
                                      { shopName: e.name, shopId: e.shop_code }
                                    ),
                                    t + 1,
                                    "店铺卡片"
                                  );
                                },
                              },
                              e.distributor_id
                            );
                          }),
                  }),
                Z.categoryList.length > 0 &&
                  (0, w.jsx)(u.G7, {
                    className: "category-list__container",
                    style: (0, _.Tu)({
                      "padding-top": "".concat(Z.gNavbarH, "px"),
                    }),
                    children: (0, w.jsx)(u.pf, {
                      className: "category-list__scroll",
                      scrollX: !0,
                      children: (0, w.jsx)(u.G7, {
                        className: "category-list__wrapper",
                        children:
                          null === (t = Z.categoryList) || void 0 === t
                            ? void 0
                            : t.map(function (e, t) {
                                return (0, w.jsxs)(
                                  u.G7,
                                  {
                                    className: "category-item",
                                    onClick: (0, a.Z)(
                                      (0, o.Z)().mark(function r() {
                                        return (0, o.Z)().wrap(function (r) {
                                          for (;;)
                                            switch ((r.prev = r.next)) {
                                              case 0:
                                                return (
                                                  (r.next = 2),
                                                  ee(e, t + 1, "品类词")
                                                );
                                              case 2:
                                                d().navigateTo({
                                                  url: "/subpages/item/list?main_cat_id=".concat(
                                                    e.category_id
                                                  ),
                                                });
                                              case 3:
                                              case "end":
                                                return r.stop();
                                            }
                                        }, r);
                                      })
                                    ),
                                    children: [
                                      (0, w.jsx)(p.Ko, {
                                        className: "category-item__image",
                                        src: e.image_url,
                                        width: 129,
                                        height: 129,
                                        radius: 8,
                                      }),
                                      (0, w.jsx)(u.G7, {
                                        className: "category-item__name",
                                        children: e.category_name,
                                      }),
                                    ],
                                  },
                                  e.category_id
                                );
                              }),
                      }),
                    }),
                  }),
                (0, w.jsxs)(u.G7, {
                  style: (0, _.Tu)({
                    "padding-top": "".concat(
                      0 == Z.storeList.length && 0 == Z.categoryList.length
                        ? Z.gNavbarH
                        : 0,
                      "px"
                    ),
                  }),
                  children: [
                    Z.brandAdInfo &&
                      Z.searchResultEmpty &&
                      0 == Z.categoryList.length &&
                      (0, w.jsx)(u.G7, {
                        className: "pt-24 pl-24 pr-24",
                        children: (0, w.jsx)(R, {
                          info: Z.brandAdInfo,
                          onClickGio: function () {
                            return ee(Z.brandAdInfo, 1, "兜底词");
                          },
                        }),
                      }),
                    Z.searchResultEmpty &&
                      !Z.brandAdInfo &&
                      0 == Z.categoryList.length &&
                      0 == Z.storeList.length &&
                      (0, w.jsx)(u.G7, {
                        className: "result-empty-text",
                        children: "抱歉！没有找到相关结果",
                      }),
                    (0, w.jsxs)(u.G7, {
                      className: (0, _.AK)("search-list__container", {
                        "result-empty": Z.searchResultEmpty,
                      }),
                      children: [
                        (0, w.jsx)(u.G7, {
                          id: "filter-container",
                          children: (0, w.jsx)(g.nw, {
                            custom: !0,
                            backgroundColor: "transparent",
                            current: Z.curFilterIdx,
                            list: Z.filterList,
                            onChange: function (e) {
                              S(function (t) {
                                (t.itemListLeft = []),
                                  (t.itemListRight = []),
                                  (t.curFilterIdx = e.current || 0),
                                  (t.sortOrder = 1 == e.sort ? 3 : 2);
                              }),
                                O.current.refresh();
                            },
                            onFilter: function () {
                              S(function (e) {
                                e.filterVisible = !0;
                              });
                            },
                          }),
                        }),
                        (0, w.jsx)(g.ii, {
                          scrollY: !0,
                          className: "pl-24 pr-24 box-border",
                          fetch: Q,
                          ref: O,
                          scrollTop: Z.scrollTop,
                          height: Z.virtualWaterfallHeight,
                          renderMore: (0, w.jsx)(w.Fragment, {}),
                          onScroll: function (e) {
                            W.current.scroll(e);
                          },
                          children: (0, w.jsxs)(u.G7, {
                            className: "waterfall-container",
                            children: [
                              (0, w.jsx)(u.G7, {
                                className: "waterfall-left__container",
                                children:
                                  null === (r = Z.itemListLeft) || void 0 === r
                                    ? void 0
                                    : r.map(function (e) {
                                        return null == e
                                          ? void 0
                                          : e.map(function (e, t) {
                                              return (0, w.jsx)(
                                                b.T$,
                                                {
                                                  className: "mb-18",
                                                  width: 342,
                                                  info: e,
                                                  moduleName: "搜索结果",
                                                  modulePosition: 1,
                                                  flowPosition: "".concat(
                                                    2 * t + 1
                                                  ),
                                                  onClickGio: function () {
                                                    return ee(
                                                      e,
                                                      "".concat(2 * t + 1),
                                                      "搜索商品"
                                                    );
                                                  },
                                                },
                                                e.item_id
                                              );
                                            });
                                      }),
                              }),
                              (0, w.jsx)(u.G7, {
                                className: "waterfall-right__container",
                                children:
                                  null === (n = Z.itemListRight) || void 0 === n
                                    ? void 0
                                    : n.map(function (e) {
                                        return null == e
                                          ? void 0
                                          : e.map(function (e, t) {
                                              return (0, w.jsx)(
                                                b.T$,
                                                {
                                                  className: "mb-18",
                                                  width: 342,
                                                  info: e,
                                                  moduleName: "搜索结果",
                                                  modulePosition: 1,
                                                  flowPosition: "".concat(
                                                    2 * t + 2
                                                  ),
                                                  onClickGio: function () {
                                                    return ee(
                                                      e,
                                                      "".concat(2 * t + 2),
                                                      "搜索商品"
                                                    );
                                                  },
                                                },
                                                e.item_id
                                              );
                                            });
                                      }),
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                Z.newFilter
                  ? (0, w.jsx)(g.jl, {
                      visible: Z.filterVisible,
                      selectedFilters: Z.selectedFilters,
                      onClose: function () {
                        return S(function (e) {
                          e.filterVisible = !1;
                        });
                      },
                      onConfirm: function (e) {
                        S(function (t) {
                          (t.selectedFilters = e),
                            (t.itemListLeft = []),
                            (t.itemListRight = []),
                            (t.filterVisible = !1);
                        }),
                          O.current.refresh();
                      },
                      onReset: function () {
                        S(function (e) {
                          (e.selectedFilters = []),
                            (e.itemListLeft = []),
                            (e.itemListRight = []),
                            (e.filterVisible = !1);
                        }),
                          O.current.refresh();
                      },
                      newFilter: Z.newFilter,
                    })
                  : null,
              ],
            });
          }
          (S.options = { addGlobalClass: !0 }),
            (S.defaultProps = { keywords: "" });
          var P = S;
          Page(
            (0, n.createPageConfig)(
              P,
              "subpages/search/list",
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
            4539, 2107, 1216, 8592,
          ],
          function () {
            return (function (t) {
              return e((e.s = t));
            })(16398);
          }
        ),
          e.O();
      },
    ]);
})();
