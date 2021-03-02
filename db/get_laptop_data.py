import pandas as pd
import requests 
import json 
from time import sleep 

df = pd.read_csv('laptop_name_list.csv', sep=',', index_col=None, header=None)
num_rows = len(df)


API_KEY = '112233aabbcc'
URL = 'https://noteb.com/api/webservice.php'

postdata1 = {
    'apikey': API_KEY,
    'method': 'list_models',
    'param[model_name]': "333"
}

postdata2 = {
    'apikey': API_KEY,
    'method': 'get_model_info',
    'param[model_id]': 0
}


# 02/03/2021 finish at 130, next start 130
for i in range(130, 131):

    postdata1['param[model_name]'] = df.iloc[i].values[0]
    r = requests.post(URL, postdata1)
    data = r.json()

    # we can get all keys from it
    # then choose the largest keys, since the launch date is ascending
    # then save 2 id from them
    item_id_list = list(data['result'].keys());
    
    for i in range(len(item_id_list)-1, -1, -1):
        item_id = item_id_list[i]
        detail = data['result'][item_id]

        # check the launch date
        launch_date = detail['model_resources']['launch_date']

        launch_year = launch_date.split("-")[0]

        if (int(launch_year) >= 2020):
            model_id = detail['model_info'][0]['id']

            # prepare data
            postdata2['param[model_id]'] = model_id
            
            r = requests.post(URL, postdata2)
            rr = r.json()

            # also need the result dict to be non-empty
            if rr['code'] == 26 and rr["message"] == "Valid method." and rr['result']:

                filename = "data/{}.json".format(model_id)

                with open(filename, 'w') as f:
                    json.dump(rr, f)
                
                # one laptop is enough
                print("success {} {}".format(model_id, rr["daily_hits_left"]))
                break     

    
    sleep(5)



