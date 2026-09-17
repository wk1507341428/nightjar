!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [6010],
    {
      83341: function (n, t, i) {
        var s = i(74165),
          e = i(15861),
          o = i(29439),
          a = i(92954),
          c = i.n(a),
          l = i(67294),
          r = i(71515),
          d = i(78061),
          p = i(67197),
          m = i(7979),
          u = i(80459),
          x = i(90057),
          h = i(1696),
          g = i(85893),
          f = {
            isOpenTown: !1,
            isOpenedHistory: !1,
            btnText: "敬请期待",
            id: "",
          };
        function j(n) {
          var t = (0, x.x)(f),
            i = (0, o.Z)(t, 2),
            a = i[0],
            j = i[1],
            v = n.isOpenedSign,
            G = n.handleCloseSign,
            N = n.totalPoints,
            b = a.isOpenedHistory,
            w = (function () {
              var n = (0, e.Z)(
                (0, s.Z)().mark(function n() {
                  var t;
                  return (0, s.Z)().wrap(function (n) {
                    for (;;)
                      switch ((n.prev = n.next)) {
                        case 0:
                          return (n.next = 2), h.Z.task.getLatestData();
                        case 2:
                          null != (t = n.sent) &&
                            t.id &&
                            j(function (n) {
                              (n.btnText = "去参与活动"),
                                (n.id = null == t ? void 0 : t.id);
                            });
                        case 4:
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
          (0, l.useEffect)(
            function () {
              v && w();
            },
            [v]
          );
          return (0, g.jsxs)(r.G7, {
            className: "point-modal",
            children: [
              (0, g.jsx)(p.Z, {
                isOpened: v,
                onClose: G,
                children: (0, g.jsxs)(r.G7, {
                  style: "background-image: url(".concat(
                    "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                    "/fv_task_rules_bac.png);background-size: cover;"
                  ),
                  children: [
                    (0, g.jsx)(d.Ko, {
                      src: "fv_task_close.png",
                      width: 42,
                      height: 42,
                      onClick: G,
                      className:
                        "wgt-sign-in-content-sign-list-item-content-image zoom-btn-close",
                    }),
                    (0, g.jsx)(m.Z, {
                      children: (0, g.jsxs)(r.G7, {
                        className: "point-modal-content",
                        children: [
                          (0, g.jsxs)(r.G7, {
                            className: "point-modal-bg",
                            children: [
                              (0, g.jsx)(r.G7, {
                                className: "point-modal-img",
                                children: (0, g.jsx)(d.Ko, {
                                  src: "fv_task_pisa1.png",
                                  width: 144,
                                  height: 144,
                                  className:
                                    "wgt-sign-in-content-sign-list-item-content-image",
                                }),
                              }),
                              (0, g.jsxs)(r.G7, {
                                className: "point-modal-pointtxt",
                                children: [
                                  (0, g.jsx)(r.G7, {
                                    className: "point-modal-point-txt",
                                    children: "我的披萨",
                                  }),
                                  (0, g.jsxs)(r.G7, {
                                    className: "point-modal-point",
                                    children: [
                                      (0, g.jsx)(r.G7, {
                                        className: "point-modal-point-num",
                                        children: N,
                                      }),
                                      (0, g.jsx)(r.G7, {
                                        className: "point-modal-point-unit",
                                        children: "片",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, g.jsx)(r.G7, {
                                className: "point-modal-point-why",
                                children: "什么是披萨？",
                              }),
                            ],
                          }),
                          (0, g.jsx)(r.G7, {
                            className: "point-modal-point-content",
                            children:
                              "“披萨”是在“佛罗伦萨小镇奥莱GO+”小程序商城上通过做任务等形式发放给用户的奖励凭证，用于参与商城抽奖活动以及后续其他线上商城互动活动，使用有效期为发放日期后90天内（过期不补），“披萨”使用场景可持续关注佛罗伦萨小镇奥莱GO+线上商城，将会不定期开放大转盘等活动。",
                          }),
                          (0, g.jsxs)(r.G7, {
                            className: "point-modal-btn",
                            onClick: function () {
                              var n;
                              "去参与活动" === a.btnText &&
                                (c().navigateTo({
                                  url:
                                    "/subpages/game-activity/index?id=" +
                                    (null == a ? void 0 : a.id),
                                }),
                                G(),
                                (0, u.setFlowClickGio)({
                                  regionauth_code:
                                    (null === (n = regionauthInfo) ||
                                    void 0 === n
                                      ? void 0
                                      : n.regionauth_code) || "-",
                                  position: 1,
                                  index: 1,
                                  moduleName_var: "任务中心",
                                  title: "去参与活动",
                                }));
                            },
                            children: [
                              (0, g.jsx)(r.G7, {
                                className: "point-modal-btn-txt",
                                children: a.btnText,
                              }),
                              "去参与活动" === a.btnText &&
                                (0, g.jsx)(r.G7, {
                                  className:
                                    "iconfont icon-a-iconarrow_forward",
                                }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              }),
              (0, g.jsx)(d.mf, {
                isOpenedHistory: b,
                handleCLoseRecord: function () {
                  j(function (n) {
                    n.isOpenedHistory = !1;
                  });
                },
              }),
            ],
          });
        }
        (j.defaultProps = {}), (t.Z = j);
      },
    },
  ]);
})();
