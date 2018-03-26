(function() {
    var msEdgeMatch = /Edge\/([0-9]+)/i.exec(navigator.userAgent);
    if(msEdgeMatch) document.documentMode = parseInt(msEdgeMatch[1]);
})();
(function () {
    
    function DatePicker(options){
        var adcId = options.adcId
      	var inputNameX = options.inputNameX; 
        var defaultDate = options.defaultDate; 
        var bound = options.bound;
        var position = options.position; 
        var setDefaultDate = options.setDefaultDate;
        var firstDay = options.firstDay;
        var dpTheme = options.dpTheme;
        var disableWeekends = options.disableWeekends; 
        var showWeekNumber = options.showWeekNumber; 
        var showMonthAfterYear = options.showMonthAfterYear;
        var numberOfMonths = options.numberOfMonths ;
        var mainCalendar = options.mainCalendar;
        var minDate = options.minDate;
        var maxDate = options.maxDate;
        var minBound = options.minBound;
        var maxBound = options.maxBound;
        var question = options.question;
        
        //Validate inputs
        var xdefaultDate = options.xdefaultDate;
        var xminBound = options.xminBound;
        var xmaxBound = options.xmaxBound;


        if (xdefaultDate.length == 0) {
            xdefaultDate = new Date();
        }
        if (xminBound == '0' || xminBound.length == 0 ) {
            xminBound = new Date().getFullYear();
        }
        if (xmaxBound == '0' || xmaxBound.length == 0) {
            xmaxBound = new Date().getFullYear();
        }


        //var xdateFormat = '{%= Interview.Language.DateFormat.ToUpperCase() %}';
        //if (xdateFormat.length == 0) {
        var xdateFormat = "YYYY-MM-DD";
        //}


        // Prototype the indexOf function
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (obj, fromIndex) {
                if (fromIndex == null) {
                    fromIndex = 0;
                } else if (fromIndex < 0) {
                    fromIndex = Math.max(0, this.length + fromIndex);
                }
                for (var i = fromIndex, j = this.length; i < j; i++) {
                    if (this[i] === obj)
                        return i;
                }
                return -1;
            };
        }


        var lang = options.lang;

        var xi18n = {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
            weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        };

        var frLangs = [1036,2060,11276,3084,9228,12300,15372,5132,13324,6156,14348,58380,8204,10252,4108,7180];
        var deLangs = [1031,3079,5127,4103,2055];
        var itLangs = [1040,2064];
        var esLangs = [3082,1034,11274,16394,13322,9226,5130,7178,12298,17418,4106,18442,22538,2058,19466,6154,15370,10250,20490,21514,14346,8202];
        var duLangs = [1043,2067];
        if (frLangs.indexOf(lang) > -1) {
            xi18n = {
                previousMonth	: 'Mois précédent',
                nextMonth		: 'Mois prochain',
                months 			: ['Janvier','Février', 'Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
                weekdays		: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
                weekdaysShort	: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
            };
        } else if (deLangs.indexOf(lang) > -1) {
            xi18n = {
                previousMonth : 'Vormonat',
                nextMonth     : 'Nächster Monat',
                months        : ['Januar','Februar', 'März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
                weekdays      : ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
                weekdaysShort : ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.']
            };
        } else if (itLangs.indexOf(lang) > -1) {
            xi18n = {
                previousMonth : 'il mese scorso',
                nextMonth     : 'il prossimo mese',
                months        : ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'],
                weekdays      : ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'],
                weekdaysShort : ['do.','lun.','mar.','mer.','gio.','ven.','sab.']
            };
        } else if (esLangs.indexOf(lang) > -1) {
            xi18n = {
                previousMonth : 'mes anterior',
                nextMonth     : 'próximo mes',
                months        : ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
                weekdays      : ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
                weekdaysShort : ['D','L','M','X','J','V','S']
            };
        }

        //Kill the jQueryUI datepicker on load
        window.onload = function() {
            if (window.jQuery && document.querySelectorAll(".hasDatepicker")) {
                jQuery.fn.datepicker = function () {};
                var tbremoved = document.getElementById("ui-datepicker-div");
                var bodies = document.getElementsByTagName("body");
                if (bodies && bodies.length > 0 && tbremoved) {
                    var body = bodies[0];
                    body.removeChild(tbremoved);
                }
            }
        }
        var picker = new Pikaday(
            {
                field: document.getElementById(inputNameX),
                firstDay: firstDay,
                defaultDate: new Date(xdefaultDate),
                bound: bound,
                position: position,
                setDefaultDate: setDefaultDate,
                yearRange: [xminBound,xmaxBound],
                theme: dpTheme,
                disableWeekends: disableWeekends,
                showWeekNumber: showWeekNumber,
                showMonthAfterYear: showMonthAfterYear,
                numberOfMonths: numberOfMonths,
                mainCalendar: mainCalendar,
                format: xdateFormat,
                minDate: new Date(minDate),
                maxDate: new Date(maxDate),
                i18n: xi18n,
                onOpen: function(event) {
                    var adcIndex = adcId;
                    var elms = document.getElementsByClassName('pika-title');
                    for (var i = 0; i<elms.length; i++) {
                    var el = document.getElementsByClassName('pika-title')[i]
                    	el.parentNode.setAttribute('id', 'picker'+adcIndex);
                	}
            	},
            	onSelect: function(event) {
            	if (window.askia 
                	&& window.arrLiveRoutingShortcut 
               		&& window.arrLiveRoutingShortcut.length > 0
                	&& window.arrLiveRoutingShortcut.indexOf(question) >= 0) {
						askia.triggerAnswer();
                	}
				},
            	onDraw: function(event) {
                	var adcIndex = adcId;
                	var elms = document.getElementsByClassName('pika-title');
                	for (var i = 0; i<elms.length; i++) {
                    	var el = document.getElementsByClassName('pika-title')[i]
                    	el.parentNode.setAttribute('id', 'picker'+adcIndex);
                	}
                	//var el = document.getElementsByClassName('pika-title')[0];
            	},
                /*onClose: function(event) {
   					var adcIndex = {%= CurrentADC.InstanceId.ToInt() %};
        			var el = document.getElementsByClassName('pika-lendar')[adcIndex-1];
    				el.setAttribute('id', 'picker'+adcIndex);
				}*/
        });
    }
    window.DatePicker = DatePicker;

 }());