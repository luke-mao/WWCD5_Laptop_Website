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
        print("Working with file {}".format(file))

        # get json
        data = json.load(f)
        data = data['result']["0"]
        

        # do the thumbernail
        sql1 = """ UPDATE item SET thumbnail = ? WHERE item_id = ? """
        values1 = (data["model_resources"]["thumbnail"], data["model_info"][0]["id"])

        # total 4 images
        sql2 = """ INSERT INTO photo(item_id, photo) VALUES (?, ?)"""
          

        try:
            cur = conn.cursor()
            cur.execute(sql1, values1)

            for i in range(1, 5):
                key = "image_{}".format(i)
                values2 = (data["model_info"][0]["id"], data["model_resources"][key])  

                cur.execute(sql2, values2)

            conn.commit()
        except sqlite3.Error as e:
            print(e)
            print("Exiting...")
            exit(0)

