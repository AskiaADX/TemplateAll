(function (window, document) {
    "use strict";

    var JQUERY_VERSION = "3.7.1";
    var SELECT2_VERSION = "4.1.0";
    var JQUERY_JS = "https://cdn.jsdelivr.net/npm/jquery@" + JQUERY_VERSION + "/dist/jquery.min.js";
    var SELECT2_CSS = "https://cdn.jsdelivr.net/npm/select2@" + SELECT2_VERSION + "/dist/css/select2.min.css";
    var SELECT2_JS = "https://cdn.jsdelivr.net/npm/select2@" + SELECT2_VERSION + "/dist/js/select2.min.js";
    var state = window.AskiaSelect2Loader || {};

    state.jqueryCallbacks = state.jqueryCallbacks || [];
    state.select2Callbacks = state.select2Callbacks || [];
    state.loadingJquery = state.loadingJquery || false;
    state.loadingSelect2 = state.loadingSelect2 || false;

    function ensureCss() {
        if (document.getElementById("askia-select2-css")) {
            return;
        }

        var link = document.createElement("link");
        link.id = "askia-select2-css";
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = SELECT2_CSS;
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    function flush(callbacks, success) {
        var queued = callbacks.slice(0);
        callbacks.length = 0;

        for (var i = 0; i < queued.length; i++) {
            queued[i](success);
        }
    }

    function ensureJquery(callback) {
        if (window.jQuery && window.jQuery.fn) {
            callback(true);
            return;
        }

        state.jqueryCallbacks.push(callback);
        if (state.loadingJquery) {
            return;
        }

        state.loadingJquery = true;

        var existing = document.getElementById("askia-select2-jquery");
        if (existing) {
            existing.addEventListener("load", function () {
                state.loadingJquery = false;
                flush(state.jqueryCallbacks, !!(window.jQuery && window.jQuery.fn));
            });
            existing.addEventListener("error", function () {
                state.loadingJquery = false;
                flush(state.jqueryCallbacks, false);
            });
            return;
        }

        var script = document.createElement("script");
        script.id = "askia-select2-jquery";
        script.type = "text/javascript";
        script.src = JQUERY_JS;
        script.onload = function () {
            state.loadingJquery = false;
            flush(state.jqueryCallbacks, !!(window.jQuery && window.jQuery.fn));
        };
        script.onerror = function () {
            state.loadingJquery = false;
            flush(state.jqueryCallbacks, false);
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    function ensureSelect2(callback) {
        if (window.jQuery && window.jQuery.fn && window.jQuery.fn.select2) {
            callback(true);
            return;
        }

        state.select2Callbacks.push(callback);
        if (state.loadingSelect2) {
            return;
        }

        state.loadingSelect2 = true;

        var existing = document.getElementById("askia-select2-script");
        if (existing) {
            existing.addEventListener("load", function () {
                state.loadingSelect2 = false;
                flush(state.select2Callbacks, !!(window.jQuery && window.jQuery.fn && window.jQuery.fn.select2));
            });
            existing.addEventListener("error", function () {
                state.loadingSelect2 = false;
                flush(state.select2Callbacks, false);
            });
            return;
        }

        var script = document.createElement("script");
        script.id = "askia-select2-script";
        script.type = "text/javascript";
        script.src = SELECT2_JS;
        script.onload = function () {
            state.loadingSelect2 = false;
            flush(state.select2Callbacks, !!(window.jQuery && window.jQuery.fn && window.jQuery.fn.select2));
        };
        script.onerror = function () {
            state.loadingSelect2 = false;
            flush(state.select2Callbacks, false);
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    function warn() {
        if (window.console && window.console.warn) {
            window.console.warn("TemplateAll: Select2 could not be loaded; native select controls will be used instead.");
        }
    }

    // Select2 changes the underlying <select> through jQuery and triggers a
    // jQuery change event. TemplateAll listens with addEventListener, so bridge
    // the synthetic jQuery event to one native bubbling change event. This keeps
    // Askia live routing, auto-submit and any host-level native listeners in the
    // same lifecycle as an ordinary HTML select.
    function dispatchNativeChange(selectElement) {
        var evt;

        if (typeof window.Event === "function") {
            evt = new window.Event("change", { bubbles: true });
        } else {
            evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", true, false);
        }

        selectElement.dispatchEvent(evt);
    }

    function bridgeSelect2Change(select) {
        select.off("change.askiaSelect2Bridge");
        select.on("change.askiaSelect2Bridge", function (event) {
            // Native changes are surfaced to jQuery with originalEvent set.
            // Only bridge Select2/jQuery-synthetic changes, otherwise the native
            // event we dispatch below would recursively dispatch itself.
            if (event && event.originalEvent) {
                return;
            }

            dispatchNativeChange(this);
        });
    }

    state.init = function (selector) {
        ensureCss();
        ensureJquery(function (jqueryLoaded) {
            if (!jqueryLoaded) {
                warn();
                return;
            }

            ensureSelect2(function (select2Loaded) {
                if (!select2Loaded) {
                    warn();
                    return;
                }

                window.jQuery(selector).each(function () {
                    var select = window.jQuery(this);
                    if (select.hasClass("select2-hidden-accessible")) {
                        return;
                    }

                    select.select2({
                        width: "90%",
                        dropdownParent: select.closest(".adc-default")
                    });
                    bridgeSelect2Change(select);
                });
            });
        });
    };

    window.AskiaSelect2Loader = state;
}(window, document));
