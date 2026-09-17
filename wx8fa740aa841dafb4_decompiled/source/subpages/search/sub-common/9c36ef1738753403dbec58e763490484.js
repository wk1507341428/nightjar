!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [2881],
    {
      8343: function (e, n, i) {
        var t = i(15671),
          a = i(43144),
          o = i(58618),
          s = i(60136),
          l = i(4942),
          r = i(67294),
          c = i(92954),
          h = i.n(c),
          u = i(71515),
          d = i(1462),
          p = i(96856),
          S = (i(65533), i(85893)),
          f = (function (e) {
            function n(e) {
              var i;
              return (
                (0, t.Z)(this, n),
                (i = (0, o.Z)(this, n, [e])),
                (0, l.Z)(i, "handleFocusSearchHistory", function (e) {
                  var n, t;
                  null === (n = (t = i.props).onFocus) ||
                    void 0 === n ||
                    n.call(t),
                    i.setState({ showSearchDailog: e, isShowAction: !0 }),
                    h()
                      .getStorage({ key: i.props.localStorageKey })
                      .then(function (e) {
                        var n = e.data.split(",").filter(function (e) {
                          return e.trim();
                        });
                        i.setState({ historyList: n });
                      })
                      .catch(function () {});
                }),
                (0, l.Z)(i, "handleChangeSearch", function (e, n) {
                  var t, a, o;
                  null === (t = (a = i.props).onChange) ||
                    void 0 === t ||
                    t.call(
                      a,
                      p.$L
                        ? null == n || null === (o = n.detail) || void 0 === o
                          ? void 0
                          : o.value
                        : e
                    );
                }),
                (0, l.Z)(i, "handleClear", function () {
                  i.props.onClear();
                }),
                (0, l.Z)(i, "handleConfirm", function (e) {
                  var n = e.detail.value.trim();
                  if (n) {
                    var t = h().getStorageSync(i.props.localStorageKey),
                      a = [];
                    if (t) {
                      var o = t.split(",");
                      o.includes(n) || o.unshift(n), (a = o);
                    } else a.push(n);
                    h().setStorage({
                      key: i.props.localStorageKey,
                      data: a.toString(),
                    }),
                      i.props.onConfirm(e.detail.value);
                  }
                  i.setState({ showSearchDailog: !1, isShowAction: !1 });
                }),
                (0, l.Z)(i, "handleClickCancel", function (e) {
                  var n, t;
                  null === (n = (t = i.props).onCancel) ||
                    void 0 === n ||
                    n.call(t),
                    i.setState({ showSearchDailog: e, isShowAction: !1 }),
                    i.handleClear();
                }),
                (0, l.Z)(i, "handleClickDelete", function () {
                  h()
                    .removeStorage({ key: i.props.localStorageKey })
                    .then(function () {
                      i.setState({ historyList: [] });
                    });
                }),
                (0, l.Z)(i, "handleClickTag", function (e) {
                  i.props.onConfirm(e),
                    i.setState({ showSearchDailog: !1, isShowAction: !1 });
                }),
                (0, l.Z)(i, "handleClickHotItem", function () {}),
                (0, l.Z)(i, "handleBlurSearch", function () {
                  var e, n;
                  null === (e = (n = i.props).onBlur) ||
                    void 0 === e ||
                    e.call(n);
                }),
                (i.state = {
                  searchValue: "",
                  showSearchDailog: !1,
                  historyList: [],
                  isShowAction: !1,
                }),
                i
              );
            }
            return (
              (0, s.Z)(n, e),
              (0, a.Z)(n, [
                { key: "componentDidMount", value: function () {} },
                {
                  key: "render",
                  value: function () {
                    var e = this,
                      n = this.props,
                      i = n.isFixed,
                      t = n.keyword,
                      a = n.showDailog,
                      o = n.placeholder,
                      s = this.state,
                      l = s.showSearchDailog,
                      r = s.historyList,
                      c = s.isShowAction;
                    return (
                      s.searchValue,
                      (0, S.jsxs)(u.G7, {
                        className: (0, p.AK)(
                          "search-input",
                          i ? "search-input-fixed" : null,
                          l ? "search-input__focus" : null,
                          !a && "without-dialog"
                        ),
                        children: [
                          (0, S.jsx)(u.G7, {
                            className: "search-input__form",
                            children: (0, S.jsx)(d.Z, {
                              className: "search-input__bar",
                              value: t,
                              placeholder: o || "请输入关键词",
                              actionName: "取消",
                              showActionButton: c,
                              onFocus: this.handleFocusSearchHistory.bind(
                                this,
                                !0
                              ),
                              onBlur: this.handleBlurSearch.bind(this),
                              onClear: this.handleClear,
                              onChange: this.handleChangeSearch.bind(this),
                              onConfirm: this.handleConfirm.bind(this),
                              onActionClick: this.handleClickCancel.bind(
                                this,
                                !1
                              ),
                            }),
                          }),
                          a &&
                            (0, S.jsxs)(u.G7, {
                              className: (0, p.AK)(
                                l
                                  ? "search-input__history"
                                  : "search-input__history-none"
                              ),
                              children: [
                                (0, S.jsxs)(u.G7, {
                                  className: "search-input__history-title",
                                  children: [
                                    (0, S.jsx)(u.xv, { children: "最近搜索" }),
                                    (0, S.jsx)(u.xv, {
                                      className: "clear-history",
                                      onClick:
                                        this.handleClickDelete.bind(this),
                                      children: "清除搜索历史",
                                    }),
                                  ],
                                }),
                                (0, S.jsx)(u.G7, {
                                  className: "search-input__history-list",
                                  children:
                                    null == r
                                      ? void 0
                                      : r.map(function (n, i) {
                                          return (0,
                                          S.jsx)(u.G7, { className: "search-input__history-list__btn", onClick: e.handleClickTag.bind(e, n), children: n }, "".concat(i, "1"));
                                        }),
                                }),
                              ],
                            }),
                        ],
                      })
                    );
                  },
                },
              ])
            );
          })(r.Component);
        (0, l.Z)(f, "defaultProps", {
          isOpened: !1,
          keyword: "",
          showDailog: !0,
          localStorageKey: "searchHistory",
        }),
          (0, l.Z)(f, "options", { addGlobalClass: !0 });
      },
    },
  ]);
})();
