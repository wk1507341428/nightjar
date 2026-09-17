!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [6437],
    {
      96550: function (e, s, i) {
        i(67294);
        var n = i(71515),
          a = i(78061),
          t = i(96856),
          c = i(64567),
          l = i(85893);
        function o(e) {
          var s,
            i = e.info,
            o = e.onClick,
            r = void 0 === o ? function () {} : o,
            d = e.showPrice,
            m = void 0 === d || d,
            u = e.showGiftTag,
            x = void 0 !== u && u,
            h = e.handleUpdateQuantity,
            f = void 0 === h ? function () {} : h,
            j = e.canEdit,
            v = void 0 !== j && j,
            N = e.onlyRefund,
            g = void 0 !== N && N,
            p = e.showDiscountFee,
            G = void 0 !== p && p,
            w = e.onDiscountClick,
            b = void 0 === w ? function () {} : w,
            y = e.renderRight,
            C = e.hideRefundStatus,
            k = void 0 !== C && C;
          if (!i) return null;
          var D = i.pic,
            F = i.itemName,
            P = i.price,
            S = i.promotionPrice,
            R = i.discountFee,
            q = i.itemSpecDesc,
            z = i.num,
            A = i.aftersalesBn,
            B = i.isGift,
            I = x && B,
            J = Number(R) || 0,
            K = k ? "" : (0, c.n)(i);
          return (0, l.jsxs)(n.G7, {
            className: "sp-trade-item",
            onClick: function () {
              r(i);
            },
            children: [
              (0, l.jsx)(n.G7, {
                className: "tradeitem-hd",
                children: (0, l.jsx)(a.Ko, {
                  src: D,
                  className: "tradeitem-hd-img",
                  mode: "aspectFill",
                  width: 164,
                  height: 164,
                  radius: 8,
                }),
              }),
              (0, l.jsxs)(n.G7, {
                className: g ? "tradeitem-bd after-sale-info" : "tradeitem-bd",
                children: [
                  (0, l.jsxs)(n.G7, {
                    className: "goods-info-container",
                    children: [
                      (0, l.jsx)(n.G7, {
                        className: "goods-info-hd",
                        children: (0, l.jsx)(n.G7, {
                          className: "name",
                          children: F,
                        }),
                      }),
                      (0, l.jsxs)(n.G7, {
                        className: "goods-info-bd",
                        children: [
                          A
                            ? (0, l.jsx)(n.xv, {
                                className: "spec-desc",
                                children:
                                  null == i ||
                                  null === (s = i.orderItem) ||
                                  void 0 === s
                                    ? void 0
                                    : s.itemSpecDesc,
                              })
                            : (0, l.jsx)(n.xv, {
                                className: "spec-desc",
                                children: q,
                              }),
                          (0, l.jsx)(n.xv, {
                            className: "num",
                            children: "x ".concat(z),
                          }),
                        ],
                      }),
                      y &&
                        (0, l.jsx)(n.G7, {
                          style: { position: "absolute" },
                          children: y(),
                        }),
                    ],
                  }),
                  v
                    ? (0, l.jsxs)(n.G7, {
                        className: "after-sale-info-return",
                        children: [
                          (0, l.jsx)(n.G7, {
                            className: "after-sale-info-return-text",
                            children: "退货数量",
                          }),
                          (0, l.jsx)(n.G7, {
                            className: "buy-count",
                            onClick: function (e) {
                              e.stopPropagation();
                            },
                            children: (0, l.jsx)(a.xu, {
                              value: z,
                              min: 1,
                              max: null == i ? void 0 : i.leftAftersalesNum,
                              onChange: function (e) {
                                return f(e);
                              },
                            }),
                          }),
                        ],
                      })
                    : m || I
                    ? (0, l.jsxs)(n.G7, {
                        className: (0, t.AK)("goods-info-return-money", {
                          "goods-info-return-money--gift": I,
                          "justify-items-end": !m && !I,
                          "justify-between": m || I,
                        }),
                        children: [
                          m &&
                            !I &&
                            (A
                              ? (0, l.jsxs)(n.G7, {
                                  className: "trade-item-after-price",
                                  children: [
                                    "退款 ¥",
                                    null == i ? void 0 : i.refundFee,
                                    (null == i ? void 0 : i.freight) > 0 &&
                                      (0, l.jsxs)(l.Fragment, {
                                        children: [
                                          (0, l.jsx)(n.xv, {
                                            className: "freight-label",
                                            children: "含运费",
                                          }),
                                          " ",
                                          (0, l.jsx)(n.xv, {
                                            className: "freight-value",
                                            children: "¥".concat(
                                              null == i ? void 0 : i.freight
                                            ),
                                          }),
                                        ],
                                      }),
                                  ],
                                })
                              : (0, l.jsxs)(n.G7, {
                                  className: "trade-item-price-row",
                                  children: [
                                    (0, l.jsx)(n.G7, {
                                      className: "trade-item-price",
                                      children: (0, l.jsx)(a.qq, {
                                        sizeSame: !0,
                                        value: null != S ? S : P,
                                        weigth: 500,
                                        family: "D-DIN-PRO-Medium",
                                      }),
                                    }),
                                    G &&
                                      J > 0 &&
                                      (0, l.jsxs)(n.G7, {
                                        className: "trade-item-discount",
                                        onClick: function (e) {
                                          e.stopPropagation(), b(i);
                                        },
                                        children: [
                                          (0, l.jsx)(n.xv, {
                                            className:
                                              "trade-item-discount-label",
                                            children: "优惠",
                                          }),
                                          (0, l.jsx)(a.qq, {
                                            sizeSame: !0,
                                            value: J,
                                            size: 22,
                                            color: "#D4003B",
                                            family: "PingFang SC",
                                            showdecimal: !0,
                                          }),
                                          (0, l.jsx)(n.xv, {
                                            className:
                                              "iconfont icon-arrowRight trade-item-discount-arrow",
                                          }),
                                        ],
                                      }),
                                  ],
                                })),
                          I &&
                            (0, l.jsx)(n.xv, {
                              className: "sp-trade-item__gift-tag",
                              children: "赠品",
                            }),
                          (0, l.jsx)(n.G7, {
                            className: "flex items-center gap-2",
                            children:
                              K &&
                              (0, l.jsx)(n.xv, {
                                className: "goods-info-return-text",
                                children: K,
                              }),
                          }),
                        ],
                      })
                    : null,
                ],
              }),
            ],
          });
        }
        (o.options = { addGlobalClass: !0 }), (s.Z = o);
      },
    },
  ]);
})();
