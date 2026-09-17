!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [1554],
    {
      48247: function (e, n, t) {
        var r = t(32180),
          a = t(74165),
          o = t(15861),
          i = t(1413),
          u = t(29439),
          c = t(67294),
          s = t(31707),
          l = t(90057),
          v = t(92954),
          p = t.n(v),
          g = t(80129),
          d = t.n(g),
          f = t(71515),
          m = t(78061),
          h = t(70242),
          w = t(96856),
          x = t(70493),
          _ = t(21066),
          Z = t(58794),
          b = t(83010),
          I = t(80459),
          k = t(85893),
          y = {},
          C = 20,
          S = function () {
            var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : 0;
            if (e <= C) return 0;
            var n = Math.min((e - C) / 80, 1);
            return Number(n.toFixed(3));
          },
          T = function (e) {
            var n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 0;
            if (!e || n <= C) return "transparent";
            var t = S(n);
            return "rgba(255, 255, 255, ".concat(t, ")");
          },
          N = {
            loading: !0,
            shareInfo: null,
            info: null,
            selectType: "picker",
            isShowTabBar: !1,
            policyModal: !1,
            modalDivided: {
              isShow: !1,
              content: "",
              confirmText: "",
              showCancel: !0,
              onCancel: null,
              onConfirm: null,
            },
            scrollIntoContentItem: null,
            scrollY: 0,
            navHeight: 0,
            filterWgts: [],
            immersive: !1,
            pageConfig: null,
            pageId: "",
          };
        function P(e) {
          var n = (0, v.getCurrentInstance)(),
            t = (0, l.x)(N),
            r = (0, u.Z)(t, 2),
            g = r[0],
            C = r[1],
            P = (0, _.HJ)().setNavigationBarTitle,
            R = (0, _.td)().syncRegionauthByShare,
            B = g.loading,
            M = g.shareInfo,
            O = g.scrollIntoContentItem,
            H = g.scrollY,
            Y = g.navHeight,
            j = g.filterWgts,
            W = g.immersive,
            A = g.pageConfig,
            G = g.pageId,
            J = (0, c.useRef)(),
            q = (0, s.v9)(function (e) {
              return e.regionauth;
            }).regionauthInfo,
            U = (0, s.v9)(function (e) {
              return e.live;
            }).liveInfo,
            V = (0, s.v9)(function (e) {
              return e.member;
            }).token,
            D = (0, c.useRef)(!1),
            E = (0, c.useRef)(0),
            F = (0, c.useRef)(-1),
            L = function (e, n) {
              var t =
                arguments.length > 2 && void 0 !== arguments[2]
                  ? arguments[2]
                  : E.current;
              e &&
                (0, w.OO)("pages/custom/custom-page") &&
                F.current !== t &&
                ((F.current = t),
                (0, I.setActivityPageViewGio)(
                  (0, i.Z)(
                    (0, i.Z)({}, e),
                    {},
                    {
                      liveId: null == U ? void 0 : U.liveId,
                      regionauth_code: n,
                      pagetype: "自定义页",
                    }
                  )
                ));
            };
          (0, c.useEffect)(
            function () {
              (0, w.OO)("pages/custom/custom-page") &&
                z({ force: !0, showSeq: E.current });
            },
            [V]
          ),
            (0, v.useDidShow)(function () {
              var e;
              E.current += 1;
              var t = E.current;
              M && L(M, null == q ? void 0 : q.regionauth_code, t),
                z({ showSeq: t }),
                w.N_.postCenterTask({
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
          var z = (function () {
              var e = (0, o.Z)(
                (0, a.Z)().mark(function e() {
                  var t,
                    r,
                    u,
                    c,
                    s,
                    l,
                    v,
                    g,
                    f,
                    m,
                    h,
                    _,
                    b,
                    I,
                    k,
                    S,
                    T,
                    N,
                    B,
                    O = arguments;
                  return (0, a.Z)().wrap(
                    function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              ((t =
                                O.length > 0 && void 0 !== O[0] ? O[0] : {}),
                              (r = t.force),
                              (u = void 0 !== r && r),
                              (c = t.showSeq),
                              (s = void 0 === c ? E.current : c),
                              !D.current)
                            ) {
                              e.next = 4;
                              break;
                            }
                            return (
                              M &&
                                L(M, null == q ? void 0 : q.regionauth_code, s),
                              e.abrupt("return")
                            );
                          case 4:
                            return (
                              (D.current = !0),
                              (e.prev = 5),
                              (e.next = 8),
                              w.N_.getRouteParams(
                                (null == n ||
                                null === (l = n.router) ||
                                void 0 === l
                                  ? void 0
                                  : l.params) || {}
                              )
                            );
                          case 8:
                            if (
                              ((v = e.sent),
                              (g = v.id),
                              (f = (0, w.ik)()),
                              (m = "".concat(g || "", "_").concat(f || "")),
                              (h = y[m]),
                              (_ = null == h ? void 0 : h.config),
                              (b = null == h ? void 0 : h.share),
                              h && !u)
                            ) {
                              e.next = 24;
                              break;
                            }
                            return (
                              (I = d().stringify({
                                template_name: x.CI,
                                version: "v1.0.1",
                                page_name: "custom_".concat(g),
                                distributor_id: f,
                              })),
                              (k = "/pageparams/setting?".concat(I)),
                              (e.next = 20),
                              Z.Z.get(k)
                            );
                          case 20:
                            (S = e.sent),
                              (_ = null == S ? void 0 : S.config),
                              (b = null == S ? void 0 : S.share),
                              (y[m] = { config: _, share: b });
                          case 24:
                            return (
                              (T = null == q ? void 0 : q.regionauth_code),
                              (e.next = 27),
                              R(b, q)
                            );
                          case 27:
                            (N = e.sent),
                              (B = N.townCode) && (T = B),
                              p().nextTick(
                                (0, o.Z)(
                                  (0, a.Z)().mark(function e() {
                                    var t, r, o, u, c, l, v, p, d;
                                    return (0, a.Z)().wrap(function (e) {
                                      for (;;)
                                        switch ((e.prev = e.next)) {
                                          case 0:
                                            return (
                                              (null === (t = b) || void 0 === t
                                                ? void 0
                                                : t.page_name) &&
                                                P(
                                                  null === (r = b) ||
                                                    void 0 === r
                                                    ? void 0
                                                    : r.page_name
                                                ),
                                              (l =
                                                (null === (o = _) ||
                                                void 0 === o
                                                  ? void 0
                                                  : o.length) > 0
                                                  ? _.map(function (e) {
                                                      var n;
                                                      return (0,
                                                      i.Z)((0, i.Z)({}, e), {}, { pages_template_id: null === (n = b) || void 0 === n ? void 0 : n.id, pagetype: "自定义页面" });
                                                    })
                                                  : []),
                                              C(function (e) {
                                                var n;
                                                (e.filterWgts = l),
                                                  (e.loading = !1),
                                                  (e.shareInfo = b),
                                                  (e.pageConfig =
                                                    (null === (n = _) ||
                                                    void 0 === n ||
                                                    null ===
                                                      (n = n.find(function (e) {
                                                        return "page" == e.name;
                                                      })) ||
                                                    void 0 === n
                                                      ? void 0
                                                      : n.base) || null),
                                                  (e.immersive = (0, w.J7)(l, {
                                                    contentPartAnyTab: !0,
                                                  })),
                                                  (e.pageId = g || "");
                                              }),
                                              (v =
                                                (null == n ? void 0 : n.page) ||
                                                {}),
                                              (p = v.route),
                                              (e.next = 6),
                                              w.N_.getRouteParams(
                                                (null == n ||
                                                null === (u = n.router) ||
                                                void 0 === u
                                                  ? void 0
                                                  : u.params) || {}
                                              )
                                            );
                                          case 6:
                                            (d = e.sent),
                                              J.current &&
                                                J.current.setPageViewSetting(
                                                  p,
                                                  d,
                                                  null === (c = b) ||
                                                    void 0 === c
                                                    ? void 0
                                                    : c.page_name
                                                ),
                                              K(),
                                              L(b, T, s);
                                          case 10:
                                          case "end":
                                            return e.stop();
                                        }
                                    }, e);
                                  })
                                )
                              ),
                              (e.next = 35);
                            break;
                          case 33:
                            (e.prev = 33), (e.t0 = e.catch(5));
                          case 35:
                            return (
                              (e.prev = 35),
                              C(function (e) {
                                e.loading = !1;
                              }),
                              (D.current = !1),
                              e.finish(35)
                            );
                          case 39:
                          case "end":
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[5, 33, 35, 39]]
                  );
                })
              );
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            K = (function () {
              var e = (0, o.Z)(
                (0, a.Z)().mark(function e() {
                  var n, t, r, o;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (e.next = 2), w.N_.getRouteParams();
                        case 2:
                          (n = e.sent),
                            (t = n.previousPage),
                            (r = n.searchModule),
                            (o = n.keyword),
                            t &&
                              r &&
                              o &&
                              (0, I.setSearchResultGio)({
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
          (0, v.useShareAppMessage)(
            (0, o.Z)(
              (0, a.Z)().mark(function e() {
                return (0, a.Z)().wrap(function (e) {
                  for (;;)
                    switch ((e.prev = e.next)) {
                      case 0:
                        return e.abrupt("return", Q());
                      case 1:
                      case "end":
                        return e.stop();
                    }
                }, e);
              })
            )
          ),
            (0, v.useShareTimeline)(
              (0, o.Z)(
                (0, a.Z)().mark(function e() {
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return e.abrupt("return", Q());
                        case 1:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              )
            );
          var Q = (function () {
              var e = (0, o.Z)(
                (0, a.Z)().mark(function e() {
                  var t, r, o, i, u;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.next = 2),
                            w.N_.getRouteParams(
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
                              .concat(null == q ? void 0 : q.regionauth_code)),
                            (u = "/pages/custom/custom-page".concat(i)),
                            e.abrupt("return", {
                              title: M.page_share_title,
                              imageUrl: M.page_share_imageUrl,
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
            X = (0, c.useCallback)(function (e) {
              var n = e.detail.scrollTop;
              C(function (e) {
                e.scrollY = n;
              });
            }, []),
            $ = (0, c.useCallback)(function () {
              C(function (e) {
                e.scrollY = 0;
              });
            }, []);
          return (0, k.jsx)(m.nO, {
            scrollToTopBtn: !0,
            className: "page-custom-page",
            pageConfig: A,
            navigationLeftBlockWidthFull: !0,
            loading: B,
            navigateMantle: !0,
            pageType: "custom_page",
            adParams: { page_id: G },
            navigateBackgroundColor: W ? T(W, H) : "#fff",
            renderNavigation: (0, k.jsx)(f.G7, {
              className: "custom-navigation-title",
              style: {
                opacity: W ? S(H) : 1,
                transition: "opacity 0.15s linear",
              },
              children: null == M ? void 0 : M.page_name,
            }),
            immersive: W,
            ref: J,
            showLive: !0,
            onReady: function (e) {
              var n = e.gNavbarH;
              C(function (e) {
                e.navHeight = n;
              });
            },
            children: (0, k.jsx)(f.pf, {
              className: "custom-page-scroll",
              scrollY: !0,
              scrollIntoView: O,
              style: "height: 100%;",
              onScroll: X,
              onScrollToUpper: $,
              children: (0, k.jsx)(h.B.Provider, {
                value: {
                  changeItem: function (e) {
                    C(function (n) {
                      n.scrollIntoContentItem = e;
                    }),
                      p().nextTick(function () {
                        C(function (e) {
                          e.scrollIntoContentItem = null;
                        });
                      });
                  },
                  scrollY: H,
                  gNavbarHeight: Y,
                  immersive: W,
                  scrollSelector: ".custom-page-scroll",
                },
                children: (0, k.jsx)(b.Z, { wgts: j }),
              }),
            }),
          });
        }
        P.options = { addGlobalClass: !0 };
        var R = P;
        (R.enableShareTimeline = !0),
          (R.enableShareAppMessage = !0),
          Page(
            (0, r.createPageConfig)(
              R,
              "pages/custom/custom-page",
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
        })(48247);
      }),
        e.O();
    },
  ]);
})();
