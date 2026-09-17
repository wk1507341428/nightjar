!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [8257],
    {
      84158: function (e, n, t) {
        var r = t(32180),
          a = t(74165),
          o = t(1413),
          i = t(15861),
          u = t(29439),
          l = t(67294),
          s = t(31707),
          c = t(90057),
          p = t(92954),
          f = t.n(p),
          g = t(80129),
          v = t.n(g),
          d = t(71515),
          m = t(78061),
          h = t(70242),
          x = t(96856),
          b = t(70493),
          Z = t(21066),
          _ = t(58794),
          w = t(83010),
          k = t(80459),
          I = t(85893),
          y = 20,
          C = function () {
            var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : 0;
            if (e <= y) return 0;
            var n = Math.min((e - y) / 80, 1);
            return Number(n.toFixed(3));
          },
          N = function (e) {
            var n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 0;
            if (!e || n <= y) return "transparent";
            var t = C(n);
            return "rgba(255, 255, 255, ".concat(t, ")");
          },
          P = {
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
        function S(e) {
          var n = (0, p.getCurrentInstance)(),
            t = (0, c.x)(P),
            r = (0, u.Z)(t, 2),
            g = r[0],
            y = r[1],
            S = (0, Z.HJ)().setNavigationBarTitle,
            T = g.loading,
            R = g.shareInfo,
            O = g.scrollIntoContentItem,
            G = g.scrollY,
            H = g.navHeight,
            M = g.filterWgts,
            Y = g.immersive,
            j = g.pageConfig,
            A = g.pageId,
            B = (0, l.useRef)(),
            V = (0, l.useRef)(!1),
            W = (0, l.useRef)(!1),
            J = (0, l.useRef)(!0),
            L = (0, s.v9)(function (e) {
              return e.regionauth;
            }).regionauthInfo,
            U = (0, s.v9)(function (e) {
              return e.live;
            }).liveInfo,
            E = (0, s.v9)(function (e) {
              return e.member.token;
            });
          (0, p.useLoad)(function () {
            F();
          }),
            (0, l.useEffect)(
              function () {
                (0, x.OO)("subpages/platfrom/index") &&
                  (J.current
                    ? (J.current = !1)
                    : (y(function (e) {
                        e.loading = !0;
                      }),
                      F({ skipGio: !0 })));
              },
              [E]
            ),
            (0, p.useDidShow)(function () {
              var e;
              x.N_.postCenterTask({
                ruleId:
                  null == n ||
                  null === (e = n.router) ||
                  void 0 === e ||
                  null === (e = e.params) ||
                  void 0 === e
                    ? void 0
                    : e.ruleId,
              }),
                f().nextTick(
                  (0, i.Z)(
                    (0, a.Z)().mark(function e() {
                      var t, r, i, u;
                      return (0, a.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (V.current) {
                                e.next = 3;
                                break;
                              }
                              return (V.current = !0), e.abrupt("return");
                            case 3:
                              if (!(0, x.OO)("subpages/platfrom/index")) {
                                e.next = 10;
                                break;
                              }
                              return (
                                (r = (null == n ? void 0 : n.page) || {}),
                                (i = r.route),
                                (e.next = 7),
                                x.N_.getRouteParams(
                                  (null == n ||
                                  null === (t = n.router) ||
                                  void 0 === t
                                    ? void 0
                                    : t.params) || {}
                                )
                              );
                            case 7:
                              (u = e.sent),
                                B.current &&
                                  B.current.setPageViewSetting(
                                    i,
                                    u,
                                    null == R ? void 0 : R.page_name
                                  ),
                                R &&
                                  (D(),
                                  (0, k.setActivityPageViewGio)(
                                    (0, o.Z)(
                                      (0, o.Z)({}, R),
                                      {},
                                      {
                                        liveId: null == U ? void 0 : U.liveId,
                                        regionauth_code:
                                          null == L
                                            ? void 0
                                            : L.regionauth_code,
                                        pagetype: "平台页",
                                      }
                                    )
                                  ));
                            case 10:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  )
                );
            });
          var F = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e() {
                  var t,
                    r,
                    u,
                    l,
                    s,
                    c,
                    p,
                    g,
                    d,
                    m,
                    h,
                    Z,
                    w = arguments;
                  return (0, a.Z)().wrap(
                    function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (t = w.length > 0 && void 0 !== w[0] ? w[0] : {}),
                              (r = t.skipGio),
                              (u = void 0 !== r && r),
                              (e.prev = 2),
                              (e.next = 5),
                              x.N_.getRouteParams(
                                (null == n ||
                                null === (l = n.router) ||
                                void 0 === l
                                  ? void 0
                                  : l.params) || {}
                              )
                            );
                          case 5:
                            if (((s = e.sent), (c = s.id) && !W.current)) {
                              e.next = 9;
                              break;
                            }
                            return e.abrupt("return");
                          case 9:
                            return (
                              (W.current = !0),
                              (p = v().stringify({
                                template_name: b.CI,
                                version: "v1.0.1",
                                page_name: "custom_".concat(c),
                                distributor_id: (0, x.ik)(),
                                page_type: "platform",
                              })),
                              (g = "/pageparams/setting?".concat(p)),
                              (e.next = 14),
                              _.Z.get(g)
                            );
                          case 14:
                            (d = e.sent),
                              (m = d.config),
                              (null == (h = d.share) ? void 0 : h.page_name) &&
                                S(null == h ? void 0 : h.page_name),
                              (Z =
                                (null == m ? void 0 : m.length) > 0
                                  ? m.map(function (e) {
                                      return (0,
                                      o.Z)((0, o.Z)({}, e), {}, { pages_template_id: null == h ? void 0 : h.id, pagetype: "平台页" });
                                    })
                                  : []),
                              y(function (e) {
                                var n;
                                (e.filterWgts = Z),
                                  (e.immersive = (0, x.J7)(Z, {
                                    contentPartAnyTab: !0,
                                  })),
                                  (e.loading = !1),
                                  (e.shareInfo = h),
                                  (e.pageConfig =
                                    (null == m ||
                                    null ===
                                      (n = m.find(function (e) {
                                        return "page" == e.name;
                                      })) ||
                                    void 0 === n
                                      ? void 0
                                      : n.base) || null),
                                  (e.pageId = c || "");
                              }),
                              f().nextTick(
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
                                              x.N_.getRouteParams(
                                                (null == n ||
                                                null === (t = n.router) ||
                                                void 0 === t
                                                  ? void 0
                                                  : t.params) || {}
                                              )
                                            );
                                          case 3:
                                            (l = e.sent),
                                              B.current &&
                                                B.current.setPageViewSetting(
                                                  i,
                                                  l,
                                                  null == h
                                                    ? void 0
                                                    : h.page_name
                                                ),
                                              u ||
                                                (D(),
                                                (0, x.OO)(
                                                  "subpages/platfrom/index"
                                                ) &&
                                                  (0, k.setActivityPageViewGio)(
                                                    (0, o.Z)(
                                                      (0, o.Z)({}, h),
                                                      {},
                                                      {
                                                        liveId:
                                                          null == U
                                                            ? void 0
                                                            : U.liveId,
                                                        regionauth_code:
                                                          null == L
                                                            ? void 0
                                                            : L.regionauth_code,
                                                        pagetype: "平台页",
                                                      }
                                                    )
                                                  ));
                                          case 6:
                                          case "end":
                                            return e.stop();
                                        }
                                    }, e);
                                  })
                                )
                              ),
                              (e.next = 25);
                            break;
                          case 23:
                            (e.prev = 23), (e.t0 = e.catch(2));
                          case 25:
                            return (
                              (e.prev = 25), (W.current = !1), e.finish(25)
                            );
                          case 28:
                          case "end":
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[2, 23, 25, 28]]
                  );
                })
              );
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            D = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e() {
                  var n, t, r, o;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (e.next = 2), x.N_.getRouteParams();
                        case 2:
                          (n = e.sent),
                            (t = n.previousPage),
                            (r = n.searchModule),
                            (o = n.keyword),
                            t &&
                              r &&
                              o &&
                              (0, k.setSearchResultGio)({
                                searchWord: o,
                                searchModule: r,
                                sourceEntrance: t,
                                resultNumber: 0,
                                ifSearchResult: "其他",
                              });
                        case 7:
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
          (0, p.useShareAppMessage)(
            (0, i.Z)(
              (0, a.Z)().mark(function e() {
                return (0, a.Z)().wrap(function (e) {
                  for (;;)
                    switch ((e.prev = e.next)) {
                      case 0:
                        return e.abrupt("return", q());
                      case 1:
                      case "end":
                        return e.stop();
                    }
                }, e);
              })
            )
          ),
            (0, p.useShareTimeline)(
              (0, i.Z)(
                (0, a.Z)().mark(function e() {
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return e.abrupt("return", q());
                        case 1:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              )
            );
          var q = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e() {
                  var t, r, o, i, u;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.next = 2),
                            x.N_.getRouteParams(
                              (null == n ||
                              null === (t = n.router) ||
                              void 0 === t
                                ? void 0
                                : t.params) || {}
                            )
                          );
                        case 2:
                          return (
                            (r = e.sent),
                            (o = r.id),
                            (i = "?id="
                              .concat(o, "&crmcode=")
                              .concat(null == L ? void 0 : L.regionauth_code)),
                            (u = "/subpages/platfrom/index".concat(i)),
                            e.abrupt("return", {
                              title: R.page_share_title,
                              imageUrl: R.page_share_imageUrl,
                              path: u,
                            })
                          );
                        case 7:
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
            z = (0, l.useCallback)(function (e) {
              var n = e.detail.scrollTop;
              y(function (e) {
                e.scrollY = n;
              });
            }, []),
            K = (0, l.useCallback)(function () {
              y(function (e) {
                e.scrollY = 0;
              });
            }, []);
          return (0, I.jsx)(m.nO, {
            scrollToTopBtn: !0,
            className: "platfrom-page",
            pageConfig: j,
            loading: T,
            navigationLeftBlockWidthFull: !0,
            navigateMantle: !0,
            pageType: "platform_page",
            adParams: { page_id: A },
            navigateBackgroundColor: Y ? N(Y, G) : "#fff",
            renderNavigation: (0, I.jsx)(d.G7, {
              className: "custom-navigation-title",
              style: {
                opacity: Y ? C(G) : 1,
                transition: "opacity 0.15s linear",
              },
              children: null == R ? void 0 : R.page_name,
            }),
            immersive: Y,
            ref: B,
            showLive: !0,
            onReady: function (e) {
              var n = e.gNavbarH;
              y(function (e) {
                e.navHeight = n;
              });
            },
            children: (0, I.jsx)(d.pf, {
              className: "platfrom-page-scroll",
              scrollY: !0,
              scrollIntoView: O,
              style: "height: 100%;",
              onScroll: z,
              onScrollToUpper: K,
              children: (0, I.jsx)(h.B.Provider, {
                value: {
                  changeItem: function (e) {
                    y(function (n) {
                      n.scrollIntoContentItem = e;
                    }),
                      f().nextTick(function () {
                        y(function (e) {
                          e.scrollIntoContentItem = null;
                        });
                      });
                  },
                  scrollY: G,
                  gNavbarHeight: H,
                  immersive: Y,
                  scrollSelector: ".platfrom-page-scroll",
                },
                children: (0, I.jsx)(w.Z, { wgts: M }),
              }),
            }),
          });
        }
        S.options = { addGlobalClass: !0 };
        var T = S;
        (T.enableShareTimeline = !0),
          (T.enableShareAppMessage = !0),
          Page(
            (0, r.createPageConfig)(
              T,
              "subpages/platfrom/index",
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
        })(84158);
      }),
        e.O();
    },
  ]);
})();
