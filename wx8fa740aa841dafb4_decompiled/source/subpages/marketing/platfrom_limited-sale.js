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
      [8997],
      {
        17933: function (e, t, r) {
          var s = r(32180),
            n = r(1413),
            i = r(45987),
            a = r(74165),
            c = r(15861),
            o = r(29439),
            m = r(67294),
            u = r(92954),
            l = r.n(u),
            d = r(90057),
            f = r(31707),
            b = r(71515),
            h = r(84902),
            x = r(67197),
            g = r(78061),
            _ = r(98178),
            p = r(96856),
            j = r(80459),
            v = r(21066),
            N = r(27741),
            G = r(1696),
            y = r(80129),
            w = r.n(y),
            q = r(8359),
            I = r(85893),
            D = ["list", "header_pic"],
            Z = {
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
              goodsList: [],
              groupInfo: {},
              isDisabled: !1,
              virtualWaterfallHeight: 0,
              isRuleOpened: !1,
              mxBgReadyLeft: !1,
              mxBgReadyRight: !1,
            };
          function k() {
            var e = (0, d.x)(Z),
              t = (0, o.Z)(e, 2),
              r = t[0],
              s = t[1],
              y = r.bgImgeUrl,
              k = r.titleImgeUrl,
              T = r.tabList,
              R = r.curTabIdx,
              L = r.goodsList,
              M = r.groupInfo,
              S = r.isDisabled,
              P = r.isRuleOpened,
              C = (0, f.v9)(function (e) {
                return e.regionauth;
              }).regionauthInfo,
              H = void 0 === C ? {} : C,
              O = (0, m.useRef)(null),
              Y = (0, u.getCurrentInstance)(),
              U = (0, m.useRef)(null);
            (0, m.useEffect)(function () {
              var e = l().getSystemInfoSync().windowHeight;
              s(function (t) {
                t.virtualWaterfallHeight = e - 200;
              }),
                (0, p.OO)("subpages/marketing/platfrom_limited-sale") && F();
              var t = "".concat(
                  "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                  "/fv_mxbg_left.png"
                ),
                r = "".concat(
                  "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                  "/fv_mxbg_right.png"
                );
              Promise.allSettled([
                l().getImageInfo({ src: t }),
                l().getImageInfo({ src: r }),
              ]).then(function () {
                s(function (e) {
                  (e.mxBgReadyLeft = !0), (e.mxBgReadyRight = !0);
                });
              });
            }, []),
              (0, m.useEffect)(function () {
                E();
              }, []),
              (0, m.useEffect)(
                function () {
                  if (0 !== T.length) {
                    U.current && (clearTimeout(U.current), (U.current = null));
                    var e = Date.now() / 1e3,
                      t = T.find(function (t) {
                        return t.start_time > e && "waiting" === t.status;
                      });
                    if (t) {
                      var r = 1e3 * t.start_time - Date.now();
                      r > 0 &&
                        r < 864e5 &&
                        (U.current = setTimeout(function () {
                          F();
                        }, r));
                    }
                    return function () {
                      U.current &&
                        (clearTimeout(U.current), (U.current = null));
                    };
                  }
                },
                [T]
              );
            var B = function () {
              F();
            };
            (0, u.useShareAppMessage)(
              (0, c.Z)(
                (0, a.Z)().mark(function e() {
                  var t, r, s, n;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (e.next = 2), p.N_.getRouteParams();
                        case 2:
                          return (
                            (t = e.sent),
                            (r = t.id),
                            (s = t.crmcode),
                            (n = "/subpages/marketing/platfrom_limited-sale?id="
                              .concat(r, "&crmcode=")
                              .concat(s)),
                            e.abrupt("return", {
                              title:
                                (null == M ? void 0 : M.share_title) ||
                                "限时秒杀",
                              path: n,
                              imageUrl:
                                (null == M ? void 0 : M.share_pic) || "",
                            })
                          );
                        case 7:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              )
            );
            var E = (function () {
                var e = (0, c.Z)(
                  (0, a.Z)().mark(function e() {
                    var t, r, s, n;
                    return (0, a.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), p.N_.getRouteParams();
                          case 2:
                            (t = e.sent),
                              (r = t.previousPage),
                              (s = t.searchModule),
                              (n = t.keyword),
                              r &&
                                s &&
                                n &&
                                (0, j.setSearchResultGio)({
                                  searchWord: n,
                                  searchModule: s,
                                  sourceEntrance: r,
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
              F = (function () {
                var e = (0, c.Z)(
                  (0, a.Z)().mark(function e() {
                    var t, r, n, c, o, m, u, l, d, f, b;
                    return (0, a.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.prev = 0),
                                (e.next = 3),
                                p.N_.getRouteParams()
                              );
                            case 3:
                              return (
                                (r = e.sent),
                                (n = r.id),
                                (e.next = 7),
                                G.Z.seckill.getPlatformLimitedSaleItemList({
                                  collection_id: n,
                                  noRegionauth: !0,
                                })
                              );
                            case 7:
                              if (
                                ((c = e.sent),
                                (o = c.list),
                                (m = c.header_pic),
                                (u = (0, i.Z)(c, D)),
                                0 != o.length)
                              ) {
                                e.next = 14;
                                break;
                              }
                              return (
                                s(function (e) {
                                  e.isDisabled = !0;
                                }),
                                e.abrupt("return")
                              );
                            case 14:
                              (l = new Date().getTime()),
                                (d = (0, p.mr)(l + 864e5, "MM月DD日")),
                                (f = (0, p.mr)(l, "MM月DD日")),
                                (b = o
                                  .filter(function (e) {
                                    return "end" != e.status;
                                  })
                                  .map(function (e) {
                                    var t = e.start_time,
                                      r = e.end_time,
                                      s = e.status,
                                      n = (0, p.mr)(t, "MM月DD日"),
                                      i = (0, p.mr)(t, "HH:mm");
                                    return (
                                      "ongoing" == s
                                        ? ((e.timer = (0, p.vj)(r - l / 1e3)),
                                          (e.textDay = "正在秒杀"))
                                        : "waiting" == s &&
                                          ((e.timer = null),
                                          (e.textDay =
                                            d == n
                                              ? "明日开抢"
                                              : f == n
                                              ? "即将开抢"
                                              : n)),
                                      (e.startTime = (0, p.mr)(
                                        t,
                                        "YYYY-MM-DD HH:mm:ss"
                                      )),
                                      (e.endTime = (0, p.mr)(
                                        r,
                                        "YYYY-MM-DD HH:mm:ss"
                                      )),
                                      (e.textTime = i),
                                      e
                                    );
                                  })),
                                s(function (e) {
                                  var t;
                                  (e.tabList = b),
                                    (e.curTabIdx = 0),
                                    (e.groupInfo = u),
                                    (e.bgImgeUrl = m || y),
                                    null === (t = O.current) ||
                                      void 0 === t ||
                                      t.reset();
                                }),
                                p.N_.postCenterTask({
                                  ruleId:
                                    null == Y ||
                                    null === (t = Y.router) ||
                                    void 0 === t ||
                                    null === (t = t.params) ||
                                    void 0 === t
                                      ? void 0
                                      : t.ruleId,
                                }),
                                (e.next = 24);
                              break;
                            case 22:
                              (e.prev = 22), (e.t0 = e.catch(0));
                            case 24:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 22]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              z = (0, v.Nr)(function (e, t) {
                s(function (e) {
                  var r;
                  (e.goodsList = []),
                    (e.curTabIdx = t),
                    null === (r = O.current) || void 0 === r || r.reset();
                }),
                  (0, j.setFlowClickGio)({
                    position: 1,
                    index: t + 1,
                    moduleName_var: "限时秒杀",
                    title: e.textDay,
                    regionauth_code:
                      (null == H ? void 0 : H.regionauth_code) || "-",
                  });
              }, 200),
              A = (function () {
                var e = (0, c.Z)(
                  (0, a.Z)().mark(function e(t) {
                    var r, n, i, c, o, m, u, l, d, f;
                    return (0, a.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (r = t.pageIndex),
                              (n = void 0 === r ? 1 : r),
                              (i = t.pageSize),
                              (e.next = 3),
                              p.N_.getRouteParams()
                            );
                          case 3:
                            if (((c = e.sent), (o = c.id))) {
                              e.next = 7;
                              break;
                            }
                            return e.abrupt("return", { total: 0 });
                          case 7:
                            return (
                              (m = {
                                page: n,
                                pageSize: i,
                                collection_id: o,
                                activity_type: "limited_time_sale",
                                page_type: "platform",
                                noRegionauth: !0,
                                company_id: 1,
                                start_time: T[R].start_time,
                                end_time: T[R].end_time,
                              }),
                              (e.next = 10),
                              G.Z.wgts.getPromotion(m)
                            );
                          case 10:
                            return (
                              (u = e.sent),
                              (l = u.list),
                              (d = u.total_count),
                              (f = (0, p.D9)(l, N.Z.goods.LIMITED_SALE_ITEM)),
                              s(function (e) {
                                e.goodsList[n - 1] = f;
                              }),
                              e.abrupt("return", { total: d })
                            );
                          case 16:
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
              K = (function () {
                var e = (0, c.Z)(
                  (0, a.Z)().mark(function e(t) {
                    var r, s, i, c;
                    return (0, a.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            (r = t.itemId),
                              (s = t.distributorId),
                              t.regionauthId,
                              (i = { id: r }),
                              void 0 !== s &&
                                (i = (0, n.Z)(
                                  (0, n.Z)({}, i),
                                  {},
                                  { dtid: s }
                                )),
                              (c = "/pages/item/espier-detail?".concat(
                                w().stringify(i)
                              )),
                              l().navigateTo({ url: c });
                          case 5:
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
              W = function () {
                s(function (e) {
                  e.isRuleOpened = !1;
                });
              },
              J = function (e) {
                return null == e
                  ? void 0
                  : e.map(function (t, s) {
                      return (0, I.jsxs)(
                        b.G7,
                        {
                          className: (0, p.AK)({
                            "tab-item": !0,
                            "tab-item__down": t.timer,
                            "tab-item__active": s == R,
                          }),
                          onClick: function () {
                            z(t, s);
                          },
                          children: [
                            (0, I.jsx)(b.G7, {
                              className: "tab-item__left",
                              children:
                                s == R && 0 != s && r.mxBgReadyLeft
                                  ? (0, I.jsx)(g.Ko, {
                                      mode: "scaleToFill",
                                      src: "".concat(
                                        "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                                        "/fv_mxbg_left.png"
                                      ),
                                      lazyLoad: !1,
                                      style: { width: "100%", height: "100%" },
                                    })
                                  : (0, I.jsx)(b.G7, {
                                      className: "tab-item__left-bg",
                                    }),
                            }),
                            2 == e.length
                              ? (0, I.jsxs)(b.G7, {
                                  className: "tab-item__main",
                                  children: [
                                    (0, I.jsx)(b.G7, {
                                      className: "tab-item__title",
                                      children: t.textDay,
                                    }),
                                    t.timer
                                      ? (0, I.jsx)(b.G7, {
                                          children: (0, I.jsx)(
                                            h.Z,
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
                                              onTimeUp: B,
                                            },
                                            t.timer.ss
                                          ),
                                        })
                                      : (0, I.jsx)(b.G7, {
                                          className: "tab-item__time",
                                          children: t.textTime,
                                        }),
                                  ],
                                })
                              : (0, I.jsxs)(b.G7, {
                                  className: "tab-item__main",
                                  children: [
                                    t.timer
                                      ? (0, I.jsx)(b.G7, {
                                          children: (0, I.jsx)(
                                            h.Z,
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
                                              onTimeUp: B,
                                            },
                                            t.timer.ss
                                          ),
                                        })
                                      : (0, I.jsx)(b.G7, {
                                          className: "tab-item__time",
                                          children: t.textTime,
                                        }),
                                    (0, I.jsx)(b.G7, {
                                      className: "tab-item__title",
                                      children: t.textDay,
                                    }),
                                  ],
                                }),
                            (0, I.jsx)(b.G7, {
                              className: "tab-item__right",
                              children:
                                s == R && s != e.length - 1 && r.mxBgReadyRight
                                  ? (0, I.jsx)(g.Ko, {
                                      mode: "scaleToFill",
                                      src: "".concat(
                                        "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                                        "/fv_mxbg_right.png"
                                      ),
                                      lazyLoad: !1,
                                      style: { width: "100%", height: "100%" },
                                    })
                                  : (0, I.jsx)(b.G7, {
                                      className: "tab-item__right-bg",
                                    }),
                            }),
                          ],
                        },
                        s
                      );
                    });
              };
            return (0, I.jsxs)(g.nO, {
              immersive: !S,
              navigationLeftBlockWidthFull: !0,
              renderNavigation: S
                ? (0, I.jsx)(b.G7, {
                    className: "text-center w-full nav-title",
                    children: "限时秒杀",
                  })
                : (0, I.jsx)(b.G7, {
                    className: "flex flex-1 justify-items-center items-center",
                    children: (0, I.jsx)(g.Ko, {
                      width: 180,
                      height: 42,
                      src: k,
                    }),
                  }),
              className: "page-limited-sale",
              children: [
                S
                  ? (0, I.jsxs)(b.G7, {
                      className: "no-limited",
                      children: [
                        (0, I.jsx)(b.G7, {
                          className: "no-limited__icon",
                          children: (0, I.jsx)(b.xv, {
                            className: "iconfont icon-a-iconinbox",
                          }),
                        }),
                        (0, I.jsxs)(b.G7, {
                          className: "no-limited__text",
                          children: [
                            (0, I.jsx)(b.G7, {
                              className: "text-center",
                              children: "无正在秒杀的商品",
                            }),
                            (0, I.jsx)(b.G7, {
                              className: "text-center",
                              children: "去商城看看其他商品吧",
                            }),
                          ],
                        }),
                      ],
                    })
                  : (0, I.jsxs)(I.Fragment, {
                      children: [
                        (0, I.jsxs)(b.G7, {
                          className: "bg-box",
                          style: (0, p.Tu)({
                            "background-image": "url(".concat(y, ")"),
                          }),
                          children: [
                            (0, I.jsxs)(b.G7, {
                              className: "bg-box__hd",
                              children: [
                                (0, I.jsx)(b.G7, {}),
                                (0, I.jsxs)(b.G7, {
                                  className: "limited-rule",
                                  onClick: function () {
                                    s(function (e) {
                                      e.isRuleOpened = !0;
                                    });
                                  },
                                  children: [
                                    (0, I.jsx)(b.G7, {
                                      className: "iconfont icon-info",
                                    }),
                                    (0, I.jsx)(b.G7, {
                                      className: "limited-rule__text",
                                      children: "活动规则",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, I.jsx)(b.G7, {
                              className: "bg-box__bd",
                              children: (0, I.jsx)(b.G7, {
                                className: "tab-box",
                                children: (function (e) {
                                  switch (e.length) {
                                    case 1:
                                      return (0, I.jsx)(b.G7, {
                                        className: "tab-box__tab-1",
                                        children:
                                          null == e
                                            ? void 0
                                            : e.map(function (e, t) {
                                                return (0, I.jsx)(
                                                  b.G7,
                                                  {
                                                    className: (0, p.AK)({
                                                      "tab-item": !0,
                                                    }),
                                                    onClick: function () {
                                                      z(e, t);
                                                    },
                                                    children: (0, I.jsxs)(
                                                      b.G7,
                                                      {
                                                        className:
                                                          "tab-item__main",
                                                        children: [
                                                          (0, I.jsxs)(b.G7, {
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
                                                            ? (0, I.jsx)(b.G7, {
                                                                children: (0,
                                                                I.jsx)(
                                                                  h.Z,
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
                                                                    onTimeUp: B,
                                                                  },
                                                                  e.timer.ss
                                                                ),
                                                              })
                                                            : (0, I.jsx)(b.G7, {
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
                                      return (0, I.jsx)(b.G7, {
                                        className: "tab-box__tab-2",
                                        children: J(e),
                                      });
                                    case 3:
                                      return (0, I.jsx)(b.G7, {
                                        className: "tab-box__tab-3",
                                        children: J(e),
                                      });
                                    default:
                                      return (0, I.jsx)(b.G7, {
                                        className: "tab-box__tab-4",
                                        children: (0, I.jsx)(b.G7, {
                                          scrollY: !1,
                                          scrollX: !0,
                                          className: "tab__scroll",
                                          children: J(e),
                                        }),
                                      });
                                  }
                                })(T),
                              }),
                            }),
                          ],
                        }),
                        (0, I.jsx)(_.ii, {
                          scrollY: !0,
                          ref: O,
                          fetch: A,
                          className: "box-border",
                          pageSize: 1e3,
                          height: r.virtualWaterfallHeight,
                          renderMore: function () {
                            return (0, I.jsx)(I.Fragment, {});
                          },
                          children: (0, I.jsx)(b.G7, {
                            className: "limited-list__main",
                            children:
                              null == L
                                ? void 0
                                : L.map(function (e) {
                                    return null == e
                                      ? void 0
                                      : e.map(function (e, t) {
                                          var r;
                                          return (0, I.jsx)(
                                            b.G7,
                                            {
                                              className: "limited-list__item",
                                              children: (0, I.jsx)(q.Z, {
                                                info: e,
                                                status:
                                                  null === (r = T[R]) ||
                                                  void 0 === r
                                                    ? void 0
                                                    : r.status,
                                                onClick: function () {
                                                  K(e);
                                                },
                                                moduleName: "".concat(
                                                  M.collection_name,
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
                (0, I.jsx)(b.G7, {
                  className: "rule-modal",
                  children: (0, I.jsx)(x.Z, {
                    isOpened: P,
                    onClose: W,
                    children: (0, I.jsxs)(b.G7, {
                      className: "rule-modal-box",
                      children: [
                        (0, I.jsx)(b.G7, {
                          className: "rule-modal__header",
                          children: "限时秒杀规则",
                        }),
                        (0, I.jsx)(b.G7, {
                          className: "rule-modal__content",
                          children: M.collection_desc,
                        }),
                        (0, I.jsx)(b.G7, {
                          className: "rule-modal__footer",
                          children: (0, I.jsx)(b.G7, {
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
          (k.enableShareAppMessage = !0),
            Page(
              (0, s.createPageConfig)(
                k,
                "subpages/marketing/platfrom_limited-sale",
                { root: { cn: [] } },
                { navigationStyle: "custom" } || {}
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
            })(17933);
          }
        ),
          e.O();
      },
    ]);
})();
