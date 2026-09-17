!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [6549],
    {
      41820: function (o, a, d) {
        var e = d(29439),
          l = (d(67294), d(71515)),
          c = d(78061),
          s = d(96856),
          r = d(16800),
          n = d(85893),
          i = function (o) {
            var a = (Number(o) / 100).toFixed(2).split("."),
              d = (0, e.Z)(a, 2),
              l = d[0],
              c = d[1];
            return ""
              .concat(l.replace(/\B(?=(\d{3})+(?!\d))/g, ","), ".")
              .concat(c);
          };
        function p(o) {
          var a = o.coupon,
            d = void 0 === a ? {} : a,
            e = d.title,
            r = d.typeTag,
            p = d.channelTag,
            t = d.couponCode,
            u = d.discountAmount,
            m = d.icon;
          return (0, n.jsxs)(l.G7, {
            className: "sp-order-coupon-detail-modal__card",
            children: [
              (0, n.jsx)(l.G7, {
                className: "sp-order-coupon-detail-modal__card-pic",
                children: m
                  ? (0, n.jsx)(c.Ko, {
                      className: "sp-order-coupon-detail-modal__card-img",
                      src: m,
                      mode: "aspectFill",
                      width: 160,
                      height: 160,
                    })
                  : (0, n.jsx)(l.G7, {
                      className:
                        "sp-order-coupon-detail-modal__card-img sp-order-coupon-detail-modal__card-img--placeholder",
                    }),
              }),
              (0, n.jsxs)(l.G7, {
                className: "sp-order-coupon-detail-modal__card-body",
                children: [
                  (0, n.jsx)(l.xv, {
                    className: "sp-order-coupon-detail-modal__card-title",
                    children: e,
                  }),
                  (0, n.jsxs)(l.G7, {
                    className: "sp-order-coupon-detail-modal__card-tags",
                    children: [
                      r
                        ? (0, n.jsx)(l.xv, {
                            className:
                              "sp-order-coupon-detail-modal__card-tag sp-order-coupon-detail-modal__card-tag--type",
                            children: r,
                          })
                        : null,
                      p
                        ? (0, n.jsx)(l.xv, {
                            className:
                              "sp-order-coupon-detail-modal__card-tag sp-order-coupon-detail-modal__card-tag--channel",
                            children: p,
                          })
                        : null,
                    ],
                  }),
                  t
                    ? (0, n.jsxs)(l.G7, {
                        className: "sp-order-coupon-detail-modal__card-code",
                        onClick: function (o) {
                          o.stopPropagation(), t && (0, s.zp)(t, "券码已复制");
                        },
                        children: [
                          (0, n.jsx)(l.xv, {
                            className:
                              "sp-order-coupon-detail-modal__card-code-label",
                            children: "券码",
                          }),
                          (0, n.jsxs)(l.G7, {
                            className:
                              "sp-order-coupon-detail-modal__card-code-value-wrap",
                            children: [
                              (0, n.jsx)(l.xv, {
                                className:
                                  "sp-order-coupon-detail-modal__card-code-value",
                                children: t,
                              }),
                              (0, n.jsx)(c.Ko, {
                                className:
                                  "sp-order-coupon-detail-modal__card-code-icon",
                                src: "fv_copy_order.png",
                                width: 24,
                                height: 24,
                              }),
                            ],
                          }),
                        ],
                      })
                    : null,
                ],
              }),
              (0, n.jsxs)(l.G7, {
                className: "sp-order-coupon-detail-modal__card-action",
                children: [
                  (0, n.jsx)(l.xv, {
                    className:
                      "sp-order-coupon-detail-modal__card-action-label",
                    children: "已优惠",
                  }),
                  (0, n.jsxs)(l.xv, {
                    className:
                      "sp-order-coupon-detail-modal__card-action-amount",
                    children: ["¥", i(u)],
                  }),
                ],
              }),
            ],
          });
        }
        function t(o) {
          var a,
            d = o.visible,
            e = void 0 !== d && d,
            s = o.data,
            i = o.onClose,
            t = void 0 === i ? function () {} : i;
          if (
            null == s ||
            null === (a = s.coupons) ||
            void 0 === a ||
            !a.length
          )
            return null;
          var u = s.coupons,
            m = void 0 === u ? [] : u;
          return (0, n.jsx)(c.o9, {
            className: "sp-order-coupon-detail-modal",
            title: "优惠券明细",
            open: e,
            onClose: t,
            maxHeight: (0, r.dw)(),
            children: (0, n.jsxs)(l.G7, {
              className: "sp-order-coupon-detail-modal__wrap",
              children: [
                (0, n.jsx)(l.pf, {
                  className: "sp-order-coupon-detail-modal__scroll",
                  scrollY: !0,
                  enhanced: !0,
                  showScrollbar: !1,
                  children: (0, n.jsx)(l.G7, {
                    className: "sp-order-coupon-detail-modal__list",
                    children: m.map(function (o) {
                      return (0, n.jsx)(p, { coupon: o }, o.id);
                    }),
                  }),
                }),
                (0, n.jsx)(l.G7, {
                  className: "sp-order-coupon-detail-modal__fade",
                }),
              ],
            }),
          });
        }
        (t.options = { addGlobalClass: !0 }), (a.Z = t);
      },
    },
  ]);
})();
