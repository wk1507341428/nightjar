!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [199],
    {
      39679: function (o, n, t) {
        t.d(n, {
          D: function () {
            return p;
          },
        });
        var u = t(45666),
          i = t(34034),
          r = t(99155),
          e = function (o) {
            if (
              void 0 !== (null == o ? void 0 : o.promotion_price) &&
              null !== (null == o ? void 0 : o.promotion_price)
            )
              return Number(o.promotion_price) || 0;
            var n = Number(o.num) || 1,
              t = Number(o.total_fee);
            return t > 0 ? t / n : c(o);
          },
          c = function (o) {
            var n = Number(null == o ? void 0 : o.act_price);
            if (
              null != (null == o ? void 0 : o.act_price) &&
              "" !== (null == o ? void 0 : o.act_price) &&
              n > 0
            )
              return n;
            if (
              void 0 !== (null == o ? void 0 : o.activity_price) &&
              null !== (null == o ? void 0 : o.activity_price)
            ) {
              var t = Number(o.activity_price);
              if (t > 0) return t;
            }
            if (
              null != (null == o ? void 0 : o.sale_price) &&
              "" !== (null == o ? void 0 : o.sale_price)
            ) {
              var u = Number(o.sale_price);
              if (u > 0) return u;
            }
            return Number(null == o ? void 0 : o.price) || 0;
          },
          l = function (o, n, t, i, r, e, c) {
            var l = Number(null == o ? void 0 : o.discount_fee),
              p = (function () {
                for (
                  var o = arguments.length, n = new Array(o), t = 0;
                  t < o;
                  t++
                )
                  n[t] = arguments[t];
                for (var u = 0, i = n; u < i.length; u++) {
                  var r = i[u],
                    e = String(null != r ? r : "").trim();
                  if (e) return e;
                }
                return "";
              })(o.info, o.rule, o.promotion_tag, o.title);
            l &&
              p &&
              ((0, u.vt)(null == o ? void 0 : o.type)
                ? a(n, r, { tag: p, amount: l })
                : (0, u.uk)(null == o ? void 0 : o.type)
                ? a(t, e, { tag: p, amount: l })
                : (0, u.D)(null == o ? void 0 : o.type) &&
                  a(i, c, { tag: p, amount: l }, o.coupon_code || o.id));
          },
          a = function (o, n, t) {
            var u =
                arguments.length > 3 && void 0 !== arguments[3]
                  ? arguments[3]
                  : "",
              i = u || "".concat(t.tag, "_").concat(t.amount);
            n.has(i) || (n.add(i), o.push(t));
          };
        function p() {
          var o =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            n = o.item,
            t = o.shop;
          if (!n) return null;
          var u = Number(n.num) || 1,
            c = e(n),
            a = (0, r.uJ)(n),
            p = [],
            v = [],
            m = new Set(),
            s = new Set();
          (n.discount_info || []).forEach(function (o) {
            l(o, p, v, [], m, s, new Set());
          });
          var d = (0, r.VO)(n),
            f = (0, i.AL)(n, t),
            _ = (0, r.uP)(n);
          _ || (_ = Number(n.promotion_discount) || 0);
          var b = (0, r.Aj)(n);
          b || (b = Number(n.platform_reduction) || 0);
          var g = Number(n.coupon_discount) || 0;
          g || (g = (0, r.bB)(n));
          var D = Number(n.total_fee) || c * u;
          return {
            unitPriceAfterDiscount: c,
            unitPriceLabel: "单件优惠后价格",
            goodsCount: u,
            goodsAmount: a,
            goodsDiscount: f,
            promotionDiscount: _,
            promotionItems: p,
            platformDiscount: b,
            platformItems: v,
            couponDiscount: g,
            couponItems: d,
            totalAfterDiscount: D,
            totalDiscount: (0, r.XW)({
              goodsDiscount: f,
              promotionDiscount: _,
              platformDiscount: b,
              couponDiscount: g,
            }),
          };
        }
      },
    },
  ]);
})();
