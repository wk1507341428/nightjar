!(function () {
  "use strict";
  require("./sub-vendors.js"),
    require("./sub-common/bb473f59700a7d29e57fc2cfee60c24f.js"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [6146],
      {
        16: function (e, n, s) {
          var a = s(32180),
            t = s(74165),
            o = s(1413),
            c = s(15861),
            r = s(29439),
            i = s(67294),
            u = s(90057),
            l = s(92954),
            d = s.n(l),
            p = s(71515),
            _ = s(45557),
            m = s(78061),
            h = s(9453),
            x = s(27741),
            f = s(1696),
            v = s(80459),
            j = s(96856),
            g = s(21066),
            b = s(31707),
            N = s(80129),
            S = s.n(N),
            G = s(85893),
            y = {
              sharePanelOpen: !1,
              posterModalOpen: !1,
              posterIsReady: !1,
              info: {},
              pageLoading: !0,
              cardStatus: "normal",
            },
            Z = (0, l.getCurrentInstance)(),
            w = function (e) {
              var n,
                s,
                a,
                N = (0, i.useState)(2),
                w = (0, r.Z)(N, 2),
                k = w[0],
                C = w[1],
                M = (0, i.useState)(""),
                T = (0, r.Z)(M, 2),
                D = T[0],
                O = T[1],
                Y = (0, i.useState)(!1),
                P = (0, r.Z)(Y, 2),
                R = P[0],
                L = P[1],
                I = (0, i.useRef)(),
                A = (0, g.dd)(),
                F = A.showModal,
                q = A.closeModal,
                H = (0, u.x)(y),
                K = (0, r.Z)(H, 2),
                U = K[0],
                E = K[1],
                J = U.info,
                B = U.sharePanelOpen,
                Q = U.posterModalOpen,
                z = U.posterIsReady,
                V = U.cardStatus,
                W = (0, b.v9)(function (e) {
                  return e.regionauth;
                }).regionauthInfo,
                X = void 0 === W ? {} : W,
                $ = (0, b.v9)(function (e) {
                  return e.member;
                }).token,
                ee = ((null == Z ? void 0 : Z.router) || {}).params,
                ne = (0, i.useRef)(J);
              ne.current = J;
              var se = function () {
                  var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : ne.current;
                  return "1" === String(null == e ? void 0 : e.is_shareable);
                },
                ae = function () {
                  var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : ne.current;
                  se(e)
                    ? d().showShareMenu({
                        menus: ["shareAppMessage", "shareTimeline"],
                      })
                    : (d().hideShareMenu({
                        menus: ["shareAppMessage", "shareTimeline"],
                      }),
                      d().hideShareMenu());
                };
              (0, i.useEffect)(
                function () {
                  ae(J);
                },
                [null == J ? void 0 : J.is_shareable]
              ),
                (0, l.useDidShow)(function () {
                  ae(),
                    d().nextTick(function () {
                      return ae();
                    }),
                    setTimeout(function () {
                      return ae();
                    }, 300);
                });
              var te = (function () {
                var e = (0, c.Z)(
                  (0, t.Z)().mark(function e() {
                    var n, s, a, c, r, i, u, l, d, p, _, m, h, v;
                    return (0, t.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), j.N_.getRouteParams();
                          case 2:
                            if (
                              ((n = e.sent),
                              (s = n.type),
                              (a = n.card_id),
                              (c = n.cardSource),
                              (r = n.couponSn),
                              (i = n.c),
                              (u = n.t),
                              C(s),
                              E(function (e) {
                                e.pageLoading = !0;
                              }),
                              u && C(u),
                              1 != s && 1 != u)
                            ) {
                              e.next = 21;
                              break;
                            }
                            return (
                              (l = a || i),
                              (e.next = 16),
                              f.Z.member.getCouponDetail(l)
                            );
                          case 16:
                            return (
                              (d = e.sent),
                              (p = (0, j.D9)(d, x.Z.coupon.COUPON_STATUS)),
                              (_ = p.couponStatus),
                              E(function (e) {
                                (e.info = (0, o.Z)(
                                  (0, o.Z)({}, d),
                                  {},
                                  { type: d.card_type, couponStatus: _ }
                                )),
                                  (e.pageLoading = !1);
                              }),
                              ae(d),
                              e.abrupt("return")
                            );
                          case 21:
                            if ("ecshopx" != c) {
                              e.next = 29;
                              break;
                            }
                            return (
                              (e.next = 24),
                              f.Z.member.getCardDetail({ card_id: a, code: r })
                            );
                          case 24:
                            return (
                              (m = e.sent),
                              (h = (0, j.D9)(m, x.Z.coupon.COUPON_DETAIL)),
                              E(function (e) {
                                (e.info = h),
                                  (e.pageLoading = !1),
                                  10 == h.status || 2 == h.status
                                    ? (e.cardStatus = "used")
                                    : 5 == h.status
                                    ? (e.cardStatus = "invalid")
                                    : (e.cardStatus = "normal");
                              }),
                              "online" !== h.use_scenes && re(h.qr_code),
                              e.abrupt("return")
                            );
                          case 29:
                            if (!r) {
                              e.next = 35;
                              break;
                            }
                            return (
                              (e.next = 32),
                              f.Z.member.getMobCouponDetail({ couponSn: r })
                            );
                          case 32:
                            (v = e.sent),
                              E(function (e) {
                                (e.info = v),
                                  (e.pageLoading = !1),
                                  v.isUsed
                                    ? (e.cardStatus = "used")
                                    : null != v && v.isExpired
                                    ? (e.cardStatus = "invalid")
                                    : (e.cardStatus = "normal");
                              }),
                              "online" !== v.use_scenes && re(v.qr_code);
                          case 35:
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
              (0, i.useEffect)(
                function () {
                  oe();
                },
                [$, X]
              );
              var oe = (function () {
                var e = (0, c.Z)(
                  (0, t.Z)().mark(function e() {
                    var n, s, a;
                    return (0, t.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), j.N_.getRouteParams();
                          case 2:
                            (n = e.sent),
                              (s = n.type),
                              (a = n.t),
                              null != X &&
                                X.regionauth_code &&
                                (1 == s || 1 == a || $) &&
                                te();
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
              })();
              (0, l.useShareAppMessage)(
                (0, c.Z)(
                  (0, t.Z)().mark(function e() {
                    return (0, t.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (se()) {
                              e.next = 2;
                              break;
                            }
                            return e.abrupt("return", {
                              title: "弗洛伦萨小镇",
                              path: "/pages/index",
                            });
                          case 2:
                            return e.abrupt("return", ce());
                          case 3:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                )
              ),
                (0, l.useShareTimeline)(
                  (0, c.Z)(
                    (0, t.Z)().mark(function e() {
                      return (0, t.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (se()) {
                                e.next = 2;
                                break;
                              }
                              return e.abrupt("return", {
                                title: "弗洛伦萨小镇",
                                query: "",
                              });
                            case 2:
                              return e.abrupt("return", ce());
                            case 3:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  )
                );
              var ce = (function () {
                  var e = (0, c.Z)(
                    (0, t.Z)().mark(function e() {
                      var n, s, a, o, c, r, i, u, l;
                      return (0, t.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (e.next = 2), j.N_.getRouteParams();
                            case 2:
                              return (
                                (n = e.sent),
                                (s = n.type),
                                (a = n.card_id),
                                (o = n.cardSource),
                                (c = n.couponSn),
                                (r = n.channel_id),
                                (i = n.source),
                                (u = {
                                  card_id: a,
                                  type: s,
                                  couponSn: c,
                                  cardSource: o,
                                  channel_id: r,
                                  source: i,
                                  crmcode:
                                    null == X ? void 0 : X.regionauth_code,
                                  region_id:
                                    null == X ? void 0 : X.regionauth_id,
                                }),
                                (l =
                                  "/subpages/marketing/coupon-detail?".concat(
                                    S().stringify(u)
                                  )),
                                e.abrupt("return", {
                                  title: J.title,
                                  imageUrl: J.cover_pic,
                                  path: l,
                                })
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
                re = (function () {
                  var e = (0, c.Z)(
                    (0, t.Z)().mark(function e(n) {
                      var s, a;
                      return (0, t.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.next = 2),
                                f.Z.member.getCouponQrcode({ qr_code: n })
                              );
                            case 2:
                              (s = e.sent), (a = s.qr_code_img), O(a);
                            case 5:
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
                ie = (function () {
                  var e = (0, c.Z)(
                    (0, t.Z)().mark(function e() {
                      var n, s, a;
                      return (0, t.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (
                                1 ===
                                (null == J ||
                                null === (n = J.couponStatus) ||
                                void 0 === n
                                  ? void 0
                                  : n.type)
                              ) {
                                e.next = 2;
                                break;
                              }
                              return e.abrupt("return");
                            case 2:
                              return (
                                L(!0),
                                (e.next = 5),
                                f.Z.member.homeCouponGet({ card_id: J.card_id })
                              );
                            case 5:
                              if (((s = e.sent), (a = s.status))) {
                                e.next = 10;
                                break;
                              }
                              return L(!1), e.abrupt("return");
                            case 10:
                              return (
                                L(!1),
                                f.Z.track.adTrack({
                                  action_type: "CLAIM_OFFER",
                                  coupon_id: J.card_id,
                                }),
                                (e.next = 14),
                                F({
                                  title: "领取成功",
                                  showClose: !0,
                                  content: (0, G.jsx)(p.G7, {
                                    className: "content-center",
                                    children: "优惠券已经发放至您的券包",
                                  }),
                                  renderFooter: (0, G.jsx)(p.G7, {
                                    className:
                                      "modal-footer coupon-modal-footer",
                                    children: (0, G.jsx)(_.Z, {
                                      type: "primary",
                                      className: "coupon-modal-footer-btn",
                                      onClick: (0, c.Z)(
                                        (0, t.Z)().mark(function e() {
                                          return (0, t.Z)().wrap(function (e) {
                                            for (;;)
                                              switch ((e.prev = e.next)) {
                                                case 0:
                                                  return (e.next = 2), q();
                                                case 2:
                                                  ue(a.code);
                                                case 3:
                                                case "end":
                                                  return e.stop();
                                              }
                                          }, e);
                                        })
                                      ),
                                      children: "去使用",
                                    }),
                                  }),
                                })
                              );
                            case 14:
                              e.sent;
                            case 15:
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
                ue = (function () {
                  var e = (0, c.Z)(
                    (0, t.Z)().mark(function e(n) {
                      var s, a, o, c, r, i, u, l, p;
                      return (0, t.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (e.next = 2), j.N_.getRouteParams();
                            case 2:
                              if (
                                ((s = e.sent),
                                (a = s.type),
                                (o = s.cardSource),
                                (c = s.t),
                                (r = s.card_id),
                                (i = s.channel_id),
                                (u = s.source),
                                (l = s.shop_code),
                                "gift" != J.type)
                              ) {
                                e.next = 13;
                                break;
                              }
                              return (
                                d().navigateTo({
                                  url: "/subpages/marketing/coupon-detail?couponSn="
                                    .concat(n, "&card_id=")
                                    .concat(r, "&cardSource=")
                                    .concat(o, "&type=2&shop_code=")
                                    .concat(l || ""),
                                }),
                                e.abrupt("return")
                              );
                            case 13:
                              if (1 != a && 1 != c && "ecshopx" != o) {
                                e.next = 19;
                                break;
                              }
                              if (
                                "online" != J.use_scenes &&
                                "common" != J.use_scenes
                              ) {
                                e.next = 17;
                                break;
                              }
                              return (
                                J.use_all_items
                                  ? d().switchTab({ url: "/pages/index" })
                                  : ((p =
                                      1 == J.coupon_scope_type
                                        ? ""
                                        : "&noRegionauth=true"),
                                    d().redirectTo({
                                      url: "/subpages/item/list?card_id="
                                        .concat(
                                          J.card_id || J.id,
                                          "&channel_id="
                                        )
                                        .concat(i, "&source=")
                                        .concat(u)
                                        .concat(p),
                                    })),
                                e.abrupt("return")
                              );
                            case 17:
                              e.next = 20;
                              break;
                            case 19:
                              l
                                ? d().navigateTo({
                                    url: "/subpages/item/list?shop_code=".concat(
                                      l || ""
                                    ),
                                  })
                                : d().switchTab({ url: "/pages/index" });
                            case 20:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  );
                  return function (n) {
                    return e.apply(this, arguments);
                  };
                })();
              return (0, G.jsxs)(m.nO, {
                showLive: !0,
                children: [
                  U.pageLoading && (0, G.jsx)(m.m6, {}),
                  !U.pageLoading &&
                    (0, G.jsxs)(p.G7, {
                      className: "sp-coupon-detail",
                      children: [
                        (0, G.jsxs)(p.G7, {
                          className: "sp-coupon-detail__header",
                          children: [
                            (0, G.jsx)(m.Ko, {
                              className: "sp-coupon-detai__header-image",
                              src: J.cover_pic,
                              mode: "aspectFill",
                              width: 160,
                              height: 160,
                              circle: 8,
                            }),
                            (0, G.jsxs)(p.G7, {
                              className: "sp-coupon-detail__header-info",
                              children: [
                                (0, G.jsx)(p.G7, {
                                  className: "sp-coupon-detail__header-title",
                                  children: J.title,
                                }),
                                (0, G.jsxs)(p.G7, {
                                  className: "sp-coupon-detail__header-tags",
                                  children: [
                                    J.coupon_scope_label &&
                                      (0, G.jsx)(p.xv, {
                                        className:
                                          "sp-coupon-detail__header-tag red",
                                        children: J.coupon_scope_label,
                                      }),
                                    J.use_scenes &&
                                      (0, G.jsx)(p.G7, {
                                        className:
                                          "sp-coupon-detail__header-tag",
                                        children:
                                          "gift" == J.type
                                            ? "通用券"
                                            : "online" === J.use_scenes
                                            ? "线上商城专享"
                                            : "common" === J.use_scenes
                                            ? "通用券"
                                            : "线下专享",
                                      }),
                                  ],
                                }),
                                2 == k &&
                                  (0, G.jsx)(p.G7, {
                                    className: "sp-coupon-detail__header-time",
                                    children: J.valid_date,
                                  }),
                              ],
                            }),
                          ],
                        }),
                        ["shopSalerOrder", "onSiteSale"].includes(
                          J.use_scenes
                        ) &&
                          (0, G.jsxs)(p.G7, {
                            className: "sp-coupon-detail__sale-tips",
                            children: [
                              (0, G.jsx)(m.Ko, {
                                src: "fv_sale-card-tips.png",
                                width: 40,
                                height: 40,
                              }),
                              "在线开单付款时可直接使用此券",
                            ],
                          }),
                        !["online"].includes(J.use_scenes) &&
                          D &&
                          2 == k &&
                          "gift" != J.type &&
                          (0, G.jsxs)(p.G7, {
                            className: "sp-coupon-detail__code",
                            children: [
                              "normal" == V &&
                                (0, G.jsxs)(G.Fragment, {
                                  children: [
                                    (0, G.jsx)(p.G7, {
                                      className: "sp-coupon-detail__code-text1",
                                      children: "线下使用时向商户出示此码",
                                    }),
                                    (0, G.jsx)(
                                      m.Ko,
                                      {
                                        className:
                                          "sp-coupon-detai__code-image",
                                        src: D,
                                        width: 338,
                                        height: 338,
                                      },
                                      D
                                    ),
                                  ],
                                }),
                              (0, G.jsxs)(p.G7, {
                                className: (0, j.AK)(
                                  "sp-coupon-detail__code-text2",
                                  {
                                    "sp-coupon-detail__code-text2-disabled":
                                      "normal" != V,
                                  }
                                ),
                                children: [
                                  "券号 ",
                                  (0, G.jsx)(p.xv, {
                                    className: (0, j.AK)({
                                      "sp-coupon-detail__code-text2-disabled-text":
                                        "normal" != V,
                                    }),
                                    children: J.couponSn,
                                  }),
                                ],
                              }),
                              "normal" == V &&
                                (0, G.jsxs)(G.Fragment, {
                                  children: [
                                    (0, G.jsx)(p.G7, {
                                      className: "sp-coupon-detail__code-text3",
                                      children:
                                        "温馨提示：如商户无法识别二维码",
                                    }),
                                    (0, G.jsxs)(p.G7, {
                                      className: "sp-coupon-detail__code-text4",
                                      onClick: function () {
                                        return re(J.qr_code);
                                      },
                                      children: [
                                        (0, G.jsx)(p.xv, {
                                          className:
                                            "iconfont icon-a-iconautorenew",
                                        }),
                                        (0, G.jsx)(p.xv, {
                                          children: "您可以尝试刷新重试",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                            ],
                          }),
                        (0, G.jsx)(p.G7, {
                          className: "sp-coupon-detail__card",
                          children: (0, G.jsxs)(p.G7, {
                            className: "sp-coupon-detail__info-section",
                            children: [
                              1 == k &&
                                (0, G.jsxs)(G.Fragment, {
                                  children: [
                                    (0, G.jsxs)(p.G7, {
                                      className:
                                        "sp-coupon-detail__info-item view-flex view-flex-justify view-flex-middle",
                                      children: [
                                        (0, G.jsxs)(p.G7, {
                                          children: [
                                            (0, G.jsx)(p.G7, {
                                              className:
                                                "sp-coupon-detail__info-label",
                                              children: "领取时间",
                                            }),
                                            (0, G.jsxs)(p.xv, {
                                              className:
                                                "sp-coupon-detail__info-value",
                                              children: [
                                                (0, j.mr)(
                                                  1e3 * J.send_begin_time,
                                                  "YYYY-MM-DD HH:mm"
                                                ),
                                                (0, G.jsx)(p.xv, {
                                                  className: "m-l-2 m-r-2",
                                                  children: " - ",
                                                }),
                                                (0, j.mr)(
                                                  1e3 * J.send_end_time,
                                                  "YYYY-MM-DD HH:mm"
                                                ),
                                              ],
                                            }),
                                          ],
                                        }),
                                        "1" == J.is_shareable &&
                                          (0, G.jsxs)(p.G7, {
                                            className:
                                              "sp-coupon-detail__share",
                                            onClick: function () {
                                              E(function (e) {
                                                e.sharePanelOpen = !0;
                                              }),
                                                (0, v.setShareButtonClickGio)({
                                                  couponId_var: J.card_id,
                                                  couponName_var: J.title,
                                                });
                                            },
                                            children: [
                                              (0, G.jsx)(p.G7, {
                                                className:
                                                  "iconfont icon-a-iconreply",
                                              }),
                                              (0, G.jsx)(p.G7, {
                                                className:
                                                  "sp-coupon-detail__share-text",
                                                children: "分享",
                                              }),
                                            ],
                                          }),
                                      ],
                                    }),
                                    (0, G.jsxs)(p.G7, {
                                      className: "sp-coupon-detail__info-item",
                                      children: [
                                        (0, G.jsx)(p.xv, {
                                          className:
                                            "sp-coupon-detail__info-label",
                                          children: "使用有效期",
                                        }),
                                        (0, G.jsx)(p.xv, {
                                          className:
                                            "sp-coupon-detail__info-value",
                                          children: J.valid_date,
                                        }),
                                      ],
                                    }),
                                    (0, G.jsxs)(p.G7, {
                                      className: "sp-coupon-detail__info-item",
                                      children: [
                                        (0, G.jsx)(p.xv, {
                                          className:
                                            "sp-coupon-detail__info-label",
                                          children: "优惠券介绍",
                                        }),
                                        (0, G.jsx)(p.xv, {
                                          className:
                                            "sp-coupon-detail__info-value",
                                          children: J.intro,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              J.useCondition &&
                                "mob" == J.card_source &&
                                (0, G.jsxs)(p.G7, {
                                  className: "sp-coupon-detail__info-item",
                                  children: [
                                    (0, G.jsx)(p.xv, {
                                      className: "sp-coupon-detail__info-label",
                                      children: "使用说明",
                                    }),
                                    (0, G.jsx)(m.KF, {
                                      content: J.useCondition,
                                    }),
                                  ],
                                }),
                              J.description &&
                                "mob" != J.card_source &&
                                (0, G.jsxs)(p.G7, {
                                  className: "sp-coupon-detail__info-item",
                                  children: [
                                    (0, G.jsx)(p.xv, {
                                      className: "sp-coupon-detail__info-label",
                                      children: "使用说明",
                                    }),
                                    (0, G.jsx)(m.KF, {
                                      content: J.description,
                                    }),
                                  ],
                                }),
                              "mob" == J.card_source
                                ? (0, G.jsxs)(p.G7, {
                                    className: "sp-coupon-detail__info-item",
                                    children: [
                                      (0, G.jsx)(p.xv, {
                                        className:
                                          "sp-coupon-detail__info-label",
                                        children: "适用范围",
                                      }),
                                      (0, G.jsxs)(p.G7, {
                                        className:
                                          "sp-coupon-detail__info-value f500",
                                        children: [
                                          "appoint" == J.joinShopType &&
                                            J.useShopNameLimit &&
                                            (0, G.jsxs)(G.Fragment, {
                                              children: [
                                                (0, G.jsx)(p.xv, {
                                                  children: "仅限指定店铺可用",
                                                }),
                                                (0, G.jsx)(p.G7, {
                                                  className:
                                                    "sp-coupon-detail__stores mt-18",
                                                  children:
                                                    null ===
                                                      (n =
                                                        J.useShopNameLimit.split(
                                                          ","
                                                        )) || void 0 === n
                                                      ? void 0
                                                      : n.map(function (e, n) {
                                                          return (0,
                                                          G.jsx)(p.G7, { className: "sp-coupon-detail__store-item", children: e }, n);
                                                        }),
                                                }),
                                              ],
                                            }),
                                          "oneself" == J.joinShopType &&
                                            J.shopInfo &&
                                            (0, G.jsx)(p.G7, {
                                              className:
                                                "sp-coupon-detail__stores",
                                              children: (0, G.jsx)(p.G7, {
                                                className:
                                                  "sp-coupon-detail__store-item",
                                                children:
                                                  null === (s = J.shopInfo) ||
                                                  void 0 === s
                                                    ? void 0
                                                    : s.name,
                                              }),
                                            }),
                                          "all" == J.joinShopType &&
                                            (0, G.jsx)(p.G7, {
                                              className:
                                                "sp-coupon-detail__info-value f500",
                                              children: (0, G.jsxs)(p.xv, {
                                                children: [
                                                  null == J
                                                    ? void 0
                                                    : J.useStoreNameLimit,
                                                  "所有店铺可用",
                                                ],
                                              }),
                                            }),
                                        ],
                                      }),
                                    ],
                                  })
                                : J.use_bound &&
                                  !(
                                    "gift" == J.type &&
                                    ("0" == J.use_bound || !J.use_bound)
                                  ) &&
                                  (0, G.jsxs)(p.G7, {
                                    className: "sp-coupon-detail__info-item",
                                    children: [
                                      (0, G.jsx)(p.xv, {
                                        className:
                                          "sp-coupon-detail__info-label",
                                        children: "适用范围",
                                      }),
                                      6 == J.use_bound &&
                                        (0, G.jsxs)(p.G7, {
                                          className:
                                            "sp-coupon-detail__info-value f500",
                                          children: [
                                            (0, G.jsx)(p.xv, {
                                              children: "仅限指定店铺可用",
                                            }),
                                            (0, G.jsx)(p.G7, {
                                              className:
                                                "sp-coupon-detail__stores mt-18",
                                              children:
                                                null ===
                                                  (a =
                                                    J.useShopNameLimit.split(
                                                      ","
                                                    )) || void 0 === a
                                                  ? void 0
                                                  : a.map(function (e, n) {
                                                      return (0,
                                                      G.jsx)(p.G7, { className: "sp-coupon-detail__store-item", children: e }, n);
                                                    }),
                                            }),
                                          ],
                                        }),
                                      (1 == J.use_bound ||
                                        2 == J.use_bound ||
                                        7 == J.use_bound) &&
                                        (0, G.jsxs)(p.G7, {
                                          className:
                                            "sp-coupon-detail__info-value available-product f500",
                                          children: [
                                            (0, G.jsx)(p.xv, {
                                              children: "仅限指定商品可用",
                                            }),
                                            (0, G.jsxs)(p.G7, {
                                              className:
                                                "sp-coupon-detail__available-product",
                                              onClick: function () {
                                                var e = ee || {},
                                                  n = e.channel_id,
                                                  s = e.source;
                                                if (J.use_all_items)
                                                  d().switchTab({
                                                    url: "/pages/index",
                                                  });
                                                else {
                                                  var a =
                                                    1 == J.coupon_scope_type
                                                      ? ""
                                                      : "&noRegionauth=true";
                                                  d().navigateTo({
                                                    url: "/subpages/item/list?card_id="
                                                      .concat(
                                                        J.card_id || J.id,
                                                        "&channel_id="
                                                      )
                                                      .concat(n, "&source=")
                                                      .concat(s)
                                                      .concat(a),
                                                  });
                                                }
                                              },
                                              children: [
                                                (0, G.jsx)(p.G7, {
                                                  children: "查看可用商品",
                                                }),
                                                (0, G.jsx)(p.G7, {
                                                  className:
                                                    "iconfont icon-arrowRight",
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ("0" == J.use_bound || !J.use_bound) &&
                                        (0, G.jsx)(p.G7, {
                                          className:
                                            "sp-coupon-detail__info-value f500",
                                          children: (0, G.jsx)(p.xv, {
                                            children: "详见使用说明",
                                          }),
                                        }),
                                    ],
                                  }),
                            ],
                          }),
                        }),
                        1 == k
                          ? (0, G.jsx)(p.G7, {
                              className: "sp-coupon-detail__footer",
                              children: (0, G.jsx)(m.vC, {
                                onChange: ie,
                                children: (0, G.jsx)(_.Z, {
                                  className:
                                    "sp-coupon-detail__receive-btn ".concat(
                                      1 !== J.couponStatus.type
                                        ? "disabled"
                                        : ""
                                    ),
                                  type: "primary",
                                  loading: R,
                                  children: J.couponStatus.text,
                                }),
                              }),
                            })
                          : "normal" !== V
                          ? (0, G.jsx)(p.G7, {
                              className: "sp-coupon-detail__footer",
                              children: (0, G.jsx)(_.Z, {
                                className: "sp-coupon-detail__receive-btn",
                                type: "primary",
                                disabled: !0,
                                children:
                                  "used" == V
                                    ? "已于".concat(
                                        (0, j.mr)(
                                          1e3 * J.useDate,
                                          "YYYY.MM.DD HH:mm:ss"
                                        ),
                                        "使用"
                                      )
                                    : "已于".concat(
                                        (0, j.mr)(
                                          1e3 * J.endDate,
                                          "YYYY.MM.DD HH:mm:ss"
                                        ),
                                        "过期"
                                      ),
                              }),
                            })
                          : ["online", "common"].includes(J.use_scenes) &&
                            "gift" != J.type &&
                            (0, G.jsx)(p.G7, {
                              className: "sp-coupon-detail__footer",
                              children: (0, G.jsx)(m.vC, {
                                onChange: ue,
                                children: (0, G.jsx)(_.Z, {
                                  className: "sp-coupon-detail__receive-btn",
                                  type: "primary",
                                  children: "立即使用",
                                }),
                              }),
                            }),
                        (0, G.jsx)(h.Z, {
                          title: "分享至",
                          open: B,
                          posterIsReady: z,
                          onSavePoster: function () {
                            I.current.saveToAlbum();
                          },
                          onClose: function () {
                            E(function (e) {
                              (e.sharePanelOpen = !1), (e.posterModalOpen = !1);
                            });
                          },
                          onCreatePoster: function () {
                            E(function (e) {
                              e.posterModalOpen = !0;
                            });
                          },
                          onShareEdit: function () {
                            var e = J.card_id,
                              n = J.company_id;
                            d().navigateTo({
                              url: "/subpage/pages/editShare/index?id="
                                .concat(e, "&company_id=")
                                .concat(n),
                            });
                          },
                        }),
                        Q &&
                          (0, G.jsx)(m.UU, {
                            ref: I,
                            info: J,
                            type: "couponDetail",
                            onReadyPosterChange: function (e) {
                              E(function (n) {
                                n.posterIsReady = e;
                              });
                            },
                            onClose: function () {
                              E(function (e) {
                                e.posterModalOpen = !1;
                              });
                            },
                          }),
                      ],
                    }),
                ],
              });
            };
          (w.enableShareTimeline = !0),
            (w.enableShareAppMessage = !0),
            Page(
              (0, a.createPageConfig)(
                w,
                "subpages/marketing/coupon-detail",
                { root: { cn: [] } },
                {} || {}
              )
            );
        },
      },
      function (e) {
        e.O(0, [4160, 3145, 2107, 1216, 8592], function () {
          return (function (n) {
            return e((e.s = n));
          })(16);
        }),
          e.O();
      },
    ]);
})();
