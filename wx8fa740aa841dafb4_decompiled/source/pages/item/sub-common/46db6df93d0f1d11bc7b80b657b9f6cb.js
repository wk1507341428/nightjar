!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [796],
    {
      52744: function (n, e, o) {
        var t = o(1413),
          a = o(45987),
          c = o(71515),
          i = o(92954),
          l = o.n(i),
          s = o(21066),
          u = o(85893),
          r = ["townTag"],
          g = function (n) {
            var e,
              o = (0, s.f0)({ autoLogin: !0 }).isLogin;
            return (0, u.jsxs)(c.G7, {
              className: "entry-wrap",
              onClick: function () {
                (n.needLogin && !o) ||
                  (l().navigateTo({
                    url: "/subpages/sevices/index/index",
                    success: function (e) {
                      var o = n || {},
                        c = o.townTag,
                        i = (0, a.Z)(o, r),
                        l = (0, t.Z)({}, i);
                      void 0 !== c && (l.townTag = c),
                        e.eventChannel.emit("acceptDataFromOpenerPage", l);
                    },
                  }),
                  (null == n ? void 0 : n.callback) &&
                    (null == n || n.callback()));
              },
              style: n.iconStyle,
              children: [
                n.showIcon &&
                  (0, u.jsx)(c.xv, {
                    className: "iconfont icon-a-iconsupport_agentgoumaizujian",
                    style:
                      null !== (e = n.iconStyle) && void 0 !== e && e.fontSize
                        ? { fontSize: n.iconStyle.fontSize }
                        : {},
                  }),
                n.text &&
                  (0, u.jsx)(c.xv, {
                    className: "entry-text",
                    children: n.text,
                  }),
              ],
            });
          };
        (g.defaultProps = {
          needLogin: !1,
          iconStyle: {},
          callback: function () {},
          product: null,
          showIcon: !0,
          townTag: void 0,
        }),
          (e.Z = g);
      },
    },
  ]);
})();
