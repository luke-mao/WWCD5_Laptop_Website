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
        sql = """
            INSERT INTO item(item_id, name, price, stock_number, category, warranty, status, description, view)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        values = (
            data['model_info'][0]['id'],
            data['model_info'][0]['name'],
            round(float(data['config_price']) * 1.3) + 0.99,
            10,
            1,
            "1 year standard pick-up & return",
            1,
            None,
            0
        )

        # print(sql)
        # print(values)

        try:
            cur = conn.cursor()
            cur.execute(sql, values)
            conn.commit()
        except sqlite3.Error as e:
            print("Working with file {}".format(file))
            print(e)
            # print("Exiting...")
            # exit(0)
        
    