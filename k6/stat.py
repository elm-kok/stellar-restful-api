import os
import statistics
import numpy as np

arr = os.listdir()
dt = {}
for i in [j for j in arr if j[:7] == 'Update_']:
    for k in open(i, "r").readlines():
        if i.split('_')[2] in dt:
            dt[i.split('_')[2]].append(float(k)/1e3)
        else:
            dt[i.split('_')[2]] = [float(k)/1e3]

print(dt.keys())
for i in dt:
    print('Key (sec): ', i)
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
