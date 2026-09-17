!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [6511],
    {
      34034: function (t, n, r) {
        r.d(n, {
          AL: function () {
            return e;
          },
          Qm: function () {
            return o;
          },
        });
        var i = r(99155),
          u = function (t) {
            return (
              "gift" === (null == t ? void 0 : t.order_item_type) ||
              "gift" === (null == t ? void 0 : t.orderItemType) ||
              !0 === (null == t ? void 0 : t.is_gift) ||
              "1" === (null == t ? void 0 : t.is_gift) ||
              !0 === (null == t ? void 0 : t.isGift)
            );
          };
        function e(t, n) {
          if (!t || u(t)) return 0;
          if (Object.prototype.hasOwnProperty.call(t, "product_discount_fee"))
            return Math.trunc(Number(t.product_discount_fee) || 0);
          var r = (0, i.K7)(t);
          if (r > 0) return r;
          if (
            Object.prototype.hasOwnProperty.call(
              t,
              "single_product_discount_fee"
            )
          )
            return 0;
          var e = Number(t.product_reduction);
          if (e > 0) return e;
          var o = Number(null == n ? void 0 : n.product_reduction),
            c = ((null == n ? void 0 : n.items) || []).filter(function (t) {
              return !u(t);
            });
          return o > 0 &&
            1 === c.length &&
            String(c[0].item_id) === String(t.item_id)
            ? o
            : r;
        }
        function o() {
          var t =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            n = t.shops,
            r = t.totalSummary,
            u = new Map();
          (n || []).forEach(function (t) {
            var n,
              r,
              i,
              o = String(
                t.regionauth_name ||
                  (null === (n = t.items) ||
                  void 0 === n ||
                  null === (n = n[0]) ||
                  void 0 === n
                    ? void 0
                    : n.regionauth_name) ||
                  ""
              ).trim(),
              c =
                null !== (r = t.regionauth_id) && void 0 !== r
                  ? r
                  : null === (i = t.items) ||
                    void 0 === i ||
                    null === (i = i[0]) ||
                    void 0 === i
                  ? void 0
                  : i.regionauth_id,
              d = null != c && "" !== c && "0" !== String(c) ? String(c) : o;
            if (d) {
              u.has(d) || u.set(d, { regionName: o, productMap: new Map() });
              var a = u.get(d);
              !a.regionName && o && (a.regionName = o),
                (t.items || []).forEach(function (n) {
                  var r = e(n, t);
                  if (r) {
                    var i = String(n.item_id),
                      u = a.productMap.get(i);
                    if (u)
                      return (
                        (u.discountAmount += r),
                        void (u.num += Number(n.num) || 0)
                      );
                    a.productMap.set(i, {
                      itemId: n.item_id,
                      pic: n.pic,
                      num: Number(n.num) || 1,
                      discountAmount: r,
                    });
                  }
                });
            }
          });
          var o = [];
          if (
            (u.forEach(function (t) {
              var n = Array.from(t.productMap.values());
              n.length && o.push({ regionName: t.regionName, products: n });
            }),
            !o.length)
          )
            return null;
          var c = o.reduce(function (t, n) {
            return (
              t +
              n.products.reduce(function (t, n) {
                return t + n.discountAmount;
              }, 0)
            );
          }, 0);
          return {
            totalDiscount: (0, i.bO)(
              c,
              null == r ? void 0 : r.product_reduction
            ),
            regions: o,
          };
        }
      },
    },
  ]);
})();
