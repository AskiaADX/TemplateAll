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
   * Manage the click on the INPUT
   *
   * @param {Object} event Event of the click on the INPUT
   */
   function clickTable(event, that) {
      var el = event.target || event.srcElement;
      if (el.nodeName === "INPUT" && el.type === "checkbox") {
        manageExclusive(el);
          if (window.askia 
              && window.arrLiveRoutingShortcut 
              && window.arrLiveRoutingShortcut.length > 0
              && window.arrLiveRoutingShortcut.indexOf(that.currentQuestion) >= 0 
              && el.className.indexOf("exclusive") >= 0) {
              askia.triggerAnswer();
          }
      }
   }
    
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

      if (this.type === "multiple") {
          //addEvent(document.getElementById("adc_" + this.instanceId), "click", clickTable);
          addEvent(document.getElementById("adc_" + this.instanceId), "click", 
                   (function(passedInElement) {
              return function(e) {clickTable(e, passedInElement); };
          }(this)));
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
