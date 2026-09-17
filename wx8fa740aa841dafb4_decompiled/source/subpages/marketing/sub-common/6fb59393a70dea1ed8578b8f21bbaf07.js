!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [1193],
    {
      68265: function (o, a, t) {
        var s = t(29439),
          i = (t(67294), t(71515)),
          l = t(78061),
          e = t(16800),
          n = t(85893),
          c = function (o) {
            var a = (Number(o) / 100).toFixed(2).split("."),
              t = (0, s.Z)(a, 2),
              i = t[0],
              l = t[1];
            return ""
              .concat(i.replace(/\B(?=(\d{3})+(?!\d))/g, ","), ".")
              .concat(l);
          };
        function d(o) {
          var a = o.products,
            t = void 0 === a ? [] : a;
          return t.length
            ? (0, n.jsx)(i.pf, {
                className: "sp-promotion-detail-modal__product-scroll",
                scrollX: !0,
                enhanced: !0,
                enableFlex: !0,
                showScrollbar: !1,
                children: (0, n.jsx)(i.G7, {
                  className: "sp-promotion-detail-modal__product-grid",
                  children: t.map(function (o) {
                    return (0,
                    n.jsxs)(i.G7, { className: "sp-promotion-detail-modal__product", children: [(0, n.jsxs)(i.G7, { className: "sp-promotion-detail-modal__product-imgwrap", children: [(0, n.jsx)(l.Ko, { className: "sp-promotion-detail-modal__product-img", src: o.pic, mode: "aspectFill", width: 112, height: 112 }), (0, n.jsxs)(i.xv, { className: "sp-promotion-detail-modal__product-badge", children: ["×", o.num] })] }), (0, n.jsxs)(i.xv, { className: "sp-promotion-detail-modal__product-discount", children: ["-¥", c(o.discountAmount)] })] }, o.itemId);
                  }),
                }),
              })
            : null;
        }
        function r(o) {
          var a = o.visible,
            t = void 0 !== a && a,
            s = o.data,
            r = o.title,
            m = void 0 === r ? "促销优惠" : r,
            p = o.onClose,
            u = void 0 === p ? function () {} : p;
          if (!s) return null;
          var _ = s.activities,
            x = void 0 === _ ? [] : _;
          return (0, n.jsx)(l.o9, {
            className: "sp-promotion-detail-modal",
            title: m,
            open: t,
            onClose: u,
            maxHeight: (0, e.dw)(),
            children: (0, n.jsx)(i.G7, {
              className: "sp-promotion-detail-modal__content",
              children: x.map(function (o, a) {
                return (0, n.jsxs)(
                  i.G7,
                  {
                    className: "sp-promotion-detail-modal__activity",
                    children: [
                      (0, n.jsxs)(i.G7, {
                        className: "sp-promotion-detail-modal__summary",
                        children: [
                          (0, n.jsx)(i.xv, {
                            className:
                              "sp-promotion-detail-modal__summary-title",
                            children: o.title,
                          }),
                          (0, n.jsxs)(i.xv, {
                            className:
                              "sp-promotion-detail-modal__summary-amount",
                            children: ["已优惠 ¥", c(o.totalDiscount)],
                          }),
                        ],
                      }),
                      o.regions.map(function (o, a) {
                        return (0,
                        n.jsxs)(i.G7, { className: "sp-promotion-detail-modal__region-card", children: [(0, n.jsx)(i.xv, { className: "sp-promotion-detail-modal__region-name", children: o.regionName }), o.activityTime ? (0, n.jsxs)(i.xv, { className: "sp-promotion-detail-modal__meta", children: ["活动时间：", o.activityTime] }) : null, o.activityRules ? (0, n.jsxs)(i.xv, { className: "sp-promotion-detail-modal__meta", children: ["活动规则：", o.activityRules] }) : null, (0, n.jsx)(d, { products: o.products })] }, "".concat(o.regionName, "-").concat(a));
                      }),
                    ],
                  },
                  "".concat(o.title, "-").concat(a)
                );
              }),
            }),
          });
        }
        (r.options = { addGlobalClass: !0 }), (a.Z = r);
      },
    },
  ]);
})();
