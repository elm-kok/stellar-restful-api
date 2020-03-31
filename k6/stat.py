import os
import statistics
import numpy as np

arr = os.listdir()
dt = {'1': [], '2': [], '4': []}
for i in [j for j in arr if j[:2] == 'Up']:
    for k in open(i, "r").readlines():
        dt[i.split('_')[2]].append(float(k))

print(dt.keys())
for i in dt:
    print('Key : ', i)
    print('harmonic_mean :', statistics.harmonic_mean(dt[i]))
    print('median :', statistics.median(dt[i]))
    print('stdev :', statistics.stdev(dt[i]))
    print('variance :', statistics.variance(dt[i]))
    print("Q1 quantile : ", np.quantile(dt[i], .25))
    print("Q2 quantile : ", np.quantile(dt[i], .50))
    print("Q3 quantile : ", np.quantile(dt[i], .75))
    print('min :', min(dt[i]))
    print('max :', max(dt[i]))
    print()
