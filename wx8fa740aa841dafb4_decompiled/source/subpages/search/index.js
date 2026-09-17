!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [5397],
    {
      59785: function (e, n, r) {
        var t = r(32180),
          s = r(93433),
          a = r(1413),
          i = r(74165),
          o = r(15861),
          c = r(29439),
          l = r(67294),
          u = r(92954),
          h = r.n(u),
          d = r(90057),
          p = r(31707),
          g = r(71515),
          f = r(78061),
          v = r(96856),
          m = r(21066),
          _ = r(60683),
          x = r(1696),
          w = r(27741),
          k = r(80459),
          N = r(81906),
          y = r(85893);
        function j(e) {
          var n =
            arguments.length > 1 && void 0 !== arguments[1]
              ? arguments[1]
              : null;
          if (null == e || ("string" == typeof e && "" === e.trim())) return n;
          try {
            return JSON.parse("string" == typeof e ? e : String(e));
          } catch (e) {
            return n;
          }
        }
        var b = {
          historyKeywords: [],
          hotKeywords: [],
          hotList: [],
          hotIndex: 0,
          rankingList: [],
          searchValue: "",
          prompTagList: [],
          lists: null,
          isShowMore: !1,
          previousPage: "",
        };
        var Z = function () {
          var e,
            n,
            r = (0, d.x)(b),
            t = (0, c.Z)(r, 2),
            Z = t[0],
            S = t[1],
            G = Z.historyKeywords,
            I = Z.hotKeywords,
            K = Z.hotList,
            C = Z.hotIndex,
            L = Z.rankingList,
            P = Z.searchValue,
            T = Z.prompTagList,
            M = Z.lists,
            O = Z.isShowMore,
            E = Z.previousPage,
            R = (0, p.v9)(function (e) {
              return e.live;
            }).liveInfo,
            F = void 0 === R ? {} : R,
            z = (0, p.v9)(function (e) {
              return e.regionauth;
            }).regionauthInfo,
            W = void 0 === z ? {} : z,
            J = ((0, u.useRouter)() || {}).params,
            V = (null == J ? void 0 : J.keyword) || "",
            A = null == J ? void 0 : J.position,
            D = h().getStorageSync(_.hl) || {},
            H =
              ((null == J ? void 0 : J.placeholderKey) &&
                D[J.placeholderKey]) ||
              j(null == J ? void 0 : J.placeholderObj, null),
            Y = (null == J ? void 0 : J.type) || "",
            q = (null == J ? void 0 : J.dtid) || "",
            B = (0, m.j8)({
              tags: G,
              containerSelector: ".sp-search-page__tags",
              tagSelector: ".sp-search-page__tag",
              maxRows: 2,
            }),
            U = B.sliceIndex,
            Q = B.hasMore,
            X = B.isLoading,
            $ = (0, l.useRef)(null),
            ee = (0, m.j8)({
              tags: K,
              containerSelector: ".sp-search-page__hot-tags",
              tagSelector: ".sp-search-page__hot-tag",
              maxRows: 2,
            }).sliceIndex;
          (0, l.useEffect)(function () {
            (0, v.PS)().then(function (e) {
              S(function (n) {
                n.previousPage = (null == e ? void 0 : e.previousPage) || "";
              });
            });
          }, []);
          var ne = (0, l.useCallback)(
            function () {
              var e = h().getStorageSync(_.Sy);
              S(function (n) {
                (n.historyKeywords = e || []),
                  (n.searchValue = ""),
                  (n.prompTagList = []),
                  (n.isShowMore = !1),
                  (n.lists = null);
              });
            },
            [S]
          );
          (0, u.useDidShow)(function () {
            ne(),
              h().nextTick(function () {
                var e;
                null === (e = $.current) || void 0 === e || e.pageLock();
              });
          }),
            (0, l.useEffect)(function () {
              ie();
            }, []),
            (0, l.useEffect)(
              function () {
                U > 0 &&
                  S(function (e) {
                    e.lists = G.slice(0, 1 == U ? 1 : U - 1);
                  });
              },
              [U, G]
            ),
            (0, l.useEffect)(function () {
              he();
            }, []);
          var re = (function () {
              var e = (0, o.Z)(
                (0, i.Z)().mark(function e(n) {
                  return (0, i.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (e.next = 2), (0, k.setSearchClickGio)(n);
                        case 2:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function (n) {
                return e.apply(this, arguments);
              };
            })(),
            te = (function () {
              var e = (0, o.Z)(
                (0, i.Z)().mark(function e(n, r, t, o) {
                  var c, l, u;
                  return (0, i.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (n) {
                            e.next = 2;
                            break;
                          }
                          return e.abrupt("return");
                        case 2:
                          if ("search" != r || !t) {
                            e.next = 14;
                            break;
                          }
                          if (!t.link_path) {
                            e.next = 14;
                            break;
                          }
                          if (!(c = j(t.link_path, null))) {
                            e.next = 14;
                            break;
                          }
                          if (1 != (null == c ? void 0 : c.linkType)) {
                            e.next = 12;
                            break;
                          }
                          if (null == c || !c.linkUrl) {
                            e.next = 10;
                            break;
                          }
                          return (
                            (0, v.bz)(
                              (0, a.Z)(
                                (0, a.Z)({}, c),
                                {},
                                {
                                  previousPage: E,
                                  searchModule: "底纹词搜索",
                                  keyword: n,
                                }
                              )
                            ),
                            e.abrupt("return")
                          );
                        case 10:
                          e.next = 14;
                          break;
                        case 12:
                          return (
                            (0, v.bz)(
                              (0, a.Z)(
                                (0, a.Z)({}, c),
                                {},
                                {
                                  previousPage: E,
                                  searchModule: "底纹词搜索",
                                  keyword: n,
                                }
                              )
                            ),
                            e.abrupt("return")
                          );
                        case 14:
                          return (
                            (e.next = 16),
                            (0, N.xV)({
                              keywords: n,
                              regionauth_id:
                                null == W ? void 0 : W.regionauth_id,
                              previousPage: E,
                            })
                          );
                        case 16:
                          if (
                            ((l = e.sent),
                            "hot" != r &&
                              ((u = G.filter(function (e) {
                                return e !== n;
                              })),
                              h().setStorageSync(_.Sy, [n].concat((0, s.Z)(u))),
                              S(function (e) {
                                e.historyKeywords = [n].concat((0, s.Z)(u));
                              })),
                            !l)
                          ) {
                            e.next = 20;
                            break;
                          }
                          return e.abrupt("return");
                        case 20:
                          h().navigateTo({
                            url: "/subpages/search/list?keywords="
                              .concat(ae(n), "&dtid=")
                              .concat(q, "&sourceEntrance=")
                              .concat(E, "&searchModule=")
                              .concat(r, "&searchType=")
                              .concat(r, "&searchIndex=")
                              .concat(o + 1),
                          });
                        case 21:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function (n, r, t, s) {
                return e.apply(this, arguments);
              };
            })(),
            se = (function () {
              var e = (0, o.Z)(
                (0, i.Z)().mark(function e(n, r) {
                  return (0, i.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.next = 2),
                            re({
                              sourceEntrance: E || "-",
                              searchModule: "榜单",
                              searchWord: "",
                              resultNumber: 0,
                              ifSearchResult: "其他",
                              flowName: "".concat(n.name, "热卖榜") || 0,
                              flowPosition: r + 1,
                              townName:
                                (null == W ? void 0 : W.regionauth_code) || "-",
                              liveId: (null == F ? void 0 : F.liveId) || "-",
                            })
                          );
                        case 2:
                          h().navigateTo({
                            url: "/subpages/marketing/category-ranking?id=".concat(
                              n.id
                            ),
                          });
                        case 3:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function (n, r) {
                return e.apply(this, arguments);
              };
            })(),
            ae = function (e) {
              var n = [
                { code: "%", encode: "%25" },
                { code: "?", encode: "%3F" },
                { code: "#", encode: "%23" },
                { code: "&", encode: "%26" },
                { code: "=", encode: "%3D" },
              ];
              return e.replace(/[%?#&=]/g, function (e, r, t) {
                for (var s = 0, a = n; s < a.length; s++) {
                  var i = a[s];
                  if (i.code === e) return i.encode;
                }
              });
            },
            ie = (function () {
              var e = (0, o.Z)(
                (0, i.Z)().mark(function e() {
                  var n, r, t;
                  return (0, i.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.next = 2),
                            x.Z.item.getHotKeyword({
                              page_no: 1,
                              page_size: 9999,
                              regionauth_id:
                                null == W ? void 0 : W.regionauth_id,
                            })
                          );
                        case 2:
                          (n = e.sent),
                            (r = n.list),
                            (t = void 0 === r ? [] : r),
                            S(function (e) {
                              (e.hotKeywords = JSON.parse(JSON.stringify(t))),
                                (e.hotList = JSON.parse(JSON.stringify(t))),
                                (e.hotIndex = 0);
                            });
                        case 6:
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
            oe = (0, m.Nr)(
              (0, o.Z)(
                (0, i.Z)().mark(function e() {
                  var n;
                  return (0, i.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          0 != ee
                            ? ((n = C + ee),
                              I.slice(n, I.length).length > 0
                                ? S(function (e) {
                                    (e.hotList = I.slice(n, I.length)),
                                      (e.hotIndex = n);
                                  })
                                : S(function (e) {
                                    (e.hotList = I), (e.hotIndex = 0);
                                  }))
                            : S(function (e) {
                                (e.hotList = I), (e.hotIndex = 0);
                              });
                        case 1:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              ),
              200
            ),
            ce = (0, l.useCallback)(
              (0, v.Ds)(function (e) {
                S(function (n) {
                  (n.searchValue = e),
                    "" === e.trim() ? (n.prompTagList = []) : le(e);
                });
              }, 400),
              []
            ),
            le = (function () {
              var e = (0, o.Z)(
                (0, i.Z)().mark(function e(n) {
                  var r;
                  return (0, i.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.next = 2),
                            x.Z.item.getSuggestions({
                              input: n,
                              size: 20,
                              regionauth_id:
                                null == W ? void 0 : W.regionauth_id,
                            })
                          );
                        case 2:
                          (r = e.sent),
                            S(function (e) {
                              e.prompTagList = r || [];
                            });
                        case 4:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function (n) {
                return e.apply(this, arguments);
              };
            })(),
            ue = function (e) {
              if (!P) return e;
              var n = e.toLowerCase().indexOf(P.toLowerCase());
              if (-1 === n) return e;
              var r = e.substring(0, n),
                t = e.substring(n, n + P.length),
                s = e.substring(n + P.length);
              return (0, y.jsxs)(y.Fragment, {
                children: [
                  r,
                  (0, y.jsx)(g.xv, {
                    className: "sp-search-page__highlight",
                    children: t,
                  }),
                  s,
                ],
              });
            },
            he = (function () {
              var e = (0, o.Z)(
                (0, i.Z)().mark(function e() {
                  var n, r, t, s;
                  return (0, i.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.next = 2),
                            x.Z.seckill.getRankingList({
                              regionauth_id:
                                null == W ? void 0 : W.regionauth_id,
                              page_no: 1,
                              page_size: 100,
                            })
                          );
                        case 2:
                          if (
                            ((n = e.sent),
                            (r = n.list),
                            !((t = void 0 === r ? [] : r).length >= 2))
                          ) {
                            e.next = 11;
                            break;
                          }
                          if (
                            !(
                              (s = t.filter(function (e) {
                                return e.list.length >= e.num;
                              })).length < 2
                            )
                          ) {
                            e.next = 9;
                            break;
                          }
                          return e.abrupt("return");
                        case 9:
                          (s = s.slice(0, 3)),
                            S(function (e) {
                              e.rankingList = (0, v.D9)(
                                s,
                                w.Z.goods.CATEGORY_RANKING
                              );
                            });
                        case 11:
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
            de = function (e) {
              if (e.cover)
                return {
                  "background-image": "url(".concat(e.cover, ")"),
                  "background-size": "cover",
                  "background-color": "transparent",
                };
            },
            pe = (0, l.useCallback)(function (e) {
              var n = j(e.link_path, {});
              return null != n && n.imgWidth && null != n && n.imgHeight
                ? {
                    width: h().pxTransform(null == n ? void 0 : n.imgWidth),
                    height: h().pxTransform(null == n ? void 0 : n.imgHeight),
                  }
                : {};
            }, []);
          return (0, y.jsxs)(f.nO, {
            className: "sp-search-page",
            navigateBackgroundColor: "#F8F8F8",
            showLive: !0,
            ref: $,
            renderNavigation: (0, y.jsx)(f.mW, {
              backgroundColor: "#fff",
              searchBtn: !0,
              btnOnSearch: !0,
              inputEnabled: !0,
              autoFocus: !0,
              value: P,
              placeholder: decodeURIComponent(V),
              placeholderObj: H,
              onSearch: function (e, n) {
                re({
                  sourceEntrance: E || "-",
                  searchModule: P ? "自然搜索" : "搜索底纹词",
                  searchWord: P ? e : V,
                  flowName: P ? "-" : "底纹词",
                  flowPosition: P ? 0 : A,
                  townName: (null == W ? void 0 : W.regionauth_code) || "-",
                  liveId: (null == F ? void 0 : F.liveId) || "-",
                }),
                  te(e, "search", n);
              },
              onChange: ce,
            }),
            children: [
              !P &&
                (0, y.jsxs)(g.pf, {
                  scrollY: !0,
                  className: "sp-search-page__content",
                  children: [
                    G.length
                      ? (0, y.jsxs)(g.G7, {
                          className:
                            "sp-search-page__section sp-search-page__section--history",
                          children: [
                            (0, y.jsxs)(g.G7, {
                              className: "sp-search-page__section-header",
                              children: [
                                (0, y.jsx)(g.G7, {
                                  className: "sp-search-page__section-title",
                                  children: "历史搜索",
                                }),
                                (0, y.jsx)(f.Ko, {
                                  src: "fv_delete.png",
                                  width: 40,
                                  onClick: function () {
                                    h().setStorageSync(_.Sy, []),
                                      S(function (e) {
                                        e.historyKeywords = [];
                                      });
                                  },
                                }),
                              ],
                            }),
                            (0, y.jsxs)(g.G7, {
                              className: "sp-search-page__tags",
                              style: (0, v.Tu)({
                                maxHeight: O ? "fit-content" : "138rpx",
                              }),
                              children: [
                                null === (e = M || G) ||
                                void 0 === e ||
                                null === (e = e.slice(0, 20)) ||
                                void 0 === e
                                  ? void 0
                                  : e.map(function (e, n) {
                                      return (0, y.jsx)(
                                        g.G7,
                                        {
                                          className: (0, v.AK)(
                                            "sp-search-page__tag",
                                            {
                                              "sp-search-page__tag--loading": X,
                                            }
                                          ),
                                          onClick: (0, o.Z)(
                                            (0, i.Z)().mark(function r() {
                                              return (0, i.Z)().wrap(function (
                                                r
                                              ) {
                                                for (;;)
                                                  switch ((r.prev = r.next)) {
                                                    case 0:
                                                      return (
                                                        (r.next = 2),
                                                        re({
                                                          sourceEntrance:
                                                            E || "-",
                                                          searchModule:
                                                            "历史搜索",
                                                          searchWord: e,
                                                          resultNumber: 0,
                                                          ifSearchResult:
                                                            "其他",
                                                          flowName: e || "-",
                                                          flowPosition: n + 1,
                                                          townName:
                                                            (null == W
                                                              ? void 0
                                                              : W.regionauth_code) ||
                                                            "-",
                                                          liveId:
                                                            (null == F
                                                              ? void 0
                                                              : F.liveId) ||
                                                            "-",
                                                        })
                                                      );
                                                    case 2:
                                                      te(e, "history", "", n);
                                                    case 3:
                                                    case "end":
                                                      return r.stop();
                                                  }
                                              },
                                              r);
                                            })
                                          ),
                                          children: e,
                                        },
                                        n
                                      );
                                    }),
                                Q &&
                                  (0, y.jsx)(g.G7, {
                                    className: "sp-search-page__tag",
                                    onClick: function () {
                                      S(function (e) {
                                        (e.isShowMore = !O),
                                          (e.lists = O
                                            ? G.slice(0, 1 == U ? 1 : U - 1)
                                            : G);
                                      });
                                    },
                                    children: (0, y.jsx)(f.Ko, {
                                      src: O
                                        ? "fv_expand_up.png"
                                        : "fv_expand_down.png",
                                      className: "sp-search-page__tag_icon",
                                    }),
                                  }),
                              ],
                            }),
                          ],
                        })
                      : null,
                    I.length && "store" !== Y
                      ? (0, y.jsxs)(g.G7, {
                          className:
                            "sp-search-page__section sp-search-page__section--hot",
                          children: [
                            (0, y.jsxs)(g.G7, {
                              className: "sp-search-page__section-header",
                              children: [
                                (0, y.jsx)(g.G7, {
                                  className: "sp-search-page__section-title",
                                  children: "热门搜索",
                                }),
                                (0, y.jsx)(f.Ko, {
                                  src: "fv_refresh.png",
                                  width: 40,
                                  onClick: function () {
                                    return oe();
                                  },
                                }),
                              ],
                            }),
                            (0, y.jsx)(g.G7, {
                              className: "sp-search-page__hot-tags",
                              children:
                                null === (n = K || I) || void 0 === n
                                  ? void 0
                                  : n.map(function (e, n) {
                                      return (0, y.jsx)(
                                        g.G7,
                                        {
                                          className: "sp-search-page__hot-tag",
                                          style: (0, v.Tu)({
                                            background:
                                              null == e ? void 0 : e.background,
                                            color: null == e ? void 0 : e.color,
                                          }),
                                          onClick: function () {
                                            return (function (e, n) {
                                              if (
                                                (re({
                                                  sourceEntrance: E || "-",
                                                  searchModule: "热门搜索",
                                                  searchWord: e.keyword,
                                                  resultNumber: 0,
                                                  ifSearchResult: "其他",
                                                  flowName: e.keyword || "-",
                                                  flowPosition: n + 1,
                                                  townName:
                                                    (null == W
                                                      ? void 0
                                                      : W.regionauth_code) ||
                                                    "-",
                                                  liveId:
                                                    (null == F
                                                      ? void 0
                                                      : F.liveId) || "-",
                                                }),
                                                e.link_path)
                                              ) {
                                                var r = j(e.link_path, null);
                                                r
                                                  ? (0, v.bz)(
                                                      (0, a.Z)(
                                                        (0, a.Z)({}, r),
                                                        {},
                                                        {
                                                          previousPage: E,
                                                          searchModule:
                                                            "热门搜索",
                                                          keyword: e.keyword,
                                                        }
                                                      )
                                                    )
                                                  : te(e.keyword, "hot", "", n);
                                              } else
                                                te(e.keyword, "hot", "", n);
                                            })(e, n);
                                          },
                                          children:
                                            "image" == e.keyword_type
                                              ? (0, y.jsx)(g.G7, {
                                                  style: pe(e),
                                                  children: (0, y.jsx)(f.Ko, {
                                                    mode: "heightFix",
                                                    src:
                                                      null == e
                                                        ? void 0
                                                        : e.icon,
                                                    height: 36,
                                                  }),
                                                })
                                              : (0, y.jsxs)(g.G7, {
                                                  className: "flex",
                                                  children: [
                                                    (0, y.jsx)(g.G7, {
                                                      style: pe(e),
                                                      children:
                                                        null != e && e.icon
                                                          ? (0, y.jsx)(f.Ko, {
                                                              mode: "heightFix",
                                                              src:
                                                                null == e
                                                                  ? void 0
                                                                  : e.icon,
                                                              height: 36,
                                                            })
                                                          : null,
                                                    }),
                                                    (0, y.jsx)(g.xv, {
                                                      className: "pl-10",
                                                      children: e.keyword,
                                                    }),
                                                  ],
                                                }),
                                        },
                                        n
                                      );
                                    }),
                            }),
                          ],
                        })
                      : null,
                    "store" !== Y &&
                      (0, y.jsx)(g.G7, {
                        className:
                          "sp-search-page__section sp-search-page__ranking",
                        children: L.map(function (e, n) {
                          var r;
                          return (0, y.jsxs)(
                            g.G7,
                            {
                              className: "sp-search-page__ranking-section",
                              style: (0, v.Tu)((0, a.Z)({}, de(e))),
                              children: [
                                (0, y.jsxs)(g.G7, {
                                  className: "sp-search-page__ranking-title",
                                  onClick: function () {
                                    return se(e, n);
                                  },
                                  children: [
                                    (0, y.jsxs)(g.xv, {
                                      children: [e.name, "热卖榜"],
                                    }),
                                    (0, y.jsx)(f.Ko, {
                                      src: "fv_arrow_forward.png",
                                      width: 32,
                                      height: 32,
                                      mode: "widthFix",
                                    }),
                                  ],
                                }),
                                (0, y.jsx)(g.G7, {
                                  className: "sp-search-page__ranking-list",
                                  children:
                                    null == e ||
                                    null === (r = e.list) ||
                                    void 0 === r
                                      ? void 0
                                      : r.map(function (e, r) {
                                          return (0, y.jsxs)(
                                            g.G7,
                                            {
                                              className:
                                                "sp-search-page__ranking-item",
                                              onClick: (0, o.Z)(
                                                (0, i.Z)().mark(function r() {
                                                  return (0, i.Z)().wrap(
                                                    function (r) {
                                                      for (;;)
                                                        switch (
                                                          (r.prev = r.next)
                                                        ) {
                                                          case 0:
                                                            return (
                                                              (r.next = 2),
                                                              re({
                                                                sourceEntrance:
                                                                  E || "-",
                                                                searchModule:
                                                                  "榜单",
                                                                searchWord: "",
                                                                resultNumber: 0,
                                                                ifSearchResult:
                                                                  "其他",
                                                                flowName:
                                                                  e.itemName ||
                                                                  "-",
                                                                flowPosition:
                                                                  n + 1,
                                                                townName:
                                                                  (null == W
                                                                    ? void 0
                                                                    : W.regionauth_code) ||
                                                                  "-",
                                                                liveId:
                                                                  (null == F
                                                                    ? void 0
                                                                    : F.liveId) ||
                                                                  "-",
                                                              })
                                                            );
                                                          case 2:
                                                            h().navigateTo({
                                                              url: "/pages/item/espier-detail?id=".concat(
                                                                e.itemId
                                                              ),
                                                            });
                                                          case 3:
                                                          case "end":
                                                            return r.stop();
                                                        }
                                                    },
                                                    r
                                                  );
                                                })
                                              ),
                                              children: [
                                                (0, y.jsxs)(g.G7, {
                                                  className:
                                                    "sp-search-page__ranking-item-left",
                                                  children: [
                                                    (0, y.jsx)(g.G7, {
                                                      className: (0, v.AK)(
                                                        "sp-search-page__ranking-index"
                                                      ),
                                                      children:
                                                        r < 3
                                                          ? "TOP.".concat(r + 1)
                                                          : r + 1,
                                                    }),
                                                    (0, y.jsx)(f.Ko, {
                                                      src: e.img,
                                                      width: 96,
                                                      height: 96,
                                                      radius: 12,
                                                      mode: "aspectFill",
                                                    }),
                                                  ],
                                                }),
                                                (0, y.jsxs)(g.G7, {
                                                  className:
                                                    "sp-search-page__ranking-content",
                                                  children: [
                                                    (0, y.jsx)(g.G7, {
                                                      className:
                                                        "sp-search-page__ranking-item-title",
                                                      children: e.itemName,
                                                    }),
                                                    (0, y.jsxs)(g.G7, {
                                                      className:
                                                        "sp-search-page__ranking-item-info",
                                                      children: [
                                                        (0, y.jsx)(g.G7, {
                                                          className:
                                                            "sp-search-page__ranking-item-info-price",
                                                          children: (0, y.jsx)(
                                                            f.qq,
                                                            {
                                                              value: e.price,
                                                              size: 28,
                                                              weight: 600,
                                                              unitSize: 22,
                                                            }
                                                          ),
                                                        }),
                                                        (0, y.jsxs)(g.G7, {
                                                          className:
                                                            "sp-search-page__ranking-item-info-hot",
                                                          children: [
                                                            (0, y.jsx)(f.Ko, {
                                                              src: "fv_hot.png",
                                                              width: 24,
                                                              height: 24,
                                                              mode: "widthFix",
                                                            }),
                                                            (0, y.jsx)(g.xv, {
                                                              children: e.score,
                                                            }),
                                                          ],
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            },
                                            r
                                          );
                                        }),
                                }),
                              ],
                            },
                            n
                          );
                        }),
                      }),
                    (0, y.jsx)(g.G7, {
                      className: "sp-search-page__content-bottom",
                    }),
                  ],
                }),
              P && T && T.length
                ? (0, y.jsx)(g.pf, {
                    scrollY: !0,
                    className: "sp-search-page__list",
                    children: (0, y.jsx)(g.G7, {
                      className: "sp-search-page__content",
                      children:
                        null == T
                          ? void 0
                          : T.map(function (e, n) {
                              return (0, y.jsxs)(
                                g.G7,
                                {
                                  className: "sp-search-page__item",
                                  onClick: (0, o.Z)(
                                    (0, i.Z)().mark(function r() {
                                      return (0, i.Z)().wrap(function (r) {
                                        for (;;)
                                          switch ((r.prev = r.next)) {
                                            case 0:
                                              return (
                                                (r.next = 2),
                                                re({
                                                  sourceEntrance: E || "-",
                                                  searchModule: "搜索推荐词",
                                                  searchWord: e,
                                                  resultNumber: 0,
                                                  ifSearchResult: "其他",
                                                  flowName: e || "-",
                                                  flowPosition: n + 1,
                                                  townName:
                                                    (null == W
                                                      ? void 0
                                                      : W.regionauth_code) ||
                                                    "-",
                                                  liveId:
                                                    (null == F
                                                      ? void 0
                                                      : F.liveId) || "-",
                                                })
                                              );
                                            case 2:
                                              te(e, "process", "", n);
                                            case 3:
                                            case "end":
                                              return r.stop();
                                          }
                                      }, r);
                                    })
                                  ),
                                  children: [
                                    (0, y.jsx)(f.Ko, {
                                      className: "sp-search-page__item_icon",
                                      src: "fv_search.png",
                                    }),
                                    (0, y.jsx)(g.xv, { children: ue(e) }),
                                  ],
                                },
                                n
                              );
                            }),
                    }),
                  })
                : null,
            ],
          });
        };
        Page(
          (0, t.createPageConfig)(
            Z,
            "subpages/search/index",
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
        })(59785);
      }),
        e.O();
    },
  ]);
})();
