!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [23],
    {
      21007: function (e, t, a) {
        var r = a(32180),
          n = a(74165),
          o = a(1413),
          i = a(15861),
          s = a(92954),
          c = a.n(s),
          l = a(67294),
          u = a(71515),
          d = a(31707),
          m = a(96943),
          p = a(96856),
          x = a(78061),
          b = a(80459),
          _ = a(37042),
          v = a(85893);
        function f() {
          var e = (0, d.v9)(function (e) {
              return e.sys;
            }).tabbar,
            t = void 0 === e ? {} : e,
            a = (0, d.v9)(function (e) {
              return e.select;
            }).tabbarIndex,
            r = (0, d.v9)(function (e) {
              return e.cart;
            }).cartCount,
            s = void 0 === r ? 0 : r,
            l = (0, d.v9)(function (e) {
              return e.regionauth;
            }).regionauthInfo,
            f = void 0 === l ? {} : l,
            g = (null == t ? void 0 : t.config) || {},
            h = g.color,
            w = g.backgroundColor,
            j = g.selectedColor,
            N = (0, d.v9)(function (e) {
              return e.login;
            }),
            y = N.isOpenPrivary,
            C = N.isOpenLogin,
            G = N.isOpenProfile,
            k = (t || {}).data,
            I = void 0 === k ? [] : k,
            L = (0, d.I0)(),
            P = (function () {
              var e = (0, i.Z)(
                (0, n.Z)().mark(function e(t) {
                  var a, r, i, s;
                  return (0, n.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (
                            ((a = I[t]),
                            (0, b.setFlowClickGio)({
                              position: "-",
                              index: t + 1,
                              moduleName_var: "底部导航",
                              title: a.title,
                              regionauth_code:
                                (null == f ? void 0 : f.regionauth_code) || "-",
                            }),
                            "other_wxapp" != a.name)
                          ) {
                            e.next = 6;
                            break;
                          }
                          return (
                            (i =
                              null ===
                                (r = a.otherWxapp.wxLinkList.find(function (e) {
                                  return (
                                    e.wx_external_routes_id ==
                                    a.otherWxapp.wx_external_routes_id
                                  );
                                })) || void 0 === r
                                ? void 0
                                : r.route_info),
                            c().openEmbeddedMiniProgram({
                              appId: a.otherWxapp.app_id,
                              path: i,
                              extraData: (0, o.Z)({}, (0, p.TH)()),
                              envVersion: "release",
                              allowFullScreen: !0,
                            }),
                            e.abrupt("return")
                          );
                        case 6:
                          (s = m.BF[a.name]),
                            "customPage" == a.name &&
                              (c().customPageId = a.customPageId),
                            L((0, _.tx)()),
                            c().switchTab({ url: s });
                        case 10:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function (t) {
                return e.apply(this, arguments);
              };
            })();
          return (0, v.jsx)(u.G7, {
            className: "sp-tabbar",
            style: {
              backgroundColor: w,
              height: y || C || G ? 0 : (0, p.Rq)() ? "166rpx" : "124rpx",
              opacity: y || C || G ? 0 : 1,
            },
            children:
              null == I
                ? void 0
                : I.map(function (e, t) {
                    return (0, v.jsxs)(
                      u.G7,
                      {
                        className: "sp-tabbar__item",
                        onClick: function () {
                          return P(t);
                        },
                        children: [
                          0 == t &&
                            (t !== a
                              ? (0, v.jsxs)(v.Fragment, {
                                  children: [
                                    (0, v.jsx)(x.Ko, {
                                      src: e.image,
                                      className: "sp-tabbar__item-image",
                                      mode: "cover",
                                      lazyLoad: !1,
                                    }),
                                    (0, v.jsx)(u.G7, {
                                      className: "sp-tabbar__item-text",
                                      style: { color: t == a ? j : h },
                                      children: e.title,
                                    }),
                                  ],
                                })
                              : (0, v.jsx)(x.Ko, {
                                  src: e.selectedImage,
                                  className: "sp-tabbar__item-cover-image",
                                  mode: "cover",
                                  lazyLoad: !1,
                                })),
                          t > 0 &&
                            (0, v.jsxs)(v.Fragment, {
                              children: [
                                (0, v.jsxs)(u.G7, {
                                  className: "sp-tabbar__item-image-wrapper",
                                  children: [
                                    (0, v.jsx)(x.Ko, {
                                      src: t == a ? e.selectedImage : e.image,
                                      className: "sp-tabbar__item-image",
                                      mode: "cover",
                                      lazyLoad: !1,
                                    }),
                                    "购物车" == e.title &&
                                      s > 0 &&
                                      (0, v.jsxs)(u.G7, {
                                        className:
                                          "sp-tabbar__item-badge".concat(
                                            s > 99 ? "1" : ""
                                          ),
                                        children: [
                                          s > 0 &&
                                            s <= 99 &&
                                            (0, v.jsx)(u.G7, {
                                              className: "cart-count",
                                              children: s,
                                            }),
                                          s > 99 &&
                                            (0, v.jsx)(u.G7, {
                                              className: "cart-count1",
                                              children: "99+",
                                            }),
                                        ],
                                      }),
                                  ],
                                }),
                                (0, v.jsx)(u.G7, {
                                  className: "sp-tabbar__item-text",
                                  style: { color: t == a ? j : h },
                                  children: e.title,
                                }),
                              ],
                            }),
                        ],
                      },
                      t
                    );
                  }),
          });
        }
        f.options = { addGlobalClass: !0 };
        var g = l.memo(f);
        Component((0, r.createComponentConfig)(g, "custom-tab-bar/index"));
      },
    },
    function (e) {
      e.O(0, [2107, 1216, 8592], function () {
        return (function (t) {
          return e((e.s = t));
        })(21007);
      }),
        e.O();
    },
  ]);
})();
