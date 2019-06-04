#import numpy as np
import pandas as pd
import sys
import requests

#More about pandas http://pandas-docs.github.io/pandas-docs-travis/user_guide/timeseries.html
import json

url = sys.argv[1]
timeinterval = sys.argv[2]
aggtype = sys.argv[3]

myResponse = requests.get(url)
if(myResponse.ok):
    rContent = json.loads(myResponse.content)
    rcontent_value = rContent['value']
    result = []
    resultTime = []
    for x in rcontent_value:
        result.append(x['result'])
        resultTime.append(x['resultTime'])
    timeindexResult = pd.to_datetime(resultTime)
    timeSerieOrigin = pd.Series(result, index=timeindexResult)
    timeSerieOrigin = timeSerieOrigin.sort_index()
    #print("timeSerie : \n" ,timeSerieOrigin)
    if aggtype =="sum":
        timeSerie_agg = timeSerieOrigin.resample(timeinterval).sum()
    elif aggtype =="mean":
        timeSerie_agg = timeSerieOrigin.resample(timeinterval).mean()
    elif aggtype =="max":
        timeSerie_agg = timeSerieOrigin.resample(timeinterval).max()
    elif aggtype =="min":
        timeSerie_agg = timeSerieOrigin.resample(timeinterval).min()
    elif aggtype =="first":
        timeSerie_agg = timeSerieOrigin.resample(timeinterval).first()
    elif aggtype =="last":
        timeSerie_agg = timeSerieOrigin.resample(timeinterval).last()

    #Turn the result into JSON
    timeSerie_agg_json = timeSerie_agg.to_json(date_format='iso')
    # print(timeSerie_agg_json)
    print(timeSerie_agg_json)

else:
  # If response code is not ok (200), print the resulting http error code with description
    myResponse.raise_for_status()
