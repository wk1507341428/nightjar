!(function () {
  "use strict";
  require("./sub-vendors.js"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [1008],
      {
        68962: function (e, t, n) {
          var a = n(32180),
            r = n(93433),
            s = n(74165),
            i = n(15861),
            o = n(29439),
            c = n(67294),
            l = n(92954),
            u = n.n(l),
            d = n(90057),
            m = n(31707),
            p = n(71515),
            g = n(84902),
            f = n(78061),
            h = n(96856),
            _ = n(21066),
            x = n(27741),
            v = n(51584),
            j = n.n(v),
            b = n(1696),
            N = n(80129),
            w = n.n(N),
            G = n(85893),
            k = {
              teamInfo: null,
              goodsInfo: null,
              memberList: [],
              routeParams: {},
              isQualification: !1,
              loading: !0,
            },
            Z = function () {
              var e,
                t = (0, d.x)(k),
                n = (0, o.Z)(t, 2),
                a = n[0],
                v = n[1],
                N = a.teamInfo,
                Z = a.goodsInfo,
                y = a.memberList,
                S = a.routeParams,
                I = a.isQualification,
                P = a.loading,
                C = (0, m.v9)(function (e) {
                  return e.regionauth;
                }).regionauthInfo,
                T = void 0 === C ? {} : C,
                D = (0, m.v9)(function (e) {
                  return e.user;
                }).userInfo,
                F = void 0 === D ? {} : D,
                M = (0, m.v9)(function (e) {
                  return e.member;
                }).token,
                O = (0, c.useRef)(!0),
                A = (0, _.dd)(),
                B = A.showModal,
                E = A.closeModal,
                K = function () {
                  return h.N_.getRouteSyncParams() || {};
                };
              (0, c.useEffect)(function () {
                var e = K();
                v(function (t) {
                  t.routeParams = e;
                });
              }, []),
                (0, c.useEffect)(
                  function () {
                    if (S && 0 !== Object.keys(S).length) {
                      var e = S.crmcode;
                      ((e &&
                        (null == T ? void 0 : T.regionauth_code) == e &&
                        null != T &&
                        T.regionauth_id) ||
                        (!e && null != T && T.regionauth_id)) &&
                        O.current &&
                        ((O.current = !1), L());
                    }
                  },
                  [T, S]
                ),
                (0, l.useDidShow)(function () {
                  var e = K();
                  v(function (t) {
                    t.routeParams = e;
                  }),
                    null != T && T.regionauth_id && e.team_id && L();
                }),
                (0, l.useShareAppMessage)(
                  (0, i.Z)(
                    (0, s.Z)().mark(function e() {
                      var t, n, a, r, i;
                      return (0, s.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (n = (t = S || {}).team_id),
                                (a = t.group_id),
                                (r = t.distributor_id),
                                (i = "/subpages/marketing/group-detail?crmcode="
                                  .concat(
                                    null == T ? void 0 : T.regionauth_code,
                                    "&group_id="
                                  )
                                  .concat(a, "&team_id=")
                                  .concat(n, "&distributor_id=")
                                  .concat(r)),
                                e.abrupt("return", {
                                  title:
                                    (null == N ? void 0 : N.shareDesc) ||
                                    "拼团购",
                                  path: i,
                                  imageUrl: Z.pic,
                                })
                              );
                            case 3:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  )
                );
              var L = (function () {
                  var e = (0, i.Z)(
                    (0, s.Z)().mark(function e() {
                      var t, n, a, o, c, l, d, m, g, f;
                      return (0, s.Z)().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (((e.prev = 0), (t = (S || {}).team_id))) {
                                  e.next = 5;
                                  break;
                                }
                                return (
                                  console.warn("team_id 参数缺失"),
                                  e.abrupt("return")
                                );
                              case 5:
                                return (
                                  v(function (e) {
                                    e.loading = !0;
                                  }),
                                  (e.next = 8),
                                  b.Z.group.groupTeamDetail({ team_id: t })
                                );
                              case 8:
                                if (
                                  ((n = e.sent),
                                  (a = n.team_info),
                                  (o = n.goods_info),
                                  (c = n.member_list),
                                  (l = n.is_fail),
                                  (d = n.is_qualification),
                                  (m = (0, h.D9)(a, {
                                    actId: "groups_activity_id",
                                    teamId: "team_id",
                                    personNum: "person_num",
                                    teamStatus: "team_status",
                                    shareDesc: "share_desc",
                                    promotionTag: "promotion_tag",
                                    time: function (e) {
                                      var t = e.team_end_time,
                                        n = new Date().getTime() / 1e3;
                                      return (0, h.vj)(t - n);
                                    },
                                  })),
                                  (g = (0, h.D9)(
                                    o,
                                    x.Z.goods.GROUP_GOODS_ITEM
                                  )),
                                  (f = (0, h.D9)(
                                    (null == c ? void 0 : c.list) || [],
                                    {
                                      headimgurl: function (e) {
                                        var t = e.member_info;
                                        return (
                                          (null == t ? void 0 : t.headimgurl) ||
                                          "fv_user.png"
                                        );
                                      },
                                      nickname: function (e) {
                                        var t = e.member_info;
                                        return (
                                          (null == t ? void 0 : t.nickname) ||
                                          "微信用户"
                                        );
                                      },
                                      memberId: "member_id",
                                    }
                                  )),
                                  v(function (e) {
                                    (e.teamInfo = m),
                                      (e.goodsInfo = g),
                                      (e.memberList = (0, r.Z)(f).reverse()),
                                      (e.isQualification = d),
                                      (e.loading = !1);
                                  }),
                                  !j()(l) || !l)
                                ) {
                                  e.next = 21;
                                  break;
                                }
                                return (
                                  (e.next = 21),
                                  B({
                                    title: "拼团失败",
                                    showClose: !0,
                                    content: (0, G.jsx)(p.G7, {
                                      className: "group-detail-modal-content",
                                      children:
                                        " 拼团已过期，付款金额将退回原账户，看看其他活动吧",
                                    }),
                                    renderFooter: (0, G.jsx)(p.G7, {
                                      className:
                                        "modal-footer group-detail-modal-footer",
                                      children: (0, G.jsx)(p.G7, {
                                        className:
                                          "group-detail-modal-footer-btn-active",
                                        onClick: (0, i.Z)(
                                          (0, s.Z)().mark(function e() {
                                            var t;
                                            return (0, s.Z)().wrap(function (
                                              e
                                            ) {
                                              for (;;)
                                                switch ((e.prev = e.next)) {
                                                  case 0:
                                                    return (e.next = 2), E();
                                                  case 2:
                                                    (
                                                      (null ===
                                                        (t =
                                                          u()
                                                            .getCurrentPages) ||
                                                      void 0 === t
                                                        ? void 0
                                                        : t.call(u())) || []
                                                    ).length > 1
                                                      ? u().navigateBack()
                                                      : u().switchTab({
                                                          url: "/pages/index",
                                                        });
                                                  case 4:
                                                  case "end":
                                                    return e.stop();
                                                }
                                            },
                                            e);
                                          })
                                        ),
                                        children: "知道了",
                                      }),
                                    }),
                                  })
                                );
                              case 21:
                                e.next = 28;
                                break;
                              case 23:
                                return (
                                  (e.prev = 23),
                                  (e.t0 = e.catch(0)),
                                  v(function (e) {
                                    e.loading = !1;
                                  }),
                                  (e.next = 28),
                                  B({
                                    title: "获取拼团信息失败",
                                    content: (0, G.jsx)(p.G7, {
                                      className: "group-detail-modal-content",
                                      children:
                                        "拼团下架或已结束，请重新选择其他活动",
                                    }),
                                    renderFooter: (0, G.jsx)(p.G7, {
                                      className:
                                        "modal-footer group-detail-modal-footer",
                                      children: (0, G.jsx)(p.G7, {
                                        className:
                                          "group-detail-modal-footer-btn-active",
                                        onClick: (0, i.Z)(
                                          (0, s.Z)().mark(function e() {
                                            var t;
                                            return (0, s.Z)().wrap(function (
                                              e
                                            ) {
                                              for (;;)
                                                switch ((e.prev = e.next)) {
                                                  case 0:
                                                    return (e.next = 2), E();
                                                  case 2:
                                                    (
                                                      (null ===
                                                        (t =
                                                          u()
                                                            .getCurrentPages) ||
                                                      void 0 === t
                                                        ? void 0
                                                        : t.call(u())) || []
                                                    ).length > 1
                                                      ? u().navigateBack()
                                                      : u().switchTab({
                                                          url: "/pages/index",
                                                        });
                                                  case 4:
                                                  case "end":
                                                    return e.stop();
                                                }
                                            },
                                            e);
                                          })
                                        ),
                                        children: " 知道了",
                                      }),
                                    }),
                                  })
                                );
                              case 28:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        null,
                        [[0, 23]]
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
                Q = (function () {
                  var e = (0, i.Z)(
                    (0, s.Z)().mark(function e() {
                      var t,
                        n,
                        a,
                        r,
                        o,
                        c,
                        l,
                        d,
                        m,
                        g = arguments;
                      return (0, s.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (
                                ((t =
                                  !(g.length > 0 && void 0 !== g[0]) || g[0]),
                                M)
                              ) {
                                e.next = 5;
                                break;
                              }
                              return (e.next = 4), L();
                            case 4:
                              return e.abrupt("return");
                            case 5:
                              if (I) {
                                e.next = 9;
                                break;
                              }
                              return (
                                (e.next = 8),
                                B({
                                  title: "",
                                  content: (0, G.jsx)(p.G7, {
                                    className: "group-detail-modal-content",
                                    children:
                                      "不好意思，您不符合参团条件，请重新选择其他活动",
                                  }),
                                  renderFooter: (0, G.jsx)(p.G7, {
                                    className:
                                      "modal-footer group-detail-modal-footer",
                                    children: (0, G.jsx)(p.G7, {
                                      className:
                                        "group-detail-modal-footer-btn-active",
                                      onClick: (0, i.Z)(
                                        (0, s.Z)().mark(function e() {
                                          var t;
                                          return (0, s.Z)().wrap(function (e) {
                                            for (;;)
                                              switch ((e.prev = e.next)) {
                                                case 0:
                                                  return (e.next = 2), E();
                                                case 2:
                                                  (
                                                    (null ===
                                                      (t =
                                                        u().getCurrentPages) ||
                                                    void 0 === t
                                                      ? void 0
                                                      : t.call(u())) || []
                                                  ).length > 1
                                                    ? u().navigateBack()
                                                    : u().switchTab({
                                                        url: "/pages/index",
                                                      });
                                                case 4:
                                                case "end":
                                                  return e.stop();
                                              }
                                          }, e);
                                        })
                                      ),
                                      children: "知道了",
                                    }),
                                  }),
                                })
                              );
                            case 8:
                              return e.abrupt("return");
                            case 9:
                              (a = (n = S || {}).team_id),
                                (r = n.group_id),
                                (o = n.distributor_id),
                                t
                                  ? ((c = {
                                      id: Z.itemId,
                                      dtid: o,
                                      type: "group",
                                      group_id: r,
                                      team_id: a,
                                    }),
                                    (l = w().stringify(c)),
                                    u().navigateTo({
                                      url: "/pages/item/espier-detail?".concat(
                                        l
                                      ),
                                    }))
                                  : ((d = {
                                      id: Z.itemId,
                                      dtid: o,
                                      type: "group",
                                      group_id: r,
                                    }),
                                    (m = w().stringify(d)),
                                    u().navigateTo({
                                      url: "/pages/item/espier-detail?".concat(
                                        m
                                      ),
                                    }));
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
                R = (0, c.useMemo)(
                  function () {
                    return !!y.find(function (e) {
                      return (
                        (null == e ? void 0 : e.memberId) ==
                        (null == F ? void 0 : F.user_id)
                      );
                    });
                  },
                  [y, F]
                );
              return (0, G.jsxs)(f.nO, {
                className: "page-group-detail",
                footerHeight: 184,
                renderFooter: N
                  ? (0, G.jsxs)(p.G7, {
                      className: "page-group-detail__footer",
                      children: [
                        (0, G.jsx)(p.G7, {
                          className: "btn-wrap",
                          children:
                            1 == N.teamStatus
                              ? (0, G.jsx)(G.Fragment, {
                                  children: R
                                    ? (0, G.jsx)(p.zx, {
                                        className:
                                          "btn-wrap__item btn-wrap__all th2",
                                        openType: "share",
                                        children: "邀请好友参团",
                                      })
                                    : (0, G.jsx)(p.G7, {
                                        className:
                                          "btn-wrap__item btn-wrap__all th2",
                                        children: (0, G.jsx)(f.vC, {
                                          onChange: function () {
                                            Q(!0);
                                          },
                                          children: "我要参团",
                                        }),
                                      }),
                                })
                              : (0, G.jsxs)(G.Fragment, {
                                  children: [
                                    (0, G.jsx)(p.G7, {
                                      className: "btn-wrap__item th1",
                                      onClick: function () {
                                        u().navigateTo({
                                          url: "/subpages/marketing/group-list",
                                        });
                                      },
                                      children: "更多活动爆品",
                                    }),
                                    (0, G.jsx)(f.vC, {
                                      onChange: function () {
                                        Q(!1);
                                      },
                                      children: (0, G.jsx)(p.G7, {
                                        className: "btn-wrap__item th2",
                                        children: "重新开团",
                                      }),
                                    }),
                                  ],
                                }),
                        }),
                        (0, G.jsx)(p.G7, {
                          className: "group-rule",
                          children: "拼团玩法：好友参团，成团发货，不成团退款",
                        }),
                      ],
                    })
                  : null,
                children: [
                  P && (0, G.jsx)(f.m6, {}),
                  N &&
                    (0, G.jsxs)(p.pf, {
                      className: "scroll-view-container",
                      scrollY: !0,
                      children: [
                        1 == N.teamStatus
                          ? (0, G.jsxs)(p.G7, {
                              className: "page-group-detail__countdown",
                              children: [
                                (0, G.jsx)(p.G7, {
                                  className:
                                    "page-group-detail__countdown-title",
                                  children: "距结束还剩",
                                }),
                                (0, G.jsx)(
                                  g.Z,
                                  {
                                    isShowDay: !0,
                                    day: N.time.dd,
                                    hours: N.time.hh,
                                    minutes: N.time.mm,
                                    seconds: N.time.ss,
                                    format: {
                                      day: "天",
                                      hours: "时",
                                      minutes: "分",
                                      seconds: "秒",
                                    },
                                    onTimeUp: function () {
                                      L();
                                    },
                                  },
                                  N.time.ss
                                ),
                              ],
                            })
                          : (0, G.jsx)(p.G7, {
                              className: "page-group-detail__status",
                              children: (0, G.jsxs)(p.G7, {
                                className: (0, h.AK)({
                                  "status-box": !0,
                                  "status-box__success": 2 == N.teamStatus,
                                  "status-box__failed": 2 != N.teamStatus,
                                }),
                                children: [
                                  2 == N.teamStatus &&
                                    (0, G.jsx)(p.xv, {
                                      className: "iconfont icon-roundcheckfill",
                                    }),
                                  (0, G.jsx)(p.xv, {
                                    className: "status-box__text",
                                    children:
                                      2 == N.teamStatus
                                        ? "人气爆棚，拼团成功"
                                        : "人气欠佳，拼团失败",
                                  }),
                                ],
                              }),
                            }),
                        (0, G.jsxs)(p.G7, {
                          className: "product-info",
                          children: [
                            (0, G.jsx)(p.G7, {
                              className: "product-info__img",
                              children: (0, G.jsx)(f.Ko, {
                                src: Z.pic,
                                mode: "aspectFill",
                              }),
                            }),
                            (0, G.jsxs)(p.G7, {
                              className: "product-info__content",
                              children: [
                                (0, G.jsxs)(p.G7, {
                                  className: "product-info__hd",
                                  children: [
                                    (0, G.jsxs)(p.G7, {
                                      className: "product-info__price",
                                      children: [
                                        (0, G.jsx)(p.xv, {
                                          className:
                                            "product-info__price-symbol",
                                          children: "¥",
                                        }),
                                        (0, G.jsx)(p.xv, {
                                          className:
                                            "product-info__price-value",
                                          children: (0, h.Po)(Z.activityPrice),
                                        }),
                                        (0, G.jsx)(p.xv, {
                                          className:
                                            "product-info__price-original",
                                          children: (0, h.Po)(Z.marketPrice),
                                        }),
                                      ],
                                    }),
                                    (0, G.jsx)(p.G7, {
                                      className: "product-info__tag",
                                      children: N.promotionTag,
                                    }),
                                  ],
                                }),
                                (0, G.jsx)(p.G7, {
                                  className: "product-info__title",
                                  children: Z.itemName,
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, G.jsxs)(p.G7, {
                          className: "page-group-detail__members",
                          children: [
                            (0, G.jsx)(p.G7, {
                              className: "page-group-detail__members-hd",
                              children:
                                null ===
                                  (e = Array.from({
                                    length: Math.min(N.personNum, 10),
                                  })) || void 0 === e
                                  ? void 0
                                  : e.map(function (e, t) {
                                      var n;
                                      return (0,
                                      G.jsxs)(p.G7, { className: "page-group-detail__avatar", style: { zIndex: t }, children: [0 == t && (0, G.jsx)(p.G7, { className: "leader", children: (0, G.jsx)(p.xv, { className: "leader__text", children: "团长" }) }), t < y.length || 2 == N.teamStatus ? (0, G.jsx)(f.Ko, { className: "sp-image-leader", src: (null === (n = y[t]) || void 0 === n ? void 0 : n.headimgurl) || "fv_user.png", mode: "aspectFill" }) : (0, G.jsx)(p.G7, { className: "sp-image" })] }, e);
                                    }),
                            }),
                            (0, G.jsx)(p.G7, {
                              className: "page-group-detail__members-bd",
                              children:
                                1 == N.teamStatus
                                  ? (0, G.jsxs)(p.xv, {
                                      children: [
                                        "差",
                                        N.personNum - y.length,
                                        "人拼团成功",
                                      ],
                                    })
                                  : (0, G.jsx)(p.xv, {
                                      children:
                                        2 == N.teamStatus
                                          ? "团长人气爆棚，已拼团成功啦"
                                          : "团长人气不足，拼团失败",
                                    }),
                            }),
                          ],
                        }),
                      ],
                    }),
                ],
              });
            };
          (Z.enableShareAppMessage = !0),
            Page(
              (0, a.createPageConfig)(
                Z,
                "subpages/marketing/group-detail",
                { root: { cn: [] } },
                { navigationStyle: "custom" } || {}
              )
            );
        },
        51584: function (e, t, n) {
          var a = n(44239),
            r = n(37005);
          e.exports = function (e) {
            return !0 === e || !1 === e || (r(e) && "[object Boolean]" == a(e));
          };
        },
      },
      function (e) {
        e.O(0, [2107, 1216, 8592], function () {
          return (function (t) {
            return e((e.s = t));
          })(68962);
        }),
          e.O();
      },
    ]);
})();
