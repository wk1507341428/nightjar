!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [4300],
    {
      32675: function (e, l, o) {
        var r = o(1413),
          n = (o(92954), o(67294)),
          s = o(71515),
          a = o(78061),
          c = o(21066),
          t = o(96856),
          i = o(85893),
          d = n.memo(
            n.forwardRef(function (e, l) {
              var o = (0, c.qt)({
                  fetch: e.fetch,
                  auto: e.auto,
                  pageSize: e.pageSize,
                }),
                d = o.page,
                h = o.getTotal,
                u = o.nextPage,
                p = o.resetPage;
              (0, n.useImperativeHandle)(l, function () {
                return {
                  reset: function () {
                    p();
                  },
                  refresh: function () {
                    p();
                  },
                };
              });
              return (0, i.jsxs)(s.pf, {
                className: (0, t.AK)("sp-scrollview-native", e.className),
                scrollX: e.scrollX,
                scrollY: !e.scrollX && e.scrollY,
                style: (0, r.Z)(
                  {
                    height: "".concat(e.height, "px"),
                    "background-color": "red",
                  },
                  e.style
                ),
                enhanced: e.enhanced,
                showScrollbar: e.showScrollbar,
                lowerThreshold: e.lowerThreshold,
                onScrollToLower: function (e) {
                  e.detail.direction, d.hasMore && !d.loading && u();
                },
                scrollTop: e.scrollTop,
                scrollWithAnimation: !0,
                enableFlex: !0,
                onScroll: function (l) {
                  var o;
                  null == e ||
                    null === (o = e.onScroll) ||
                    void 0 === o ||
                    o.call(e, l);
                },
                scrollIntoView: e.scrollIntoView,
                children: [
                  (0, i.jsx)(s.G7, { className: "sp-scrollview-native__top" }),
                  (0, i.jsx)(s.G7, {
                    className: "sp-scrollview-native__body",
                    children: e.children,
                  }),
                  (0, i.jsxs)(s.G7, {
                    className: "sp-scrollview-native__bottom",
                    children: [
                      d.loading && d.hasMore
                        ? e.renderLoading ||
                          (0, i.jsx)(a.m6, { children: "正在加载..." })
                        : null,
                      !d.loading && !d.hasMore && h() > 0
                        ? e.renderMore ||
                          (0, i.jsx)(a.Up, {
                            className: "no-more",
                            title: "--没有更多数据了--",
                          })
                        : null,
                      d.hasMore || 0 != h()
                        ? null
                        : e.renderEmpty ||
                          (0, i.jsx)(a.Up, {
                            className: "result-empty",
                            title: "抱歉！没有找到相关结果",
                          }),
                    ],
                  }),
                ],
              });
            })
          );
        (d.options = { addGlobalClass: !0 }),
          (d.defaultProps = {
            auto: !1,
            children: "",
            className: "",
            style: {},
            enhanced: !1,
            height: 500,
            lowerThreshold: 200,
            pageSize: 10,
            renderMore: null,
            renderEmpty: null,
            renderLoading: null,
            scrollX: !1,
            scrollY: !1,
            showScrollbar: !1,
            fetch: function () {},
            onLoad: function () {},
            scrollTop: 0,
          }),
          (l.Z = d);
      },
    },
  ]);
})();
