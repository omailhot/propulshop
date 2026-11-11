# Catalogue du Propulshop

Un fichier markdown par produit, dans `content/products/`. Le nom du fichier
sert d'identifiant (`hoodie.md` devient le produit `hoodie`).

Chaque fichier a deux parties: un bloc de données entre deux lignes `---`
(le frontmatter, en YAML), puis la description en markdown.

```md
---
name: Hoodie
category: wearables
price: 65
supplier: fournisseur-b
order: 10
colors:
  - id: black
    name: Noir
    hex: "#1F1F1F"
    sku: black-hoodie
    images:
      - /merch/hoodie-noir.png
  - id: beige
    name: Beige
    hex: "#D8C8AE"
    sku: beige-hoodie
    images:
      - /merch/hoodie-beige.png
sizes: [XS, S, M, L, XL, 2XL, 3XL]
---

La description, en **markdown**: paragraphes, listes à puces, gras, italique.
```

## Les champs

| Champ | Requis | Rôle |
|---|---|---|
| `name` | oui | Nom affiché. `name_en` est facultatif. |
| `category` | oui | `wearables`, `desk`, `travel`, `lifestyle` ou `giftcard`. |
| `price` | oui | Prix unitaire, taxes comprises. |
| `supplier` | oui | `printeez` ou `fournisseur-b` (liste dans `src/config/suppliers.ts`). Sert au résumé de commande du mode admin. |
| `order` | non | Position dans le catalogue, en ordre croissant. |
| `colors` | non | Une pastille par couleur (voir plus bas). |
| `sizes` | non | Liste des tailles, ex. `[S, M, L]`. |
| `options` | non | Autres choix, ex. le visuel imprimé. |
| `images` | non | Images communes à toutes les variantes. |
| `id` | non | Identifiant, si différent du nom du fichier. |
| `description_en` | non | Description anglaise. |

## Couleurs: un produit, plusieurs pastilles

Un produit offert en plusieurs couleurs est UN seul fichier, avec une entrée
par couleur sous `colors`. Chaque couleur a:

- `id`: identifiant court, ex. `black`;
- `name`: nom affiché sous la pastille;
- `hex`: couleur de la pastille, entre guillemets, ex. `"#1F1F1F"`;
- `images`: les photos de CETTE couleur, montrées quand la pastille est choisie;
- `sku` (facultatif): l'identifiant d'article transmis dans la commande.
  Utile quand le fournisseur traite chaque couleur comme un article distinct.

## Images liées à une combinaison

Pour une photo qui illustre une combinaison précise (couleur ET visuel),
utiliser la forme détaillée sous `images`:

```yaml
images:
  - { src: /merch/yeti_black_2.png, when: { color: black, Image: logo } }
  - /merch/yeti-rambler-model-1.png   # sans `when`: toujours montrée
```

Les fichiers d'images vont dans `public/merch/`.

## Validation

Les fiches sont vérifiées à la compilation. Un champ manquant ou invalide
arrête `deno task dev` et `deno task build` avec un message qui nomme le
fichier et le champ, par exemple:

```
[produit hoodie.md] « supplier » est requis et doit valoir l'une de: printeez, fournisseur-b
```

## Montant du crédit et date limite

Ils ne sont pas dans ce dossier: voir `src/config/edition.ts`.
