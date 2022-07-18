# Projet 3 : DAPP
---

Pour cet exercice consistant à créer une dapp ce basant sur le smart contract Voting.sol des exercices précédent, je suis parti d'une react app classique combinée à hardhat et ethers.js. Le smart contract a été modifié pour éviter la faille DoS gaslimit et a été commenté au format NatSpec et la documentation a été générée dans contracts/doc.

---

## Préambule - Déploiement

En utilisant la commande :
```
npx hardhat run scripts/deploys.js
````
On déploie notre smart contract, par défaut sur ganache, mais on peut préciser [--network ropsten] ou autre pour déployer sur un réseau de test. L'adresse et l'abi sont enregistré dans des fichiers JSON que notre app vient récupérer pour instancier le contrat.

---

## Elements attendus

- Vidéo de présentation : https://youtu.be/vIjT7ZQaE74
- Lien Github Pages : https://AdieuBerthe.github.io/Dapp-Voting/
- Addresse du contrat sur Ropsten : [0xaBE0479985aa0A5c06eB6DbBe3e9b2d8eB9DF4c8](https://ropsten.etherscan.io/address/0xaBE0479985aa0A5c06eB6DbBe3e9b2d8eB9DF4c8)

---

