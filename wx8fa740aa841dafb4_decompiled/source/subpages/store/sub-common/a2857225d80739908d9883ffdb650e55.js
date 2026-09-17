!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [1795],
    {
      66733: function (n, i, e) {
        e.r(i),
          e.d(i, {
            CATEGORY_STORE_LIST: function () {
              return a;
            },
          });
        var a = {
          name: "name",
          children: function (n) {
            var i = n.children;
            return pickBy(i, {
              name: "name",
              img: "img",
              children: function (n) {
                var i = n.children;
                return pickBy(i, {
                  name: "name",
                  img: "img",
                  category_id: "category_id",
                  main_category_id: "main_category_id",
                  is_main_category: "is_main_category",
                });
              },
            });
          },
        };
      },
    },
  ]);
})();
