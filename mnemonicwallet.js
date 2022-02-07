const express = require("express");
const app = express();
const fs = require("fs");
const lightwallet = require("eth-lightwallet");
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log("running at..." + port);
});

//? Step1. lightwallet 모듈을 사용하여 랜덤한 니모닉 코드를 생성하기
app.post("/getMnemonic", async (req, res) => {
  let mnemonic;
  try {
    mnemonic = lightwallet.keystore.generateRandomSeed();
    res.json({ mnemonic });
  } catch (err) {
    console.log(err);
  }
});

//? Step2. 니모닉 코드와 패스워드를 이용해 keystore와 address를 생성하기
app.post("/getWallet", async (req, res) => {
  let password = req.body.password;
  let mnemonic = req.body.mnemonic;

  try {
    lightwallet.keystore.createVault(
      {
        password: password,
        seedPhrase: mnemonic,
        hdPathString: "m/0'/0'/0'",
      },
      function (err, ks) {
        ks.keyFromPassword(password, function (err, pwDerivedKey) {
          ks.generateNewAddress(pwDerivedKey, 1);

          let address = ks.getAddresses().toString();
          let keystore = ks.serialize();

          fs.writeFile("wallet.json", keystore, function (err, data) {
            if (err) {
              res.json({ message: "실패" });
            } else {
              res.json({ address });
            }
          });
        });
      }
    );
  } catch (exception) {
    console.log("NewWallet ===>>>" + exception);
  }
});
