# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/cdn-v1.0.0...cdn-v1.1.0) (2026-09-07)


### Features

* **ciszubot:** bot lists, widgets, donaciones, banderas y 7 comandos nuevos (v3.1.0) ([6f2fa27](https://github.com/Ciszu-Network/CiszuNetwork/commit/6f2fa279ff1ffe2dc47f69d34ee296375e9f3acc))


### Bug Fixes

* assets avif 400 (deliveryVariants sin avif por defecto, webp+original), turnstile preload, favicon cache-bust v=2, tsconfig excluye seo ([664a327](https://github.com/Ciszu-Network/CiszuNetwork/commit/664a3270930befc5ef0137e12ec40b34c4b1e7ae))
* CDN path resolveIcon, logos usan resolveAssetPath(), vercel.json muzicmania, prebuild copia content ([d0cfd51](https://github.com/Ciszu-Network/CiszuNetwork/commit/d0cfd513b026c115de3184e9020f0ef3ed4164a9))
* **cdn:** evitar duplicar la base en AssetResolver con URLs absolutas; ciszukoantony: rutas relativas en SmartImage (fix 400) y colores lavanda en PDWA/Turnstile ([a0a638b](https://github.com/Ciszu-Network/CiszuNetwork/commit/a0a638b864336cef8eb6a37c5b7d81692a8da854))
* **iconos:** elimina DOMPurify del render en cliente (vacia fragmentos &lt;path&gt; -&gt; &lt;g&gt;&lt;/g&gt; al navegar) + encodePath en resolver (rutas con espacio tipo 'not outline' rompian preload y src de logos) ([3c07693](https://github.com/Ciszu-Network/CiszuNetwork/commit/3c07693f54a38633b9d4b869eec8bced5c71f948))
