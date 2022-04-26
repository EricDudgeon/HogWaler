import numpy as np
import pandas as pd
import tensorflow as tf
import requests
import psycopg2
from datetime import timedelta

### Import Model
lstm_model = tf.keras.models.load_model("modelsave")

### Get USDA Data and Clean it
def call_weekly(ID, Section):
    url = f'https://mpr.datamart.ams.usda.gov/services/v1.1/reports/{ID}/{Section}'
    r = requests.get(url)
    data = r.json()
    df = pd.DataFrame(data["results"])
    df["report_date"] = pd.to_datetime(df["report_date"])
    return df

df2 = call_weekly("2500", "Weekly Average Cutout and Primal Values")
pd.to_datetime(df2['report_for_date'], format='%m/%d/%Y')
df2.set_index('report_for_date', inplace=True)
df2 = df2.iloc[:121,[2,3,4,5,6,7,8]]
df_new = df2.iloc[::-1].astype(float)
volume = call_weekly("2500", "Current Volume")
volume = volume.iloc[:,[1,3]]
volume.set_index("report_for_date", inplace=True)
volume = volume.iloc[:121]
volume.iloc[::-1]
df_new["pounds"] = volume["total_loads"]
df_new['pounds'] = df_new.Pounds.str.replace(",","")
df_new1 = df_new.astype(float)
last = df_new1.iloc[-1]
df_new = df_new1.pct_change().iloc[-120:]

### Make Predictions in Pct Change
predict_df = np.array(df_new)
prediction_df = predict_df.reshape(1, 120, 8)
final = lstm_model.predict(prediction_df)
post_final = pd.DataFrame(final[0],columns=['avg_cutout_carcass',	'avg_cutout_loin',	'avg_cutout_butt',	'avg_cutout_picnic','avg_cutout_rib',	'avg_cutout_ham',	'avg_cutout_belly',"pounds"])

### Convert to CWT 
def convert(array, last):
    final_lst = []
    lst = []
    for num1, num2 in zip(array[0], last):
        lst.append((1+(num1/100)) * num2)
    final_lst.append(lst)
    for n in array[1:]:
        lst = []
        for num1, num2 in zip(n, final_lst[-1]):
            lst.append((1+(num1/100)) * num2)
        final_lst.append(lst)
    
    return final_lst

predictions = np.array(convert(final[0],last))
final_predictions = pd.DataFrame(predictions,columns=['avg_cutout_carcass','avg_cutout_loin','avg_cutout_butt','avg_cutout_picnic','avg_cutout_rib','avg_cutout_ham','avg_cutout_belly','pounds'])
df_new1 = df_new1.append(final_predictions)
df_new1.reset_index(inplace=True)
final_predictions = round(final_predictions,2)

### Assign dates to predictions and weeks out prediction
last_date = pd.to_datetime(last.name, format='%m/%d/%Y')
df_date = [str(last_date + timedelta(days=7)), str(last_date + timedelta(days=14)),str(last_date + timedelta(days=21)), str(last_date + timedelta(days=28)),str(last_date + timedelta(days=35)), str(last_date + timedelta(days=42))]
week_predition = ["1","2","3","4","5","6"]
final_predictions["date"] = df_date
final_predictions["week_prediction"] = week_predition
final_predictions = final_predictions.astype(str)
### Replace periods
final_predictions["avg_cutout_carcass"] = final_predictions["avg_cutout_carcass"].str.replace('.','',regex=True)
final_predictions["avg_cutout_loin"] = final_predictions["avg_cutout_loin"].str.replace('.','',regex=True)
final_predictions["avg_cutout_butt"] = final_predictions["avg_cutout_butt"].str.replace('.','',regex=True)
final_predictions["avg_cutout_picnic"] = final_predictions["avg_cutout_picnic"].str.replace('.','',regex=True)
final_predictions["avg_cutout_rib"] = final_predictions["avg_cutout_rib"].str.replace('.','',regex=True)
final_predictions["avg_cutout_ham"] = final_predictions["avg_cutout_ham"].str.replace('.','',regex=True)
final_predictions["avg_cutout_belly"] = final_predictions["avg_cutout_belly"].str.replace('.','',regex=True)
final_predictions["pounds"] = final_predictions["pounds"].str.replace('.','',regex=True)
### Push to database table
## Try to connect
try:
    conn = psycopg2.connect(
    database="hogwaler",
    user='bertsky',
    password='DatabasePassword6969',
    host='192.168.86.42',
    port='5432'
)
except:
    print("Unable to connect to the database")
    
cursor = conn.cursor()
# Iterate through rows and commit to table
try:
    for index, prices in final_predictions.iterrows():
        carcass = prices[0]
        loin = prices[1]
        butt = prices[2]
        picnic = prices[3]
        rib = prices[4]
        ham = prices[5]
        belly = prices[6]
        pounds = prices[7]
        date_pred = prices[8]
        week_pred = prices[9]
        sql_insert_primal = "INSERT INTO market.weekly_cut_predicted (avg_cutout_carcass , avg_cutout_loin , avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date, week_pred) VALUES ('"+carcass+"', '"+loin+"', '"+butt+"', '"+picnic+"', '"+rib+"', '"+ham+"', '"+belly+"','"+pounds+"','"+date_pred+"','"+week_pred+"');"
        cursor.execute(sql_insert_primal)
        conn.commit()
except:
    print("SQL Insert Failed!")
    
finally:
    cursor.close()
    conn.close()
