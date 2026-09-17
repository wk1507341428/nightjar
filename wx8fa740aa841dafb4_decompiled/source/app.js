!(function () {
  "use strict";
  require("./common"),
    require("./vendors"),
    require("./taro"),
    require("./runtime"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [2143],
      {
        5157: function (e, t, r) {
          r(17488);
          var n = r(32180),
            o = r(88744),
            a = r(92954),
            i = r.n(a),
            s = r(74165),
            c = r(15861),
            u = r(92851),
            d = r(67294),
            p = r.t(d, 2),
            g = r(80459),
            l = r(21391),
            f = r(31707),
            m = r(32730),
            v = r(1696),
            h = r(23577),
            x = r(96943),
            b = r(96856),
            y = r(80129),
            k = r.n(y),
            _ = r(75676);
          var P = r(21066),
            w = r(89679),
            D = r(36163),
            S = r(85893),
            I = (0, m.Z)().store;
          Promise.resolve()
            .then(function () {
              return (0, u.Z)(r(21873));
            })
            .then(function (e) {
              e.intercept.init();
            }),
            i().addInterceptor(function (e) {
              var t,
                r = e.requestParams,
                n = (r.method, r.data),
                o = r.url;
              if (
                (0, b.Kn)((0, a.getCurrentInstance)().router) &&
                "/subpages/cart/espier-checkout" ===
                  (null === (t = (0, a.getCurrentInstance)()) || void 0 === t
                    ? void 0
                    : t.router
                  ).path &&
                [
                  "".concat(
                    "https://aiopro.fvo2o.com/api/h5app/wxapp",
                    "/order_new"
                  ),
                  "".concat(
                    "https://aiopro.fvo2o.com/api/h5app/wxapp",
                    "/getFreightFee"
                  ),
                ].indexOf(o) > -1
              ) {
                var i = (0, _.X0)(),
                  s = i.source_id,
                  c = void 0 === s ? "" : s,
                  u = i.monitor_id,
                  d = void 0 === u ? "" : u,
                  p = i.latest_source_id,
                  g = void 0 === p ? "" : p,
                  l = i.latest_monitor_id,
                  f = void 0 === l ? "" : l,
                  m = k().parse(n);
                c && (m.source_id = c),
                  d && (m.monitor_id = d),
                  g && (m.latest_source_id = g),
                  f && (m.latest_monitor_id = f),
                  (r.data = k().stringify(m));
              }
              return e.proceed(r).then(function (e) {
                return e;
              });
            });
          var R = function (e) {
              var t = e.children,
                r = (0, P.f0)().autoLogin,
                n = (0, w.Z)().getSystemConfig;
              (0, d.useEffect)(function () {
                o();
              }, []),
                (0, a.useLaunch)(
                  (0, c.Z)(
                    (0, s.Z)().mark(function e() {
                      return (0, s.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (e.next = 2), (0, g.initGio)();
                            case 2:
                              return (e.next = 4), (0, g.setGioIdentify)();
                            case 4:
                              return (
                                (e.next = 6), (0, g.setGIoUserAttributes)()
                              );
                            case 6:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  )
                ),
                (0, a.useDidHide)(function () {
                  i().setStorageSync("router_list", []);
                }),
                (0, a.useError)(function (e) {
                  console.error(e);
                }),
                (0, a.useDidShow)(
                  (function () {
                    var e = (0, c.Z)(
                      (0, s.Z)().mark(function e(t) {
                        var o;
                        return (0, s.Z)().wrap(function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  b.FO && (0, b.Kc)(),
                                  I.dispatch((0, D.e)([])),
                                  b.N_.getRouteParams(
                                    b.$L ? { query: t } : t
                                  ).then(
                                    (function () {
                                      var e = (0, c.Z)(
                                        (0, s.Z)().mark(function e(t) {
                                          var o,
                                            a,
                                            c,
                                            u,
                                            d,
                                            p,
                                            g,
                                            f,
                                            m,
                                            y,
                                            k,
                                            P,
                                            w,
                                            D,
                                            S,
                                            R,
                                            Z,
                                            O,
                                            T,
                                            N,
                                            F,
                                            L,
                                            q,
                                            C,
                                            A,
                                            B,
                                            z,
                                            E,
                                            G,
                                            J,
                                            K,
                                            M,
                                            U,
                                            X,
                                            j;
                                          return (0, s.Z)().wrap(
                                            function (e) {
                                              for (;;)
                                                switch ((e.prev = e.next)) {
                                                  case 0:
                                                    return (
                                                      i().setStorageSync(
                                                        x.z2,
                                                        t
                                                      ),
                                                      (e.prev = 1),
                                                      (e.next = 4),
                                                      (0, _.qz)(t)
                                                    );
                                                  case 4:
                                                    e.next = 9;
                                                    break;
                                                  case 6:
                                                    (e.prev = 6),
                                                      (e.t0 = e.catch(1)),
                                                      console.error(e.t0);
                                                  case 9:
                                                    if (
                                                      ((o = ""),
                                                      (c = (a = t || {})
                                                        .crmcode),
                                                      (u = a.ucd),
                                                      (d =
                                                        void 0 === u ? "" : u),
                                                      (p = a.r),
                                                      (g =
                                                        void 0 === p ? "" : p),
                                                      (f = a.invite_key),
                                                      (m =
                                                        void 0 === f ? "" : f),
                                                      (y = a.region_id),
                                                      (k =
                                                        void 0 === y ? "" : y),
                                                      (P = a.utm_source),
                                                      (w =
                                                        void 0 === P ? "" : P),
                                                      (D = a.utm_medium),
                                                      (S =
                                                        void 0 === D ? "" : D),
                                                      (R = a.utm_campagin),
                                                      (Z =
                                                        void 0 === R ? "" : R),
                                                      (O = a.utm_content),
                                                      (T =
                                                        void 0 === O ? "" : O),
                                                      (N = a.utm_term),
                                                      (F =
                                                        void 0 === N ? "" : N),
                                                      !(L = k || g) && !c)
                                                    ) {
                                                      e.next = 40;
                                                      break;
                                                    }
                                                    if (
                                                      ((C =
                                                        (null ===
                                                          (q = I.getState()) ||
                                                        void 0 === q ||
                                                        null ===
                                                          (q = q.regionauth) ||
                                                        void 0 === q
                                                          ? void 0
                                                          : q.regionauthInfo) ||
                                                        {}),
                                                      (A = C.regionauth_code),
                                                      (B =
                                                        void 0 === A ? "" : A),
                                                      (z = C.regionauth_id),
                                                      (E =
                                                        void 0 === z
                                                          ? ""
                                                          : z) === L && B === c)
                                                    ) {
                                                      e.next = 39;
                                                      break;
                                                    }
                                                    return (
                                                      (e.next = 18),
                                                      I.dispatch((0, h.zn)(C))
                                                    );
                                                  case 18:
                                                    return (
                                                      (e.next = 20),
                                                      v.Z.regionauth.getRegionauthList(
                                                        { noRegionauth: !0 }
                                                      )
                                                    );
                                                  case 20:
                                                    if (
                                                      ((G = e.sent),
                                                      (J = G.list),
                                                      (K = J.find(function (e) {
                                                        return (
                                                          e.regionauth_id ===
                                                            L ||
                                                          e.regionauth_code ===
                                                            c
                                                        );
                                                      })))
                                                    ) {
                                                      e.next = 32;
                                                      break;
                                                    }
                                                    if (
                                                      null ===
                                                        (M = I.getState()) ||
                                                      void 0 === M ||
                                                      null ===
                                                        (M = M.regionauth) ||
                                                      void 0 === M ||
                                                      !M.beforeRegionauthInfo
                                                    ) {
                                                      e.next = 29;
                                                      break;
                                                    }
                                                    return (
                                                      (e.next = 27),
                                                      I.dispatch(
                                                        (0, h.Lt)(
                                                          null ===
                                                            (U =
                                                              I.getState()) ||
                                                            void 0 === U ||
                                                            null ===
                                                              (U =
                                                                U.regionauth) ||
                                                            void 0 === U
                                                            ? void 0
                                                            : U.beforeRegionauthInfo
                                                        )
                                                      )
                                                    );
                                                  case 27:
                                                    e.next = 30;
                                                    break;
                                                  case 29:
                                                    i().reLaunch({
                                                      url: "/subpages/trade/regionauth-picker",
                                                    });
                                                  case 30:
                                                    e.next = 37;
                                                    break;
                                                  case 32:
                                                    return (
                                                      (e.next = 34),
                                                      I.dispatch((0, h.Lt)(K))
                                                    );
                                                  case 34:
                                                    return (
                                                      n(K.regionauth_id),
                                                      (e.next = 37),
                                                      I.dispatch((0, h.TX)(K))
                                                    );
                                                  case 37:
                                                    e.next = 40;
                                                    break;
                                                  case 39:
                                                    n(E);
                                                  case 40:
                                                    if (
                                                      (m &&
                                                        i().setStorageSync(
                                                          "invite_key",
                                                          m
                                                        ),
                                                      i().setStorageSync(
                                                        "user_card_code",
                                                        d
                                                      ),
                                                      i().setStorageSync(
                                                        "utm_info",
                                                        {
                                                          utm_source: w,
                                                          utm_medium: S,
                                                          utm_campagin: Z,
                                                          utm_content: T,
                                                          utm_term: F,
                                                        }
                                                      ),
                                                      !d)
                                                    ) {
                                                      e.next = 52;
                                                      break;
                                                    }
                                                    if (
                                                      ((X = l.Z.getAuthToken()),
                                                      (j = X
                                                        ? (0, b.LI)(X)
                                                        : {}),
                                                      (o =
                                                        null == j
                                                          ? void 0
                                                          : j.user_card_code),
                                                      d === o)
                                                    ) {
                                                      e.next = 52;
                                                      break;
                                                    }
                                                    return (
                                                      l.Z.setAuthToken(""),
                                                      i().removeStorageSync(
                                                        "userinfo"
                                                      ),
                                                      r(),
                                                      e.abrupt("return")
                                                    );
                                                  case 52:
                                                    r();
                                                  case 53:
                                                  case "end":
                                                    return e.stop();
                                                }
                                            },
                                            e,
                                            null,
                                            [[1, 6]]
                                          );
                                        })
                                      );
                                      return function (t) {
                                        return e.apply(this, arguments);
                                      };
                                    })()
                                  ),
                                  (e.next = 5),
                                  v.Z.promotion.getScreenAd()
                                );
                              case 5:
                                (o = e.sent),
                                  "always" === o.show_time &&
                                    (!1,
                                    I.dispatch({
                                      type: "user/closeAdv",
                                      payload: !1,
                                    }));
                              case 8:
                              case "end":
                                return e.stop();
                            }
                        }, e);
                      })
                    );
                    return function (t) {
                      return e.apply(this, arguments);
                    };
                  })()
                );
              var o = function () {
                wx.loadFontFace({
                  family: "D-DIN-PRO",
                  global: !0,
                  source:
                    "https://b-img-cdn.yuanyuanke.cn/fv-vshop/D-DIN-PRO/D-DIN-PRO-600-SemiBold.otf?t=1718810009",
                  success: function () {},
                  fail: function () {},
                }),
                  wx.loadFontFace({
                    family: "D-DIN-PRO-Regular",
                    global: !0,
                    source:
                      "https://b-img-cdn.yuanyuanke.cn/fv-vshop/D-DIN-PRO/D-DIN-PRO-400-Regular.otf?t=1718810009",
                    success: function () {},
                    fail: function () {},
                  }),
                  wx.loadFontFace({
                    family: "D-DIN-PRO-Medium",
                    global: !0,
                    source:
                      "https://b-img-cdn.yuanyuanke.cn/fv-vshop/D-DIN-PRO/D-DIN-PRO-500-Medium.otf?t=1718810009",
                    success: function () {},
                    fail: function () {},
                  }),
                  wx.loadFontFace({
                    family: "D-DIN-PRO-ExtraBold",
                    global: !0,
                    source:
                      "https://b-img-cdn.yuanyuanke.cn/fv-vshop/D-DIN-PRO/D-DIN-PRO-800-ExtraBold.otf?t=1718810009",
                    success: function () {},
                    fail: function () {},
                  });
              };
              return (0, S.jsx)(f.zt, { store: I, children: t });
            },
            Z = r(88967),
            O = {
              pages: [
                "pages/index",
                "pages/webview",
                "pages/category/index",
                "pages/cart/espier-index",
                "pages/custom/custom-page",
                "pages/member/index",
                "pages/custom/index",
              ],
              subPackages: [
                { root: "pages/item", pages: ["espier-detail"] },
                { root: "subpages/store", pages: ["index", "shop-ranking"] },
                { root: "subpages/item", pages: ["list"] },
                { root: "subpages/platfrom", pages: ["index"] },
                { root: "subpages/cart", pages: ["espier-checkout"] },
                {
                  root: "subpages/member",
                  pages: [
                    "address-list",
                    "edit-address",
                    "member-level",
                    "user-info",
                    "complete-profile",
                    "qrcode",
                    "task-list",
                    "task-rules",
                    "invite-friend",
                    "sign-rules",
                    "item-fav",
                  ],
                },
                {
                  root: "subpages/marketing",
                  pages: [
                    "category-ranking",
                    "coupon",
                    "coupon-center",
                    "coupon-detail",
                    "coupon-record",
                    "coupon-picker",
                    "marketing-list",
                    "limited-sale",
                    "group-list",
                    "group-detail",
                    "package-list",
                    "platform-group-list",
                    "platfrom_limited-sale",
                  ],
                },
                {
                  root: "subpages/trade",
                  pages: [
                    "list",
                    "detail",
                    "after-sale-list",
                    "after-sale",
                    "after-sale-detail",
                    "regionauth-picker",
                    "logistics-info",
                    "store-picker",
                    "invoice",
                    "invoice-list",
                    "invoice-detail",
                    "invoice-success",
                    "trade-evaluate",
                    "evaluate-success",
                    "delivery-info",
                    "cashier-result",
                  ],
                },
                { root: "subpages/live", pages: ["index", "list"] },
                { root: "subpages/auth", pages: ["reg-rule", "auth-loading"] },
                { root: "subpages/search", pages: ["index", "list"] },
                {
                  root: "subpages/game-activity",
                  pages: ["index", "pages/records"],
                },
                {
                  root: "subpages/sevices",
                  pages: ["index/index"],
                  plugins: {
                    myPlugin: {
                      version: "2.2.1",
                      provider: "wxae5e29812005203f",
                    },
                  },
                },
                { root: "subpages/polyv", pages: ["index"] },
                { root: "subpages/gio", pages: ["index"] },
              ],
              permission: {
                "scope.userLocation": {
                  desc: "您的位置信息将用于定位附近门店",
                },
              },
              tabBar: {
                custom: !0,
                color: "#999",
                selectedColor: "#000",
                backgroundColor: "#fff",
                borderStyle: "black",
                list: [
                  { pagePath: "pages/index" },
                  { pagePath: "pages/category/index" },
                  { pagePath: "pages/cart/espier-index" },
                  { pagePath: "pages/member/index" },
                  { pagePath: "pages/custom/index" },
                ],
              },
              window: {
                backgroundTextStyle: "light",
                navigationBarBackgroundColor: "#fff",
                navigationBarTitleText: "小程序",
                navigationBarTextStyle: "black",
              },
              plugins: {},
              requiredPrivateInfos: ["getLocation", "chooseAddress"],
              usingComponents: {
                "mp-html": "./components/sp-html/mp-weixin/index",
              },
            };
          (n.window.__taroAppConfig = O),
            App((0, o.Ox)(R, p, Z.ZP, O)),
            (0, a.initPxTransform)({
              designWidth: 750,
              deviceRatio: { 640: 1.17, 750: 1, 828: 0.905 },
              baseFontSize: 20,
              unitPrecision: void 0,
              targetUnit: void 0,
            });
        },
        21873: function (e, t, r) {
          r.r(t),
            r.d(t, {
              intercept: function () {
                return s;
              },
            });
          var n = r(15671),
            o = r(43144),
            a = r(92954),
            i = r.n(a),
            s = new ((0, o.Z)(
              function e() {
                (0, n.Z)(this, e), (this.routes = {});
              },
              [
                {
                  key: "init",
                  value: function () {
                    var e = this,
                      t = i().navigateTo,
                      r = i().redirectTo,
                      n = i().switchTab,
                      o = i().reLaunch;
                    (i().navigateTo = function (n) {
                      try {
                        var o = e.formartParams(n);
                        (0, a.getCurrentPages)().length > 8 ? r(o) : t(o);
                      } catch (e) {
                        console.error(e, "error"), t(n);
                      }
                    }),
                      (i().redirectTo = function (t) {
                        try {
                          var n = e.formartParams(t);
                          r(n);
                        } catch (e) {
                          console.error(e, "error"), r(t);
                        }
                      }),
                      (i().switchTab = function (t) {
                        try {
                          var r = e.formartParams(t);
                          n(r);
                        } catch (e) {
                          console.error(e, "error"), n(t);
                        }
                      }),
                      (i().reLaunch = function (t) {
                        try {
                          var r = e.formartParams(t);
                          o(r);
                        } catch (e) {
                          console.error(e, "error"), o(t);
                        }
                      });
                  },
                },
                {
                  key: "formartParams",
                  value: function (e) {
                    return e;
                  },
                },
                {
                  key: "transformParams",
                  value: function (e) {
                    return e;
                  },
                },
              ]
            ))();
        },
      },
      function (e) {
        e.O(0, [2107, 1216, 8592], function () {
          return (function (t) {
            return e((e.s = t));
          })(5157);
        }),
          e.O();
      },
    ]);
})();
