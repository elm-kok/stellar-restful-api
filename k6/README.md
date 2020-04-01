# K6 and JS test script for Lanbda and Stellar Testnet

## Built With
* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Script test for Stellar
* [K6](https://k6.io/) - Load Testing and Performance monitoring for Lambda
* [Python](https://www.python.org/) - Stat Result

## Getting Started
**1. Install Dependencies:**
```
npm install
```

**2. Run uploadDoctor and uploadHospital:**
```
node uploadDoctor.js
node uploadHospital.js
```

**3. Run disableSignature:**
```
node disableSignature.js
```

**4. Run RemoveDoctor and RemoveHospital:**
```
node RemoveDoctor.js
node RemoveHospital.js
```

**5. Run Stat:**
```
edit Line 7: ...j[:7] == 'Upload_' for the Add Doctor(Key=1) and Add Hospital(Key=2)
edit Line 7: ...j[:7] == 'Update_' for the Disable Doctor  and Disable Hospital (same Key=1) 
edit Line 7: ...j[:7] == 'Remove_' for the Remove Doctor(Key=1) and Remove Hospital(Key=2) 
python stat.py
```