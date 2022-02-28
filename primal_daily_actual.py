### Cron needs to be scheduled daily

## Import Libraries
import pandas as pd
import requests, json
import psycopg2

## Function to get weekly pricing 
def call_weekly(ID, Section):
    url = f'https://mpr.datamart.ams.usda.gov/services/v1.1/reports/{ID}/{Section}'
    r = requests.get(url)
    data = r.json()
    df = pd.DataFrame(data["results"])
    return df

## Get weekly pricing
primal_prices = call_weekly("2498", "Cutout and Primal Values")
primal_prices = primal_prices.iloc[:1,[0,2,3,4,5,6,7,8]]

## Get weekly volume
volume = call_weekly("2498", "Current Volume")
volume = volume.iloc[:1,[0,2]]
volume["pounds"] = volume.temp_cuts_total_load.str.replace(",","")

## Append pounds to primal prices and remove comma
primal_prices["pounds"] = volume["pounds"]

### Replace periods
primal_prices["pork_carcass"] = primal_prices["pork_carcass"].str.replace('.','',regex=True)
primal_prices["pork_loin"] = primal_prices["pork_loin"].str.replace('.','',regex=True)
primal_prices["pork_butt"] = primal_prices["pork_butt"].str.replace('.','',regex=True)
primal_prices["pork_picnic"] = primal_prices["pork_picnic"].str.replace('.','',regex=True)
primal_prices["pork_rib"] = primal_prices["pork_rib"].str.replace('.','',regex=True)
primal_prices["pork_ham"] = primal_prices["pork_ham"].str.replace('.','',regex=True)
primal_prices["pork_belly"] = primal_prices["pork_belly"].str.replace('.','',regex=True)
primal_prices["pounds"] = primal_prices["pounds"].str.replace('.','',regex=True)

### Push to Database

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
    for index, prices in primal_prices.iterrows():
        date = prices[0]
        carcass = prices[1]
        loin = prices[2]
        butt = prices[3]
        picnic = prices[4]
        rib = prices[5]
        ham = prices[6]
        belly = prices[7]
        pounds = prices[8]
        sql_insert_primal = "INSERT INTO market.daily_cut_actual (price_date, avg_cutout_carcass , avg_cutout_loin , avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds) VALUES ('"+date+"', '"+carcass+"', '"+loin+"', '"+butt+"', '"+picnic+"', '"+rib+"', '"+ham+"', '"+belly+"','"+pounds+"');"
        cursor.execute(sql_insert_primal)
        conn.commit()
except:
    print("SQL Insert Failed!")
    
finally:
    cursor.close()
    conn.close()