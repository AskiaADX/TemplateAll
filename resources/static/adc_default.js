(function () {

    /**
   * Add event listener in DOMElement
   *
   * @param {HTMLElement} obj HTMLElement which should be listen
   * @param {String} type Type of the event to listen
   * @param {Function} fn Callback function
   */
    function addEvent(obj, type, fn) {
        if (typeof obj.addEventListener === 'function') {
            obj.addEventListener(type, fn, false);
        } else if (obj.attachEvent) {
            obj['e' + type + fn] = fn;
            obj[type + fn] = function () {
                obj['e' + type + fn].call(obj, window.event);
            }
            obj.attachEvent('on' + type, obj[type + fn]);
        }
    }

    /**
   * Manage the exclusive responses for multiple
   *
   * @param {HTMLElement} obj HTMLElement (input) clicked
   */
    function manageExclusive(obj) {
        var ul = obj.parentNode.parentNode;

        for (var i = 0; j = ul.children.length, i < j; i++) { 
            var element =  document.getElementById(ul.children[i].children[0].attributes.id.value);
            if (obj !== ul.children[i].children[0] && 
                obj.className.indexOf("exclusive") >= 0 &&
                obj.checked) {
                element.checked = false;
            } else if (obj !== ul.children[i].children[0] &&
                       ul.children[i].children[0].className.indexOf("exclusive") >= 0 &&
                       obj.checked && ul.children[i].children[0].checked) {
                element.checked = false;
            }
        }
    }
    
    /**
   * Trigger the ajax request for live routings
   *
   * @param {String} shortcut Shortcut of the question
   */
    function triggerRouting(shortcut) {
        if (window.askia 
            && window.arrLiveRoutingShortcut 
            && window.arrLiveRoutingShortcut.length > 0
            && window.arrLiveRoutingShortcut.indexOf(shortcut) >= 0) {
            askia.triggerAnswer();
        }
    }

    /**
   * Manage the change event on input radio and checkbox
   *
   * @param {Object} event Change event of the input radio and checkbox
   * @param {Object} that AdcDefault object, same as options
   */
    function onChange (event, that) {
        var el = event.target || event.srcElement;
        if (el.nodeName === "INPUT" && (el.type === 'radio' || el.type === 'checkbox') && el.className !== 'dkbutton') {
            if (el.type === "checkbox") {
                manageExclusive(el);
            }
            triggerRouting(that.currentQuestion);
        }
    }
    
    /**
   * Manage the input event on numeric variables
   *
   * @param {Object} event Input event of the numerical variable
   * @param {Object} that AdcDefault object, same as options
   */
    function onInputNumbers (event, that) {
        triggerRouting(that.currentQuestion);
    }
    
    /**
   * Manage the input event on open ended (input text, email, url and textarea)
   *
   * @param {Object} event Input event of the open ended
   * @param {Object} that AdcDefault object, same as options
   */
    function onInputOpens (event, that) {
        triggerRouting(that.currentQuestion);
    }
    
    /**
   * Manage the change event on input DK for open
   *
   * @param {Object} event Change event of the input DK for open
   * @param {Object} that AdcDefault object, same as options
   */
    function onOpenInputDK (event, that) {
        var el = event.target || event.srcElement;
        var inputValue = el.id.split('_')[1];
        var inputOpen = document.getElementById('askia-input-open' + inputValue);
        if (el.nodeName === 'INPUT' && (el.type === 'checkbox')) {
            if (el.checked) {
                inputOpen.value = '';
                inputOpen.setAttribute('readonly', 'readonly');
            } else if (!el.checked) {
                inputOpen.removeAttribute('readonly');
            }
            if ('createEvent' in document) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('input', false, true);
                inputOpen.dispatchEvent(evt);
            } else {
                inputOpen.fireEvent('oninput');
            }
        }
    }
    
    /**
   * Manage the input event on date time
   *
   * @param {Object} event Input event of the date time
   * @param {Object} that SideBySide object, same as options
   */
    function onInputDates (event, that) {
        triggerRouting(that.currentQuestion);
    }

    /**
   * Get the position of the caret
   *
   * @param {Object} ctrl Input element
   */
    function getCaretPosition (ctrl) {
        // IE < 9 Support
        if (document.selection) {
            ctrl.focus();
            var range = document.selection.createRange();
            var rangelen = range.text.length;
            range.moveStart ('character', -ctrl.value.length);
            var start = range.text.length - rangelen;
            return {'start': start, 'end': start + rangelen };
        }
        // IE >=9 and other browsers
        else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
            return {'start': ctrl.selectionStart, 'end': ctrl.selectionEnd };
        } else {
            return {'start': 0, 'end': 0};
        }
    }

    /**
   * Set the new the position of the caret
   *
   * @param {Object} ctrl Input element
   * @param {Number} start Start position of the caret
   * @param {Number} end End position of the caret
   */
    function setCaretPosition(ctrl, start, end) {
        // IE >= 9 and other browsers
        if(ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(start, end);
        } else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    }

    /**
   * Add space as thousand separator for numerical variable when using currency
   *
   * @param {Object} x Input element
   */
    function numberWithThousandSeparator(x) {
        var currentPosition = getCaretPosition(x);
        var currentValue = x.value.toString();
        var parts = [];
        var inputNumber = document.getElementById(x.name.toString().split("_")[1]);
        parts[0] = x.value.toString();
        parts[1] = "";
        var sep = "";
        if ( x.value.toString().indexOf(".") >= 0 ) {
            parts = x.value.toString().split(".");
            sep = ".";
        }
        parts[1] = parts[1].trim();
        x.value = parts[0].replace(/ /g,"").replace(/\B(?=(\d{3})+(?!\d))/g, " ") + sep + parts[1];
        inputNumber.value = x.value.replace(/ /g,"");
        if (currentValue.length < x.value.length) {
            setTimeout(function(){ setCaretPosition(x, currentPosition.start + 1, currentPosition.end + 1); }, 1);
        } else if (currentValue.length > x.value.length) {
            setTimeout(function(){ setCaretPosition(x, currentPosition.start - 1, currentPosition.end - 1); }, 1);
        } else {
            setCaretPosition(x, currentPosition.start, currentPosition.end);
        }
        if ('createEvent' in document) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('input', true, true);
            inputNumber.dispatchEvent(evt);
        } else {
            inputNumber.fireEvent('oninput');
        }
    }

    /**
   * Check if the key pressed is a number
   *
   * @param {Object} event Press event of the input
   * @param {Object} x Input element
   */
    function isNumberKey(evt, x){
        var charCode = (evt.which) ? evt.which : event.keyCode;
        if (((charCode != 46) && (charCode < 48 || charCode > 57)) || ((x.value.toString().indexOf(".") >= 0) && (charCode === 46  || charCode === 110  || charCode === 190 ))) {
            evt.preventDefault();
            return false;
        }
        return true;
    }

    /**
   * Creates a new instance of the AdcDefault
   *
   * @param {Object} options Options of the AdcDefault
   * @param {String} options.instanceId=1 Id of the ADC instance
   */
    function AdcDefault(options) {
        this.options = options;
        this.instanceId = options.instanceId || 1;
        this.currentQuestion = options.currentQuestion || "";
        this.type = options.type || "";
        this.numUseInput = options.numUseInput || 1;
        
        var radios = document.querySelectorAll('#adc_' + this.instanceId + ' input[type="radio"]');
        var checkboxes = document.querySelectorAll('#adc_' + this.instanceId + ' input[type="checkbox"]');
        var inputNumbers = document.querySelector('#adc_' + this.instanceId + ' .inputnumber');
        var inputOpens = document.querySelector('#adc_' + this.instanceId + ' .inputopen');
        var openInputDK = document.querySelector('#adc_' + this.instanceId + ' .openDK input[type="checkbox"]');
        var inputDates = document.querySelectorAll('#adc_' + this.instanceId + ' .inputdate');

        if (this.type === "single" || this.type === "multiple") {
            // Change event on input radio
            for (var i = 0; i < radios.length; i++) {
                addEvent(radios[i], 'change', 
                         (function (passedInElement) {
                    return function (e) {
                        onChange(e, passedInElement); 
                    };
                }(this)));
            }

            // Change event on input checkbox
            for (var j = 0; j < checkboxes.length; j++) {
                addEvent(checkboxes[j], 'change', 
                         (function (passedInElement) {
                    return function (e) {
                        onChange(e, passedInElement); 
                    };
                }(this)));
            }
        }
        
        if (this.type === "numeric") {
            addEvent(inputNumbers, 'input', 
                     (function (passedInElement) {
                return function (e) {
                    onInputNumbers(e, passedInElement); 
                };
            }(this)));
            if ('createEvent' in document) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('input', false, true);
                inputNumbers.dispatchEvent(evt);
            } else {
                inputNumbers.fireEvent('oninput');
            }
        }
        
        if (this.type === "open") {
            addEvent(openInputDK, "change", 
                     (function(passedInElement) {
                return function(e) {onOpenInputDK(e, passedInElement); };
            }(this)));
            addEvent(inputOpens, 'input', 
                     (function (passedInElement) {
                return function (e) {
                    onInputOpens(e, passedInElement); 
                };
            }(this)));
            if ('createEvent' in document) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('input', false, true);
                inputOpens.dispatchEvent(evt);
            } else {
                inputOpens.fireEvent('oninput');
            }
        }
        
        if (this.type === "datetime") {
            // Input event on date time
            for (var k = 0; k < inputDates.length; k++) {
                addEvent(inputDates[k], 'input', 
                         (function (passedInElement) {
                    return function (e) {
                        onInputDates(e, passedInElement); 
                    };
                }(this)));
                if ('createEvent' in document) {
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('input', false, true);
                    inputDates[k].dispatchEvent(evt);
                } else {
                    inputDates[k].fireEvent('oninput');
                }
            }
        }

        if (this.type === "numeric" && this.numUseInput === 2) {
            document.addEventListener("keypress", function(event){
                var el = event.target || event.srcElement;
                if (el.nodeName === "INPUT" && el.className.indexOf("thousand") >= 0) {
                    isNumberKey(event, el);
                }
            });
            document.addEventListener("input", function(event){
                var el = event.target || event.srcElement;
                if (el.nodeName === "INPUT" && el.className.indexOf("thousand") >= 0) {
                    numberWithThousandSeparator(el);
                }
            },false);
        }
    }

    /**
   * Attach the AdcDefault to the window object
   */
    window.AdcDefault = AdcDefault;

}());
