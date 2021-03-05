import sqlite3
import os 

FILE_LOCATION = "db/data.db"

# provide a database interface for all users
# especially, the execution result is in dictionary, easier to use

class DB():
    def __init__(self):
        self.file = FILE_LOCATION
        self.conn = None 
        
        # check file
        if not os.path.isfile(self.file):
            print("******Database Error: db file not found******")
            exit(0)


        try:
            self.conn = sqlite3.connect(self.file)

        except sqlite3.Error as e:
            print("******Database connection failed******")
            print(e)
            exit(0)

    
    def execute(self, sql, parameter=None):
        cur = self.conn.cursor()

        if parameter is None:
            cur.execute(sql)
        else:
            cur.execute(sql, parameter)


        # results into dictionary
        rows = cur.fetchall()

        if not rows or len(rows) == 0:
            return None 
        
        data = []
        column_names = cur.description 

        for row in rows:
            data_piece = {}
            for i in range(len(column_names)):
                data_piece[column_names[i][0]] = row[i]
            
            data.append(data_piece)
        
        return data 
    

    def insert_and_get_id(self, sql, parameter):
        cur = self.conn.cursor()
        cur.execute(sql, parameter)

        self.conn.commit()
        
        return cur.lastrowid
    

    def insert(self, sql, parameter):
        cur = self.conn.cursor()
        cur.execute(sql, parameter)

        self.conn.commit()


    def close(self):
        if self.conn:
            self.conn.close()










