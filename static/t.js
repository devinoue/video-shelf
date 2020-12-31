$(document).ready(function () {
  $(function () {
    $('a[href^="#"]').click(function () {
      var speed = 200; //移動完了までの時間(sec)を指定
      var href = $(this).attr("href");
      var target = $(href == "#" || href == "" ? 'html' : href);
      var position = target.offset().top;


      $("html, body").animate({ scrollTop: position }, speed, "swing");
      return false;
    });
  });
});

$(document).ready(function () {
  $(function () {
    $('.nbutton').click(function () {
      var target;
      var prev;
      $(".row").each(function (i, element) {
        target = $(element).offset().top;
        if (target - 10 > $(document).scrollTop()) {

          return false; // break
        }
      });

      $("html, body").animate({
        scrollTop: target
      }, 200);

    });
  });
});


$(document).ready(function () {
  $('.bbutton').click(function () {
    var target;
    var prev;
    $(".row").each(function (i, element) {
      target = $(element).offset().top;
      if (target > $(document).scrollTop() - 10) {
        return false; // break
      }
      prev = target;
    });
    $("html, body").animate({
      scrollTop: prev
    }, 200);
  });
});

$(document).ready(function () {
  $('.to_top').click(function () {
    $('body,html').animate({
      scrollTop: 0
    }, 200);
    return false;
  });
});
