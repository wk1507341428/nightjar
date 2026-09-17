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
      [4737],
      {
        34647: function (e, n, r) {
          var s = r(32180),
            c = r(74165),
            o = r(15861),
            a = r(29439),
            i = r(67294),
            t = r(92954),
            u = r.n(t),
            l = r(90057),
            d = r(31707),
            f = r(71515),
            m = r(67197),
            b = r(78061),
            g = r(98178),
            p = r(96856),
            j = r(27741),
            h = r(1696),
            x = r(92653),
            v = r(85893),
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
          function q() {
            var e = (0, l.x)(_),
              n = (0, a.Z)(e, 2),
              r = n[0],
              s = n[1],
              q = r.bgImgeUrl,
              N = r.titleImgeUrl,
              G = r.groupInfo,
              I = r.goodsList,
              w = r.isDisabled,
              Z = r.isLoading,
              k = r.isRuleOpened,
              O = (0, i.useRef)(null),
              y = (0, t.getCurrentInstance)(),
              S = (0, d.v9)(function (e) {
                return e.regionauth;
              }).regionauthInfo,
              L = void 0 === S ? {} : S;
            (0, i.useEffect)(
              function () {
                var e = u().getSystemInfoSync().windowHeight;
                s(function (n) {
                  n.virtualWaterfallHeight = e - 160;
                }),
                  U();
              },
              [L]
            ),
              (0, t.useDidShow)(function () {
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
              (0, t.useShareAppMessage)(
                (0, o.Z)(
                  (0, c.Z)().mark(function e() {
                    var n;
                    return (0, c.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (n =
                                "/subpages/marketing/group-list?crmcode=".concat(
                                  null == L ? void 0 : L.regionauth_code
                                )),
                              e.abrupt("return", {
                                title:
                                  (null == G ? void 0 : G.share_title) ||
                                  "拼团购",
                                path: n,
                                imageUrl:
                                  (null == G ? void 0 : G.share_pic) || "",
                              })
                            );
                          case 2:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                )
              );
            var U = (function () {
                var e = (0, o.Z)(
                  (0, c.Z)().mark(function e() {
                    var n;
                    return (0, c.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), (0, p.UY)(L);
                          case 2:
                            e.sent &&
                              (C(),
                              null === (n = O.current) ||
                                void 0 === n ||
                                n.reset());
                          case 4:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              C = (function () {
                var e = (0, o.Z)(
                  (0, c.Z)().mark(function e() {
                    var n;
                    return (0, c.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (e.next = 2),
                              h.Z.group.getCollectionInfo({
                                activity_type: "groups",
                              })
                            );
                          case 2:
                            (n = e.sent) && (0, p.Kn)(n)
                              ? s(function (e) {
                                  (e.isLoading = !1),
                                    (e.groupInfo = n),
                                    (e.bgImgeUrl = n.header_pic || q);
                                })
                              : s(function (e) {
                                  (e.isLoading = !1), (e.isDisabled = !0);
                                });
                          case 4:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              D = (function () {
                var e = (0, o.Z)(
                  (0, c.Z)().mark(function e(n) {
                    var r, o, a, i, t, u, l, d;
                    return (0, c.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (r = n.pageIndex),
                              (o = void 0 === r ? 1 : r),
                              (a = n.pageSize),
                              (i = { page: o, pageSize: a }),
                              (e.next = 4),
                              h.Z.group.groupItems(i)
                            );
                          case 4:
                            return (
                              (t = e.sent),
                              (u = t.list),
                              (l = t.total_count),
                              (d = (0, p.D9)(u, j.Z.goods.GROUP_GOODS_ITEM)),
                              s(function (e) {
                                e.goodsList[o - 1] = d;
                              }),
                              e.abrupt("return", { total: l })
                            );
                          case 10:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })(),
              R = function () {
                s(function (e) {
                  e.isRuleOpened = !1;
                });
              };
            return (0, v.jsxs)(b.nO, {
              immersive: !w,
              navigationLeftBlockWidthFull: !0,
              renderNavigation: w
                ? (0, v.jsx)(f.G7, {
                    className: "text-center w-full nav-title",
                    children: "拼团购",
                  })
                : (0, v.jsx)(f.G7, {
                    className: "flex flex-1 justify-items-center items-center",
                    children: (0, v.jsx)(b.Ko, {
                      width: 110,
                      height: 38,
                      src: N,
                    }),
                  }),
              className: "page-group-list",
              children: [
                w
                  ? (0, v.jsxs)(f.G7, {
                      className: "no-limited",
                      children: [
                        (0, v.jsx)(f.G7, {
                          className: "no-limited__icon",
                          children: (0, v.jsx)(f.xv, {
                            className: "iconfont icon-a-iconinbox",
                          }),
                        }),
                        (0, v.jsxs)(f.G7, {
                          className: "no-limited__text",
                          children: [
                            (0, v.jsx)(f.G7, {
                              className: "text-center",
                              children: "无正在拼团的商品",
                            }),
                            (0, v.jsx)(f.G7, {
                              className: "text-center",
                              children: "去商城看看其他商品吧",
                            }),
                          ],
                        }),
                      ],
                    })
                  : (0, v.jsxs)(v.Fragment, {
                      children: [
                        Z
                          ? (0, v.jsx)(f.G7, { className: "bg-box" })
                          : (0, v.jsx)(f.G7, {
                              className: "bg-box",
                              style: (0, p.Tu)({
                                "background-image": "url(".concat(q, ")"),
                              }),
                              children: (0, v.jsx)(f.G7, {
                                className: "bg-box__hd",
                                children: (0, v.jsxs)(f.G7, {
                                  className: "limited-rule",
                                  onClick: function () {
                                    s(function (e) {
                                      e.isRuleOpened = !0;
                                    });
                                  },
                                  children: [
                                    (0, v.jsx)(f.G7, {
                                      className: "iconfont icon-info",
                                    }),
                                    (0, v.jsx)(f.G7, {
                                      className: "limited-rule__text",
                                      children: "活动规则",
                                    }),
                                  ],
                                }),
                              }),
                            }),
                        (0, v.jsx)(f.G7, {
                          className: "page-group-list__scrollview-bg",
                        }),
                        (0, v.jsx)(g.ii, {
                          scrollY: !0,
                          ref: O,
                          fetch: D,
                          pageSize: 1e3,
                          height: r.virtualWaterfallHeight,
                          renderMore: function () {
                            return (0, v.jsx)(v.Fragment, {});
                          },
                          children: (0, v.jsx)(f.G7, {
                            className: "page-group-list__main",
                            children:
                              null == I
                                ? void 0
                                : I.map(function (e) {
                                    return null == e
                                      ? void 0
                                      : e.map(function (e) {
                                          return (0,
                                          v.jsx)(f.G7, { className: "page-group-list__item", children: (0, v.jsx)(x.Z, { info: e, regionauthInfo: L }) }, e.itemId);
                                        });
                                  }),
                          }),
                        }),
                      ],
                    }),
                (0, v.jsx)(f.G7, {
                  className: "rule-modal",
                  children: (0, v.jsx)(m.Z, {
                    isOpened: k,
                    onClose: R,
                    children: (0, v.jsxs)(f.G7, {
                      className: "rule-modal-box",
                      children: [
                        (0, v.jsx)(f.G7, {
                          className: "rule-modal__header",
                          children: "拼团规则",
                        }),
                        (0, v.jsx)(f.pf, {
                          scrollY: !0,
                          className: "rule-modal__scroll",
                          children: (0, v.jsx)(f.G7, {
                            className: "rule-modal__content",
                            children: G.collection_desc,
                          }),
                        }),
                        (0, v.jsx)(f.G7, {
                          className: "rule-modal__footer",
                          children: (0, v.jsx)(f.G7, {
                            className: "confirm-btn",
                            onClick: R,
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
          (q.enableShareAppMessage = !0),
            Page(
              (0, s.createPageConfig)(
                q,
                "subpages/marketing/group-list",
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
            return (function (n) {
              return e((e.s = n));
            })(34647);
          }
        ),
          e.O();
      },
    ]);
})();
