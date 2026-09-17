!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [4487],
    {
      60414: function (e, n, c) {
        var s = c(36459),
          i = c(29439),
          t = (c(67294), c(92954)),
          r = c.n(t),
          l = c(90057),
          a = c(71515),
          o = c(85893),
          m = {};
        n.Z = function (e) {
          var n,
            c = (0, l.x)(m),
            t = (0, i.Z)(c, 2),
            u = t[0];
          t[1], (0, s.Z)(u);
          var p = e.item,
            d =
              (e.children,
              function (e) {
                r().previewImage({ urls: p.pics, current: p.pics[e] });
              });
          return (0, o.jsxs)(a.G7, {
            className: "time-line-item",
            children: [
              (0, o.jsx)(a.G7, { className: "left-dot" }),
              (0, o.jsxs)(a.G7, {
                className: "content",
                children: [
                  (0, o.jsx)(a.G7, {
                    className: "content-title",
                    children: p.title,
                  }),
                  p.delivery_remark &&
                    (0, o.jsxs)(a.G7, {
                      className: "content-remark",
                      children: ["订单备注：", p.delivery_remark],
                    }),
                  p.pics.length > 0 &&
                    (0, o.jsxs)(a.G7, {
                      children: [
                        "照片上传：",
                        (0, o.jsx)(a.G7, {
                          className: "content-pic",
                          children:
                            null === (n = p.pics) || void 0 === n
                              ? void 0
                              : n.map(function (e, n) {
                                  return (0, o.jsx)(
                                    a.Ee,
                                    {
                                      src: e,
                                      className: "content-pic-item",
                                      onClick: function () {
                                        return d(n);
                                      },
                                    },
                                    n
                                  );
                                }),
                        }),
                      ],
                    }),
                ],
              }),
            ],
          });
        };
      },
    },
  ]);
})();
