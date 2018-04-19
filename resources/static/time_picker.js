(function() {
    var msEdgeMatch = /Edge\/([0-9]+)/i.exec(navigator.userAgent);
    if(msEdgeMatch) document.documentMode = parseInt(msEdgeMatch[1]);
})();
(function () {

    function TimePicker(options) {
        var minHour = (options.minHour < 0) ? 00 : options.minHour;
        var maxHour = (options.maxHour < 0) ? 24 : options.maxHour;
        this.selected_hour = parseInt(options.selected_hour,10) || 0;
        this.selected_min = parseInt(options.selected_min,10) || 0;
        this.selected_sec = parseInt(options.selected_sec,10) || 0;
        this.question = options.question;
        var adcId = options.adcId

        if (!minHour) {
            minHour = 00;
        }
        if (!maxHour) {
            maxHour = 24;
        }
		
        var mil = !options.imperial; // use am/pm
        var timeSep = ":";
        var showSeconds = options.showSeconds;

        var minsInterval = options.stepMinutes;
        var minStep = 0;

        var secsInterval = options.stepSeconds;
        var secStep = 0;

        var seps = document.getElementsByClassName('timeSeparator_' + adcId);
        for (var x in seps) {
            document.getElementsByClassName('timeSeparator_' + adcId)[x].innerHTML = timeSep;
        }

        if (!showSeconds) {
            document.querySelector("#secsContainer_" + adcId).innerHTML="";
        } else {
            var sec = document.querySelector("#seconds_" + adcId);
            sec.options[0] = new Option("ss");
        }
        var hour = document.querySelector("#hour_" + adcId);
        var min = document.querySelector("#minutes_" + adcId);

        var ampm = document.querySelector("#ampm_" + adcId);

        hour.options[0] = new Option("hh");
        min.options[0] = new Option("mm");


        for (var i=0;i<24;i++) {
            // var val = i<10&&mil?"0"+i:i;
            var val = i;
            if (!mil &&  val>12) val-=12;
            val = val<10?"0"+val:val;
            var opt = new Option(val,i);
            if (i < minHour || i > maxHour) {
            	opt.setAttribute("disabled","disabled");    
            }
            hour.options[i+1]=opt;
        }
        hour.selectedIndex = 0;

        minStep = 0;
        for (var i=0;i<60;i++) {
            if (i%minsInterval== 0) {
                var val = i<10?"0"+i:i;
                min.options[minStep+1]=new Option(val,i);
                minStep++;
            }
        }
        min.selectedIndex = 0;

        if(showSeconds){
            secStep = 0;
            for (var i=0;i<60;i++) {
                if (i%secsInterval== 0) {
                    var val = i<10?"0"+i:i;
                    sec.options[secStep+1]=new Option(val,i);
                    secStep++;
                }
            }
            sec.selectedIndex = 0;
        }

        hour.onchange=function() {
            var timeResult = "";
            if (!mil) {
                ampm.innerHTML=(hour.selectedIndex)<12?"am":"pm";
            }
            var hourVal = hour.options[hour.selectedIndex].text;
            if(ampm.innerHTML == "pm") hourVal = parseInt(hourVal) + 12;
            var minsVal = min.options[min.selectedIndex].text;
            if(showSeconds) {var secsVal = sec.options[sec.selectedIndex].text}
            if (showSeconds && hourVal != "hh" && minsVal != "mm" && secsVal != "ss") {
                timeResult = hourVal+":"+minsVal+":"+secsVal;
            } else if(!showSeconds && hourVal != "hh" && minsVal != "mm"){
                timeResult = hourVal+":"+minsVal;
            }
            var inputDate = document.querySelector(".time_" + adcId);
            inputDate.value = timeResult;
            if ('createEvent' in document) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('input', false, true);
                inputDate.dispatchEvent(evt);
            } else {
                inputDate.fireEvent('oninput');
            }
        }
        min.onchange=function() {
            hour.onchange();
        }

        if(showSeconds){
            sec.onchange=function() {
                min.onchange();
            }
        }

        if(this.selected_hour >= 0) hour.selectedIndex = this.selected_hour+1;
        if((this.selected_min/minsInterval) >= 0) min.selectedIndex = (this.selected_min/minsInterval) + 1;
        if(showSeconds && (this.selected_sec/secsInterval) >= 0) sec.selectedIndex = (this.selected_sec/secsInterval) + 1;

        // hour.onchange();
    }
    
    window.TimePicker = TimePicker;

 }());