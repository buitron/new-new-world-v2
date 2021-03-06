from flask import Flask, request, redirect, render_template
from flask_pymongo import PyMongo
from modules.request import process
import os

app = Flask(__name__)

app.config['MONGO_URI'] = os.environ['MONGODB_URI']
mongo = PyMongo(app)


@app.route('/')
def main_chick():
    sb = mongo.db.sb.find_one()
    return render_template('index.html', sb=sb)


@app.route('/sb_request', methods=['POST'])
def side_chick():
    if request.method == 'POST':
        geo = request.form['geo']
        # addy = request.form['addy']
        # processed_addy = addy.lower()

        sb = mongo.db.sb
        data = process(geo)
        sb.update({}, data, upsert=True)
        print(data)
        return redirect("/", code=302)

    else:
        print("nope")
        return redirect("/", code=302)


if __name__ == "__main__":
    app.run(debug=False)
