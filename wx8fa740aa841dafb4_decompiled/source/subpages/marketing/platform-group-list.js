!(function () {
  "use strict";
  require("./sub-vendors.js"),
    require("./sub-common/899d73213da416588facf8e40fb36354.js"),
    require("./sub-common/7c9e96d4e67eed876cde3fb8eb9a7a6d.js"),
    require("./sub-common/9c36ef1738753403dbec58e763490484.js"),
    require("./sub-common/14338409af789766c313815505161df5.js"),
    require("./sub-common/de5bf73e54154c797a164e4122d0c0dc.js"),
    require("./sub-common/4167e5dedb0650e7db907e399b6a590f.js"),
    require("./sub-common/41fdb3fd793f3b42b690b58df803a6f4.js"),
    require("./sub-common/f586f63ff06ee16371885aba8635b8f1.js"),
    require("./sub-common/4bbea5a055fe8276004d2b0a53c911a4.js"),
    require("./sub-common/82f8cc24ac4107e308710e4de7eb4661.js"),
    require("./sub-common/6fb59393a70dea1ed8578b8f21bbaf07.js"),
    require("./sub-common/fd7eb236de4449263469ea99c14e228f.js"),
    require("./sub-common/31435c7bf5861bf987003454a80b776f.js"),
    require("./sub-common/209d88bfa71346c59d575002cc1dab65.js"),
    require("./sub-common/42cd5e48a3f84fca66dbc78b7568c54f.js"),
    require("./sub-common/7b9cb83d1423d521c6a502f67a775cd8.js"),
    require("./sub-common/9e06b0805cd226c23e1e3cab2329b411.js"),
    require("./sub-common/ca3b01c5698d177859143ce457deb158.js"),
    require("./sub-common/03af81d622adb2411fd11e6f0c1c2f5e.js"),
    require("./sub-common/847da300ae1911ce8862bccfb1d37ced.js"),
    require("./sub-common/9e8e829f282985b09050c317d8804b36.js"),
    require("./sub-common/8c6e156887d7890f00a2c77737716f3a.js"),
    require("./sub-common/88db826e1c9ed27d9611be95e496da7c.js"),
    require("./sub-common/c8103d06255907d1e165f9f0a647fb3e.js"),
    require("./sub-common/d73117510a6aa77ec2d8ef13b347a13c.js"),
    require("./sub-common/66c73cdbf64b40d1999588c9091697ca.js"),
    require("./sub-common/74ee74f95916bef6ef514b31ee03c4c8.js"),
    require("./sub-common/07685315e736f01f70accc1bedfed941.js"),
    require("./sub-common/345fe984afab6a5919df6f615acf2e48.js"),
    require("./sub-common/97e8f5e0d665eaccf444a406c1e347da.js"),
    require("./sub-common/ec8bdfe232eefc1b37fe14caf80f2bf9.js"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [8266],
      {
        24963: function (e, r, n) {
          var s = n(32180),
            c = n(74165),
            a = n(15861),
            o = n(29439),
            t = n(67294),
            i = n(92954),
            u = n.n(i),
            l = n(90057),
            d = n(71515),
            m = n(67197),
            f = n(78061),
            b = n(98178),
            p = n(96856),
            g = n(27741),
            j = n(1696),
            x = n(92653),
            h = n(85893),
            _ = {
              bgImgeUrl: "".concat(
                "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                "/fv_group_bg.png?t=1"
              ),
              titleImgeUrl: "".concat(
                "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                "/fv_group_title.png"
              ),
              groupInfo: {},
              goodsList: [],
              isDisabled: !1,
              isLoading: !0,
              virtualWaterfallHeight: 0,
              isRuleOpened: !1,
            };
          function v() {
            var e = (0, l.x)(_),
              r = (0, o.Z)(e, 2),
              n = r[0],
              s = r[1],
              v = n.bgImgeUrl,
              q = n.titleImgeUrl,
              N = n.groupInfo,
              G = n.goodsList,
              w = n.isDisabled,
              I = n.isLoading,
              k = n.isRuleOpened,
              Z = (0, t.useRef)(null),
              y = (0, i.getCurrentInstance)();
            (0, t.useEffect)(function () {
              var e,
                r = u().getSystemInfoSync().windowHeight;
              s(function (e) {
                e.virtualWaterfallHeight = r - 160;
              }),
                (0, p.OO)("subpages/marketing/platform-group-list") &&
                  (O(), null === (e = Z.current) || void 0 === e || e.reset());
            }, []),
              (0, i.useDidShow)(function () {
                var e;
                p.N_.postCenterTask({
                  ruleId:
                    null == y ||
                    null === (e = y.router) ||
                    void 0 === e ||
                    null === (e = e.params) ||
                    void 0 === e
                      ? void 0
                      : e.ruleId,
                });
              }),
              (0, i.useShareAppMessage)(
                (0, a.Z)(
                  (0, c.Z)().mark(function e() {
                    var r, n, s, a;
                    return (0, c.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), p.N_.getRouteParams();
                          case 2:
                            return (
                              (r = e.sent),
                              (n = r.id),
                              (s = r.crmcode),
                              (a = "/subpages/marketing/platform-group-list?id="
                                .concat(n, "&crmcode=")
                                .concat(s)),
                              e.abrupt("return", {
                                title:
                                  (null == N ? void 0 : N.share_title) ||
                                  "平台拼团购",
                                path: a,
                                imageUrl:
                                  (null == N ? void 0 : N.share_pic) || "",
                              })
                            );
                          case 7:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                )
              );
            var O = (function () {
                var e = (0, a.Z)(
                  (0, c.Z)().mark(function e() {
                    var r, n, a, o;
                    return (0, c.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.prev = 0),
                                (e.next = 3),
                                p.N_.getRouteParams()
                              );
                            case 3:
                              if (((r = e.sent), (n = r.id))) {
                                e.next = 7;
                                break;
                              }
                              return e.abrupt("return");
                            case 7:
                              return (
                                (e.next = 9),
                                j.Z.wgts.getPromotion({
                                  collection_id: n,
                                  activity_type: "groups",
                                  page_type: "platform",
                                  noRegionauth: !0,
                                })
                              );
                            case 9:
                              (a = e.sent),
                                (o = a.info) && (0, p.Kn)(o)
                                  ? s(function (e) {
                                      (e.isLoading = !1),
                                        (e.groupInfo = o),
                                        (e.bgImgeUrl = o.header_pic || v);
                                    })
                                  : s(function (e) {
                                      (e.isLoading = !1), (e.isDisabled = !0);
                                    }),
                                (e.next = 17);
                              break;
                            case 14:
                              (e.prev = 14),
                                (e.t0 = e.catch(0)),
                                s(function (e) {
                                  (e.isLoading = !1), (e.isDisabled = !0);
                                });
                            case 17:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 14]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              R = (function () {
                var e = (0, a.Z)(
                  (0, c.Z)().mark(function e(r) {
                    var n, a, o, t, i, u, l, d, m, f;
                    return (0, c.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (n = r.pageIndex),
                              (a = void 0 === n ? 1 : n),
                              (o = r.pageSize),
                              (e.next = 3),
                              p.N_.getRouteParams()
                            );
                          case 3:
                            if (((t = e.sent), (i = t.id))) {
                              e.next = 7;
                              break;
                            }
                            return e.abrupt("return", { total: 0 });
                          case 7:
                            return (
                              (e.next = 9),
                              j.Z.wgts.getPromotion({
                                collection_id: i,
                                activity_type: "groups",
                                page_type: "platform",
                                noRegionauth: !0,
                                page: a,
                                pageSize: o,
                              })
                            );
                          case 9:
                            return (
                              (u = e.sent),
                              (l = u.list),
                              (d = u.total_count),
                              (m = u.info),
                              (f = (0, p.D9)(l, g.Z.goods.GROUP_GOODS_ITEM)),
                              s(function (e) {
                                (e.goodsList[a - 1] = f),
                                  1 === a &&
                                    m &&
                                    ((e.groupInfo = m),
                                    (e.bgImgeUrl = m.header_pic || v)),
                                  (e.isLoading = !1);
                              }),
                              e.abrupt("return", { total: d })
                            );
                          case 16:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (r) {
                  return e.apply(this, arguments);
                };
              })(),
              L = function () {
                s(function (e) {
                  e.isRuleOpened = !1;
                });
              };
            return (0, h.jsxs)(f.nO, {
              immersive: !w,
              navigationLeftBlockWidthFull: !0,
              renderNavigation: w
                ? (0, h.jsx)(d.G7, {
                    className: "text-center w-full nav-title",
                    children: "平台拼团购",
                  })
                : (0, h.jsx)(d.G7, {
                    className: "flex flex-1 justify-items-center items-center",
                    children: (0, h.jsx)(f.Ko, {
                      width: 110,
                      height: 38,
                      src: q,
                    }),
                  }),
              className: "page-platform-group-list",
              children: [
                w
                  ? (0, h.jsxs)(d.G7, {
                      className: "no-limited",
                      children: [
                        (0, h.jsx)(d.G7, {
                          className: "no-limited__icon",
                          children: (0, h.jsx)(d.xv, {
                            className: "iconfont icon-a-iconinbox",
                          }),
                        }),
                        (0, h.jsxs)(d.G7, {
                          className: "no-limited__text",
                          children: [
                            (0, h.jsx)(d.G7, {
                              className: "text-center",
                              children: "无正在拼团的商品",
                            }),
                            (0, h.jsx)(d.G7, {
                              className: "text-center",
                              children: "去商城看看其他商品吧",
                            }),
                          ],
                        }),
                      ],
                    })
                  : (0, h.jsxs)(h.Fragment, {
                      children: [
                        I
                          ? (0, h.jsx)(d.G7, { className: "bg-box" })
                          : (0, h.jsx)(d.G7, {
                              className: "bg-box",
                              style: (0, p.Tu)({
                                "background-image": "url(".concat(v, ")"),
                              }),
                              children: (0, h.jsx)(d.G7, {
                                className: "bg-box__hd",
                                children: (0, h.jsxs)(d.G7, {
                                  className: "limited-rule",
                                  onClick: function () {
                                    s(function (e) {
                                      e.isRuleOpened = !0;
                                    });
                                  },
                                  children: [
                                    (0, h.jsx)(d.G7, {
                                      className: "iconfont icon-info",
                                    }),
                                    (0, h.jsx)(d.G7, {
                                      className: "limited-rule__text",
                                      children: "活动规则",
                                    }),
                                  ],
                                }),
                              }),
                            }),
                        (0, h.jsx)(d.G7, {
                          className: "page-platform-group-list__scrollview-bg",
                        }),
                        (0, h.jsx)(b.ii, {
                          scrollY: !0,
                          ref: Z,
                          fetch: R,
                          pageSize: 1e3,
                          height: n.virtualWaterfallHeight,
                          renderMore: function () {
                            return (0, h.jsx)(h.Fragment, {});
                          },
                          children: (0, h.jsx)(d.G7, {
                            className: "page-platform-group-list__main",
                            children:
                              null == G
                                ? void 0
                                : G.map(function (e) {
                                    return null == e
                                      ? void 0
                                      : e.map(function (e) {
                                          return (0,
                                          h.jsx)(d.G7, { className: "page-platform-group-list__item", children: (0, h.jsx)(x.Z, { info: e }) }, e.itemId);
                                        });
                                  }),
                          }),
                        }),
                      ],
                    }),
                (0, h.jsx)(d.G7, {
                  className: "rule-modal",
                  children: (0, h.jsx)(m.Z, {
                    isOpened: k,
                    onClose: L,
                    children: (0, h.jsxs)(d.G7, {
                      className: "rule-modal-box",
                      children: [
                        (0, h.jsx)(d.G7, {
                          className: "rule-modal__header",
                          children: "拼团规则",
                        }),
                        (0, h.jsx)(d.pf, {
                          scrollY: !0,
                          className: "rule-modal__scroll",
                          children: (0, h.jsx)(d.G7, {
                            className: "rule-modal__content",
                            children: N.collection_desc,
                          }),
                        }),
                        (0, h.jsx)(d.G7, {
                          className: "rule-modal__footer",
                          children: (0, h.jsx)(d.G7, {
                            className: "confirm-btn",
                            onClick: L,
                            children: "我知道了",
                          }),
                        }),
                      ],
                    }),
                  }),
                }),
              ],
            });
          }
          (v.enableShareAppMessage = !0),
            Page(
              (0, s.createPageConfig)(
                v,
                "subpages/marketing/platform-group-list",
                { root: { cn: [] } },
                { navigationStyle: "custom", navigationBarTitleText: "" } || {}
              )
            );
        },
      },
      function (e) {
        e.O(
          0,
          [
            2500, 6758, 7531, 2881, 6437, 5014, 3096, 6010, 8206, 9246, 5710,
            6549, 6220, 1497, 1193, 2903, 4508, 9741, 7312, 7811, 7299, 1699,
            761, 7677, 2817, 9887, 3197, 9651, 5386, 7576, 4300, 998, 2224,
            2302, 8322, 3139, 7502, 8075, 6353, 3921, 7162, 4487, 9658, 5200,
            9444, 9934, 396, 7078, 5469, 2592, 3455, 7453, 1471, 5987, 1871,
            7738, 4539, 2107, 1216, 8592,
          ],
          function () {
            return (function (r) {
              return e((e.s = r));
            })(24963);
          }
        ),
          e.O();
      },
    ]);
})();
