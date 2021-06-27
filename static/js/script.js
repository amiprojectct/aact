var cur_Page = 1;


function showLoad() {
    document.getElementById("loader").style.display = "block";
    document.getElementById("studies_table").style.display = "none";
}

function hideLoad() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("studies_table").style.display = "block";
}

function getHypothesis(description) {
        
    var index = description.indexOf("Hypothesis:");
    if(index == -1) {
        var ret  = "No, hypothesis detected.<br><br>Study Description:<br>" + description;
        return ret;
    }

    var sub_description = description.substring(index);
    var sub_Hypothesis = sub_description.split(".")[0] + ".";
    var hypothesis = sub_Hypothesis.split(":")[1];
    return hypothesis;
}

function getInclusionCriteria(criteria) {
    var sub_criteria = criteria.split("Exclusion Criteria:");
    var InclusionCriteria = sub_criteria[0].split("Inclusion Criteria:");
    if(InclusionCriteria.length > 1) {
        return InclusionCriteria[1];
    } else {
        return "N/A"    
    }
}

function getExclusionCriteria(criteria) {
    var sub_criteria = criteria.split("Exclusion Criteria:");
    if(sub_criteria.length > 1) {
        var EnclusionCriteria = sub_criteria[1];
        return EnclusionCriteria;
    } else {
        return "N/A"
    }
}

function getMonths(start, end) {
        
    function getMonthIndex(Arr) {
        var MonthJson = {
            "January": 1,
            "February": 2,
            "March": 3,
            "April": 4,
            "May": 5,
            "June": 6,
            "July": 7,
            "August": 8,
            "September": 9,
            "October": 10,
            "November": 11,
            "December": 12,
        }
        var retIndex = MonthJson[Arr[0]];
        return retIndex;
    }

    var startArr = start.split(/[ ,]+/);
    var endArr = end.split(/[ ,]+/);

    var ret = (parseInt(endArr[endArr.length - 1]) - 
                parseInt(startArr[startArr.length - 1])) * 12 + 
                getMonthIndex(endArr) - getMonthIndex(startArr);
    return ret;
}

function getARR(patients, centres, start, end) {
    var months = getMonths(start, end);
    if(patients <= 0 || patients == 'None') {
        return "Participants not available";
    }
    if(centres <= 0) {
        return "Locations not available";
    }
    if( months <=0 || start == 'None' || end == 'None' ) {
        return "Study start or end date is not available";
    }
    
    var ret = patients / centres / months;
    if(Number.isNaN(ret)){
        console.log(ret);
        return "Locations not available";
    }
    return ret;
}

function showMoreAndLess(nct_id, type) {
    var btnText = document.getElementById(nct_id + "_"+ type +"_showBtn");

    if(type == "inclusionCriteria" || type == "enclusionCriteria") {
        var moreText = document.getElementsByClassName(nct_id + type + "_more");
        if (moreText[0].style.display === "none") {
            moreText[0].style.display = "inline";
            btnText.innerHTML = "Show less...";
        } else {
            moreText[0].style.display = "none";
            btnText.innerHTML = "Show more...";
        }
        return;
    }

    var list = document.getElementsByClassName( nct_id + "_" + type +"_li");
    if (list[0].style.display === "none") {
        for(var i=0; i < list.length; i++) {
            list[i].style.display = "list-item";
        }
        btnText.innerHTML = "Show less..."; 
    } else {
        for(var i=0; i < list.length; i++) {
            list[i].style.display = "none";
        }
        btnText.innerHTML = "Show more..."; 
    }
}

function generateInsertHtmlOfCriteria(content, nct_id, type) {
    var content_Arr = content.split("<br>");
    var innerHTMLText = "<td>";
    if(content_Arr.length > 3) {
        var firstContent = '';
        var secondContent = '';
        for (let index = 0; index < content_Arr.length; index++) {
            const element = content_Arr[index];
            if(index < 3) {
                firstContent += element;
                firstContent += "<br>";
            } else {
                secondContent += element;
                secondContent += "<br>";
            }
            

            
        }
        innerHTMLText += "<p>";
        innerHTMLText += firstContent;
        innerHTMLText += "<span class = '" + nct_id + type + "_more' style='display:none'>" + secondContent + "</span>"
        innerHTMLText += "</p>";
        innerHTMLText += "<button type='button' id='" + nct_id + "_" + type + "_showBtn' class='btn waves-effect waves-light btn-secondary' style='padding: 2px;' onclick=\"showMoreAndLess('" + nct_id + "', '" + type + "')\">Show more...</button>"
        innerHTMLText += "</td>";
    } else {
        innerHTMLText += "<p>";
        innerHTMLText += content + "</p>";
        innerHTMLText += "</td>";
    }
    return innerHTMLText;
}

function generateExcelFile() {
    var options = {
        fileName: "Selected Studies"
    };
    var selectedRecordsTable1 =  [[
        {"text":"Status"},
        {"text":"Study Title"},
        {"text":"Conditions"},
        {"text":"Phase"},
        {"text":"Interventions"},
        {"text":"Locations"},
        {"text":"NCT ID"},
        {"text":"Enrollment"},
        {"text":"URL"},
        {"text":"Start Date"},
        {"text":"Primary Completion Date"},
        {"text":"Completion Date"},
        {"text":"Study First Posted Date"},
        {"text":"Last Update Posted Date"},
        {"text":"Gender"},
        {"text":"Minimum Age"},
        {"text":"Maximum Age"},
        {"text":"Outcome Measures"},
        {"text":"Sponsors"},
        {"text":"Study type"},
    ]];
    if(selectedRecords.length <= 0) {
        alert("Please select which studies you would like to export");
        return;
    }
    for (let index = 0; index < selectedRecords.length; index++) {
        const element = selectedRecords[index];
        var selectedTableRecord = [];
        selectedTableRecord.push({"text": element.studyStatus});
        selectedTableRecord.push({"text": element.studyTitle});
        selectedTableRecord.push({"text": element.studyConditions});
        selectedTableRecord.push({"text": element.studyPhase});
        selectedTableRecord.push({"text": element.studyInterventions});
        selectedTableRecord.push({"text": element.studyLocations});
        selectedTableRecord.push({"text": element.nct_id});
        selectedTableRecord.push({"text": element.Patients});
        selectedTableRecord.push({"text": element.study_url});
        selectedTableRecord.push({"text": element.start_date});
        selectedTableRecord.push({"text": element.primary_completion_date});
        selectedTableRecord.push({"text": element.completion_date});
        selectedTableRecord.push({"text": element.study_first_posted_date});
        selectedTableRecord.push({"text": element.last_update_posted_date});
        selectedTableRecord.push({"text": element.gender});
        selectedTableRecord.push({"text": element.minimum_age});
        selectedTableRecord.push({"text": element.maximum_age});
        selectedTableRecord.push({"text": element.outcome_measures});
        selectedTableRecord.push({"text": element.studies_sponsors});
        selectedTableRecord.push({"text": element.study_type});
        selectedRecordsTable1.push(selectedTableRecord);
    }
    var table1Data = [
        {
            "sheetName": "Sheet1",
            "data": selectedRecordsTable1
        }
    ];
    Jhxlsx.export(table1Data, options);
}

function generateExcelFileForPage2() {
    var options = {
        fileName: "Selected Studies Result"
    };
    var selectedRecordsTable2 = [[
        {"text":"NCT ID"},
        {"text":"Study Title"},
        {"text":"Hypothesis"},
        {"text":"Inclusion Criteria"},
        {"text":"Exclusion Criteria"},
        {"text":"IARR"},
        {"text":"URL"}
    ]];
    if(selectedRecords.length <= 0) {
        alert("Please select which studies you would like to export");
        return;
    }
    for (let index = 0; index < selectedRecords.length; index++) {
        const element = selectedRecords[index];
        var recordTable2 = [];
        recordTable2.push({"text":element.nct_id});
        recordTable2.push({"text":element.studyTitle});
        recordTable2.push({"text":element.Hypothesis.replaceAll('<br>', "\n")});
        recordTable2.push({"text":element.InclusionCriteria.trim()});
        recordTable2.push({"text":element.EnclusionCriteria.trim()});
        recordTable2.push({"text":element.Arr});
        recordTable2.push({"text": "https://clinicaltrials.gov/ct2/show/"+element.nct_id});
        selectedRecordsTable2.push(recordTable2);
    }
    var extra_excelData = [];
    extra_excelData.push({"text":"ARR Median: " + ARR_Median});
    extra_excelData.push({"text":"ARR Range: " + ARR_Range});
    selectedRecordsTable2.push(extra_excelData);
    var table2Data = [
        {
            "sheetName": "Sheet1",
            "data": selectedRecordsTable2
        }
    ];
    Jhxlsx.export(table2Data, options);
}

function onCheckStatus(id=null) {
    var not_yet_recruiting = document.getElementById('not_yet_recruiting').checked;
    var recruiting = document.getElementById('recruiting').checked;
    var enrolling_by_invitation = document.getElementById('enrolling_by_invitation').checked;
    var active_not_recruiting = document.getElementById('active_not_recruiting').checked;
    var suspended = document.getElementById('suspended').checked;
    var terminated = document.getElementById('terminated').checked;
    var completed = document.getElementById('completed').checked;
    var withdrawn = document.getElementById('withdrawn').checked;
    var unknown_status = document.getElementById('unknown_status').checked;
    
    var allcheckFlag = not_yet_recruiting | recruiting | enrolling_by_invitation | suspended | terminated | completed | withdrawn | unknown_status;

    if(id == null) {
        if( allcheckFlag ) 
        {
            document.getElementById('all_studies').checked = false;
        } else {
            document.getElementById('all_studies').checked = true;
        }
    } else {
        if ( allcheckFlag ) {
            document.getElementById('not_yet_recruiting').checked = false;
            document.getElementById('recruiting').checked = false;
            document.getElementById('enrolling_by_invitation').checked = false;
            document.getElementById('active_not_recruiting').checked = false;
            document.getElementById('suspended').checked = false;
            document.getElementById('terminated').checked = false;
            document.getElementById('completed').checked = false;
            document.getElementById('withdrawn').checked = false;
            document.getElementById('unknown_status').checked = false;
        }
        document.getElementById('all_studies').checked = true;
    }
}

function showPage(index) {
    document.getElementById("page" + cur_Page).style.display = "none";
    cur_Page = cur_Page + index;
    document.getElementById("page" + cur_Page).style.display = "";
    document.getElementById("back").disabled = false;
    document.getElementById("next").disabled = false;
    if(cur_Page == 1) {
        document.getElementById("back").disabled = true;
    } else if(cur_Page == 3) {
        document.getElementById("next").disabled = true;
    } 
}

function addLocations(locations, arr) {
    for (let i = 0; i < locations.length; i++) {
        var location = locations[i];
        var exist_flag = false;
        for (let index = 0; index < ARR_FCC.length; index++) {
            if (ARR_FCC[index].name == location.innerHTML.trim() ) {
                ARR_FCC[index].value += parseFloat(arr);
                ARR_FCC[index].count += 1;
                exist_flag = true;
                break;
            }
        }
        if(exist_flag == false) {
            var record = {
                name: location.innerHTML.trim(),
                value: parseFloat(arr),
                count: 1
            };
            ARR_FCC.push(record);
        }
    }
    
}

function generate_ARR_for_common_centres_result() {
    var retStr = "";
    for (let i = 0; i < ARR_FCC.length; i++) {
        const element = ARR_FCC[i];
        if(element.count <=1 || element.name == "None" ) {
            continue;
        }
        retStr += "\n";
        retStr += element.name;
        retStr += " : ";
        retStr += parseFloat(element.value/element.count).toFixed(3);
    }
    return retStr;
}

function generate_ARR_CSPBC() {
    var retStr = "";
    for (let i = 0; i < ARR_FCC.length; i++) {
        const element = ARR_FCC[i];
        if(element.count <=1 || element.name == "None" ) {
            continue;
        }
        retStr += "\n";
        retStr += element.name;
        retStr += " : ";
        retStr += element.count;
    }
    return retStr;
}
