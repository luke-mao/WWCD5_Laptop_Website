import sqlite3


with sqlite3.connect("data.db") as conn:
    conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
    cur = conn.cursor()

    sql = "SELECT * FROM user WHERE user_id=999"
    # sql = "SELECT * FROM user"


    cur.execute(sql)

    raw_result = cur.fetchall()

    print(raw_result)   

    if not raw_result:
        print("hello")


    print(type(raw_result))
    print(cur.description)
    print(type(cur.description))








