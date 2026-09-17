!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [3809],
    {
      60122: function (e, n, t) {
        var r = t(32180),
          o = t(1413),
          a = t(74165),
          i = t(15861),
          l = t(29439),
          u = t(67294),
          s = t(31707),
          c = t(90057),
          g = t(92954),
          p = t.n(g),
          d = t(80129),
          v = t.n(d),
          f = t(71515),
          m = t(78061),
          h = t(70242),
          I = t(96856),
          _ = t(70493),
          x = t(21066),
          w = t(58794),
          Z = t(83010),
          C = t(80459),
          P = t(23493),
          T = t.n(P),
          k = t(85893),
          y = {
            loading: !0,
            shareInfo: null,
            scrollIntoContentItem: null,
            scrollY: 0,
            navHeight: 0,
            filterWgts: [],
            immersive: !1,
            pageConfig: null,
            pageId: "",
          };
        function b(e) {
          var n = (0, g.getCurrentInstance)(),
            t = (0, c.x)(y),
            r = (0, l.Z)(t, 2),
            d = r[0],
            P = r[1],
            b = (0, x.HJ)().setNavigationBarTitle,
            N = d.loading,
            S = d.shareInfo,
            H = d.scrollIntoContentItem,
            j = d.scrollY,
            O = d.navHeight,
            R = d.filterWgts,
            Y = d.immersive,
            J = d.pageConfig,
            V = d.pageId,
            A = (0, u.useRef)(),
            B = (0, u.useRef)(!0),
            W = (0, s.v9)(function (e) {
              return e.regionauth;
            }).regionauthInfo,
            D = (0, s.v9)(function (e) {
              return e.live;
            }).liveInfo;
          (0, u.useEffect)(
            function () {
              null != W && W.regionauth_id && F();
            },
            [null == W ? void 0 : W.regionauth_id]
          ),
            (0, g.useDidShow)(function () {
              p().hideShareMenu({
                menus: ["shareAppMessage", "shareTimeline"],
              });
            }),
            (0, g.useDidShow)(function () {
              var e;
              B.current ||
                p().nextTick(
                  (0, i.Z)(
                    (0, a.Z)().mark(function e() {
                      var t, r, o, i;
                      return (0, a.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (r = (null == n ? void 0 : n.page) || {}),
                                (o = r.route),
                                (e.next = 3),
                                I.N_.getRouteParams(
                                  (null == n ||
                                  null === (t = n.router) ||
                                  void 0 === t
                                    ? void 0
                                    : t.params) || {}
                                )
                              );
                            case 3:
                              (i = e.sent),
                                A.current &&
                                  A.current.setPageViewSetting(
                                    o,
                                    i,
                                    null == S ? void 0 : S.page_name
                                  );
                            case 5:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  )
                ),
                (B.current = !1),
                I.N_.postCenterTask({
                  ruleId:
                    null == n ||
                    null === (e = n.router) ||
                    void 0 === e ||
                    null === (e = e.params) ||
                    void 0 === e
                      ? void 0
                      : e.ruleId,
                });
            });
          var F = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e() {
                  var t, r, l, u, s, c, g;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (t = p().customPageId),
                            (r = v().stringify({
                              template_name: _.CI,
                              version: "v1.0.1",
                              page_name: "custom_".concat(t),
                              distributor_id: (0, I.ik)(),
                            })),
                            (l = "/pageparams/setting?".concat(r)),
                            (e.next = 5),
                            w.Z.get(l)
                          );
                        case 5:
                          (u = e.sent),
                            (s = u.config),
                            (null == (c = u.share) ? void 0 : c.page_name) &&
                              b(null == c ? void 0 : c.page_name),
                            (g =
                              (null == s ? void 0 : s.length) > 0
                                ? s.map(function (e) {
                                    return (0,
                                    o.Z)((0, o.Z)({}, e), {}, { pages_template_id: null == c ? void 0 : c.id, pagetype: "导航自定义页" });
                                  })
                                : []),
                            P(function (e) {
                              var n;
                              (e.filterWgts = g),
                                (e.immersive = (0, I.J7)(g, {
                                  contentPartAnyTab: !0,
                                })),
                                (e.loading = !1),
                                (e.shareInfo = c),
                                (e.pageConfig =
                                  (null == s ||
                                  null ===
                                    (n = s.find(function (e) {
                                      return "page" == e.name;
                                    })) ||
                                  void 0 === n
                                    ? void 0
                                    : n.base) || null),
                                (e.pageId = t || "");
                            }),
                            p().nextTick(
                              (0, i.Z)(
                                (0, a.Z)().mark(function e() {
                                  var t, r, i, l;
                                  return (0, a.Z)().wrap(function (e) {
                                    for (;;)
                                      switch ((e.prev = e.next)) {
                                        case 0:
                                          return (
                                            (r =
                                              (null == n ? void 0 : n.page) ||
                                              {}),
                                            (i = r.route),
                                            (e.next = 3),
                                            I.N_.getRouteParams(
                                              (null == n ||
                                              null === (t = n.router) ||
                                              void 0 === t
                                                ? void 0
                                                : t.params) || {}
                                            )
                                          );
                                        case 3:
                                          (l = e.sent),
                                            A.current &&
                                              A.current.setPageViewSetting(
                                                i,
                                                l,
                                                null == c ? void 0 : c.page_name
                                              ),
                                            (0, I.OO)("pages/custom/index") &&
                                              (0, C.setActivityPageViewGio)(
                                                (0, o.Z)(
                                                  (0, o.Z)({}, c),
                                                  {},
                                                  {
                                                    liveId:
                                                      null == D
                                                        ? void 0
                                                        : D.liveId,
                                                    regionauth_code:
                                                      null == W
                                                        ? void 0
                                                        : W.regionauth_code,
                                                    pagetype: "自定义页面",
                                                  }
                                                )
                                              );
                                        case 6:
                                        case "end":
                                          return e.stop();
                                      }
                                  }, e);
                                })
                              )
                            );
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
            G = T()(function (e) {
              P(function (n) {
                n.scrollY = e.detail.scrollTop;
              });
            }, 100);
          return (0, k.jsx)(m.nO, {
            scrollToTopBtn: !0,
            className: "page-custom-page",
            pageConfig: J,
            loading: N,
            title: null == S ? void 0 : S.page_name,
            immersive: Y,
            pageType: "custom_page",
            adParams: { page_id: V },
            ref: A,
            showLive: !0,
            renderFooter: (0, k.jsx)(k.Fragment, {}),
            onReady: function (e) {
              var n = e.gNavbarH;
              P(function (e) {
                e.navHeight = n;
              });
            },
            children: (0, k.jsx)(f.pf, {
              className: "custom-page-scroll",
              scrollY: !0,
              scrollIntoView: H,
              style: "height: 100%;",
              onScroll: G,
              children: (0, k.jsx)(h.B.Provider, {
                value: {
                  changeItem: function (e) {
                    P(function (n) {
                      n.scrollIntoContentItem = e;
                    }),
                      p().nextTick(function () {
                        P(function (e) {
                          e.scrollIntoContentItem = null;
                        });
                      });
                  },
                  scrollY: j,
                  gNavbarHeight: O,
                  immersive: Y,
                  scrollSelector: ".custom-page-scroll",
                },
                children: (0, k.jsx)(Z.Z, { wgts: R }),
              }),
            }),
          });
        }
        b.options = { addGlobalClass: !0 };
        var N = b;
        Page(
          (0, r.createPageConfig)(
            N,
            "pages/custom/index",
            { root: { cn: [] } },
            {} || {}
          )
        );
      },
    },
    function (e) {
      e.O(0, [2107, 1216, 8592], function () {
        return (function (n) {
          return e((e.s = n));
        })(60122);
      }),
        e.O();
    },
  ]);
})();
