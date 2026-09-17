!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [1348],
    {
      14700: function (n, e, t) {
        var r = t(32180),
          o = t(74165),
          a = t(1413),
          i = t(15861),
          l = t(29439),
          s = t(67294),
          c = t(92954),
          u = t(80129),
          g = t.n(u),
          f = t(70242),
          d = t(58794),
          p = t(70493),
          v = t(71515),
          h = t(31707),
          m = t(83010),
          x = t(90057),
          w = t(78061),
          b = t(13651),
          Z = t(85893),
          _ = {
            deposit: 0,
            wgts: [],
            loading: !0,
            shareInfo: {},
            footerHeight: 0,
            navigateMantle: !1,
            pageConfig: null,
            scrollY: 0,
          };
        var y = function (n) {
          var e = (0, x.x)(_),
            t = (0, l.Z)(e, 2),
            r = t[0],
            u = t[1],
            y = (0, h.v9)(function (n) {
              return n.regionauth;
            }).regionauthInfo,
            C = (function () {
              var n = (0, i.Z)(
                (0, o.Z)().mark(function n() {
                  var e,
                    t,
                    r,
                    i,
                    l,
                    s,
                    c,
                    f = arguments;
                  return (0, o.Z)().wrap(
                    function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            if (
                              (e =
                                f.length > 0 && void 0 !== f[0]
                                  ? f[0]
                                  : null == y
                                  ? void 0
                                  : y.regionauth_id)
                            ) {
                              n.next = 3;
                              break;
                            }
                            return n.abrupt("return");
                          case 3:
                            return (
                              (n.prev = 3),
                              (t = g().stringify({
                                template_name: p.CI,
                                version: "v1.0.1",
                                page_name: "custom_my",
                                regionauth_id: e,
                              })),
                              (r = "/pageparams/setting?".concat(t)),
                              (n.next = 8),
                              d.Z.get(r)
                            );
                          case 8:
                            (i = n.sent),
                              (l = i.config),
                              (s = void 0 === l ? [] : l),
                              (c = i.share),
                              u(function (n) {
                                n.wgts = s.map(function (n) {
                                  return (0,
                                  a.Z)((0, a.Z)({}, n), {}, { pagetype: "会员中心" });
                                });
                                var e = s.find(function (n) {
                                  return "page" == n.name;
                                });
                                (n.pageConfig = null == e ? void 0 : e.base),
                                  (n.loading = !1),
                                  (n.shareInfo = c);
                              }),
                              (n.next = 18);
                            break;
                          case 15:
                            (n.prev = 15),
                              (n.t0 = n.catch(3)),
                              u(function (n) {
                                (n.wgts = []),
                                  (n.pageConfig = null),
                                  (n.loading = !1),
                                  (n.shareInfo = {});
                              });
                          case 18:
                          case "end":
                            return n.stop();
                        }
                    },
                    n,
                    null,
                    [[3, 15]]
                  );
                })
              );
              return function () {
                return n.apply(this, arguments);
              };
            })();
          return (
            (0, s.useEffect)(
              function () {
                null != y && y.regionauth_id && C(y.regionauth_id);
              },
              [null == y ? void 0 : y.regionauth_id]
            ),
            (0, c.useDidShow)(function () {
              var n,
                e = null == y ? void 0 : y.regionauth_id;
              e &&
                ((!r.loading &&
                  null !== (n = r.wgts) &&
                  void 0 !== n &&
                  n.length) ||
                  C(e));
            }),
            (0, Z.jsx)(w.nO, {
              className: "pages-member-index",
              pageConfig: r.pageConfig,
              immersive: !0,
              navigateMantle: r.navigateMantle,
              renderNavigation: (0, Z.jsx)(b.Z, {
                color: r.navigateMantle ? "#000" : "#fff",
              }),
              onReady: function (n) {
                var e = n.footerHeight;
                u(function (n) {
                  n.footerHeight = e;
                });
              },
              renderFooter: (0, Z.jsx)(Z.Fragment, {}),
              children: (0, Z.jsx)(v.pf, {
                scrollY: !0,
                className: "user-info-card-wrapper pages-member-index-scroll",
                style: { paddingBottom: r.footerHeight },
                onScroll: function (n) {
                  var e = n.detail;
                  u(function (n) {
                    (n.scrollY = e.scrollTop),
                      (n.navigateMantle = e.scrollTop > 100);
                  });
                },
                enhanced: !0,
                bounces: !1,
                showScrollbar: !1,
                children: (0, Z.jsx)(f.B.Provider, {
                  value: {
                    scrollY: r.scrollY,
                    scrollSelector: ".pages-member-index-scroll",
                  },
                  children: (0, Z.jsx)(m.Z, { wgts: r.wgts }),
                }),
              }),
            })
          );
        };
        Page(
          (0, r.createPageConfig)(
            y,
            "pages/member/index",
            { root: { cn: [] } },
            { navigationBarTitleText: "会员中心", navigationStyle: "custom" } ||
              {}
          )
        );
      },
    },
    function (n) {
      n.O(0, [2107, 1216, 8592], function () {
        return (function (e) {
          return n((n.s = e));
        })(14700);
      }),
        n.O();
    },
  ]);
})();
