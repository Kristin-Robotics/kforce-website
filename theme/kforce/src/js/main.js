var Main = {
    wWidth: 0,
    wHeight: 0,
    resizes: [],
    scrolls: [],
    scrollTop: 0
};

// Page loader from Roots
// http://roots.io
(function($) {

// Use this variable to set up the common and page specific functions. If you
// rename this variable, you will also need to rename the namespace below.
var KForce = {
    // All pages
    common: {
        init: function() {
            // JavaScript to be fired on all pages
            common();
        }
    },
    // Home page
    homePage: {
        init: function() {
            // JavaScript to be fired on the home page
            homePage();
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
            UTIL.fire(classnm);
        });
    }
};

$(document).ready(UTIL.loadEvents);

})(jQuery); // Fully reference jQuery after this point.

//Get when transitions have finished on an element
//Do it instantly if transitions are not supported
var onTransitionEnd = (function() {
    var transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd otransitionend',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    }, transitionEnd = transEndEventNames[Modernizr.prefixed('transition')];

    if (Modernizr.csstransitions) {
        return function(el, fn) {
            $(el).one(transitionEnd, fn);
        }
    } else {
        return function(el, fn) {
            setTimeout(fn, 10);
        }
    }
})();


function common() {
    // Replace svg with png fallback if not supported
    if (!Modernizr.svg) {
        $('img').each(function() {
            var src = $(this).attr('src');
            if ((src) && (src.substring(src.lastIndexOf('.') + 1).toLowerCase() === 'svg')) {
                if ($(this).attr('data-alternate')) {
                    $(this).attr('src', $(this).attr('data-alternate'));
                }
            }
        });
    }

    // Listening for events to keep things performant
    $(window).scroll(function() {
        Main.scrollTop = $(window).scrollTop();
        for (i in Main.scrolls) {
            Main.scrolls[i]();
        }
    });

    var resizeTimer, didResize = false;
    $(window).resize(function() {
        didResize = true;
    });

    var resizeFunction = function() {
        if (didResize) {
            Main.wHeight = $(window).height();
            Main.wWidth = $(window).width();

            for (i in Main.resizes) {
                Main.resizes[i]();
            }
            didResize = false;
        }
        setTimeout(resizeFunction, 100);
    };
    setTimeout(resizeFunction, 100);

    Main.wHeight = $(window).height();
    Main.wWidth = $(window).width();
    Main.scrollTop = $(window).scrollTop();
}

function mainPage() {
    var sticky = false,
        headerTop = $('.site-header .nav-placeholder').offset().top;

    $('.small-logo-links a').after(' ');

    //Making images in Ckeditor pretty
    $('.ck-content img:not(.no-block)').each(function() {
        var img = new Image(), $this = $(this),
            $parent = $this.closest('.ck-content'),
            alt = $this.attr('alt');

        $this.addClass('block');
        var maxHeight = parseInt($this.css('max-height'));

        $(img).one('load', function() {
            var aspect = img.width / img.height,
                threshold = aspect * maxHeight;
            var resize = function() {
                if ($parent.width() > threshold) {
                    $this.removeClass('wide').addClass('tall');
                } else {
                    $this.removeClass('tall').addClass('wide');
                }
            };
            $this.magnificPopup({
                type: 'image',
                image: {
                    titleSrc: function() {
                        return alt
                    }
                },
                items: {
                    src: img.src
                }
            });
            resize();
            $this.on('ckresize', resize);
        });
        $this.wrap('<div class="img-centre"><div class="img-container"></div></div>');

        if (alt !== '') {
            $this.after('<p class="img-caption">' + alt + '</p>');
        }
        img.src = $this.attr('src');
    });

    $('.image-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        gallery: {
            enabled: true
        }
    });

    $('.page-image').magnificPopup({
        type: 'image'
    });

    setupNav($('.site-header .menu-button'), $('.site-header .close-button'), $('.site-header .nav-container'));

    var checkHeader = function(resize) {
        var t = Main.scrollTop;
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

    Main.scrolls.push(checkHeader);

    var resize = function() {
        headerTop = $('.site-header .nav-placeholder').offset().top;
        checkHeader(true);
        $('.ck-content img').trigger('ckresize');

        $('.responsive-video iframe').each(function() {
            $(this).height(Math.min($(this).width() * 9 / 16, Main.wHeight - $('.nav-placeholder').height()));
        });
    };
    Main.resizes.push(resize);
    resize();
}

function setupNav(menu, close, navContainer) {
    // We do not want hovering to be triggered on touch devices
    $('.scroll-container > ul > li').on('mouseover', function() {
        $(this).addClass('hover');
    }).on('mouseout', function() {
        $(this).removeClass('hover');
    });

    $('.drop-indicator').click(function() {
        $(this).closest('li').toggleClass('active');
    }).outside('click', function() {
        $(this).closest('li').removeClass('active');
    });

    menu.click(function() {
        navContainer.toggleClass('active');
    });

    close.click(function() {
        navContainer.removeClass('active');
    });
}

function homePage() {
    setupNav($('.nav-container .menu-button'), $('.nav-container .close-button'), $('.nav-container'));
}
