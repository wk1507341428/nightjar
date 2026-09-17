!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [7738],
    {
      64567: function (n, u, o) {
        o.d(u, {
          n: function () {
            return t;
          },
        });
        var r = ["1", "5", "6", "7"];
        function t() {
          var n,
            u =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            o = String(
              null !== (n = null == u ? void 0 : u.progressStatus) &&
                void 0 !== n
                ? n
                : ""
            ),
            t = r.includes(o),
            e = Number(null == u ? void 0 : u.refundedNum) || 0;
          return e > 0 || t
            ? e === Number(null == u ? void 0 : u.num)
              ? "退款成功"
              : t
              ? "退款售后中"
              : "已退款成功".concat(e, "件")
            : "";
        }
      },
    },
  ]);
})();
