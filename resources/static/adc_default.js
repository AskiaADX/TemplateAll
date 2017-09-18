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

      if (this.type === "multiple") {
          //addEvent(document.getElementById("adc_" + this.instanceId), "click", clickTable);
          addEvent(document.getElementById("adc_" + this.instanceId), "click", 
                   (function(passedInElement) {
              return function(e) {clickTable(e, passedInElement); };
          }(this)));
      }
   }

   /**
   * Attach the AdcDefault to the window object
   */
   window.AdcDefault = AdcDefault;

}());
