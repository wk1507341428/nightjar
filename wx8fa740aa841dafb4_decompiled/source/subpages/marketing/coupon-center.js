!(function () {
  "use strict";
  require("./sub-vendors.js"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [7014],
      {
        31924: function (n, e, t) {
          var r = t(32180),
            c = t(4942),
            a = t(74165),
            o = t(15861),
            i = t(29439),
            u = t(67294),
            s = t(31707),
            l = t(90057),
            p = t(45557),
            d = t(92954),
            f = t.n(d),
            m = t(1696),
            h = t(27741),
            g = t(21066),
            v = t(71515),
            x = t(96856),
            b = t(78061),
            k = t(13651),
            y = t(60683),
            S = t(80459),
            w = t(62188),
            Z = t(85893),
            _ = {
              couponList: [],
              btns: [
                {
                  title: "全部",
                  btnStatus: "active",
                  type: "offline,AIOPRO,onlineshop",
                  channel: "",
                },
                {
                  title: "线上券",
                  btnStatus: "primary",
                  type: "onlineshop",
                  channel: "online",
                },
                {
                  title: "线下券",
                  btnStatus: "primary",
                  type: "offline",
                  channel: "offline",
                },
                {
                  title: "通用券",
                  btnStatus: "primary",
                  type: "offline,AIOPRO,onlineshop",
                  channel: "common",
                },
              ],
              page: 1,
              pageSize: 10,
              pageFv: 1,
              LoadSpListAll: !1,
              LoadFvListAll: !1,
              refresh: !1,
              loading: !0,
              scrollTop: 0,
              currentTab: -1,
              routerType: "",
            };
          function L(n) {
            var e = (0, l.x)(_),
              t = (0, i.Z)(e, 2),
              r = t[0],
              L = t[1],
              T = r.couponList,
              N = r.page,
              j = r.pageSize,
              C = r.LoadSpListAll,
              G = r.LoadFvListAll,
              A = r.loading,
              I = r.pageFv,
              F = r.currentTab,
              O = r.btns,
              P = (r.routerType, (0, g.dd)()),
              E = P.showModal,
              M = P.closeModal,
              R = (0, s.v9)(function (n) {
                return n.regionauth;
              }).regionauthInfo,
              K = (0, u.useRef)(null),
              D = (0, d.getCurrentInstance)(),
              z = f().getStorageSync(y.OZ),
              U = (0, g.oK)(function () {
                en(!0);
              }),
              V = (function () {
                var n = (0, o.Z)(
                  (0, a.Z)().mark(function n() {
                    var e, t, r, c;
                    return (0, a.Z)().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            return (n.next = 2), x.N_.getRouteParams();
                          case 2:
                            return (
                              (e = n.sent),
                              (t = e.package_id),
                              (r = e.channel_id),
                              (c = e.source),
                              n.abrupt("return", {
                                package_id: t,
                                channel_id: r,
                                source: c,
                              })
                            );
                          case 7:
                          case "end":
                            return n.stop();
                        }
                    }, n);
                  })
                );
                return function () {
                  return n.apply(this, arguments);
                };
              })();
            (0, u.useEffect)(function () {
              q(),
                f().nextTick(function () {
                  var n;
                  null === (n = K.current) || void 0 === n || n.pageLock();
                });
            }, []),
              (0, u.useEffect)(function () {
                W();
              }, []),
              (0, u.useEffect)(
                function () {
                  L(function (n) {
                    (n.couponList = []),
                      (n.page = 1),
                      (n.pageFv = 1),
                      (n.LoadSpListAll = !1),
                      (n.LoadFvListAll = !1),
                      (n.loading = !1);
                  }),
                    f().nextTick(
                      (0, o.Z)(
                        (0, a.Z)().mark(function n() {
                          var e;
                          return (0, a.Z)().wrap(function (n) {
                            for (;;)
                              switch ((n.prev = n.next)) {
                                case 0:
                                  return (n.next = 2), (0, x.UY)(R);
                                case 2:
                                  n.sent &&
                                    (null === (e = K.current) ||
                                      void 0 === e ||
                                      e.scrollToTop(),
                                    U());
                                case 4:
                                case "end":
                                  return n.stop();
                              }
                          }, n);
                        })
                      )
                    );
                },
                [R]
              ),
              (0, d.useDidShow)(function () {
                var n;
                x.N_.postCenterTask({
                  ruleId:
                    null == D ||
                    null === (n = D.router) ||
                    void 0 === n ||
                    null === (n = n.params) ||
                    void 0 === n
                      ? void 0
                      : n.ruleId,
                });
              }),
              (0, u.useEffect)(
                function () {
                  f().nextTick(function () {
                    K.current.pageLock();
                  });
                },
                [T]
              );
            var B = (0, u.useMemo)(function () {
              return [
                { title: "免费领取" },
                { title: "积分兑换" },
                { title: "现金购买" },
              ];
            }, []);
            (0, u.useEffect)(
              function () {
                -1 != F && en();
              },
              [F, C, G]
            );
            var W = (function () {
                var n = (0, o.Z)(
                  (0, a.Z)().mark(function n() {
                    var e, t, r, c;
                    return (0, a.Z)().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            return (n.next = 2), x.N_.getRouteParams();
                          case 2:
                            (e = n.sent),
                              (t = e.previousPage),
                              (r = e.searchModule),
                              (c = e.keyword),
                              t &&
                                r &&
                                c &&
                                (0, S.setSearchResultGio)({
                                  searchWord: c,
                                  searchModule: r,
                                  sourceEntrance: t,
                                  resultNumber: 0,
                                  ifSearchResult: "其他",
                                });
                          case 7:
                          case "end":
                            return n.stop();
                        }
                    }, n);
                  })
                );
                return function () {
                  return n.apply(this, arguments);
                };
              })(),
              q = (function () {
                var n = (0, o.Z)(
                  (0, a.Z)().mark(function n() {
                    var e, t, r, c, o, i;
                    return (0, a.Z)().wrap(
                      function (n) {
                        for (;;)
                          switch ((n.prev = n.next)) {
                            case 0:
                              return (
                                (n.prev = 0),
                                (n.next = 3),
                                x.N_.getRouteParams()
                              );
                            case 3:
                              (e = n.sent),
                                (t = e.type),
                                (r = e.m),
                                (c = e.s),
                                "point" == t
                                  ? ((o = (null == D ? void 0 : D.page) || {}),
                                    (i = o.route),
                                    null != e &&
                                      e.m &&
                                      null != e &&
                                      e.s &&
                                      (f().setStorageSync(y.Et, i),
                                      f().setStorageSync(y.OZ, e)),
                                    L(function (n) {
                                      (n.routerType = "point"),
                                        (n.currentTab = 1),
                                        (n.loading = !1);
                                    }),
                                    x.N_.trackPageViewNum({
                                      type: t,
                                      m: r,
                                      s: c,
                                    }))
                                  : L(function (n) {
                                      (n.currentTab = 0), (n.loading = !1);
                                    }),
                                (n.next = 11);
                              break;
                            case 8:
                              (n.prev = 8),
                                (n.t0 = n.catch(0)),
                                L(function (n) {
                                  n.loading = !1;
                                });
                            case 11:
                            case "end":
                              return n.stop();
                          }
                      },
                      n,
                      null,
                      [[0, 8]]
                    );
                  })
                );
                return function () {
                  return n.apply(this, arguments);
                };
              })(),
              H = (function () {
                var n = (0, o.Z)(
                  (0, a.Z)().mark(function n(e, t) {
                    var r, c, o;
                    return (0, a.Z)().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            if (
                              ![
                                "get_invalid",
                                "exchange_invalid",
                                "buy_invalid",
                              ].includes(e.buttonStatus)
                            ) {
                              n.next = 2;
                              break;
                            }
                            return n.abrupt("return");
                          case 2:
                            if (!x.FO) {
                              n.next = 15;
                              break;
                            }
                            if ("mob" === e.cardSource) {
                              n.next = 12;
                              break;
                            }
                            return (
                              (r = {
                                temp_name: "yykweishop",
                                source_type: "coupon",
                              }),
                              (n.next = 7),
                              m.Z.user.newWxaMsgTmpl(r)
                            );
                          case 7:
                            (c = n.sent),
                              (o = c.template_id).length > 0
                                ? f().requestSubscribeMessage({
                                    tmplIds: o,
                                    success: function () {
                                      Q(e, t);
                                    },
                                    fail: function () {
                                      Q(e, t);
                                    },
                                  })
                                : Q(e, t),
                              (n.next = 13);
                            break;
                          case 12:
                            Q(e, t);
                          case 13:
                            n.next = 16;
                            break;
                          case 15:
                            Q(e, t);
                          case 16:
                          case "end":
                            return n.stop();
                        }
                    }, n);
                  })
                );
                return function (e, t) {
                  return n.apply(this, arguments);
                };
              })(),
              J = function (n, e, t) {
                var r =
                    arguments.length > 3 && void 0 !== arguments[3]
                      ? arguments[3]
                      : "1",
                  c = (0, x.TH)(),
                  a = c.crmcode,
                  o = c.ucd;
                "mob" !== t
                  ? Y(e, r, n, t)
                  : f().openEmbeddedMiniProgram({
                      appId: "wx841ce6612d831a8a",
                      path: ""
                        .concat(
                          "pages/packageC/pages/coupon/coupon-detail/coupon-detail",
                          "?couponId="
                        )
                        .concat(e, "&crmcode=")
                        .concat(a, "&ucd=")
                        .concat(o),
                      extraData: { couponId: e, crmcode: a, ucd: o },
                      envVersion: "release",
                      allowFullScreen: !0,
                    });
              },
              Y = (function () {
                var n = (0, o.Z)(
                  (0, a.Z)().mark(function n(e, t, r, c) {
                    var o, i, u;
                    return (0, a.Z)().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            return (n.next = 2), V();
                          case 2:
                            (o = n.sent),
                              (i = o.channel_id),
                              (u = o.source),
                              f().navigateTo({
                                url: "/subpages/marketing/coupon-detail?card_id="
                                  .concat(e, "&type=")
                                  .concat(t, "&couponSn=")
                                  .concat(r, "&cardSource=")
                                  .concat(c, "&channel_id=")
                                  .concat(i, "&source=")
                                  .concat(u),
                              });
                          case 6:
                          case "end":
                            return n.stop();
                        }
                    }, n);
                  })
                );
                return function (e, t, r, c) {
                  return n.apply(this, arguments);
                };
              })(),
              X = function (n, e, t, r, c, a, o, i) {
                if ("gift" != o)
                  if ("online" != n.toLocaleLowerCase()) J(t, r, c);
                  else if (e) f().reLaunch({ url: "/pages/index" });
                  else {
                    var u =
                      1 == i
                        ? "/subpages/item/list?card_id=".concat(r)
                        : "/subpages/item/list?card_id=".concat(
                            r,
                            "&noRegionauth=true"
                          );
                    f().redirectTo({ url: u });
                  }
                else
                  f().navigateTo({
                    url: "/subpages/marketing/coupon-detail?couponSn="
                      .concat(t, "&card_id=")
                      .concat(r, "&cardSource=")
                      .concat(c, "&type=2&shop_code=")
                      .concat(a || ""),
                  });
              },
              Q = (function () {
                var n = (0, o.Z)(
                  (0, a.Z)().mark(function n(e, t) {
                    var r, c, i, u, s, l, d, h, g, b, k, y, S, w;
                    return (0, a.Z)().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            if (
                              ((c = e.cardId),
                              (i = e.cardSource),
                              (u = e.useScene),
                              (s = e.canUsedShops),
                              (l = e.type),
                              (d = e.coupon_scope_type),
                              (h = (0, x.TH)()),
                              (g = h.crmcode),
                              (b = h.ucd),
                              "mob" != i)
                            ) {
                              n.next = 5;
                              break;
                            }
                            return (
                              f().openEmbeddedMiniProgram({
                                appId: "wx841ce6612d831a8a",
                                path: ""
                                  .concat(
                                    "pages/packageC/pages/coupon/coupon-detail/coupon-detail",
                                    "?couponId="
                                  )
                                  .concat(c, "&crmcode=")
                                  .concat(g, "&ucd=")
                                  .concat(b),
                                extraData: { couponId: c, crmcode: g, ucd: b },
                                envVersion: "release",
                                allowFullScreen: !0,
                              }),
                              n.abrupt("return")
                            );
                          case 5:
                            return (
                              (n.next = 7),
                              m.Z.member.homeCouponGet({ card_id: c })
                            );
                          case 7:
                            if (((k = n.sent), (y = k.status))) {
                              n.next = 11;
                              break;
                            }
                            return n.abrupt("return");
                          case 11:
                            return (
                              (S = y.use_all_items),
                              0 != y.get_limit &&
                                y.user_get_num >= y.get_limit &&
                                L(function (n) {
                                  (n.couponList[t].buttonStatus =
                                    "get_invalid"),
                                    (n.couponList[t].buttonText = "已领取");
                                }),
                              m.Z.track.adTrack({
                                action_type: "CLAIM_OFFER",
                                coupon_id: c,
                              }),
                              (w =
                                null !== (r = y.coupon_scope_type) &&
                                void 0 !== r
                                  ? r
                                  : d),
                              (n.next = 17),
                              E({
                                title: "领取成功",
                                showClose: !0,
                                content: (0, Z.jsx)(v.G7, {
                                  className: "content-center",
                                  children: " 优惠券已经发放至您的券包",
                                }),
                                renderFooter: (0, Z.jsxs)(v.G7, {
                                  className: "modal-footer coupon-modal-footer",
                                  children: [
                                    (0, Z.jsx)(p.Z, {
                                      type: "normal",
                                      className: "coupon-modal-footer-btn",
                                      onClick: (0, o.Z)(
                                        (0, a.Z)().mark(function n() {
                                          return (0, a.Z)().wrap(function (n) {
                                            for (;;)
                                              switch ((n.prev = n.next)) {
                                                case 0:
                                                  return (n.next = 2), M();
                                                case 2:
                                                  J(y.code, c, "ecshopx", "2");
                                                case 3:
                                                case "end":
                                                  return n.stop();
                                              }
                                          }, n);
                                        })
                                      ),
                                      children: "查看优惠券",
                                    }),
                                    (0, Z.jsx)(p.Z, {
                                      type: "primary",
                                      className: "coupon-modal-footer-btn",
                                      onClick: (0, o.Z)(
                                        (0, a.Z)().mark(function n() {
                                          return (0, a.Z)().wrap(function (n) {
                                            for (;;)
                                              switch ((n.prev = n.next)) {
                                                case 0:
                                                  return (n.next = 2), M();
                                                case 2:
                                                  X(
                                                    u,
                                                    S,
                                                    y.code,
                                                    c,
                                                    i,
                                                    s,
                                                    l,
                                                    w
                                                  );
                                                case 3:
                                                case "end":
                                                  return n.stop();
                                              }
                                          }, n);
                                        })
                                      ),
                                      children: "去使用",
                                    }),
                                  ],
                                }),
                              })
                            );
                          case 17:
                            n.sent;
                          case 18:
                          case "end":
                            return n.stop();
                        }
                    }, n);
                  })
                );
                return function (e, t) {
                  return n.apply(this, arguments);
                };
              })(),
              $ = (function () {
                var n = (0, o.Z)(
                  (0, a.Z)().mark(function n() {
                    var e, t, r, c, o, i, u, s, l, p;
                    return (0, a.Z)().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            return (n.next = 2), V();
                          case 2:
                            return (
                              (r = n.sent),
                              (c = r.package_id),
                              (o = {
                                obtainType: F + 1,
                                page_no: N,
                                page_size: j,
                                package_id: c,
                                applicableChannel:
                                  (null ===
                                    (e = O.find(function (n) {
                                      return "active" === n.btnStatus;
                                    })) || void 0 === e
                                    ? void 0
                                    : e.channel) || "",
                              }),
                              "common" ==
                                (null ===
                                  (t = O.find(function (n) {
                                    return "active" === n.btnStatus;
                                  })) || void 0 === t
                                  ? void 0
                                  : t.channel) && (o.card_type = "gift"),
                              (n.next = 8),
                              m.Z.member.homeCouponList(o)
                            );
                          case 8:
                            (i = n.sent),
                              (u = i.list),
                              (s = (0, x.D9)(u, h.Z.coupon.COUPON)),
                              (l = T.concat(s)),
                              (p = new Map()),
                              l.forEach(function (n) {
                                n.cardId &&
                                  !p.has(n.cardId) &&
                                  p.set(n.cardId, n);
                              }),
                              (l = Array.from(p.values())),
                              L(function (n) {
                                (n.couponList = l),
                                  (n.page = N + 1),
                                  (n.loading = !1),
                                  u.length < j && (n.LoadSpListAll = !0);
                              });
                          case 16:
                          case "end":
                            return n.stop();
                        }
                    }, n);
                  })
                );
                return function () {
                  return n.apply(this, arguments);
                };
              })(),
              nn = (function () {
                var n = (0, o.Z)(
                  (0, a.Z)().mark(function n() {
                    var e, t, r, c, o, i, u;
                    return (0, a.Z)().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            if (null != R && R.regionauth_id) {
                              n.next = 2;
                              break;
                            }
                            return n.abrupt("return");
                          case 2:
                            return (n.next = 4), V();
                          case 4:
                            return (
                              (t = n.sent),
                              (r = t.package_id),
                              (c = {
                                obtainType: F + 1,
                                page: I,
                                pageSize: j,
                                package_id: r,
                                applicableChannel:
                                  (null ===
                                    (e = O.find(function (n) {
                                      return "active" === n.btnStatus;
                                    })) || void 0 === e
                                    ? void 0
                                    : e.channel) || "",
                              }),
                              (n.next = 9),
                              m.Z.member.getMobCardList(c)
                            );
                          case 9:
                            (o = n.sent),
                              (i = o.list),
                              (u = (0, x.D9)(i, h.Z.coupon.COUPON)),
                              L(function (n) {
                                if (1 == I) n.couponList = u;
                                else {
                                  var e = n.couponList.concat(u),
                                    t = new Map();
                                  e.forEach(function (n) {
                                    n.cardId &&
                                      !t.has(n.cardId) &&
                                      t.set(n.cardId, n);
                                  }),
                                    (n.couponList = Array.from(t.values()));
                                }
                                i.length < j && (n.LoadFvListAll = !0),
                                  (n.loading = !1),
                                  (n.pageFv = I + 1);
                              });
                          case 13:
                          case "end":
                            return n.stop();
                        }
                    }, n);
                  })
                );
                return function () {
                  return n.apply(this, arguments);
                };
              })(),
              en = (function () {
                var n = (0, o.Z)(
                  (0, a.Z)().mark(function n() {
                    var e,
                      t,
                      r,
                      c,
                      o = arguments;
                    return (0, a.Z)().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            if (
                              ((e = o.length > 0 && void 0 !== o[0] && o[0]),
                              null != R && R.regionauth_id)
                            ) {
                              n.next = 3;
                              break;
                            }
                            return n.abrupt("return");
                          case 3:
                            if (!A) {
                              n.next = 5;
                              break;
                            }
                            return n.abrupt("return");
                          case 5:
                            return (n.next = 7), V();
                          case 7:
                            if (((t = n.sent), (r = t.package_id), 0 != F)) {
                              n.next = 29;
                              break;
                            }
                            if (
                              ((c = O.find(function (n) {
                                return "active" === n.btnStatus;
                              })),
                              !((G && !e) || r))
                            ) {
                              n.next = 24;
                              break;
                            }
                            if (!C) {
                              n.next = 14;
                              break;
                            }
                            return n.abrupt("return");
                          case 14:
                            if (
                              (L(function (n) {
                                n.loading = !0;
                              }),
                              "offline" != (null == c ? void 0 : c.channel))
                            ) {
                              n.next = 20;
                              break;
                            }
                            return (n.next = 18), nn();
                          case 18:
                            n.next = 22;
                            break;
                          case 20:
                            return (n.next = 22), $();
                          case 22:
                            n.next = 27;
                            break;
                          case 24:
                            return (
                              L(function (n) {
                                n.loading = !0;
                              }),
                              (n.next = 27),
                              nn()
                            );
                          case 27:
                            n.next = 32;
                            break;
                          case 29:
                            return (
                              L(function (n) {
                                n.loading = !0;
                              }),
                              (n.next = 32),
                              nn()
                            );
                          case 32:
                          case "end":
                            return n.stop();
                        }
                    }, n);
                  })
                );
                return function () {
                  return n.apply(this, arguments);
                };
              })(),
              tn = function (n) {
                var e = Number(n);
                if (isNaN(e)) return "0";
                if (e % 1 == 0) return e.toLocaleString();
                var t = e.toFixed(2).split("."),
                  r = (0, i.Z)(t, 2),
                  c = r[0],
                  a = r[1],
                  o = a;
                2 === a.length && (o = "0" === a[1] ? a[0] || "" : a);
                var u = c;
                return (
                  o && (u += ".".concat(o)),
                  (u = u.replace(/^(\d+)/, function (n) {
                    return n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  })),
                  "" === o && "0" === c ? "0" : u
                );
              },
              rn = function (n, e) {
                return (0, Z.jsx)(Z.Fragment, {
                  children:
                    n.dayStockNum > 0 && n.stockNum > 0
                      ? (0, Z.jsxs)(v.G7, {
                          className: "coupon-item-children-wrap",
                          children: [
                            (0, Z.jsx)(b.vC, {
                              onChange: function (t) {
                                return H(n, e);
                              },
                              children: (0, Z.jsx)(v.G7, {
                                className: (0, x.AK)(
                                  "coupon-btn",
                                  "btn-".concat(n.buttonStatus)
                                ),
                                children: n.buttonText,
                              }),
                            }),
                            ("buy" == n.buttonStatus ||
                              "exchange" == n.buttonStatus) &&
                              (0, Z.jsxs)(v.G7, {
                                className: "coupon-item-price",
                                children: [
                                  n.point
                                    ? ""
                                        .concat(tn(n.point), "积分")
                                        .concat(n.price ? "+" : "")
                                    : "",
                                  n.price ? "￥".concat(tn(n.price)) : "",
                                ],
                              }),
                          ],
                        })
                      : (0, Z.jsx)(v.G7, {
                          className: "coupon-item-children-wrap",
                          children: (0, Z.jsx)(v.G7, {
                            className: (0, x.AK)("coupon-btn", "btn-disabled"),
                            children: n.stockNum <= 0 ? "已领完" : "今日已领完",
                          }),
                        }),
                });
              },
              cn = function (n, e) {
                return (0, Z.jsx)(Z.Fragment, {
                  children:
                    (null == n ? void 0 : n.remainingNum) > 0
                      ? (0, Z.jsxs)(v.G7, {
                          className: "coupon-item-children-wrap",
                          children: [
                            (0, Z.jsx)(b.vC, {
                              onChange: function (t) {
                                return H(n, e);
                              },
                              children: (0, Z.jsx)(v.G7, {
                                className: (0, x.AK)(
                                  "coupon-btn",
                                  "btn-".concat(n.buttonStatus)
                                ),
                                children: n.buttonText,
                              }),
                            }),
                            ("buy" == n.buttonStatus ||
                              "exchange" == n.buttonStatus) &&
                              (0, Z.jsxs)(v.G7, {
                                className: "coupon-item-price",
                                children: [
                                  n.point
                                    ? ""
                                        .concat(tn(n.point), "积分")
                                        .concat(n.price ? "+" : "")
                                    : "",
                                  n.price ? "￥".concat(tn(n.price)) : "",
                                ],
                              }),
                          ],
                        })
                      : (0, Z.jsx)(v.G7, {
                          className: "coupon-item-children-wrap",
                          children: (0, Z.jsx)(v.G7, {
                            className: (0, x.AK)("coupon-btn", "btn-disabled"),
                            children: "已领完",
                          }),
                        }),
                });
              };
            return (0, Z.jsxs)(b.nO, {
              className: "page-coupon-center",
              ref: K,
              showLive: !0,
              scrollToTopBtn: !0,
              onScrollToTop: function () {
                L(function (n) {
                  n.scrollTop = 0 == r.scrollTop ? -1 : 0;
                });
              },
              renderNavigation: (0, Z.jsx)(v.G7, {
                className: "task-list-title",
                children: "领券中心",
              }),
              children: [
                (0, Z.jsx)(v.G7, {
                  className: "sticky-wrap",
                  children: (0, Z.jsx)(k.Z, {}),
                }),
                (0, Z.jsxs)(v.G7, {
                  className: "sticky-wrap",
                  children: [
                    (0, Z.jsx)(k.Z, {}),
                    (0, Z.jsx)(w.Z, {
                      loading: r.loading,
                      tabs: B,
                      value: F,
                      onChange: function (n) {
                        L(function (e) {
                          (e.currentTab = n),
                            (e.couponList = []),
                            (e.mobPage = 1),
                            (e.page = 1),
                            (e.pageFv = 1),
                            (e.LoadSpListAll = !1),
                            (e.LoadFvListAll = !1);
                        }),
                          "point" == (null == z ? void 0 : z.type) &&
                            1 == n &&
                            x.N_.trackPageViewNum(z),
                          f().nextTick(function () {
                            var n;
                            null === (n = K.current) ||
                              void 0 === n ||
                              n.scrollToTop();
                          });
                      },
                    }),
                    (0, Z.jsx)(v.G7, {
                      className: "coupon-item-btns",
                      children:
                        null == O
                          ? void 0
                          : O.map(function (n, e) {
                              return (0, Z.jsx)(
                                v.G7,
                                {
                                  className: (0, x.AK)(
                                    "btn",
                                    (0, c.Z)({}, "btn-".concat(n.btnStatus), !0)
                                  ),
                                  onClick: function () {
                                    return (function (n) {
                                      L(function (e) {
                                        e.btns.forEach(function (e) {
                                          e.btnStatus =
                                            e.title == n.title
                                              ? "active"
                                              : "primary";
                                        }),
                                          (e.couponList = []),
                                          (e.page = 1),
                                          (e.pageFv = 1),
                                          (e.LoadSpListAll = !1),
                                          (e.LoadFvListAll = !1),
                                          f().nextTick(function () {
                                            var n;
                                            null === (n = K.current) ||
                                              void 0 === n ||
                                              n.scrollToTop(),
                                              U();
                                          });
                                      });
                                    })(n);
                                  },
                                  children: n.title,
                                },
                                e
                              );
                            }),
                    }),
                  ],
                }),
                T.length > 0
                  ? (0, Z.jsx)(v.pf, {
                      className: "list-scroll",
                      scrollY: !0,
                      scrollWithAnimation: !0,
                      lowerThreshold: 200,
                      onScrollToLower: function (n) {
                        n.detail.direction, en();
                      },
                      scrollTop: r.scrollTop,
                      onScroll: function (n) {
                        K.current.scroll(n);
                      },
                      children:
                        null == T
                          ? void 0
                          : T.map(function (n, e) {
                              return (0, Z.jsx)(
                                v.G7,
                                {
                                  className: "coupon-item-wrap",
                                  children: (0, Z.jsx)(b.Xv, {
                                    type: 1,
                                    info: n,
                                    itemClick: function () {
                                      return (function (n, e) {
                                        J(n.couponSn, n.cardId, n.cardSource);
                                      })(n);
                                    },
                                    children:
                                      "mob" == n.cardSource
                                        ? rn(n, e)
                                        : cn(n, e),
                                  }),
                                },
                                "coupon-item__".concat(e)
                              );
                            }),
                    })
                  : A
                  ? (0, Z.jsx)(b.m6, { children: "正在加载..." })
                  : (0, Z.jsxs)(v.G7, {
                      children: [
                        (0, Z.jsx)(v.G7, {
                          className: "empty-coupon-img",
                          children: (0, Z.jsx)(b.Ko, {
                            width: 82,
                            height: 82,
                            src: "fv_coupon_empty.png",
                          }),
                        }),
                        (0, Z.jsx)(v.G7, {
                          className: "empty-coupon-text",
                          children: "暂无可领优惠券",
                        }),
                        (0, Z.jsx)(v.G7, {
                          className: "empty-wrap",
                          children: "敬请期待",
                        }),
                      ],
                    }),
              ],
            });
          }
          L.options = { addGlobalClass: !0 };
          var T = L;
          Page(
            (0, r.createPageConfig)(
              T,
              "subpages/marketing/coupon-center",
              { root: { cn: [] } },
              {
                navigationBarTitleText: "领券中心",
                navigationStyle: "custom",
              } || {}
            )
          );
        },
      },
      function (n) {
        n.O(0, [2500, 2107, 1216, 8592], function () {
          return (function (e) {
            return n((n.s = e));
          })(31924);
        }),
          n.O();
      },
    ]);
})();
