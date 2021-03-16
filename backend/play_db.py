import sqlite3


with sqlite3.connect("data.db") as conn:
    conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
    cur = conn.cursor()

    sql = "SELECT * FROM item LIMIT 1"

    cur.execute(sql)

    result = cur.fetchone()

    for key in result:
        print("\"{}\",".format(key))







