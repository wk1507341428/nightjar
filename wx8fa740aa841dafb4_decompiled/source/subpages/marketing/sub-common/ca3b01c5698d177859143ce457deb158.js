!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [3197],
    {
      24634: function (t, n, s) {
        var o = s(15671),
          e = s(43144),
          i = s(58618),
          r = s(60136),
          u = s(4942),
          a = s(67294),
          p = s(71515),
          c = s(96856),
          l = s(85893),
          m = (function (t) {
            function n(t) {
              var s;
              return (
                (0, o.Z)(this, n),
                (s = (0, i.Z)(this, n, [t])),
                (0, u.Z)(s, "handleClick", function () {
                  s.timer || s.timer || s.start();
                }),
                (0, u.Z)(s, "start", function () {
                  s.stop();
                  var t = function () {
                    s.timer = setTimeout(function () {
                      var n = s.state.countDur - 1;
                      s.props.onUpdateTimer && s.props.onUpdateTimer(n),
                        s.setState({ countDur: n }),
                        n > 0
                          ? t()
                          : (s.stop(),
                            s.setState({
                              countDur: s.props.duration,
                              finish: !0,
                            }),
                            s.props.onStop && s.props.onStop());
                    }, 1e3);
                  };
                  s.props.onStart(function (n) {
                    !1 !== n &&
                      s.setState({ sent: !0, finish: !1 }, function () {
                        return t();
                      });
                  }, s.state.countDur);
                }),
                (s.state = { countDur: t.duration, sent: !1, finish: !1 }),
                s
              );
            }
            return (
              (0, r.Z)(n, t),
              (0, e.Z)(n, [
                {
                  key: "componentWillUnmount",
                  value: function () {
                    this.stop();
                  },
                },
                {
                  key: "stop",
                  value: function () {
                    this.timer &&
                      (clearTimeout(this.timer), (this.timer = null));
                  },
                },
                {
                  key: "render",
                  value: function () {
                    var t = this.state,
                      n = t.countDur,
                      s = t.sent,
                      o = t.finish,
                      e = this.props,
                      i = e.timerMsg,
                      r = e.className,
                      u = e.style,
                      a = void 0 === u ? "" : u,
                      m = s && !o,
                      f =
                        i ||
                        (m
                          ? "".concat(n, "s")
                          : o
                          ? this.props.msg
                          : this.props.defaultMsg);
                    return (0, l.jsx)(p.xv, {
                      className: (0, c.AK)(
                        "mobile-timer",
                        { "mobile-timer__counting": m },
                        r
                      ),
                      style: a,
                      onClick: this.handleClick,
                      children: f,
                    });
                  },
                },
              ])
            );
          })(a.Component);
        (0, u.Z)(m, "options", { addGlobalClass: !0 }),
          (0, u.Z)(m, "defaultProps", {
            duration: 60,
            defaultMsg: "发送验证码",
            msg: "重新发送",
          });
      },
    },
  ]);
})();
