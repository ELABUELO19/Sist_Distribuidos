from fastapi import FastAPI
from pydantic import BaseModel
import redis

app = FastAPI()

class TextModel(BaseModel):
    text: str

redis_client =  redis.Redis(host='127.0.0.1', port=6379, decode_responses=True)

@app.post('/text')
def add_text(text_model: TextModel):
    redis_client.set(text_model.text, text_model.text)
    return {"stored_value": redis_client(text_model.text)}

@app.get('/text/{text}')
def get_text(text: str):
    return {"retrieved_value": redis_client.get(text)}