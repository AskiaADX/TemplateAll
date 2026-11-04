(function (window, document) {
    "use strict";

    var state = window.AskiaSelect2Loader || {};

    // Capture Enter before page-level keyboard shortcuts see it. Let Select2's
    // own key handler choose the highlighted result, then swallow the rest of
    // that physical key press even if selecting the result closes the dropdown.
    function openSelect2ForTarget(target) {
        if (!window.jQuery || !target) {
            return null;
        }

        var selects = document.querySelectorAll(".adc-default select.askia-select2");
        for (var i = 0; i < selects.length; i++) {
            var instance = window.jQuery(selects[i]).data("select2");
            if (instance && instance.isOpen() &&
                ((instance.$container && instance.$container[0].contains(target)) ||
                 (instance.$dropdown && instance.$dropdown[0].contains(target)))) {
                return instance;
            }
        }

        return null;
    }

    function installEnterGuard() {
        if (state.enterGuardInstalled) {
            return;
        }
        state.enterGuardInstalled = true;

        var consumingEnter = false;

        function guardEnter(event) {
            if (event.key !== "Enter" && event.keyCode !== 13 && event.which !== 13) {
                return;
            }
            // Enter may confirm an IME composition rather than an answer.
            if (event.isComposing || event.keyCode === 229) {
                return;
            }

            var instance = event.type === "keydown" && !consumingEnter
                ? openSelect2ForTarget(event.target || event.srcElement) : null;
            if (!instance && !consumingEnter) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            if (instance) {
                consumingEnter = true;
                // Select2 4.1 uses this internal event for its normal keyboard
                // selection. Forward modifiers and the original event as well.
                var select2Event = window.jQuery.Event(event);
                select2Event.which = 13;
                instance.trigger("keypress", select2Event);
            }

            if (event.type === "keyup") {
                consumingEnter = false;
            }
        }

        window.addEventListener("keydown", guardEnter, true);
        window.addEventListener("keypress", guardEnter, true);
        window.addEventListener("keyup", guardEnter, true);
        window.addEventListener("blur", function () {
            consumingEnter = false;
        });
    }

    installEnterGuard();

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

    // Returning null from templateResult prevents an item from being rendered in
    // the Select2 result list. The underlying <option> remains in the form so Askia
    // still owns the response model and can make the response available again later.
    function renderResult(data) {
        if (data && data.element && data.element.getAttribute("data-askia-live-hidden") === "true") {
            return null;
        }

        return data.text;
    }

    function initialiseSelect(select) {
        select.select2({
            width: "90%",
            dropdownParent: select.closest(".adc-default"),
            templateResult: renderResult
        });
        bridgeSelect2Change(select);
    }

    state.init = function (selector) {
        // Dependencies are local static outputs, loaded before this file by config.xml.
        if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.select2) {
            warn();
            return;
        }

        window.jQuery(selector).each(function () {
            var select = window.jQuery(this);
            if (select.hasClass("select2-hidden-accessible")) {
                return;
            }

            initialiseSelect(select);
        });
    };

    // Rebuild an already-enhanced control after Askia live routing changes its
    // option visibility/disabled state. If the initial routing refresh happens
    // before Select2 is initialized, there is nothing to rebuild; state.init()
    // will read the already-filtered native options moments later.
    state.refresh = function (selectElement) {
        if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.select2 || !selectElement) {
            return;
        }

        var select = window.jQuery(selectElement);
        if (!select.hasClass("select2-hidden-accessible")) {
            return;
        }

        select.select2("destroy");
        initialiseSelect(select);
    };

    window.AskiaSelect2Loader = state;
}(window, document));
