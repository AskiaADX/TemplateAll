{%
Dim column= CurrentQuestion
Dim inputName
Dim inputId
Dim i
Dim j
dim inputNameX 
dim defaultDate
dim bound 
dim position
dim setDefaultDate 
dim firstDay 
dim dpTheme
dim disableWeekends 
dim showWeekNumber 
dim showMonthAfterYear 
dim numberOfMonths 
dim mainCalendar
dim minDate
dim maxDate
dim minBound
dim maxBound

%}
(function () {
    var adcdefault = new AdcDefault({
        instanceId: {%= CurrentADC.InstanceId %},
        currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
        type: '{%:= CurrentQuestion.Type %}',
        numUseInput: {%= CurrentADC.PropValue("numUseInput") %},
        suffixes: [{%:= On((CurrentQuestion.Type = "numeric"), "'" + CurrentADC.PropValue("numBoxSuffix") + "'", "''")%}],
    	decimals: [{%:= On((CurrentQuestion.Type = "numeric"), CurrentQuestion.Decimals + "", "")%}]
    });
{% If (column.Type = "datetime") and Not(column.IsDateOnly) Then %}
       var timePickerR1C1 = new TimePicker({
           showSeconds: {%= CurrentADC.PropValue("showSeconds") %},
           stepMinutes: {%= CurrentADC.PropValue("stepMinutes") %},
           stepSeconds: {%= CurrentADC.PropValue("stepSeconds") %},
           imperial: {%= CurrentADC.PropValue("imperial") %},
           hideInput: true,
           minHour: {%= Hour(column.MinDate) %},
           maxHour: {%= Hour(column.MaxDate) %},
           selected_hour: "{%= Hour(column.Value.ToDate() ) %}",
           selected_min: "{%= Minute(column.Value.ToDate()) %}",
           selected_sec: "{%= Second(column.Value.ToDate()) %}",
           question: "{%= column.Shortcut %}",
           adcId: {%= CurrentADC.InstanceId %}
		});
{% EndIf %}
{% If (column.Type = "datetime") and Not(column.IsTimeOnly) Then 
	'DATEPICKER OPTIONS

	inputNameX = column.InputName("date")
	defaultDate = CurrentADC.PropValue("defaultDate").ToString()
	bound = CurrentADC.PropValue("bound")
	position = "'"+CurrentADC.PropValue("position").ToString()+"'"
	setDefaultDate = CurrentADC.PropValue("setDefaultDate")
	firstDay = CurrentADC.PropValue("firstDay").ToNumber()
	dpTheme = "'"+CurrentADC.PropValue("theme").ToString()+"'"
	disableWeekends = CurrentADC.PropValue("disableWeekends")
	showWeekNumber = CurrentADC.PropValue("showWeekNumber")
	showMonthAfterYear = CurrentADC.PropValue("showMonthAfterYear")
	numberOfMonths = CurrentADC.PropValue("numberOfMonths")
	mainCalendar = "'"+CurrentADC.PropValue("mainCalendar")+"'"
	minDate = column.MinDate.Format("yyyy-MM-dd")
	maxDate = column.MaxDate.Format("yyyy-MM-dd")
	minBound = column.MinDate.Format("yyyy").ToNumber()
	maxBound = column.MaxDate.Format("yyyy").ToNumber()

	if CvDkNa(minBound) < 1 Then
		minBound = 1900
	EndIf

	if CvDkNa(maxBound) < 1 Then
		maxBound = 2100
	EndIf
	
	inputName = column.InputName()
	inputId     = (inputName + "_" + 1).Replace("D", "askia-input-dateO") %}

	var datePickerR1C1 = new DatePicker({
        adcId: {%= CurrentADC.InstanceId %},
		inputNameX: "{%= inputId %}",
		defaultDate: "{%= defaultDate %}",
		bound: {%= bound%},
		position: {%= position %},
		setDefaultDate:{%= setDefaultDate%},
		firstDay: {%= firstDay%},
		dpTheme: {%= dpTheme%},
		disableWeekends: {%= disableWeekends %},
		showWeekNumber: {%= showWeekNumber %},
		showMonthAfterYear: {%= showMonthAfterYear%},
		numberOfMonths: {%= numberOfMonths %},
		mainCalendar: {%= mainCalendar%},
		minDate:'{%=minDate%}',
		maxDate:'{%= maxDate%}',
		minBound:{%= minBound%},
		maxBound:{%= maxBound%},
		xdefaultDate: '{%=defaultDate.ToString()%}',
		xminBound: '{%=minBound%}',
		xmaxBound: '{%=maxBound%}',
		lang: {%= Interview.Language.Id %},
		question: '{%:= column.Shortcut %}'
	});
{% EndIf %}
} ());