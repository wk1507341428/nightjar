!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [5405],
    {
      79185: function (e, n, r) {
        var t = r(32180),
          a = r(74165),
          o = r(15861),
          i = r(29439),
          c = r(1413),
          u = r(45987),
          l = r(67294),
          s = r(92954),
          d = r.n(s),
          f = r(71515),
          h = r(31707),
          g = r(78061),
          p = r(13651),
          v = r(1696),
          m = r(96856),
          b = r(23577),
          T = r(78673),
          x = r(60683),
          _ = r(90057),
          C = r(83010),
          y = r(70242),
          k = r(30733),
          I = r(15190),
          S = r(85893),
          w = ["name"],
          Z = ["children"],
          W = I._L,
          B = "fv_home_wgts_cache_v1",
          E = !1,
          M = {
            loading: !0,
            refreshing: !1,
            filterWgts: [],
            height: 0,
            gNavbarHeight: (0, I.Mo)(),
            scrollIntoContentItem: null,
            scrollY: 0,
            navStyle: {
              backgroundColor: "transparent",
              color: "#000",
              backgroundColorOpen: "#fff",
              searchBtnColor: "#D4003B",
              searchBtnBorderColor: "#EBEBEB",
            },
            searchExpanded: !1,
            areaModalOpen: !1,
            immersive: !1,
            homeActiveTabIndex: 0,
            homeTabTopFullWidth: null,
            pagesTemplateId: "",
            pagesTemplateRegionauthId: "",
          },
          F = function (e) {
            return (
              e ||
              (function () {
                try {
                  return d().getStorageSync(x.ar) || "";
                } catch (e) {
                  return (
                    console.warn("read home token cache identity error:", e), ""
                  );
                }
              })()
            );
          },
          A = function (e, n) {
            var r =
              e ||
              (function () {
                try {
                  var e = d().getStorageSync(x.lk) || {};
                  return e.userId || e.user_id || "";
                } catch (e) {
                  return (
                    console.warn("read home user cache identity error:", e), ""
                  );
                }
              })();
            if (r) return "user_".concat(r);
            if (!n) return "guest";
            var t = String(n),
              a = t.split(".")[2] || t;
            return "token_".concat(a.slice(-16) || "member");
          },
          N = function (e, n) {
            return ""
              .concat(B, "_")
              .concat(e || "default", "_")
              .concat(n || "guest");
          },
          R = function () {
            try {
              var e,
                n = d().getStorageInfoSync().keys;
              (void 0 === n ? [] : n).forEach(function (e) {
                0 === String(e).indexOf(B) && d().removeStorageSync(e);
              });
            } catch (e) {
              console.warn("clear home cache error:", e);
            }
          },
          j = function (e, n) {
            if (e)
              try {
                d().setStorageSync(e, { time: Date.now(), data: n });
              } catch (e) {
                console.warn("write home cache error:", e);
              }
          },
          Y = function (e) {
            var n = e.config,
              r = void 0 === n ? [] : n,
              t = e.pages_template_id,
              a = e.cacheKey,
              o = r.filter(function (e) {
                return "page" != e.name;
              }),
              i = !1;
            return o.map(function (e, n) {
              var r = e.name,
                o = (0, u.Z)(e, w),
                l = "contentpart" == r && !i;
              l && (i = !0);
              var s = l ? "homecontentpart" : r,
                d = (0, c.Z)(
                  (0, c.Z)({}, o),
                  {},
                  { name: s, pages_template_id: t, pagetype: "首页" }
                );
              if ("homecontentpart" == s) {
                var f,
                  h = "".concat(a || t || "home", "_").concat(n),
                  g =
                    (null == d || null === (f = d.data) || void 0 === f
                      ? void 0
                      : f.data) || [];
                (0, k.P)(h, g),
                  (d.childrenCacheKey = h),
                  (d.data = (0, c.Z)(
                    (0, c.Z)({}, d.data),
                    {},
                    {
                      data: g.map(function (e) {
                        return e.children, (0, u.Z)(e, Z);
                      }),
                    }
                  ));
              }
              return d;
            });
          };
        var H = function () {
          var e = (0, h.v9)(function (e) {
              return e.regionauth;
            }).regionauthInfo,
            n = void 0 === e ? {} : e,
            r = null == n ? void 0 : n.regionauth_id,
            t = (0, _.x)((0, c.Z)((0, c.Z)({}, M), {}, { searchExpanded: E })),
            u = (0, i.Z)(t, 2),
            x = u[0],
            w = u[1],
            Z = (0, l.useRef)(),
            B = (0, h.I0)(),
            H = (0, l.useRef)(E),
            O = (0, l.useRef)(0),
            P = (0, h.v9)(function (e) {
              return e.user.showAdv;
            }),
            K = (0, h.v9)(function (e) {
              return e.member.token;
            }),
            D = (0, l.useMemo)(
              function () {
                return F(K);
              },
              [K]
            ),
            J = (0, l.useRef)(D),
            L = (0, h.v9)(function (e) {
              var n;
              return null === (n = e.user.userInfo) || void 0 === n
                ? void 0
                : n.user_id;
            }),
            U = (0, h.v9)(function (e) {
              return e.regionauth;
            }).isShowRegioModal,
            G = (x.loading, x.refreshing),
            V = x.filterWgts,
            X = x.height,
            q = x.gNavbarHeight,
            z = x.scrollIntoContentItem,
            Q = x.scrollY,
            $ = x.navStyle,
            ee = x.searchExpanded,
            ne = x.areaModalOpen,
            re = x.immersive,
            te = x.pageConfig,
            ae = x.homeActiveTabIndex,
            oe = x.homeTabTopFullWidth,
            ie = x.pagesTemplateId,
            ce = x.pagesTemplateRegionauthId,
            ue = Q <= W ? 0 : Q,
            le = (0, l.useMemo)(
              function () {
                return A(L, D);
              },
              [L, D]
            ),
            se = (0, l.useMemo)(
              function () {
                return N(r, le);
              },
              [r, le]
            ),
            de = (0, l.useCallback)(
              function () {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : {},
                  n = e.config,
                  t = void 0 === n ? [] : n,
                  a = e.pages_template_id,
                  o =
                    arguments.length > 1 && void 0 !== arguments[1]
                      ? arguments[1]
                      : se,
                  i =
                    arguments.length > 2 && void 0 !== arguments[2]
                      ? arguments[2]
                      : r,
                  c = Y({ config: t, pages_template_id: a, cacheKey: o });
                w(function (e) {
                  var n, r, o;
                  (e.immersive =
                    "homecontentpart" ==
                      (null === (n = c[0]) || void 0 === n ? void 0 : n.name) ||
                    (0, m.J7)(c)),
                    (e.filterWgts = c),
                    (e.loading = !1),
                    (e.scrollY = 0),
                    (e.pageConfig =
                      (null == t ||
                      null ===
                        (r = t.find(function (e) {
                          return "page" == e.name;
                        })) ||
                      void 0 === r
                        ? void 0
                        : r.base) || null),
                    (e.pagesTemplateId = a || ""),
                    (e.pagesTemplateRegionauthId = i || "");
                  var u = c.find(function (e) {
                      return "homecontentpart" === e.name;
                    }),
                    l = u ? (0, I.Yg)(u) : 0;
                  e.homeActiveTabIndex = l;
                  var s = u
                      ? (0, I.aF)(u, l, function (e, n, r) {
                          return (0,
                          k.r)(null == r ? void 0 : r.childrenCacheKey, n, null == e ? void 0 : e.children);
                        })
                      : null,
                    d =
                      null == u ||
                      null === (o = u.data) ||
                      void 0 === o ||
                      null === (o = o.data) ||
                      void 0 === o
                        ? void 0
                        : o[l];
                  "page" === (null == d ? void 0 : d.configType) &&
                    (s = !0 === s || !0 === e.homeTabTopFullWidth || null),
                    (e.homeTabTopFullWidth = s);
                });
              },
              [se, w, r]
            );
          (0, l.useEffect)(
            function () {
              if (r) {
                var e,
                  n = J.current !== D;
                (J.current = D),
                  n && (R(), v.Z.shop.clearPageParamsConfigCache()),
                  w(function (e) {
                    (e.pagesTemplateId = ""),
                      (e.pagesTemplateRegionauthId = "");
                  });
                var t = (function (e) {
                    if (!e) return null;
                    try {
                      return d().getStorageSync(e) || null;
                    } catch (e) {
                      return console.warn("read home cache error:", e), null;
                    }
                  })(se),
                  a =
                    !n &&
                    (null == t ? void 0 : t.time) &&
                    Date.now() - t.time < 3e5;
                a &&
                null != t &&
                null !== (e = t.data) &&
                void 0 !== e &&
                null !== (e = e.config) &&
                void 0 !== e &&
                e.length
                  ? de(t.data, se, r)
                  : w(function (e) {
                      e.loading = !0;
                    }),
                  (a && !n) || he(r, se),
                  B((0, b.TX)({ regionauth_id: r }));
              }
            },
            [r, L, D, se]
          ),
            (0, l.useEffect)(
              function () {
                U ? Z.current.pageLock() : Z.current.pageUnLock();
              },
              [U]
            ),
            (0, s.useShareAppMessage)(
              (0, o.Z)(
                (0, a.Z)().mark(function e() {
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return e.abrupt("return", fe());
                        case 1:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              )
            ),
            (0, s.useShareTimeline)(
              (0, o.Z)(
                (0, a.Z)().mark(function e() {
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return e.abrupt("return", fe());
                        case 1:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              )
            );
          var fe = (function () {
              var e = (0, o.Z)(
                (0, a.Z)().mark(function e() {
                  var r, t, o;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (r = __wxConfig.accountInfo.nickname),
                            ((t = (0, m.nD)() || {}).crmcode =
                              null == n ? void 0 : n.regionauth_code),
                            (o = "/pages/index".concat(
                              (0, m.xb)(t) ? "" : "?" + (0, m.so)(t)
                            )),
                            e.abrupt("return", {
                              title: r,
                              imageUrl:
                                "https://aiopro-prod.oss-cn-shanghai.aliyuncs.com/aiopro_vshop/618share.jpg",
                              path: o,
                            })
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
            he = (function () {
              var e = (0, o.Z)(
                (0, a.Z)().mark(function e() {
                  var n,
                    t,
                    o,
                    i,
                    c,
                    u,
                    l,
                    s = arguments;
                  return (0, a.Z)().wrap(
                    function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (n = s.length > 0 && void 0 !== s[0] ? s[0] : r),
                              (t = s.length > 1 && void 0 !== s[1] ? s[1] : se),
                              (e.prev = 2),
                              (e.next = 5),
                              v.Z.shop.getShopTemplate({ regionauth_id: n })
                            );
                          case 5:
                            (o = e.sent),
                              (i = o.config),
                              (c = void 0 === i ? [] : i),
                              (u = o.pages_template_id),
                              de(
                                (l = { config: c, pages_template_id: u }),
                                t,
                                n
                              ),
                              j(t, l),
                              (e.next = 18);
                            break;
                          case 14:
                            (e.prev = 14),
                              (e.t0 = e.catch(2)),
                              w(function (e) {
                                e.loading = !1;
                              }),
                              console.error("fetchWgts error:", e.t0);
                          case 18:
                            return (
                              (e.prev = 18),
                              w(function (e) {
                                e.refreshing = !1;
                              }),
                              e.finish(18)
                            );
                          case 21:
                          case "end":
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[2, 14, 18, 21]]
                  );
                })
              );
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            ge = (0, l.useCallback)(
              (0, o.Z)(
                (0, a.Z)().mark(function e() {
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (r) {
                            e.next = 2;
                            break;
                          }
                          return e.abrupt("return");
                        case 2:
                          return (
                            w(function (e) {
                              e.refreshing = !0;
                            }),
                            (0, T.Am)(),
                            (e.next = 6),
                            he(r, se)
                          );
                        case 6:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              ),
              [r, se]
            ),
            pe = (0, l.useCallback)(
              function (e) {
                if (!(Date.now() < O.current)) {
                  var n = Math.max(e.detail.scrollTop || 0, 0);
                  w(function (e) {
                    e.scrollY = n;
                  });
                }
              },
              [w]
            ),
            ve = (0, l.useCallback)(function () {
              w(function (e) {
                e.scrollY = 0;
              });
            }, []);
          (0, l.useEffect)(
            function () {
              if (!ee && !ne) {
                var e = setTimeout(function () {
                  (E = !0),
                    (H.current = !1),
                    w(function (e) {
                      e.searchExpanded = !0;
                    });
                }, 3e3);
                return function () {
                  return clearTimeout(e);
                };
              }
            },
            [ee, ne, r, w]
          );
          var me = (0, l.useCallback)(
            function (e) {
              var n = e.height,
                r = e.gNavbarH;
              w(function (e) {
                (e.height = n), (e.gNavbarHeight = r);
              });
            },
            [w]
          );
          (0, l.useEffect)(
            function () {
              var e = function () {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : {},
                  n = e.tabIndex,
                  r = e.isTopFullWidth;
                w(function (e) {
                  var t =
                    "number" == typeof n &&
                    n >= 0 &&
                    e.homeActiveTabIndex !== n;
                  t && (e.homeActiveTabIndex = n),
                    "boolean" == typeof r &&
                      (t || !0 !== e.homeTabTopFullWidth || !1 !== r) &&
                      ((e.homeTabTopFullWidth = r),
                      r && ((e.scrollY = 0), (O.current = Date.now() + 400)));
                });
              };
              return (
                d().eventCenter.on("onEventHomeTabNavFullWidth", e),
                function () {
                  d().eventCenter.off("onEventHomeTabNavFullWidth", e);
                }
              );
            },
            [w]
          );
          var be = (0, l.useCallback)(function (e, n, r) {
              return null != r && r.childrenCacheKey
                ? (0, k.r)(
                    r.childrenCacheKey,
                    n,
                    null == e ? void 0 : e.children
                  )
                : null == e
                ? void 0
                : e.children;
            }, []),
            Te = (0, l.useMemo)(
              function () {
                if (!V.length) return "";
                var e = V.find(function (e) {
                  return "page" !== (null == e ? void 0 : e.name);
                });
                if (
                  V.find(function (e) {
                    return "homecontentpart" === e.name;
                  })
                )
                  return !0 === oe ? "" : !1 === oe ? I.nW : "";
                var n, r;
                return (
                  "slider" === (null == e ? void 0 : e.name)
                    ? !!(
                        (null !== (n = e.config) &&
                          void 0 !== n &&
                          n.fullWidth) ||
                        (null !== (r = e.config) &&
                          void 0 !== r &&
                          r.fullScreen)
                      )
                    : (0, m.J7)(V, { getTabChildren: be })
                )
                  ? Q > W
                    ? I.nW
                    : ""
                  : I.nW;
              },
              [Q, V, oe, be]
            ),
            xe = String(ce) === String(r) ? ie : "",
            _e = (0, l.useMemo)(
              function () {
                return V.find(function (e) {
                  return "homecontentpart" === e.name;
                });
              },
              [V]
            ),
            Ce = (0, l.useMemo)(
              function () {
                var e,
                  n,
                  r =
                    null == _e ||
                    null === (e = _e.data) ||
                    void 0 === e ||
                    null === (e = e.data) ||
                    void 0 === e
                      ? void 0
                      : e[ae];
                return {
                  has_home_content_part: !!_e,
                  home_default_tab_index: ae,
                  home_default_tab_params:
                    null !== (n = null == r ? void 0 : r.tabParams) &&
                    void 0 !== n
                      ? n
                      : "",
                };
              },
              [_e, ae]
            );
          return (0, S.jsxs)(g.nO, {
            className: "page-index",
            pageConfig: te,
            onAreaChange: function (e) {
              w(function (n) {
                n.areaModalOpen = e;
              });
            },
            pageType: "home",
            adParams: (0, c.Z)({ home_template_id: xe }, Ce),
            navigateBackgroundImage: Te,
            navigateBackgroundAnimate: !1,
            navigateBackgroundColor: re ? "transparent" : "#fff",
            immersive: re,
            renderFooter: (0, S.jsx)(S.Fragment, {}),
            renderNavigation: (0, S.jsxs)(f.G7, {
              className: "page-index__navigation",
              children: [
                (0, S.jsx)(p.Z, {
                  fadeTail: ee,
                  fadeInstant: H.current,
                  color: $.color,
                  backgroundColor: $.backgroundColor,
                }),
                (0, S.jsx)(g.mW, {
                  collapsible: !0,
                  expanded: ee,
                  expandInstant: H.current,
                  searchBtn: !0,
                  backgroundColor: $.backgroundColor,
                  borderColor: $.searchBtnBorderColor,
                  searchBtnColor: $.searchBtnColor,
                }),
              ],
            }),
            loading: !1,
            ref: Z,
            showLive: !0,
            onReady: me,
            children: [
              (0, S.jsx)(f.pf, {
                className: (0, m.AK)("home-body", {}),
                scrollY: !0,
                scrollIntoView: z,
                onScroll: pe,
                onScrollToUpper: ve,
                refresherEnabled: !0,
                refresherTriggered: G,
                onRefresherRefresh: ge,
                upperThreshold: W,
                bounces: !1,
                showScrollbar: !1,
                enhanced: !0,
                children:
                  V.length > 0 &&
                  (0, S.jsx)(y.B.Provider, {
                    value: {
                      height: X,
                      gNavbarHeight: q,
                      changeItem: function (e) {
                        w(function (n) {
                          n.scrollIntoContentItem = e;
                        }),
                          d().nextTick(function () {
                            w(function (e) {
                              e.scrollIntoContentItem = null;
                            });
                          });
                      },
                      scrollY: Q,
                      navScrollY: ue,
                      immersive: re,
                      isHome: !0,
                      scrollSelector: ".home-body",
                    },
                    children: (0, S.jsx)(C.Z, { wgts: V, eagerWidgetCount: 4 }),
                  }),
              }),
              m.FO && !P && (0, S.jsx)(g.jc, { gNavbarHeight: q }),
            ],
          });
        };
        (H.enableShareTimeline = !0),
          (H.enableShareAppMessage = !0),
          Page(
            (0, t.createPageConfig)(
              H,
              "pages/index",
              { root: { cn: [] } },
              {
                navigationStyle: "custom",
                disableScroll: !0,
                transparentTitle: "auto",
                titlePenetrate: "YES",
                navigationBarTitleText: "首页",
              } || {}
            )
          );
      },
    },
    function (e) {
      e.O(0, [2107, 1216, 8592], function () {
        return (function (n) {
          return e((e.s = n));
        })(79185);
      }),
        e.O();
    },
  ]);
})();
