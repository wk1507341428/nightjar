!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [7811],
    {
      68539: function (n, e, t) {
        var a = t(74165),
          r = t(15861),
          i = t(29439),
          s = t(67294),
          c = t(31707),
          o = t(92954),
          u = t.n(o),
          p = t(71515),
          l = t(90057),
          f = t(96856),
          d = t(1696),
          m = t(85893),
          x = { isWeAppKefu: !0 };
        function h(n) {
          var e = n.children,
            t = n.sessionFrom,
            h = void 0 === t ? "" : t,
            v = (0, l.x)(x),
            b = (0, i.Z)(v, 2),
            k = b[0],
            C = b[1],
            g = k.isWeAppKefu,
            w = (0, c.v9)(function (n) {
              return n.sys;
            }),
            _ = w.echat,
            F = w.meiqia,
            Z = (0, o.getCurrentInstance)();
          (0, s.useEffect)(function () {
            y();
          }, []);
          var y = function () {
              ("true" == (null == _ ? void 0 : _.is_open) ||
                (null != F && F.is_open)) &&
                C(function (n) {
                  n.isWeAppKefu = !1;
                });
            },
            I = (function () {
              var n = (0, r.Z)(
                (0, a.Z)().mark(function n() {
                  var e, t, r, i, s, c, o;
                  return (0, a.Z)().wrap(function (n) {
                    for (;;)
                      switch ((n.prev = n.next)) {
                        case 0:
                          if ("true" != (null == _ ? void 0 : _.is_open)) {
                            n.next = 4;
                            break;
                          }
                          _.echat_url
                            ? u().navigateTo({
                                url: "/pages/chat/index?url=".concat(
                                  encodeURIComponent(_.echat_url)
                                ),
                              })
                            : (0, f.CF)("请配置一洽客服链接"),
                            (n.next = 15);
                          break;
                        case 4:
                          if (null == F || !F.is_open) {
                            n.next = 15;
                            break;
                          }
                          return (
                            (t =
                              (null == Z ||
                              null === (e = Z.router) ||
                              void 0 === e
                                ? void 0
                                : e.params) || {}),
                            (r = t.dtid),
                            (n.next = 8),
                            d.Z.im.getImConfigByDistributor(r)
                          );
                        case 8:
                          if (
                            ((i = n.sent),
                            (s = i.channel),
                            (c = i.meiqia_url),
                            (o = ""),
                            "multi" == s
                              ? f.FO
                                ? (o = c.wxapp)
                                : f.$L
                                ? (o = c.h5)
                                : (0, f.YO)() && (o = c.app)
                              : (o = c.common),
                            o)
                          ) {
                            n.next = 14;
                            break;
                          }
                          return n.abrupt(
                            "return",
                            (0, f.CF)("客服暂不在线，请稍后再试~")
                          );
                        case 14:
                          u().navigateTo({
                            url: "/pages/chat/index?url=".concat(
                              encodeURIComponent(o)
                            ),
                          });
                        case 15:
                        case "end":
                          return n.stop();
                      }
                  }, n);
                })
              );
              return function () {
                return n.apply(this, arguments);
              };
            })();
          return (0, m.jsxs)(p.G7, {
            className: "sp-chat",
            children: [
              g &&
                f.FO &&
                (0, m.jsx)(p.zx, {
                  className: "btn-cantact",
                  openType: "contact",
                  sessionFrom: h,
                  children: e,
                }),
              !g &&
                (0, m.jsx)(p.G7, { className: "", onClick: I, children: e }),
            ],
          });
        }
        (h.options = { addGlobalClass: !0 }), (e.Z = h);
      },
    },
  ]);
})();
