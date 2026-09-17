!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [1315],
    {
      72981: function (n, e, s) {
        var a = s(32180),
          o = s(74165),
          i = s(15861),
          t = s(29439),
          r = s(67294),
          c = s(92954),
          l = s(90057),
          u = s(71515),
          g = s(78061),
          h = s(48775),
          p = s(96856),
          d = s(27741),
          m = s(1696),
          f = s(80459),
          _ = s(85893),
          v = {
            bgImgeUrl: "".concat(
              "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
              "/fv_shop_ranking_bg.png"
            ),
            goodsList: [],
            shopName: "",
            navigateMantle: !1,
          };
        Page(
          (0, a.createPageConfig)(
            function () {
              var n = (0, c.useRouter)(),
                e = (0, l.x)(v),
                s = (0, t.Z)(e, 2),
                a = s[0],
                x = s[1],
                N = a.bgImgeUrl,
                k = a.goodsList,
                j = a.shopName,
                w = a.navigateMantle;
              (0, r.useEffect)(function () {
                p.N_.getRouteParams(n.params).then(function (n) {
                  G(null == n ? void 0 : n.distributor_id), b(n);
                });
              }, []);
              var b = (function () {
                  var n = (0, i.Z)(
                    (0, o.Z)().mark(function n(e) {
                      return (0, o.Z)().wrap(function (n) {
                        for (;;)
                          switch ((n.prev = n.next)) {
                            case 0:
                              null != e &&
                                e.previousPage &&
                                null != e &&
                                e.searchModule &&
                                null != e &&
                                e.keyword &&
                                (0, f.setSearchResultGio)({
                                  searchWord: e.keyword,
                                  searchModule: e.searchModule,
                                  sourceEntrance: e.previousPage,
                                  resultNumber: 0,
                                  ifSearchResult: "其他",
                                });
                            case 1:
                            case "end":
                              return n.stop();
                          }
                      }, n);
                    })
                  );
                  return function (e) {
                    return n.apply(this, arguments);
                  };
                })(),
                G = (function () {
                  var n = (0, i.Z)(
                    (0, o.Z)().mark(function n() {
                      var e,
                        s,
                        a,
                        i,
                        t,
                        r = arguments;
                      return (0, o.Z)().wrap(function (n) {
                        for (;;)
                          switch ((n.prev = n.next)) {
                            case 0:
                              return (
                                (e =
                                  r.length > 0 && void 0 !== r[0] ? r[0] : ""),
                                (s = {
                                  page: 1,
                                  pageSize: 20,
                                  distributor_id: e,
                                  approve_status: "onsale,only_show",
                                  item_type: "normal",
                                  is_point: "false",
                                }),
                                (n.next = 4),
                                m.Z.item.search(s)
                              );
                            case 4:
                              (a = n.sent),
                                (i = a.list),
                                (t = (0, p.D9)(i, d.Z.goods.ITEM_LIST_GOODS)),
                                x(function (n) {
                                  var s;
                                  (n.goodsList = t),
                                    (n.shopName = e
                                      ? null === (s = t[0]) || void 0 === s
                                        ? void 0
                                        : s.shopName
                                      : "");
                                });
                            case 8:
                            case "end":
                              return n.stop();
                          }
                      }, n);
                    })
                  );
                  return function () {
                    return n.apply(this, arguments);
                  };
                })();
              return (0, _.jsx)(g.nO, {
                immersive: !0,
                navigateMantle: w,
                navigateBackgroundColor: "#FF9A68",
                className: "page-shop-ranking",
                renderNavigation: w
                  ? (0, _.jsx)(u.G7, {
                      className: "page-shop-ranking__header",
                      children: (0, _.jsx)(u.xv, {
                        className: "nav-title",
                        children: "".concat(j, "热销榜单"),
                      }),
                    })
                  : null,
                children: (0, _.jsx)(u.pf, {
                  scrollY: !0,
                  onScroll: function (n) {
                    x(function (e) {
                      e.navigateMantle = n.detail.scrollTop > 120;
                    });
                  },
                  className: "scroll-contents",
                  children: (0, _.jsxs)(u.G7, {
                    className: "page-shop-ranking__contents",
                    children: [
                      (0, _.jsx)(u.G7, {
                        className: "bg-box",
                        style: (0, p.Tu)({
                          "background-image": "url(".concat(N, ")"),
                        }),
                      }),
                      (0, _.jsx)(u.G7, { className: "shade-box" }),
                      (0, _.jsxs)(u.G7, {
                        className: "ranking-info",
                        children: [
                          (0, _.jsxs)(u.G7, {
                            className: "ranking-info__hd",
                            children: [
                              (0, _.jsx)(u.G7, {
                                className: "lr-img",
                                children: (0, _.jsx)(g.Ko, {
                                  src: "fv_shop_ranking_left.png",
                                  width: 72,
                                  height: 94,
                                }),
                              }),
                              (0, _.jsxs)(u.G7, {
                                className: "ranking-info__center",
                                children: [
                                  (0, _.jsx)(u.G7, {
                                    className: "ranking-info__title",
                                    children: j,
                                  }),
                                  (0, _.jsx)(u.G7, {
                                    className: "ranking-info__subtitle",
                                    children: (0, _.jsx)(g.Ko, {
                                      src: "fv_shop_ranking_title.png",
                                      width: 234,
                                      height: 55,
                                    }),
                                  }),
                                ],
                              }),
                              (0, _.jsx)(u.G7, {
                                className: "lr-img",
                                children: (0, _.jsx)(g.Ko, {
                                  src: "fv_shop_ranking_right.png",
                                  width: 72,
                                  height: 94,
                                }),
                              }),
                            ],
                          }),
                          (0, _.jsx)(u.G7, {
                            className: "ranking-info__bd",
                            children: "近30天热销榜单，每日更新",
                          }),
                          null == k
                            ? void 0
                            : k.map(function (n, e) {
                                return (0,
                                _.jsx)(u.G7, { className: "page-shop-ranking__item", children: (0, _.jsx)(h.ti, { info: n, top: e + 1, showTop: e < 10, width: 228, height: 228, moduleName: "".concat(j, "热销榜单"), modulePosition: 1, flowPosition: e + 1 }) }, n.itemId);
                              }),
                        ],
                      }),
                    ],
                  }),
                }),
              });
            },
            "subpages/store/shop-ranking",
            { root: { cn: [] } },
            { navigationStyle: "custom" } || {}
          )
        );
      },
    },
    function (n) {
      n.O(0, [2107, 1216, 8592], function () {
        return (function (e) {
          return n((n.s = e));
        })(72981);
      }),
        n.O();
    },
  ]);
})();
