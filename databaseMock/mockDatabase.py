import json
import random
import mysql.connector

with open('PID.json') as f:
    data = json.load(f)
with open('person.json') as f:
    person = json.load(f)
with open('lab.json') as f:
    lab = json.load(f)
with open('drugAllergy.json') as f:
    drugAllergy = json.load(f)
with open('drugOpds.json') as f:
    drugOpds = json.load(f)
with open('hospcode.json') as f:
    hospcode = json.load(f)

#5 years
num_person_mock = 100
num_lab_mock = 2400
num_drugAllergy_mock = 100
num_drugOpd_mock = 2400
num_pid = 100

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

for i in range(num_person_mock):
    tmp = dict(mock01)
    tmp['ID'] = i
    tmp['HOSPCODE'] = '09082'
    tmp['CID'] = str(i).zfill(13)
    tmp['PID'] = str(i).zfill(4)
    tmp['NAME'] = 'N'+str(i).zfill(5)
    tmp['LNAME'] = 'L'+str(i).zfill(5)
    sql = "INSERT INTO `MOPHDC_DW_PNA`.`PERSON` (`ID`, `HOSPCODE`, `CID`, `PID`, `HID`, `PRENAME`, `NAME`, `LNAME`, `HN`,`SEX`, `BIRTH`, `MSTATUS`, `OCCUPATION_NEW`, `RACE`, `NATION`, `RELIGION`, `EDUCATION`, `FSTATUS`, `FATHER`, `MOTHER`,`COUPLE`, `MOVEIN`, `DISCHARGE`, `TYPEAREA`, `D_UPDATE`, `START_DATE`) VALUES" + str(
        tuple(tmp.values()))+ "ON DUPLICATE KEY UPDATE ID=ID"
    mycursor.execute(sql)
    del tmp
print('Person done.')

for j in range(num_pid):
    if j%100==0: print('Lab :', j)
    for i in range(num_lab_mock):
        tmp = dict(lab[1])
        tmp['ID'] = j*num_lab_mock+i
        tmp['PID'] = str(j).zfill(4)
        del tmp['END_DATE'] 
        sql = "INSERT INTO `MOPHDC_DW_PNA`.`LABFU` (`ID`, `HOSPCODE`, `PID`, `SEQ`, `DATE_SERV`, `LABTEST`, `LABRESULT`, `D_UPDATE`, `START_DATE`) VALUES" + str(
            tuple(tmp.values()))+ "ON DUPLICATE KEY UPDATE ID=ID"
        mycursor.execute(sql)
        del tmp
print('Lab done.')

for j in range(num_pid):
    if j%100==0: print('Drug Allergy :', j)
    for i in range(num_drugAllergy_mock):
        tmp = dict(drugAllergy[0])
        tmp['ID'] = j*num_drugAllergy_mock+i
        tmp['PID'] = str(j).zfill(4)
        del tmp['TYPEDX'] 
        del tmp['ALEVEL'] 
        del tmp['SYMPTOM'] 
        del tmp['INFORMHOSP'] 
        del tmp['END_DATE'] 
        sql = "INSERT INTO `MOPHDC_DW_PNA`.`DRUGALLERGY` (`ID`, `HOSPCODE`, `PID`, `DATERECORD`, `DRUGALLERGY`, `DNAME`, `INFORMANT`, `D_UPDATE`, `START_DATE`) VALUES" + str(
            tuple(tmp.values()))+ "ON DUPLICATE KEY UPDATE ID=ID"
        mycursor.execute(sql)
        del tmp
print('Drug Allergy done.')

for j in range(num_pid):
    if j%100==0: print('Drug Opd :', j)
    for i in range(num_drugOpd_mock):
        tmp = dict(drugOpds[0])
        tmp['ID'] = j*num_drugOpd_mock+i
        tmp['PID'] = str(j).zfill(4)
        del tmp['UNIT'] 
        del tmp['UNIT_PACKING'] 
        del tmp['END_DATE'] 
        sql = "INSERT INTO `MOPHDC_DW_PNA`.`DRUG_OPD` (`ID`, `HOSPCODE`, `PID`, `SEQ`, `DATE_SERV`, `CLINIC`, `DIDSTD`, `DNAME`, `AMOUNT`, `DRUGPRICE`, `DRUGCOST`, `PROVIDER`, `D_UPDATE`, `START_DATE`) VALUES" + str(
            tuple(tmp.values()))+ "ON DUPLICATE KEY UPDATE ID=ID"
        mycursor.execute(sql)
        del tmp
print('Drug Opd done.')