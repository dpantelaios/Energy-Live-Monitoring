
import csv

# opening the CSV file
import os
import glob
for outFile in glob.glob('2022*.csv'):
 print(outFile)
 with open(outFile, mode ='r')as file:
   
  # reading the CSV file
   csvFile = csv.reader(file, delimiter='\t')
   
  # displaying the contents of the CSV file
   s = set()
   d = {}
   for lines in csvFile:
     if lines[3] == 'CTY':
         #print(lines)
         if lines[10]=='':
           print(lines[10])
         ind = lines[0]+lines[5]+lines[9]
         #print(ind)
         if ind in s:
             print(lines)
             print("***" , d[ind])
         else:
            s.add(ind)
            d[ind]=lines

#print(s)
