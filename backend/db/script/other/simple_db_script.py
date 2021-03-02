import sqlite3
import sys


def connect(db_path):
    try: 
        conn = sqlite3.connect(db_path)
        return conn 
    except sqlite3.Error as e:
        print("Error database {}".format(e))
        print("Exiting")
        exit;


def create_table(conn, create_table_sql):
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except sqlite3.Error as e:
        print("Error database {}".format(e))
        print("Exiting")
        exit;


def create_project(conn, project):
    sql = """ 
        INSERT INTO projects(name, begin_date, end_date) VALUES(?, ?, ?)
    """

    c = conn.cursor()
    c.execute(sql, project)
    conn.commit()

    return c.lastrowid


def create_task(conn, task):
    # also return the new task_id
    # note that the sql does not mention id
    # the id is self-increasing

    try:
        sql = """
            INSERT INTO tasks(name, priority, status_id, project_id, begin_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?)
        """

        c = conn.cursor()
        c.execute(sql, task)
        conn.commit()

        return c.lastrowid
    except sqlite3.Error as e:
        print(e)
        print("Exiting..")
        exit()



if __name__ == '__main__':
    db_path = 'hello.db'
    conn = connect(db_path)   

    sql_1 = """ CREATE TABLE IF NOT EXISTS projects (
        id integer PRIMARY KEY,
        name text NOT NULL,
        begin_date text,
        end_date text
    ); """

    sql_2 = """ CREATE TABLE IF NOT EXISTS tasks(
        id integer PRIMARY KEY,
        name text NOT NULL,
        priority integer,
        status_id integer NOT NULL,
        project_id integer NOT NULL,
        begin_date text NOT NULL,
        end_date text NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    ); """

    create_table(conn, sql_1)
    create_table(conn, sql_2)

    # create a new project
    project = ('Cool App with SQLite & Python', '2015-01-01', '2015-01-30');
    project_id = create_project(conn, project)

    # tasks
    task_1 = ('Analyze the requirements of the app', 1, 1, project_id, '2015-01-01', '2015-01-02')
    task_2 = ('Confirm with user about the top requirements', 1, 1, project_id, '2015-01-03', '2015-01-05')

    # create tasks
    print(create_task(conn, task_1))
    print(create_task(conn, task_2))



    conn.close()




