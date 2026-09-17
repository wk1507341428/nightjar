!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [4160],
    {
      9453: function (s, e, a) {
        a(67294), a(31707), a(92954);
        var r = a(71515),
          c = a(78061),
          i = a(85893);
        function n(s) {
          var e = s.open,
            a = void 0 !== e && e,
            n = s.onClose,
            l = void 0 === n ? function () {} : n,
            o = s.onCreatePoster,
            h = void 0 === o ? function () {} : o,
            t = (s.onShareEdit, s.onSavePoster),
            m = void 0 === t ? function () {} : t,
            d = s.posterIsReady,
            x = void 0 !== d && d,
            p = s.title,
            j = void 0 === p ? "商品分享至" : p;
          return (0, i.jsx)(c.o9, {
            className: "sp-share",
            open: a,
            onClose: l,
            marker: !x,
            children: (0, i.jsxs)(r.G7, {
              className: "share-container",
              children: [
                (0, i.jsxs)(r.G7, {
                  className: "share-header",
                  children: [
                    (0, i.jsx)(r.xv, {
                      className: "share-header-txt",
                      children: j,
                    }),
                    (0, i.jsx)(c.Ko, {
                      src: "fv_close.png",
                      className: "share-header-close",
                      onClick: l,
                    }),
                  ],
                }),
                (0, i.jsxs)(r.G7, {
                  className: "share-bd",
                  children: [
                    (0, i.jsxs)(r.zx, {
                      className: "share-item",
                      openType: "share",
                      children: [
                        (0, i.jsx)(r.G7, {
                          className: "share-item-img-wrap",
                          children: (0, i.jsx)(c.Ko, {
                            className: "share-item-img",
                            src: "fv_wechat.png",
                          }),
                        }),
                        (0, i.jsx)(r.xv, {
                          className: "share-item-txt",
                          children: "微信好友",
                        }),
                      ],
                    }),
                    x
                      ? (0, i.jsxs)(r.G7, {
                          className: "share-item",
                          onClick: m,
                          children: [
                            (0, i.jsx)(r.G7, {
                              className: "share-item-img-wrap",
                              children: (0, i.jsx)(c.Ko, {
                                className: "share-item-img",
                                src: "fv_share_download.png",
                              }),
                            }),
                            (0, i.jsx)(r.xv, {
                              className: "share-item-txt",
                              children: "下载图片",
                            }),
                          ],
                        })
                      : (0, i.jsxs)(r.G7, {
                          className: "share-item",
                          onClick: h,
                          children: [
                            (0, i.jsx)(r.G7, {
                              className: "share-item-img-wrap",
                              children: (0, i.jsx)(c.Ko, {
                                className: "share-item-img",
                                src: "fv_poster.png",
                              }),
                            }),
                            (0, i.jsx)(r.xv, {
                              className: "share-item-txt",
                              children: "生成海报",
                            }),
                          ],
                        }),
                  ],
                }),
              ],
            }),
          });
        }
        (n.options = { addGlobalClass: !0 }), (e.Z = n);
      },
    },
  ]);
})();
