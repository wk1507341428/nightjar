!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [8206],
    {
      96295: function (e, t, r) {
        var s = r(74165),
          a = r(93433),
          i = r(15861),
          l = r(29439),
          n = r(71515),
          o = r(67294),
          c = r(78061),
          d = r(90057),
          m = r(96856),
          p = r(92954),
          u = r.n(p),
          h = r(73816),
          x = r(1696),
          f = r(85893),
          g = { completeHistoryData: [], hasMore: !0, pageSize: 10, page: 1 };
        function v(e) {
          var t = (0, d.x)(g),
            r = (0, l.Z)(t, 2),
            p = r[0],
            v = r[1],
            j = p.completeHistoryData,
            G = p.hasMore,
            N = p.pageSize,
            w = p.page,
            Z = e.isOpenedComplete,
            k = e.handleCLoseComplete,
            y = e.activity_id,
            _ = e.rule_id;
          (0, o.useEffect)(
            function () {
              Z &&
                (v(function (e) {
                  (e.page = 1), (e.hasMore = !0);
                }),
                D());
            },
            [Z]
          );
          var D = (function () {
            var e = (0, i.Z)(
              (0, s.Z)().mark(function e() {
                var t,
                  r,
                  i = arguments;
                return (0, s.Z)().wrap(function (e) {
                  for (;;)
                    switch ((e.prev = e.next)) {
                      case 0:
                        return (
                          (t = i.length > 0 && void 0 !== i[0] && i[0])
                            ? u().showLoading({
                                title: "加载更多...",
                                mark: !0,
                              })
                            : u().showLoading({ title: "加载中...", mark: !0 }),
                          (e.next = 4),
                          x.Z.task.getBindShareList({
                            rule_id: _,
                            activity_id: y,
                            pageSize: N,
                            page: t ? w : 1,
                          })
                        );
                      case 4:
                        (r = e.sent),
                          v(function (e) {
                            (e.completeHistoryData = t
                              ? [].concat(
                                  (0, a.Z)(e.completeHistoryData),
                                  (0, a.Z)((null == r ? void 0 : r.list) || [])
                                )
                              : (null == r ? void 0 : r.list) || []),
                              (e.page = t ? w + 1 : 2),
                              (e.hasMore =
                                ((null == r ? void 0 : r.list) || []).length ===
                                N);
                          });
                      case 6:
                      case "end":
                        return e.stop();
                    }
                }, e);
              })
            );
            return function () {
              return e.apply(this, arguments);
            };
          })();
          u().hideLoading();
          return (0, f.jsx)(n.G7, {
            className: "complete-record",
            children: (0, f.jsx)(h.Z, {
              title: "邀请好友任务完成记录",
              scrollY: !0,
              onScrollToLower: function () {
                G && D(!0);
              },
              isOpened: Z,
              onClose: k,
              children: (0, f.jsxs)(n.G7, {
                children: [
                  j.map(function (e, t) {
                    var r, s;
                    return (0,
                    f.jsxs)(f.Fragment, { children: [(0, f.jsxs)(n.G7, { className: "complete-record-left", children: [(0, f.jsxs)(n.G7, { className: "complete-record-left-imgtxt", children: [(0, f.jsx)(n.G7, { children: (0, f.jsx)(c.Ko, { className: "task-img", width: 82, height: 82, src: (null == e || null === (r = e.member_info) || void 0 === r ? void 0 : r.avatar) || "fv_user.png" }) }), (0, f.jsx)(n.G7, { className: "complete-record-left-txt", children: null == e || null === (s = e.member_info) || void 0 === s ? void 0 : s.username })] }), (0, f.jsxs)(n.G7, { className: "complete-record-right", children: [(0, f.jsx)(n.G7, { className: "complete-record-right-txt", children: "已完成" }), (0, f.jsx)(n.G7, { className: "complete-record-right-time", children: (0, m.mr)(1e3 * (null == e ? void 0 : e.created), "YYYY-MM-DD HH:mm") })] })] }), (0, f.jsx)(n.G7, { className: "divider" })] });
                  }),
                  G &&
                    (0, f.jsx)(n.G7, {
                      className: "load-more",
                      children: "加载更多...",
                    }),
                  !G &&
                    (0, f.jsx)(n.G7, {
                      className: "no-more",
                      children: "没有更多数据了",
                    }),
                ],
              }),
            }),
          });
        }
        (v.options = { addGlobalClass: !0 }), (v.defaultProps = {}), (t.Z = v);
      },
    },
  ]);
})();
