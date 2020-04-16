# JS test script for Stellar Testnet

## Built With

- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Script test for Stellar
- [Python](https://www.python.org/) - Stat Result

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

**3. Run fetch and fetchDecrypt:**

```
node fetch.js
node fetchDecrypt.js
```

**4. Run disableSignature:**

```
node disableSignature.js
```

**5. Run RemoveDoctor and RemoveHospital:**

```
node RemoveDoctor.js
node RemoveHospital.js
```

**6. Run normalLogin:**

```
node normalLogin.js
```

**7. Run Stat:**

```
edit Line 7: ...j[:7] == 'Upload_' for Add Doctor(Key=1) and Add Hospital(Key=2)
edit Line 7: ...j[:7] == 'Update_' for Disable Doctor  and Disable Hospital (same Key=1)
edit Line 7: ...j[:6] == 'Fetch_' for fetch without Encryption
edit Line 7: ...j[:13] == 'FetchDecrypt_' for fetch with Encryption
edit Line 7: ...j[:7] == 'Remove_' for Remove Doctor(Key=1) and Remove Hospital(Key=2)
edit Line 7: ...j[:6] == 'Login_' for Normal Login
python stat.py
```
