/**
 * Main JS file for Casper behaviours
 */

/* globals jQuery, document */
(function ($, sr, undefined) {
    "use strict";

    var $document = $(document),

        // debouncing function from John Hann
        // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
        debounce = function (func, threshold, execAsap) {
            var timeout;

            return function debounced () {
                var obj = this, args = arguments;
                function delayed () {
                    if (!execAsap) {
                        func.apply(obj, args);
                    }
                    timeout = null;
                }

                if (timeout) {
                    clearTimeout(timeout);
                } else if (execAsap) {
                    func.apply(obj, args);
                }

                timeout = setTimeout(delayed, threshold || 100);
            };
        };

    $document.ready(function () {

        var $postContent = $(".post-content");
        $postContent.fitVids();

        function updateImageWidth() {
            var $this = $(this),
                contentWidth = $postContent.outerWidth(), // Width of the content
                imageWidth = this.naturalWidth; // Original image resolution

            if (imageWidth >= contentWidth) {
                $this.addClass('full-img');
            } else {
                $this.removeClass('full-img');
            }
        }

        var $img = $("img").on('load', updateImageWidth);
        function casperFullImg() {
            $img.each(updateImageWidth);
        }

        casperFullImg();
        $(window).smartresize(casperFullImg);

        $(".scroll-down").arctic_scroll();

    });

    // smartresize
    jQuery.fn[sr] = function(fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

    // Arctic Scroll by Paul Adam Davis
    // https://github.com/PaulAdamDavis/Arctic-Scroll
    $.fn.arctic_scroll = function (options) {

        var defaults = {
            elem: $(this),
            speed: 500
        },

        allOptions = $.extend(defaults, options);

        allOptions.elem.click(function (event) {
            event.preventDefault();
            var $this = $(this),
                $htmlBody = $('html, body'),
                offset = ($this.attr('data-offset')) ? $this.attr('data-offset') : false,
                position = ($this.attr('data-position')) ? $this.attr('data-position') : false,
                toMove;

            if (offset) {
                toMove = parseInt(offset);
                $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top + toMove) }, allOptions.speed);
            } else if (position) {
                toMove = parseInt(position);
                $htmlBody.stop(true, false).animate({scrollTop: toMove }, allOptions.speed);
            } else {
                $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top) }, allOptions.speed);
            }
        });

    };
})(jQuery, 'smartresize');

(function() {
    var WIDTH, HEIGHT, canvas, con, g;
    var pxs = [];
    var rint = 50;

    $.fn.astral = function() {
        this.append($('<canvas id="astral"></canvas>'));
        setup(this);
    }

    function setup(container) {
        var windowSize = function() {
            WIDTH = container.innerWidth();
            HEIGHT = container.innerHeight();
            canvas = container.find('#astral');
            canvas.attr('width', WIDTH).attr('height', HEIGHT);
        };

        windowSize();

        $(window).resize(function() {
            windowSize();
        });

        con = canvas[0].getContext('2d');

        for (var i = 0; i < 100; i++) {
            pxs[i] = new Circle();
            pxs[i].reset();
        }

        requestAnimationFrame(draw);
    }

    function draw() {
        con.clearRect(0, 0, WIDTH, HEIGHT);
        con.globalCompositeOperation = "lighter";

        for (var i = 0; i < pxs.length; i++) {
            pxs[i].fade();
            pxs[i].move();
            pxs[i].draw();
        }

        requestAnimationFrame(draw);
    }

    function Circle() {
        this.s = {
            ttl: 15000,
            xmax: 5,
            ymax: 2,
            rmax: 7,
            rt: 1,
            xdef: 960,
            ydef: 540,
            xdrift: 4,
            ydrift: 4,
            random: true,
            blink: true
        };

        this.reset = function() {
            this.x = (this.s.random ? WIDTH * Math.random() : this.s.xdef);
            this.y = (this.s.random ? HEIGHT * Math.random() : this.s.ydef);
            this.r = ((this.s.rmax - 1) * Math.random()) + 1;

            this.dx = (Math.random() * this.s.xmax) * (Math.random() < 0.5 ? -1 : 1);
            this.dy = (Math.random() * this.s.ymax) * (Math.random() < 0.5 ? -1 : 1);

            this.hl = (this.s.ttl / rint) * (this.r / this.s.rmax);
            this.rt = Math.random() * this.hl;

            this.stop = Math.random() * 0.2 + 0.4;

            this.s.rt = Math.random() + 1;
            this.s.xdrift *= Math.random() * (Math.random() < 0.5 ? -1 : 1);
            this.s.ydrift *= Math.random() * (Math.random() < 0.5 ? -1 : 1);
        };

        this.fade = function() {
            this.rt += this.s.rt;
        };

        this.draw = function() {
            var newo, cr;

            if (this.s.blink && (this.rt <= 0 || this.rt >= this.hl)) {
                this.s.rt = this.s.rt * -1;
            } else if (this.rt >= this.hl) {
                this.reset();
            }

            newo = 1 - (this.rt / this.hl);

            con.beginPath();
            con.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
            con.closePath();

            cr = this.r * newo;

            g = con.createRadialGradient(this.x, this.y, 0, this.x, this.y, (cr <= 0 ? 1 : cr));
            g.addColorStop(0.0, 'rgba(254,254,254,' + newo + ')');
            g.addColorStop(this.stop, 'rgba(254,254,254,' + (newo * 0.2) + ')');
            g.addColorStop(1.0, 'rgba(254,254,254,0)');

            con.fillStyle = g;
            con.fill();
        };

        this.move = function() {
            this.x += (this.rt / this.hl) * this.dx;
            this.y += (this.rt / this.hl) * this.dy;
            if (this.x > WIDTH || this.x < 0) this.dx *= -1;
            if (this.y > HEIGHT || this.y < 0) this.dy *= -1;
        };

        this.getX = function() {
            return this.x;
        };

        this.getY = function() {
            return this.y;
        };
    };
})();
$('.firefly').astral();