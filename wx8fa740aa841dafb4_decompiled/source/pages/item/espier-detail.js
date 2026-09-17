!(function () {
  "use strict";
  require("./sub-common/74f108c90ff8039d8a83bdd865ae040d.js"),
    require("./sub-common/46db6df93d0f1d11bc7b80b657b9f6cb.js"),
    require("./sub-common/bb473f59700a7d29e57fc2cfee60c24f.js"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [8830],
      {
        89127: function (e, t, n) {
          var i = n(32180),
            s = n(1413),
            o = n(74165),
            r = n(15861),
            a = n(93433),
            c = n(29439),
            l = n(67294),
            u = n(31707),
            d = n(92954),
            m = n.n(d),
            p = n(71515),
            f = n(90057),
            h = n(23493),
            v = n.n(h),
            g = n(7616),
            x = n(78061),
            _ = n(84902),
            j = n(1696),
            b = n(96856),
            N = n(27741),
            y = n(33540),
            k = n(80129),
            G = n.n(k),
            I = n(96943),
            w = n(9453),
            C = n(80459),
            T = n(23577),
            S = n(37042),
            Z = n(89679),
            F = n(60683),
            O = n(15671),
            A = n(43144),
            P = n(58618),
            M = n(60136),
            $ = n(4942),
            D = n(93967),
            q = n.n(D),
            R = n(45697),
            E = n.n(R),
            L = (function (e) {
              function t(e) {
                var n;
                return (
                  (0, O.Z)(this, t),
                  ((n = (0, P.Z)(this, t, [e])).state = {}),
                  n
                );
              }
              return (
                (0, M.Z)(t, e),
                (0, A.Z)(t, [
                  {
                    key: "formatValue",
                    value: function (e, t) {
                      if ("" === e || null == e) return "";
                      var n = +e;
                      return Number.isNaN(n)
                        ? e
                        : n > t
                        ? "".concat(t, "+")
                        : n;
                    },
                  },
                  {
                    key: "render",
                    value: function () {
                      var e = this.props,
                        t = e.dot,
                        n = e.value,
                        i = e.maxValue,
                        s = void 0 === i ? 99 : i,
                        o = e.customStyle,
                        r = this.formatValue(n, s);
                      return l.createElement(
                        p.G7,
                        {
                          className: q()(["at-badge"], this.props.className),
                          style: o,
                        },
                        this.props.children,
                        t
                          ? l.createElement(p.G7, {
                              className: "at-badge__dot",
                            })
                          : "" !== r &&
                              l.createElement(
                                p.G7,
                                { className: "at-badge__num" },
                                r
                              )
                      );
                    },
                  },
                ])
              );
            })(l.Component);
          (L.defaultProps = {
            dot: !1,
            value: "",
            maxValue: 99,
            customStyle: {},
            className: "",
          }),
            (L.propTypes = {
              dot: E().bool,
              value: E().oneOfType([E().string, E().number]),
              maxValue: E().number,
              customStyle: E().oneOfType([E().object, E().string]),
              className: E().oneOfType([E().array, E().string]),
            });
          var Y,
            K = n(32730),
            U = n(53553),
            B = n(85893),
            V = (0, K.Z)().store,
            z =
              ((0, u.$j)(function (e) {
                var t = e.colors,
                  n = e.user;
                return { colors: t.current, favs: n.favs || [] };
              })(
                ((Y = (function (e) {
                  function t() {
                    var e;
                    (0, O.Z)(this, t);
                    for (
                      var n = arguments.length, i = new Array(n), s = 0;
                      s < n;
                      s++
                    )
                      i[s] = arguments[s];
                    return (
                      (e = (0, P.Z)(this, t, [].concat(i))),
                      (0, $.Z)(e, "handleClickCart", function (e, t) {
                        b.$L,
                          m().reLaunch({
                            url: "/pages/cart/espier-index?type=".concat(t),
                          });
                      }),
                      (0, $.Z)(e, "handleNaviationToHome", function () {
                        m().navigateTo({ url: "/pages/index" });
                      }),
                      (0, $.Z)(
                        e,
                        "handleFavClick",
                        (0, r.Z)(
                          (0, o.Z)().mark(function t() {
                            var n, i, s, r, a;
                            return (0, o.Z)().wrap(function (t) {
                              for (;;)
                                switch ((t.prev = t.next)) {
                                  case 0:
                                    return (
                                      (n = e.props.info),
                                      (i = n.item_id),
                                      (s = n.distributor_id),
                                      (r = void 0 === s ? 0 : s),
                                      (t.next = 3),
                                      (0, b.xn)({ distributor_id: r })
                                    );
                                  case 3:
                                    if (t.sent) {
                                      t.next = 7;
                                      break;
                                    }
                                    return (
                                      (0, b.CF)("该商品已下架"),
                                      t.abrupt("return")
                                    );
                                  case 7:
                                    if (
                                      (a =
                                        e.props.favs.findIndex(function (e) {
                                          return e.item_id == i;
                                        }) > -1)
                                    ) {
                                      t.next = 13;
                                      break;
                                    }
                                    return (
                                      (t.next = 11), V.dispatch((0, U.L$)(i))
                                    );
                                  case 11:
                                    t.next = 15;
                                    break;
                                  case 13:
                                    return (
                                      (t.next = 15), V.dispatch((0, U.f4)(i))
                                    );
                                  case 15:
                                    return (
                                      (t.next = 17),
                                      V.dispatch(
                                        (0, U.Mx)({ page: 1, pageSize: 500 })
                                      )
                                    );
                                  case 17:
                                    (0, b.CF)(a ? "已移出收藏" : "已加入收藏");
                                  case 18:
                                  case "end":
                                    return t.stop();
                                }
                            }, t);
                          })
                        )
                      ),
                      e
                    );
                  }
                  return (
                    (0, M.Z)(t, e),
                    (0, A.Z)(t, [
                      {
                        key: "render",
                        value: function () {
                          var e = this.props,
                            t = e.onClickAddCart,
                            n = e.onClickFastBuy,
                            i = e.cartCount,
                            s = e.type,
                            o = e.info,
                            r = e.colors,
                            a = e.isPointitem,
                            c = e.favs,
                            l = void 0 === c ? [] : c;
                          if (!o) return null;
                          var u = "drug" === o.special_type,
                            d = a
                              ? "立即兑换"
                              : "normal" === s || "limited_time_sale" === s
                              ? "立即购买"
                              : "seckill" === s
                              ? "立即抢购"
                              : "我要开团",
                            m =
                              l.findIndex(function (e) {
                                return e.item_id == o.itemId;
                              }) > -1;
                          return (0, B.jsxs)(p.G7, {
                            className: (0, b.AK)(
                              a ? "goods-isPointitem" : null,
                              "goods-buy-toolbar"
                            ),
                            children: [
                              (0, B.jsxs)(p.G7, {
                                className: "goods-buy-toolbar__menus",
                                children: [
                                  (0, B.jsx)(x.vC, {
                                    children: (0, B.jsx)(p.G7, {
                                      className: "goods-buy-toolbar__menu-item",
                                      onClick: this.handleFavClick,
                                      children: (0, B.jsx)(p.G7, {
                                        className: (0, b.AK)(
                                          "iconfont",
                                          m
                                            ? "icon-shoucanghover-01"
                                            : "icon-shoucang-01"
                                        ),
                                      }),
                                    }),
                                  }),
                                  a
                                    ? (0, B.jsx)(p.G7, {
                                        className:
                                          "goods-buy-toolbar__menu-item",
                                        onClick: this.handleNaviationToHome,
                                        children: (0, B.jsx)(p.G7, {
                                          className: "iconfont icon-home",
                                        }),
                                      })
                                    : (0, B.jsx)(p.G7, {
                                        className:
                                          "goods-buy-toolbar__menu-item",
                                        onClick: this.handleClickCart.bind(
                                          this,
                                          o.item_id,
                                          u ? "drug" : "distributor"
                                        ),
                                        children: (0, B.jsx)(L, {
                                          value: i || null,
                                          children: (0, B.jsx)(p.G7, {
                                            className: "iconfont icon-cart",
                                          }),
                                        }),
                                      }),
                                ],
                              }),
                              this.props.customRender
                                ? this.props.children
                                : (0, B.jsx)(x.vC, {
                                    children:
                                      "onsale" === o.approve_status
                                        ? (0, B.jsxs)(p.G7, {
                                            className:
                                              "goods-buy-toolbar__btns",
                                            children: [
                                              ("normal" === s ||
                                                "limited_time_sale" === s) &&
                                                !a &&
                                                (0, B.jsx)(p.G7, {
                                                  sync: !0,
                                                  onClick: t,
                                                  children: (0, B.jsx)(p.G7, {
                                                    className:
                                                      "goods-buy-toolbar__btn btn-add-cart ".concat(
                                                        u && "drug-btn"
                                                      ),
                                                    style:
                                                      "background: " +
                                                      r.data[0].accent,
                                                    children: u
                                                      ? "加入药品清单"
                                                      : "添加至购物车",
                                                  }),
                                                }),
                                              !u &&
                                                (0, B.jsx)(p.G7, {
                                                  sync: !0,
                                                  onClick: n,
                                                  children: (0, B.jsx)(p.G7, {
                                                    className:
                                                      "goods-buy-toolbar__btn btn-fast-buy ".concat(
                                                        "normal" !== s &&
                                                          "limited_time_sale" !==
                                                            s &&
                                                          "marketing-btn"
                                                      ),
                                                    style:
                                                      "background: " +
                                                      r.data[0].primary,
                                                    children: d,
                                                  }),
                                                }),
                                            ],
                                          })
                                        : (0, B.jsx)(p.G7, {
                                            className:
                                              "goods-buy-toolbar__btns",
                                            children: (0, B.jsx)(p.G7, {
                                              className:
                                                "goods-buy-toolbar__btn disabled",
                                              children: "暂不可售",
                                            }),
                                          }),
                                  }),
                            ],
                          });
                        },
                      },
                    ])
                  );
                })(l.Component)),
                (0, $.Z)(Y, "options", { addGlobalClass: !0 }),
                (0, $.Z)(Y, "defaultProps", {
                  type: "normal",
                  onClickAddCart: function () {},
                  onClickFastBuy: function () {},
                  onFavItem: function () {},
                  cartCount: "",
                  info: {},
                  isPointitem: !1,
                }),
                Y)
              ),
              (function (e) {
                function t(e) {
                  var n;
                  return (
                    (0, O.Z)(this, t),
                    ((n = (0, P.Z)(this, t, [e])).state = {
                      remaining_time: null,
                    }),
                    n
                  );
                }
                return (
                  (0, M.Z)(t, e),
                  (0, A.Z)(t, [
                    {
                      key: "componentDidMount",
                      value: function () {
                        var e = this.props.info,
                          t = (0, b.vj)(e.over_time);
                        this.setState({ remaining_time: t });
                      },
                    },
                    {
                      key: "render",
                      value: function () {
                        var e = this.props,
                          t = e.info,
                          n = e.total,
                          i = e.onClick,
                          s = this.state.remaining_time;
                        return s
                          ? (0, B.jsxs)(p.G7, {
                              className:
                                "grouping-item view-flex view-flex-middle",
                              onClick: i,
                              children: [
                                (0, B.jsx)(p.Ee, {
                                  className: "group-sponsor-avatar",
                                  src: t.member_info.headimgurl,
                                }),
                                (0, B.jsxs)(p.G7, {
                                  className: "view-flex-item",
                                  children: [
                                    (0, B.jsxs)(p.G7, {
                                      className: "name",
                                      children: [
                                        t.member_info.nickname,
                                        "的团",
                                      ],
                                    }),
                                    (0, B.jsxs)(p.G7, {
                                      children: [
                                        "还差",
                                        (0, B.jsx)(p.xv, {
                                          className: "group-num",
                                          children: n - t.join_person_num,
                                        }),
                                        "人成团",
                                      ],
                                    }),
                                    (0, B.jsxs)(p.G7, {
                                      className: "text-muted",
                                      children: [
                                        "剩余",
                                        (0, B.jsx)(_.Z, {
                                          isShowDay: !0,
                                          format: {
                                            day: "天",
                                            hours: ":",
                                            minutes: ":",
                                            seconds: "",
                                          },
                                          day: s.dd,
                                          hours: s.hh,
                                          minutes: s.mm,
                                          seconds: s.ss,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, B.jsx)(p.G7, {
                                  className: "group-join",
                                  children: "去参团",
                                }),
                              ],
                            })
                          : null;
                      },
                    },
                  ])
                );
              })(l.Component));
          (0, $.Z)(z, "options", { addGlobalClass: !0 }),
            (0, $.Z)(z, "defaultProps", { info: {}, onClick: function () {} });
          var H = n(27484),
            W = n.n(H),
            J = n(1646),
            X = n.n(J),
            Q = n(1646);
          W().extend(Q);
          var ee = (0, A.Z)(
            function e(t, n) {
              (0, O.Z)(this, e),
                (0, $.Z)(this, "timer", null),
                (this.target = W()(t)),
                (this.duration = this.target.diff(W()())),
                (this.callback = n),
                (this.flag = !0);
            },
            [
              {
                key: "formatTime",
                value: function (e) {
                  var t = Math.floor(e / 1e3),
                    n = Math.floor(t / 60),
                    i = Math.floor(n / 60),
                    s = Math.floor(i / 24);
                  (i %= 24), (n %= 60), (t %= 60);
                  var o = function (e) {
                    return e >= 10 ? e : "0" + e;
                  };
                  return {
                    text: ""
                      .concat(s > 0 ? o(s) + "天 " : "")
                      .concat(o(i), ":")
                      .concat(o(n), ":")
                      .concat(o(t)),
                    days: s,
                    hours: i,
                    minutes: n,
                    seconds: t,
                  };
                },
              },
              {
                key: "update",
                value: function () {
                  var e = this;
                  this.duration > 0 && this.flag
                    ? (this.callback(this.formatTime(this.duration)),
                      (this.duration -= 1e3),
                      (this.timer = setTimeout(function () {
                        e.update();
                      }, 1e3)))
                    : this.clear();
                },
              },
              {
                key: "clear",
                value: function () {
                  (this.flag = !1),
                    clearTimeout(this.timer),
                    this.callback(0, !0);
                },
              },
            ]
          );
          W().extend(X());
          var te = (0, l.memo)(function (e) {
            var t = e.seconds,
              n = e.onComplete,
              i = (0, l.useRef)(),
              s = (0, l.useState)(""),
              o = (0, c.Z)(s, 2),
              r = o[0],
              a = o[1];
            return (
              (0, l.useEffect)(
                function () {
                  (i.current = new ee(1e3 * t, function (e, t) {
                    var i = e.text;
                    t && n && n(), a(i);
                  })),
                    i.current.update();
                },
                [t]
              ),
              (0, B.jsx)(p.G7, {
                className: "sp-countdown",
                style: { color: "#fff", fontSize: "22rpx" },
                children: r,
              })
            );
          });
          te.defaultProps = { onComplete: null };
          var ne = te,
            ie = n(92624),
            se = n(21066),
            oe = function (e) {
              var t = e.itemId,
                n = e.isFav,
                i = void 0 !== n && n,
                s = e.onSuccess,
                a = e.className,
                f = void 0 === a ? "" : a,
                h = e.espierClick,
                v = void 0 === h ? function () {} : h,
                g = (0, se.f0)({}).isLogin,
                _ = (0, u.v9)(function (e) {
                  return e.regionauth;
                }).regionauthInfo,
                j = void 0 === _ ? {} : _,
                N = (0, l.useState)(i),
                y = (0, c.Z)(N, 2),
                k = y[0],
                G = y[1],
                I = (0, l.useState)(!1),
                w = (0, c.Z)(I, 2),
                T = w[0],
                S = w[1],
                Z = (0, d.getCurrentInstance)();
              (0, l.useEffect)(
                function () {
                  G(i);
                },
                [i]
              ),
                (0, l.useEffect)(
                  function () {
                    g &&
                      t &&
                      (0, ie.getItemCollect)(t).then(function (e) {
                        var t = e.fav;
                        G(!!t);
                      });
                  },
                  [t, g]
                );
              var F = (function () {
                var e = (0, r.Z)(
                  (0, o.Z)().mark(function e() {
                    var n;
                    return (0, o.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (!T && g) {
                                e.next = 2;
                                break;
                              }
                              return e.abrupt("return");
                            case 2:
                              if (
                                ((0, C.setFlowClickGio)({
                                  position: 1,
                                  index: 1,
                                  moduleName_var: "商品收藏",
                                  title: k ? "商品取消收藏" : "商品收藏",
                                  regionauth_code:
                                    (null == j ? void 0 : j.regionauth_code) ||
                                    "-",
                                }),
                                (e.prev = 3),
                                S(!0),
                                !k)
                              ) {
                                e.next = 10;
                                break;
                              }
                              return (e.next = 8), (0, ie.delFav)(t);
                            case 8:
                              e.next = 12;
                              break;
                            case 10:
                              return (e.next = 12), (0, ie.addFav)(t);
                            case 12:
                              G(!k),
                                s && s(!k),
                                k ||
                                  (v(),
                                  b.N_.postCenterTask({
                                    ruleId:
                                      (null == Z ||
                                      null === (n = Z.router) ||
                                      void 0 === n ||
                                      null === (n = n.params) ||
                                      void 0 === n
                                        ? void 0
                                        : n.ruleId) ||
                                      m().getStorageSync("task_rule_id"),
                                    goodsId: t,
                                  })),
                                m().showToast({
                                  title: k ? "已取消收藏" : "已收藏",
                                  icon: "success",
                                  duration: 1500,
                                }),
                                (e.next = 22);
                              break;
                            case 18:
                              (e.prev = 18),
                                (e.t0 = e.catch(3)),
                                console.error("收藏操作失败:", e.t0),
                                m().showToast({
                                  title: "操作失败，请重试",
                                  icon: "none",
                                  duration: 1500,
                                });
                            case 22:
                              return (e.prev = 22), S(!1), e.finish(22);
                            case 25:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[3, 18, 22, 25]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })();
              return (0, B.jsx)(x.vC, {
                children: (0, B.jsx)(p.G7, {
                  className: "sp-goods-fav ".concat(f),
                  onClick: F,
                  children: k
                    ? (0, B.jsx)(x.Ko, {
                        src: "fv_collected.png",
                        className: "sp-goods-fav__icon",
                        mode: "widthFix",
                        width: 40,
                        height: 40,
                      })
                    : (0, B.jsx)(x.Ko, {
                        src: "fv_not_bookmarked.png",
                        className: "sp-goods-fav__icon",
                        mode: "widthFix",
                        width: 40,
                        height: 40,
                      }),
                }),
              });
            };
          function re(e) {
            var t = e.open,
              n = void 0 !== t && t,
              i = e.info,
              s = e.onClose,
              o = void 0 === s ? function () {} : s,
              r = Array.isArray(i) ? i : [];
            return (0, B.jsx)(x.o9, {
              className: "comp-server",
              open: n,
              title: "服务保障",
              onClose: o,
              children: (0, B.jsx)(p.pf, {
                scrollY: !0,
                className: "comp-server-scroll",
                style: { height: "672rpx" },
                children: (0, B.jsx)(B.Fragment, {
                  children: r.map(function (e) {
                    return (0,
                    B.jsxs)(p.G7, { className: "comp-server-item", children: [(0, B.jsx)(p.G7, { className: "comp-server-item-header", children: (0, B.jsxs)(p.G7, { className: "comp-server-item-header-left", children: [(0, B.jsx)(x.Ko, { src: "fv_verified_user02.png", className: "comp-server-item-icon" }), (0, B.jsx)(p.xv, { className: "comp-server-item-title", children: e.tagName })] }) }), (0, B.jsx)(p.G7, { className: "comp-server-item-content", children: e.tagDesc })] });
                  }),
                }),
              }),
            });
          }
          re.options = { addGlobalClass: !0 };
          var ae = re,
            ce = n(50361),
            le = n.n(ce);
          function ue(e) {
            var t = this,
              n = e.open,
              i = void 0 !== n && n,
              s = (e.activityCollection, e.info),
              a = void 0 === s ? [] : s,
              c = e.onClose,
              l = void 0 === c ? function () {} : c,
              u = e.coupons,
              d = void 0 === u ? [] : u,
              f = e.onChangeCoupon,
              h = void 0 === f ? function () {} : f,
              v = function (e) {
                var t = e.type,
                  n = e.tag_type,
                  i = e.promotion_id,
                  s = e.platform_collection_id;
                if ("plus_price_buy" !== t) {
                  if ("group" === n) {
                    if (i)
                      return void m().navigateTo({
                        url: "/subpages/marketing/group-list",
                      });
                    if (s)
                      return void m().navigateTo({
                        url: "/subpages/marketing/platform-group-list?id=".concat(
                          s
                        ),
                      });
                  }
                  if ("limited_time_sale" === n) {
                    if (i)
                      return void m().navigateTo({
                        url: "/subpages/marketing/limited-sale?id=".concat(i),
                      });
                    if (s)
                      return void m().navigateTo({
                        url: "/subpages/marketing/platfrom_limited-sale?id=".concat(
                          s
                        ),
                      });
                  }
                  "member_preference" === n && i
                    ? m().navigateTo({
                        url: "/subpages/marketing/marketing-list?promotion_id=".concat(
                          i
                        ),
                      })
                    : i &&
                      m().navigateTo({
                        url: "/subpages/marketing/marketing-list?marketing_id=".concat(
                          i
                        ),
                      });
                } else
                  m().navigateTo({
                    url: "/marketing/pages/plusprice/detail-plusprice-list?marketing_id=".concat(
                      i
                    ),
                  });
              },
              g = (function () {
                var e = (0, r.Z)(
                  (0, o.Z)().mark(function e(t, n) {
                    var i, s, r, a;
                    return (0, o.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (i = t.cardId),
                                t.code,
                                (e.prev = 1),
                                (e.next = 4),
                                j.Z.member.homeCouponGet({ card_id: i })
                              );
                            case 4:
                              (s = e.sent),
                                (r = s.status)
                                  ? ((0, b.CF)("优惠券领取成功"),
                                    (a = le()(d)),
                                    r.get_limit &&
                                      r.get_limit <= r.user_get_num &&
                                      a[n] &&
                                      (a[n].couponStatus = {
                                        text: "已领取",
                                        type: 2,
                                      }),
                                    j.Z.track.adTrack({
                                      action_type: "CLAIM_OFFER",
                                      coupon_id: i,
                                    }),
                                    h(a))
                                  : (0, b.CF)("优惠券领取失败"),
                                (e.next = 11);
                              break;
                            case 9:
                              (e.prev = 9), (e.t0 = e.catch(1));
                            case 11:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[1, 9]]
                    );
                  })
                );
                return function (t, n) {
                  return e.apply(this, arguments);
                };
              })();
            return (0, B.jsxs)(x.o9, {
              className: "comp-promation",
              open: i,
              title: "优惠",
              onClose: l,
              children: [
                (null == d ? void 0 : d.length) > 0 &&
                  (0, B.jsx)(p.G7, {
                    className: "coupon-list",
                    children: (0, B.jsx)(p.G7, {
                      className: "coupon-list-container",
                      children:
                        null == d
                          ? void 0
                          : d.map(function (e, t) {
                              var n;
                              return (0, B.jsxs)(p.G7, {
                                className: "coupon-item",
                                children: [
                                  (0, B.jsx)(
                                    x.Xv,
                                    {
                                      info: e,
                                      children: (0, B.jsx)(x.vC, {
                                        onChange: function (n) {
                                          return (function (e, t) {
                                            1 == e.couponStatus.type && g(e, t);
                                          })(e, t);
                                        },
                                        children: (0, B.jsx)(p.G7, {
                                          className: (0, b.AK)("coupon-btn", {
                                            "coupon-btn-disabled":
                                              1 != e.couponStatus.type,
                                          }),
                                          children: e.couponStatus.text,
                                        }),
                                      }),
                                    },
                                    "coupon-item__"
                                      .concat(t, "_")
                                      .concat(e.id, "_")
                                      .concat(
                                        null === (n = e.couponStatus) ||
                                          void 0 === n
                                          ? void 0
                                          : n.type
                                      )
                                  ),
                                  " ",
                                ],
                              });
                            }),
                    }),
                  }),
                (null == a ? void 0 : a.length) > 0 &&
                  (0, B.jsxs)(p.G7, {
                    className: "promation-list",
                    children: [
                      (0, B.jsx)(p.G7, {
                        className: "promation-list-title",
                        children: "活动",
                      }),
                      (0, B.jsx)(p.G7, {
                        className: "promation-list-contanier",
                        children:
                          null == a
                            ? void 0
                            : a.map(function (e, n) {
                                return (0,
                                B.jsx)(p.G7, { className: "promation-item", children: (0, B.jsxs)(p.G7, { className: "promation", onClick: v.bind(t, e), children: [(0, B.jsxs)(p.G7, { className: "promation-rule-content", children: ["limited_time_sale" == e.tag_type ? (0, B.jsx)(x.Ko, { width: 62, height: 31, src: "fv_activity_seckill.png", mode: "widthFix" }) : "member_preference" == e.tag_type ? (0, B.jsx)(x.Ko, { width: 76, height: 32, src: "fv_member_preference.png", mode: "widthFix" }) : (0, B.jsx)(p.G7, { className: "promation-tag", children: e.tag_name }), (0, B.jsx)(p.G7, { className: "promation-rule", children: e.tag_desc })] }), (e.promotion_id || e.platform_collection_id) && (0, B.jsx)(p.xv, { className: "iconfont icon-qianwang-01" })] }) }, "promation-item__".concat(n));
                              }),
                      }),
                    ],
                  }),
              ],
            });
          }
          ue.options = { addGlobalClass: !0 };
          var de = ue,
            me = n(52744),
            pe = n(66341);
          function fe(e) {
            var t,
              n = this,
              i = e.info,
              a = e.onChange,
              c = void 0 === a ? function () {} : a,
              l = e.onSubscribe,
              f = void 0 === l ? function () {} : l,
              h = e.team_id,
              v = void 0 === h ? null : h,
              g = (0, u.v9)(function (e) {
                return e.cart;
              }).cartCount,
              _ = void 0 === g ? 0 : g,
              N = ((0, u.v9)(function (e) {
                return e.user;
              }).favs,
              (0, u.v9)(function (e) {
                return e.regionauth;
              })).regionauthInfo,
              y = void 0 === N ? {} : N,
              k = (0, d.getCurrentInstance)(),
              G = ((0, u.I0)(), []);
            if (!i) return null;
            !(function () {
              var e;
              if (
                (
                  (null === (e = k.router) || void 0 === e
                    ? void 0
                    : e.params) || {}
                ).card_id
              )
                G.push(I.rq.EX_CHANGE);
              else if ("only_show" != i.approveStatus)
                if (i.isGift) G.push(I.rq.GIFT);
                else if (I.dM[i.activityType]) {
                  if ("seckill" == i.activityType)
                    "in_the_notice" === i.activityInfo.status
                      ? G.push(I.rq.ACTIVITY_WILL_START)
                      : G.push(I.rq.ACTIVITY_FAST_BUY);
                  else if ("limited_time_sale" == i.activityType)
                    "in_the_notice" === i.activityInfo.status
                      ? G.push(I.rq.ACTIVITY_WILL_START)
                      : G.push(I.rq.ADD_CART, I.rq.ACTIVITY_BUY);
                  else if ("group" == i.activityType)
                    if ("nostart" === i.activityInfo.show_status)
                      G.push(I.rq.ACTIVITY_WILL_START);
                    else {
                      var t = v
                        ? I.rq.ACTIVITY_GROUP_JOIN
                        : I.rq.ACTIVITY_GROUP_BUY;
                      G.push(t);
                    }
                  else
                    "member_preference" == i.activityType &&
                      (i.memberPreference.is_valid
                        ? G.push(I.rq.ADD_CART, I.rq.ACTIVITY_BUY)
                        : G.push(I.rq.MEMBER_PREFERENCE_INVALID));
                  var n;
                  ("normal" != i.promotionTimeStatus || i.store <= 0) &&
                    (G =
                      null === (n = G) || void 0 === n
                        ? void 0
                        : n.map(function (e) {
                            return (0,
                            s.Z)((0, s.Z)({}, e), {}, { disabled: !0 });
                          }));
                } else {
                  if ("normal" != i.promotionTimeStatus)
                    return (
                      G.push(
                        (0, s.Z)(
                          (0, s.Z)({}, I.rq.ADD_CART),
                          {},
                          { disabled: !0 }
                        )
                      ),
                      void G.push(
                        (0, s.Z)(
                          (0, s.Z)({}, I.rq.FAST_BUY),
                          {},
                          { disabled: !0 }
                        )
                      )
                    );
                  G.push(
                    i.store <= 0
                      ? (0, s.Z)(
                          (0, s.Z)({}, I.rq.ADD_CART),
                          {},
                          { disabled: !0 }
                        )
                      : I.rq.ADD_CART
                  ),
                    G.push(
                      i.store <= 0
                        ? (0, s.Z)(
                            (0, s.Z)({}, I.rq.FAST_BUY),
                            {},
                            { disabled: !0 }
                          )
                        : I.rq.FAST_BUY
                    );
                }
              else G.push(I.rq.ONLY_SHOW);
            })();
            var w = (function () {
              var e = (0, r.Z)(
                (0, o.Z)().mark(function e(t) {
                  var n, s, r, a, l, u, d, p, h, v;
                  return (0, o.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (((s = t.key), !t.disabled)) {
                            e.next = 3;
                            break;
                          }
                          return e.abrupt("return");
                        case 3:
                          if (
                            ((r =
                              (null == k ||
                              null === (n = k.router) ||
                              void 0 === n
                                ? void 0
                                : n.params) || {}),
                            (a = r.dtid),
                            (l = r.card_id),
                            (u = r.user_card_id),
                            "notice" != s)
                          ) {
                            e.next = 20;
                            break;
                          }
                          if (!i.subscribe) {
                            e.next = 8;
                            break;
                          }
                          return e.abrupt("return", !1);
                        case 8:
                          if (!b.$L) {
                            e.next = 11;
                            break;
                          }
                          return (
                            (0, b.CF)("请在小程序完成商品到货通知"),
                            e.abrupt("return")
                          );
                        case 11:
                          return (
                            (e.next = 13),
                            j.Z.user.subscribeGoods(i.itemId, {
                              distributor_id: a,
                            })
                          );
                        case 13:
                          return (
                            (e.next = 15),
                            j.Z.user.newWxaMsgTmpl({
                              temp_name: "yykweishop",
                              source_type: "goods",
                            })
                          );
                        case 15:
                          (d = e.sent),
                            (p = d.template_id),
                            m().requestSubscribeMessage({
                              tmplIds: p,
                              success: function () {
                                f();
                              },
                              fail: function () {
                                f();
                              },
                            }),
                            (e.next = 32);
                          break;
                        case 20:
                          if ("exchange" != s) {
                            e.next = 31;
                            break;
                          }
                          return (
                            (h = i.itemId),
                            (e.next = 24),
                            j.Z.cart.exchangeGood({
                              item_id: h,
                              distributor_id: a,
                              user_card_id: u,
                            })
                          );
                        case 24:
                          if (((v = e.sent), !v.status)) {
                            e.next = 29;
                            break;
                          }
                          return (
                            m().navigateTo({
                              url: "/subpages/marketing/exchange-code?user_card_id="
                                .concat(u, "&card_id=")
                                .concat(l),
                            }),
                            e.abrupt("return")
                          );
                        case 29:
                          e.next = 32;
                          break;
                        case 31:
                          c(s);
                        case 32:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function (t) {
                return e.apply(this, arguments);
              };
            })();
            return (0, B.jsxs)(p.G7, {
              className: "comp-goodsbuytoolbar",
              children: [
                (i.store <= 0 || "normal" != i.promotionTimeStatus) &&
                  (0, B.jsx)(p.G7, {
                    className: "nostore--notice",
                    children:
                      "normal" !== i.promotionTimeStatus
                        ? "商品未开售，去看看其他商品吧"
                        : "商品已售罄，去看看其他商品吧",
                  }),
                (0, B.jsxs)(p.G7, {
                  className: "comp-goodsbuytoolbar-left",
                  children: [
                    (0, B.jsxs)(p.G7, {
                      className: "toolbar-item",
                      onClick: function () {
                        i.distributorId,
                          (0, C.setFlowClickGio)({
                            position: 1,
                            index: 1,
                            moduleName_var: "左下方按键",
                            title: "店铺",
                            regionauth_code:
                              (null == y ? void 0 : y.regionauth_code) || "-",
                          }),
                          m().navigateTo({
                            url: "/subpages/store/index?id=".concat(
                              i.distributorId
                            ),
                          });
                      },
                      children: [
                        (0, B.jsx)(p.G7, {
                          className: "toolbar-item_icon",
                          children: (0, B.jsx)(p.xv, {
                            className:
                              "iconfont icon-a-iconstorefrontgoumaizujian",
                          }),
                        }),
                        (0, B.jsx)(p.xv, {
                          className: "toolbar-item-txt",
                          children: "店铺",
                        }),
                      ],
                    }),
                    (0, B.jsxs)(p.G7, {
                      className: "toolbar-item",
                      children: [
                        (0, B.jsx)(me.Z, {
                          iconStyle: { width: "48rpx", height: "48rpx" },
                          townTag: (0, pe.jJ)({
                            regionauthId: i.regionauthId,
                            regionauthName: i.regionauthName,
                          }),
                          product: {
                            cardType: 0,
                            title: i.itemName,
                            picture: i.img,
                            goodsId: "".concat(i.itemNo),
                            isShow: 1,
                            note: i.goodBtn,
                            sendByUser: 1,
                            sendProToRobot: 1,
                            url: ""
                              .concat(
                                "https://aiopro.fvo2o.com/",
                                "entity/goods/physicalmanagement/editor/"
                              )
                              .concat(i.itemId, "?detail=true"),
                            extraParam: { id: i.itemId },
                            from: "product",
                          },
                          callback: function () {
                            (0, C.setFlowClickGio)({
                              position: 1,
                              index: 2,
                              moduleName_var: "左下方按键",
                              title: "客服",
                              regionauth_code:
                                (null == y ? void 0 : y.regionauth_code) || "-",
                            });
                          },
                        }),
                        (0, B.jsx)(p.xv, {
                          className: "toolbar-item-txt",
                          children: "客服",
                        }),
                      ],
                    }),
                    (0, B.jsxs)(p.G7, {
                      className: "toolbar-item",
                      onClick: function () {
                        (0, C.setFlowClickGio)({
                          position: 1,
                          index: 3,
                          moduleName_var: "左下方按键",
                          title: "购物车",
                          regionauth_code:
                            (null == y ? void 0 : y.regionauth_code) || "-",
                        }),
                          (0, b.T8)("/pages/cart/espier-index", !1, !0);
                      },
                      children: [
                        (0, B.jsx)(p.G7, {
                          className: "toolbar-item_icon",
                          children: (0, B.jsx)(p.xv, {
                            className:
                              "iconfont icon-a-iconshopping_baggoumaizujian",
                          }),
                        }),
                        (0, B.jsx)(p.xv, {
                          className: "toolbar-item-txt",
                          children: "购物车",
                        }),
                        _ > 0 &&
                          _ <= 99 &&
                          (0, B.jsx)(p.xv, {
                            className: "cart-count",
                            children: _,
                          }),
                        _ > 99 &&
                          (0, B.jsx)(p.xv, {
                            className: "cart-count1",
                            children: "99+",
                          }),
                      ],
                    }),
                  ],
                }),
                (0, B.jsx)(p.G7, {
                  className: (0, b.AK)("toolbar-btns", {
                    "single-btn": 1 == G.length,
                  }),
                  children:
                    null === (t = G) || void 0 === t
                      ? void 0
                      : t.map(function (e, t) {
                          return "disabled" == e.btnStatus ||
                            e.disabled ||
                            "single_disabled" == e.btnStatus
                            ? (0, B.jsx)(
                                p.G7,
                                {
                                  className: (0, b.AK)(
                                    "btn-item",
                                    "btn-".concat(e.btnStatus),
                                    (0, $.Z)(
                                      (0, $.Z)({}, "btn-disabled", e.disabled),
                                      "btn-single-disabled",
                                      "single_disabled" == e.btnStatus
                                    )
                                  ),
                                  children: (0, B.jsx)(p.G7, {
                                    className: "btn-item-txt",
                                    children: e.title,
                                  }),
                                },
                                "btn-item__".concat(t)
                              )
                            : (0, B.jsx)(
                                x.vC,
                                {
                                  className: (0, b.AK)(
                                    "btn-item",
                                    "btn-".concat(e.btnStatus),
                                    {}
                                  ),
                                  onChange: w.bind(n, e),
                                  children: (0, B.jsx)(p.G7, {
                                    className: "btn-item-txt",
                                    children: e.title,
                                  }),
                                },
                                "btn-item__".concat(t)
                              );
                        }),
                }),
              ],
            });
          }
          fe.options = { addGlobalClass: !0 };
          var he = fe,
            ve = n(45557);
          function ge(e) {
            var t = e.open,
              n = void 0 !== t && t,
              i = e.info,
              s = e.onClose;
            if (!i) return null;
            var o = i.mainGoods,
              r = i.makeUpGoods;
            return (0, B.jsxs)(x.o9, {
              className: "comp-packagelist",
              title: "组合优惠",
              open: n,
              onClose: s,
              renderFooter: (0, B.jsxs)(p.G7, {
                className: "flay-ft",
                children: [
                  (0, B.jsxs)(p.G7, {
                    children: ["组合价：", (0, B.jsx)(x.qq, { value: 100 })],
                  }),
                  (0, B.jsx)(p.G7, {
                    className: "btn-wrap",
                    children: (0, B.jsx)(ve.Z, {
                      type: "primary",
                      circle: !0,
                      onClick: function () {},
                      children: "加入购物车",
                    }),
                  }),
                ],
              }),
              children: [
                (0, B.jsx)(p.G7, {
                  className: "main-goods",
                  children: "主商品",
                }),
                (0, B.jsx)(p.G7, {
                  className: "main-goods-list",
                  children: (0, B.jsx)(p.G7, {
                    className: "main-goods-item",
                    children: (0, B.jsx)(x.Pg, { info: o }),
                  }),
                }),
                (0, B.jsx)(p.G7, {
                  className: "makeup-goods",
                  children: "可选商品",
                }),
                (0, B.jsx)(p.G7, {
                  className: "makeup-goods-list",
                  children:
                    null == r
                      ? void 0
                      : r.map(function (e, t) {
                          return (0,
                          B.jsxs)(p.G7, { className: "makeup-goods-item", children: [(0, B.jsx)(x.bM, {}), (0, B.jsx)(x.Pg, { info: e })] });
                        }),
                }),
              ],
            });
          }
          ge.options = { addGlobalClass: !0 };
          var xe = ge;
          var _e = l.memo(function (e) {
            var t = e.promotions,
              n = void 0 === t ? [] : t,
              i = e.coupons,
              s = void 0 === i ? [] : i;
            return (0, B.jsx)(B.Fragment, {
              children: (0, B.jsxs)(B.Fragment, {
                children: [
                  null == n
                    ? void 0
                    : n.map(function (e, t) {
                        return "limited_time_sale" == e.tag_type
                          ? (0, B.jsx)(
                              x.Ko,
                              {
                                height: 32,
                                src: "fv_activity_seckill.png",
                                mode: "heightFix",
                              },
                              t
                            )
                          : "member_preference" == e.tag_type
                          ? (0, B.jsx)(
                              x.Ko,
                              {
                                height: 32,
                                src: "fv_member_preference.png",
                                mode: "heightFix",
                              },
                              t
                            )
                          : (0, B.jsx)(
                              x.$r,
                              { label: e.tag_name, type: e.type },
                              t
                            );
                      }),
                  null == s
                    ? void 0
                    : s.map(function (e, t) {
                        return (0,
                        B.jsx)(x.$r, { label: e.discount_rule, type: "warning" }, t);
                      }),
                ],
              }),
            });
          });
          function je() {
            return (0, B.jsxs)(p.G7, {
              className: "page-item-espierdetail-skeleton__footer",
              children: [
                (0, B.jsx)(p.G7, {
                  className: "page-item-espierdetail-skeleton__footer-icon",
                }),
                (0, B.jsx)(p.G7, {
                  className: "page-item-espierdetail-skeleton__footer-icon",
                }),
                (0, B.jsx)(p.G7, {
                  className: "page-item-espierdetail-skeleton__footer-btn",
                }),
                (0, B.jsx)(p.G7, {
                  className:
                    "page-item-espierdetail-skeleton__footer-btn page-item-espierdetail-skeleton__footer-btn--primary",
                }),
              ],
            });
          }
          var be = l.memo(function () {
              return (0, B.jsxs)(p.pf, {
                scrollY: !0,
                className: "goods-contents page-item-espierdetail-skeleton",
                style: "height: 100%;",
                children: [
                  (0, B.jsx)(p.G7, {
                    className: "page-item-espierdetail-skeleton__banner",
                  }),
                  (0, B.jsxs)(p.G7, {
                    className: "page-item-espierdetail-skeleton__price",
                    children: [
                      (0, B.jsx)(p.G7, {
                        className:
                          "page-item-espierdetail-skeleton__line page-item-espierdetail-skeleton__line--price",
                      }),
                      (0, B.jsx)(p.G7, {
                        className:
                          "page-item-espierdetail-skeleton__line page-item-espierdetail-skeleton__line--sub",
                      }),
                    ],
                  }),
                  (0, B.jsxs)(p.G7, {
                    className: "page-item-espierdetail-skeleton__info",
                    children: [
                      (0, B.jsx)(p.G7, {
                        className:
                          "page-item-espierdetail-skeleton__line page-item-espierdetail-skeleton__line--title",
                      }),
                      (0, B.jsx)(p.G7, {
                        className:
                          "page-item-espierdetail-skeleton__line page-item-espierdetail-skeleton__line--title-short",
                      }),
                      (0, B.jsxs)(p.G7, {
                        className: "page-item-espierdetail-skeleton__row",
                        children: [
                          (0, B.jsx)(p.G7, {
                            className: "page-item-espierdetail-skeleton__thumb",
                          }),
                          (0, B.jsxs)(p.G7, {
                            className:
                              "page-item-espierdetail-skeleton__row-meta",
                            children: [
                              (0, B.jsx)(p.G7, {
                                className:
                                  "page-item-espierdetail-skeleton__line",
                              }),
                              (0, B.jsx)(p.G7, {
                                className:
                                  "page-item-espierdetail-skeleton__line page-item-espierdetail-skeleton__line--short",
                              }),
                            ],
                          }),
                        ],
                      }),
                      [1, 2].map(function (e) {
                        return (0,
                        B.jsxs)(p.G7, { className: "page-item-espierdetail-skeleton__params", children: [(0, B.jsx)(p.G7, { className: "page-item-espierdetail-skeleton__icon" }), (0, B.jsx)(p.G7, { className: "page-item-espierdetail-skeleton__line page-item-espierdetail-skeleton__line--flex" })] }, e);
                      }),
                    ],
                  }),
                  (0, B.jsx)(p.G7, {
                    className: "page-item-espierdetail-skeleton__shop",
                  }),
                  (0, B.jsxs)(p.G7, {
                    className: "page-item-espierdetail-skeleton__desc",
                    children: [
                      (0, B.jsxs)(p.G7, {
                        className: "page-item-espierdetail-skeleton__desc-hd",
                        children: [
                          (0, B.jsx)(p.G7, {
                            className: "page-item-espierdetail-skeleton__tab",
                          }),
                          (0, B.jsx)(p.G7, {
                            className:
                              "page-item-espierdetail-skeleton__tab page-item-espierdetail-skeleton__tab--muted",
                          }),
                        ],
                      }),
                      (0, B.jsx)(p.G7, {
                        className: "page-item-espierdetail-skeleton__desc-body",
                        children: [1, 2, 3, 4].map(function (e) {
                          return (0,
                          B.jsx)(p.G7, { className: "page-item-espierdetail-skeleton__line page-item-espierdetail-skeleton__line--block" }, e);
                        }),
                      }),
                    ],
                  }),
                ],
              });
            }),
            Ne = n(32180).document,
            ye = l.memo(x.C3);
          function ke(e) {
            var t;
            if (
              null == e ||
              null === (t = e.specItems) ||
              void 0 === t ||
              !t.length
            )
              return null;
            var n = e.skuId || e.itemId,
              i = e.specItems.find(function (e) {
                return e.itemId == n;
              }),
              s = null == i ? void 0 : i.estimatedPrice;
            return null != s && s > 0 ? s : null;
          }
          var Ge = {
            info: null,
            play: !1,
            isDefault: !1,
            defaultMsg: "",
            packageOpen: !1,
            skuPanelOpen: !1,
            promotionOpen: !1,
            sharePanelOpen: !1,
            posterModalOpen: !1,
            mainGoods: {},
            makeUpGoods: [],
            skuText: "",
            curItem: null,
            selectType: "picker",
            id: null,
            dtid: null,
            groupList: [],
            serverOpen: !1,
            activetab: 0,
            muted: !0,
            sourceList: [],
            sourceIndex: 0,
            previewMediaOpen: !1,
            posterIsReady: !1,
            addressOpen: !1,
            addressInfo: null,
            navigateMantle: !1,
            settings: null,
            team_id: null,
            group_id: null,
            skuTeamId: null,
            skuGroupId: null,
            fixedEstimatedPrice: null,
          };
          var Ie = function (e) {
            var t,
              n,
              i,
              h,
              k,
              O,
              A,
              P,
              M = (0, l.useState)(0),
              $ = (0, c.Z)(M, 2),
              D = $[0],
              q = $[1],
              R = (0, d.getCurrentInstance)(),
              E = (0, Z.Z)().getSystemConfig,
              L = (0, u.I0)(),
              Y = (0, l.useRef)(),
              K = (0, u.v9)(function (e) {
                return e.user;
              }).userInfo,
              U = (0, u.v9)(function (e) {
                return e.sys;
              }).colorPrimary,
              V = (0, u.v9)(function (e) {
                return e.regionauth;
              }).regionauthInfo,
              z = void 0 === V ? {} : V,
              H = (0, l.useRef)(),
              W = (0, l.useRef)(),
              J = (0, l.useRef)(!1),
              X = (0, f.x)(Ge),
              Q = (0, c.Z)(X, 2),
              ee = Q[0],
              te = Q[1],
              ie = ee.info,
              se = ee.play,
              re = ee.isDefault,
              ce = ee.defaultMsg,
              le = ee.packageOpen,
              ue = ee.skuPanelOpen,
              me = ee.promotionOpen,
              pe = ee.sharePanelOpen,
              fe = ee.posterModalOpen,
              ve = ee.mainGoods,
              ge = ee.makeUpGoods,
              Ie = ee.skuText,
              we = ee.selectType,
              Ce = ee.id,
              Te = ee.dtid,
              Se = ee.groupList,
              Ze = ee.serverOpen,
              Fe = ee.activetab,
              Oe = ee.muted,
              Ae = ee.sourceList,
              Pe = ee.sourceIndex,
              Me = ee.previewMediaOpen,
              $e = ee.posterIsReady,
              De = ee.navigateMantle,
              qe = ee.settings,
              Re = ee.team_id,
              Ee = ee.group_id,
              Le = ee.skuTeamId,
              Ye = ee.skuGroupId,
              Ke = ee.fixedEstimatedPrice,
              Ue = (0, u.v9)(function (e) {
                return e.live;
              }).liveInfo,
              Be = (0, l.useRef)(!1),
              Ve = (0, l.useMemo)(
                function () {
                  return $e && fe;
                },
                [$e, fe]
              );
            (0, l.useEffect)(function () {
              Xe();
            }, []),
              (0, l.useEffect)(
                function () {
                  null != z && z.regionauth_id && We();
                },
                [z]
              ),
              (0, l.useEffect)(
                function () {
                  Ce && et();
                },
                [Ce, K]
              ),
              (0, d.useDidShow)(function () {
                Ce && et();
              }),
              (0, l.useEffect)(
                function () {
                  Re &&
                    ie &&
                    !J.current &&
                    !ue &&
                    ((J.current = !0),
                    te(function (e) {
                      (e.skuPanelOpen = !0), (e.selectType = "fastbuy");
                    }));
                },
                [Re, ie]
              );
            var ze = (0, l.useMemo)(
                function () {
                  if (Se.length <= 2) return Se;
                  var e = (0, a.Z)(Se);
                  return (
                    e.length % 2 != 0 && (e = [].concat((0, a.Z)(e), [e[0]])), e
                  );
                },
                [Se]
              ),
              He = (0, l.useMemo)(
                function () {
                  var e;
                  if (
                    null != ie &&
                    null !== (e = ie.activityInfo) &&
                    void 0 !== e &&
                    e.end_time
                  ) {
                    var t =
                      ie.activityInfo.end_time - new Date().getTime() / 1e3;
                    return (0, b.vj)(t > 0 ? t : 0);
                  }
                  return { dd: 0, hh: 0, mm: 0, ss: 0 };
                },
                [
                  null == ie || null === (t = ie.activityInfo) || void 0 === t
                    ? void 0
                    : t.end_time,
                ]
              );
            (0, l.useEffect)(
              function () {
                if (!(Se.length <= 2)) {
                  var e = setInterval(function () {
                    q(function (e) {
                      var t = e + 2;
                      return t >= ze.length ? 0 : t;
                    });
                  }, 3e3);
                  return function () {
                    return clearInterval(e);
                  };
                }
              },
              [ze]
            ),
              (0, l.useEffect)(
                function () {
                  var e;
                  b.FO
                    ? (e = m().createVideoContext("goods-video"))
                    : b.$L && (e = Ne.getElementById("goods-video")),
                    e &&
                      (se
                        ? setTimeout(function () {
                            e.play();
                          }, 200)
                        : b.FO
                        ? e.stop()
                        : e.pause());
                },
                [se]
              ),
              (0, l.useEffect)(
                function () {
                  le || ue || pe || fe || me
                    ? Y.current.pageLock()
                    : Y.current.pageUnLock();
                },
                [le, ue, pe, fe, me]
              ),
              (0, d.useDidShow)(function () {
                var e, t, n;
                m().nextTick(function () {
                  if (
                    (!Ue &&
                      null != ie &&
                      ie.channel_id &&
                      null != ie &&
                      ie.user_id &&
                      (L((0, g.Sb)({ liveId: ie.channel_id, uid: ie.user_id })),
                      L((0, g.Lo)(!0))),
                    Be.current &&
                      ((0, C.setPageViewGio)(null == ie ? void 0 : ie.townCode),
                      m().getStorageSync("goods_detail_id") ==
                        (null == ie ? void 0 : ie.goodsId)))
                  ) {
                    var e = m().getStorageSync(F.OZ);
                    y.Z.trackViewNum(
                      null == e ? void 0 : e.m,
                      null == e ? void 0 : e.s
                    );
                  }
                }),
                  null != R &&
                    null !== (e = R.router) &&
                    void 0 !== e &&
                    null !== (e = e.params) &&
                    void 0 !== e &&
                    e.ruleId &&
                    "fav" !=
                      (null == R ||
                      null === (t = R.router) ||
                      void 0 === t ||
                      null === (t = t.params) ||
                      void 0 === t
                        ? void 0
                        : t.type) &&
                    y.Z.postCenterTask({
                      ruleId:
                        null === (n = R.router.params) || void 0 === n
                          ? void 0
                          : n.ruleId,
                    });
              }),
              (0, d.useShareAppMessage)(
                (0, r.Z)(
                  (0, o.Z)().mark(function e() {
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return e.abrupt("return", Je());
                          case 1:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                )
              ),
              (0, d.useShareTimeline)(
                (0, r.Z)(
                  (0, o.Z)().mark(function e() {
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return e.abrupt("return", Je());
                          case 1:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                )
              );
            var We = (function () {
                var e = (0, r.Z)(
                  (0, o.Z)().mark(function e() {
                    var t;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (e.next = 2),
                              j.Z.wx.getSettingItemNotice({
                                regionauth_id:
                                  null == z ? void 0 : z.regionauth_id,
                              })
                            );
                          case 2:
                            (t = e.sent),
                              te(function (e) {
                                e.settings = t;
                              });
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
              })(),
              Je = function () {
                var e = ie.itemName,
                  t = ie.imgs,
                  n = {
                    id: Ce,
                    dtid: Te,
                    crmcode: null == z ? void 0 : z.regionauth_code,
                  };
                K && (n.uid = K.user_id);
                var i = "/pages/item/espier-detail?".concat(G().stringify(n));
                return (
                  b.cM.debug("share path: ".concat(i)),
                  { title: e, imageUrl: t.length > 0 ? t[0] : [], path: i }
                );
              },
              Xe = (function () {
                var e = (0, r.Z)(
                  (0, o.Z)().mark(function e() {
                    var t, n, i, s, r, a;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), y.Z.getRouteParams();
                          case 2:
                            (t = e.sent),
                              (n = t.type),
                              (i = t.id),
                              (s = t.dtid),
                              (r = t.team_id),
                              (a = t.group_id),
                              te(function (e) {
                                (e.id = i),
                                  (e.type = n),
                                  (e.dtid = s),
                                  (e.team_id = r),
                                  (e.group_id = a);
                              });
                          case 9:
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
              Qe = function (e) {
                te(function (t) {
                  t.activetab = e;
                });
              },
              et = (function () {
                var e = (0, r.Z)(
                  (0, o.Z)().mark(function e() {
                    var t,
                      n,
                      i,
                      r,
                      a,
                      c,
                      l,
                      u,
                      d,
                      p,
                      f,
                      h,
                      v,
                      x,
                      _,
                      k,
                      G,
                      w,
                      Z,
                      O,
                      A,
                      P,
                      M,
                      $,
                      D,
                      q,
                      Y;
                    return (0, o.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (e.next = 2), y.Z.getRouteParams();
                            case 2:
                              return (
                                (t = e.sent),
                                (n = t.previousPage),
                                (i = t.searchModule),
                                (r = t.keyword),
                                (a = t.m),
                                (c = t.s),
                                (u = null == z ? void 0 : z.regionauth_code),
                                (e.prev = 9),
                                (f = { showError: !1 }),
                                (e.next = 13),
                                j.Z.item.detail(Ce, f)
                              );
                            case 13:
                              if (
                                ((h = e.sent),
                                (l = (0, b.D9)(
                                  h,
                                  N.Z.goods.ESPIER_DETAIL_GOODS_INFO
                                )),
                                a &&
                                  c &&
                                  ((v = (null == R ? void 0 : R.page) || {}),
                                  (x = v.route),
                                  m().setStorageSync(
                                    "goods_detail_id",
                                    null == h ? void 0 : h.goods_id
                                  ),
                                  m().setStorageSync(F.Et, x),
                                  m().setStorageSync(F.OZ, { m: a, s: c })),
                                null === (d = l) ||
                                  void 0 === d ||
                                  !d.regionauthId ||
                                  (null === (p = l) || void 0 === p
                                    ? void 0
                                    : p.regionauthId) ==
                                    (null == z ? void 0 : z.regionauth_id))
                              ) {
                                e.next = 30;
                                break;
                              }
                              return (
                                (e.next = 19),
                                j.Z.regionauth.getRegionauthList({
                                  noRegionauth: !0,
                                })
                              );
                            case 19:
                              return (
                                (_ = e.sent),
                                (k = _.list),
                                (G = k.find(function (e) {
                                  return e.regionauth_id === l.regionauthId;
                                })),
                                (e.next = 24),
                                L((0, T.Lt)(G))
                              );
                            case 24:
                              return (
                                E(G.regionauth_id),
                                (e.next = 27),
                                L((0, S.tx)())
                              );
                            case 27:
                              return (e.next = 29), L((0, T.TX)(G));
                            case 29:
                              u = G.regionauth_code;
                            case 30:
                              if (
                                (n &&
                                  i &&
                                  r &&
                                  (0, C.setSearchResultGio)({
                                    searchWord: r,
                                    searchModule: i,
                                    sourceEntrance: n,
                                    resultNumber: 1,
                                    ifSearchResult: "其他",
                                    townName:
                                      null == z ? void 0 : z.regionauth_code,
                                    liveId: null == Ue ? void 0 : Ue.liveId,
                                  }),
                                j.Z.track.adTrack({
                                  action_type: "VIEW_CONTENT",
                                  spu_id: h.goods_bn,
                                  distributor_id: h.distributor_id,
                                }),
                                "instock" != l.approveStatus)
                              ) {
                                e.next = 35;
                                break;
                              }
                              return (
                                te(function (e) {
                                  (e.isDefault = !0),
                                    (e.defaultMsg = "商品已下架");
                                }),
                                e.abrupt("return")
                              );
                            case 35:
                              e.next = 40;
                              break;
                            case 37:
                              (e.prev = 37),
                                (e.t0 = e.catch(9)),
                                te(function (t) {
                                  var n;
                                  (t.isDefault = !0),
                                    (t.defaultMsg =
                                      null === e.t0 ||
                                      void 0 === e.t0 ||
                                      null === (n = e.t0.res) ||
                                      void 0 === n ||
                                      null === (n = n.data) ||
                                      void 0 === n ||
                                      null === (n = n.data) ||
                                      void 0 === n
                                        ? void 0
                                        : n.message);
                                });
                            case 40:
                              if (
                                l &&
                                (I.dM[l.activityType] &&
                                  m().setNavigationBarColor({
                                    frontColor: "#ffffff",
                                    backgroundColor: U,
                                    animation: {
                                      duration: 400,
                                      timingFunc: "easeIn",
                                    },
                                  }),
                                (D =
                                  null !== (w = l) && void 0 !== w && w.video
                                    ? [
                                        {
                                          type: "video",
                                          url:
                                            null === (Z = l) || void 0 === Z
                                              ? void 0
                                              : Z.video,
                                        },
                                      ]
                                    : []),
                                null === (O = l.imgs) ||
                                  void 0 === O ||
                                  O.map(function (e) {
                                    D.push({ type: "image", url: e });
                                  }),
                                !Ue &&
                                  null !== (A = l) &&
                                  void 0 !== A &&
                                  A.user_id &&
                                  null !== (P = l) &&
                                  void 0 !== P &&
                                  P.channel_id &&
                                  (L(
                                    (0, g.Sb)({
                                      liveId: l.channel_id,
                                      uid: l.user_id,
                                    })
                                  ),
                                  L((0, g.Lo)(!0))),
                                (q = (0, b.D9)(
                                  (null === (M = l) || void 0 === M
                                    ? void 0
                                    : M.couponList) || [],
                                  N.Z.coupon.COUPON
                                )),
                                (Y = (0, b.D9)(
                                  (null === ($ = l) || void 0 === $
                                    ? void 0
                                    : $.groupList) || [],
                                  N.Z.goods.GOODS_GROUP_ITEM
                                )),
                                te(function (e) {
                                  (e.info = (0, s.Z)(
                                    (0, s.Z)({}, l),
                                    {},
                                    { couponList: q, townCode: u }
                                  )),
                                    (e.groupList = Y),
                                    (e.promotionActivity = l.promotionActivity),
                                    (e.sourceList = D),
                                    (e.fixedEstimatedPrice = ke(l)),
                                    Be.current ||
                                      m().nextTick(function () {
                                        var e, t;
                                        if (
                                          ((0, C.setPdpPageViewGio)(
                                            (0, s.Z)(
                                              (0, s.Z)({}, l),
                                              {},
                                              {
                                                shopCode:
                                                  null === (e = l) ||
                                                  void 0 === e ||
                                                  null ===
                                                    (e = e.distributorInfo) ||
                                                  void 0 === e
                                                    ? void 0
                                                    : e.shopCode,
                                                pageName: "商品详情页",
                                                regionauth_code: u,
                                              }
                                            )
                                          ),
                                          (0, C.setPageViewGio)(u),
                                          m().getStorageSync(
                                            "goods_detail_id"
                                          ) ==
                                            (null === (t = l) || void 0 === t
                                              ? void 0
                                              : t.goodsId))
                                        ) {
                                          var n = m().getStorageSync(F.OZ);
                                          y.Z.trackViewNum(
                                            null == n ? void 0 : n.m,
                                            null == n ? void 0 : n.s
                                          );
                                        }
                                        Be.current = !0;
                                      });
                                }),
                                (0, b.YO)() && K)
                              )
                                try {
                                  m().SAPPShare.init({
                                    title: l.itemName,
                                    content: l.brief,
                                    pic: ""
                                      .concat(l.img, "?time=")
                                      .concat(new Date().getTime()),
                                    link: ""
                                      .concat(
                                        "https://aiopro.fvo2o.com/",
                                        "/pages/item/espier-detail?id="
                                      )
                                      .concat(l.itemId, "&dtid=")
                                      .concat(l.distributorId, "&company_id=")
                                      .concat(l.companyId),
                                    path: "/pages/item/espier-detail?company_id="
                                      .concat(l.company_id, "&id=")
                                      .concat(l.v, "&dtid=")
                                      .concat(l.distributor_id, "&uid=")
                                      .concat(K.user_id),
                                    price: l.price,
                                    weibo: !1,
                                    miniApp: !0,
                                  }),
                                    b.cM.debug("app share init success...");
                                } catch (e) {
                                  console.error(e);
                                }
                            case 41:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[9, 37]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              tt = function (e) {
                e.stopPropagation(),
                  te(function (e) {
                    e.play = !se;
                  });
              },
              nt = function (e) {
                e.stopPropagation(),
                  te(function (e) {
                    e.muted = !Oe;
                  });
              },
              it = {};
            ie && ((it["商品"] = ie.itemName), K && (it["昵称"] = K.username));
            var st =
                (null == ie ? void 0 : ie.activityPrice) ||
                (null == ie ? void 0 : ie.price),
              ot = v()(function (e) {
                te(function (t) {
                  t.navigateMantle = e.detail.scrollTop > 100;
                });
              }, 200),
              rt = (function () {
                var e = (0, r.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var n, i;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (null == t || !t.is_join) {
                              e.next = 5;
                              break;
                            }
                            return (
                              (n = ie.distributorId),
                              (i = "/subpages/marketing/group-detail?group_id="
                                .concat(t.actId, "&team_id=")
                                .concat(t.teamId, "&distributor_id=")
                                .concat(n)),
                              m().navigateTo({ url: i }),
                              e.abrupt("return")
                            );
                          case 5:
                            te(function (e) {
                              (e.skuPanelOpen = !0),
                                (e.selectType = "fastbuy"),
                                (e.skuTeamId = t.teamId),
                                (e.skuGroupId = t.actId);
                            });
                          case 6:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t) {
                  return e.apply(this, arguments);
                };
              })();
            return (0, B.jsxs)(x.nO, {
              className: "page-item-espierdetail",
              isDefault: re,
              defaultMsg: ce,
              immersive: !0,
              showLive: !0,
              navigateMantle: De,
              ref: Y,
              renderNavigation: (0, B.jsx)(p.G7, {
                className:
                  "flex justify-items-end page-item-espierdetail__header",
                children: (0, B.jsx)(p.G7, {
                  className: "page-item-espierdetail__collect",
                  children: (0, B.jsx)(oe, {
                    itemId: null == ie ? void 0 : ie.itemId,
                    espierClick: function () {
                      return (function () {
                        var e, t;
                        (0, C.setAuthorizationClickGio)(
                          (0, s.Z)(
                            {
                              shopName:
                                null == ie ||
                                null === (e = ie.distributorInfo) ||
                                void 0 === e
                                  ? void 0
                                  : e.name,
                              shopCode:
                                null == ie ||
                                null === (t = ie.distributorInfo) ||
                                void 0 === t
                                  ? void 0
                                  : t.shopCode,
                            },
                            ie
                          )
                        );
                      })();
                    },
                  }),
                }),
              }),
              renderFooter: ie
                ? (0, B.jsx)(he, {
                    info: ie,
                    onChange: function (e) {
                      te(function (t) {
                        (t.skuPanelOpen = !0), (t.selectType = e);
                      });
                    },
                    sessionFrom: it,
                    team_id: Re,
                    onSubscribe: function () {
                      et();
                    },
                  })
                : (0, B.jsx)(je, {}),
              children: [
                (0, B.jsx)(p.G7, {
                  className: "page-item-espierdetail__header-bg",
                }),
                !ie && (0, B.jsx)(be, {}),
                ie &&
                  (0, B.jsxs)(p.pf, {
                    scrollY: !0,
                    scrollWithAnimation: !0,
                    className: "goods-contents",
                    style: "height: 100%;",
                    onScroll: ot,
                    children: [
                      (0, B.jsx)(p.G7, {
                        className: "goods-pic-container",
                        children: (0, B.jsx)(p.tq, {
                          className: "goods-swiper",
                          onChange: function (e) {
                            te(function (t) {
                              t.curImgIdx = e.detail.current;
                            });
                          },
                          children:
                            null == Ae
                              ? void 0
                              : Ae.map(function (e, t) {
                                  return (0, B.jsxs)(
                                    p.t3,
                                    {
                                      className: "swiper_item",
                                      onClick: function () {
                                        !(function (e) {
                                          te(function (t) {
                                            (t.sourceIndex = e),
                                              (t.previewMediaOpen = !0);
                                          });
                                        })(t);
                                      },
                                      children: [
                                        (0, B.jsx)(p.G7, {
                                          className:
                                            "sp-preview-media__indicator",
                                          children: (0, B.jsxs)(p.G7, {
                                            className: "sp-preview-media__sort",
                                            children: [t + 1, "/", Ae.length],
                                          }),
                                        }),
                                        "video" == (null == e ? void 0 : e.type)
                                          ? (0, B.jsxs)(B.Fragment, {
                                              children: [
                                                (0, B.jsx)(p.nk, {
                                                  id: "goods-video",
                                                  className: "item-video",
                                                  src: e.url,
                                                  showCenterPlayBtn: !1,
                                                  controls: !1,
                                                  muted: Oe,
                                                }),
                                                (0, B.jsx)(p.G7, {
                                                  className: "video_play",
                                                  onClick: tt,
                                                  children: (0, B.jsx)(x.Ko, {
                                                    src: se
                                                      ? "fv_pause_circle.png"
                                                      : "fv_play_circle_outline.png",
                                                    className: "video_play_img",
                                                  }),
                                                }),
                                                (0, B.jsx)(p.G7, {
                                                  className: "video_volume",
                                                  onClick: nt,
                                                  children: (0, B.jsx)(x.Ko, {
                                                    src: Oe
                                                      ? "fv_volume_off.png"
                                                      : "fv_volume_up.png",
                                                    className:
                                                      "video_volume_img",
                                                  }),
                                                }),
                                              ],
                                            })
                                          : (0, B.jsx)(x.Ko, {
                                              mode: "aspectFill",
                                              src: e.url,
                                            }),
                                      ],
                                    },
                                    "swiperitem__".concat(t)
                                  );
                                }),
                        }),
                      }),
                      ie.activityInfo &&
                      "limited_time_sale" ===
                        (null === (n = ie.activityInfo) || void 0 === n
                          ? void 0
                          : n.seckill_type)
                        ? (0, B.jsx)(p.G7, {
                            className: "goods-info--activity-price",
                            children: (0, B.jsxs)(p.G7, {
                              className: "page-item-espierdetail__activity",
                              children: [
                                (0, B.jsxs)(p.G7, {
                                  className:
                                    "page-item-espierdetail__activity--price",
                                  children: [
                                    (0, B.jsxs)(p.G7, {
                                      className:
                                        "page-item-espierdetail__activity--price-current",
                                      children: [
                                        (0, B.jsx)(x.qq, {
                                          value: ie.activityPrice,
                                          weight: 600,
                                          size: 42,
                                          color: "#FFF",
                                          unitSize: 32,
                                        }),
                                        ie.price > 0 &&
                                          (0, B.jsxs)(p.G7, {
                                            className:
                                              "page-item-espierdetail__activity-discount",
                                            children: [
                                              (0, B.jsx)(p.xv, {
                                                className:
                                                  "page-item-espierdetail__activity-subsidize",
                                                children: "平台已补贴",
                                              }),
                                              (0, B.jsx)(x.qq, {
                                                noSymbol: !0,
                                                value:
                                                  Number(ie.price) -
                                                  Number(ie.activityPrice),
                                                color: "#FFF493",
                                                size: 34,
                                                appendText: (0, B.jsx)(p.xv, {
                                                  className:
                                                    "price__append_sub",
                                                  children: "元",
                                                }),
                                                weight: 600,
                                              }),
                                            ],
                                          }),
                                      ],
                                    }),
                                    (0, B.jsxs)(p.G7, {
                                      className:
                                        "page-item-espierdetail__activity--price-down flex items-baseline",
                                      children: [
                                        Number(ie.marketPrice || 0) > 0 &&
                                          Number(st || 0) <
                                            Number(ie.marketPrice || 0) &&
                                          (0, B.jsx)(x.qq, {
                                            noSymbol: !0,
                                            lineThrough: !0,
                                            value: ie.marketPrice,
                                            color: "#FFF",
                                            size: 32,
                                            appendText: (0, B.jsx)(p.xv, {
                                              className:
                                                "price__append_sub_through",
                                              children: "元",
                                            }),
                                          }),
                                        ie.discountRate &&
                                          (0, B.jsxs)(p.G7, {
                                            className:
                                              "page-item-espierdetail__activity--price-discount",
                                            children: [
                                              (0, B.jsx)(p.xv, {
                                                className: "discount-value",
                                                children: ie.discountRate,
                                              }),
                                              (0, B.jsx)(p.xv, {
                                                className: "discount-label",
                                                children: "折",
                                              }),
                                            ],
                                          }),
                                        ie.sales > 0 &&
                                          (0, B.jsxs)(p.G7, {
                                            className:
                                              "page-item-espierdetail__activity--price-sales",
                                            children: [
                                              (0, B.jsx)(p.xv, {
                                                className: "sales-count-label",
                                                children: "已售",
                                              }),
                                              (0, B.jsx)(p.xv, {
                                                className: "sales-count-value",
                                                children:
                                                  ie.sales >= 1e4
                                                    ? "".concat(
                                                        (
                                                          ie.sales / 1e4
                                                        ).toFixed(1),
                                                        "万+"
                                                      )
                                                    : "".concat(ie.sales),
                                              }),
                                            ],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, B.jsxs)(p.G7, {
                                  className:
                                    "page-item-espierdetail__activity--container",
                                  children: [
                                    (0, B.jsx)(x.Ko, {
                                      className:
                                        "page-item-espierdetail__activity--lightning",
                                      mode: "heightFix",
                                      width: 100,
                                      height: 142,
                                      src: "fv_detail_limited_time_saleg_2.png",
                                    }),
                                    (0, B.jsxs)(p.G7, {
                                      className:
                                        "page-item-espierdetail__activity--container-right",
                                      children: [
                                        (0, B.jsx)(x.Ko, {
                                          className: "limited-sale-tag",
                                          src: "fv_limt-sale_tag_2.png",
                                          height: 38,
                                          mode: "heightFix",
                                        }),
                                        (0, B.jsxs)(p.G7, {
                                          className: "countdown-container",
                                          children: [
                                            (0, B.jsx)(p.xv, {
                                              className: "countdown-label",
                                              children: "距结束",
                                            }),
                                            (0, B.jsx)(ne, {
                                              seconds:
                                                ie.activityInfo
                                                  .activity_end_time,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          })
                        : ie.activityInfo && "group" == ie.activityType
                        ? (0, B.jsx)(p.G7, {
                            className: "goods-info--group-price",
                            children: (0, B.jsxs)(p.G7, {
                              className: "page-item-espierdetail__group",
                              children: [
                                (0, B.jsxs)(p.G7, {
                                  className:
                                    "page-item-espierdetail__group--price",
                                  children: [
                                    (0, B.jsxs)(p.G7, {
                                      className:
                                        "page-item-espierdetail__group--price-current",
                                      children: [
                                        (0, B.jsx)(p.G7, {
                                          className: "group-buy-tag",
                                          children: "拼团价",
                                        }),
                                        (0, B.jsx)(x.qq, {
                                          value: ie.activityPrice,
                                          weight: 600,
                                          size: 42,
                                          color: "#FFF",
                                          unitSize: 32,
                                        }),
                                        ie.price > 0 &&
                                          (0, B.jsxs)(p.G7, {
                                            className:
                                              "page-item-espierdetail__group-discount",
                                            children: [
                                              (0, B.jsx)(p.xv, {
                                                className:
                                                  "page-item-espierdetail__group-subsidize",
                                                children: "已补贴",
                                              }),
                                              (0, B.jsx)(x.qq, {
                                                noSymbol: !0,
                                                value:
                                                  Number(ie.price) -
                                                  Number(ie.activityPrice),
                                                color: "#FFF493",
                                                size: 34,
                                                appendText: (0, B.jsx)(p.xv, {
                                                  className:
                                                    "price__append_sub",
                                                  children: "元",
                                                }),
                                                weight: 600,
                                              }),
                                            ],
                                          }),
                                      ],
                                    }),
                                    (0, B.jsxs)(p.G7, {
                                      className:
                                        "page-item-espierdetail__group--price-down flex items-baseline",
                                      children: [
                                        ie.marketPrice > 0 &&
                                          st < ie.marketPrice &&
                                          (0, B.jsx)(x.qq, {
                                            noSymbol: !0,
                                            lineThrough: !0,
                                            value: ie.marketPrice,
                                            color: "#FFF",
                                            size: 32,
                                            appendText: (0, B.jsx)(p.xv, {
                                              className:
                                                "price__append_sub_through",
                                              children: "元",
                                            }),
                                          }),
                                        ie.discountRate &&
                                          (0, B.jsxs)(p.G7, {
                                            className:
                                              "page-item-espierdetail__group--price-discount",
                                            children: [
                                              (0, B.jsx)(p.xv, {
                                                className: "discount-value",
                                                children: ie.discountRate,
                                              }),
                                              (0, B.jsx)(p.xv, {
                                                className: "discount-label",
                                                children: "折",
                                              }),
                                            ],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, B.jsxs)(p.G7, {
                                  className:
                                    "page-item-espierdetail__group--container",
                                  children: [
                                    (0, B.jsxs)(p.G7, {
                                      className: "countdown-container",
                                      children: [
                                        (0, B.jsx)(p.G7, {
                                          className: "countdown-label",
                                          children: "距结束",
                                        }),
                                        (0, B.jsx)(
                                          _.Z,
                                          {
                                            className: "countdown-time-box",
                                            isShowDay: !0,
                                            day: He.dd,
                                            hours: He.hh,
                                            minutes: He.mm,
                                            format: {
                                              day: "天",
                                              hours: ":",
                                              minutes: "",
                                              seconds: "",
                                            },
                                            onTimeUp: function () {
                                              et();
                                            },
                                          },
                                          "countdown-time__group-".concat(He.mm)
                                        ),
                                      ],
                                    }),
                                    ie.sales > 0 &&
                                      (0, B.jsxs)(p.G7, {
                                        className:
                                          "page-item-espierdetail__group--container-sales",
                                        children: [
                                          (0, B.jsx)(p.xv, {
                                            className: "sales-count-label",
                                            children: "已售",
                                          }),
                                          (0, B.jsx)(p.xv, {
                                            className: "sales-count-value",
                                            children:
                                              ie.sales >= 1e4
                                                ? "".concat(
                                                    (ie.sales / 1e4).toFixed(1),
                                                    "万+"
                                                  )
                                                : "".concat(ie.sales),
                                          }),
                                        ],
                                      }),
                                  ],
                                }),
                              ],
                            }),
                          })
                        : (0, B.jsx)(p.G7, {
                            className: "goods-info-price",
                            children: (0, B.jsxs)(p.G7, {
                              className: "price-main",
                              children: [
                                (0, B.jsxs)(p.G7, {
                                  className: "price-main-left",
                                  children: [
                                    (0, B.jsx)(x.qq, {
                                      value: ie.price,
                                      weight: 600,
                                      size: 42,
                                    }),
                                    Ke > 0 &&
                                      (0, B.jsxs)(p.G7, {
                                        className: "estimated-price",
                                        children: [
                                          (0, B.jsx)(p.xv, {
                                            className: "estimated-label",
                                            children: "预估",
                                          }),
                                          (0, B.jsx)(p.xv, {
                                            className: "estimated-value",
                                            children: Ke,
                                          }),
                                        ],
                                      }),
                                    (0, B.jsxs)(p.G7, {
                                      className: "price-sub",
                                      children: [
                                        Number(ie.marketPrice || 0) > 0 &&
                                          Number(st || 0) <
                                            Number(ie.marketPrice || 0) &&
                                          (0, B.jsx)(x.qq, {
                                            noSymbol: !0,
                                            lineThrough: !0,
                                            value: ie.marketPrice,
                                            color: "#BFBFBF",
                                            size: 32,
                                            className: "original-price",
                                          }),
                                        ie.discountRate &&
                                          (0, B.jsxs)(p.xv, {
                                            className: "discount",
                                            children: [
                                              (0, B.jsx)(p.xv, {
                                                className: "discount-value",
                                                children: ie.discountRate,
                                              }),
                                              (0, B.jsx)(p.xv, {
                                                className: "discount-label",
                                                children: "折",
                                              }),
                                            ],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                                ie.sales > 0 &&
                                  (0, B.jsxs)(p.G7, {
                                    className: "sales-count",
                                    children: [
                                      (0, B.jsx)(p.xv, {
                                        className: "sales-count-label",
                                        children: "已售",
                                      }),
                                      (0, B.jsx)(p.xv, {
                                        className: "sales-count-value",
                                        children:
                                          ie.sales >= 1e4
                                            ? "".concat(
                                                (ie.sales / 1e4).toFixed(1),
                                                "万+"
                                              )
                                            : "".concat(ie.sales),
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                          }),
                      (0, B.jsxs)(p.G7, {
                        className: "goods-info",
                        children: [
                          ((null == ie ||
                          null === (i = ie.promotion) ||
                          void 0 === i
                            ? void 0
                            : i.length) ||
                            (null == ie ||
                            null === (h = ie.couponList) ||
                            void 0 === h
                              ? void 0
                              : h.length) > 0) &&
                            (0, B.jsxs)(p.G7, {
                              className: "tags-wrap",
                              onClick: function () {
                                (0, C.setFlowClickGio)({
                                  position: 1,
                                  index: 1,
                                  moduleName_var: "商品营销活动",
                                  title: "商品营销活动标签查看",
                                  regionauth_code:
                                    (null == z ? void 0 : z.regionauth_code) ||
                                    "-",
                                }),
                                  te(function (e) {
                                    e.promotionOpen = !0;
                                  });
                              },
                              children: [
                                (0, B.jsx)(p.G7, {
                                  className: "tags-list",
                                  children: (0, B.jsx)(p.G7, {
                                    className: "tags-list-item",
                                    children: (0, B.jsx)(_e, {
                                      coupons:
                                        null == ie ? void 0 : ie.couponList,
                                      promotions:
                                        null == ie ? void 0 : ie.promotion,
                                    }),
                                  }),
                                }),
                                (0, B.jsx)(x.Ko, {
                                  src: "fv_chevron_right.png",
                                  className: "tag-icon",
                                }),
                              ],
                            }),
                          (0, B.jsxs)(p.G7, {
                            className: "goods-name-wrap",
                            children: [
                              (0, B.jsx)(p.G7, {
                                className: "goods-name",
                                children: (0, B.jsx)(p.G7, {
                                  className: "title",
                                  children: ie.itemName,
                                }),
                              }),
                              (b.FO || (0, b.YO)()) &&
                                (0, B.jsx)(p.G7, {
                                  onClick: (0, r.Z)(
                                    (0, o.Z)().mark(function e() {
                                      var t, n;
                                      return (0, o.Z)().wrap(function (e) {
                                        for (;;)
                                          switch ((e.prev = e.next)) {
                                            case 0:
                                              (0, b.YO)()
                                                ? m().SAPPShare.open()
                                                : ((0, C.setFlowClickGio)({
                                                    position: 1,
                                                    index: 1,
                                                    moduleName_var: "商品分享",
                                                    title: "商品分享",
                                                    regionauth_code:
                                                      (null == z
                                                        ? void 0
                                                        : z.regionauth_code) ||
                                                      "-",
                                                  }),
                                                  (0, C.setShareButtonClickGio)(
                                                    (0, s.Z)(
                                                      {
                                                        shopName:
                                                          null == ie ||
                                                          null ===
                                                            (t =
                                                              ie.distributorInfo) ||
                                                          void 0 === t
                                                            ? void 0
                                                            : t.name,
                                                        shopCode:
                                                          null == ie ||
                                                          null ===
                                                            (n =
                                                              ie.distributorInfo) ||
                                                          void 0 === n
                                                            ? void 0
                                                            : n.shopCode,
                                                        discount:
                                                          null == ie
                                                            ? void 0
                                                            : ie.discountRate,
                                                      },
                                                      ie
                                                    )
                                                  ),
                                                  te(function (e) {
                                                    e.sharePanelOpen = !0;
                                                  }));
                                            case 1:
                                            case "end":
                                              return e.stop();
                                          }
                                      }, e);
                                    })
                                  ),
                                  children: (0, B.jsxs)(p.G7, {
                                    className: "btn-share",
                                    children: [
                                      (0, B.jsx)(x.Ko, {
                                        src: "fv_reply.png",
                                        className: "share-icon",
                                        width: 48,
                                        height: 48,
                                      }),
                                      (0, B.jsx)(p.xv, {
                                        className: "share-txt",
                                        children: "分享",
                                      }),
                                    ],
                                  }),
                                }),
                            ],
                          }),
                        ],
                      }),
                      Se.length > 0 && ie.activityInfo
                        ? (0, B.jsxs)(p.G7, {
                            className: "goods-group",
                            children: [
                              (0, B.jsx)(p.G7, {
                                className: "goods-group__title",
                                children: "正在进行中的团，可参与拼团",
                              }),
                              (0, B.jsx)(p.G7, {
                                className: (0, b.AK)({
                                  "goods-group__content": !0,
                                  scrollable: Se.length > 2,
                                }),
                                children: (0, B.jsx)(p.G7, {
                                  className: "goods-group__scroll-container",
                                  style: {
                                    transform:
                                      Se.length > 2
                                        ? "translateY(-".concat(134 * D, "rpx)")
                                        : "none",
                                    transition: "transform 0.5s ease-out",
                                  },
                                  children:
                                    null == ze
                                      ? void 0
                                      : ze.map(function (e, t) {
                                          return (0, B.jsxs)(
                                            p.G7,
                                            {
                                              className: "goods-group__item",
                                              children: [
                                                (0, B.jsxs)(p.G7, {
                                                  className:
                                                    "goods-group__item__hd",
                                                  children: [
                                                    (0, B.jsx)(p.G7, {
                                                      className:
                                                        "goods-group__item__img",
                                                      children: (0, B.jsx)(
                                                        x.Ko,
                                                        {
                                                          src: e.headimgurl,
                                                          mode: "aspectFill",
                                                        }
                                                      ),
                                                    }),
                                                    (0, B.jsxs)(p.G7, {
                                                      className:
                                                        "goods-group__item__info",
                                                      children: [
                                                        (0, B.jsxs)(p.G7, {
                                                          className:
                                                            "goods-group__item__info-title",
                                                          children: [
                                                            (0, B.jsx)(p.xv, {
                                                              className:
                                                                "goods-group__item__info-title-text",
                                                              children: "团长",
                                                            }),
                                                            (0, B.jsx)(p.xv, {
                                                              className:
                                                                "goods-group__item__info-title-text text-overflow",
                                                              children:
                                                                e.nickname,
                                                            }),
                                                            (0, B.jsx)(p.xv, {
                                                              className:
                                                                "goods-group__item__info-title-text",
                                                              children: "的团",
                                                            }),
                                                          ],
                                                        }),
                                                        (0, B.jsxs)(p.G7, {
                                                          className:
                                                            "goods-group__item__info-desc",
                                                          children: [
                                                            "还差",
                                                            (0, B.jsx)(p.xv, {
                                                              className:
                                                                "num-text",
                                                              children:
                                                                ie.activityInfo
                                                                  .person_num -
                                                                e.join_person_num,
                                                            }),
                                                            "人成团",
                                                          ],
                                                        }),
                                                      ],
                                                    }),
                                                    (0, B.jsx)(x.vC, {
                                                      onChange: function () {
                                                        rt(e);
                                                      },
                                                      children: (0, B.jsx)(
                                                        p.G7,
                                                        {
                                                          className:
                                                            "goods-group__item__btn",
                                                          children: e.is_join
                                                            ? "邀请好友参团"
                                                            : "去参团",
                                                        }
                                                      ),
                                                    }),
                                                  ],
                                                }),
                                                (0, B.jsxs)(p.G7, {
                                                  className:
                                                    "goods-group__item__bd",
                                                  children: [
                                                    (0, B.jsx)(p.G7, {
                                                      className:
                                                        "goods-group__item__img",
                                                    }),
                                                    (0, B.jsxs)(p.G7, {
                                                      className:
                                                        "goods-group__item__countdown",
                                                      children: [
                                                        (0, B.jsx)(p.G7, {
                                                          className:
                                                            "goods-group__item__countdown-title",
                                                          children:
                                                            "距结束还剩",
                                                        }),
                                                        (0, B.jsx)(
                                                          _.Z,
                                                          {
                                                            isShowDay: !0,
                                                            day: e.time.dd,
                                                            hours: e.time.hh,
                                                            minutes: e.time.mm,
                                                            seconds: e.time.ss,
                                                            format: {
                                                              day: "天",
                                                              hours: ":",
                                                              minutes: ":",
                                                              seconds: "",
                                                            },
                                                            onTimeUp:
                                                              function () {
                                                                et();
                                                              },
                                                          },
                                                          "countdown-time__group-".concat(
                                                            e.time.ss
                                                          )
                                                        ),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            },
                                            t
                                          );
                                        }),
                                }),
                              }),
                            ],
                          })
                        : null,
                      (0, B.jsxs)(p.G7, {
                        className: "goods-params-wrap",
                        children: [
                          Ie &&
                            (0, B.jsxs)(p.G7, {
                              className: "params-item params-item-border",
                              children: [
                                (0, B.jsx)(x.Ko, {
                                  src: "fv_check_box.png",
                                  className: "params-item-left",
                                  width: 32,
                                  height: 32,
                                }),
                                (0, B.jsxs)(p.G7, {
                                  className: "params-item-right",
                                  onClick: function () {
                                    "normal" == ie.promotionTimeStatus &&
                                      ie.store > 0 &&
                                      te(function (e) {
                                        (e.skuPanelOpen = !0),
                                          (e.selectType = "picker");
                                      });
                                  },
                                  children: [
                                    (0, B.jsx)(p.G7, {
                                      className: "params-value",
                                      children: Ie,
                                    }),
                                    (0, B.jsx)(x.Ko, {
                                      src: "fv_chevron_right.png",
                                      className: "params-icon",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          (0, B.jsx)(x.vC, {
                            onChange: function () {
                              1 != ie.delivery_method &&
                                te(function (e) {
                                  e.addressOpen = !0;
                                });
                            },
                            children: (0, B.jsx)(p.G7, {
                              className:
                                "params-item delivery-info-warp params-item-border",
                              children: (0, B.jsxs)(p.G7, {
                                className: "params-item-right",
                                children: [
                                  (0, B.jsxs)(p.G7, {
                                    className: "delivery-info",
                                    children: [
                                      (0, B.jsx)(x.Ko, {
                                        src: "fv_local_shipping.png",
                                        className: "params-item-left",
                                        width: 32,
                                        height: 32,
                                      }),
                                      (0, B.jsx)(p.xv, {
                                        className: "delivery-tag text-nowrap",
                                        children:
                                          2 == ie.delivery_method
                                            ? "支持邮寄和自提"
                                            : 0 == ie.delivery_method
                                            ? "仅邮寄"
                                            : 1 == ie.delivery_method
                                            ? "仅自提"
                                            : "",
                                      }),
                                      1 != ie.delivery_method &&
                                        (0, B.jsxs)(B.Fragment, {
                                          children: [
                                            (0, B.jsx)(p.xv, {
                                              className:
                                                "delivery-text text-nowrap",
                                              children:
                                                1 ==
                                                (null == ie
                                                  ? void 0
                                                  : ie.is_free_delivery)
                                                  ? ""
                                                  : ie.templateName,
                                            }),
                                            (0, B.jsx)(p.xv, {
                                              className:
                                                "delivery-action-text text-nowrap",
                                              children: "送至",
                                            }),
                                            (0, B.jsx)(p.xv, {
                                              className: "delivery-action",
                                              style: {
                                                color: ee.addressInfo
                                                  ? "#666666"
                                                  : "#576B95",
                                              },
                                              children: ee.addressInfo
                                                ? ee.addressInfo.province +
                                                  ee.addressInfo.city +
                                                  ee.addressInfo.county +
                                                  ee.addressInfo.adrdetail
                                                : "请添加收货地址",
                                            }),
                                          ],
                                        }),
                                    ],
                                  }),
                                  1 != ie.delivery_method &&
                                    (0, B.jsx)(x.Ko, {
                                      src: "fv_chevron_right.png",
                                      className: "params-icon",
                                    }),
                                ],
                              }),
                            }),
                          }),
                          ie.serviceInterestTag &&
                            (0, B.jsx)(p.G7, {
                              className: "params-item",
                              children: (0, B.jsxs)(p.G7, {
                                className: "params-item-right",
                                onClick: function () {
                                  te(function (e) {
                                    e.serverOpen = !0;
                                  });
                                },
                                children: [
                                  (0, B.jsxs)(p.G7, {
                                    className: "delivery-info",
                                    children: [
                                      (0, B.jsx)(x.Ko, {
                                        src: "fv_verified_user.png",
                                        className: "params-item-left",
                                        width: 32,
                                        height: 32,
                                      }),
                                      (0, B.jsx)(p.xv, {
                                        className: "service-text",
                                        children: ie.serviceInterestTag
                                          .split(",")
                                          .join(" · "),
                                      }),
                                    ],
                                  }),
                                  (0, B.jsx)(x.Ko, {
                                    src: "fv_chevron_right.png",
                                    className: "params-icon",
                                  }),
                                ],
                              }),
                            }),
                        ],
                      }),
                      (null == ie ? void 0 : ie.distributorInfo) &&
                        (null == ie ||
                        null === (k = ie.distributorInfo) ||
                        void 0 === k
                          ? void 0
                          : k.distributorId) &&
                        (0, B.jsx)(x.Rb, {
                          info: null == ie ? void 0 : ie.distributorInfo,
                          goods_id: ie.itemId,
                          isActive: !0,
                          moduleName:
                            null == ie ||
                            null === (O = ie.distributorInfo) ||
                            void 0 === O
                              ? void 0
                              : O.name,
                        }),
                      (0, B.jsx)(x.yq, {
                        isneeddtid: !0,
                        dtid:
                          null == ie ||
                          null === (A = ie.distributorInfo) ||
                          void 0 === A
                            ? void 0
                            : A.distributorId,
                        regionauth_id: null == z ? void 0 : z.regionauth_id,
                        page_type: "product_detail",
                        regionauth_code: null == z ? void 0 : z.regionauth_code,
                      }),
                      (0, B.jsxs)(p.G7, {
                        className: "goods-desc",
                        children: [
                          (0, B.jsxs)(p.G7, {
                            className: "desc-hd",
                            children: [
                              (0, B.jsx)(p.G7, {
                                className: (0, b.AK)("desc-title", {
                                  "active-desc-title": 0 == Fe,
                                }),
                                onClick: function () {
                                  return Qe(0);
                                },
                                children: "图文详情",
                              }),
                              (null == qe
                                ? void 0
                                : qe.product_purchase_notice_open) &&
                                (0, B.jsx)(p.G7, {
                                  className: (0, b.AK)("desc-title", {
                                    "active-desc-title": 1 == Fe,
                                  }),
                                  onClick: function () {
                                    return Qe(1);
                                  },
                                  children: "购买须知",
                                }),
                            ],
                          }),
                          0 == Fe
                            ? (0, B.jsx)(x.KF, { content: ie.intro })
                            : (0, B.jsx)(x.KF, {
                                content:
                                  null == qe
                                    ? void 0
                                    : qe.product_purchase_notice,
                              }),
                        ],
                      }),
                    ],
                  }),
                (0, B.jsx)(xe, {
                  open: le,
                  onClose: function () {
                    te(function (e) {
                      e.packageOpen = !1;
                    });
                  },
                  info: { mainGoods: ve, makeUpGoods: ge },
                }),
                (0, B.jsx)(de, {
                  open: me,
                  activityCollection:
                    null == ie ? void 0 : ie.activityCollection,
                  info: null == ie ? void 0 : ie.promotion,
                  coupons: null == ie ? void 0 : ie.couponList,
                  onChangeCoupon: function (e) {
                    te(function (t) {
                      t.info = (0, s.Z)(
                        (0, s.Z)({}, ie),
                        {},
                        { couponList: e }
                      );
                    });
                  },
                  onClose: function () {
                    te(function (e) {
                      e.promotionOpen = !1;
                    });
                  },
                }),
                (0, B.jsx)(x.EY, {
                  renderHeader: function () {
                    var e, t, n, i, s, o, r, a, c;
                    return (
                      1 !=
                        (null === (e = ee.info) || void 0 === e
                          ? void 0
                          : e.is_free_delivery) &&
                      (0, B.jsxs)(p.G7, {
                        className: "address-picker-header",
                        children: [
                          (0, B.jsx)(p.G7, {
                            className: "address-picker-header--title",
                            children: "店铺运费规则",
                          }),
                          (null === (t = ee.addressInfo) || void 0 === t
                            ? void 0
                            : t.address_id) &&
                            (0, B.jsxs)(p.G7, {
                              className: "address-picker-header--address",
                              children: [
                                (0, B.jsx)(p.xv, {
                                  className:
                                    "address-picker-header--address-text text-nowrap",
                                  children: "送至",
                                }),
                                (0, B.jsx)(p.xv, {
                                  children:
                                    (null === (n = ee.addressInfo) ||
                                    void 0 === n
                                      ? void 0
                                      : n.province) +
                                    (null === (i = ee.addressInfo) ||
                                    void 0 === i
                                      ? void 0
                                      : i.city) +
                                    (null === (s = ee.addressInfo) ||
                                    void 0 === s
                                      ? void 0
                                      : s.county) +
                                    (null === (o = ee.addressInfo) ||
                                    void 0 === o
                                      ? void 0
                                      : o.adrdetail),
                                }),
                              ],
                            }),
                          (null === (r = ee.info) || void 0 === r
                            ? void 0
                            : r.templateName) &&
                            (0, B.jsxs)(p.G7, {
                              className: "address-picker-header--content",
                              children: [
                                (0, B.jsx)(p.xv, {
                                  className:
                                    "address-picker-header--content-text text-nowrap",
                                  children:
                                    null === (a = ee.info) || void 0 === a
                                      ? void 0
                                      : a.templateName,
                                }),
                                (0, B.jsx)(p.xv, {
                                  children:
                                    null === (c = ee.info) || void 0 === c
                                      ? void 0
                                      : c.templateIntro,
                                }),
                              ],
                            }),
                        ],
                      })
                    );
                  },
                  open: ee.addressOpen,
                  onDefaultSelect: function (e) {
                    te(function (t) {
                      t.addressInfo = e;
                    });
                  },
                  onSelect: function (e) {
                    te(function (t) {
                      t.addressInfo = e;
                    });
                  },
                  onClose: function () {
                    te(function (e) {
                      e.addressOpen = !1;
                    });
                  },
                }),
                (0, B.jsx)(ae, {
                  open: Ze,
                  info:
                    null === (P = ee.info) || void 0 === P
                      ? void 0
                      : P.serviceInterestTagList,
                  onClose: function () {
                    te(function (e) {
                      e.serverOpen = !1;
                    });
                  },
                }),
                (0, B.jsx)(ye, {
                  ref: W,
                  open: ue,
                  type: we,
                  info: ie,
                  team_id: Le || Re,
                  group_id: Ye || Ee,
                  onClose: function () {
                    te(function (e) {
                      (e.skuPanelOpen = !1),
                        (e.skuTeamId = null),
                        (e.skuGroupId = null);
                    });
                  },
                  onChange: function (e, t) {
                    te(function (n) {
                      (n.skuText = e), (n.curItem = t);
                    });
                  },
                }),
                (0, B.jsx)(w.Z, {
                  open: pe,
                  title: Ve ? "图片分享至" : "商品分享至",
                  posterIsReady: Ve,
                  onSavePoster: function () {
                    H.current.saveToAlbum();
                  },
                  onClose: function () {
                    te(function (e) {
                      (e.sharePanelOpen = !1), (e.posterModalOpen = !1);
                    });
                  },
                  onCreatePoster: function () {
                    te(function (e) {
                      e.posterModalOpen = !0;
                    });
                  },
                  onShareEdit: function () {
                    wx.updateTimelineShareData({
                      title: "分享标题",
                      link: "/pages/index/index",
                      imageUrl: "/images/share.jpg",
                      success: function () {},
                      fail: function (e) {
                        console.error("设置朋友圈分享内容失败", e);
                      },
                    });
                  },
                }),
                fe &&
                  (0, B.jsx)(x.UU, {
                    ref: H,
                    info: ie,
                    type: "goodsDetial",
                    onReadyPosterChange: function (e) {
                      te(function (t) {
                        t.posterIsReady = e;
                      });
                    },
                    onClose: function () {
                      te(function (e) {
                        e.posterModalOpen = !1;
                      });
                    },
                  }),
                (0, B.jsx)(x.m9, {
                  mediaList: Ae,
                  current: Pe,
                  onClose: function () {
                    te(function (e) {
                      e.previewMediaOpen = !1;
                    });
                  },
                  open: Me,
                }),
              ],
            });
          };
          (Ie.enableShareTimeline = !0),
            (Ie.enableShareAppMessage = !0),
            Page(
              (0, i.createPageConfig)(
                Ie,
                "pages/item/espier-detail",
                { root: { cn: [] } },
                { navigationStyle: "custom" } || {}
              )
            );
        },
        1646: function (e) {
          e.exports = (function () {
            var e,
              t,
              n = 1e3,
              i = 6e4,
              s = 36e5,
              o = 864e5,
              r =
                /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
              a = 31536e6,
              c = 2628e6,
              l =
                /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,
              u = {
                years: a,
                months: c,
                days: o,
                hours: s,
                minutes: i,
                seconds: n,
                milliseconds: 1,
                weeks: 6048e5,
              },
              d = function (e) {
                return e instanceof x;
              },
              m = function (e, t, n) {
                return new x(e, n, t.$l);
              },
              p = function (e) {
                return t.p(e) + "s";
              },
              f = function (e) {
                return e < 0;
              },
              h = function (e) {
                return f(e) ? Math.ceil(e) : Math.floor(e);
              },
              v = function (e) {
                return Math.abs(e);
              },
              g = function (e, t) {
                return e
                  ? f(e)
                    ? { negative: !0, format: "" + v(e) + t }
                    : { negative: !1, format: "" + e + t }
                  : { negative: !1, format: "" };
              },
              x = (function () {
                function f(e, t, n) {
                  var i = this;
                  if (
                    ((this.$d = {}),
                    (this.$l = n),
                    void 0 === e &&
                      ((this.$ms = 0), this.parseFromMilliseconds()),
                    t)
                  )
                    return m(e * u[p(t)], this);
                  if ("number" == typeof e)
                    return (this.$ms = e), this.parseFromMilliseconds(), this;
                  if ("object" == typeof e)
                    return (
                      Object.keys(e).forEach(function (t) {
                        i.$d[p(t)] = e[t];
                      }),
                      this.calMilliseconds(),
                      this
                    );
                  if ("string" == typeof e) {
                    var s = e.match(l);
                    if (s) {
                      var o = s.slice(2).map(function (e) {
                        return null != e ? Number(e) : 0;
                      });
                      return (
                        (this.$d.years = o[0]),
                        (this.$d.months = o[1]),
                        (this.$d.weeks = o[2]),
                        (this.$d.days = o[3]),
                        (this.$d.hours = o[4]),
                        (this.$d.minutes = o[5]),
                        (this.$d.seconds = o[6]),
                        this.calMilliseconds(),
                        this
                      );
                    }
                  }
                  return this;
                }
                var v = f.prototype;
                return (
                  (v.calMilliseconds = function () {
                    var e = this;
                    this.$ms = Object.keys(this.$d).reduce(function (t, n) {
                      return t + (e.$d[n] || 0) * u[n];
                    }, 0);
                  }),
                  (v.parseFromMilliseconds = function () {
                    var e = this.$ms;
                    (this.$d.years = h(e / a)),
                      (e %= a),
                      (this.$d.months = h(e / c)),
                      (e %= c),
                      (this.$d.days = h(e / o)),
                      (e %= o),
                      (this.$d.hours = h(e / s)),
                      (e %= s),
                      (this.$d.minutes = h(e / i)),
                      (e %= i),
                      (this.$d.seconds = h(e / n)),
                      (e %= n),
                      (this.$d.milliseconds = e);
                  }),
                  (v.toISOString = function () {
                    var e = g(this.$d.years, "Y"),
                      t = g(this.$d.months, "M"),
                      n = +this.$d.days || 0;
                    this.$d.weeks && (n += 7 * this.$d.weeks);
                    var i = g(n, "D"),
                      s = g(this.$d.hours, "H"),
                      o = g(this.$d.minutes, "M"),
                      r = this.$d.seconds || 0;
                    this.$d.milliseconds &&
                      ((r += this.$d.milliseconds / 1e3),
                      (r = Math.round(1e3 * r) / 1e3));
                    var a = g(r, "S"),
                      c =
                        e.negative ||
                        t.negative ||
                        i.negative ||
                        s.negative ||
                        o.negative ||
                        a.negative,
                      l = s.format || o.format || a.format ? "T" : "",
                      u =
                        (c ? "-" : "") +
                        "P" +
                        e.format +
                        t.format +
                        i.format +
                        l +
                        s.format +
                        o.format +
                        a.format;
                    return "P" === u || "-P" === u ? "P0D" : u;
                  }),
                  (v.toJSON = function () {
                    return this.toISOString();
                  }),
                  (v.format = function (e) {
                    var n = e || "YYYY-MM-DDTHH:mm:ss",
                      i = {
                        Y: this.$d.years,
                        YY: t.s(this.$d.years, 2, "0"),
                        YYYY: t.s(this.$d.years, 4, "0"),
                        M: this.$d.months,
                        MM: t.s(this.$d.months, 2, "0"),
                        D: this.$d.days,
                        DD: t.s(this.$d.days, 2, "0"),
                        H: this.$d.hours,
                        HH: t.s(this.$d.hours, 2, "0"),
                        m: this.$d.minutes,
                        mm: t.s(this.$d.minutes, 2, "0"),
                        s: this.$d.seconds,
                        ss: t.s(this.$d.seconds, 2, "0"),
                        SSS: t.s(this.$d.milliseconds, 3, "0"),
                      };
                    return n.replace(r, function (e, t) {
                      return t || String(i[e]);
                    });
                  }),
                  (v.as = function (e) {
                    return this.$ms / u[p(e)];
                  }),
                  (v.get = function (e) {
                    var t = this.$ms,
                      n = p(e);
                    return (
                      "milliseconds" === n
                        ? (t %= 1e3)
                        : (t = "weeks" === n ? h(t / u[n]) : this.$d[n]),
                      t || 0
                    );
                  }),
                  (v.add = function (e, t, n) {
                    var i;
                    return (
                      (i = t ? e * u[p(t)] : d(e) ? e.$ms : m(e, this).$ms),
                      m(this.$ms + i * (n ? -1 : 1), this)
                    );
                  }),
                  (v.subtract = function (e, t) {
                    return this.add(e, t, !0);
                  }),
                  (v.locale = function (e) {
                    var t = this.clone();
                    return (t.$l = e), t;
                  }),
                  (v.clone = function () {
                    return m(this.$ms, this);
                  }),
                  (v.humanize = function (t) {
                    return e().add(this.$ms, "ms").locale(this.$l).fromNow(!t);
                  }),
                  (v.valueOf = function () {
                    return this.asMilliseconds();
                  }),
                  (v.milliseconds = function () {
                    return this.get("milliseconds");
                  }),
                  (v.asMilliseconds = function () {
                    return this.as("milliseconds");
                  }),
                  (v.seconds = function () {
                    return this.get("seconds");
                  }),
                  (v.asSeconds = function () {
                    return this.as("seconds");
                  }),
                  (v.minutes = function () {
                    return this.get("minutes");
                  }),
                  (v.asMinutes = function () {
                    return this.as("minutes");
                  }),
                  (v.hours = function () {
                    return this.get("hours");
                  }),
                  (v.asHours = function () {
                    return this.as("hours");
                  }),
                  (v.days = function () {
                    return this.get("days");
                  }),
                  (v.asDays = function () {
                    return this.as("days");
                  }),
                  (v.weeks = function () {
                    return this.get("weeks");
                  }),
                  (v.asWeeks = function () {
                    return this.as("weeks");
                  }),
                  (v.months = function () {
                    return this.get("months");
                  }),
                  (v.asMonths = function () {
                    return this.as("months");
                  }),
                  (v.years = function () {
                    return this.get("years");
                  }),
                  (v.asYears = function () {
                    return this.as("years");
                  }),
                  f
                );
              })(),
              _ = function (e, t, n) {
                return e
                  .add(t.years() * n, "y")
                  .add(t.months() * n, "M")
                  .add(t.days() * n, "d")
                  .add(t.hours() * n, "h")
                  .add(t.minutes() * n, "m")
                  .add(t.seconds() * n, "s")
                  .add(t.milliseconds() * n, "ms");
              };
            return function (n, i, s) {
              (e = s),
                (t = s().$utils()),
                (s.duration = function (e, t) {
                  var n = s.locale();
                  return m(e, { $l: n }, t);
                }),
                (s.isDuration = d);
              var o = i.prototype.add,
                r = i.prototype.subtract;
              (i.prototype.add = function (e, t) {
                return d(e) ? _(this, e, 1) : o.bind(this)(e, t);
              }),
                (i.prototype.subtract = function (e, t) {
                  return d(e) ? _(this, e, -1) : r.bind(this)(e, t);
                });
            };
          })();
        },
        77412: function (e) {
          e.exports = function (e, t) {
            for (
              var n = -1, i = null == e ? 0 : e.length;
              ++n < i && !1 !== t(e[n], n, e);

            );
            return e;
          };
        },
        44037: function (e, t, n) {
          var i = n(98363),
            s = n(3674);
          e.exports = function (e, t) {
            return e && i(t, s(t), e);
          };
        },
        63886: function (e, t, n) {
          var i = n(98363),
            s = n(81704);
          e.exports = function (e, t) {
            return e && i(t, s(t), e);
          };
        },
        85990: function (e, t, n) {
          var i = n(46384),
            s = n(77412),
            o = n(34865),
            r = n(44037),
            a = n(63886),
            c = n(64626),
            l = n(278),
            u = n(18805),
            d = n(1911),
            m = n(58234),
            p = n(46904),
            f = n(64160),
            h = n(43824),
            v = n(29148),
            g = n(38517),
            x = n(1469),
            _ = n(44144),
            j = n(56688),
            b = n(13218),
            N = n(72928),
            y = n(3674),
            k = n(81704),
            G = "[object Arguments]",
            I = "[object Function]",
            w = "[object Object]",
            C = {};
          (C[G] =
            C["[object Array]"] =
            C["[object ArrayBuffer]"] =
            C["[object DataView]"] =
            C["[object Boolean]"] =
            C["[object Date]"] =
            C["[object Float32Array]"] =
            C["[object Float64Array]"] =
            C["[object Int8Array]"] =
            C["[object Int16Array]"] =
            C["[object Int32Array]"] =
            C["[object Map]"] =
            C["[object Number]"] =
            C[w] =
            C["[object RegExp]"] =
            C["[object Set]"] =
            C["[object String]"] =
            C["[object Symbol]"] =
            C["[object Uint8Array]"] =
            C["[object Uint8ClampedArray]"] =
            C["[object Uint16Array]"] =
            C["[object Uint32Array]"] =
              !0),
            (C["[object Error]"] = C[I] = C["[object WeakMap]"] = !1),
            (e.exports = function e(t, n, T, S, Z, F) {
              var O,
                A = 1 & n,
                P = 2 & n,
                M = 4 & n;
              if ((T && (O = Z ? T(t, S, Z, F) : T(t)), void 0 !== O)) return O;
              if (!b(t)) return t;
              var $ = x(t);
              if ($) {
                if (((O = h(t)), !A)) return l(t, O);
              } else {
                var D = f(t),
                  q = D == I || "[object GeneratorFunction]" == D;
                if (_(t)) return c(t, A);
                if (D == w || D == G || (q && !Z)) {
                  if (((O = P || q ? {} : g(t)), !A))
                    return P ? d(t, a(O, t)) : u(t, r(O, t));
                } else {
                  if (!C[D]) return Z ? t : {};
                  O = v(t, D, A);
                }
              }
              F || (F = new i());
              var R = F.get(t);
              if (R) return R;
              F.set(t, O),
                N(t)
                  ? t.forEach(function (i) {
                      O.add(e(i, n, T, i, t, F));
                    })
                  : j(t) &&
                    t.forEach(function (i, s) {
                      O.set(s, e(i, n, T, s, t, F));
                    });
              var E = $ ? void 0 : (M ? (P ? p : m) : P ? k : y)(t);
              return (
                s(E || t, function (i, s) {
                  E && (i = t[(s = i)]), o(O, s, e(i, n, T, s, t, F));
                }),
                O
              );
            });
        },
        3118: function (e, t, n) {
          var i = n(13218),
            s = Object.create,
            o = (function () {
              function e() {}
              return function (t) {
                if (!i(t)) return {};
                if (s) return s(t);
                e.prototype = t;
                var n = new e();
                return (e.prototype = void 0), n;
              };
            })();
          e.exports = o;
        },
        25588: function (e, t, n) {
          var i = n(64160),
            s = n(37005);
          e.exports = function (e) {
            return s(e) && "[object Map]" == i(e);
          };
        },
        29221: function (e, t, n) {
          var i = n(64160),
            s = n(37005);
          e.exports = function (e) {
            return s(e) && "[object Set]" == i(e);
          };
        },
        74318: function (e, t, n) {
          var i = n(11149);
          e.exports = function (e) {
            var t = new e.constructor(e.byteLength);
            return new i(t).set(new i(e)), t;
          };
        },
        64626: function (e, t, n) {
          e = n.nmd(e);
          var i = n(55639),
            s = t && !t.nodeType && t,
            o = s && e && !e.nodeType && e,
            r = o && o.exports === s ? i.Buffer : void 0,
            a = r ? r.allocUnsafe : void 0;
          e.exports = function (e, t) {
            if (t) return e.slice();
            var n = e.length,
              i = a ? a(n) : new e.constructor(n);
            return e.copy(i), i;
          };
        },
        57157: function (e, t, n) {
          var i = n(74318);
          e.exports = function (e, t) {
            var n = t ? i(e.buffer) : e.buffer;
            return new e.constructor(n, e.byteOffset, e.byteLength);
          };
        },
        93147: function (e) {
          var t = /\w*$/;
          e.exports = function (e) {
            var n = new e.constructor(e.source, t.exec(e));
            return (n.lastIndex = e.lastIndex), n;
          };
        },
        40419: function (e, t, n) {
          var i = n(62705),
            s = i ? i.prototype : void 0,
            o = s ? s.valueOf : void 0;
          e.exports = function (e) {
            return o ? Object(o.call(e)) : {};
          };
        },
        77133: function (e, t, n) {
          var i = n(74318);
          e.exports = function (e, t) {
            var n = t ? i(e.buffer) : e.buffer;
            return new e.constructor(n, e.byteOffset, e.length);
          };
        },
        278: function (e) {
          e.exports = function (e, t) {
            var n = -1,
              i = e.length;
            for (t || (t = Array(i)); ++n < i; ) t[n] = e[n];
            return t;
          };
        },
        98363: function (e, t, n) {
          var i = n(34865),
            s = n(89465);
          e.exports = function (e, t, n, o) {
            var r = !n;
            n || (n = {});
            for (var a = -1, c = t.length; ++a < c; ) {
              var l = t[a],
                u = o ? o(n[l], e[l], l, n, e) : void 0;
              void 0 === u && (u = e[l]), r ? s(n, l, u) : i(n, l, u);
            }
            return n;
          };
        },
        18805: function (e, t, n) {
          var i = n(98363),
            s = n(99551);
          e.exports = function (e, t) {
            return i(e, s(e), t);
          };
        },
        1911: function (e, t, n) {
          var i = n(98363),
            s = n(51442);
          e.exports = function (e, t) {
            return i(e, s(e), t);
          };
        },
        43824: function (e) {
          var t = Object.prototype.hasOwnProperty;
          e.exports = function (e) {
            var n = e.length,
              i = new e.constructor(n);
            return (
              n &&
                "string" == typeof e[0] &&
                t.call(e, "index") &&
                ((i.index = e.index), (i.input = e.input)),
              i
            );
          };
        },
        29148: function (e, t, n) {
          var i = n(74318),
            s = n(57157),
            o = n(93147),
            r = n(40419),
            a = n(77133);
          e.exports = function (e, t, n) {
            var c = e.constructor;
            switch (t) {
              case "[object ArrayBuffer]":
                return i(e);
              case "[object Boolean]":
              case "[object Date]":
                return new c(+e);
              case "[object DataView]":
                return s(e, n);
              case "[object Float32Array]":
              case "[object Float64Array]":
              case "[object Int8Array]":
              case "[object Int16Array]":
              case "[object Int32Array]":
              case "[object Uint8Array]":
              case "[object Uint8ClampedArray]":
              case "[object Uint16Array]":
              case "[object Uint32Array]":
                return a(e, n);
              case "[object Map]":
                return new c();
              case "[object Number]":
              case "[object String]":
                return new c(e);
              case "[object RegExp]":
                return o(e);
              case "[object Set]":
                return new c();
              case "[object Symbol]":
                return r(e);
            }
          };
        },
        38517: function (e, t, n) {
          var i = n(3118),
            s = n(85924),
            o = n(25726);
          e.exports = function (e) {
            return "function" != typeof e.constructor || o(e) ? {} : i(s(e));
          };
        },
        50361: function (e, t, n) {
          var i = n(85990);
          e.exports = function (e) {
            return i(e, 5);
          };
        },
        56688: function (e, t, n) {
          var i = n(25588),
            s = n(7518),
            o = n(31167),
            r = o && o.isMap,
            a = r ? s(r) : i;
          e.exports = a;
        },
        72928: function (e, t, n) {
          var i = n(29221),
            s = n(7518),
            o = n(31167),
            r = o && o.isSet,
            a = r ? s(r) : i;
          e.exports = a;
        },
      },
      function (e) {
        e.O(0, [7191, 796, 8535, 4160, 3145, 2107, 1216, 8592], function () {
          return (function (t) {
            return e((e.s = t));
          })(89127);
        }),
          e.O();
      },
    ]);
})();
