!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [3096],
    {
      6953: function (e, a, s) {
        var l = s(29439),
          i = (s(67294), s(71515)),
          c = s(78061),
          t = s(16800),
          o = s(85893),
          r = function (e) {
            var a = (Number(e) / 100).toFixed(2).split("."),
              s = (0, l.Z)(a, 2),
              i = s[0],
              c = s[1];
            return ""
              .concat(i.replace(/\B(?=(\d{3})+(?!\d))/g, ","), ".")
              .concat(c);
          };
        function d(e) {
          var a = e.label,
            s = e.value,
            l = e.discount,
            c = void 0 !== l && l;
          return (0, o.jsxs)(i.G7, {
            className: "sp-price-detail-modal__row",
            children: [
              (0, o.jsx)(i.xv, {
                className: "sp-price-detail-modal__row-label",
                children: a,
              }),
              (0, o.jsx)(i.xv, {
                className: "sp-price-detail-modal__row-value".concat(
                  c ? " sp-price-detail-modal__row-value--discount" : ""
                ),
                children: s,
              }),
            ],
          });
        }
        function n(e) {
          var a = e.items,
            s = (void 0 === a ? [] : a).filter(function (e) {
              return (null == e ? void 0 : e.tag) && e.amount > 0;
            });
          return s.length
            ? (0, o.jsx)(i.G7, {
                className: "sp-price-detail-modal__sub-list",
                children: s.map(function (e, a) {
                  return (0,
                  o.jsxs)(i.G7, { className: "sp-price-detail-modal__sub-row", children: [(0, o.jsx)(i.G7, { className: "sp-price-detail-modal__tag", children: (0, o.jsx)(i.xv, { className: "sp-price-detail-modal__tag-text", children: e.tag }) }), (0, o.jsxs)(i.G7, { className: "sp-price-detail-modal__sub-amount", children: [(0, o.jsx)(i.xv, { className: "sp-price-detail-modal__sub-tip", children: "优惠已分摊" }), (0, o.jsxs)(i.xv, { className: "sp-price-detail-modal__sub-value", children: ["-¥", r(e.amount)] })] })] }, "".concat(e.tag, "-").concat(a));
                }),
              })
            : null;
        }
        function m(e) {
          var a = e.label,
            s = e.amount,
            l = e.items;
          return s
            ? (0, o.jsxs)(i.G7, {
                className: "sp-price-detail-modal__group",
                children: [
                  (0, o.jsx)(d, {
                    label: a,
                    value: "-¥".concat(r(s)),
                    discount: !0,
                  }),
                  (0, o.jsx)(n, { items: l }),
                ],
              })
            : null;
        }
        function p(e) {
          var a = e.visible,
            s = void 0 !== a && a,
            l = e.data,
            n = e.onClose,
            p = void 0 === n ? function () {} : n;
          if (!l) return null;
          var u = (0, o.jsxs)(i.G7, {
              className: "sp-price-detail-modal__header",
              children: [
                (0, o.jsxs)(i.G7, {
                  className: "sp-price-detail-modal__price",
                  children: [
                    (0, o.jsx)(i.xv, {
                      className: "sp-price-detail-modal__price-symbol",
                      children: "¥",
                    }),
                    (0, o.jsx)(i.xv, {
                      className: "sp-price-detail-modal__price-value",
                      children: r(l.unitPriceAfterDiscount),
                    }),
                  ],
                }),
                (0, o.jsx)(i.xv, {
                  className: "sp-price-detail-modal__price-desc",
                  children: l.unitPriceLabel,
                }),
              ],
            }),
            _ = l.goodsCount || 0;
          return (0, o.jsx)(c.o9, {
            className: "sp-price-detail-modal",
            open: s,
            onClose: p,
            renderHeader: u,
            maxHeight: (0, t.dw)(t.$3),
            children: (0, o.jsxs)(i.G7, {
              className: "sp-price-detail-modal__content",
              children: [
                (0, o.jsxs)(i.G7, {
                  className: "sp-price-detail-modal__intro",
                  children: [
                    (0, o.jsx)(i.xv, {
                      className: "sp-price-detail-modal__intro-title",
                      children: "价格明细",
                    }),
                    (0, o.jsxs)(i.xv, {
                      className: "sp-price-detail-modal__intro-tip",
                      children: [
                        "当前商品共购买",
                        _,
                        "件，优惠展示为分摊后的金额",
                      ],
                    }),
                  ],
                }),
                (0, o.jsxs)(i.G7, {
                  className: "sp-price-detail-modal__card",
                  children: [
                    (0, o.jsxs)(i.G7, {
                      className:
                        "sp-price-detail-modal__row sp-price-detail-modal__row--original",
                      children: [
                        (0, o.jsx)(i.xv, {
                          className: "sp-price-detail-modal__row-label",
                          children: "商品原价",
                        }),
                        (0, o.jsxs)(i.xv, {
                          className: "sp-price-detail-modal__row-value",
                          children: ["¥", r(l.goodsAmount)],
                        }),
                      ],
                    }),
                    (0, o.jsxs)(i.G7, {
                      className: "sp-price-detail-modal__discount-block",
                      children: [
                        l.goodsDiscount > 0 &&
                          (0, o.jsx)(d, {
                            label: "商品立减",
                            value: "-¥".concat(r(l.goodsDiscount)),
                            discount: !0,
                          }),
                        (0, o.jsx)(m, {
                          label: "促销",
                          amount: l.promotionDiscount,
                          items: l.promotionItems,
                        }),
                        (0, o.jsx)(m, {
                          label: "平台立减",
                          amount: l.platformDiscount,
                          items: l.platformItems,
                        }),
                        (0, o.jsx)(m, {
                          label: "优惠券",
                          amount: l.couponDiscount,
                          items: l.couponItems,
                        }),
                      ],
                    }),
                    (0, o.jsxs)(i.G7, {
                      className: "sp-price-detail-modal__total",
                      children: [
                        (0, o.jsx)(i.xv, {
                          className: "sp-price-detail-modal__total-label",
                          children: "优惠后价格",
                        }),
                        (0, o.jsxs)(i.xv, {
                          className: "sp-price-detail-modal__total-value",
                          children: ["¥", r(l.totalAfterDiscount)],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          });
        }
        (p.options = { addGlobalClass: !0 }), (a.Z = p);
      },
    },
  ]);
})();
