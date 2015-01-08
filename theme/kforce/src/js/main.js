var Main = {
    wWidth: 0,
    wHeight: 0,
    sizes: {
        small: 768,
        medium: 1024,
        large: 1440,
        xlarge: 1920
    }
};

$(document).ready(function() {
    var home = false;

    if (!home) {
        mainPage();
    }
});

function mainPage() {
    var sticky = false,
        headerTop = $('.site-header .nav-placeholder').offset().top;

    $('.site-header .menu-button').click(function() {
        $('.site-header .nav-container').addClass('active');
    });

    $('.site-header .close-button').click(function() {
        $('.site-header .nav-container').removeClass('active');
    });

    var checkHeader = function(resize) {
        var t = $(window).scrollTop();
        if (t >= headerTop) {
            if (!sticky) {
                $('.site-header .nav-container').addClass('sticky');
            }
            sticky = true;
        } else {
            if (sticky) {
                $('.site-header .nav-container').removeClass('sticky');
            }
            sticky = false;
        }
    }

    $(window).scroll(function() {
        checkHeader();
    });

    var resize = function() {
        Main.wHeight = $(window).height();
        Main.wWidth = $(window).width();

        headerTop = $('.site-header .nav-placeholder').offset().top;
        checkHeader(true);
    };
    $(window).resize(resize);
    resize();
}
