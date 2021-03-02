import os 
import json 
import sqlite3 
import math

# get all files
filepath = "../data"
files = [filepath + '/' + eachfile for eachfile in os.listdir(filepath)]

# connect to db
db_file = "../data.db"
conn = None 

try:
    conn = sqlite3.connect(db_file)
    print("Connection successful")
except sqlite3.Error as e:
    print(e)
    print("Exiting")
    exit(0)


# connected, prepare the insert 
for file in files:
    with open(file, "r") as f:
        # print("Working with file {}".format(file))

        # get json
        data = json.load(f)
        data = data['result']["0"]

        # we need to insert into two tables
        # 1. table item, use the same id as the filename
        sql = """ INSERT INTO laptop(item_id, launch_date, """

        values_list = [
            data["model_info"][0]["id"],
            data["model_resources"]["launch_date"]
        ]

        # get all other keys
        # ignore some keys
        key_ignore_list = [
            "model_info", 
            "config_id", 
            "model_resources",
            "config_price",
            "config_price_min",
            "config_price_max"
        ]

        for key in data:
            if key in key_ignore_list:
                continue 

            # check if it is a dict or not
            if isinstance(data[key], dict):
                for key2 in data[key]:
                    key3 = "{}_{}".format(key, key2)
                    
                    sql = "{} {},".format(sql, key3)
                    values_list.append(data[key][key2])
            else:
                sql = "{} {},".format(sql, key)
                values_list.append(data[key])
        
        # at the end of sql, remove the last comma
        sql = sql[:-1]
        sql += ") VALUES("

        # total 83 attributes
        for _ in range(82):
            sql += "?, "

        sql += "?);"

        values = tuple(values_list)
        

        try:
            cur = conn.cursor()
            cur.execute(sql, values)
            conn.commit()
        except sqlite3.Error as e:
            print("Working with file {}".format(file))
            print(e)
            # print("Exiting...")
            # exit(0)

