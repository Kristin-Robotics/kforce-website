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

(function($) {

// Use this variable to set up the common and page specific functions. If you
// rename this variable, you will also need to rename the namespace below.
var KForce = {
    // All pages
    common: {
        init: function() {
            // JavaScript to be fired on all pages
        }
    },
    // Home page
    home: {
        init: function() {
            // JavaScript to be fired on the home page
        }
    },
    // About us page, note the change from about-us to about_us.
    mainPage: {
        init: function() {
            mainPage();
        }
    },
    calendar: {
        init: function() {
            $('#calendar').fullCalendar({
                googleCalendarApiKey: 'AIzaSyDcnW6WejpTOCffshGDDb4neIrXVUA1EAE',
                eventSources: [
                    {
                        url: 'http://www.google.com/calendar/feeds/vrvtpcl03joj3f2r77prri0p40%40group.calendar.google.com/public/basic',
                    },
                    {
                        url: 'http://www.google.com/calendar/feeds/kiwibots%40gmail.com/public/basic'
                    },
                    {
                        url: 'http://www.google.com/calendar/feeds/0ekm3bcnlp457ibdpt4nu0p6tc%40group.calendar.google.com/public/basic',
                        className: 'kforce-event'
                    }
                ],
                buttonText: {
                    today: 'Today'
                },
                eventRender: function(event, element) {
                    console.log(element.html());
                    element.attr('target', '_BLANK');
                }
            });
        }
    }
};

// The routing fires all common scripts, followed by the page specific scripts.
// Add additional events for more control over timing e.g. a finalize event
var UTIL = {
    fire: function(func, funcname, args) {
        var namespace = KForce;
        funcname = (funcname === undefined) ? 'init' : funcname;
        if (func !== '' && namespace[func] && typeof namespace[func][funcname] === 'function') {
            namespace[func][funcname](args);
        }
    },
    loadEvents: function() {
        UTIL.fire('common');

        $.each(document.body.className.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); }).split(/\s+/),function(i,classnm) {
            console.log(classnm);
        UTIL.fire(classnm);
        });
    }
};

$(document).ready(UTIL.loadEvents);

})(jQuery); // Fully reference jQuery after this point.

function mainPage() {
    var sticky = false,
        headerTop = $('.site-header .nav-placeholder').offset().top;

    //Making images in Ckeditor pretty
    $('.ck-content img').each(function() {
        var img = new Image(), $this = $(this),
            $parent = $this.closest('.ck-content'),
            maxHeight = parseInt($this.css('max-height'));

        $(img).one('load', function() {
            var aspect = img.width / img.height,
                threshold = aspect * maxHeight;
            var resize = function() {
                console.log('aspect!');
                if ($parent.width() > threshold) {
                    $this.removeClass('wide').addClass('tall');
                } else {
                    $this.removeClass('tall').addClass('wide');
                }
            };
            resize();
            $this.on('ckresize', resize);
        });
        $this.wrap('<div class="img-centre"><div class="img-container"></div></div>');

        if ($this.attr('alt') !== '') {
            $this.after('<p class="img-caption">' + $this.attr('alt') + '</p>');
        }
        img.src = $this.attr('src');
    });

    // We do not want hovering to be triggered on touch devices
    $('.scroll-container > ul > li').on('mouseover', function() {
        $(this).addClass('hover');
    }).on('mouseout', function() {
        $(this).removeClass('hover');
    });

    $('.drop-indicator').click(function() {
        $(this).closest('li').toggleClass('active');
    });

    $('.drop-indicator').outside('click', function() {
        $(this).closest('li').removeClass('active');
    });

    $('.site-header .menu-button').click(function() {
        $('.site-header .nav-container').addClass('active');
    });

    $('.site-header .close-button').click(function() {
        $('.site-header .nav-container').removeClass('active');
    });

    $('.image-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        gallery: {
            enabled: true
        }
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
        $('.ck-content img').trigger('ckresize');

        $('.responsive-video iframe').each(function() {
            console.log(this);
            $(this).height(Math.min($(this).width() * 9 / 16, Main.wHeight - $('.nav-placeholder').height()));
        });
    };
    $(window).resize(resize);
    resize();
}
