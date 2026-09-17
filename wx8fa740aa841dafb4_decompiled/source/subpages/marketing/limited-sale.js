!(function () {
  "use strict";
  require("./sub-vendors.js"),
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
      [6256],
      {
        58716: function (e, t, i) {
          var n = i(32180),
            r = i(1413),
            s = i(74165),
            a = i(15861),
            c = i(29439),
            o = i(67294),
            l = i(92954),
            u = i.n(l),
            m = i(90057),
            d = i(31707),
            f = i(71515),
            b = i(84902),
            h = i(67197),
            x = i(78061),
            _ = i(98178),
            g = i(96856),
            p = i(80459),
            j = i(21066),
            v = i(27741),
            N = i(1696),
            G = i(80129),
            y = i.n(G),
            I = i(8359),
            k = i(85893),
            w = {
              bgImgeUrl: "".concat(
                "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                "/fv_limited_sale_bg.png?t=1"
              ),
              titleImgeUrl: "".concat(
                "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                "/fv_limited_sale_title.png"
              ),
              tabList: [],
              curTabIdx: null,
              curTabItemId: null,
              goodsList: [],
              groupInfo: {},
              isDisabled: !1,
              virtualWaterfallHeight: 0,
              isRuleOpened: !1,
              mxBgReadyLeft: !1,
              mxBgReadyRight: !1,
            };
          function q() {
            var e = (0, m.x)(w),
              t = (0, c.Z)(e, 2),
              i = t[0],
              n = t[1],
              G = i.bgImgeUrl,
              q = i.titleImgeUrl,
              Z = i.tabList,
              D = i.curTabIdx,
              L = i.curTabItemId,
              T = i.goodsList,
              R = i.groupInfo,
              M = i.isDisabled,
              S = i.isRuleOpened,
              C = (0, d.v9)(function (e) {
                return e.regionauth;
              }).regionauthInfo,
              Y = void 0 === C ? {} : C,
              H = (0, o.useRef)(null),
              P = (0, o.useRef)(),
              B = (0, l.getCurrentInstance)();
            (0, o.useEffect)(
              function () {
                Z.length &&
                  n(function (e) {
                    e.goodsList = [];
                  });
              },
              [L]
            ),
              (0, o.useEffect)(
                function () {
                  var e = u().getSystemInfoSync().windowHeight;
                  n(function (t) {
                    t.virtualWaterfallHeight = e - 200;
                  });
                  var t = "".concat(
                      "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                      "/fv_mxbg_left.png"
                    ),
                    i = "".concat(
                      "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                      "/fv_mxbg_right.png"
                    );
                  Promise.allSettled([
                    u().getImageInfo({ src: t }),
                    u().getImageInfo({ src: i }),
                  ]).then(function () {
                    n(function (e) {
                      (e.mxBgReadyLeft = !0), (e.mxBgReadyRight = !0);
                    });
                  }),
                    E();
                },
                [Y]
              );
            var E = (function () {
              var e = (0, a.Z)(
                (0, s.Z)().mark(function e() {
                  return (0, s.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (e.next = 2), (0, g.UY)(Y);
                        case 2:
                          e.sent && U();
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
            })();
            (0, o.useEffect)(function () {
              O();
            }, []),
              (0, l.useShareAppMessage)(
                (0, a.Z)(
                  (0, s.Z)().mark(function e() {
                    var t, i, n, r, a;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), g.N_.getRouteParams();
                          case 2:
                            return (
                              (t = e.sent),
                              (i = t.kid),
                              (n = t.id),
                              (r = P.current || i || n),
                              (a =
                                "/subpages/marketing/limited-sale?crmcode=".concat(
                                  null == Y ? void 0 : Y.regionauth_code
                                )),
                              r &&
                                (a = "/subpages/marketing/limited-sale?id="
                                  .concat(r, "&crmcode=")
                                  .concat(
                                    null == Y ? void 0 : Y.regionauth_code
                                  )),
                              e.abrupt("return", {
                                title:
                                  (null == R ? void 0 : R.share_title) ||
                                  "限时秒杀",
                                path: a,
                                imageUrl:
                                  (null == R ? void 0 : R.share_pic) || "",
                              })
                            );
                          case 9:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                )
              );
            var O = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e() {
                    var t, i, n, r;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), g.N_.getRouteParams();
                          case 2:
                            (t = e.sent),
                              (i = t.previousPage),
                              (n = t.searchModule),
                              (r = t.keyword),
                              i &&
                                n &&
                                r &&
                                (0, p.setSearchResultGio)({
                                  searchWord: r,
                                  searchModule: n,
                                  sourceEntrance: i,
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
              })(),
              U = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e() {
                    var t,
                      i,
                      r,
                      a,
                      c,
                      o,
                      l,
                      m,
                      d,
                      f,
                      b,
                      h,
                      x,
                      _,
                      p = arguments;
                    return (0, s.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (t =
                                  p.length > 0 && void 0 !== p[0] ? p[0] : ""),
                                (e.prev = 1),
                                u().showLoading({ title: "" }),
                                (e.next = 5),
                                g.N_.getRouteParams()
                              );
                            case 5:
                              return (
                                (i = e.sent),
                                (r = i.kid),
                                (a = i.r),
                                (c = i.region_id),
                                (o = i.id),
                                (P.current = o),
                                (l = P.current || r || o),
                                (e.next = 14),
                                N.Z.seckill.getCollectionList({
                                  collection_id: l,
                                  activity_type: "limited_time_sale",
                                  regionauth_id:
                                    c ||
                                    a ||
                                    (null == Y ? void 0 : Y.regionauth_id),
                                })
                              );
                            case 14:
                              if (
                                ((m = e.sent),
                                u().hideLoading(),
                                !m || !m.length)
                              ) {
                                e.next = 30;
                                break;
                              }
                              if (
                                0 !=
                                (f = m[0].items.filter(function (e) {
                                  return "on" == e.approve_status;
                                })).length
                              ) {
                                e.next = 21;
                                break;
                              }
                              return (
                                n(function (e) {
                                  e.isDisabled = !0;
                                }),
                                e.abrupt("return")
                              );
                            case 21:
                              (b = new Date().getTime()),
                                (h = (0, g.mr)(b + 864e5, "MM月DD日")),
                                (x = (0, g.mr)(b, "MM月DD日")),
                                f.forEach(function (e) {
                                  var t = e.start_time,
                                    i = e.end_time,
                                    n = e.status,
                                    r = (0, g.mr)(t, "MM月DD日"),
                                    s = (0, g.mr)(t, "HH:mm");
                                  "ongoing" == n
                                    ? ((e.timer = (0, g.vj)(i - b / 1e3)),
                                      (e.textDay = "正在秒杀"))
                                    : ((e.timer = null),
                                      (e.textDay =
                                        h == r
                                          ? "明日开抢"
                                          : x == r
                                          ? "即将开抢"
                                          : r)),
                                    (e.startTime = (0, g.mr)(
                                      t,
                                      "YYYY-MM-DD HH:mm:ss"
                                    )),
                                    (e.endTime = (0, g.mr)(
                                      i,
                                      "YYYY-MM-DD HH:mm:ss"
                                    )),
                                    (e.textTime = s);
                                }),
                                (_ = f.findIndex(function (e) {
                                  return e.collection_item_id == t;
                                })),
                                n(
                                  t && -1 != _
                                    ? function (e) {
                                        var i;
                                        (e.tabList = f),
                                          (e.curTabItemId = t),
                                          (e.curTabIdx = _),
                                          (e.groupInfo = m[0]),
                                          (e.bgImgeUrl = m[0].header_pic || G),
                                          null === (i = H.current) ||
                                            void 0 === i ||
                                            i.reset();
                                      }
                                    : function (e) {
                                        var t;
                                        (e.tabList = f),
                                          (e.curTabItemId =
                                            f[0].collection_item_id),
                                          (e.curTabIdx = 0),
                                          (e.groupInfo = m[0]),
                                          (e.bgImgeUrl = m[0].header_pic || G),
                                          null === (t = H.current) ||
                                            void 0 === t ||
                                            t.reset();
                                      }
                                ),
                                g.N_.postCenterTask({
                                  ruleId:
                                    null == B ||
                                    null === (d = B.router) ||
                                    void 0 === d ||
                                    null === (d = d.params) ||
                                    void 0 === d
                                      ? void 0
                                      : d.ruleId,
                                }),
                                (e.next = 31);
                              break;
                            case 30:
                              n(function (e) {
                                e.isDisabled = !0;
                              });
                            case 31:
                              e.next = 36;
                              break;
                            case 33:
                              (e.prev = 33),
                                (e.t0 = e.catch(1)),
                                u().hideLoading();
                            case 36:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[1, 33]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              F = (0, j.Nr)(function (e, t) {
                e.collection_item_id != L &&
                  (e.start_time,
                  e.end_time,
                  (0, p.setFlowClickGio)({
                    position: 1,
                    index: t + 1,
                    moduleName_var: "限时秒杀",
                    title: e.textDay,
                    regionauth_code:
                      (null == Y ? void 0 : Y.regionauth_code) || "-",
                  }),
                  U(e.collection_item_id));
              }, 200),
              z = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e(t) {
                    var i, r, a, c, o, l, u, m, d;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              ((i = t.pageIndex),
                              (r = void 0 === i ? 1 : i),
                              (a = t.pageSize),
                              (c = Z.find(function (e) {
                                return e.collection_item_id == L;
                              })))
                            ) {
                              e.next = 4;
                              break;
                            }
                            return e.abrupt("return", { total: 0 });
                          case 4:
                            return (
                              (o = {
                                seckill_id: c.relation_id,
                                page: r,
                                pageSize: a,
                                approve_status: "onsale,only_show",
                                item_type: "normal",
                                is_point: "false",
                              }),
                              (e.next = 7),
                              N.Z.item.getLimitedSaleItemList(o)
                            );
                          case 7:
                            return (
                              (l = e.sent),
                              (u = l.list),
                              (m = l.total_count),
                              (d = (0, g.D9)(u, v.Z.goods.LIMITED_SALE_ITEM)),
                              n(function (e) {
                                e.goodsList[r - 1] = d;
                              }),
                              e.abrupt("return", { total: m })
                            );
                          case 13:
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
              A = (function () {
                var e = (0, a.Z)(
                  (0, s.Z)().mark(function e(t, i) {
                    var r;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (!t) {
                              e.next = 4;
                              break;
                            }
                            K(i), (e.next = 18);
                            break;
                          case 4:
                            return (
                              u().showLoading({ title: "" }),
                              (e.next = 7),
                              N.Z.seckill.getCollectionList({
                                collection_id: P.current,
                                activity_type: "limited_time_sale",
                              })
                            );
                          case 7:
                            if (
                              ((r = e.sent), u().hideLoading(), !r || !r.length)
                            ) {
                              e.next = 17;
                              break;
                            }
                            if (
                              0 !=
                              r[0].items.filter(function (e) {
                                return "on" == e.approve_status;
                              }).length
                            ) {
                              e.next = 14;
                              break;
                            }
                            return (
                              n(function (e) {
                                e.isDisabled = !0;
                              }),
                              e.abrupt("return")
                            );
                          case 14:
                            K(i), (e.next = 18);
                            break;
                          case 17:
                            n(function (e) {
                              e.isDisabled = !0;
                            });
                          case 18:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t, i) {
                  return e.apply(this, arguments);
                };
              })(),
              K = function (e) {
                var t = e.itemId,
                  i = e.distributorId,
                  n = { id: t };
                void 0 !== i &&
                  (n = (0, r.Z)((0, r.Z)({}, n), {}, { dtid: i }));
                var s = "/pages/item/espier-detail?".concat(y().stringify(n));
                u().navigateTo({ url: s });
              },
              W = function () {
                n(function (e) {
                  e.isRuleOpened = !1;
                });
              },
              J = function (e) {
                return null == e
                  ? void 0
                  : e.map(function (t, n) {
                      return (0, k.jsxs)(
                        f.G7,
                        {
                          className: (0, g.AK)({
                            "tab-item": !0,
                            "tab-item__down": t.timer,
                            "tab-item__active": n == D,
                          }),
                          onClick: function () {
                            F(t, n);
                          },
                          children: [
                            (0, k.jsx)(f.G7, {
                              className: "tab-item__left",
                              children:
                                n == D && 0 != n && i.mxBgReadyLeft
                                  ? (0, k.jsx)(x.Ko, {
                                      mode: "scaleToFill",
                                      src: "".concat(
                                        "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                                        "/fv_mxbg_left.png"
                                      ),
                                      lazyLoad: !1,
                                      style: { width: "100%", height: "100%" },
                                    })
                                  : (0, k.jsx)(f.G7, {
                                      className: "tab-item__left-bg",
                                    }),
                            }),
                            2 == e.length
                              ? (0, k.jsxs)(f.G7, {
                                  className: "tab-item__main",
                                  children: [
                                    (0, k.jsx)(f.G7, {
                                      className: "tab-item__title",
                                      children: t.textDay,
                                    }),
                                    t.timer
                                      ? (0, k.jsx)(f.G7, {
                                          children: (0, k.jsx)(
                                            b.Z,
                                            {
                                              isShowDay: !!t.timer.dd,
                                              day: t.timer.dd,
                                              hours: t.timer.hh,
                                              minutes: t.timer.mm,
                                              seconds: t.timer.ss,
                                              format: {
                                                day: "天",
                                                hours: ":",
                                                minutes: ":",
                                                seconds: "",
                                              },
                                            },
                                            t.timer.ss
                                          ),
                                        })
                                      : (0, k.jsx)(f.G7, {
                                          className: "tab-item__time",
                                          children: t.textTime,
                                        }),
                                  ],
                                })
                              : (0, k.jsxs)(f.G7, {
                                  className: "tab-item__main",
                                  children: [
                                    t.timer
                                      ? (0, k.jsx)(f.G7, {
                                          children: (0, k.jsx)(
                                            b.Z,
                                            {
                                              isShowDay: !!t.timer.dd,
                                              day: t.timer.dd,
                                              hours: t.timer.hh,
                                              minutes: t.timer.mm,
                                              seconds: t.timer.ss,
                                              format: {
                                                day: "天",
                                                hours: ":",
                                                minutes: ":",
                                                seconds: "",
                                              },
                                            },
                                            t.timer.ss
                                          ),
                                        })
                                      : (0, k.jsx)(f.G7, {
                                          className: "tab-item__time",
                                          children: t.textTime,
                                        }),
                                    (0, k.jsx)(f.G7, {
                                      className: "tab-item__title",
                                      children: t.textDay,
                                    }),
                                  ],
                                }),
                            (0, k.jsx)(f.G7, {
                              className: "tab-item__right",
                              children:
                                n == D && n != e.length - 1 && i.mxBgReadyRight
                                  ? (0, k.jsx)(x.Ko, {
                                      mode: "scaleToFill",
                                      src: "".concat(
                                        "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                                        "/fv_mxbg_right.png"
                                      ),
                                      lazyLoad: !1,
                                      style: { width: "100%", height: "100%" },
                                    })
                                  : (0, k.jsx)(f.G7, {
                                      className: "tab-item__right-bg",
                                    }),
                            }),
                          ],
                        },
                        n
                      );
                    });
              };
            return (0, k.jsxs)(x.nO, {
              immersive: !M,
              navigationLeftBlockWidthFull: !0,
              renderNavigation: M
                ? (0, k.jsx)(f.G7, {
                    className: "text-center w-full nav-title",
                    children: "限时秒杀",
                  })
                : (0, k.jsx)(f.G7, {
                    className: "flex flex-1 justify-items-center items-center",
                    children: (0, k.jsx)(x.Ko, {
                      width: 180,
                      height: 42,
                      src: q,
                    }),
                  }),
              className: "page-limited-sale",
              children: [
                M
                  ? (0, k.jsxs)(f.G7, {
                      className: "no-limited",
                      children: [
                        (0, k.jsx)(f.G7, {
                          className: "no-limited__icon",
                          children: (0, k.jsx)(f.xv, {
                            className: "iconfont icon-a-iconinbox",
                          }),
                        }),
                        (0, k.jsxs)(f.G7, {
                          className: "no-limited__text",
                          children: [
                            (0, k.jsx)(f.G7, {
                              className: "text-center",
                              children: "无正在秒杀的商品",
                            }),
                            (0, k.jsx)(f.G7, {
                              className: "text-center",
                              children: "去商城看看其他商品吧",
                            }),
                          ],
                        }),
                      ],
                    })
                  : (0, k.jsxs)(k.Fragment, {
                      children: [
                        (0, k.jsxs)(f.G7, {
                          className: "bg-box",
                          style: (0, g.Tu)({
                            "background-image": "url(".concat(G, ")"),
                          }),
                          children: [
                            (0, k.jsxs)(f.G7, {
                              className: "bg-box__hd",
                              children: [
                                (0, k.jsx)(f.G7, {}),
                                (0, k.jsxs)(f.G7, {
                                  className: "limited-rule",
                                  onClick: function () {
                                    n(function (e) {
                                      e.isRuleOpened = !0;
                                    });
                                  },
                                  children: [
                                    (0, k.jsx)(f.G7, {
                                      className: "iconfont icon-info",
                                    }),
                                    (0, k.jsx)(f.G7, {
                                      className: "limited-rule__text",
                                      children: "活动规则",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, k.jsx)(f.G7, {
                              className: "bg-box__bd",
                              children: (0, k.jsx)(f.G7, {
                                className: "tab-box",
                                children: (function (e) {
                                  switch (e.length) {
                                    case 1:
                                      return (0, k.jsx)(f.G7, {
                                        className: "tab-box__tab-1",
                                        children:
                                          null == e
                                            ? void 0
                                            : e.map(function (e, t) {
                                                return (0, k.jsx)(
                                                  f.G7,
                                                  {
                                                    className: (0, g.AK)({
                                                      "tab-item": !0,
                                                    }),
                                                    onClick: function () {
                                                      F(e, t);
                                                    },
                                                    children: (0, k.jsxs)(
                                                      f.G7,
                                                      {
                                                        className:
                                                          "tab-item__main",
                                                        children: [
                                                          (0, k.jsxs)(f.G7, {
                                                            className:
                                                              "tab-item__title",
                                                            children: [
                                                              e.timer
                                                                ? "距离本场结束"
                                                                : e.textDay,
                                                              "：",
                                                            ],
                                                          }),
                                                          e.timer
                                                            ? (0, k.jsx)(f.G7, {
                                                                children: (0,
                                                                k.jsx)(
                                                                  b.Z,
                                                                  {
                                                                    isShowDay:
                                                                      !!e.timer
                                                                        .dd,
                                                                    day: e.timer
                                                                      .dd,
                                                                    hours:
                                                                      e.timer
                                                                        .hh,
                                                                    minutes:
                                                                      e.timer
                                                                        .mm,
                                                                    seconds:
                                                                      e.timer
                                                                        .ss,
                                                                    format: {
                                                                      day: "天",
                                                                      hours:
                                                                        ":",
                                                                      minutes:
                                                                        ":",
                                                                      seconds:
                                                                        "",
                                                                    },
                                                                  },
                                                                  e.timer.ss
                                                                ),
                                                              })
                                                            : (0, k.jsx)(f.G7, {
                                                                className:
                                                                  "tab-item__time",
                                                                children:
                                                                  e.textTime,
                                                              }),
                                                        ],
                                                      }
                                                    ),
                                                  },
                                                  t
                                                );
                                              }),
                                      });
                                    case 2:
                                      return (0, k.jsx)(f.G7, {
                                        className: "tab-box__tab-2",
                                        children: J(e),
                                      });
                                    case 3:
                                      return (0, k.jsx)(f.G7, {
                                        className: "tab-box__tab-3",
                                        children: J(e),
                                      });
                                    default:
                                      return (0, k.jsx)(f.G7, {
                                        className: "tab-box__tab-4",
                                        children: (0, k.jsx)(f.G7, {
                                          scrollY: !1,
                                          scrollX: !0,
                                          className: "tab__scroll",
                                          children: J(e),
                                        }),
                                      });
                                  }
                                })(Z),
                              }),
                            }),
                          ],
                        }),
                        (0, k.jsx)(_.ii, {
                          scrollY: !0,
                          ref: H,
                          fetch: z,
                          className: "box-border",
                          pageSize: 1e3,
                          height: i.virtualWaterfallHeight,
                          renderMore: function () {
                            return (0, k.jsx)(k.Fragment, {});
                          },
                          children: (0, k.jsx)(f.G7, {
                            className: "limited-list__main",
                            children:
                              null == T
                                ? void 0
                                : T.map(function (e) {
                                    return null == e
                                      ? void 0
                                      : e.map(function (e, t) {
                                          var i;
                                          return (0, k.jsx)(
                                            f.G7,
                                            {
                                              className: "limited-list__item",
                                              children: (0, k.jsx)(I.Z, {
                                                info: e,
                                                status:
                                                  null === (i = Z[D]) ||
                                                  void 0 === i
                                                    ? void 0
                                                    : i.status,
                                                onClick: function (t) {
                                                  A(t, e);
                                                },
                                                moduleName: "".concat(
                                                  R.collection_name,
                                                  "限时秒杀"
                                                ),
                                                modulePosition: 1,
                                                flowPosition: t + 1,
                                              }),
                                            },
                                            e.itemId
                                          );
                                        });
                                  }),
                          }),
                        }),
                      ],
                    }),
                (0, k.jsx)(f.G7, {
                  className: "rule-modal",
                  children: (0, k.jsx)(h.Z, {
                    isOpened: S,
                    onClose: W,
                    children: (0, k.jsxs)(f.G7, {
                      className: "rule-modal-box",
                      children: [
                        (0, k.jsx)(f.G7, {
                          className: "rule-modal__header",
                          children: "限时秒杀规则",
                        }),
                        (0, k.jsx)(f.G7, {
                          className: "rule-modal__content",
                          children: R.collection_desc,
                        }),
                        (0, k.jsx)(f.G7, {
                          className: "rule-modal__footer",
                          children: (0, k.jsx)(f.G7, {
                            className: "confirm-btn",
                            onClick: W,
                            children: "我知道了",
                          }),
                        }),
                      ],
                    }),
                  }),
                }),
              ],
            });
          }
          (q.enableShareAppMessage = !0),
            Page(
              (0, n.createPageConfig)(
                q,
                "subpages/marketing/limited-sale",
                { root: { cn: [] } },
                {
                  navigationStyle: "custom",
                  navigationBarTitleText: "限时秒杀",
                } || {}
              )
            );
        },
      },
      function (e) {
        e.O(
          0,
          [
            2500, 6758, 7531, 2881, 6437, 5014, 3096, 6010, 8206, 9246, 5710,
            6549, 6220, 1497, 1193, 2903, 4508, 9741, 7312, 7811, 7299, 1699,
            761, 7677, 2817, 9887, 3197, 9651, 5386, 7576, 4300, 998, 2224,
            2302, 8322, 3139, 7502, 8075, 6353, 3921, 7162, 4487, 9658, 5200,
            9444, 9934, 396, 7078, 5469, 2592, 3455, 7453, 1471, 5987, 1871,
            7738, 4539, 2107, 1216, 8592,
          ],
          function () {
            return (function (t) {
              return e((e.s = t));
            })(58716);
          }
        ),
          e.O();
      },
    ]);
})();
