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
      [4450],
      {
        69256: function (e, t, i) {
          var r = i(32180),
            n = i(1413),
            s = i(74165),
            o = i(15861),
            c = i(29439),
            a = i(67294),
            u = i(71515),
            l = i(92954),
            d = i.n(l),
            f = i(90057),
            m = i(78061),
            b = i(98178),
            _ = i(48775),
            p = i(27741),
            g = i(1696),
            v = i(96856),
            j = i(76823),
            x = i(85893),
            h = {
              curFilterIdx: 0,
              filterList: [
                { title: "综合" },
                { title: "折扣" },
                {
                  title: "价格",
                  icon: "fv_filter_sort",
                  down: "fv_filter_sort_down",
                  up: "fv_filter_sort_up",
                  type: "sort",
                },
              ],
              filterVisible: !1,
              itemListLeft: [],
              itemListRight: [],
              keywords: "",
              newFilter: null,
              selectedFilters: [],
              sortOrder: null,
              marketingInfo: null,
            },
            k = function (e, t) {
              var i,
                r = Number(
                  null == e || null === (i = e.gift) || void 0 === i
                    ? void 0
                    : i.filter_full
                );
              if (Number.isNaN(r)) return "赠品";
              var n = (function (e) {
                  var t = Number(e);
                  return Number.isNaN(t) ? "" : "".concat(t);
                })(r),
                s =
                  "1" ==
                  "".concat((null == t ? void 0 : t.in_proportion) || ""),
                o = ((null == t ? void 0 : t.gifts) || [])
                  .map(function (e) {
                    var t;
                    return Number(
                      null == e || null === (t = e.gift) || void 0 === t
                        ? void 0
                        : t.filter_full
                    );
                  })
                  .filter(function (e) {
                    return !Number.isNaN(e);
                  }),
                c = Array.from(new Set(o)),
                a = c.length ? Math.max.apply(Math, c) : r,
                u = c.length > 1 && r === a;
              return s
                ? r === a
                  ? "每满"
                      .concat(n)
                      .concat(
                        "totalfee" == (null == t ? void 0 : t.condition_type)
                          ? "元"
                          : "件",
                        "送赠品"
                      )
                  : "满"
                      .concat(n)
                      .concat(
                        "totalfee" == (null == t ? void 0 : t.condition_type)
                          ? "元"
                          : "件",
                        "送赠品"
                      )
                : ""
                    .concat(u ? "最高" : "", "满")
                    .concat(n)
                    .concat(
                      "totalfee" == (null == t ? void 0 : t.condition_type)
                        ? "元"
                        : "件",
                      "送赠品"
                    );
            };
          var N = a.memo(function () {
            var e,
              t,
              i,
              r = (0, l.useRouter)(),
              N = (0, f.x)(h),
              w = (0, c.Z)(N, 2),
              q = w[0],
              y = w[1],
              G = (0, a.useRef)(null),
              L = (0, a.useRef)(),
              F = (0, a.useRef)("");
            (0, a.useEffect)(function () {
              v.N_.getRouteParams(r.params).then(
                (function () {
                  var e = (0, o.Z)(
                    (0, s.Z)().mark(function e(t) {
                      var i;
                      return (0, s.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              (F.current = decodeURIComponent(
                                (null == t ? void 0 : t.keywords) || ""
                              )),
                                y(function (e) {
                                  e.keywords = F.current;
                                }),
                                null != t &&
                                  t.marketing_id &&
                                  Z(
                                    null == t ? void 0 : t.marketing_id,
                                    (null == t ? void 0 : t.distributor_id) ||
                                      ""
                                  ),
                                null != t &&
                                  t.promotion_id &&
                                  I(
                                    null == t ? void 0 : t.promotion_id,
                                    (null == t ? void 0 : t.distributor_id) ||
                                      ""
                                  ),
                                null === (i = G.current) ||
                                  void 0 === i ||
                                  i.reset();
                            case 5:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })()
              );
            }, []);
            var I = (function () {
                var e = (0, o.Z)(
                  (0, s.Z)().mark(function e(t, i) {
                    var r;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (e.next = 2),
                              g.Z.seckill.getMemberPreference({
                                marketing_id: t,
                                distributor_id: i,
                              })
                            );
                          case 2:
                            (r = e.sent),
                              (0, v.Kn)(r) &&
                                ((r.startTime = (0, v.mr)(
                                  1e3 * r.start_time,
                                  "YYYY.MM.DD HH:mm"
                                )),
                                (r.endTime = (0, v.mr)(
                                  1e3 * r.end_time,
                                  "YYYY.MM.DD HH:mm"
                                )),
                                y(function (e) {
                                  e.marketingInfo = (0, n.Z)(
                                    (0, n.Z)({}, r),
                                    {},
                                    { promotion_tag: "会员优先购" }
                                  );
                                }),
                                d().setNavigationBarTitle({
                                  title: "会员优先购",
                                }));
                          case 4:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t, i) {
                  return e.apply(this, arguments);
                };
              })(),
              Z = (function () {
                var e = (0, o.Z)(
                  (0, s.Z)().mark(function e(t, i) {
                    var r;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (e.next = 2),
                              g.Z.seckill.getMarketing({
                                marketing_id: t,
                                distributor_id: i,
                              })
                            );
                          case 2:
                            (r = e.sent),
                              (0, v.Kn)(r) &&
                                ((r.startTime = (0, v.mr)(
                                  1e3 * r.start_time,
                                  "YYYY.MM.DD HH:mm"
                                )),
                                (r.endTime = (0, v.mr)(
                                  1e3 * r.end_time,
                                  "YYYY.MM.DD HH:mm"
                                )),
                                y(function (e) {
                                  e.marketingInfo = r;
                                }),
                                d().setNavigationBarTitle({
                                  title: r.marketing_name,
                                }));
                          case 4:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t, i) {
                  return e.apply(this, arguments);
                };
              })(),
              Y = (function () {
                var e = (0, o.Z)(
                  (0, s.Z)().mark(function e(t) {
                    var i,
                      n,
                      o,
                      c,
                      a,
                      u,
                      l,
                      d,
                      f,
                      m,
                      b,
                      _,
                      j,
                      x,
                      h,
                      k,
                      N,
                      w,
                      G,
                      L,
                      I;
                    return (0, s.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              ((i = t.pageIndex),
                              (n = void 0 === i ? 1 : i),
                              (o = t.pageSize),
                              (c = r.params),
                              (a = c.marketing_id),
                              (u = c.group_id),
                              (l = c.seckill_id),
                              c.distributor_id,
                              (d = c.promotion_id),
                              (f = c.is_valid),
                              0 != (void 0 === f ? 1 : f))
                            ) {
                              e.next = 4;
                              break;
                            }
                            return e.abrupt("return");
                          case 4:
                            return (
                              (m = {
                                page: n,
                                pageSize: o,
                                keywords: F.current,
                                approve_status: "onsale,only_show",
                                item_type: "normal",
                                is_point: "false",
                                marketing_id: d || a,
                                group_id: u,
                                seckill_id: l,
                              }),
                              (b = []),
                              q.selectedFilters.forEach(function (e) {
                                "category" == e.type
                                  ? (m.main_category = e.value)
                                  : "discount" == e.type
                                  ? (m.discount_rate = e.value)
                                  : "price" == e.type
                                  ? ((m.start_price = e.min),
                                    (m.end_price = e.max))
                                  : "brand" == e.type
                                  ? (m.distributor_id = e.id)
                                  : "spec" == e.type &&
                                    b.push({
                                      spec_id: e.attribute_id,
                                      spec_value_id: e.attribute_value_id,
                                    });
                              }),
                              (m.item_spec = b),
                              1 == q.curFilterIdx
                                ? (m.goodsSort = 6)
                                : (2 == q.curFilterIdx ||
                                    3 == q.curFilterIdx) &&
                                  (m.goodsSort = q.sortOrder),
                              (e.next = 11),
                              g.Z.item.search(m)
                            );
                          case 11:
                            return (
                              (_ = e.sent),
                              (j = _.list),
                              (x = _.total_count),
                              (h = _.newFilter),
                              (k = _.specific_crowd),
                              (N = void 0 === k ? {} : k),
                              (w = j.map(function (e) {
                                return (e.specific_crowd = N), e;
                              })),
                              (G = (0, v.D9)(w, p.Z.goods.ITEM_LIST_GOODS)),
                              (L = G.filter(function (e, t) {
                                return t % 2 == 0;
                              })),
                              (I = G.filter(function (e, t) {
                                return t % 2 == 1;
                              })),
                              y(function (e) {
                                (e.itemListLeft[n - 1] = L),
                                  (e.itemListRight[n - 1] = I),
                                  (e.newFilter = h);
                              }),
                              e.abrupt("return", { total: x })
                            );
                          case 23:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t) {
                  return e.apply(this, arguments);
                };
              })();
            return (0, x.jsxs)(m.nO, {
              className: "page-marketing-list",
              ref: L,
              navigationLeftBlockWidthFull: !0,
              renderNavigation: (0, x.jsx)(u.G7, {
                className: "text-center w-full",
                children: "商品列表",
              }),
              children: [
                (0, x.jsxs)(m.B, {
                  scrollY: !0,
                  className: "box-border",
                  fetch: Y,
                  ref: G,
                  renderMore: function () {
                    return (0, x.jsx)(x.Fragment, {});
                  },
                  children: [
                    q.marketingInfo
                      ? (0, x.jsxs)(u.G7, {
                          className: "marketing-info",
                          children: [
                            (0, x.jsx)(u.G7, {
                              className: "marketing-info__title",
                              children: q.marketingInfo.promotion_tag,
                            }),
                            (0, x.jsxs)(u.G7, {
                              className: "marketing-info__time",
                              children: [
                                "活动时间：",
                                q.marketingInfo.startTime,
                                "-",
                                q.marketingInfo.endTime,
                              ],
                            }),
                            (0, x.jsxs)(u.G7, {
                              className: "marketing-info__desc",
                              children: [
                                "活动规则：",
                                q.marketingInfo.marketing_desc,
                              ],
                            }),
                            null === (e = q.marketingInfo.gifts) || void 0 === e
                              ? void 0
                              : e.map(function (e) {
                                  var t = (0, j.bp)(e),
                                    i = k(e, q.marketingInfo);
                                  return (0,
                                  x.jsx)(u.G7, { className: "goods-info__item", children: (0, x.jsxs)(u.G7, { className: "goods-info", children: [(0, x.jsxs)(u.G7, { className: "goods-info__img", children: [(0, x.jsx)(m.Ko, { src: e.pics[0] }), t && (0, x.jsx)(u.G7, { className: "soldout-mask", children: (0, x.jsx)(u.G7, { className: "soldout-mask-text", children: (0, x.jsx)(u.xv, { children: "已送完" }) }) })] }), (0, x.jsxs)(u.G7, { className: "goods-info__main", children: [(0, x.jsxs)(u.G7, { children: [(0, x.jsx)(u.G7, { className: "goods-info__title", children: e.item_name }), (0, x.jsxs)(u.G7, { className: "flex justify-between items-center", children: [(0, x.jsx)(u.G7, { className: "goods-info__desc", children: e.item_spec_desc }), (0, x.jsxs)(u.G7, { className: "goods-info__num", children: ["x", e.gift.gift_num] })] })] }), (0, x.jsxs)(u.G7, { className: "flex justify-between items-center", children: [(0, x.jsxs)(u.G7, { className: "goods-info__price", children: ["￥", e.price / 100] }), (0, x.jsx)(u.G7, { className: "goods-info__tag", children: i })] })] })] }) }, e.item_id);
                                }),
                          ],
                        })
                      : null,
                    (0, x.jsx)(u.G7, {
                      id: "filter-container",
                      className: "filter-container",
                      children: (0, x.jsx)(b.nw, {
                        custom: !0,
                        current: q.curFilterIdx,
                        list: q.filterList,
                        onChange: function (e) {
                          var t;
                          y(function (t) {
                            (t.itemListLeft = []),
                              (t.itemListRight = []),
                              (t.curFilterIdx = e.current || 0),
                              (t.sortOrder = 1 == e.sort ? 3 : 2);
                          }),
                            null === (t = G.current) ||
                              void 0 === t ||
                              t.reset();
                        },
                        onFilter: function () {
                          y(function (e) {
                            e.filterVisible = !0;
                          });
                        },
                      }),
                    }),
                    (0, x.jsxs)(u.G7, {
                      className: "waterfall-container pl-24 pr-24 pt-24",
                      children: [
                        (0, x.jsx)(u.G7, {
                          className: "waterfall-left__container",
                          children:
                            null === (t = q.itemListLeft) || void 0 === t
                              ? void 0
                              : t.map(function (e, t) {
                                  return null == e
                                    ? void 0
                                    : e.map(function (e, t) {
                                        return (0,
                                        x.jsx)(_.T$, { className: "mb-18", width: 342, info: e, modulePosition: 1, flowPosition: "".concat(2 * t + 1), moduleName: "营销列表" }, e.item_id);
                                      });
                                }),
                        }),
                        (0, x.jsx)(u.G7, {
                          className: "waterfall-right__container",
                          children:
                            null === (i = q.itemListRight) || void 0 === i
                              ? void 0
                              : i.map(function (e, t) {
                                  return null == e
                                    ? void 0
                                    : e.map(function (e, t) {
                                        return (0,
                                        x.jsx)(_.T$, { className: "mb-18", width: 342, info: e, modulePosition: 1, flowPosition: "".concat(2 * t + 2), moduleName: "营销列表" }, e.item_id);
                                      });
                                }),
                        }),
                      ],
                    }),
                  ],
                }),
                q.newFilter
                  ? (0, x.jsx)(b.jl, {
                      visible: q.filterVisible,
                      selectedFilters: q.selectedFilters,
                      onClose: function () {
                        return y(function (e) {
                          e.filterVisible = !1;
                        });
                      },
                      onConfirm: function (e) {
                        var t;
                        y(function (t) {
                          (t.selectedFilters = e),
                            (t.itemListLeft = []),
                            (t.itemListRight = []),
                            (t.filterVisible = !1);
                        }),
                          null === (t = G.current) || void 0 === t || t.reset();
                      },
                      onReset: function () {
                        var e;
                        y(function (e) {
                          (e.selectedFilters = []),
                            (e.itemListLeft = []),
                            (e.itemListRight = []),
                            (e.filterVisible = !1);
                        }),
                          null === (e = G.current) || void 0 === e || e.reset();
                      },
                      newFilter: q.newFilter,
                    })
                  : null,
              ],
            });
          });
          Page(
            (0, r.createPageConfig)(
              N,
              "subpages/marketing/marketing-list",
              { root: { cn: [] } },
              {} || {}
            )
          );
        },
      },
      function (e) {
        e.O(
          0,
          [
            6758, 7531, 2881, 6437, 5014, 3096, 6010, 8206, 9246, 5710, 6549,
            6220, 1497, 1193, 2903, 4508, 9741, 7312, 7811, 7299, 1699, 761,
            7677, 2817, 9887, 3197, 9651, 5386, 7576, 4300, 998, 2224, 2302,
            8322, 3139, 7502, 8075, 6353, 3921, 7162, 4487, 9658, 5200, 9444,
            9934, 396, 7078, 5469, 2592, 3455, 7453, 1471, 5987, 1871, 7738,
            4539, 2107, 1216, 8592,
          ],
          function () {
            return (function (t) {
              return e((e.s = t));
            })(69256);
          }
        ),
          e.O();
      },
    ]);
})();
