!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [5249],
    {
      35702: function (e, t, r) {
        var n = r(32180),
          a = r(74165),
          i = r(15861),
          o = r(4942),
          c = r(1413),
          s = r(29439),
          l = r(67294),
          u = r(71515),
          d = r(31707),
          f = r(90057),
          p = r(92954),
          m = r.n(p),
          h = r(93967),
          v = r.n(h),
          g = r(21066),
          _ = r(96856),
          x = r(1696),
          y = r(78061),
          k = r(37042),
          w = r(53553),
          b = r(17563),
          N = r(80459),
          j = r(54789),
          C = r(19210),
          Z = r(85893);
        var S = function (e) {
          var t = e.visible,
            r = e.goods,
            n = void 0 === r ? [] : r,
            a = e.onSubmit,
            i = e.onBack;
          if (!t) return null;
          var o = (n || []).map(j.WF);
          return (0, Z.jsxs)(u.G7, {
            className: "sp-delivery-modal",
            children: [
              (0, Z.jsx)(u.G7, { className: "sp-delivery-modal__mask" }),
              (0, Z.jsxs)(u.G7, {
                className:
                  "sp-delivery-modal__container sp-delivery-modal__container--cart",
                children: [
                  (0, Z.jsxs)(u.G7, {
                    className: "sp-delivery-modal__header",
                    children: [
                      (0, Z.jsx)(y.Ko, {
                        src: "fv_report_gmailerrorred.png",
                        className: "sp-delivery-modal__icon",
                        width: 48,
                        height: 48,
                      }),
                      (0, Z.jsx)(u.xv, {
                        className: "sp-delivery-modal__title",
                        children: "部分商品配送方式不同",
                      }),
                    ],
                  }),
                  (0, Z.jsx)(u.xv, {
                    className: "sp-delivery-modal__desc",
                    children: "已为您过滤以下不支持邮寄的商品\n请分批下单",
                  }),
                  (0, Z.jsx)(u.pf, {
                    className: "sp-delivery-modal__goods-scroll",
                    scrollY: !0,
                    children: (0, Z.jsx)(u.G7, {
                      className: "sp-delivery-modal__goods-panel",
                      children: o.map(function (e, t) {
                        return (0, Z.jsx)(C.Z, { info: e }, t);
                      }),
                    }),
                  }),
                  (0, Z.jsxs)(u.G7, {
                    className: "sp-delivery-modal__footer",
                    children: [
                      (0, Z.jsx)(u.G7, {
                        className:
                          "sp-delivery-modal__btn sp-delivery-modal__btn--back",
                        onClick: i,
                        children: "返回购物车",
                      }),
                      (0, Z.jsx)(u.G7, {
                        className:
                          "sp-delivery-modal__btn sp-delivery-modal__btn--express",
                        onClick: function () {
                          return a("logistics");
                        },
                        children: "邮寄商品结算",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        };
        var I = function (e) {
            var t = e.visible,
              r = e.onBack;
            return t
              ? (0, Z.jsxs)(u.G7, {
                  className: "sp-cart-cross-town-ziti-modal",
                  children: [
                    (0, Z.jsx)(u.G7, {
                      className: "sp-cart-cross-town-ziti-modal__mask",
                      onClick: r,
                    }),
                    (0, Z.jsxs)(u.G7, {
                      className: "sp-cart-cross-town-ziti-modal__container",
                      children: [
                        (0, Z.jsxs)(u.G7, {
                          className: "sp-cart-cross-town-ziti-modal__info",
                          children: [
                            (0, Z.jsxs)(u.G7, {
                              className:
                                "sp-cart-cross-town-ziti-modal__title-row",
                              children: [
                                (0, Z.jsx)(y.Ko, {
                                  src: "fv_report_gmailerrorred.png",
                                  className:
                                    "sp-cart-cross-town-ziti-modal__icon",
                                  width: 48,
                                  height: 48,
                                }),
                                (0, Z.jsx)(u.xv, {
                                  className:
                                    "sp-cart-cross-town-ziti-modal__title",
                                  children: "暂不支持跨小镇合并自提",
                                }),
                              ],
                            }),
                            (0, Z.jsx)(u.xv, {
                              className: "sp-cart-cross-town-ziti-modal__desc",
                              children:
                                "所选商品仅支持自提，且分属多个小镇自提点，暂不支持跨小镇合并自提。请返回购物车按小镇分别结算自提商品。",
                            }),
                          ],
                        }),
                        (0, Z.jsx)(u.G7, {
                          className: "sp-cart-cross-town-ziti-modal__btn",
                          onClick: r,
                          children: "返回购物车",
                        }),
                      ],
                    }),
                  ],
                })
              : null;
          },
          G = r(71002);
        var T = l.memo(function (e) {
          var t,
            r,
            n,
            o = e.info,
            c = e.isEditing,
            s = e.onCollectItem,
            f = e.onDeleteItem,
            p = e.onUpdateQuantity,
            h = e.onEditQuantity,
            v = e.specificCrowdTag,
            g = e.isShowAddInput,
            x = void 0 === g || g,
            w = e.isShowDeleteIcon,
            b = void 0 === w || w,
            N = e.allowClick,
            j = void 0 === N || N,
            C = (e.goodType, e.onFocus),
            S = e.regionauth_id,
            I = e.cartClick,
            G = void 0 === I ? function () {} : I,
            T = (0, d.I0)(),
            F = (0, d.v9)(function (e) {
              return e.regionauth;
            }).regionauthInfo,
            P = void 0 === F ? {} : F,
            E = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e(t) {
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (j) {
                            e.next = 2;
                            break;
                          }
                          return e.abrupt("return");
                        case 2:
                          if (!S) {
                            e.next = 6;
                            break;
                          }
                          return (
                            (0, _.KS)(S, P),
                            (e.next = 6),
                            T((0, k.tx)({ regionauth_id: S }))
                          );
                        case 6:
                          return (
                            (e.next = 8),
                            G({ ifProduct: "是", flowName: "进入商品详情" })
                          );
                        case 8:
                          m().navigateTo({
                            url: "/pages/item/espier-detail?id="
                              .concat(o.item_id, "&dtid=")
                              .concat(o.shop_id),
                          });
                        case 9:
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
            O = o.price,
            R = o.activity_price,
            A = o.member_price,
            M = o.package_price,
            L = o.promotion_price;
          n = isNaN(R)
            ? isNaN(L)
              ? isNaN(M)
                ? isNaN(A)
                  ? O
                  : A
                : M
              : L
            : R;
          var D,
            q,
            z,
            B = "";
          "limited_buy" ==
            (null == o || null === (t = o.limitedBuy) || void 0 === t
              ? void 0
              : t.marketing_type) &&
            ((B =
              null == o || null === (D = o.limitedBuy) || void 0 === D
                ? void 0
                : D.rule.limit),
            0 ==
            (null == o || null === (q = o.limitedBuy) || void 0 === q
              ? void 0
              : q.rule.day)
              ? "限购".concat(B, "件")
              : "每"
                  .concat(
                    null == o || null === (z = o.limitedBuy) || void 0 === z
                      ? void 0
                      : z.rule.day,
                    "天，限购"
                  )
                  .concat(B, "件"));
          var K = (0, l.useMemo)(
              function () {
                return b
                  ? [
                      {
                        text: "收藏",
                        style: {
                          backgroundColor: "#FF9500",
                          fontSize: "24rpx",
                        },
                        width: 108,
                        onClick: (function () {
                          var e = (0, i.Z)(
                            (0, a.Z)().mark(function e() {
                              return (0, a.Z)().wrap(function (e) {
                                for (;;)
                                  switch ((e.prev = e.next)) {
                                    case 0:
                                      return (
                                        (e.next = 2),
                                        G({
                                          ifProduct: "是",
                                          flowName: "收藏商品",
                                        })
                                      );
                                    case 2:
                                      s(o);
                                    case 3:
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
                      },
                      {
                        text: "删除",
                        style: {
                          backgroundColor: "#FF4949",
                          fontSize: "24rpx",
                        },
                        width: 108,
                        onClick: (function () {
                          var e = (0, i.Z)(
                            (0, a.Z)().mark(function e() {
                              return (0, a.Z)().wrap(function (e) {
                                for (;;)
                                  switch ((e.prev = e.next)) {
                                    case 0:
                                      return (
                                        (e.next = 2),
                                        G({
                                          ifProduct: "是",
                                          flowName: "删除商品",
                                        })
                                      );
                                    case 2:
                                      f(o);
                                    case 3:
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
                      },
                    ]
                  : [
                      {
                        text: "收藏",
                        style: { backgroundColor: "#FF9500" },
                        width: 108,
                        onClick: (function () {
                          var e = (0, i.Z)(
                            (0, a.Z)().mark(function e() {
                              return (0, a.Z)().wrap(function (e) {
                                for (;;)
                                  switch ((e.prev = e.next)) {
                                    case 0:
                                      return (
                                        (e.next = 2),
                                        G({
                                          ifProduct: "是",
                                          flowName: "收藏商品",
                                        })
                                      );
                                    case 2:
                                      s(o);
                                    case 3:
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
                      },
                    ];
              },
              [b]
            ),
            U = o.activity_info.some(function (e) {
              return "limited_time_sale" === e.type;
            }),
            V =
              null === (r = o.member_preference) || void 0 === r
                ? void 0
                : r.marketing_name,
            $ = o.activity_info.filter(function (e) {
              return !["limited_time_sale"].includes(e.type);
            });
          return (0, Z.jsx)(
            y.kK,
            {
              options: K,
              children: (0, Z.jsxs)(u.G7, {
                className: "page-cart__item no-border",
                children: [
                  (0, Z.jsx)(u.G7, {
                    className: "page-cart__item-checkbox",
                    children: (0, Z.jsx)(y.bM, {
                      value: o.cart_id,
                      disabled: 0 == o.is_valid,
                    }),
                  }),
                  (0, Z.jsx)(y.Ko, {
                    className: "page-cart__item-img",
                    onClick: function () {
                      return E("商品图片");
                    },
                    src: o.pics,
                    width: 164,
                    height: 164,
                    mode: "aspectFill",
                  }),
                  (0, Z.jsxs)(u.G7, {
                    className: "page-cart__item-content",
                    children: [
                      (0, Z.jsxs)(u.G7, {
                        className: "page-cart__item-name",
                        onClick: E,
                        children: [
                          U &&
                            (0, Z.jsx)(y.Ko, {
                              mode: "heightFix",
                              src: "fv_activity_seckill.png",
                              height: 32,
                            }),
                          V &&
                            (0, Z.jsx)(y.Ko, {
                              mode: "heightFix",
                              src: "fv_member_preference.png",
                              height: 32,
                            }),
                          (0, Z.jsx)(u.xv, {
                            className: "page-cart__item-name-text",
                            children: o.item_name,
                          }),
                        ],
                      }),
                      o.item_spec_desc &&
                        (0, Z.jsx)(u.G7, {
                          className: "page-cart__item-spec",
                          children: o.item_spec_desc,
                        }),
                      (0, Z.jsxs)(u.G7, {
                        className: "page-cart__item-tags",
                        children: [
                          v &&
                            !U &&
                            (0, Z.jsx)(y.$r, { label: v, type: "target" }),
                          null == $
                            ? void 0
                            : $.map(function (e, t) {
                                return (0,
                                Z.jsx)(y.$r, { label: e.promotion_tag, type: "primary" }, t);
                              }),
                        ],
                      }),
                      (0, Z.jsxs)(u.G7, {
                        className: "page-cart__item-bottom",
                        onClick: function (e) {
                          e.stopPropagation();
                        },
                        children: [
                          (0, Z.jsxs)(u.G7, {
                            className: "page-cart__item-price",
                            children: [
                              o.activity_price
                                ? (0, Z.jsxs)(u.G7, {
                                    className: "page-cart__item-seckill",
                                    children: [
                                      (0, Z.jsx)(u.xv, {
                                        className:
                                          "page-cart__item-promotion--text mr-4",
                                        children: "秒杀价",
                                      }),
                                      (0, Z.jsx)(y.qq, {
                                        unit: "cent",
                                        value: o.activity_price,
                                        primary: !0,
                                        size: 40,
                                        weight: 600,
                                        unitSize: 28,
                                      }),
                                    ],
                                  })
                                : o.promotion_price
                                ? (0, Z.jsxs)(u.G7, {
                                    className: "page-cart__item-promotion",
                                    children: [
                                      (0, Z.jsx)(u.xv, {
                                        className:
                                          "page-cart__item-promotion--text mr-4",
                                        children: "优惠价",
                                      }),
                                      (0, Z.jsx)(y.qq, {
                                        unit: "cent",
                                        value: o.promotion_price,
                                        primary: !0,
                                        size: 40,
                                        weight: 600,
                                      }),
                                    ],
                                  })
                                : (0, Z.jsx)(u.G7, {
                                    className: "page-cart__item-price-current",
                                    children:
                                      (null == o ? void 0 : o.estimated_price) >
                                        0 &&
                                      !o.promotion_price &&
                                      null != o &&
                                      o.is_checked
                                        ? (0, Z.jsx)(y.qq, {
                                            unit: "cent",
                                            color: " #1A1A1A",
                                            value: n,
                                            primary: !0,
                                            size: 40,
                                            weight: 600,
                                          })
                                        : (0, Z.jsx)(y.qq, {
                                            unit: "cent",
                                            value: n,
                                            primary: !0,
                                            size: 40,
                                            weight: 600,
                                          }),
                                  }),
                              Number(o.market_price) > Number(n) &&
                                (0, Z.jsx)(u.G7, {
                                  className: "page-cart__item-price-origin",
                                  children: (0, Z.jsx)(y.qq, {
                                    unit: "cent",
                                    value: o.market_price,
                                    size: 30,
                                    color: "#BFBFBF",
                                    lineThrough: !0,
                                  }),
                                }),
                            ],
                          }),
                          c && x
                            ? (0, Z.jsx)(u.G7, {
                                className: "page-cart__item-quantity-editor",
                                children: (0, Z.jsx)(y.xu, {
                                  value: o.num,
                                  onChange: (function () {
                                    var e = (0, i.Z)(
                                      (0, a.Z)().mark(function e(t) {
                                        return (0, a.Z)().wrap(function (e) {
                                          for (;;)
                                            switch ((e.prev = e.next)) {
                                              case 0:
                                                return (
                                                  (e.next = 2),
                                                  G({
                                                    ifProduct: "是",
                                                    flowName: "修改商品数量",
                                                  })
                                                );
                                              case 2:
                                                p(o.cart_id, t, o);
                                              case 3:
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
                                  max: o.store,
                                  onFocus: function () {
                                    return C && C();
                                  },
                                }),
                              })
                            : (0, Z.jsx)(u.G7, {
                                className: "page-cart__item-quantity",
                                onClick: (0, i.Z)(
                                  (0, a.Z)().mark(function e() {
                                    return (0, a.Z)().wrap(function (e) {
                                      for (;;)
                                        switch ((e.prev = e.next)) {
                                          case 0:
                                            return (
                                              (e.next = 2),
                                              G({
                                                ifProduct: "是",
                                                flowName: "编辑商品数量",
                                              })
                                            );
                                          case 2:
                                            h(o.cart_id);
                                          case 3:
                                          case "end":
                                            return e.stop();
                                        }
                                    }, e);
                                  })
                                ),
                                children: (0, Z.jsxs)(u.xv, {
                                  className: "page-cart__item-quantity-text",
                                  children: ["×", o.num],
                                }),
                              }),
                        ],
                      }),
                      (null == o ? void 0 : o.estimated_price) > 0 &&
                        !o.promotion_price &&
                        (null == o ? void 0 : o.is_checked) &&
                        (0, Z.jsxs)(u.G7, {
                          className: "page-cart__item-promotion",
                          children: [
                            (0, Z.jsx)(u.xv, {
                              className: "page-cart__item-estimated--text mr-4",
                              children: "满足活动后预估",
                            }),
                            (0, Z.jsx)(y.qq, {
                              unit: "cent",
                              unitSize: 30,
                              value: null == o ? void 0 : o.estimated_price,
                              primary: !0,
                              size: 30,
                              weight: 500,
                            }),
                          ],
                        }),
                      o.promotion_text &&
                        (0, Z.jsx)(u.G7, {
                          className: "page-cart__item-promotion",
                          children: (0, Z.jsx)(u.xv, {
                            className: "page-cart__item-promotion-text",
                            children: o.promotion_text,
                          }),
                        }),
                    ],
                  }),
                ],
              }),
            },
            o.cart_id + o.other_key
          );
        });
        var F = l.memo(
            function (e) {
              var t,
                r = e.shop,
                n = e.regionauthId,
                o = e.operatingTownVar,
                c = e.displayShopName,
                s = e.editingItemId,
                d = e.cartCheckedOverrides,
                f = e.getEffectiveCartChecked,
                p = e.onTrack,
                m = e.onShopCheck,
                h = e.onItemsChange,
                v = e.onNavigateStore,
                g = e.onNavigatePlusDetail,
                _ = e.onNavigatePlusCart,
                x = e.onAddMore,
                k = e.onCollectItem,
                w = e.onDeleteItem,
                b = e.onUpdateQuantity,
                N = e.onEditQuantity,
                j = e.onFocusQuantity,
                C = (r || {}).cus_plus_item_list,
                S = void 0 === C ? [] : C,
                I = (function (e) {
                  var t = null == e ? void 0 : e.specific_crowd;
                  if (null == t) return "";
                  if (Array.isArray(t)) {
                    var r = t.length;
                    if (0 === r) return "";
                    for (var n = 0; n < r; n++) {
                      var a = t[n];
                      if (null != a && "object" === (0, G.Z)(a)) {
                        var i = a.promotion_tag;
                        if (null != i && "" !== i) return String(i);
                      }
                    }
                    return "";
                  }
                  if ("object" !== (0, G.Z)(t)) return "";
                  var o = t.promotion_tag;
                  return null != o && "" !== o ? String(o) : "";
                })(r),
                F = function (e) {
                  return p({ flowName: e }, o);
                },
                P = (0, l.useMemo)(
                  function () {
                    return r.list.reduce(
                      function (e, t) {
                        var r = f(t, d);
                        return (
                          r && e.selectedItemIds.push(t.cart_id),
                          (e.allChecked = e.allChecked && r),
                          (e.allInvalid = e.allInvalid && 0 == t.is_valid),
                          e
                        );
                      },
                      { selectedItemIds: [], allChecked: !0, allInvalid: !0 }
                    );
                  },
                  [r.list, d, f]
                ),
                E = function (e) {
                  var t,
                    r = s === e.cart_id;
                  return (0, Z.jsxs)(
                    u.G7,
                    {
                      children: [
                        (0, Z.jsx)(T, {
                          regionauth_id: n,
                          info: e,
                          isEditing: r,
                          specificCrowdTag: I,
                          onCollectItem: function (e) {
                            return k(e, n);
                          },
                          onDeleteItem: function (e) {
                            return w(e, n);
                          },
                          onUpdateQuantity: function (e, t, r) {
                            return b(e, t, r, n);
                          },
                          onEditQuantity: N,
                          onFocus: j,
                          cartClick: function (e) {
                            return p(e, o);
                          },
                        }),
                        e.packages &&
                          (null === (t = e.packages) || void 0 === t
                            ? void 0
                            : t.map(function (e, t) {
                                return (0, Z.jsx)(
                                  u.G7,
                                  {
                                    className: "cart-item-wrap plus_items_bck",
                                    children: (0, Z.jsx)(T, {
                                      disabled: !0,
                                      regionauth_id: n,
                                      info: e,
                                      specificCrowdTag: I,
                                      goodType: "packages",
                                      isShowAddInput: !1,
                                      isShowDeleteIcon: !1,
                                      cartClick: function (e) {
                                        return p(e, o);
                                      },
                                    }),
                                  },
                                  t
                                );
                              })),
                      ],
                    },
                    e.cart_id
                  );
                };
              return (0, Z.jsxs)(
                u.G7,
                {
                  className: "page-cart__shop-wrapper",
                  children: [
                    (0, Z.jsxs)(u.G7, {
                      className: "page-cart__shop",
                      children: [
                        (0, Z.jsx)(y.bM, {
                          checked: P.allChecked,
                          onChange: (function () {
                            var e = (0, i.Z)(
                              (0, a.Z)().mark(function e(t) {
                                return (0, a.Z)().wrap(function (e) {
                                  for (;;)
                                    switch ((e.prev = e.next)) {
                                      case 0:
                                        return (
                                          (e.next = 2),
                                          F(
                                            t
                                              ? "勾选店铺下商品"
                                              : "取消勾选店铺下商品"
                                          )
                                        );
                                      case 2:
                                        m(r, t, n);
                                      case 3:
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
                          disabled: P.allInvalid,
                        }),
                        (0, Z.jsxs)(u.G7, {
                          className: "page-cart__shop-info",
                          children: [
                            (0, Z.jsx)(y.Ko, {
                              src: "fv_store.png",
                              width: 32,
                              height: 32,
                            }),
                            (0, Z.jsx)(u.xv, {
                              className: "page-cart__shop-name",
                              onClick: (0, i.Z)(
                                (0, a.Z)().mark(function e() {
                                  return (0, a.Z)().wrap(function (e) {
                                    for (;;)
                                      switch ((e.prev = e.next)) {
                                        case 0:
                                          return (e.next = 2), F("进入店铺");
                                        case 2:
                                          v(r.shop_id, n);
                                        case 3:
                                        case "end":
                                          return e.stop();
                                      }
                                  }, e);
                                })
                              ),
                              children: c || r.shop_name,
                            }),
                            (0, Z.jsx)(y.Ko, {
                              src: "fv_cart-chevron_right.png",
                              width: 40,
                              height: 40,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, Z.jsx)(y.Mv, {
                      value: P.selectedItemIds,
                      onChange: (function () {
                        var e = (0, i.Z)(
                          (0, a.Z)().mark(function e(t) {
                            return (0, a.Z)().wrap(function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    return (e.next = 2), h(r, t, n, o);
                                  case 2:
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
                      children: (0, Z.jsx)(Z.Fragment, {
                        children: (0, Z.jsx)(u.G7, {
                          className: "page-cart__shop-goods",
                          children:
                            null == S
                              ? void 0
                              : S.map(function (e, t) {
                                  var r = e.discount_desc,
                                    c = e.activity_id,
                                    s = e.cus_general_goods_list,
                                    l = e.cus_plus_exchange_item_list;
                                  return (0, Z.jsxs)(
                                    u.G7,
                                    {
                                      children: [
                                        r &&
                                          (0, Z.jsx)(
                                            u.G7,
                                            {
                                              className: "shop-cart-activity",
                                              children: (0, Z.jsxs)(u.G7, {
                                                className:
                                                  "shop-cart-activity-item",
                                                children: [
                                                  (0, Z.jsxs)(u.G7, {
                                                    className:
                                                      "shop-cart-activity-item-left",
                                                    onClick: (0, i.Z)(
                                                      (0, a.Z)().mark(
                                                        function e() {
                                                          return (0,
                                                          a.Z)().wrap(function (
                                                            e
                                                          ) {
                                                            for (;;)
                                                              switch (
                                                                (e.prev =
                                                                  e.next)
                                                              ) {
                                                                case 0:
                                                                  return (
                                                                    (e.next = 2),
                                                                    F("换购")
                                                                  );
                                                                case 2:
                                                                  g(c, n);
                                                                case 3:
                                                                case "end":
                                                                  return e.stop();
                                                              }
                                                          },
                                                          e);
                                                        }
                                                      )
                                                    ),
                                                    children: [
                                                      (0, Z.jsx)(u.xv, {
                                                        className:
                                                          "shop-cart-activity-label",
                                                        children: "换购",
                                                      }),
                                                      (0, Z.jsx)(u.xv, {
                                                        children: r.info,
                                                      }),
                                                    ],
                                                  }),
                                                  (0, Z.jsxs)(u.G7, {
                                                    className:
                                                      "shop-cart-activity-item-right",
                                                    onClick: (0, i.Z)(
                                                      (0, a.Z)().mark(
                                                        function e() {
                                                          return (0,
                                                          a.Z)().wrap(function (
                                                            e
                                                          ) {
                                                            for (;;)
                                                              switch (
                                                                (e.prev =
                                                                  e.next)
                                                              ) {
                                                                case 0:
                                                                  return (
                                                                    (e.next = 2),
                                                                    F("凑单")
                                                                  );
                                                                case 2:
                                                                  _(c, n);
                                                                case 3:
                                                                case "end":
                                                                  return e.stop();
                                                              }
                                                          },
                                                          e);
                                                        }
                                                      )
                                                    ),
                                                    children: [
                                                      "去选择",
                                                      (0, Z.jsx)(u.xv, {
                                                        className:
                                                          "at-icon at-icon-chevron-right",
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            },
                                            c
                                          ),
                                        null == s
                                          ? void 0
                                          : s.map(function (e) {
                                              return E(e);
                                            }),
                                        l &&
                                          (0, Z.jsx)(u.G7, {
                                            className:
                                              "cart-item-wrap plus_items_bck",
                                            children: (0, Z.jsx)(T, {
                                              disabled: !0,
                                              regionauth_id: n,
                                              specificCrowdTag: I,
                                              info: l,
                                              isShowAddInput: !1,
                                              isShowDeleteIcon: !1,
                                              cartClick: function (e) {
                                                return p(e, o);
                                              },
                                            }),
                                          }),
                                      ],
                                    },
                                    c || t
                                  );
                                }),
                        }),
                      }),
                    }),
                    r.promotions &&
                      r.promotions.length > 0 &&
                      (0, Z.jsx)(u.G7, {
                        className: "page-cart__promotions",
                        children:
                          null === (t = r.promotions) || void 0 === t
                            ? void 0
                            : t.map(function (e, t) {
                                return (0, Z.jsxs)(
                                  u.G7,
                                  {
                                    className: "page-cart__promotion-item",
                                    children: [
                                      (0, Z.jsxs)(u.G7, {
                                        className: "page-cart__promotion-info",
                                        children: [
                                          (0, Z.jsx)(u.G7, {
                                            className:
                                              "page-cart__promotion-tag-wrapper",
                                            children: e.activity_name,
                                          }),
                                          (0, Z.jsx)(u.G7, {
                                            className:
                                              "page-cart__promotion-desc",
                                            children: e.fill_discount_info,
                                          }),
                                        ],
                                      }),
                                      (0, Z.jsxs)(u.G7, {
                                        className: "page-cart__promotion-btn",
                                        onClick: (0, i.Z)(
                                          (0, a.Z)().mark(function t() {
                                            return (0, a.Z)().wrap(function (
                                              t
                                            ) {
                                              for (;;)
                                                switch ((t.prev = t.next)) {
                                                  case 0:
                                                    return (
                                                      (t.next = 2), F("凑单")
                                                    );
                                                  case 2:
                                                    x(
                                                      r.shop_id,
                                                      e.activity_id,
                                                      n
                                                    );
                                                  case 3:
                                                  case "end":
                                                    return t.stop();
                                                }
                                            },
                                            t);
                                          })
                                        ),
                                        children: [
                                          "去凑单",
                                          (0, Z.jsx)(u.xv, {
                                            className:
                                              "page-cart__promotion-arrow iconfont icon-arrowRight",
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  t
                                );
                              }),
                      }),
                  ],
                },
                "".concat(n, "_").concat(r.shop_id)
              );
            },
            function (e, t) {
              var r = e.shop !== t.shop,
                n = e.editingItemId !== t.editingItemId,
                a =
                  e.displayShopName !== t.displayShopName ||
                  e.operatingTownVar !== t.operatingTownVar,
                i = (function (e) {
                  var t =
                      arguments.length > 1 && void 0 !== arguments[1]
                        ? arguments[1]
                        : {},
                    r =
                      arguments.length > 2 && void 0 !== arguments[2]
                        ? arguments[2]
                        : {};
                  return e.list.some(function (e) {
                    return t[e.cart_id] !== r[e.cart_id];
                  });
                })(e.shop, e.cartCheckedOverrides, t.cartCheckedOverrides);
              return !(r || n || a || i);
            }
          ),
          P = r(89640);
        function E(e) {
          return null != e && "" !== e;
        }
        function O() {
          var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          return {
            cart_total_num: e.reduce(function (e, t) {
              return e + (Number(t.num) || 0);
            }, 0),
            total_fee: e.reduce(function (e, t) {
              return e + (Number(t.total_fee) || 0);
            }, 0),
            discount_fee: e.reduce(function (e, t) {
              return e + (Number(t.discount_fee) || 0);
            }, 0),
            promotion_discount: e.reduce(function (e, t) {
              return e + (Number(t.promotion_discount) || 0);
            }, 0),
          };
        }
        function R() {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : [],
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : [],
            r = {},
            n = function (e) {
              var t = String(e);
              return (
                r[t] ||
                  (r[t] = {
                    validCart: [],
                    invalidCart: [],
                    totalSummary: {},
                    specific_crowd: {},
                  }),
                r[t]
              );
            };
          return (
            e.forEach(function (e) {
              var t = {};
              (e.list || []).forEach(function (e) {
                var r = null == e ? void 0 : e.regionauth_id;
                if (E(r)) {
                  var n = String(r);
                  t[n] || (t[n] = []), t[n].push(e);
                }
              }),
                Object.entries(t).forEach(function (t) {
                  var r = (0, s.Z)(t, 2),
                    a = r[0],
                    i = r[1],
                    o = n(a),
                    l = O(i);
                  o.validCart.push(
                    (0, c.Z)((0, c.Z)({}, e), {}, { list: i }, l)
                  );
                });
            }),
            t.forEach(function (e) {
              var t = null == e ? void 0 : e.regionauth_id;
              E(t) && n(t).invalidCart.push(e);
            }),
            Object.entries(r).forEach(function (e) {
              var t,
                r = (0, s.Z)(e, 2),
                n = (r[0], r[1]);
              (n.totalSummary = {
                cart_total_num: n.validCart.reduce(function (e, t) {
                  return e + (Number(t.cart_total_num) || 0);
                }, 0),
                total_fee: n.validCart.reduce(function (e, t) {
                  return e + (Number(t.total_fee) || 0);
                }, 0),
                discount_fee: n.validCart.reduce(function (e, t) {
                  return e + (Number(t.discount_fee) || 0);
                }, 0),
                promotion_discount: n.validCart.reduce(function (e, t) {
                  return e + (Number(t.promotion_discount) || 0);
                }, 0),
              }),
                (n.specific_crowd =
                  (null ===
                    (t = n.validCart.find(function (e) {
                      return e.specific_crowd;
                    })) || void 0 === t
                    ? void 0
                    : t.specific_crowd) || {});
            }),
            r
          );
        }
        var A = r(99155),
          M = r(93433),
          L = r(48644),
          D = r(66476);
        function q() {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "";
          return String(t)
            .split(".")
            .reduce(function (e, t) {
              return null == e ? e : e[t];
            }, e);
        }
        function z() {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {};
          return Object.keys(t).reduce(function (r, n) {
            var a = t[n];
            return (
              (r[n] =
                "string" == typeof a
                  ? q(e, a)
                  : "function" == typeof a
                  ? a(e)
                  : a),
              r
            );
          }, {});
        }
        function B() {
          var e,
            t =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {};
          return (
            t.regionauth_id ||
            (null === (e = t.list) ||
            void 0 === e ||
            null ===
              (e = e.find(function (e) {
                return null == e ? void 0 : e.regionauth_id;
              })) ||
            void 0 === e
              ? void 0
              : e.regionauth_id) ||
            ""
          );
        }
        function K() {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : [],
            t = arguments.length > 1 ? arguments[1] : void 0;
          return (
            e.find(function (e) {
              return String(e.regionauth_id) === String(t);
            }) || {}
          );
        }
        function U() {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            t = Array.isArray(e.list) ? e.list : [],
            r = new Set(),
            n = (e.plus_buy_activity || []).map(function (e) {
              var n = e.plus_item,
                a = e.activity_item_ids,
                i = void 0 === a ? [] : a,
                o = e.activity_id,
                s = new Set(
                  i.map(function (e) {
                    return String(e);
                  })
                );
              return (
                s.forEach(function (e) {
                  return r.add(e);
                }),
                (0, c.Z)(
                  (0, c.Z)({}, e),
                  {},
                  {
                    cus_general_goods_list: t.filter(function (e) {
                      return s.has(String(e.item_id));
                    }),
                    cus_plus_exchange_item_list: n
                      ? z(
                          n,
                          (0, c.Z)(
                            (0, c.Z)({}, D.PLUS_BUY_ITEM),
                            {},
                            { activity_id: o }
                          )
                        )
                      : null,
                  }
                )
              );
            });
          return [].concat((0, M.Z)(n), [
            {
              discount_desc: null,
              cus_general_goods_list: t.filter(function (e) {
                return !r.has(String(e.item_id));
              }),
              cus_plus_exchange_item_list: null,
            },
          ]);
        }
        function V() {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : [],
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : [],
            r =
              arguments.length > 2 && void 0 !== arguments[2]
                ? arguments[2]
                : null;
          return (e || []).reduce(function (e, n, a) {
            var i,
              o = Array.isArray(null == n ? void 0 : n.list) ? n.list : [],
              s = r
                ? o.filter(function (e) {
                    return String(e.regionauth_id) === String(r);
                  })
                : o;
            if (!s.length) return e;
            var l = String(
                (null === (i = s[0]) || void 0 === i
                  ? void 0
                  : i.regionauth_id) || B(n)
              ),
              u = K(t, l),
              d = (0, L.X)(u.regionauth_name || u.name || "", n.shop_name);
            return (
              e.push({
                key: "".concat(l, "_").concat(n.shop_id, "_").concat(a),
                regionauth_id: l,
                operatingTown_var: u.regionauth_code || "",
                displayShopName: d,
                shop: (0, c.Z)(
                  (0, c.Z)({}, n),
                  {},
                  {
                    list: s,
                    promotions: n.fill_discount_infos || n.promotions || [],
                    cus_plus_item_list: U(
                      (0, c.Z)((0, c.Z)({}, n), {}, { list: s })
                    ),
                  }
                ),
              }),
              e
            );
          }, []);
        }
        var $ = {
          loading: !1,
          isAllSelected: !1,
          editingItemId: null,
          isManage: !1,
          deliveryModalVisible: !1,
          menuWidth: 0,
          showOverflow: !1,
          loadingNum: !1,
          selectedIds: [],
          item_ids: [],
          curRegidIndex: null,
          allRegionCartData: {},
          allCartTotalSummary: {},
          validCartList: [],
          invalidCartList: [],
          activeRegionauth_id: null,
          showBackToTop: !1,
          scrollPosition: void 0,
          deliveryModalRegionId: null,
          crossTownZitiModalVisible: !1,
          cartSelectPending: !1,
          cartCheckedOverrides: {},
        };
        function Q(e) {
          var t = (0, l.useRef)(e);
          return (
            (0, l.useEffect)(
              function () {
                t.current = e;
              },
              [e]
            ),
            (0, l.useCallback)(function () {
              return t.current.apply(t, arguments);
            }, [])
          );
        }
        var W = function () {
          var e = (0, d.I0)(),
            t = (0, d.v9)(function (e) {
              return e.regionauth;
            }).regionauthInfo,
            r = void 0 === t ? {} : t,
            n = (0, d.v9)(function (e) {
              return e.live;
            }).liveInfo,
            h = void 0 === n ? {} : n,
            C = (0, d.v9)(function (e) {
              return e.cart;
            }),
            G = C.cartCount,
            T = void 0 === G ? 0 : G,
            O = C.cartTabList,
            M = void 0 === O ? [] : O,
            L = (0, d.v9)(function (e) {
              return e.member;
            }).token,
            D = (0, f.x)($),
            q = (0, s.Z)(D, 2),
            z = q[0],
            B = q[1],
            K = (0, l.useRef)(null),
            U = (0, l.useRef)(!1),
            W = (0, l.useRef)(!0),
            Y = (0, l.useRef)(0),
            J = (0, l.useRef)({}),
            X = (0, l.useRef)({}),
            H = (0, l.useRef)(0),
            ee = (0, l.useRef)(0),
            te = z.loading,
            re = z.isAllSelected,
            ne = z.editingItemId,
            ae = z.isManage,
            ie = z.deliveryModalVisible,
            oe = z.crossTownZitiModalVisible,
            ce = z.curRegidIndex,
            se = z.cartSelectPending,
            le = z.cartCheckedOverrides,
            ue = z.validCartList,
            de = z.invalidCartList,
            fe = z.allCartTotalSummary,
            pe = function () {
              (Y.current += 1),
                1 === Y.current &&
                  B(function (e) {
                    e.cartSelectPending = !0;
                  });
            },
            me = function () {
              (Y.current = Math.max(0, Y.current - 1)),
                0 === Y.current &&
                  B(function (e) {
                    e.cartSelectPending = !1;
                  });
            },
            he = function () {
              return E(ce) ? ce : null;
            },
            ve = function () {
              return (ee.current += 1), ee.current;
            },
            ge = function (e) {
              return e === ee.current;
            },
            _e = function (e) {
              var t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : J.current;
              return (
                !!e &&
                (Object.prototype.hasOwnProperty.call(t, e.cart_id)
                  ? t[e.cart_id]
                  : e.is_checked)
              );
            },
            xe = function (e, t) {
              var r = (function (e) {
                return Array.isArray(e)
                  ? e.filter(function (e) {
                      return null != e && "" !== e;
                    })
                  : null != e && "" !== e
                  ? [e]
                  : [];
              })(e);
              if (!r.length) return null;
              var n = H.current + 1;
              H.current = n;
              var a = (0, c.Z)({}, J.current);
              return (
                r.forEach(function (e) {
                  (a[e] = t), (X.current[e] = n);
                }),
                (J.current = a),
                B(function (e) {
                  e.cartCheckedOverrides = a;
                }),
                { cartIds: r, version: n }
              );
            },
            ye = function (e) {
              var t;
              if (
                null != e &&
                null !== (t = e.cartIds) &&
                void 0 !== t &&
                t.length
              ) {
                var r = (0, c.Z)({}, J.current);
                e.cartIds.forEach(function (t) {
                  X.current[t] === e.version &&
                    (delete r[t], delete X.current[t]);
                }),
                  (J.current = r),
                  B(function (e) {
                    e.cartCheckedOverrides = r;
                  });
              }
            },
            ke = (0, l.useMemo)(
              function () {
                if (ce) {
                  var e = String(ce),
                    t =
                      z.allRegionCartData[e] ||
                      z.allRegionCartData[ce] ||
                      z.allRegionCartData[Number(ce)];
                  return t
                    ? (0, o.Z)({}, e, t)
                    : (0, o.Z)({}, e, {
                        validCart: [],
                        invalidCart: [],
                        totalSummary: {},
                        specific_crowd: {},
                      });
                }
                var r = {};
                return (
                  Object.keys(z.allRegionCartData).forEach(function (e) {
                    "undefined" !== e &&
                      void 0 !== e &&
                      "null" !== e &&
                      null !== e &&
                      (r[e] = z.allRegionCartData[e]);
                  }),
                  r
                );
              },
              [ce, z.allRegionCartData]
            ),
            we = (0, l.useMemo)(
              function () {
                var e = [],
                  t = [],
                  r = [],
                  n = [],
                  a = new Set();
                return (
                  Object.values(ke).forEach(function (i) {
                    i &&
                      i.validCart &&
                      i.validCart.forEach(function (i) {
                        i.list &&
                          i.list.forEach(function (o) {
                            var s = _e(o, le);
                            e.push(o),
                              s &&
                                (t.push(
                                  (0, c.Z)(
                                    (0, c.Z)({}, o),
                                    {},
                                    { is_checked: s }
                                  )
                                ),
                                r.push(o.cart_id),
                                n.push(o.item_id),
                                a.add(i.shop_id));
                          });
                      });
                  }),
                  {
                    allGoods: e,
                    checkedGoods: t,
                    selectedIds: r,
                    itemIds: n,
                    checkedShopIds: a,
                    isAllSelected:
                      e.length > 0 &&
                      e.every(function (e) {
                        return _e(e, le);
                      }),
                  }
                );
              },
              [ke, le]
            ),
            be = we.allGoods,
            Ne = we.checkedGoods,
            je = we.checkedShopIds,
            Ce = we.isAllSelected,
            Ze = (0, l.useMemo)(
              function () {
                return (
                  (ce &&
                    M.find(function (e) {
                      return e.regionauth_id == ce;
                    })) ||
                  null
                );
              },
              [M, ce]
            );
          (0, p.useDidShow)(function () {
            W.current
              ? (W.current = !1)
              : (Ee(!0, ce),
                m().nextTick(function () {
                  K.current && K.current.pageLock();
                }));
          }),
            (0, l.useEffect)(function () {
              B(function (e) {
                e.loading = !0;
              });
            }, []),
            (0, l.useEffect)(
              function () {
                L && e((0, k.c3)({ noRegionauth: !0 }));
              },
              [L]
            ),
            (0, l.useEffect)(
              function () {
                L &&
                  B(function (e) {
                    (e.isAllSelected = Ce),
                      (e.selectedIds = we.selectedIds),
                      (e.item_ids = we.itemIds);
                  });
              },
              [we, Ce, L]
            );
          var Se = function () {
              var e =
                  arguments.length > 0 && void 0 !== arguments[0]
                    ? arguments[0]
                    : {},
                t = Ne,
                r = new Set(
                  t
                    .map(function (e) {
                      return e.regionauth_id;
                    })
                    .filter(function (e) {
                      return null != e && "" !== e;
                    })
                ),
                n = (0, c.Z)(
                  {
                    cart_type: "cart",
                    shop_id: Array.from(je).join(","),
                    goodType: "normal",
                  },
                  e
                );
              return (!ce || r.size > 1) && (n.noRegionauth = 1), n;
            },
            Ie = function (e) {
              ce && (0, _.KS)(ce, r),
                m().navigateTo({
                  url: "/subpages/cart/espier-checkout?".concat(b.stringify(e)),
                });
            },
            Ge = function (e) {
              var t =
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : {},
                r = (0, j.vR)(e, t);
              return !(
                r.blocked &&
                ("empty" === r.reason
                  ? (m().showToast({ title: r.message, icon: "none" }), 1)
                  : "delivery_conflict" === r.reason
                  ? (B(function (e) {
                      (e.deliveryModalVisible = !0),
                        (e.deliveryModalRegionId = ce);
                    }),
                    1)
                  : "cross_town_ziti" !== r.reason ||
                    (B(function (e) {
                      e.crossTownZitiModalVisible = !0;
                    }),
                    1))
              );
            },
            Te = (0, g.Nr)(
              (function () {
                var t = (0, i.Z)(
                  (0, a.Z)().mark(function t(r, n, i, o) {
                    var c, s;
                    return (0, a.Z)().wrap(
                      function (t) {
                        for (;;)
                          switch ((t.prev = t.next)) {
                            case 0:
                              if (((t.prev = 0), n)) {
                                t.next = 3;
                                break;
                              }
                              return t.abrupt("return");
                            case 3:
                              return (
                                B(function (e) {
                                  e.loadingNum = !0;
                                }),
                                (t.next = 6),
                                e(
                                  (0, k.IK)({
                                    cart_id: r,
                                    num: n,
                                    regionauth_id: o,
                                  })
                                )
                              );
                            case 6:
                              (c = t.sent),
                                (s = c.meta),
                                "fulfilled" == s.requestStatus
                                  ? Ee(!1, he())
                                  : Be(),
                                (t.next = 15);
                              break;
                            case 12:
                              (t.prev = 12),
                                (t.t0 = t.catch(0)),
                                m().showToast({
                                  title: t.t0.message || "修改数量失败",
                                  icon: "none",
                                });
                            case 15:
                              return (
                                (t.prev = 15),
                                B(function (e) {
                                  (e.showOverflow = !1), (e.loadingNum = !1);
                                }),
                                t.finish(15)
                              );
                            case 18:
                            case "end":
                              return t.stop();
                          }
                      },
                      t,
                      null,
                      [[0, 12, 15, 18]]
                    );
                  })
                );
                return function (e, r, n, a) {
                  return t.apply(this, arguments);
                };
              })(),
              200
            ),
            Fe = (function () {
              var t = (0, i.Z)(
                (0, a.Z)().mark(function t(r) {
                  var n, i, o, c, s, l, u;
                  return (0, a.Z)().wrap(function (t) {
                    for (;;)
                      switch ((t.prev = t.next)) {
                        case 0:
                          if (E(r)) {
                            t.next = 2;
                            break;
                          }
                          return t.abrupt("return", null);
                        case 2:
                          return (
                            (n = {
                              regionauth_id: r,
                              shop_type: "distributor",
                            }),
                            (t.next = 5),
                            e((0, k.As)(n))
                          );
                        case 5:
                          if ("fulfilled" !== (i = t.sent).meta.requestStatus) {
                            t.next = 9;
                            break;
                          }
                          return (
                            (o = i.payload),
                            (c = o.valid_cart),
                            (s = o.invalid_cart),
                            (l = o.total_summary),
                            (u = o.specific_crowd),
                            t.abrupt("return", {
                              regionauth_id: String(r),
                              validCart: c || [],
                              invalidCart: s || [],
                              totalSummary: l || {},
                              specific_crowd: u || {},
                            })
                          );
                        case 9:
                          return t.abrupt("return", {
                            regionauth_id: String(r),
                            validCart: [],
                            invalidCart: [],
                            totalSummary: {},
                            specific_crowd: {},
                          });
                        case 10:
                        case "end":
                          return t.stop();
                      }
                  }, t);
                })
              );
              return function (e) {
                return t.apply(this, arguments);
              };
            })(),
            Pe = (function () {
              var t = (0, i.Z)(
                (0, a.Z)().mark(function t(r) {
                  var n, i, o, c, s, l;
                  return (0, a.Z)().wrap(function (t) {
                    for (;;)
                      switch ((t.prev = t.next)) {
                        case 0:
                          return (
                            (t.next = 2),
                            e(
                              (0, k.As)({
                                noRegionauth: !0,
                                shop_type: "distributor",
                              })
                            )
                          );
                        case 2:
                          if ("fulfilled" !== (n = t.sent).meta.requestStatus) {
                            t.next = 10;
                            break;
                          }
                          if (
                            ((i = n.payload),
                            (o = i.valid_cart),
                            (c = i.invalid_cart),
                            (s = i.total_summary),
                            (l = R(o || [], c || [])),
                            ge(r))
                          ) {
                            t.next = 8;
                            break;
                          }
                          return t.abrupt("return", n.payload);
                        case 8:
                          return (
                            B(function (e) {
                              (e.allRegionCartData = l),
                                (e.allCartTotalSummary = s || {}),
                                (e.validCartList = o || []),
                                (e.invalidCartList = c || []),
                                (e.loading = !1);
                            }),
                            t.abrupt("return", n.payload)
                          );
                        case 10:
                          if (ge(r)) {
                            t.next = 12;
                            break;
                          }
                          return t.abrupt("return", null);
                        case 12:
                          return (
                            B(function (e) {
                              (e.allRegionCartData = {}),
                                (e.allCartTotalSummary = {}),
                                (e.validCartList = []),
                                (e.invalidCartList = []),
                                (e.loading = !1);
                            }),
                            t.abrupt("return", null)
                          );
                        case 14:
                        case "end":
                          return t.stop();
                      }
                  }, t);
                })
              );
              return function (e) {
                return t.apply(this, arguments);
              };
            })(),
            Ee = (function () {
              var t = (0, i.Z)(
                (0, a.Z)().mark(function t() {
                  var r,
                    n,
                    i,
                    s,
                    l,
                    u,
                    d,
                    f = arguments;
                  return (0, a.Z)().wrap(
                    function (t) {
                      for (;;)
                        switch ((t.prev = t.next)) {
                          case 0:
                            if (
                              ((r = f.length > 0 && void 0 !== f[0] && f[0]),
                              (n =
                                f.length > 1 && void 0 !== f[1] ? f[1] : null),
                              (i = f.length > 2 && void 0 !== f[2] ? f[2] : {}),
                              (s = i.refreshTabs),
                              (l = void 0 === s || s),
                              L)
                            ) {
                              t.next = 6;
                              break;
                            }
                            return t.abrupt("return");
                          case 6:
                            if (
                              ((u = ve()),
                              r &&
                                B(function (e) {
                                  e.loading = !0;
                                }),
                              !l)
                            ) {
                              t.next = 11;
                              break;
                            }
                            return (
                              (t.next = 11), e((0, k.c3)({ noRegionauth: !0 }))
                            );
                          case 11:
                            if (!ce) {
                              t.next = 16;
                              break;
                            }
                            return (
                              (t.next = 14), e((0, k.tx)({ regionauth_id: ce }))
                            );
                          case 14:
                            t.next = 18;
                            break;
                          case 16:
                            return (t.next = 18), e((0, k.tx)());
                          case 18:
                            if (((t.prev = 18), E(n))) {
                              t.next = 24;
                              break;
                            }
                            return (t.next = 22), Pe(u);
                          case 22:
                            t.next = 30;
                            break;
                          case 24:
                            return (t.next = 26), Fe(n);
                          case 26:
                            if (((d = t.sent), ge(u))) {
                              t.next = 29;
                              break;
                            }
                            return t.abrupt("return");
                          case 29:
                            d && d.regionauth_id
                              ? B(function (e) {
                                  (e.allRegionCartData = (0, c.Z)(
                                    (0, c.Z)({}, e.allRegionCartData),
                                    {},
                                    (0, o.Z)({}, d.regionauth_id, {
                                      validCart: d.validCart,
                                      invalidCart: d.invalidCart,
                                      totalSummary: d.totalSummary,
                                      specific_crowd: d.specific_crowd,
                                    })
                                  )),
                                    (e.validCartList = d.validCart || []),
                                    (e.invalidCartList = d.invalidCart || []),
                                    (e.loading = !1);
                                })
                              : B(function (e) {
                                  e.loading = !1;
                                });
                          case 30:
                            t.next = 38;
                            break;
                          case 32:
                            if (((t.prev = 32), (t.t0 = t.catch(18)), ge(u))) {
                              t.next = 36;
                              break;
                            }
                            return t.abrupt("return");
                          case 36:
                            B(function (e) {
                              e.loading = !1;
                            }),
                              m().showToast({
                                title: t.t0.message || "获取购物车失败",
                                icon: "none",
                              });
                          case 38:
                          case "end":
                            return t.stop();
                        }
                    },
                    t,
                    null,
                    [[18, 32]]
                  );
                })
              );
              return function () {
                return t.apply(this, arguments);
              };
            })(),
            Oe = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e(t, r, n, i) {
                  var o,
                    c,
                    s,
                    l,
                    u,
                    d,
                    f,
                    p,
                    h,
                    v,
                    g,
                    _,
                    y,
                    k,
                    w,
                    b,
                    N = arguments;
                  return (0, a.Z)().wrap(
                    function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              ((o =
                                N.length > 4 && void 0 !== N[4] ? N[4] : {}),
                              (c = o.refreshAfterSelect),
                              (s = void 0 === c || c),
                              (l = o.manageSelectPending),
                              (u = void 0 === l || l),
                              (d = o.persistCheckedOverride),
                              (f = void 0 !== d && d),
                              (p = o.skipCheckedOverride),
                              (h = void 0 !== p && p),
                              (v = null),
                              u && pe(),
                              m().showLoading({ title: "" }),
                              (e.prev = 5),
                              (g = { is_checked: n }),
                              "all" !== r)
                            ) {
                              e.next = 16;
                              break;
                            }
                            if (
                              ((_ = []),
                              Object.values(ke).forEach(function (e) {
                                e &&
                                  e.validCart &&
                                  e.validCart.forEach(function (e) {
                                    e.list &&
                                      e.list.length > 0 &&
                                      e.list.forEach(function (e) {
                                        0 != e.is_valid && _.push(e.cart_id);
                                      });
                                  });
                              }),
                              !(_.length <= 0))
                            ) {
                              e.next = 13;
                              break;
                            }
                            return (
                              m().hideLoading(),
                              e.abrupt(
                                "return",
                                m().showToast({
                                  title: "暂无商品可以选择",
                                  icon: "none",
                                })
                              )
                            );
                          case 13:
                            (g.cart_id = _), (e.next = 30);
                            break;
                          case 16:
                            if ("region" !== r) {
                              e.next = 29;
                              break;
                            }
                            if ((y = ke[i]) && y.validCart) {
                              e.next = 21;
                              break;
                            }
                            return m().hideLoading(), e.abrupt("return");
                          case 21:
                            if (
                              ((k = []),
                              y.validCart.forEach(function (e) {
                                e.list &&
                                  e.list.length > 0 &&
                                  e.list.forEach(function (e) {
                                    0 != e.is_valid && k.push(e.cart_id);
                                  });
                              }),
                              !(k.length <= 0))
                            ) {
                              e.next = 26;
                              break;
                            }
                            return (
                              m().hideLoading(),
                              e.abrupt(
                                "return",
                                m().showToast({
                                  title: "暂无商品可以选择",
                                  icon: "none",
                                })
                              )
                            );
                          case 26:
                            (g.cart_id = k), (e.next = 30);
                            break;
                          case 29:
                            "shop" === r
                              ? ((b =
                                  null === (w = t.list) || void 0 === w
                                    ? void 0
                                    : w
                                        .filter(function (e) {
                                          return 0 != e.is_valid;
                                        })
                                        .map(function (e) {
                                          return e.cart_id;
                                        })),
                                (g.cart_id = b))
                              : "item" === r && (g.cart_id = t.cart_id);
                          case 30:
                            if (
                              (E(i)
                                ? (g.regionauth_id = i)
                                : (g.noRegionauth = !0),
                              !(g.cart_id.length <= 0))
                            ) {
                              e.next = 34;
                              break;
                            }
                            return m().hideLoading(), e.abrupt("return");
                          case 34:
                            return (
                              h || (v = xe(g.cart_id, n)),
                              (e.next = 37),
                              x.Z.cart.select(g)
                            );
                          case 37:
                            if (!s) {
                              e.next = 40;
                              break;
                            }
                            return (
                              (e.next = 40), Ee(!1, he(), { refreshTabs: !1 })
                            );
                          case 40:
                            m().hideLoading(), (e.next = 46);
                            break;
                          case 43:
                            (e.prev = 43),
                              (e.t0 = e.catch(5)),
                              m().showToast({
                                title: e.t0.message || "操作失败",
                                icon: "none",
                              });
                          case 46:
                            return (
                              (e.prev = 46),
                              m().hideLoading(),
                              f || ye(v),
                              u && me(),
                              e.finish(46)
                            );
                          case 51:
                            return e.abrupt("return", v);
                          case 52:
                          case "end":
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[5, 43, 46, 51]]
                  );
                })
              );
              return function (t, r, n, a) {
                return e.apply(this, arguments);
              };
            })(),
            Re = function (e) {
              (0, N.setCartPageClickGio)({
                productNumber: T,
                ifProduct: T > 0 ? "是" : "否",
                flowName: e ? "全选" : "取消全选",
                townName: null == r ? void 0 : r.regionauth_code,
                liveId: null == h ? void 0 : h.liveId,
                operatingTown_var:
                  (null == Ze ? void 0 : Ze.regionauth_code) || "",
                cartPageTab_var: Ye(),
              }),
                ce ? Ae(String(ce), e) : Oe({}, "all", e, null);
            },
            Ae = function (e, t) {
              Oe({}, "region", t, e);
            },
            Me = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e() {
                  var t,
                    r,
                    n,
                    i,
                    o = arguments;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (
                            ((t = o.length > 0 && void 0 !== o[0] ? o[0] : []),
                            (r = o.length > 1 ? o[1] : void 0),
                            (n = o.length > 2 ? o[2] : void 0),
                            (i = o.length > 3 && void 0 !== o[3] ? o[3] : {}),
                            t.length)
                          ) {
                            e.next = 6;
                            break;
                          }
                          return e.abrupt("return");
                        case 6:
                          return (
                            (e.next = 8), Oe({ cart_id: t }, "item", r, n, i)
                          );
                        case 8:
                          return e.abrupt("return", e.sent);
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
            Le = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e(t, n, i, o) {
                  var c, s, l, u, d, f;
                  return (0, a.Z)().wrap(
                    function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              null != t &&
                              null !== (c = t.list) &&
                              void 0 !== c &&
                              c.length
                            ) {
                              e.next = 2;
                              break;
                            }
                            return e.abrupt("return");
                          case 2:
                            if (
                              ((s = new Set(n)),
                              (l = []),
                              (u = []),
                              (d = []),
                              t.list.forEach(function (e) {
                                var t = s.has(e.cart_id);
                                _e(e) !== t &&
                                  (t ? l.push(e.cart_id) : u.push(e.cart_id),
                                  d.push(
                                    (0, N.setCartPageClickGio)({
                                      productNumber: T,
                                      ifProduct: T > 0 ? "是" : "否",
                                      flowName: t ? "勾选" : "取消勾选",
                                      townName:
                                        null == r ? void 0 : r.regionauth_code,
                                      liveId: null == h ? void 0 : h.liveId,
                                      operatingTown_var: o,
                                      cartPageTab_var: Ye(),
                                    })
                                  ));
                              }),
                              l.length || u.length)
                            ) {
                              e.next = 9;
                              break;
                            }
                            return e.abrupt("return");
                          case 9:
                            return (
                              pe(),
                              (f = [xe(l, !0), xe(u, !1)]),
                              (e.prev = 11),
                              (e.next = 14),
                              Promise.allSettled(d)
                            );
                          case 14:
                            return (
                              (e.next = 16),
                              Me(l, !0, i, {
                                refreshAfterSelect: !1,
                                manageSelectPending: !1,
                                skipCheckedOverride: !0,
                              })
                            );
                          case 16:
                            return (
                              (e.next = 18),
                              Me(u, !1, i, {
                                refreshAfterSelect: !1,
                                manageSelectPending: !1,
                                skipCheckedOverride: !0,
                              })
                            );
                          case 18:
                            return (
                              (e.next = 20), Ee(!1, he(), { refreshTabs: !1 })
                            );
                          case 20:
                            return (
                              (e.prev = 20), f.forEach(ye), me(), e.finish(20)
                            );
                          case 24:
                          case "end":
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[11, , 20, 24]]
                  );
                })
              );
              return function (t, r, n, a) {
                return e.apply(this, arguments);
              };
            })(),
            De = function (t, r) {
              var n = t.cart_id;
              m()
                .showModal({
                  title: "提示",
                  content: "将当前商品移出购物车?",
                  showCancel: !0,
                  cancelText: "取消",
                  confirmText: "确认",
                })
                .then(function (t) {
                  t.confirm &&
                    e((0, k.GR)({ cart_id: n, regionauth_id: r }))
                      .then(
                        (0, i.Z)(
                          (0, a.Z)().mark(function e() {
                            return (0, a.Z)().wrap(function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    m().showToast({
                                      title: "删除成功",
                                      icon: "success",
                                    }),
                                      Ee(!1, he());
                                  case 2:
                                  case "end":
                                    return e.stop();
                                }
                            }, e);
                          })
                        )
                      )
                      .catch(function (e) {
                        m().showToast({
                          title: e.message || "删除失败",
                          icon: "none",
                        });
                      });
                });
            },
            qe = function (t, r) {
              m().showLoading({ title: "收藏中..." }),
                e((0, w.L$)(t.item_id, r))
                  .then(function () {
                    m().hideLoading(),
                      m().showToast({ title: "收藏成功", icon: "success" });
                  })
                  .catch(function (e) {
                    m().hideLoading(),
                      m().showToast({
                        title: e.message || "收藏失败",
                        icon: "none",
                      });
                  });
            },
            ze = function (e) {
              B(function (t) {
                t.editingItemId = e;
              });
            },
            Be = function () {
              B(function (e) {
                e.editingItemId = null;
              });
            },
            Ke = function () {
              var e = Ne;
              if (Ge(e)) {
                var t = Se({ receipt_type: (0, j._X)(e) });
                Ie(t);
              }
            };
          (0, l.useEffect)(
            function () {
              var e = ce;
              L && M.length > 0 && Ee(!0, e);
            },
            [ce, M.length, L]
          ),
            (0, p.usePullDownRefresh)(function () {
              L
                ? Ee(!0, ce).then(function () {
                    m().stopPullDownRefresh();
                  })
                : m().stopPullDownRefresh();
            });
          var Ue = (0, l.useMemo)(
              function () {
                return V(ue, M, ce);
              },
              [ue, M, ce]
            ),
            Ve = (0, l.useMemo)(
              function () {
                return (function () {
                  var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : [],
                    t =
                      arguments.length > 1 && void 0 !== arguments[1]
                        ? arguments[1]
                        : null;
                  return Array.isArray(e) && e.length
                    ? t
                      ? e.filter(function (e) {
                          return String(e.regionauth_id) === String(t);
                        })
                      : e
                    : [];
                })(de, ce);
              },
              [de, ce]
            ),
            $e = (0, l.useMemo)(
              function () {
                if (!ce)
                  return !Object.values(ke).some(function (e) {
                    var t;
                    return (
                      (null == e || null === (t = e.validCart) || void 0 === t
                        ? void 0
                        : t.length) > 0
                    );
                  });
                var e = String(ce),
                  t = ke[e];
                if (!t) return !0;
                var r =
                    t.validCart &&
                    Array.isArray(t.validCart) &&
                    t.validCart.length > 0,
                  n =
                    t.invalidCart &&
                    Array.isArray(t.invalidCart) &&
                    t.invalidCart.length > 0;
                return !r && !n;
              },
              [ke, ce]
            ),
            Qe = (0, l.useMemo)(
              function () {
                if (E(ce)) {
                  var e,
                    t,
                    r,
                    n = String(ce),
                    a =
                      (null === (e = ke[n]) || void 0 === e
                        ? void 0
                        : e.totalSummary) ||
                      (null === (t = ke[ce]) || void 0 === t
                        ? void 0
                        : t.totalSummary) ||
                      (null === (r = ke[Number(ce)]) || void 0 === r
                        ? void 0
                        : r.totalSummary);
                  return a && Object.keys(a).length > 0 ? a : {};
                }
                return fe || {};
              },
              [ce, ke, fe]
            ),
            We = (0, l.useMemo)(
              function () {
                var e = Ne,
                  t = e.reduce(function (e, t) {
                    return e + (Number(t.num) || 0);
                  }, 0);
                return {
                  checkedGoods: e,
                  totalQuantity: t,
                  totalFee: Number(Qe.total_fee) || 0,
                  discountFee: (0, A.kK)(Qe),
                  disabled:
                    be.length > 0 &&
                    be.every(function (e) {
                      return 0 == e.is_valid;
                    }),
                };
              },
              [Ne, be, Qe]
            ),
            Ye = function () {
              return (
                (ce && (null == Ze ? void 0 : Ze.regionauth_name)) || "全部"
              );
            },
            Je = function (e, t) {
              (0, N.setCartPageClickGio)({
                productNumber: T,
                ifProduct: T > 0 ? "是" : "否",
                flowName: null == e ? void 0 : e.flowName,
                townName: null == r ? void 0 : r.regionauth_code,
                liveId: null == h ? void 0 : h.liveId,
                operatingTown_var: t,
                cartPageTab_var: Ye(),
              });
            },
            Xe = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e(t, r) {
                  var n;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (n =
                              (null == Ze ? void 0 : Ze.regionauth_code) || ""),
                            (e.next = 3),
                            Je({ flowName: t }, n)
                          );
                        case 3:
                          r();
                        case 4:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function (t, r) {
                return e.apply(this, arguments);
              };
            })(),
            He = Q(function (e, t) {
              return Je(e, t);
            }),
            et = Q(function (e, t) {
              return _e(e, t);
            }),
            tt = Q(function (e, t, r) {
              return (function (e, t, r) {
                var n;
                null != e &&
                  null !== (n = e.list) &&
                  void 0 !== n &&
                  n.length &&
                  Oe(e, "shop", t, r);
              })(e, t, r);
            }),
            rt = Q(function (e, t, r, n) {
              return Le(e, t, r, n);
            }),
            nt = Q(function (e, t) {
              t && (0, _.KS)(t, r),
                m().navigateTo({ url: "/subpages/store/index?id=".concat(e) });
            }),
            at = Q(function (e, t) {
              t && (0, _.KS)(t, r),
                m().navigateTo({
                  url: "/marketing/pages/plusprice/detail-plusprice-list?marketing_id=".concat(
                    e
                  ),
                });
            }),
            it = Q(function (e, t) {
              t && (0, _.KS)(t, r),
                m().navigateTo({
                  url: "/marketing/pages/plusprice/cart-plusprice-list?marketing_id=".concat(
                    e
                  ),
                });
            }),
            ot = Q(function (e, t, n) {
              return (function (e, t, n) {
                n && (0, _.KS)(n, r),
                  m().navigateTo({
                    url: "/subpages/marketing/marketing-list?marketing_id="
                      .concat(t, "&distributor_id=")
                      .concat(e),
                  });
              })(e, t, n);
            }),
            ct = Q(function (e, t) {
              return qe(e, t);
            }),
            st = Q(function (e, t) {
              return De(e, t);
            }),
            lt = Q(function (e, t, r, n) {
              return Te(e, t, r, n);
            }),
            ut = Q(function () {
              B(function (e) {
                e.showOverflow = !0;
              });
            }),
            dt = (0, l.useCallback)(
              function (e) {
                var t = e.detail.scrollTop > 200;
                t !== U.current &&
                  ((U.current = t),
                  B(function (e) {
                    e.showBackToTop = t;
                  }));
              },
              [B]
            ),
            ft = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e() {
                  var t;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (
                            ((t = { cart_id: z.selectedIds, noRegionauth: !0 }),
                            0 !== z.selectedIds.length)
                          ) {
                            e.next = 4;
                            break;
                          }
                          return (
                            m().showToast({
                              title: "请选择要删除的商品",
                              icon: "none",
                            }),
                            e.abrupt("return")
                          );
                        case 4:
                          return (e.next = 6), x.Z.cart.deleteCart(t);
                        case 6:
                          Ee(!1, ce);
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
            pt = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e() {
                  var t, r, n, i;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (
                            ((t = []),
                            ce
                              ? ((r = String(ce)),
                                (n = ke[r]) &&
                                  n.validCart &&
                                  ((i = []),
                                  n.validCart.forEach(function (e) {
                                    e.list &&
                                      e.list.forEach(function (e) {
                                        _e(e) && i.push(e.item_id);
                                      });
                                  }),
                                  i.length > 0 &&
                                    t.push({
                                      regionauth_id: Number(ce) || ce,
                                      item_ids: i,
                                    })))
                              : Object.keys(ke).forEach(function (e) {
                                  var r = ke[e];
                                  if (r && r.validCart) {
                                    var n = [];
                                    r.validCart.forEach(function (e) {
                                      e.list &&
                                        e.list.forEach(function (e) {
                                          _e(e) && n.push(e.item_id);
                                        });
                                    }),
                                      n.length > 0 &&
                                        t.push({
                                          regionauth_id: Number(e) || e,
                                          item_ids: n,
                                        });
                                  }
                                }),
                            0 !== t.length)
                          ) {
                            e.next = 5;
                            break;
                          }
                          return (
                            m().showToast({
                              title: "请选择要收藏的商品",
                              icon: "none",
                            }),
                            e.abrupt("return")
                          );
                        case 5:
                          return (
                            (e.next = 7), x.Z.member.addFavList({ items: t })
                          );
                        case 7:
                          m().showToast({ title: "收藏成功", icon: "success" });
                        case 8:
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
            mt = (function () {
              var e = (0, i.Z)(
                (0, a.Z)().mark(function e() {
                  var t, r;
                  return (0, a.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if ((t = ke[ce].invalidCart) && 0 !== t.length) {
                            e.next = 4;
                            break;
                          }
                          return (
                            m().showToast({
                              title: "没有失效商品",
                              icon: "none",
                            }),
                            e.abrupt("return")
                          );
                        case 4:
                          return (
                            (r = t.map(function (e) {
                              return e.cart_id;
                            })),
                            (e.next = 7),
                            x.Z.cart.deleteCart({
                              cart_id: r,
                              regionauth_id: ce,
                            })
                          );
                        case 7:
                          Ee(!1, ce);
                        case 8:
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
            ht = function (e) {
              var t = M.find(function (t) {
                return (
                  String(t.regionauth_id) ===
                  String(null == e ? void 0 : e.regionauth_id)
                );
              });
              return (
                (null == t ? void 0 : t.regionauth_code) ||
                (null == Ze ? void 0 : Ze.regionauth_code) ||
                ""
              );
            },
            vt = 240,
            gt = 120,
            _t = (0, l.useMemo)(
              function () {
                return $e ? vt - gt : vt;
              },
              [$e]
            );
          return L
            ? (0, Z.jsxs)(y.nO, {
                className: v()("page-cart"),
                ref: K,
                footerHeight: _t,
                hideLeftSpace: !0,
                navigationLeftBlockWidthFull: !0,
                renderNavigationLeft: (0, Z.jsx)(u.G7, {
                  className: "page-cart__navigation-manage",
                  onClick: (0, i.Z)(
                    (0, a.Z)().mark(function e() {
                      return (0, a.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.next = 2),
                                (0, N.setCartPageClickGio)({
                                  productNumber: T,
                                  ifProduct: T > 0 ? "是" : "否",
                                  flowName: ae ? "退出管理" : "管理",
                                  townName:
                                    null == r ? void 0 : r.regionauth_code,
                                  liveId: null == h ? void 0 : h.liveId,
                                  operatingTown_var:
                                    (null == Ze
                                      ? void 0
                                      : Ze.regionauth_code) || "",
                                  cartPageTab_var: Ye(),
                                })
                              );
                            case 2:
                              B(function (e) {
                                e.isManage = !e.isManage;
                              });
                            case 3:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  ),
                  children: (0, Z.jsx)(u.xv, {
                    className: v()("page-cart__navigation-manage-text", {
                      active: ae,
                    }),
                    children: ae ? "退出管理" : "管理",
                  }),
                }),
                renderNavigation: (0, Z.jsx)(u.G7, {
                  className: "page-cart__navigation-header",
                  children: (0, Z.jsxs)(u.G7, {
                    className: "page-cart__navigation-header-title",
                    children: [
                      "购物车 ",
                      T > 0 && "(".concat(T > 99 ? "99+" : T, ")"),
                    ],
                  }),
                }),
                renderFooter: (function () {
                  if (te || $e) return null;
                  if (ae)
                    return (0, Z.jsxs)(u.G7, {
                      className: "page-cart__footer",
                      children: [
                        (0, Z.jsxs)(u.G7, {
                          className: "page-cart__footer-select",
                          children: [
                            (0, Z.jsx)(y.bM, {
                              checked: re,
                              onChange: function (e) {
                                return Re(e);
                              },
                            }),
                            (0, Z.jsx)(u.xv, {
                              className: "page-cart__footer-select-text",
                              children: "全选",
                            }),
                          ],
                        }),
                        (0, Z.jsxs)(u.G7, {
                          className: "page-cart__footer-manage",
                          children: [
                            ce &&
                              (0, Z.jsx)(u.G7, {
                                className: "page-cart__footer-manage-clear",
                                children: (0, Z.jsx)(u.xv, {
                                  className:
                                    "page-cart__footer-manage-item-text",
                                  onClick: (0, i.Z)(
                                    (0, a.Z)().mark(function e() {
                                      return (0, a.Z)().wrap(function (e) {
                                        for (;;)
                                          switch ((e.prev = e.next)) {
                                            case 0:
                                              return (
                                                (e.next = 2),
                                                Xe("清空失效商品", mt)
                                              );
                                            case 2:
                                              return e.abrupt("return", e.sent);
                                            case 3:
                                            case "end":
                                              return e.stop();
                                          }
                                      }, e);
                                    })
                                  ),
                                  children: "清空失效商品",
                                }),
                              }),
                            (0, Z.jsx)(u.G7, {
                              className: "page-cart__footer-manage-fav",
                              onClick: (0, i.Z)(
                                (0, a.Z)().mark(function e() {
                                  return (0, a.Z)().wrap(function (e) {
                                    for (;;)
                                      switch ((e.prev = e.next)) {
                                        case 0:
                                          return (
                                            (e.next = 2), Xe("收藏商品", pt)
                                          );
                                        case 2:
                                          return e.abrupt("return", e.sent);
                                        case 3:
                                        case "end":
                                          return e.stop();
                                      }
                                  }, e);
                                })
                              ),
                              children: (0, Z.jsx)(u.xv, {
                                className: "page-cart__footer-manage-item-text",
                                children: "收藏",
                              }),
                            }),
                            (0, Z.jsx)(u.G7, {
                              className: "page-cart__footer-manage-del",
                              onClick: (0, i.Z)(
                                (0, a.Z)().mark(function e() {
                                  return (0, a.Z)().wrap(function (e) {
                                    for (;;)
                                      switch ((e.prev = e.next)) {
                                        case 0:
                                          return (
                                            (e.next = 2), Xe("删除商品", ft)
                                          );
                                        case 2:
                                          return e.abrupt("return", e.sent);
                                        case 3:
                                        case "end":
                                          return e.stop();
                                      }
                                  }, e);
                                })
                              ),
                              children: (0, Z.jsx)(u.xv, {
                                className: "page-cart__footer-manage-item-text",
                                children: "删除",
                              }),
                            }),
                          ],
                        }),
                      ],
                    });
                  var e = We.checkedGoods,
                    t = We.totalQuantity,
                    n = We.totalFee,
                    o = We.discountFee,
                    c = We.disabled,
                    s = (null == Ze ? void 0 : Ze.regionauth_code) || "",
                    l = 0 === e.length || c || se;
                  return (0, Z.jsxs)(u.G7, {
                    className: "page-cart__footer",
                    children: [
                      (0, Z.jsxs)(u.G7, {
                        className: "page-cart__footer-select",
                        children: [
                          (0, Z.jsx)(y.bM, {
                            checked: re,
                            onChange: function (e) {
                              return Re(e);
                            },
                            disabled: c,
                          }),
                          (0, Z.jsx)(u.xv, {
                            className: "page-cart__footer-select-text",
                            children: "全选",
                          }),
                        ],
                      }),
                      (0, Z.jsxs)(u.G7, {
                        className: "page-cart__footer-price",
                        children: [
                          (0, Z.jsxs)(u.G7, {
                            className: "page-cart__footer-total",
                            children: [
                              (0, Z.jsx)(u.xv, {
                                className: "page-cart__footer-total-label",
                                children: "合计",
                              }),
                              (0, Z.jsx)(y.qq, {
                                unit: "cent",
                                value: n,
                                primary: !0,
                                size: 32,
                                weight: 600,
                              }),
                            ],
                          }),
                          o > 0 &&
                            e.length > 0 &&
                            (0, Z.jsxs)(u.G7, {
                              className: "page-cart__footer-discount",
                              children: [
                                (0, Z.jsx)(u.xv, {
                                  className: "page-cart__footer-discount-text",
                                  children: "共优惠",
                                }),
                                (0, Z.jsx)(y.qq, {
                                  value: o,
                                  primary: !0,
                                  size: 20,
                                  weight: 600,
                                  sizeSame: !0,
                                  unit: "cent",
                                }),
                              ],
                            }),
                        ],
                      }),
                      (0, Z.jsxs)(u.G7, {
                        className: v()("page-cart__footer-btn", {
                          "page-cart__footer-btn--disabled": l,
                        }),
                        onClick: (0, i.Z)(
                          (0, a.Z)().mark(function e() {
                            return (0, a.Z)().wrap(function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (!(l || Y.current > 0)) {
                                      e.next = 2;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 2:
                                    return (
                                      (e.next = 4),
                                      (0, N.setCartPageClickGio)({
                                        productNumber: T,
                                        ifProduct: T > 0 ? "是" : "否",
                                        flowName: "结算",
                                        townName:
                                          null == r
                                            ? void 0
                                            : r.regionauth_code,
                                        liveId: null == h ? void 0 : h.liveId,
                                        operatingTown_var: s,
                                        cartPageTab_var: Ye(),
                                      })
                                    );
                                  case 4:
                                    Ke();
                                  case 5:
                                  case "end":
                                    return e.stop();
                                }
                            }, e);
                          })
                        ),
                        children: ["结算", t > 0 ? "(".concat(t, ")") : ""],
                      }),
                    ],
                  });
                })(),
                children: [
                  (0, Z.jsx)(u.G7, {
                    className: "page-cart__header",
                    children: (0, Z.jsx)(y.nc, {
                      list: M,
                      current: ce,
                      onChange: (function () {
                        var e = (0, i.Z)(
                          (0, a.Z)().mark(function e(t) {
                            return (0, a.Z)().wrap(function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    return (
                                      (e.next = 2),
                                      (0, N.setCartPageClickGio)({
                                        productNumber: T,
                                        ifProduct: T > 0 ? "是" : "否",
                                        flowName: "切换小镇",
                                        townName:
                                          null == r
                                            ? void 0
                                            : r.regionauth_code,
                                        liveId: null == h ? void 0 : h.liveId,
                                        operatingTown_var:
                                          (null == t
                                            ? void 0
                                            : t.regionauth_code) || "",
                                        cartPageTab_var:
                                          (null == t
                                            ? void 0
                                            : t.regionauth_name) || "",
                                      })
                                    );
                                  case 2:
                                    (U.current = !1),
                                      ve(),
                                      B(function (e) {
                                        (e.loading = !0),
                                          (e.allRegionCartData = {}),
                                          (e.allCartTotalSummary = {}),
                                          (e.validCartList = []),
                                          (e.invalidCartList = []),
                                          (e.curRegidIndex = t.regionauth_id),
                                          (e.scrollPosition = void 0),
                                          (e.showBackToTop = !1);
                                      });
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
                    }),
                  }),
                  (0, Z.jsxs)(u.pf, {
                    scrollY: !0,
                    scrollTop: z.scrollPosition,
                    minDragDistance: 30,
                    bounces: !1,
                    enhanced: !0,
                    catchtouchstart: "true",
                    catchtouchmove: "true",
                    className: "page-cart",
                    style: { height: "calc(100% - 92rpx)" },
                    showScrollbar: !1,
                    scrollIntoView: z.activeRegionauth_id
                      ? "region-group-".concat(z.activeRegionauth_id)
                      : "",
                    onScroll: dt,
                    children: [
                      (0, Z.jsx)(u.G7, { id: "cart-scroll-top" }),
                      te &&
                        (0, Z.jsx)(u.G7, {
                          className: "page-cart__loading",
                          children: (0, Z.jsx)(y.m6, { children: "加载中..." }),
                        }),
                      !te &&
                        $e &&
                        (0, Z.jsxs)(u.G7, {
                          className: "page-cart__empty",
                          children: [
                            (0, Z.jsx)(u.G7, {
                              className: "page-cart__empty-icon",
                              children: (0, Z.jsx)(y.Ko, {
                                src: "fv_cart_empty.png",
                                width: 120,
                                height: 120,
                              }),
                            }),
                            (0, Z.jsx)(u.xv, {
                              className: "page-cart__empty-text",
                              children: "您还没有加购商品哦",
                            }),
                          ],
                        }),
                      !te &&
                        !$e &&
                        (0, Z.jsx)(u.G7, {
                          className: "page-cart__shop-list",
                          children: Ue.map(function (e) {
                            var t = e.key,
                              r = e.shop,
                              n = e.regionauth_id,
                              a = e.operatingTown_var,
                              i = e.displayShopName;
                            return (0,
                            Z.jsx)(F, { shop: r, regionauthId: n, operatingTownVar: a, displayShopName: i, editingItemId: ne, cartCheckedOverrides: le, getEffectiveCartChecked: et, onTrack: He, onShopCheck: tt, onItemsChange: rt, onNavigateStore: nt, onNavigatePlusDetail: at, onNavigatePlusCart: it, onAddMore: ot, onCollectItem: ct, onDeleteItem: st, onUpdateQuantity: lt, onEditQuantity: ze, onFocusQuantity: ut }, t);
                          }),
                        }),
                      !te &&
                        !$e &&
                        (E(ce) && Ve.length
                          ? (0, Z.jsxs)(u.G7, {
                              className: "page-cart__invalid",
                              children: [
                                (0, Z.jsx)(u.G7, {
                                  className: "page-cart__invalid-title",
                                  children: "失效商品",
                                }),
                                Ve.map(function (e) {
                                  return (0, Z.jsx)(
                                    y.kK,
                                    {
                                      options: [
                                        {
                                          text: "收藏",
                                          style: { backgroundColor: "#FF9500" },
                                          onClick: (function () {
                                            var t = (0, i.Z)(
                                              (0, a.Z)().mark(function t() {
                                                return (0, a.Z)().wrap(
                                                  function (t) {
                                                    for (;;)
                                                      switch (
                                                        (t.prev = t.next)
                                                      ) {
                                                        case 0:
                                                          return (
                                                            qe(
                                                              e,
                                                              e.regionauth_id
                                                            ),
                                                            (t.next = 3),
                                                            (0,
                                                            N.setCartPageClickGio)(
                                                              {
                                                                productNumber:
                                                                  T,
                                                                ifProduct:
                                                                  T > 0
                                                                    ? "是"
                                                                    : "否",
                                                                flowName:
                                                                  "收藏商品",
                                                                townName:
                                                                  null == r
                                                                    ? void 0
                                                                    : r.regionauth_code,
                                                                liveId:
                                                                  null == h
                                                                    ? void 0
                                                                    : h.liveId,
                                                                operatingTown_var:
                                                                  ht(e),
                                                                cartPageTab_var:
                                                                  Ye(),
                                                              }
                                                            )
                                                          );
                                                        case 3:
                                                        case "end":
                                                          return t.stop();
                                                      }
                                                  },
                                                  t
                                                );
                                              })
                                            );
                                            return function () {
                                              return t.apply(this, arguments);
                                            };
                                          })(),
                                        },
                                        {
                                          text: "删除",
                                          style: { backgroundColor: "#FF4949" },
                                          onClick: (function () {
                                            var t = (0, i.Z)(
                                              (0, a.Z)().mark(function t() {
                                                return (0, a.Z)().wrap(
                                                  function (t) {
                                                    for (;;)
                                                      switch (
                                                        (t.prev = t.next)
                                                      ) {
                                                        case 0:
                                                          return (
                                                            De(
                                                              e,
                                                              e.regionauth_id
                                                            ),
                                                            (t.next = 3),
                                                            (0,
                                                            N.setCartPageClickGio)(
                                                              {
                                                                productNumber:
                                                                  T,
                                                                ifProduct:
                                                                  T > 0
                                                                    ? "是"
                                                                    : "否",
                                                                flowName:
                                                                  "删除商品",
                                                                townName:
                                                                  null == r
                                                                    ? void 0
                                                                    : r.regionauth_code,
                                                                liveId:
                                                                  null == h
                                                                    ? void 0
                                                                    : h.liveId,
                                                                operatingTown_var:
                                                                  ht(e),
                                                                cartPageTab_var:
                                                                  Ye(),
                                                              }
                                                            )
                                                          );
                                                        case 3:
                                                        case "end":
                                                          return t.stop();
                                                      }
                                                  },
                                                  t
                                                );
                                              })
                                            );
                                            return function () {
                                              return t.apply(this, arguments);
                                            };
                                          })(),
                                        },
                                      ],
                                      children: (0, Z.jsxs)(u.G7, {
                                        className: "page-cart__invalid-item",
                                        children: [
                                          (0, Z.jsx)(u.G7, {
                                            className: "page-cart__invalid-tag",
                                            children: "失效",
                                          }),
                                          (0, Z.jsx)(u.G7, {
                                            className:
                                              "page-cart__invalid-image-container ml-16",
                                            children: (0, Z.jsx)(y.Ko, {
                                              className:
                                                "page-cart__invalid-image",
                                              src: e.pics || "",
                                              width: 164,
                                              height: 164,
                                              mode: "aspectFill",
                                            }),
                                          }),
                                          (0, Z.jsxs)(u.G7, {
                                            className:
                                              "page-cart__invalid-content ml-18",
                                            children: [
                                              (0, Z.jsx)(u.xv, {
                                                className:
                                                  "page-cart__invalid-name",
                                                children: e.item_name,
                                              }),
                                              (0, Z.jsx)(u.xv, {
                                                className:
                                                  "page-cart__invalid-message",
                                                children:
                                                  e.invalid_reason ||
                                                  "宝贝已失效，不能购买",
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    },
                                    e.cart_id
                                  );
                                }),
                              ],
                            })
                          : null),
                    ],
                  }),
                  (0, Z.jsx)(S, {
                    goods: (0, P.WS)(Ne || [], "logistics"),
                    visible: ie,
                    onBack: function () {
                      B(function (e) {
                        e.deliveryModalVisible = !1;
                      });
                    },
                    onSubmit: function (e) {
                      if (Ge(Ne, { receiptType: e })) {
                        var t = Se({ receipt_type: e });
                        Ie(t),
                          B(function (e) {
                            e.deliveryModalVisible = !1;
                          });
                      }
                    },
                  }),
                  (0, Z.jsx)(I, {
                    visible: oe,
                    onBack: function () {
                      B(function (e) {
                        e.crossTownZitiModalVisible = !1;
                      });
                    },
                  }),
                  (0, Z.jsx)(u.G7, {
                    className: "page-cart__loading-num",
                    catchMove: !0,
                    style: {
                      zIndex: z.loadingNum || z.showOverflow ? 1e3 : -10,
                    },
                    children: z.loadingNum && (0, Z.jsx)(y.m6, {}),
                  }),
                  (0, Z.jsx)(u.G7, {
                    className: v()("page-cart__scroll-top", {
                      "page-cart__scroll-top--show": z.showBackToTop,
                    }),
                    children: (0, Z.jsx)(y.Ce, {
                      onClick: function () {
                        (U.current = !1),
                          B(function (e) {
                            (e.scrollPosition = "#cart-scroll-top"),
                              (e.showBackToTop = !1);
                          }),
                          m().nextTick(function () {
                            B(function (e) {
                              e.scrollPosition = void 0;
                            });
                          });
                      },
                      children: (0, Z.jsx)(u.xv, {
                        className: "iconfont icon-zhiding",
                      }),
                    }),
                  }),
                ],
              })
            : (0, Z.jsx)(y.nO, {
                className: "page-cart",
                onReady: function (e) {
                  var t = e.menuWidth;
                  B(function (e) {
                    e.menuWidth = t;
                  });
                },
                renderNavigation: (0, Z.jsx)(u.G7, {
                  className: "page-cart__navigation-header-title",
                  style: { marginLeft: z.menuWidth },
                  children: "购物车",
                }),
                children: (0, Z.jsxs)(u.G7, {
                  className: "login-header",
                  children: [
                    (0, Z.jsx)(u.G7, {
                      className: "login-txt",
                      children: "登录后查看已加购商品",
                    }),
                    (0, Z.jsx)(y.vC, {
                      onChange: function () {},
                      children: (0, Z.jsx)(u.G7, {
                        className: "btn-login",
                        children: "授权登录",
                      }),
                    }),
                  ],
                }),
              });
        };
        Page(
          (0, n.createPageConfig)(
            W,
            "pages/cart/espier-index",
            { root: { cn: [] } },
            { navigationBarTitleText: "购物车", navigationStyle: "custom" } ||
              {}
          )
        );
      },
      44020: function (e) {
        var t = "%[a-f0-9]{2}",
          r = new RegExp("(" + t + ")|([^%]+?)", "gi"),
          n = new RegExp("(" + t + ")+", "gi");
        function a(e, t) {
          try {
            return [decodeURIComponent(e.join(""))];
          } catch (e) {}
          if (1 === e.length) return e;
          t = t || 1;
          var r = e.slice(0, t),
            n = e.slice(t);
          return Array.prototype.concat.call([], a(r), a(n));
        }
        function i(e) {
          try {
            return decodeURIComponent(e);
          } catch (i) {
            for (var t = e.match(r) || [], n = 1; n < t.length; n++)
              t = (e = a(t, n).join("")).match(r) || [];
            return e;
          }
        }
        e.exports = function (e) {
          if ("string" != typeof e)
            throw new TypeError(
              "Expected `encodedURI` to be of type `string`, got `" +
                typeof e +
                "`"
            );
          try {
            return (e = e.replace(/\+/g, " ")), decodeURIComponent(e);
          } catch (t) {
            return (function (e) {
              for (
                var t = { "%FE%FF": "��", "%FF%FE": "��" }, r = n.exec(e);
                r;

              ) {
                try {
                  t[r[0]] = decodeURIComponent(r[0]);
                } catch (e) {
                  var a = i(r[0]);
                  a !== r[0] && (t[r[0]] = a);
                }
                r = n.exec(e);
              }
              t["%C2"] = "�";
              for (var o = Object.keys(t), c = 0; c < o.length; c++) {
                var s = o[c];
                e = e.replace(new RegExp(s, "g"), t[s]);
              }
              return e;
            })(e);
          }
        };
      },
      92806: function (e) {
        e.exports = function (e, t) {
          for (
            var r = {}, n = Object.keys(e), a = Array.isArray(t), i = 0;
            i < n.length;
            i++
          ) {
            var o = n[i],
              c = e[o];
            (a ? -1 !== t.indexOf(o) : t(o, c, e)) && (r[o] = c);
          }
          return r;
        };
      },
      17563: function (e, t, r) {
        const n = r(70610),
          a = r(44020),
          i = r(80500),
          o = r(92806),
          c = Symbol("encodeFragmentIdentifier");
        function s(e) {
          if ("string" != typeof e || 1 !== e.length)
            throw new TypeError(
              "arrayFormatSeparator must be single character string"
            );
        }
        function l(e, t) {
          return t.encode ? (t.strict ? n(e) : encodeURIComponent(e)) : e;
        }
        function u(e, t) {
          return t.decode ? a(e) : e;
        }
        function d(e) {
          const t = e.indexOf("#");
          return -1 !== t && (e = e.slice(0, t)), e;
        }
        function f(e) {
          const t = (e = d(e)).indexOf("?");
          return -1 === t ? "" : e.slice(t + 1);
        }
        function p(e, t) {
          return (
            t.parseNumbers &&
            !Number.isNaN(Number(e)) &&
            "string" == typeof e &&
            "" !== e.trim()
              ? (e = Number(e))
              : !t.parseBooleans ||
                null === e ||
                ("true" !== e.toLowerCase() && "false" !== e.toLowerCase()) ||
                (e = "true" === e.toLowerCase()),
            e
          );
        }
        function m(e, t) {
          s(
            (t = Object.assign(
              {
                decode: !0,
                sort: !0,
                arrayFormat: "none",
                arrayFormatSeparator: ",",
                parseNumbers: !1,
                parseBooleans: !1,
              },
              t
            )).arrayFormatSeparator
          );
          const r = (function (e) {
              let t;
              switch (e.arrayFormat) {
                case "index":
                  return (e, r, n) => {
                    (t = /\[(\d*)\]$/.exec(e)),
                      (e = e.replace(/\[\d*\]$/, "")),
                      t
                        ? (void 0 === n[e] && (n[e] = {}), (n[e][t[1]] = r))
                        : (n[e] = r);
                  };
                case "bracket":
                  return (e, r, n) => {
                    (t = /(\[\])$/.exec(e)),
                      (e = e.replace(/\[\]$/, "")),
                      t
                        ? void 0 !== n[e]
                          ? (n[e] = [].concat(n[e], r))
                          : (n[e] = [r])
                        : (n[e] = r);
                  };
                case "colon-list-separator":
                  return (e, r, n) => {
                    (t = /(:list)$/.exec(e)),
                      (e = e.replace(/:list$/, "")),
                      t
                        ? void 0 !== n[e]
                          ? (n[e] = [].concat(n[e], r))
                          : (n[e] = [r])
                        : (n[e] = r);
                  };
                case "comma":
                case "separator":
                  return (t, r, n) => {
                    const a =
                        "string" == typeof r &&
                        r.includes(e.arrayFormatSeparator),
                      i =
                        "string" == typeof r &&
                        !a &&
                        u(r, e).includes(e.arrayFormatSeparator);
                    r = i ? u(r, e) : r;
                    const o =
                      a || i
                        ? r.split(e.arrayFormatSeparator).map((t) => u(t, e))
                        : null === r
                        ? r
                        : u(r, e);
                    n[t] = o;
                  };
                case "bracket-separator":
                  return (t, r, n) => {
                    const a = /(\[\])$/.test(t);
                    if (((t = t.replace(/\[\]$/, "")), !a))
                      return void (n[t] = r ? u(r, e) : r);
                    const i =
                      null === r
                        ? []
                        : r.split(e.arrayFormatSeparator).map((t) => u(t, e));
                    void 0 !== n[t] ? (n[t] = [].concat(n[t], i)) : (n[t] = i);
                  };
                default:
                  return (e, t, r) => {
                    void 0 !== r[e] ? (r[e] = [].concat(r[e], t)) : (r[e] = t);
                  };
              }
            })(t),
            n = Object.create(null);
          if ("string" != typeof e) return n;
          if (!(e = e.trim().replace(/^[?#&]/, ""))) return n;
          for (const a of e.split("&")) {
            if ("" === a) continue;
            let [e, o] = i(t.decode ? a.replace(/\+/g, " ") : a, "=");
            (o =
              void 0 === o
                ? null
                : ["comma", "separator", "bracket-separator"].includes(
                    t.arrayFormat
                  )
                ? o
                : u(o, t)),
              r(u(e, t), o, n);
          }
          for (const e of Object.keys(n)) {
            const r = n[e];
            if ("object" == typeof r && null !== r)
              for (const e of Object.keys(r)) r[e] = p(r[e], t);
            else n[e] = p(r, t);
          }
          return !1 === t.sort
            ? n
            : (!0 === t.sort
                ? Object.keys(n).sort()
                : Object.keys(n).sort(t.sort)
              ).reduce((e, t) => {
                const r = n[t];
                return (
                  Boolean(r) && "object" == typeof r && !Array.isArray(r)
                    ? (e[t] = (function e(t) {
                        return Array.isArray(t)
                          ? t.sort()
                          : "object" == typeof t
                          ? e(Object.keys(t))
                              .sort((e, t) => Number(e) - Number(t))
                              .map((e) => t[e])
                          : t;
                      })(r))
                    : (e[t] = r),
                  e
                );
              }, Object.create(null));
        }
        (t.extract = f),
          (t.parse = m),
          (t.stringify = (e, t) => {
            if (!e) return "";
            s(
              (t = Object.assign(
                {
                  encode: !0,
                  strict: !0,
                  arrayFormat: "none",
                  arrayFormatSeparator: ",",
                },
                t
              )).arrayFormatSeparator
            );
            const r = (r) =>
                (t.skipNull && ((e) => null == e)(e[r])) ||
                (t.skipEmptyString && "" === e[r]),
              n = (function (e) {
                switch (e.arrayFormat) {
                  case "index":
                    return (t) => (r, n) => {
                      const a = r.length;
                      return void 0 === n ||
                        (e.skipNull && null === n) ||
                        (e.skipEmptyString && "" === n)
                        ? r
                        : null === n
                        ? [...r, [l(t, e), "[", a, "]"].join("")]
                        : [
                            ...r,
                            [l(t, e), "[", l(a, e), "]=", l(n, e)].join(""),
                          ];
                    };
                  case "bracket":
                    return (t) => (r, n) =>
                      void 0 === n ||
                      (e.skipNull && null === n) ||
                      (e.skipEmptyString && "" === n)
                        ? r
                        : null === n
                        ? [...r, [l(t, e), "[]"].join("")]
                        : [...r, [l(t, e), "[]=", l(n, e)].join("")];
                  case "colon-list-separator":
                    return (t) => (r, n) =>
                      void 0 === n ||
                      (e.skipNull && null === n) ||
                      (e.skipEmptyString && "" === n)
                        ? r
                        : null === n
                        ? [...r, [l(t, e), ":list="].join("")]
                        : [...r, [l(t, e), ":list=", l(n, e)].join("")];
                  case "comma":
                  case "separator":
                  case "bracket-separator": {
                    const t =
                      "bracket-separator" === e.arrayFormat ? "[]=" : "=";
                    return (r) => (n, a) =>
                      void 0 === a ||
                      (e.skipNull && null === a) ||
                      (e.skipEmptyString && "" === a)
                        ? n
                        : ((a = null === a ? "" : a),
                          0 === n.length
                            ? [[l(r, e), t, l(a, e)].join("")]
                            : [[n, l(a, e)].join(e.arrayFormatSeparator)]);
                  }
                  default:
                    return (t) => (r, n) =>
                      void 0 === n ||
                      (e.skipNull && null === n) ||
                      (e.skipEmptyString && "" === n)
                        ? r
                        : null === n
                        ? [...r, l(t, e)]
                        : [...r, [l(t, e), "=", l(n, e)].join("")];
                }
              })(t),
              a = {};
            for (const t of Object.keys(e)) r(t) || (a[t] = e[t]);
            const i = Object.keys(a);
            return (
              !1 !== t.sort && i.sort(t.sort),
              i
                .map((r) => {
                  const a = e[r];
                  return void 0 === a
                    ? ""
                    : null === a
                    ? l(r, t)
                    : Array.isArray(a)
                    ? 0 === a.length && "bracket-separator" === t.arrayFormat
                      ? l(r, t) + "[]"
                      : a.reduce(n(r), []).join("&")
                    : l(r, t) + "=" + l(a, t);
                })
                .filter((e) => e.length > 0)
                .join("&")
            );
          }),
          (t.parseUrl = (e, t) => {
            t = Object.assign({ decode: !0 }, t);
            const [r, n] = i(e, "#");
            return Object.assign(
              { url: r.split("?")[0] || "", query: m(f(e), t) },
              t && t.parseFragmentIdentifier && n
                ? { fragmentIdentifier: u(n, t) }
                : {}
            );
          }),
          (t.stringifyUrl = (e, r) => {
            r = Object.assign({ encode: !0, strict: !0, [c]: !0 }, r);
            const n = d(e.url).split("?")[0] || "",
              a = t.extract(e.url),
              i = t.parse(a, { sort: !1 }),
              o = Object.assign(i, e.query);
            let s = t.stringify(o, r);
            s && (s = "?" + s);
            let u = (function (e) {
              let t = "";
              const r = e.indexOf("#");
              return -1 !== r && (t = e.slice(r)), t;
            })(e.url);
            return (
              e.fragmentIdentifier &&
                (u =
                  "#" +
                  (r[c] ? l(e.fragmentIdentifier, r) : e.fragmentIdentifier)),
              `${n}${s}${u}`
            );
          }),
          (t.pick = (e, r, n) => {
            n = Object.assign({ parseFragmentIdentifier: !0, [c]: !1 }, n);
            const {
              url: a,
              query: i,
              fragmentIdentifier: s,
            } = t.parseUrl(e, n);
            return t.stringifyUrl(
              { url: a, query: o(i, r), fragmentIdentifier: s },
              n
            );
          }),
          (t.exclude = (e, r, n) => {
            const a = Array.isArray(r)
              ? (e) => !r.includes(e)
              : (e, t) => !r(e, t);
            return t.pick(e, a, n);
          });
      },
      80500: function (e) {
        e.exports = (e, t) => {
          if ("string" != typeof e || "string" != typeof t)
            throw new TypeError(
              "Expected the arguments to be of type `string`"
            );
          if ("" === t) return [e];
          const r = e.indexOf(t);
          return -1 === r ? [e] : [e.slice(0, r), e.slice(r + t.length)];
        };
      },
      70610: function (e) {
        e.exports = (e) =>
          encodeURIComponent(e).replace(
            /[!'()*]/g,
            (e) => "%" + e.charCodeAt(0).toString(16).toUpperCase()
          );
      },
    },
    function (e) {
      e.O(0, [2107, 1216, 8592], function () {
        return (function (t) {
          return e((e.s = t));
        })(35702);
      }),
        e.O();
    },
  ]);
})();
