$("#directions-carousel").carousel({
    interval : 7500,
    pause: true
});

var html5VideoCapture = {
    onFailSoHard: function(a) {
        if (a.code == 1) {
            alert("You didn't allow the camera, so nothing is going to happen!")
        } else {
            alert("Camera access is not supported in your browser, please try Chrome or Firefox.")
        }
    },
    localMediaStream: null,
    video: null,
    canvas: null,
    sizeCanvas: function() {
        var a = this;
        setTimeout(function() {
            var c = a.resizeCanvasToCamera ? a.video.videoWidth : a.canvas.width;
            var b = a.resizeCanvasToCamera ? a.video.videoHeight : a.canvas.height;
            a.canvas.width = c;
            a.canvas.height = b
        }, 100)
    },
    start: function() {
        var a = this;
        if (navigator.getUserMedia) {
            navigator.getUserMedia("video", function(b) {
                a.video.src = b;
                a.localMediaStream = b;
                a.sizeCanvas.call(a)
            }, this.onFailSoHard)
        } else {
            if (navigator.webkitGetUserMedia) {
                navigator.webkitGetUserMedia({
                    video: true
                }, function(b) {
                    a.video.src = window.webkitURL.createObjectURL(b);
                    a.localMediaStream = b;
                    a.sizeCanvas.call(this)
                }, this.onFailSoHard)
            } else {
                if (navigator.mozGetUserMedia) {
                    navigator.mozGetUserMedia({
                        video: true
                    }, function(b) {
                        a.video.src = window.URL.createObjectURL(b);
                        a.localMediaStream = b;
                        a.sizeCanvas.call(this)
                    }, this.onFailSoHard)
                } else {
                    this.onFailSoHard({
                        target: this.video
                    })
                }
            }
        }
    },
    config: {
        selectors: {
            video: null,
            canvas: null,
            buttons: {
                start: null,
                screenshot: null,
                stop: null
            },
            secondaryCanvases: []
        },
        resizeCanvasToCamera: true
    },
    snapshot: function(c, b) {
        var a = b.getContext("2d");
        a.drawImage(c, 0, 0, b.width, b.height)
    },
    init: function(d) {
        if (d) {
            $.extend(true, this.config, d)
        }
        var a = this;
        this.video = document.querySelector(this.config.selectors.video);
        var c = document.querySelector(this.config.selectors.buttons.screenshot);
        var b = document.querySelector(this.config.selectors.buttons.start);
        this.canvas = document.querySelector(this.config.selectors.canvas);
        if (c) {
            c.addEventListener("click", function(g) {
                if (a.localMediaStream) {
                    a.snapshot(a.video, a.canvas);
                    if (a.config.selectors.secondaryCanvases instanceof Array) {
                        for (i in a.config.selectors.secondaryCanvases) {
                            var f = document.querySelector(a.config.selectors.secondaryCanvases[i]);
                            a.snapshot(a.video, f)
                        }
                    }
                    return
                }
            }, false)
        }
        if (b) {
            b.addEventListener("click", function(f) {
                a.start.call(this)
            }, false)
        }
        this.video.addEventListener("click", this.snapshot, false);
        document.querySelector(this.config.selectors.buttons.stop).addEventListener("click", function(f) {
            a.video.pause();
            a.localMediaStream.stop()
        }, false)
    }
};
var keypad = {
    phone: null,
    display: null,
    buttonsContainer: null,
    interacting: false,
    getNum: function(a) {
        return a.data("value")
    },
    getT9: function(a) {
        var b = "<div>" + a.html() + "</div>";
        return $(b).find("span:first").html()
    },
    write: function(a) {
        if (keypad.interacting && keypad.display.html().length >= 12) {
            return false
        }
        if (keypad.interacting) {
            keypad.display.append(a)
        } else {
            keypad.display.html(a);
            keypad.interacting = true
        }
    },
    backspace: function() {
        var a = keypad.display.html();
        return keypad.display.html(a.substring(0, a.length - 1))
    },
    bindClicks: function() {
        keypad.buttonsContainer.on("mousedown.keypad", "li", function() {
            keypad.unpressAll();
            $(this).addClass("pressing");
            keypad.write(keypad.getNum($(this)))
        });
        keypad.buttonsContainer.on("mouseup.keypad", "li", function() {
            keypad.unpressAll()
        });
        keypad.buttonsContainer.on("click.keypad", "i.delete", function() {
            keypad.backspace()
        })
    },
    unpressAll: function() {
        $("ul li", keypad.buttonsContainer).removeClass("pressing")
    },
    performKeyPress: function(a) {
        var c = $(a);
        c.addClass("pressing");
        var b = keypad.getNum(c);
        if (b) {
            keypad.write(b)
        }
        $(document).one("keyup.keypad", function() {
            $(a).removeClass("pressing")
        })
    },
    bindKeys: function() {
        $(document).on("keydown.keypad", function(a) {
            var c = a.which;
            if (c > 57) {
                c = c - 48
            }
            if (c >= 48 && c <= 57) {
                var b = "li[data-value=" + String.fromCharCode(c) + "]";
                keypad.performKeyPress(b);
                return
            }
            if (c === 8) {
                a.preventDefault();
                keypad.backspace()
            }
        })
    },
    unbindAll: function() {
        $(document).unbind(".keypad");
        keypad.buttonsContainer.unbind(".keypad")
    },
    init: function() {
        keypad.display = $("div.number");
        keypad.buttonsContainer = $("#phone");
        keypad.unbindAll();
        keypad.bindClicks();
        keypad.bindKeys()
    }
};


var keyboard = {
    selectors: {
        output: "",
        keyboard: "",
        display: ""
    },
    mode: "input",
    display: null,
    keyboardContainer: null,
    getVal: function(a) {
        return a.data("value")
    },
    write: function(a) {
        this.display.val(this.display.val() + a)
    },
    clear: function() {
        this.display.val("")
    },
    send: function() {
        if (!this.selectors.output) {
            return
        }
        if (!this.display.val()) {
            return
        }
        var a = this;

        $(this.selectors.output).append(function() {
            return $('<span>' + a.display.val() + '</span>')
        });

        a.display.val("");
        this.scrollMessages()
    },
    respond: function(query, callback) {

        // Make XMLHttpRequest to proper endpoint to receive pseudo-twilio response.
        var request = new XMLHttpRequest();
        var params = "query=" + query;

        // Open the HTTP request and pass in searchQuery as a parameter.
        request.open('POST', '/api/frontend?' + params, true);

        // Wait for the request to succeed and pass data back to callback function.
        request.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    callback(this.responseText);
                } else {
                    console.log('An error occurred, error code: ' + this.status);
                    return;
                }
            }
        }

        // Send the request to the server.
        request.send();
    },
    backspace: function() {
        var a = this.display.val();
        return this.display.val(a.substring(0, a.length - 1))
    },
    bindClicks: function() {
        var a = this;
        $(document).on("mousedown.keyboard", ".messages-send", function() {
            var query = a.display.val();

            // Make respective calls to send and receive messages on output.
            a.send.call(a)
            a.respond(query, function (data) {
                $(a.selectors.output).append(function() {
                    return $('<span class="sender" style="display: block;">' + data + '</span>')
                });
                a.display.val("");
                a.scrollMessages()
            });
        });
        this.keyboardContainer.on("mousedown.keyboard", "ul li", function() {
            a.unpressAll.call(a);
            $(this).addClass("pressing");
            var b = $(this);
            if (b.hasClass("delete")) {
                a.backspace.call(a);
                return
            }
            var c = a.getVal.call(a, b);
            if (c) {
                a.write.call(a, c)
            }
        });
        this.keyboardContainer.on("mouseup.keyboard", "li", function() {
            a.unpressAll.call(a)
        })
    },
    unpressAll: function() {
        $("ul li", this.keyboardContainer).removeClass("pressing")
    },
    performKeyPress: function(a) {
        var b = $(a);
        b.addClass("pressing");
        if (!this.display.is(":focus")) {
            var c = this.getVal.call(this, b);
            if (c) {
                this.write.call(this, c)
            }
        }
        $(document).one("keyup.keyboard", function() {
            $(a).removeClass("pressing")
        });
    },
    bindKeys: function() {
        var a = this;
        $(document).on("keydown.keyboard", function(b) {
            var d = b.which;
            if (d >= 65 && d <= 90) {
                var c = "li[data-value=" + String.fromCharCode(d).toLowerCase() + "]";
                a.performKeyPress.call(a, c);
                return
            }
            switch (d) {
                case 32:
                    if (a.display.is(":focus")) {
                        a.write.call(a, " ")
                    }
                    a.performKeyPress.call(a, "li.space");
                    b.preventDefault();
                    break;
                case 8:
                    a.backspace.call(a);
                    a.performKeyPress.call(a, "li.delete");
                    b.preventDefault();
                    break;
                case 13:
                    if ("textarea" === a.mode) {
                        return
                    }
                    var query = a.display.val();

                    a.send.call(a);
                    a.respond(query, function (data) {
                        $(a.selectors.output).append(function() {
                            return $('<span class="sender" style="display: block;">' + data + '</span>')
                        });
                        a.display.val("");
                        a.scrollMessages()
                    });
                    b.preventDefault();
                    break
            }
        })
    },
    unbindAll: function() {
        $(document).unbind(".keyboard");
        this.keyboardContainer.unbind(".keyboard")
    },
    scrollMessages: function() {
        var a = $(this.selectors.output);
        a.animate({
            scrollTop: a.prop("scrollHeight") - a.height()
        }, 250)
    },
    init: function(a) {
        if (a) {
            this.selectors = a.selectors
        }
        this.display = $(this.selectors.display);
        switch (this.display.prop("tagName").toLowerCase()) {
            case "textarea":
                this.mode = "textarea";
                break;
            default:
                this.mode = "input"
        }
        this.keyboardContainer = $(this.selectors.keyboard);
        this.display.focus();
        this.unbindAll.call(this);
        this.bindClicks.call(this);
        this.bindKeys()
    }
};
var volumeControl = {
    selectors: {
        buttons: {
            up: "b.volume.up",
            down: "b.volume.down"
        },
        overlay: "div.volume-overlay",
        indicators: "div.volume-overlay ul li"
    },
    timers: {
        hideOverlay: null
    },
    volume: 0,
    showOverlay: function() {
        var a = this;
        clearTimeout(this.timers.hideOverlay);
        $(this.selectors.overlay).stop(true, true).show();
        this.timers.hideOverlay = setTimeout(function() {
            $(a.selectors.overlay).fadeOut(750)
        }, 2000)
    },
    increaseVolume: function() {
        this.showOverlay.call(this);
        if (this.volume >= 15) {
            return
        }
        this.volume++;
        this.updateIndicators.call(this)
    },
    decreaseVolume: function() {
        this.showOverlay.call(this);
        if (this.volume <= 1) {
            return
        }
        this.volume--;
        this.updateIndicators.call(this)
    },
    updateIndicators: function() {
        $(this.selectors.indicators).removeClass("on");
        var a = this.selectors.indicators + ":lt(" + this.volume + ")";
        $(a).addClass("on")
    },
    init: function() {
        var a = this;
        $("#iPhone").on("click", this.selectors.buttons.up, function() {
            a.increaseVolume.call(a)
        });
        $("#iPhone").on("click", this.selectors.buttons.down, function() {
            a.decreaseVolume.call(a)
        })
    }
};

$(function() {



    $("#messages").fadeIn(100);
    $(".status-bar").addClass("black");
    $(".sender").delay(1000).fadeIn(100);
    $(".content .app-info").hide();
    $(".content #messages-content").show()

    $(document).on("click", "#iPhone b.lock", function() {
        var g = $("#iPhone");
        switch (true) {
            case g.hasClass("off"):
                g.removeClass("off").addClass("on");
                $("#messages").fadeIn(100);
                $(".status-bar").addClass("black");
                $(".sender").delay(1000).fadeIn(100);
                $(".content .app-info").hide();
                $(".content #messages-content").show()
                break;
            case g.hasClass("on"):
                g.removeClass("on").addClass("off");
                $(".app").hide();
                $("#camera").hide();
                $("#pull-down").hide();
                $("#widgets-menu").animate({
                    bottom: -428
                }, 200);
                $(".status-bar").show().removeClass("black");
                $(".content .turn-on").show();
                $("#search-keyboard").animate({
                    bottom: -211
                }, 1);
                $(".content .app-info").hide();
                $(".content #off-content").show();
                break;
        }
    });

    var c = 0;
    $("#iPhone").on("mousedown", "b.home", function() {
        c = setTimeout(function() {
            $("#siri").fadeIn(100, function() {
                $("#iPhone").on("mousedown", "b.home", function() {
                    $("#siri").fadeOut(100)
                })
            })
        }, 1000)
    }).on("mouseup mouseleave", function(g) {
        clearTimeout(c)
    });
    $("#iPhone").on("dblclick", "b.home", function() {
        var g = $("#iPhone");
        switch (true) {
            case g.hasClass("on"):
                $("#multitasking").fadeIn(100);
                break
        }
    });
    $("#multitasking .panel.one").swipe({
        swipeLeft: function(h, k, l, j, g) {
            $("#multitasking .app-list").animate({
                left: -332
            }, 200)
        },
        threshold: 0
    });
    $("#multitasking .panel.two").swipe({
        swipeRight: function(h, k, l, j, g) {
            $("#multitasking .app-list").animate({
                left: 20
            }, 200)
        },
        threshold: 0
    });
    if ($("#iPhone").hasClass("off")) {
        $("#off-content").show()
    }
    $("#iPhone div.unlock").swipe({
        swipeRight: function(h, k, l, j, g) {
            $(".lock-screen").animate({
                right: -320
            }, 200);
            setTimeout(function() {
                $("#iPhone").removeClass().addClass("on");
                $("#multitasking").hide();
                $(".lock-screen").hide();
                $(".content .app-info").hide();
                $(".content #homescreen-content").show();
                $(".lock-screen").animate({
                    right: 4
                }, 200)
            }, 200)
        },
        threshold: 0
    });
    $(".home-screen, .lock-screen, #show-widgets-lock").swipe({
        swipeUp: function(h, k, l, j, g) {
            $("#widgets-menu").animate({
                bottom: 4
            }, 200)
        },
        threshold: 0
    });
    $(".status-bar").swipe({
        swipeDown: function(h, k, l, j, g) {
            $("#pull-down").slideDown(200);
            $("#widgets-menu").animate({
                bottom: -428
            }, 200)
        },
        threshold: 0
    });
    $("#widgets-menu").swipe({
        swipeDown: function(h, k, l, j, g) {
            $("#widgets-menu").animate({
                bottom: -428
            }, 200)
        },
        threshold: 0
    });
    $("b#hide-widgets-menu").click(function() {
        $("#widgets-menu").animate({
            bottom: -428
        }, 200)
    });
    $("ul.apps").swipe({
        swipeDown: function(h, k, l, j, g) {
            $("#search").slideDown(200);
            $("#search-keyboard").animate({
                bottom: 4
            }, 200)
        },
        threshold: 0
    });
    $("#search").swipe({
        swipeUp: function(h, k, l, j, g) {
            $("#search").slideUp(200);
            $("#search-keyboard").animate({
                bottom: -211
            }, 200)
        },
        threshold: 0
    });
    $("ul.widgets-sub li.dnd").click(function() {
        $("ul.widgets-sub li.dnd").toggleClass("off")
    });
    $("ul.widgets-sub li.rotation-lock").click(function() {
        $("ul.widgets-sub li.rotation-lock").toggleClass("off")
    });
    $(document).on("click", "ul#colours li a", function() {
        return false
    });
    $(document).on("click", "ul#colours li a.black", function() {
        $("#colour").removeClass().addClass("black")
    });
    $(document).on("click", "ul#colours li a.white", function() {
        $("#colour").removeClass().addClass("white")
    });
    $(document).on("click", "ul#colours li a.red", function() {
        $("#colour").removeClass().addClass("red")
    });
    $(document).on("click", "ul#colours li a.blue", function() {
        $("#colour").removeClass().addClass("blue")
    });
    $(document).on("click", "ul#colours li a.pink", function() {
        $("#colour").removeClass().addClass("pink")
    });
    $(document).on("click", "ul#colours li a.gold", function() {
        $("#colour").removeClass().addClass("gold")
    });
    $(".status-bar").click(function() {
        $("#pull-down").slideToggle(200)
    });
    $("#pull-down b.handle-btn").click(function() {
        $("#pull-down").slideUp(200)
    });
    $("#pull-down").swipe({
        swipeUp: function(h, k, l, j, g) {
            $("#pull-down").slideUp(200)
        },
        threshold: 0
    });
    $(document).on("click", "li#show-messages", function() {
        $("#messages").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".sender").delay(1000).fadeIn(100);
        $(".content .app-info").hide();
        $(".content #messages-content").show()
    });
    $(document).on("click", "li#show-calendar", function() {
        $("#calendar-app").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #calendar-content").show()
    });
    $(document).on("click", "#calendar-app b#show-day", function() {
        $("#calendar-app #calendar-day").fadeIn(100)
    });
    $(document).on("click", "#calendar-app #calendar-day", function() {
        $("#calendar-app #calendar-day").fadeOut(100)
    });
    $(document).on("click", "li#show-photos", function() {
        $("#photos").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #photos-content").show()
    });
    $("li#show-camera").click(function() {
        $("#camera").show();
        $("#iPhone").addClass("show-app");
        $(".status-bar").hide();
        $(".content .app-info").hide();
        $(".content #camera-content").show();
        html5VideoCapture.init.call(html5VideoCapture, {
            selectors: {
                video: "#live_video",
                canvas: "#canvas",
                buttons: {
                    screenshot: "#snapshot",
                    stop: "b.home"
                },
                secondaryCanvases: ["#mini-photo"]
            },
            resizeCanvasToCamera: false
        });
        html5VideoCapture.start.call(html5VideoCapture)
    });
    $(document).on("click", "li#show-weather", function() {
        $("#weather").fadeIn(100);
        $(".content .app-info").hide();
        $(".content #weather-content").show()
    });
    $(document).on("click", "li#show-clock", function() {
        $("#clock").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #clock-content").show()
    });
    $(document).on("click", "#clock ul li.clock", function() {
        $("#clock .main").hide();
        $("#clock-app").show()
    });
    $(document).on("click", "#clock ul li.alarm", function() {
        $("#clock .main").hide();
        $("#alarm").show()
    });
    $(document).on("click", "#clock ul li.stopwatch", function() {
        $("#clock .main").hide();
        $("#stopwatch").show()
    });
    $(document).on("click", "#clock ul li.timer", function() {
        $("#clock .main").hide();
        $("#timer").show()
    });
    $(document).on("click", "li#show-maps", function() {
        $("#maps").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #maps-content").show()
    });
    $(document).on("click", "li#show-videos", function() {
        $("#videos").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #videos-content").show()
    });
    $(document).on("click", "#videos ul li.videos-movies", function() {
        $("#videos .main").hide()
    });
    $(document).on("click", "#videos ul li.videos-tv", function() {
        $("#videos .main").hide();
        $("#videos-tv").show()
    });
    $(document).on("click", "#videos ul li.videos-music", function() {
        $("#videos .main").hide();
        $("#videos-music").show()
    });
    $(document).on("click", "li#show-notes", function() {
        $("#notes").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #notes-content").show();
        keyboard.init.call(keyboard, {
            selectors: {
                keyboard: "#notes div.keyboard",
                display: "#notes textarea"
            }
        });
        keyboard.write.call(keyboard, " ")
    });
    $(document).on("click", "li#show-reminders", function() {
        $("#reminders").fadeIn(100);
        $(".content .app-info").hide();
        $(".content #reminders-content").show()
    });
    $(document).on("click", "li#show-stocks", function() {
        $("#stocks").fadeIn(100);
        $(".content .app-info").hide();
        $(".content #stocks-content").show()
    });
    $(document).on("click", "li#show-gamecenter", function() {
        $("#gamecenter").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #gamecenter-content").show()
    });
    $(document).on("click", "li#show-newsstand", function() {
        $("#newsstand").fadeIn(100);
        $(".content .app-info").hide();
        $(".content #newsstand-content").show()
    });
    $(document).on("click", "li#show-itunes", function() {
        $("#itunes").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #itunes-content").show()
    });
    $(document).on("click", "#itunes ul li.itunes-music", function() {
        $("#itunes .main").hide();
        $(".status-bar").addClass("black")
    });
    $(document).on("click", "#itunes ul li.films", function() {
        $("#itunes .main").hide();
        $("#films").show();
        $(".status-bar").removeClass("black")
    });
    $(document).on("click", "#itunes ul li.tv-programmes", function() {
        $("#itunes .main").hide();
        $("#tv-programmes").show();
        $(".status-bar").removeClass("black")
    });
    $(document).on("click", "#itunes ul li.itunes-search", function() {
        $("#itunes .main").hide();
        $("#itunes-search").show();
        $(".status-bar").addClass("black")
    });
    $(document).on("click", "#itunes ul li.itunes-more", function() {
        $("#itunes .main").hide();
        $("#itunes-more").show();
        $(".status-bar").addClass("black")
    });
    $(document).on("click", "li#show-appstore", function() {
        $("#appstore").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #appstore-content").show()
    });
    $(document).on("click", "#appstore ul li.appstore-featured", function() {
        $("#appstore .main").hide()
    });
    $(document).on("click", "#appstore ul li.appstore-charts", function() {
        $("#appstore .main").hide();
        $("#appstore-charts").show()
    });
    $(document).on("click", "#appstore ul li.near-me", function() {
        $("#appstore .main").hide();
        $("#near-me").show()
    });
    $(document).on("click", "#appstore ul li.appstore-search", function() {
        $("#appstore .main").hide();
        $("#appstore-search").show()
    });
    $(document).on("click", "#appstore ul li.appstore-updates", function() {
        $("#appstore .main").hide();
        $("#appstore-updates").show()
    });
    $(document).on("click", "li#show-passbook", function() {
        $("#passbook").fadeIn(100);
        $(".content .app-info").hide();
        $(".content #passbook-content").show()
    });
    $(document).on("click", "li#show-compass", function() {
        $("#compass").fadeIn(100);
        $(".content .app-info").hide();
        $(".content #compass-content").show()
    });
    $(document).on("click", "li#show-settings", function() {
        $("#settings").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #settings-content").show()
    });
    $(document).on("click", "li#show-phone", function() {
        $("#phone").fadeIn(100);
        keypad.init();
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #phone-content").show()
    });
    $(document).on("click", "#phone ul li.favourites", function() {
        $("#phone .main").hide();
        $("#favourites").show();
        $(".status-bar").addClass("black")
    });
    $(document).on("click", "#phone ul li.recents", function() {
        $("#phone .main").hide();
        $("#recents").show();
        $(".status-bar").addClass("black")
    });
    $(document).on("click", "#phone ul li.contacts", function() {
        $("#phone .main").hide();
        $("#contacts").show();
        $(".status-bar").addClass("black")
    });
    $(document).on("click", "#phone ul li.keypad", function() {
        $("#phone .main").hide();
        $("#keypad").show();
        $(".status-bar").addClass("black")
    });
    $(document).on("click", "#phone ul li.voicemail", function() {
        $("#phone .main").hide();
        $("#voicemail").show();
        $(".status-bar").removeClass("black")
    });
    $(document).on("click", "#voicemail", function() {
        $("#phone .main").hide();
        $("#keypad").show();
        $(".status-bar").addClass("black")
    });
    $(document).on("click", "b#call", function() {
        $("#phone").addClass("calling");
        $(".status-bar").removeClass("black")
    });
    $(document).on("click", "#phone.calling b#call", function() {
        $("#phone").removeClass("calling");
        $(".status-bar").addClass("black")
    });
    $(document).on("click", "li#show-mail", function() {
        $("#mail").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #mail-content").show()
    });
    $(document).on("click", "#inbox1", function() {
        $(".panels").animate({
            left: "-312px"
        }, 200, "linear")
    });
    $(document).on("click", "#inbox2", function() {
        $(".panels").animate({
            left: "-624px"
        }, 200, "linear")
    });
    $(document).on("click", "#read-mail", function() {
        $(".panels").animate({
            left: "-936px"
        }, 200, "linear")
    });
    $(document).on("click", ".mailbox b.back", function() {
        $(".panels").animate({
            left: "0"
        }, 200, "linear")
    });
    $(document).on("click", ".inbox b.back", function() {
        $(".panels").animate({
            left: "-312px"
        }, 200, "linear")
    });
    $(document).on("click", ".mail-message b.back", function() {
        $(".panels").animate({
            left: "-624px"
        }, 200, "linear")
    });
    $(".mailbox").swipe({
        swipeRight: function(h, k, l, j, g) {
            $(".panels").animate({
                left: "0"
            }, 200, "linear")
        },
        threshold: 0
    });
    $(".inbox").swipe({
        swipeRight: function(h, k, l, j, g) {
            $(".panels").animate({
                left: "-312px"
            }, 200, "linear")
        },
        threshold: 0
    });
    $(".mail-message").swipe({
        swipeRight: function(h, k, l, j, g) {
            $(".panels").animate({
                left: "-624px"
            }, 200, "linear")
        },
        threshold: 0
    });
    $(document).on("click", "li#show-safari", function() {
        $("#safari").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #safari-content").show();
        if (screen.width <= 800) {
            $("#safari-iframe").attr("src", "http://recombu.com/mobile/")
        } else {
            $("#safari-iframe").attr("src", "http://recombu.com/mobile/").attr("scrolling", "yes")
        }
    });
    $(document).on("click", "#safari ul li.bookmarks", function() {
        $("#bookmarks").fadeIn(100);
        $("#safari-iframe").hide()
    });
    $(document).on("click", "#safari ul li.tabs", function() {
        $("#safari-tabs").fadeIn(100);
        $(".status-bar").removeClass("black");
        $("#safari-iframe").hide();
        $("#safari ul").hide()
    });
    $(document).on("click", "#safari #bookmarks", function() {
        $("#safari #bookmarks").fadeOut(100);
        $("#safari-iframe").show()
    });
    $(document).on("click", "#safari #safari-tabs", function() {
        $("#safari #safari-tabs").fadeOut(100);
        $(".status-bar").addClass("black");
        $("#safari-iframe").show();
        $("#safari ul").show()
    });
    $(document).on("click", "li#show-music", function() {
        $("#music").fadeIn(100);
        $(".status-bar").addClass("black");
        $(".content .app-info").hide();
        $(".content #music-content").show()
    });
    $(document).on("click", "#music ul li.playlists", function() {
        $("#music .main").hide()
    });
    $(document).on("click", "#music ul li.artists", function() {
        $("#music .main").hide();
        $("#artists").show()
    });
    $(document).on("click", "#music ul li.songs", function() {
        $("#music .main").hide();
        $("#songs").show()
    });
    $(document).on("click", "#music ul li.albums", function() {
        $("#music .main").hide();
        $("#albums").show()
    });
    $(document).on("click", "#music ul li.music-more", function() {
        $("#music .main").hide();
        $("#music-more").show()
    });
    $(document).on("click", "ul.nav-bar li.share", function() {
        $("#share").fadeIn(100)
    });
    $(document).on("click", "#share b#cancel", function() {
        $("#share").fadeOut(100)
    });
    $(document).on("click", "b#camera-btn", function() {
        $("#iPhone").addClass("show-app");
        $(".lock-screen").slideUp(300);
        $(".status-bar").hide();
        $("#camera").fadeIn();
        html5VideoCapture.init.call(html5VideoCapture, {
            selectors: {
                video: "#live_video",
                canvas: "#canvas",
                buttons: {
                    screenshot: "#snapshot",
                    stop: "b.home"
                },
                secondaryCanvases: ["#mini-photo"]
            },
            resizeCanvasToCamera: false
        });
        html5VideoCapture.start.call(html5VideoCapture);
        return false
    });
    $(document).on("click", "b#filters", function() {
        $("img#filters").fadeToggle(200)
    });
    $("#messages input").click(function() {
        $("#messages .bg").animate({
            top: "-190px"
        }, 200, "linear");
        $("#messages input").animate({
            top: "326px"
        }, 200, "linear");
        $("#messages .submit").animate({
            top: "326px"
        }, 200, "linear");
        $("#messages .keyboard").animate({
            bottom: "0"
        }, 200, "linear");
        $("#messages #messages-output").animate({
            height: "240px"
        }, 200, "linear", function() {
            keyboard.scrollMessages.call(keyboard)
        });
        keyboard.init.call(keyboard, {
            selectors: {
                output: "#messages-output",
                keyboard: "div.keyboard",
                display: "#messages-input"
            }
        })
    });
    $("#messages #messages-output, #messages .bg").click(function() {
        keyboard.unbindAll.call(keyboard);
        $("#messages .bg").animate({
            top: "0"
        }, 200, "linear");
        $("#messages .keyboard").animate({
            bottom: "-190px"
        }, 200, "linear");
        $("#messages input").animate({
            top: "518px"
        }, 200, "linear");
        $("#messages .submit").animate({
            top: "518px"
        }, 200, "linear");
        $("#messages #messages-output").animate({
            height: "433px"
        }, 200, "linear")
    });
    volumeControl.init.call(volumeControl);
    var e = {
        states: {},
        detectState: function(g) {
            return !$("ul.widgets li." + g).hasClass("off")
        },
        storeState: function(g) {
            e.states[g] = e.detectState(g)
        },
        restore: function() {
            for (var h in e.states) {
                if (!e.states.hasOwnProperty(h)) {
                    continue
                }
                var g = "ul.widgets li." + h + ", .status-bar i." + h;
                if (e.states[h]) {
                    $(g).removeClass("off")
                } else {
                    $(g).addClass("off")
                }
            }
        },
        init: function() {
            $("ul.widgets li").each(function() {
                var h = $(this);
                var g = h.attr("class").split(" ")[0];
                e.states[g] = e.detectState(g)
            })
        }
    };
    e.init();
    var d = function() {
        return !$("ul.widgets li.airplane").hasClass("off")
    };
    $.each(["wifi", "bluetooth", "location"], function(g, h) {
        $("ul.widgets").on("click", "li." + h, function() {
            if (d()) {
                return true
            }
            $("ul.widgets li." + h + ", .status-bar i." + h).toggleClass("off");
            e.storeState(h)
        })
    });
    var a = [];
    var f;
    $("ul.widgets").on("click", "li.airplane", function() {
        for (var g = 0; g < a.length; g++) {
            clearTimeout(a[g])
        }
        clearInterval(f);
        if (d()) {
            $(".status-bar i.airplane").addClass("off");
            $(".status-bar .network").removeClass("off");
            e.restore();
            $(".status-bar ul.signal").removeClass("off").find("li").addClass("no-signal");
            $(".status-bar ul.signal li:nth-child(1)").removeClass("no-signal");
            a.push(setTimeout(function() {
                var h = 0;
                f = setInterval(function() {
                    if (h > 5) {
                        $(".status-bar ul.signal li:nth-child(5)").addClass("no-signal");
                        a.push(setTimeout(function() {
                            $(".status-bar ul.signal li:nth-child(5)").removeClass("no-signal")
                        }, 2500));
                        clearInterval(f);
                        return
                    }
                    h++;
                    $(".status-bar ul.signal li:nth-child(" + (h + 1) + ")").removeClass("no-signal")
                }, 1000)
            }, 500));
            return
        }
        $("ul.widgets li.airplane, .status-bar i.airplane, .status-bar ul.signal, .status-bar .network").toggleClass("off");
        $("ul.widgets li.wifi, .status-bar i.wifi, ul.widgets li.bluetooth, .status-bar i.bluetooth, ul.widgets li.location, .status-bar i.location").addClass("off")
    });

    function b() {
        this.now = new Date();
        this.hours = ("0" + this.now.getHours()).slice(-2);
        this.minutes = ("0" + this.now.getMinutes()).slice(-2);
        var g = this;
        for (var h = 1; h <= 2; h++) {
            $("#hour" + h).attr("src", function(k, j) {
                return j.replace(/\d+\.png/gi, g.hours.charAt(h - 1) + ".png")
            });
            $("#minute" + h).attr("src", function(k, j) {
                return j.replace(/\d+\.png/gi, g.minutes.charAt(h - 1) + ".png")
            })
        }
        $("#text-hour").html(this.hours);
        $("#text-minute").html(this.minutes)
    }
    b();
    setInterval(function() {
        b()
    }, 1000)
});

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var newDate = new Date();
newDate.setDate(newDate.getDate());
$("#date").html(dayNames[newDate.getDay()] + " " + newDate.getDate() + " " + monthNames[newDate.getMonth()]);
$("#cal-date").html(dayNames[newDate.getDay()]);
$("#cal-day").html(newDate.getDate());
$("#cal-date2").html(dayNames[newDate.getDay()]);
$("#cal-day2").html(newDate.getDate());
$("#cal-date3").html(dayNames[newDate.getDay()]);
$("#cal-day3").html(newDate.getDate());

// Remove the pageloader once window has rendered.
$(window).load(function() {
    $('.loader').fadeOut();
    $('.page-loader').delay(350).fadeOut('slow');
    particlesJS.load('particles-js', 'js/lib/particles.json', function() {});
});