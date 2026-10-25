# Catalogue de formations ARI

- Les contenus français et anglais sont regroupés dans `assets/formations-data.js`.
- `assets/formations.js` construit le catalogue et les fiches depuis ces données.
- Le formulaire utilise le type `catalogue` déjà pris en charge par `contact.php`.
- La sélection est conservée dans le navigateur, sans donnée personnelle.
- Après une modification du contenu, régénérer les deux PDF avec :

```sh
python3 tools/build_training_catalogue.py
```

Le script nécessite ReportLab et les polices système DejaVu. Les PDF doivent être
vérifiés après génération et publiés dans le même commit que leurs données source.
Les durées, modalités, prérequis, tarifs et évaluations restent à définir avec ARI.
Les programmes et livrables complémentaires sont des trames proposées.
