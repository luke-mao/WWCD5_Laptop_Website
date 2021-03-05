import sqlite3
import os 

FILE_LOCATION = "db/data.db"

# provide a database interface for all users
# especially, the execution result is in dictionary, easier to use

class DB():
    # the connection is on once create the instance
    # the system exits for any error
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

    
    # this function is only for "select" statements
    # since not much error will occur during execution
    def select(self, sql, parameter=None):
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
    

    # for complex sql statement, including some which may arise sql error
    # return the cursor so the operation can be more flexible
    def get_conn_and_cursor(self):
        cur = self.conn.cursor()
        return self.conn, cur 
    

    # for insert query that you sure no problem at all
    # and if you want to get the new id, 
    # use this function
    def insert_and_get_id(self, sql, parameter):
        cur = self.conn.cursor()
        cur.execute(sql, parameter)
        self.conn.commit()
        return cur.lastrowid


    # rowcount should be 1 for successful update
    def update(self, sql, parameter):
        cur = self.conn.cursor()
        cur.execute(sql, parameter)
        self.conn.commit()
        return cur.rowcount


    # close the connection    
    def close(self):
        if self.conn:
            self.conn.close()

