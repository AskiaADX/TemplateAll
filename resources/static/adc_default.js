(function () {
    var hideOrDisable = true;

    // This will globally handle any TypeError is occured.
    window.onerror = function (msg, url, lineNo, columnNo, error) {
      if(error.name == 'TypeError') return true;
    };

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    var restArgs = function(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0),
                rest = Array(length),
                index = 0;
            for (; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
                case 2: return func.call(this, arguments[0], arguments[1], rest);
                              }
            var args = Array(startIndex + 1);
            for (index = 0; index < startIndex; index++) {
                args[index] = arguments[index];
            }
            args[startIndex] = rest;
            return func.apply(this, args);
        };
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    _.delay = restArgs(function(func, wait, args) {
        return setTimeout(function() {
            return func.apply(null, args);
        }, wait);
    });

    /**
 * Return a function which, until she continue to be invoked,
 * will not be executed. The function will be executed only when
 * the function will stop to be called for more than N milliseconds.
 * If the parameter `immediate` equal true, then the function
 * will be executed to the first call instaed of the last.
 * Parameters :
 *  - func : the function to `debounce`
 *  - wait : the number of milliseconds (N) to wait before
 *           call the function func()
 *  - immediate : execute immediately func() (by default false)
 *
 */
    function debounce(func, wait, immediate) {
        var timeout, result;

        var later = function(context, args) {
            timeout = null;
            if (args) result = func.apply(context, args);
        };

        var debounced = restArgs(function(args) {
            if (timeout) clearTimeout(timeout);
            if (immediate) {
                var callNow = !timeout;
                timeout = setTimeout(later, wait);
                if (callNow) result = func.apply(this, args);
            } else {
                timeout = _.delay(later, wait, this, args);
            }

            return result;
        });

        debounced.cancel = function() {
            clearTimeout(timeout);
            timeout = null;
        };

        return debounced;

    }

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
   * Add class in DOMElement
   *
   * @param {HTMLElement} obj HTMLElement where the class should be added
   * @param {String} clsName Name of the class to add
   */
    function addClass (obj, clsName) {
        if (obj.classList)      {
            obj.classList.add(clsName);
        }    else            {
            obj.className += ' ' + clsName;
        }
    }

    /**
   * Remove class in DOMElement
   *
   * @param {HTMLElement} obj HTMLElement where the class should be removed
   * @param {String} clsName Name of the class to remove
   */
    function removeClass (obj, clsName) {
        if (obj.classList)      {
            obj.classList.remove(clsName);
        }    else            {
            obj.className = obj.className.replace(new RegExp('(^|\\b)' + clsName.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
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
          if(ul.children[i].children[0] != null && ul.children[i].className.indexOf("responseHeader") < 0){
            var element =  document.getElementById(ul.children[i].children[0].attributes.id.value);
            if (obj !== ul.children[i].children[0] &&
                obj.className.indexOf("exclusive") >= 0 &&
                obj.checked) {
                element.checked = false;
                if (element.parentNode.children[2].children[0]) {
                    element.parentNode.children[2].children[0].children[1].style.display = 'none';
                }
            } else if (obj !== ul.children[i].children[0] &&
                       ul.children[i].children[0].className.indexOf("exclusive") >= 0 &&
                       obj.checked && ul.children[i].children[0].checked) {
                element.checked = false;
                if (element.parentNode.children[2].children[0]) {
                    element.parentNode.children[2].children[0].children[1].style.display = 'none';
                }
            }
          }
        }
    }

    /**
   * check whether the browser is too much old
   */
    function isObseleteBrowser(){
        var ua = window.navigator.appVersion;
        var obs = ua.indexOf("Windows NT 6.2");
        return obs;
    }

    /**
   * Keyup event will trigger the response.click() when space key is pressed
   */
    window.addEventListener("keyup", function(event){
        var el = event.target || event.srcElement;
        if (el.className.indexOf("askia-response") >= 0 && event.keyCode == 32) {
          var resLabel = el.querySelector('.askia-response-label');
          var inputElem = document.getElementById(resLabel.dataset.for);
          inputElem.click();
          if (isObseleteBrowser() > 0) el.blur();
        }
    });

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
              askia.defaultEventActions.askiaShowResponses = executeShowHideResponses;
              askia.triggerAnswer();
        }
    }

    /**
     * Show or hide responses
     *
     * @param {Object} data Definition of the action to do
     * @param {"showResponses"|"hideResponses"} data.action Action to execute
     * @param {Number} data.inputCode Input code associated with the question
     */
    function executeShowHideResponses (data) {
      if (!(data.question.inputCode >= 0)) {
        return;
      }
      var questionClassName = '.askia-question-' + data.question.inputCode;
      var orderLength = data.order.length;
      var showResponseInputCodes = [];
      var responses = [];
      var responseElems = document.querySelectorAll(questionClassName + ' li');

      for (var h = 0; h < responseElems.length; h++) {
        if (responseElems[h].classList.contains("askia-response") || responseElems[h].classList.contains("responseHeader"))
          responses.push(responseElems[h]);
      }

      for (var i = 0; i < responses.length; i++) {
        responses[i].style.display = "";
        responses[i].classList.remove("disabled");
        responses[i].children[0].disabled = false;
      }

      for (var k = 0; k < orderLength; k++) {
        showResponseInputCodes.push(parseInt(data.order[k].inputCode));
      }

      for (var j = 0; j < responses.length; j++) {
        var str = (responses[j].children[0].id).split('_');
        if (showResponseInputCodes.indexOf(parseInt(str[1])) < 0){
            if(document.getElementById('askia-input'+data.question.inputCode+'_'+parseInt(str[1])) != null){
              if (hideOrDisable) {
                document.getElementById('askia-input'+data.question.inputCode+'_'+parseInt(str[1])).disabled = true;
                document.getElementById('askia-input'+data.question.inputCode+'_'+parseInt(str[1])).checked = false;
                document.getElementById('askia-input'+data.question.inputCode+'_'+parseInt(str[1])).parentElement.classList.add("disabled");
              } else {
                document.getElementById('askia-input'+data.question.inputCode+'_'+parseInt(str[1])).checked = false;
                document.getElementById('askia-input'+data.question.inputCode+'_'+parseInt(str[1])).parentElement.style.display = "none";
              }
            }
        }
      }
    }

    /**
   * Check if the date question has an answer
   *
   * @param {Object} div Main div
   */
    function checkAnswersDate (div) {
        var inputDate = div.querySelector('.RLDatePicker input[type=text]');
        var selectHour = div.querySelector('.RLTimePicker select[id^=hour]');
        var selectMinute = div.querySelector('.RLTimePicker select[id^=minutes]');
        var selectSecond = div.querySelector('.RLTimePicker select[id^=seconds]');
        var inputDk = div.querySelector('.DK input[type=checkbox]');
        var result = true;
        if (inputDk) {
        	if (inputDate && selectHour) {
                if (selectSecond && inputDk.checked === false && (inputDate.value === '' || selectHour.value.toLowerCase() === 'hh' || selectMinute.value.toLowerCase() === 'mm' || selectSecond.value.toLowerCase() === 'ss')) result = false;
                if (!selectSecond && inputDk.checked === false && (inputDate.value === '' || selectHour.value.toLowerCase() === 'hh' || selectMinute.value.toLowerCase() === 'mm')) result = false;
            } else if (inputDate && !selectHour) {
                if (inputDk.checked === false && inputDate.value === '') result = false;
            } else if (!inputDate && selectHour) {
                if (selectSecond && inputDk.checked === false && (selectHour.value.toLowerCase() === 'hh' || selectMinute.value.toLowerCase() === 'mm' || selectSecond.value.toLowerCase() === 'ss')) result = false;
                if (!selectSecond && inputDk.checked === false && (selectHour.value.toLowerCase() === 'hh' || selectMinute.value.toLowerCase() === 'mm')) result = false;
            }
        } else {
            if (inputDate && selectHour) {
                if (selectSecond && (inputDate.value === '' || selectHour.value.toLowerCase() === 'hh' || selectMinute.value.toLowerCase() === 'mm' || selectSecond.value.toLowerCase() === 'ss')) result = false;
                if (!selectSecond && (inputDate.value === '' || selectHour.value.toLowerCase() === 'hh' || selectMinute.value.toLowerCase() === 'mm')) result = false;
            } else if (inputDate && !selectHour) {
                if (inputDate.value === '') result = false;
            } else if (!inputDate && selectHour) {
                if (selectSecond && (selectHour.value.toLowerCase() === 'hh' || selectMinute.value.toLowerCase() === 'mm' || selectSecond.value.toLowerCase() === 'ss')) result = false;
                if (!selectSecond && (selectHour.value.toLowerCase() === 'hh' || selectMinute.value.toLowerCase() === 'mm')) result = false;
            }
        }
        return result;
    }

    /**
   * show otherText when radio button is checked
   */
    var radioIns = document.querySelectorAll('input[type=radio]');
    for (var i = 0; i < radioIns.length; i++) {
      if(radioIns[i].parentElement.querySelector('.otherText') != null){
        if (radioIns[i].checked === true ) {
            radioIns[i].parentElement.querySelector('.otherText').style.display = 'block';
        } else {
            radioIns[i].parentElement.querySelector('.otherText').value = '';
        }
      }
    }

     /**
    * Manually check the input(radio/checkbox) on response-label click.
    */
    var respLabels = document.querySelectorAll('.askia-response .askia-response-label');
    for (var i = 0; i < respLabels.length; i++) {
      respLabels[i].onclick = function(){
        document.getElementById(this.dataset.for).click();
      };
    }

    /**
   * show otherText when checkboxes are checked
   */
    var checkboxIns = document.querySelectorAll('input[type=checkbox]');
    for (var i = 0; i < checkboxIns.length; i++) {
      if(checkboxIns[i].parentElement.querySelector('.otherText') != null){
        if (checkboxIns[i].checked === true ) {
            checkboxIns[i].parentElement.querySelector('.otherText').style.display = 'block';
        } else {
            checkboxIns[i].parentElement.querySelector('.otherText').value = '';
        }
      }
    }

    /**
   * Check if the select question has an answer
   *
   * @param {Object} div Main div
   */
    function checkAnswersSelect (div) {
        var inputSelect = div.querySelector('select');
        var result = true;
      	if (inputSelect.value === '0') result = false;
        return result;
    }

    /**
   * Check if the closed question has an answer
   *
   * @param {Object} div Main div
   */
    function checkAnswersClosed (div) {
        var inputsClosed = div.querySelectorAll('input[type=radio]');
        var result = false;
        for (var i = 0; i < inputsClosed.length; i++) {
            if (inputsClosed[i].checked === true) {
                selectSingleResponseWithOther(inputsClosed[i], 1);
                result = true;
                break;
            }
        }
        return result;
    }

    /**
   * Manage the change event on input radio
   *
   * @param {Input[type=radio]} radioEl radio element
   */
    function selectSingleResponseWithOther(radioEl, emptyVal){
      var ulElem = radioEl.parentElement.parentElement;
      var otherElems = ulElem.querySelectorAll('.otherText');
      for (var i = 0; i < otherElems.length; i++) {
        otherElems[i].style.display = 'none';
        if(emptyVal) otherElems[i].value = '';
      }
      if (radioEl.parentElement.querySelector('.otherText') != null) {
        radioEl.parentElement.querySelector('.otherText').style.display = 'block';
        radioEl.parentElement.querySelector('.otherText').focus();
      }
    }

    /**
   * Manage the change event on input checkbox
   *
   * @param {Input[type=checkbox]} checkboxEl checkbox element
   */
    function selectMultipleResponseWithOther(checkboxEl){
      if (checkboxEl.parentElement.querySelector('.otherText') != null) {
        if (checkboxEl.checked === true) {
            checkboxEl.parentElement.querySelector('.otherText').style.display = 'block';
            checkboxEl.parentElement.querySelector('.otherText').focus();
        } else {
            checkboxEl.parentElement.querySelector('.otherText').style.display = 'none';
        }
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
                selectMultipleResponseWithOther(el);
            }
            triggerRouting(that.currentQuestion);
            if (el.type === "radio") {
                var nextBtn = document.getElementsByName('Next')[0];
                var mainDiv = document.getElementById("adc_" + that.instanceId);
                if (checkAnswersClosed(mainDiv) && that.autoSubmit) {
                    nextBtn.click();
                }
            }
        }
    }

    /**
   * Manage the input event on input semi open
   *
   * @param {Object} event Input event of the input semi open
   * @param {Object} that AdcDefault object, same as options
   */
  function onInputSemiOpen (event, that) {
    var el = event.target || event.srcElement;
    if (el.nodeName === "INPUT" && (el.type === 'text') && el.className === 'otherText') {
        el.previousElementSibling.value = myTrim(el.value);
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
   * Manage the change event on input DK for numeric
   *
   * @param {Object} event Change event of the input DK for numeric
   * @param {Object} that AdcDefault object, same as options
   */
    function onNumericInputDK (event, that) {
        var el = event.target || event.srcElement;
        var inputValue = el.id.split('_')[1];
        var inputNumber = document.getElementById('askia-input-number' + inputValue);
        var inputRange = document.getElementById('askia-input-range_' + inputValue);
        var inputCurrency = document.getElementById('askia-input-currency' + inputValue);
        if (el.nodeName === 'INPUT' && (el.type === 'checkbox')) {
            if (el.checked) {
                inputNumber.value = '';
                inputNumber.setAttribute('readonly', 'readonly');
                // If use slider
                if (that.numUseInput === 1) {
                    var suffix = that.suffixes[parseInt(inputRange.className.split('_')[2], 10) - 1];
                    inputRange.value = '';
                    inputRange.setAttribute('disabled', 'disabled');
                    removeClass(inputRange,'selected');
                    inputRange.parentElement.nextElementSibling.innerHTML = suffix;
                }
                // If use currency
                if (that.numUseInput === 2) {
                    inputCurrency.value = '';
                    inputCurrency.setAttribute('readonly', 'readonly');
                }
            } else if (!el.checked) {
                inputNumber.removeAttribute('readonly');
                inputNumber.style.backgroundColor = "transparent";
                // If use slider
                if (that.numUseInput === 1) {
                    inputRange.removeAttribute('disabled');
                }
                // If use currency
                if (that.numUseInput === 2) {
                    inputCurrency.removeAttribute('readonly');
                    inputCurrency.backgroundColor = "transparent";
                }
            }
            if ('createEvent' in document) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('input', false, true);
                inputNumber.dispatchEvent(evt);
            } else {
                inputNumber.fireEvent('oninput');
            }
        }
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
                inputOpen.style.backgroundColor = "transparent";
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
   * Manage the change event on input DK for date
   *
   * @param {Object} event Change event of the input DK for date
   * @param {Object} that AdcDefault object, same as options
   */
    function onDateInputDK (event, that) {
        var el = event.target || event.srcElement;
        var inputValue = el.id.split('_')[1];
        var inputDate = document.getElementById('askia-input-date' + inputValue);
        var inputTime = document.getElementById('askia-input-time' + inputValue);
        var selectHour = document.getElementById('hour_' + inputValue);
        var selectMinutes = document.getElementById('minutes_' + inputValue);
        var selectSeconds = document.getElementById('seconds_' + inputValue);
        if (el.nodeName === 'INPUT' && (el.type === 'checkbox')) {
            if (el.checked) {
                if (inputDate) {
                    inputDate.value = '';
                    inputDate.setAttribute('readonly', 'readonly');
                    inputDate.setAttribute('disabled', 'disabled');
                }
                if (selectHour) {
                    selectHour.selectedIndex =0;
                    selectHour.setAttribute('disabled', 'disabled');
                }
                if (selectMinutes) {
                    selectMinutes.selectedIndex =0;
                    selectMinutes.setAttribute('disabled', 'disabled');
                }
                if (selectSeconds) {
                    selectSeconds.selectedIndex =0;
                    selectSeconds.setAttribute('disabled', 'disabled');
                }
                if (inputTime) {
                    inputTime.value = '';
                    inputTime.setAttribute('readonly', 'readonly');
                }
            } else if (!el.checked) {
                if (inputDate) {
                    inputDate.setAttribute('readonly', 'true');
                    inputDate.removeAttribute('disabled');
                }
                if (selectHour) {
                    selectHour.removeAttribute('disabled');
                }
                if (selectMinutes) {
                    selectMinutes.removeAttribute('disabled');
                }
                if (selectSeconds) {
                    selectSeconds.removeAttribute('disabled');
                }
                if (inputTime) {
                    inputTime.removeAttribute('readonly');
                }
            }
            if ('createEvent' in document) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('input', false, true);
                if (inputDate) {
                    inputDate.dispatchEvent(evt);
                }
                if (inputTime) {
                    inputTime.dispatchEvent(evt);
                }
            } else {
                if (inputDate) {
                    inputDate.fireEvent('oninput');
                }
                if (inputTime) {
                    inputTime.fireEvent('oninput');
                }
            }
        }
    }

    /**
   * Manage the input event on date time
   *
   * @param {Object} event Input event of the date time
   * @param {Object} that AdcDefault object, same as options
   */
    function onInputDates (event, that) {
        triggerRouting(that.currentQuestion);
        var nextBtn = document.getElementsByName('Next')[0];
        var mainDiv = document.getElementById("adc_" + that.instanceId);
        if (checkAnswersDate(mainDiv) && that.autoSubmit) {
            nextBtn.click();
        }
    }

    /**
   * Manage the change event on select
   *
   * @param {Object} event Change event of the select
   * @param {Object} that AdcDefault object, same as options
   */
    function onSelects (event, that) {
        var nextBtn = document.getElementsByName('Next')[0];
        var mainDiv = document.getElementById("adc_" + that.instanceId);
        if (checkAnswersSelect(mainDiv) && that.autoSubmit) {
            nextBtn.click();
        }
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
        var inputNumber = document.querySelector('[name=' + x.name.toString().split("_")[1] + ']');
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
    function isNumberKey(evt, x, deciSeperator){
        var charCode = (evt.which) ? evt.which : event.keyCode;

        if ((deciSeperator === "," & charCode == 44)) {
          return true;
        }
        if (((charCode != 46) &&
              (charCode < 48 || charCode > 57)) || (( x.value.toString().indexOf(deciSeperator) >= 0) &&
               (charCode === 46  || charCode === 44  || charCode === 110  || charCode === 190 ))) {
            evt.preventDefault();
            return false;
        }
        return true;
    }

    /**
   * Manage the input event on input ranges
   *
   * @param {Object} event Input event of the input ranges
   * @param {Object} that AdcDefault object, same as options
   */
    function onInputRanges (event, that) {
        var el = event.target || event.srcElement;
        var split = el.className.split('_')
        var suffix = that.suffixes[parseInt(split[2], 10) - 1];
        var decimals = that.decimals[parseInt(split[2], 10) - 1] || 0;
        var inputNumber = document.querySelector('#adc_' + that.instanceId + ' #askia-input-number' + el.id.split('_')[1]);
        inputNumber.value = el.value;
        el.parentElement.nextElementSibling.innerHTML = parseFloat(el.value).toLocaleString(undefined, {minimumFractionDigits: decimals,maximumFractionDigits: decimals}) + suffix;
        addClass(el,'selected');
        document.querySelector('#adc_' + that.instanceId + ' #' + el.id + ' + .preBar').style.width = widthRange(el) + 'px';
        if ('createEvent' in document) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('input', false, true);
            inputNumber.dispatchEvent(evt);
        } else {
            inputNumber.fireEvent('oninput');
        }
    }

    /**
   * Return width of the left side of the input range
   *
   * @param {Object} inputRange input range
   */
    function widthRange (inputRange) {
        var min = (inputRange.min) ? parseInt(inputRange.min, 10) : 0;
        var max = (inputRange.max) ? parseInt(inputRange.max, 10) : 100;
        var range = max - min;
        var w = parseInt(inputRange.clientWidth, 10);
        var t = ~~(w * (parseInt(inputRange.value, 10) - min) / range);

        return (((t / w) * 100) < 16 && ((t / w) * 100) > 0) ? t + 4 : t;
    }

    /**
   * Return the value of the input trimed
   *
   * @param {x} value to trim
   */
    function myTrim(x) {
        return x.replace(/^\s+|\s+$/gm,'');
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
        this.autoSubmit = options.autoSubmit;
        this.numUseInput = options.numUseInput || 0;
        this.suffixes = options.suffixes || [];
        this.decimals = options.decimals || [];
        this.useList = options.useList;
        hideOrDisable = options.hideOrDisable;
        this.deciSeperator = options.deciSeperator;

        var radios = document.querySelectorAll('#adc_' + this.instanceId + ' input[type="radio"]');
        var checkboxes = document.querySelectorAll('#adc_' + this.instanceId + ' input[type="checkbox"]');
        var inputNumbers = document.querySelector('#adc_' + this.instanceId + ' .inputnumber');
        var numInputDK = document.querySelector('#adc_' + this.instanceId + ' .numericDK input[type="checkbox"]');
        var inputRanges = document.querySelector('#adc_' + this.instanceId + ' input[type="range"]');
        var inputOpens = document.querySelector('#adc_' + this.instanceId + ' .inputopen');
        var openInputDK = document.querySelector('#adc_' + this.instanceId + ' .openDK input[type="checkbox"]');
        var inputDates = document.querySelectorAll('#adc_' + this.instanceId + ' .inputdate');
        var dateInputDK = document.querySelector('#adc_' + this.instanceId + ' .DK input[type="checkbox"]');
        var inputSelect = document.querySelector('#adc_' + this.instanceId + ' select');
        var inputSemiOpens = document.querySelectorAll('#adc_' + this.instanceId + ' input.otherText');

        addEvent(document, 'askiaSetValue',
         (function (passedInElement) {
            return function (data) {
              let val = data.detail.value;
              if (Array.isArray(val)){
                for (var i = 0; i < val.length; i++) {
                  let checkEl = document.querySelector('#askia-input_' + val[i].inputCode);
                  if (checkEl)
                    checkEl.checked = true,
                      (checkEl.type == 'radio') ? selectSingleResponseWithOther(checkEl, 0) : selectMultipleResponseWithOther(checkEl);
                }
              } else {
                if (typeof val === 'string'){
                  let openEl = document.querySelector('#askia-input-open' + data.detail.question.inputCode);
                  if (openEl) openEl.value = val;
                } else {
                  let numberEl = document.querySelector('#askia-input-number' + data.detail.question.inputCode);
                  if (numberEl) numberEl.value = val;

                  let rangeEl = document.querySelector('#askia-input-range' + data.detail.question.inputCode);
                  if (rangeEl) rangeEl.value = val;
                }
              }
            };
        }(this)));


        if (this.type === "single" || this.type === "multiple" || this.type === "single-loop" || this.type === "multiple-loop") {

          var expandableHeaders = options.expandableHeaders
          var accordionInitialState = options.accordionInitialState
          if(expandableHeaders){
            var headers = document.querySelectorAll('#adc_' + this.instanceId + ' .responseHeader');
            for (var i = 0; i < headers.length; i++) {
              if (accordionInitialState == 'collapsed') {
                var index = $(headers[i]).attr("data-id");
                var headerChildren = document.querySelectorAll(".headerchild"+index);
                for (var j = 0; j < headerChildren.length; j++) {
                  $(headerChildren[j]).toggle();
                }
              }
                headers[i].onclick = function(){
                  var index = $(this).attr("data-id");
                  var headerChildren = document.querySelectorAll(".headerchild"+index);
                  for (var j = 0; j < headerChildren.length; j++) {
                    $(headerChildren[j]).toggle();
                  }
                  $("span", this).toggleClass("right-point down-point");
                }
            }
          }

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

            // Change event on input semi open
            for (var j1 = 0; j1 < inputSemiOpens.length; j1++) {
                addEvent(inputSemiOpens[j1], 'input',
                         (function (passedInElement) {
                    return function (e) {
                        onInputSemiOpen(e, passedInElement);
                    };
                }(this)));
            }

        }

        if ((this.type === "single" && this.useList) || (this.type === "single-loop" && this.useList)) {
            addEvent(inputSelect, "change",
                     (function(passedInElement) {
                return function(e) {onSelects(e, passedInElement); };
            }(this)));
        }

        if (this.type === "numeric" || this.type === "numeric-loop") {
            if (numInputDK) {
                addEvent(numInputDK, "change",
                         (function(passedInElement) {
                    return function(e) {onNumericInputDK(e, passedInElement); };
                }(this)));
            }
            addEvent(inputNumbers, 'input',
                     (function (passedInElement) {
                return function (e) {
                    onInputNumbers(e, passedInElement);
                };
            }(this)));
        }

        if (this.type === "open") {
            if (openInputDK) {
                addEvent(openInputDK, "change",
                         (function(passedInElement) {
                    return function(e) {onOpenInputDK(e, passedInElement); };
                }(this)));
            }
            addEvent(inputOpens, 'input',
                     (function (passedInElement) {
                return function (e) {
                    onInputOpens(e, passedInElement);
                };
            }(this)));
        }

        if (this.type === "datetime") {
            if (dateInputDK) {
                addEvent(dateInputDK, 'change',
                         (function (passedInElement) {
                    return function (e) {
                        onDateInputDK(e, passedInElement);
                    };
                }(this)));
            }
            // Input event on date time
            for (var k = 0; k < inputDates.length; k++) {
                addEvent(inputDates[k], 'input',
                         (function (passedInElement) {
                    return function (e) {
                        onInputDates(e, passedInElement);
                    };
                }(this)));
            }
        }

        if ((this.type === "numeric" && this.numUseInput === 2) || (this.type === "numeric-loop" && this.numUseInput === 2)) {
            document.addEventListener("keypress", function(event){
                var el = event.target || event.srcElement;
                if (el.nodeName === "INPUT" && el.className.indexOf("thousand") >= 0) {
                    isNumberKey(event, el, options.deciSeperator);
                }
            });
            document.addEventListener("input", function(event){
                var el = event.target || event.srcElement;
                if (el.nodeName === "INPUT" && el.className.indexOf("thousand") >= 0) {
                    numberWithThousandSeparator(el);
                }
            },false);
        }

        if ((this.type === "numeric" && this.numUseInput === 1) || (this.type === "numeric-loop" && this.numUseInput === 1)) {
            addEvent(inputRanges, 'change',
                     (function (passedInElement) {
                return function (e) {
                    onInputRanges(e, passedInElement);
                };
            }(this)));
            addEvent(inputRanges, 'input',
                     (function (passedInElement) {
                return function (e) {
                    onInputRanges(e, passedInElement);
                };
            }(this)));
            document.querySelector('#adc_' + this.instanceId + ' #' + inputRanges.id + ' + .preBar').style.width = widthRange(inputRanges) + 'px';

            // Resize event on input range
            window.addEventListener("resize", function() {
            	document.querySelector('#adc_' + options.instanceId + ' #' + inputRanges.id + ' + .preBar').style.width = widthRange(inputRanges) + 'px';
            });
        }

    }

    /**
   * Attach the AdcDefault to the window object
   */
    window.AdcDefault = AdcDefault;

}());
