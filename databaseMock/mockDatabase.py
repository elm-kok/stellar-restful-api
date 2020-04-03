import json
import random
import mysql.connector

with open('PID.json') as f:
    data = json.load(f)
with open('person.json') as f:
    person = json.load(f)
with open('hospcode.json') as f:
    hospcode = json.load(f)

num_mock = 5
unique_pid = []
unique_hospcode = []

c = '(`ID`, `HOSPCODE`, `CID`, `PID`, `HID`, `PRENAME`, `NAME`, `LNAME`, `HN`,`SEX`, `BIRTH`, `MSTATUS`, `OCCUPATION_NEW`, `RACE`, `NATION`, `RELIGION`, `EDUCATION`, `FSTATUS`, `FATHER`, `MOTHER`,`COUPLE`, `MOVEIN`, `DISCHARGE`, `TYPEAREA`, `D_UPDATE`, `START_DATE`)'
cc = [i for i in c.replace('(', '').replace(')', '').replace(
    ',', '').split('`') if len(i) > 1]

mydb = mysql.connector.connect(
    host="127.0.0.1",
    user="kok",
    passwd="123456",
    database="MOPHDC_DW_PNA"
)
mycursor = mydb.cursor()

mock01 = dict(person[0])
for i in person[0]:
    if i not in cc:
        del mock01[i]

for i in data:
    unique_pid.append(i['PID'])

for i in hospcode:
    unique_hospcode.append(i['HOSPCODE'])

for i in range(num_mock):
    tmp = dict(mock01)
    tmp['ID'] = i+4
    tmp['HOSPCODE'] = unique_hospcode[random.randrange(len(unique_hospcode))]
    tmp['CID'] = str(i).zfill(13)
    tmp['PID'] = unique_pid[random.randrange(len(unique_pid))]
    tmp['NAME'] = 'N'+str(i).zfill(5)
    tmp['LNAME'] = 'L'+str(i).zfill(5)
    sql = "INSERT INTO `MOPHDC_DW_PNA`.`PERSON` (`ID`, `HOSPCODE`, `CID`, `PID`, `HID`, `PRENAME`, `NAME`, `LNAME`, `HN`,`SEX`, `BIRTH`, `MSTATUS`, `OCCUPATION_NEW`, `RACE`, `NATION`, `RELIGION`, `EDUCATION`, `FSTATUS`, `FATHER`, `MOTHER`,`COUPLE`, `MOVEIN`, `DISCHARGE`, `TYPEAREA`, `D_UPDATE`, `START_DATE`) VALUES" + str(
        tuple(tmp.values()))
    mycursor.execute(sql)
    del tmp

