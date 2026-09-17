!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [7299],
    {
      70938: function (o, s, d) {
        var e = d(29439),
          a = (d(67294), d(71515)),
          c = d(78061),
          l = d(16800),
          t = d(85893),
          i = function (o) {
            var s = (Number(o) / 100).toFixed(2).split("."),
              d = (0, e.Z)(s, 2),
              a = d[0],
              c = d[1];
            return ""
              .concat(a.replace(/\B(?=(\d{3})+(?!\d))/g, ","), ".")
              .concat(c);
          };
        function n(o) {
          var s = o.products,
            d = void 0 === s ? [] : s;
          return d.length
            ? (0, t.jsx)(a.pf, {
                className: "sp-goods-reduction-detail-modal__product-scroll",
                scrollX: !0,
                enhanced: !0,
                enableFlex: !0,
                showScrollbar: !1,
                children: (0, t.jsx)(a.G7, {
                  className: "sp-goods-reduction-detail-modal__product-grid",
                  children: d.map(function (o) {
                    return (0,
                    t.jsxs)(a.G7, { className: "sp-goods-reduction-detail-modal__product", children: [(0, t.jsxs)(a.G7, { className: "sp-goods-reduction-detail-modal__product-imgwrap", children: [(0, t.jsx)(c.Ko, { className: "sp-goods-reduction-detail-modal__product-img", src: o.pic, mode: "aspectFill", width: 112, height: 112 }), (0, t.jsxs)(a.xv, { className: "sp-goods-reduction-detail-modal__product-badge", children: ["×", o.num] })] }), (0, t.jsxs)(a.xv, { className: "sp-goods-reduction-detail-modal__product-discount", children: ["-¥", i(o.discountAmount)] })] }, o.itemId);
                  }),
                }),
              })
            : null;
        }
        function r(o) {
          var s = o.visible,
            d = void 0 !== s && s,
            e = o.data,
            r = o.onClose,
            u = void 0 === r ? function () {} : r;
          if (!e) return null;
          var m = e.regions,
            p = void 0 === m ? [] : m,
            g = e.totalDiscount,
            _ = void 0 === g ? 0 : g;
          return (0, t.jsx)(c.o9, {
            className: "sp-goods-reduction-detail-modal",
            title: "商品立减",
            open: d,
            onClose: u,
            maxHeight: (0, l.dw)(),
            children: (0, t.jsxs)(a.G7, {
              className: "sp-goods-reduction-detail-modal__content",
              children: [
                (0, t.jsxs)(a.G7, {
                  className: "sp-goods-reduction-detail-modal__summary",
                  children: [
                    (0, t.jsx)(a.xv, {
                      className:
                        "sp-goods-reduction-detail-modal__summary-title",
                      children: "商品立减",
                    }),
                    (0, t.jsxs)(a.xv, {
                      className:
                        "sp-goods-reduction-detail-modal__summary-amount",
                      children: ["已优惠 ¥", i(_)],
                    }),
                  ],
                }),
                p.map(function (o, s) {
                  return (0,
                  t.jsxs)(a.G7, { className: "sp-goods-reduction-detail-modal__region-card", children: [(0, t.jsx)(a.xv, { className: "sp-goods-reduction-detail-modal__region-name", children: o.regionName }), (0, t.jsx)(n, { products: o.products })] }, "".concat(o.regionName, "-").concat(s));
                }),
              ],
            }),
          });
        }
        (r.options = { addGlobalClass: !0 }), (s.Z = r);
      },
    },
  ]);
})();
