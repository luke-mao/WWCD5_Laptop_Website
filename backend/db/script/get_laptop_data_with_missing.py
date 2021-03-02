import pandas as pd
import requests 
import json 
from time import sleep 
import os 

df = pd.read_csv('laptop_name_list.csv', sep=',', index_col=None, header=None)
num_rows = len(df)

# get searched file
searched_file_path = "./raw_laptop_data"
searched_file_list = [eachfile for eachfile in os.listdir(searched_file_path)]
# 202 files
# print(len(searched_file_list))


API_KEY = 'KJfAt0xBG7JRWn3'
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



# only need to check the first 130 data
for i in range(26, 130):
    # get the model name
    postdata1['param[model_name]'] = df.iloc[i].values[0]
    r = requests.post(URL, postdata1)
    data = r.json()

    # flag
    done = False 

    # we can get all keys from it
    # then choose the largest keys, since the launch date is ascending
    # then save 2 id from them
    item_id_list = list(data['result'].keys());
    
    for j in range(len(item_id_list)-1, -1, -1):
        item_id = item_id_list[j]
        detail = data['result'][item_id]

        # check the launch date
        launch_date = detail['model_resources']['launch_date']

        launch_year = launch_date.split("-")[0]

        if (int(launch_year) >= 2020):
            model_id = detail['model_info'][0]['id']

            # check if this model_id exist
            check_file_name = "{}.json".format(model_id)

            if check_file_name in searched_file_list:
                print("already done row = {}".format(i))
                done = True 
                break 


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
                print("success {} {} row = {}".format(model_id, rr["daily_hits_left"], i))
                done = True 
                break     

    
    if not done:
        print("not success with row = {}".format(i))

        dump_file = "not_success_row_{}.json".format(i)
        with open(dump_file, "w") as f:
            json.dump(data, f)


    
    sleep(1)



