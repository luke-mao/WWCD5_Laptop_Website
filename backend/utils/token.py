import time 
import itsdangerous


SECRET_KEY = "uRCIwNMvFQY0PRVqE4TKwoehqkYPpWJi"
EXPIRE = 7200       # 2 hour to expire


class Token():
    def __init__(self):
        self.s = itsdangerous.URLSafeSerializer(SECRET_KEY)
        self.expire = EXPIRE
    
    def generate(self, id, role):
        info = {
            'id': id,
            'role': role,
            'expire': round(time.time()) + self.expire
        }

        return self.s.dumps(info)
    

    def check(self, token):
        try:
            payload = self.s.loads(token)

            if time.time() > payload['expire']:
                Exception("expired token")
            
            return payload

        except:
            return None 
        

# tt = Token()

# ttt = tt.generate(id=1, role=1)

# print(ttt)

# ttt2 = "eyJpZCI6MSwicm9sZSI6MSwiZXhwaXJlIjoxNjE0OTAzODQ3fQ.inL-ALat1Hd1I26twrOo8U__9ts"

# if tt.check(ttt2) is None:
#     print(tt.check(ttt2))
#     print(type(tt.check(ttt2)))
#     print(type(tt.check(ttt2)['id']))

