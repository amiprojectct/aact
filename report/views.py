import re

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q, Count

from .models import Studies, Conditions, Facilities, Interventions, CalculatedValues, ProvidedDocuments, AnalyzedStudies

def index(request):
    return render(request, 'report.html')

def getStudies(request):
    analyzedStudies = Studies.objects.all().order_by('nct_id')
    analyzed_Studies = AnalyzedStudies.objects.all().order_by('nct_id')
    qs = None
    Funder_NIH = request.POST.get('Funder_NIH')
    Funder_Industry = request.POST.get('Funder_Industry')
    Funder_Other = request.POST.get('Funder_Other')
    if Funder_NIH == 'true':
        qs = Q(funding__contains='NIH')
    if Funder_Industry == 'true':
        if(qs):
            qs = qs | Q(funding__contains='Industry')
        else:
            qs = Q(funding__contains='Industry')
    if Funder_Other == 'true':
        if(qs):
            qs = qs | Q(funding__contains='Other')
        else:
            qs = Q(funding__contains='Other')
    if(qs):
        analyzed_Studies = analyzed_Studies.filter(qs)
    analyzedStudies = analyzedStudies.filter(nct_id__in = analyzed_Studies.values_list("nct_id"))
    # page
    page = request.POST.get('page', 1)

    # condition
    condition = request.POST.get('condition')
    if condition != '':
        analyzedStudies = analyzedStudies.filter(nct_id__in=Conditions.objects.filter(Q(name__icontains=condition)|Q(downcase_name__icontains=condition)).values_list("nct"))

    # country
    country = request.POST.get('country')
    if country != '':
        analyzedStudies = analyzedStudies.filter(nct_id__in=Facilities.objects.filter(Q(country__icontains=country)).values_list("nct"))
    
    # result
    with_Result = request.POST.get('with_Result')
    without_Result = request.POST.get('without_Result')
    if with_Result == 'true':
        analyzedStudies = analyzedStudies.filter(nct_id__in=CalculatedValues.objects.filter(Q(were_results_reported__contains='true')).values_list("nct"))
    if without_Result == 'true':
        analyzedStudies = analyzedStudies.filter(nct_id__in=CalculatedValues.objects.filter(Q(were_results_reported__contains='false')).values_list("nct"))
    # documents
    document_Protocols = request.POST.get('document_Protocols')
    document_SAPs = request.POST.get('document_SAPs')
    document_ICFs = request.POST.get('document_ICFs')
    qs = None
    if document_Protocols == 'true':
        qs = Q(has_protocol__contains='true')
    if document_SAPs == 'true':
        if(qs):
            qs = qs | Q(has_sap__contains='true')
        else:
            qs = Q(has_sap__contains='true')
    if document_ICFs == 'true':
        if(qs):
            qs = qs | Q(has_icf__contains='true')
        else:
            qs = Q(has_icf__contains='true')
    if(qs):
        analyzedStudies = analyzedStudies.filter(nct_id__in=ProvidedDocuments.objects.filter(qs).values_list("nct"))
    # other terms
    otherTermStr = request.POST.get('otherTerms')
    if otherTermStr !='':
        otherTerms = re.findall('[^,\s]+', otherTermStr)
        qs = Q()
        for otherTerm in otherTerms:
            qs = qs | Q(nct_id__exact=otherTerm) | Q(brief_title__icontains=otherTerm) | Q(official_title__icontains=otherTerm) | Q(source__icontains=otherTerm) | Q(nct_id__in=Interventions.objects.filter(Q(name__icontains=otherTerm)|Q(description__icontains=otherTerm)).values_list("nct"))
        
        analyzedStudies = analyzedStudies.filter(qs)
    
    # phase
    early_phase_1 = request.POST.get('early_phase_1')
    phase_1 = request.POST.get('phase_1')
    phase_2 = request.POST.get('phase_2')
    phase_3 = request.POST.get('phase_3')
    phase_4 = request.POST.get('phase_4')
    not_applicable = request.POST.get('not_applicable')
    
    qs = None    
    if(early_phase_1 == 'true'):
        qs = Q(phase__exact="Early Phase 1")
    
    if(phase_1 == 'true'):
        if(qs):
            qs = qs | Q(phase__startswith="Phase 1")
        else:
            qs = Q(phase__startswith="Phase 1")
    if(phase_2 == 'true'):
        if(qs):
            qs = qs | Q(phase__contains="Phase 2")
        else:
            qs = Q(phase__contains="Phase 2")
    
    if(phase_3 == 'true'):
        if(qs):
            qs = qs | Q(phase__contains="Phase 3")
        else:
            qs = Q(phase__contains="Phase 3")
    
    if(phase_4 == 'true'):
        if(qs):
            qs = qs | Q(phase__contains="Phase 4")
        else:
            qs = Q(phase__contains="Phase 4")
    
    if(not_applicable == 'true'):
        if(qs):
            qs = qs | Q(phase__contains="N/A") 
        else:
            qs = Q(phase__contains="N/A")
    if(qs):
        analyzedStudies = analyzedStudies.filter(qs)

    # status
    not_yet_recruiting = request.POST.get('not_yet_recruiting')
    recruiting = request.POST.get('recruiting')
    enrolling_by_invitation = request.POST.get('enrolling_by_invitation')
    active_not_recruiting = request.POST.get('active_not_recruiting')
    suspended = request.POST.get('suspended')
    terminated = request.POST.get('terminated')
    completed = request.POST.get('completed')
    withdrawn = request.POST.get('withdrawn')
    unknown_status = request.POST.get('unknown_status')
    

    qs=None
    if(not_yet_recruiting == 'true'):
        qs = Q(overall_status__exact="Not yet recruiting")
    
    if(recruiting == 'true'):
        if(qs):
            qs = qs | Q(overall_status__exact="Recruiting")
        else:
            qs = Q(overall_status__exact="Recruiting")
    
    if(enrolling_by_invitation == 'true'):
        if(qs):
            qs = qs | Q(overall_status__exact="Enrolling by invitation")
        else:
            qs = Q(overall_status__exact="Enrolling by invitation")
    if(active_not_recruiting == 'true'):
        if(qs):
            qs = qs | Q(overall_status__exact="Active, not recruiting")
        else:
            qs = Q(overall_status__exact="Active, not recruiting")

    if(suspended == 'true'):
        if(qs):
            qs = qs | Q(overall_status__exact="Suspended")
        else:
            qs = Q(overall_status__exact="Suspended")
    
    if(terminated == 'true'):
        if(qs):
            qs = qs | Q(overall_status__exact="Terminated")
        else:
            qs = Q(overall_status__exact="Terminated")
    if(completed == 'true'):
        if(qs):
            qs = qs | Q(overall_status__exact="Completed")
        else:
            qs = Q(overall_status__exact="Completed")
    if(withdrawn == 'true'):
        if(qs):
            qs = qs | Q(overall_status__exact="Withdrawn")
        else:
            qs = Q(overall_status__exact="Withdrawn")
    if(unknown_status == 'true'):
        if(qs):
            qs = qs | Q(overall_status__exact="Unknown status")
        else:
            qs = Q(overall_status__exact="Unknown status")
    if(qs):
        analyzedStudies = analyzedStudies.filter(qs)

    analyzed_Studies = analyzed_Studies.filter(nct_id__in = analyzedStudies.values_list("nct_id"))
    paginator = Paginator(analyzedStudies, 10)
    analyzed_Studies_paginator = Paginator(analyzed_Studies, 10)

    try:
        reports = paginator.page(page)
        analyzed_Studies_reports = analyzed_Studies_paginator.page(page)
    except PageNotAnInteger:
        reports = paginator.page(1)
        analyzed_Studies_reports = analyzed_Studies_paginator.page(1)
    except EmptyPage:
        reports = paginator.page(paginator.num_pages)
        analyzed_Studies_reports = analyzed_Studies_paginator.page(analyzed_Studies_paginator.num_pages)

    print(analyzed_Studies_reports.object_list.values('funding'))    
    return render(request, 'tables/studiesTable.html', { 'reports': reports, 'funder_types': analyzed_Studies_reports })

def getConditionTerms(request):
    condKey = request.GET.get('cond')
    condSet = Conditions.objects.values('name').annotate(Count('id')).order_by().filter(id__count__gt=1).filter(Q(downcase_name__startswith=condKey) | Q(name__startswith=condKey))    
    paginator = Paginator(condSet, 10)
    condKeySet = paginator.page(1).object_list.values('name')
    conditions = list(condKeySet)
    data = []

    for item in conditions: #list is your initial datas format as python list
        data.append(item['name'])
    return JsonResponse({'cond': data})