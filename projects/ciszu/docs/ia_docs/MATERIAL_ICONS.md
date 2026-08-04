# Material Icon Theme — Catálogo completo (v5.36.1)

> Documento GENERADO por `scripts/generate-material-icons-doc.js` — no editar a mano.
> Fuente oficial: [PKief/vscode-material-icon-theme](https://github.com/PKief/vscode-material-icon-theme) (branch `main`).
> Regenerar con: `node scripts/generate-material-icons-doc.js` (usa cache en `.opencode-tmp/material-icons-theme/`; `--force` re-descarga).

## 1. Cómo funciona el tema

- **Folder icons**: se asignan por **nombre de carpeta** (`folderNames`). Si el nombre coincide con la lista de un icono, VS Code pinta ese icono automáticamente. Las listas se comprueban en orden; si ninguna coincide, se usa el icono genérico `folder`.
- **File icons**: se asignan por **extensión** (`fileExtensions`) o **nombre de archivo** (`fileNames`, incluye dotfiles). Los patrones con punto (p.ej. `ts.map`, `js.snap`) matchean el sufijo completo del nombre, no solo la extensión.
- **Icon packs** (`enabledFor`): algunos iconos solo se activan si el pack correspondiente está habilitado en la config (`material-icon-theme.activeIconPack`). En el repo se usa el pack por defecto (ninguno activo), así que los iconos "Solo packs" NO se aplican.
- **Clones**: un icono puede clonar la forma de otro con otro color (`clone: { base, color }`) — en las tablas se indica `base (clone → name)`.

## 2. Sobrescritura de iconos (settings.json)

En `E:\Ciszu Network\.vscode\settings.json` se puede forzar el icono de una carpeta concreta:

```jsonc
"material-icon-theme.folders.associations": {
  // key = nombre exacto de la carpeta, value = nombre del folder icon (sin prefijo "folder-")
  "logos": "images",
  "gif": "video",   // las carpetas "gif" sin config se verían genéricas
  "samples": "examples"
}
```

El `value` debe ser un nombre de la columna "Icono" de la tabla de folder icons de abajo (p.ej. `images`, `video`, `audio`, `theme`, `examples`, `animation`, `svg`).

## 3. Estado actual del repo (4 ago 2026)

| Carpeta | Icono aplicado | Cómo |
|---|---|---|
| `images`, `icons` | `folder-images` | match por defecto (`image(s)`, `img(s)`, `icon(s)`, ...) |
| `logos`, `banners`, `thumbnails`, `flyers`, `isotype`, `logotype`, `imagotype`, `not-outline`, `outline`, `background`, `contour`, `horizontal`, `vertical`, `tagline`, `no-tagline`, `holidays`, `persons` | `folder-images` | asociación en settings.json |
| `gif`, `gifs`, `long-videos` | `folder-video` | asociación en settings.json |
| `video(s)`, `media` | `folder-video` | match por defecto |
| `music`, `audio` | `folder-audio` | match por defecto |
| `albums` | `folder-audio` | asociación en settings.json |
| `gradient`, `monochrome`, `mc_skin` | `folder-theme` | asociación en settings.json |
| `color(s)`, `design(s)`, `palette(s)`, `theme(s)` | `folder-theme` | match por defecto |
| `samples` | `folder-examples` | match por defecto (`sample(s)`) |
| `sketches` | `folder-mock` | match por defecto (`sketch(es)`) |
| `arrowskins`, `particleskins` | `folder-animation` | asociación en settings.json |
| `others`, `misc`, `extra(s)` | `folder-other` | match por defecto |
| `events` | `folder-event` | match por defecto |
| `resources` | `folder-resource` | match por defecto |
| `styles` | `folder-css` | match por defecto (`style(s)`) |

## 4. TODOS los folder icons (287)

| Icono | Nombres de carpeta que matchean | Activación | Pack |
| --- | --- | --- | --- |
| folder-rust | rust, cargo | Siempre | — |
| folder-robot | bot, bots, robot, robots, agent, agents | Siempre | — |
| folder-src | src, srcs, source, sources, code | Siempre | — |
| folder-dist | dist, out, output, outputs, build, builds, release, bin, distribution, built, compiled | Siempre | — |
| folder-css | css, stylesheet, stylesheets, style, styles | Siempre | — |
| folder-sass | sass, scss | Siempre | — |
| folder-television | tv, television | Siempre | — |
| folder-desktop | desktop, display | Siempre | — |
| folder-console | console, xbox, ps4, ps5, switch, game, games | Siempre | — |
| folder-images | images, image, imgs, img, icons, icon, icos, ico, figures, figure, figs, fig, screenshot, screenshots, screengrab, screengrabs, pic, pics, picture, pictures, photo, photos, photograph, photographs, texture, textures | Siempre | — |
| folder-scripts | script, scripts, scripting, xtask | Siempre | — |
| folder-node | node, nodejs, node_modules | Siempre | — |
| folder-javascript | js, javascript, javascripts, cjs, mjs | Siempre | — |
| folder-json | json, jsons, jsonc, jsonl | Siempre | — |
| folder-font | font, fonts, typeface, typefaces | Siempre | — |
| folder-bower | bower_components | Siempre | — |
| folder-test | test, tests, testing, snapshots, spec, specs, testfiles | Siempre | — |
| folder-directive | directive, directives | Siempre | — |
| folder-jinja | jinja, jinja2, j2 | Siempre | — |
| folder-markdown | markdown, md | Siempre | — |
| folder-pdm | pdm-plugins, pdm-build | Siempre | — |
| folder-php | php | Siempre | — |
| folder-phpmailer | phpmailer | Siempre | — |
| folder-sublime | sublime | Siempre | — |
| folder-docs | doc, docs, document, documents, documentation, post, posts, article, articles, wiki, news, blog, knowledge, diary, note, notes | Siempre | — |
| folder-gh-workflows | github/workflows | Siempre | — |
| folder-gh-workflows (clone → folder-gitea-workflows) | gitea/workflows | Siempre | — |
| folder-git | git, patches, githooks, submodules | Siempre | — |
| folder-github | github | Siempre | — |
| folder-gitea | gitea | Siempre | — |
| folder-gitlab | gitlab | Siempre | — |
| folder-forgejo | forgejo | Siempre | — |
| folder-vscode | vscode, vscode-test | Siempre | — |
| folder-views | view, views, screen, screens, page, pages, public_html, html | Siempre | — |
| folder-vue | vue | Siempre | — |
| folder-vuepress | vuepress | Siempre | — |
| folder-expo | expo, expo-shared | Siempre | — |
| folder-config | cfg, cfgs, conf, confs, config, configs, configuration, configurations, setting, settings, META-INF, option, options, pref, prefs, preference, preferences, props, properties | Siempre | — |
| folder-i18n | i18n, internationalization, lang, langs, language, languages, locale, locales, l10n, localization, translation, translate, translations, tx | Siempre | — |
| folder-components | components, widget, widgets, fragments | Siempre | — |
| folder-verdaccio | verdaccio | Siempre | — |
| folder-aurelia | aurelia_project | Siempre | — |
| folder-resource | resource, resources, res, asset, assets, static, report, reports | Siempre | — |
| folder-lib | lib, libs, library, libraries, vendor, vendors, thirdparty, third-party, lib64, external, externals, crates | Siempre | — |
| folder-theme | themes, theme, color, colors, colour, colours, design, designs, palette, palettes | Siempre | — |
| folder-webpack | webpack | Siempre | — |
| folder-global | global | Siempre | — |
| folder-public | public, www, wwwroot, web, website, websites, site, browser, browsers, proxy | Siempre | — |
| folder-include | inc, include, includes, partial, partials, inc64 | Siempre | — |
| folder-docker | docker, dockerfiles, dockerhub | Siempre | — |
| folder-nginx | nginx | Siempre | — |
| folder-ngrx-store | store | Solo packs | ver abajo |
| folder-ngrx-store (clone → folder-ngrx-effects) | effects | Solo packs | ver abajo |
| folder-ngrx-store (clone → folder-ngrx-state) | states, state | Solo packs | ver abajo |
| folder-ngrx-store (clone → folder-ngrx-reducer) | reducers, reducer | Solo packs | ver abajo |
| folder-ngrx-store (clone → folder-ngrx-actions) | actions | Solo packs | ver abajo |
| folder-ngrx-store (clone → folder-ngrx-entities) | entities | Solo packs | ver abajo |
| folder-ngrx-store (clone → folder-ngrx-selectors) | selectors | Solo packs | ver abajo |
| folder-redux-reducer | reducers, reducer, redux-reducer, redux-reducers | Solo packs | ver abajo |
| folder-redux-reducer (clone → folder-redux-actions) | actions | Solo packs | ver abajo |
| folder-redux-reducer (clone → folder-redux-toolkit) | redux, redux-toolkit | Solo packs | ver abajo |
| folder-redux-reducer (clone → folder-redux-selector) | selectors, selector | Solo packs | ver abajo |
| folder-redux-reducer (clone → folder-redux-store) | store, stores | Solo packs | ver abajo |
| folder-react-components | components, react, jsx, reactjs, react-components | Solo packs | ver abajo |
| folder-astro | astro | Siempre | — |
| folder-database | db, data, database, databases, sql | Siempre | — |
| folder-migrations | migrations, migration | Siempre | — |
| folder-log | log, logs, logging | Siempre | — |
| folder-target | target | Siempre | — |
| folder-temp | temp, tmp, cached, cache | Siempre | — |
| folder-aws | aws, azure, gcp | Siempre | — |
| folder-audio | aud, auds, audio, audios, music, song, songs, sound, sounds, voice, voices, recordings, playlist, playlists | Siempre | — |
| folder-video | vid, vids, video, videos, movie, movies, media | Siempre | — |
| folder-kubernetes | kubernetes, k8s | Siempre | — |
| folder-import | import, imports, imported | Siempre | — |
| folder-export | export, exports, exported | Siempre | — |
| folder-wakatime | wakatime | Siempre | — |
| folder-circleci | circleci | Siempre | — |
| folder-wordpress | wordpress-org, wp-content | Siempre | — |
| folder-gradle | gradle | Siempre | — |
| folder-coverage | coverage, nyc-output, nyc_output, e2e, it, integration-test, integration-tests | Siempre | — |
| folder-class | class, classes, model, models, schemas, schema | Siempre | — |
| folder-other | other, others, misc, miscellaneous, extra, extras, etc | Siempre | — |
| folder-lua | lua | Siempre | — |
| folder-turborepo | turbo | Siempre | — |
| folder-typescript | typescript, ts, typings, @types, types, cts, mts | Siempre | — |
| folder-graphql | graphql, gql | Siempre | — |
| folder-routes | routes, router, routers, navigation, navigations, routing | Siempre | — |
| folder-ci | ci | Siempre | — |
| folder-eslint | eslint, eslint-plugin, eslint-plugins, eslint-config, eslint-configs | Siempre | — |
| folder-benchmark | benchmark, benchmarks, bench, benches, performance, perf, profiling, measure, measures, measurement | Siempre | — |
| folder-messages | messages, messaging, forum, chat, chats, conversation, conversations, dialog, dialogs | Siempre | — |
| folder-less | less | Siempre | — |
| folder-gulp | gulp, gulp-tasks, gulpfile.js, gulpfile.mjs, gulpfile.ts, gulpfile.babel.js, gulpfiles | Siempre | — |
| folder-python | python, pycache, pytest_cache | Siempre | — |
| folder-r | r | Siempre | — |
| folder-sandbox | sandbox, sandboxes, playground, playgrounds | Siempre | — |
| folder-scons | scons, sconf_temp, scons_cache | Siempre | — |
| folder-mojo | mojo | Siempre | — |
| folder-moon | moon | Siempre | — |
| folder-debug | debug, debugger, debugging | Siempre | — |
| folder-fastlane | fastlane | Siempre | — |
| folder-plugin | plugin, plugins, mod, mods, modding, extension, extensions, addon, addons, addin, addins, module, modules | Siempre | — |
| folder-middleware | middleware, middlewares | Siempre | — |
| folder-controller | controller, controllers, controls, service, services, provider, providers, handler, handlers | Siempre | — |
| folder-ansible | ansible | Siempre | — |
| folder-server | server, servers, backend, backends, inventory, inventories, infrastructure, infra | Siempre | — |
| folder-client | client, clients, frontend, frontends, pwa, spa | Siempre | — |
| folder-tasks | tasks, tickets | Siempre | — |
| folder-android | android | Siempre | — |
| folder-ios | ios | Siempre | — |
| folder-ui | presentation, gui, ui, ux | Siempre | — |
| folder-upload | uploads, upload | Siempre | — |
| folder-download | downloads, download, downloader, downloaders | Siempre | — |
| folder-tools | tools, toolkit, toolkits, toolbox, toolboxes, tooling, devtools, kit, kits | Siempre | — |
| folder-helper | helpers, helper | Siempre | — |
| folder-serverless | serverless | Siempre | — |
| folder-api | api, apis, restapi | Siempre | — |
| folder-app | app, apps, application, applications | Siempre | — |
| folder-apollo | apollo, apollo-client, apollo-cache, apollo-config | Siempre | — |
| folder-archive | arc, arcs, archive, archives, archival | Siempre | — |
| folder-backup | bkp, bkps, bak, baks, backup, backups, back-up, back-ups, history, histories | Siempre | — |
| folder-batch | batch, batchs, batches | Siempre | — |
| folder-buildkite | buildkite | Siempre | — |
| folder-cluster | cluster, clusters | Siempre | — |
| folder-command | command, commands, commandline, cmd, cli, clis | Siempre | — |
| folder-constant | constant, constants, const, consts | Siempre | — |
| folder-container | container, containers, devcontainer | Siempre | — |
| folder-content | content, contents | Siempre | — |
| folder-context | context, contexts | Siempre | — |
| folder-core | core | Siempre | — |
| folder-delta | delta, deltas, changes | Siempre | — |
| folder-dump | dump, dumps | Siempre | — |
| folder-examples | demo, demos, example, examples, sample, samples, sample-data | Siempre | — |
| folder-environment | env, envs, environment, environments, venv | Siempre | — |
| folder-functions | func, funcs, function, functions, lambda, lambdas, logic, math, maths, calc, calcs, calculation, calculations, composable, composables | Siempre | — |
| folder-generator | generator, generators, generated, cfn-gen, gen, gens, auto | Siempre | — |
| folder-hook | hook, hooks | Siempre | — |
| folder-trigger | trigger, triggers | Siempre | — |
| folder-job | job, jobs | Siempre | — |
| folder-keys | key, keys, token, tokens, jwt, secret, secrets | Siempre | — |
| folder-layout | layout, layouts | Siempre | — |
| folder-mail | mail, mails, email, emails, smtp, mailers | Siempre | — |
| folder-mappings | mappings, mapping | Siempre | — |
| folder-meta | meta, metadata | Siempre | — |
| folder-changesets | changesets, changeset | Siempre | — |
| folder-packages | package, packages, pkg, pkgs, serverpackages, devpackages, dependencies | Siempre | — |
| folder-shared | shared, common | Siempre | — |
| folder-shader | glsl, hlsl, shader, shaders | Siempre | — |
| folder-stack | stack, stacks | Siempre | — |
| folder-template | template, templates, github/ISSUE_TEMPLATE, github/PULL_REQUEST_TEMPLATE | Siempre | — |
| folder-utils | util, utils, utility, utilities | Siempre | — |
| folder-supabase | supabase | Siempre | — |
| folder-private | private | Siempre | — |
| folder-linux | linux, linuxbsd, unix, wsl, ubuntu, deb, debian, deepin, centos, popos, mint | Siempre | — |
| folder-windows | windows, win, win32, windows11, windows10, windowsxp, windowsnt, win11, win10, winxp, winnt | Siempre | — |
| folder-macos | macos, mac, osx, DS_Store, iPhone, iPad, iPod, macbook, macbook-air, macosx, apple | Siempre | — |
| folder-error | error, errors, err, errs, crash, crashes | Siempre | — |
| folder-event | event, events | Siempre | — |
| folder-secure | auth, authentication, secure, security, cert, certs, certificate, certificates, ssl, cipher, cypher, tls | Siempre | — |
| folder-custom | custom, customs | Siempre | — |
| folder-mock | draft, drafts, mock, mocks, fixture, fixtures, concept, concepts, sketch, sketches | Siempre | — |
| folder-syntax | syntax, syntaxes, spellcheck, spellcheckers | Siempre | — |
| folder-vm | vm, vms | Siempre | — |
| folder-stylus | stylus | Siempre | — |
| folder-flow | flow-typed | Siempre | — |
| folder-rules | rule, rules, validation, validations, validator, validators | Siempre | — |
| folder-review | review, reviews, revisal, revisals, reviewed, preview, previews | Siempre | — |
| folder-animation | anim, anims, animation, animations, animated, motion, motions, transition, transitions, easing, easings | Siempre | — |
| folder-guard | guard, guards | Siempre | — |
| folder-prisma | prisma, prisma/schema | Siempre | — |
| folder-pipe | pipe, pipes, pipeline, pipelines | Siempre | — |
| folder-interceptor | interceptor, interceptors | Siempre | — |
| folder-svg | svg, svgs, vector, vectors | Siempre | — |
| folder-vuex-store | store, stores | Solo packs | ver abajo |
| folder-nuxt | nuxt | Siempre | — |
| folder-vue-directives | directives | Solo packs | ver abajo |
| folder-vue | components | Solo packs | ver abajo |
| folder-terraform | terraform | Siempre | — |
| folder-mobile | mobile, mobiles, portable, portability, phone, phones | Siempre | — |
| folder-stencil | stencil | Siempre | — |
| folder-firebase | firebase | Siempre | — |
| folder-firestore | firestore, cloud-firestore, firebase-firestore | Siempre | — |
| folder-cloud-functions | cloud-functions, cloudfunctions, firebase-cloud-functions, firebase-cloudfunctions | Siempre | — |
| folder-svelte | svelte, svelte-kit | Siempre | — |
| folder-update | update, updates, upgrade, upgrades | Siempre | — |
| folder-intellij | idea | Siempre | — |
| folder-azure-pipelines | azure-pipelines, azure-pipelines-ci | Siempre | — |
| folder-mjml | mjml | Siempre | — |
| folder-admin | admin, admins, manager, managers, moderator, moderators | Siempre | — |
| folder-jupyter | jupyter, notebook, notebooks, ipynb | Siempre | — |
| folder-scala | scala | Siempre | — |
| folder-connection | connection, connections, integration, integrations, remote, remotes | Siempre | — |
| folder-quasar | quasar | Siempre | — |
| folder-next | next | Siempre | — |
| folder-dal | dal, data-access, data-access-layer | Siempre | — |
| folder-cobol | cobol | Siempre | — |
| folder-yarn | yarn | Siempre | — |
| folder-husky | husky | Siempre | — |
| folder-storybook | storybook, stories | Siempre | — |
| folder-base | base, bases | Siempre | — |
| folder-cart | cart, shopping-cart, shopping, shop | Siempre | — |
| folder-home | home, start, main, landing | Siempre | — |
| folder-project | project, projects, proj, projs | Siempre | — |
| folder-prompts | prompt, prompts | Siempre | — |
| folder-interface | interface, interfaces | Siempre | — |
| folder-netlify | netlify | Siempre | — |
| folder-enum | enum, enums | Siempre | — |
| folder-contract | pact, pacts, contract, contracts, contract-testing, contract-test, contract-tests | Siempre | — |
| folder-helm | helm, helmchart, helmcharts | Siempre | — |
| folder-queue | queue, queues, bull, mq | Siempre | — |
| folder-vercel | vercel, now | Siempre | — |
| folder-cypress | cypress | Siempre | — |
| folder-decorators | decorator, decorators | Siempre | — |
| folder-java | java | Siempre | — |
| folder-resolver | resolver, resolvers | Siempre | — |
| folder-angular | angular | Siempre | — |
| folder-unity | unity | Siempre | — |
| folder-pdf | pdf, pdfs | Siempre | — |
| folder-proto | protobuf, protobufs, proto, protos | Siempre | — |
| folder-plastic | plastic | Siempre | — |
| folder-gamemaker | gamemaker, gamemaker2 | Siempre | — |
| folder-mercurial | hg, hghooks, hgext | Siempre | — |
| folder-godot | godot, godot-cpp | Siempre | — |
| folder-lottie | lottie, lotties, lottiefiles | Siempre | — |
| folder-taskfile | taskfile, taskfiles | Siempre | — |
| folder-drizzle | drizzle | Siempre | — |
| folder-cloudflare | cloudflare | Siempre | — |
| folder-seeders | seeds, seeders, seed, seeding | Siempre | — |
| folder-store | store, stores | Solo packs | ver abajo |
| folder-bicep | bicep | Siempre | — |
| folder-snapcraft | snap, snapcraft | Siempre | — |
| folder-src (clone → folder-development) | dev, development | Siempre | — |
| folder-flutter | flutter | Siempre | — |
| folder-snippet | snippet, snippets | Siempre | — |
| folder-element | element, elements | Siempre | — |
| folder-src-tauri | src-tauri | Siempre | — |
| folder-favicon | favicon, favicons | Siempre | — |
| folder-features | feature, features, feat, feats | Siempre | — |
| folder-lefthook | lefthook, lefthook-local | Siempre | — |
| folder-bloc | bloc, cubit, blocs, cubits | Siempre | — |
| folder-powershell | powershell, ps, ps1 | Siempre | — |
| folder-repository | repository, repositories, repo, repos | Siempre | — |
| folder-luau | luau | Siempre | — |
| folder-obsidian | obsidian | Siempre | — |
| folder-trash | trash | Siempre | — |
| folder-cline | cline_docs | Siempre | — |
| folder-liquibase | liquibase | Siempre | — |
| folder-dart | dart, dart_tool, dart_tools | Siempre | — |
| folder-zeabur | zeabur | Siempre | — |
| folder-kusto | kusto, kql | Siempre | — |
| folder-policy | policy, policies | Siempre | — |
| folder-attachment | attachment, attachments | Siempre | — |
| folder-bibliography | bibliography, bibliographies, book, books | Siempre | — |
| folder-link | link, links | Siempre | — |
| folder-pytorch | pytorch, torch | Siempre | — |
| folder-blender | blender, blender-assets, blender-files, blender-project, blender-models | Siempre | — |
| folder-atom | atoms, atom | Siempre | — |
| folder-molecule | molecules, molecule | Siempre | — |
| folder-organism | organisms, organism | Siempre | — |
| folder-claude | claude | Siempre | — |
| folder-cursor | cursor | Siempre | — |
| folder-gemini-ai | gemini, gemini-ai, geminiai | Siempre | — |
| folder-opencode | opencode | Siempre | — |
| folder-input | input, inputs, io, in | Siempre | — |
| folder-salt | salt, saltstack | Siempre | — |
| folder-simulations | simulations, simulation, sim, sims | Siempre | — |
| folder-metro | metro | Siempre | — |
| folder-filter | filter, filters | Siempre | — |
| folder-toc | toc, table-of-contents | Siempre | — |
| folder-cue | cue, cues | Siempre | — |
| folder-license | license, licenses | Siempre | — |
| folder-form | form, forms | Siempre | — |
| folder-archive (clone → folder-deprecated) | deprecated | Siempre | — |
| folder-trash (clone → folder-scrap) | scrap | Siempre | — |
| folder-postman | postman | Siempre | — |
| folder-skills | skill, skills | Siempre | — |
| folder-meta (clone → folder-instructions) | instruction, instructions | Siempre | — |
| folder-zed | zed | Siempre | — |
| folder-appwrite | appwrite | Siempre | — |
| folder-assembly | assembly, asm | Siempre | — |
| folder-go | go, golang | Siempre | — |
| folder-expo (clone → folder-eas) | eas | Siempre | — |
| folder-kotlin | kotlin | Siempre | — |
| folder-database (clone → folder-redis) | redis, redis-db, redislabs | Siempre | — |
| folder | — | Siempre | — |
| folder-root | — | Siempre | — |

> `—` en "Nombres" significa que el icono NO tiene matches por defecto (solo se activa vía asociación manual o subcarpeta especial).
> "Solo packs" = requiere pack activo (no aplica en este repo salvo pack por defecto). 17 iconos de 287 requieren pack.

## 5. TODOS los file icons (611)

| Icono | Extensiones | Nombres de archivo | Variante | Activación |
| --- | --- | --- | --- | --- |
| html | htm, xhtml, html_vm, asp, html, aspx, jshtm, rhtml, shtml, volt, xht | — | — | — |
| pug | jade, pug | .pug-lintrc, .pug-lintrc.js, .pug-lintrc.json | — | — |
| markdown | md, markdown, rst, copilotmd, litcoffee, markdn, mdown, mdtext, mdtxt, mdwn, mkd, mkdn, ronn, workbook | — | — | — |
| blink | blink | — | light | — |
| css | css | — | — | — |
| sass | scss, sass | — | — | — |
| less | less | — | — | — |
| just | — | justfile, .justfile | — | — |
| json | json, jsonc, tsbuildinfo, json5, jsonl, ndjson, geojson, har, jsonld, webmanifest, ts.map | .jscsrc, .jshintrc, composer.lock, .jsbeautifyrc, .esformatter, cdp.pid, .whitesource | — | — |
| json_schema | schema.json | — | — | — |
| hjson | hjson | — | — | — |
| jinja | jinja, jinja2, j2, jinja-html | — | light | — |
| proto | proto | — | — | — |
| prompt | prompt.md, prompts.md | — | — | — |
| playwright | — | playwright.config.js, playwright.config.cjs, playwright.config.mjs, playwright.config.ts, playwright.config.cts, playwright.config.mts, playwright.config.base.js, playwright.config.base.cjs, playwright.config.base.mjs, playwright.config.base.ts, playwright.config.base.cts, playwright.config.base.mts, playwright-ct.config.js, playwright-ct.config.cjs, playwright-ct.config.mjs, playwright-ct.config.ts, playwright-ct.config.cts, playwright-ct.config.mts | — | — |
| sublime | sublime-project, sublime-workspace | — | — | — |
| simulink | slx | — | — | — |
| quarto | qmd | — | — | — |
| twine | tw, twee | — | — | — |
| yaml | yml.dist, yaml.dist, YAML-tmLanguage, yaml, yml, cff, eyaml, eyml, winget, yaml-tmpreferences, yaml-tmtheme | — | — | — |
| xml | xml, plist, xsd, dtd, xsl, xslt, resx, iml, xquery, tmLanguage, manifest, project, xml.dist, xml.dist.sample, dmn, jrxml, xmp, ascx, atom, axaml, axml, bpmn, csl, csproj.user, dita, ditamap, dtml, ent, fxml, isml, jmx, launch, menu, opml, owl, proj, publishsettings, pubxml, pubxml.user, rdf, rng, rss, shproj, storyboard, targets, tld, tmx, vbproj, vbproj.user, wsdl, wxi, wxl, wxs, xbl, xib, xliff, xoml, xpdl, xul | .htaccess | — | — |
| toml | toml | — | light | — |
| toon | toon | — | — | — |
| image | png, jpeg, jpg, gif, ico, tif, tiff, ami, apx, avif, bmp, bpg, brk, cur, dds, exr, fpx, gbr, img, jbig2, jb2, jng, jxl, jxr, pgf, pic, raw, webp, eps, afphoto, ase, aseprite, clip, cpt, heif, heic, kra, mdp, ora, pdn, reb, sai, tga, xcf, jfif, ppm, pbm, pgm, pnm, icns, 3fr, ari, arw, bay, braw, crw, cr2, cr3, cap, data, dcs, dcr, dng, drf, eip, erf, fff, gpr, iiq, k25, kdc, mdc, mef, mos, mrw, nef, nrw, obm, orf, pef, ptx, pxn, r3d, raf, rwl, rw2, rwz, sr2, srf, srw, x3f, ktx, ktx2 | — | — | — |
| palette | pal, gpl, act | — | — | — |
| javascript | esx, mjs, js, cjs, es6, pac | jakefile | — | — |
| react | jsx | — | — | — |
| react_ts | tsx | — | — | — |
| rocket | — | .release-it.json, .release-it.ts, .release-it.js, .release-it.cjs, .release-it.yaml, .release-it.yml, .release-it.toml, release.toml, release-plz.toml, .release-plz.toml | — | — |
| routing | routing.ts, routing.tsx, routing.js, routing.jsx, route.ts, route.tsx, route.js, route.jsx, routes.ts, routes.tsx, routes.js, routes.jsx | router.js, router.jsx, router.ts, router.tsx, route.js, route.jsx, route.ts, route.tsx, routes.js, routes.jsx, routes.ts, routes.tsx | — | Solo packs |
| redux-action | action.js, actions.js, action.ts, actions.ts | action.js, actions.js, action.ts, actions.ts | — | Solo packs |
| redux-reducer | reducer.js, reducers.js, reducer.ts, reducers.ts | reducer.js, reducers.js, reducer.ts, reducers.ts | — | Solo packs |
| redux-selector | selector.js, selectors.js, selector.ts, selectors.ts | selector.js, selectors.js, selector.ts, selectors.ts | — | Solo packs |
| redux-store | store.js, store.ts | store.js, store.ts | — | Solo packs |
| settings | ini, dlc, config, conf, properties, prop, settings, option, props, prefs, sln.dotsettings, sln.dotsettings.user, cfg, cnf, tool-versions, directory, mak, npmrc, repo | .jshintignore, .buildignore, .mrconfig, .yardopts, manifest.mf, .clang-format, .clang-format-ignore, .clang-tidy, .conf, compile_flags.txt | — | — |
| typescript | ts, cts, mts | — | — | — |
| typescript-def | d.ts, d.cts, d.mts, d.ets | — | — | — |
| typedoc | — | typedoc.js, typedoc.json | — | — |
| markdoc | mdoc, markdoc, markdoc.md | — | — | — |
| markdoc-config | — | — | — | — |
| markojs | marko | — | — | — |
| astro | astro | — | — | — |
| astro-config | — | astro.config.js, astro.config.mjs, astro.config.cjs, astro.config.ts, astro.config.cts, astro.config.mts | — | — |
| pdf | pdf | — | — | — |
| table | xlsx, xlsm, xls, csv, tsv, psv, ods | — | — | — |
| vscode | vscodeignore, vsixmanifest, vsix, code-workplace, code-workspace, code-profile, code-snippets | — | — | — |
| visualstudio | csproj, ruleset, sln, slnf, slnx, suo, vb, vbs, vcxitems, vcxitems.filters, vcxproj, vcxproj.filters, wixproj, bas, vba | .vsconfig | — | — |
| varnish | vcl | — | — | — |
| database | pdb, sql, pks, pkb, accdb, mdb, sqlite, sqlite3, pgsql, postgres, plpgsql, psql, db, db3, dblite, dblite3, debugsymbols, odb, accde, adp, bak, bdb, dbf, fdb, feather, gdb, ibd, mdf, mde, myd, myi, ndf, orc, parquet, sdf, ldf, frm, kdbx, dsql | — | — | — |
| kusto | kql | — | — | — |
| csharp | cs, csx, csharp | — | — | — |
| qsharp | qs | — | — | — |
| zip | zip, z, tar, gz, xz, lz, liz, lzma, lzma2, lz4, lz5, lzh, lha, br, bz2, bzip2, gzip, brotli, 7z, 001, rar, far, tz, taz, tlz, txz, tgz, tpz, tbz, tbz2, zst, zstd, tzst, tzstd, cab, cpio, rpm, deb, arj, wim, swm, esd, fat, xar, ntfs, hfs, squashfs, apfs | — | — | — |
| vala | vala | — | — | — |
| zig | zig, zon | — | — | — |
| exe | exe, msi | — | — | — |
| hex | dat, bin, hex | — | — | — |
| java | java, jsp, jav | — | — | — |
| jar | jar | — | — | — |
| javaclass | class | — | — | — |
| c3 | c3 | — | — | — |
| c | c, i, mi | — | — | — |
| h | h | — | — | — |
| hip | hip | — | — | — |
| cpp | cc, cpp, cxx, c++, cp, mii, ii, cppm, c++m, ccm, cxxm, h.in, hpp.in, ipp, ixx, tpp, txx | — | — | — |
| hpp | hh, hpp, hxx, h++, hp, tcc, inl | — | — | — |
| objective-c | m | — | — | — |
| objective-cpp | mm | — | — | — |
| rc | rc | — | — | — |
| go | go | — | — | — |
| go-mod | — | go.mod, go.sum, go.work, go.work.sum | — | — |
| python | py, cpy, gyp, gypi, ipy, pyi, pyt, pyw, rpy | — | — | — |
| python-misc | pyc, whl, egg | requirements.txt, pipfile, .python-version, manifest.in, pylintrc, .pylintrc, pyproject.toml, py.typed, .coveragerc, .coverage, .scrapy, celerybeat-schedule, celerybeat.pid | — | — |
| ruff | — | ruff.toml, .ruff.toml | — | — |
| uv | — | uv.toml, .uv.toml, uv.lock | — | — |
| scons | — | sconstruct, sconscript, scsub | light | — |
| url | url | — | — | — |
| console | sh, ksh, csh, tcsh, zsh, bash, bat, cmd, awk, fish, exp, nu, xsh, bash_aliases, bash_login, bash_logout, bash_profile, bashrc, cshrc, ebuild, eclass, profile, tcshrc, xprofile, xsession, xsessionrc, yash_profile, yashrc, zlogin, zlogout, zprofile, zsh-theme, zshenv, zshrc | commit-msg, pre-commit, pre-push, post-merge, .envrc, .hushlogin, APKBUILD, PKGBUILD, bashrc_Apple_Terminal, zlogin, zlogout, zprofile, zshenv, zshrc, zshrc_Apple_Terminal | — | — |
| powershell | ps1, psm1, psd1, ps1xml, psc1, pssc, psrc | — | — | — |
| excalidraw | excalidraw, excalidraw.json, excalidraw.svg, excalidraw.png | excalidraw, excalidraw.json, excalidraw.svg, excalidraw.png | — | — |
| gradle | gradle | gradle.properties, gradlew, gradle-wrapper.properties, gradlew.bat | — | — |
| word | doc, docx, rtf, odt | — | — | — |
| certificate | cer, cert, crt | — | — | — |
| license | — | copying, copying.md, copying.rst, copying.txt, copyright, copyright.md, copyright.rst, copyright.txt, license, license-agpl, license-apache, license-bsd, license-mit, license-gpl, license-lgpl, license.md, license.rst, license.txt, licence, licence-agpl, licence-apache, licence-bsd, licence-mit, licence-gpl, licence-lgpl, licence.md, licence.rst, licence.txt | — | — |
| unlicense | — | unlicense, unlicense.txt | — | — |
| key | pub, key, pem, asc, gpg, passwd, shasum, sha256, sha256sum, sha256sums, secret | .htpasswd, sha256sums, .secrets | — | — |
| keystatic | — | keystatic.config.tsx, keystatic.config.ts, keystatic.config.jsx, keystatic.config.js | — | — |
| font | woff, woff2, ttf, eot, suit, otf, bmap, fnt, odttf, ttc, font, fonts, sui, ntf, mrf | — | — | — |
| lib | lib, a | — | — | — |
| bibliography | bib, bbl, bcf, blg | — | — | — |
| bibtex-style | bst | — | — | — |
| dll | dll, ilk, so | — | — | — |
| ruby | rb, erb, rbs, gemspec, podspec, rake, rbi, rbx, rjs, ru | .ruby-version, appraisals, berksfile, berksfile.lock, brewfile, capfile, cheffile, dangerfile, deliverfile, guardfile, gymfile, hobofile, matchfile, podfile, puppetfile, rakefile, rantfile, scanfile, snapfile, thorfile | — | — |
| gemfile | — | gemfile | — | — |
| rubocop | — | .rubocop.yml, .rubocop-todo.yml, .rubocop_todo.yml | light | — |
| rspec | — | .rspec | — | — |
| fsharp | fs, fsx, fsi, fsproj, fsscript | — | — | — |
| swift | swift, xcplayground, swiftdeps, swiftdoc, swiftmodule, swiftsourceinfo | .swift-format, .swift-version, .swiftformat | — | — |
| arduino | ino | — | — | — |
| docker | dockerignore, dockerfile, docker-compose.yml, docker-compose.yaml, containerignore, containerfile, compose.yaml, compose.yml | dockerfile, dockerfile.prod, dockerfile.production, dockerfile.alpha, dockerfile.beta, dockerfile.stage, dockerfile.staging, dockerfile.dev, dockerfile.development, dockerfile.local, dockerfile.test, dockerfile.testing, dockerfile.ci, dockerfile.web, dockerfile.windows, dockerfile.worker, docker-compose.yml, docker-compose.override.yml, docker-compose.prod.yml, docker-compose.production.yml, docker-compose.alpha.yml, docker-compose.beta.yml, docker-compose.stage.yml, docker-compose.staging.yml, docker-compose.dev.yml, docker-compose.development.yml, docker-compose.local.yml, docker-compose.test.yml, docker-compose.testing.yml, docker-compose.ci.yml, docker-compose.web.yml, docker-compose.worker.yml, docker-compose.yaml, docker-compose.override.yaml, docker-compose.prod.yaml, docker-compose.production.yaml, docker-compose.alpha.yaml, docker-compose.beta.yaml, docker-compose.stage.yaml, docker-compose.staging.yaml, docker-compose.dev.yaml, docker-compose.development.yaml, docker-compose.local.yaml, docker-compose.test.yaml, docker-compose.testing.yaml, docker-compose.ci.yaml, docker-compose.web.yaml, docker-compose.worker.yaml, containerfile, containerfile.prod, containerfile.production, containerfile.alpha, containerfile.beta, containerfile.stage, containerfile.staging, containerfile.dev, containerfile.development, containerfile.local, containerfile.test, containerfile.testing, containerfile.ci, containerfile.web, containerfile.worker, compose.yaml, compose.override.yaml, compose.prod.yaml, compose.production.yaml, compose.alpha.yaml, compose.beta.yaml, compose.stage.yaml, compose.staging.yaml, compose.dev.yaml, compose.development.yaml, compose.local.yaml, compose.test.yaml, compose.testing.yaml, compose.ci.yaml, compose.web.yaml, compose.worker.yaml, compose.yml, compose.override.yml, compose.prod.yml, compose.production.yml, compose.alpha.yml, compose.beta.yml, compose.stage.yml, compose.staging.yml, compose.dev.yml, compose.development.yml, compose.local.yml, compose.test.yml, compose.testing.yml, compose.ci.yml, compose.web.yml, compose.worker.yml | — | — |
| tex | tex, ltx, cls, clo, latex, aux, tikz, synctex, synctex.gz | — | — | — |
| tex (clone → sty) | sty | — | — | — |
| context | ctx | — | — | — |
| tex (clone → dtx) | dtx | — | — | — |
| doctex-installer | ins | — | — | — |
| bbx | bbx | — | — | — |
| cbx | cbx | — | — | — |
| lbx | lbx | — | — | — |
| latexmk | — | — | — | — |
| powerpoint | pptx, ppt, pptm, potx, potm, ppsx, ppsm, pps, ppam, ppa, odp | — | — | — |
| video | webm, mkv, flv, vob, ogv, ogg, gifv, avi, mov, qt, wmv, yuv, rm, rmvb, mp4, m4v, mpg, mp2, mpeg, mpe, mpv, m2v | — | — | — |
| virtual | vdi, vbox, vbox-prev | — | — | — |
| vedic | ved, veda, vedic | — | — | — |
| email | edb, eml, emlx, ics, mbox, msg, oft, olm, ost, p7s, pst, rpmsg, tnef | .mailmap | — | — |
| audio | 8svx, aa, aac, aax, ac3, aif, aiff, alac, amr, ape, caf, cda, cdr, dss, ec3, efs, enc, flac, flp, gp, gsm, it, m3u, m3u8, m4a, m4b, m4p, m4r, mid, mka, mmf, mod, mp3, mpc, mscz, mtm, mui, musx, mxl, nsa, opus, pkf, qcp, ra, rf64, rip, sdt, sesx, sf2, stap, tg, voc, vqf, wav, weba, wfp, wma, wpl, wproj, wv | — | — | — |
| coffee | coffee, cson, iced | — | — | — |
| document | txt | — | — | — |
| lyric | lrc | — | — | — |
| graphql | graphql, gql | .graphqlconfig | — | — |
| rust | rs, ron | — | — | — |
| raml | raml | — | — | — |
| xaml | xaml | XamlStyler.json | — | — |
| haskell | hs, lhs | — | — | — |
| happo | — | .happo.js, .happo.mjs, .happo.cjs | — | — |
| chromatic | — | chromatic.config.json | — | — |
| kotlin | kt, kts | — | — | — |
| liquid (clone → mist) | mist.js, mist.ts, mist.jsx, mist.tsx | — | — | — |
| otne | otne | — | — | — |
| git | patch | .git, .gitignore, .gitmessage, .gitignore-global, .gitignore_global, .gitattributes, .gitattributes-global, .gitattributes_global, .gitconfig, .gitmodules, .gitkeep, .keep, .gitpreserve, .gitinclude, .git-blame-ignore, .git-blame-ignore-revs, .git-for-windows-updater, git-history, COMMIT_EDITMSG, MERGE_MSG, git-rebase-todo | — | — |
| diff | diff, rej | — | — | — |
| lua | lua | .luacheckrc | — | — |
| clojure | clj, cljs, cljc, cljx, clojure, edn | — | — | — |
| groovy | groovy, gvy, nf | — | — | — |
| r | r, rmd, rhistory, rprofile, rt | .Rhistory | — | — |
| dart | dart | .pubignore | — | — |
| dart_generated | freezed.dart, g.dart | — | — | — |
| actionscript | as | — | — | — |
| mxml | mxml | — | — | — |
| autohotkey | ahk | — | — | — |
| flash | swf | — | — | — |
| adobe-swc | swc | — | — | — |
| swc | swcrc | — | — | — |
| cmake | cmake | cmakelists.txt, cmakecache.txt, CMakePresets.json | — | — |
| assembly | asm, a51, inc, nasm, s, ms, agc, ags, aea, argus, mitigus, binsource | — | — | — |
| vue | vue | — | — | — |
| semgrep | — | semgrep.yml, .semgrepignore | — | — |
| vue-config | — | vue.config.js, vue.config.cjs, vue.config.mjs, vue.config.ts, vetur.config.js, vetur.config.ts, volar.config.js, .vuerc | — | — |
| vuex-store | store.js, store.ts | store.js, store.ts | — | Solo packs |
| nuxt | — | nuxt.config.js, nuxt.config.ts, .nuxtignore, .nuxtrc | — | — |
| harmonix | — | harmonix.config.js, harmonix.config.ts | — | — |
| ocaml | ml, mli, cmx | — | — | — |
| odin | odin | — | — | — |
| onnx | onnx | — | — | — |
| javascript-map | js.map, mjs.map, cjs.map | — | — | — |
| css-map | css.map | — | — | — |
| lock | lock | security.md, security.txt, security | — | — |
| handlebars | hbs, mustache, handlebars, hjs | — | — | — |
| perl | pm, raku, pod, psgi, t | — | — | — |
| haxe | hx | — | — | — |
| test-ts | spec.ts, spec.cts, spec.mts, cy.ts, e2e-spec.ts, e2e-spec.cts, e2e-spec.mts, test.ts, test.cts, test.mts, ts.snap, spec-d.ts, test-d.ts | — | — | — |
| test-jsx | spec.tsx, test.tsx, tsx.snap, spec.jsx, test.jsx, jsx.snap, cy.jsx, cy.tsx, spec-d.tsx, test-d.tsx | — | — | — |
| test-js | spec.js, spec.cjs, spec.mjs, e2e-spec.js, e2e-spec.cjs, e2e-spec.mjs, test.js, test.cjs, test.mjs, js.snap, cy.js | — | — | — |
| angular | module.ts, module.js, ng-template | angular-cli.json, .angular-cli.json, angular.json, ng-package.json | — | Solo packs |
| angular (clone → angular-component) | component.ts, component.js | — | — | Solo packs |
| angular (clone → angular-guard) | guard.ts, guard.js | — | — | Solo packs |
| angular (clone → angular-service) | service.ts, service.js | — | — | Solo packs |
| angular (clone → angular-pipe) | pipe.ts, pipe.js, filter.js | — | — | Solo packs |
| angular (clone → angular-directive) | directive.ts, directive.js | — | — | Solo packs |
| angular (clone → angular-resolver) | resolver.ts, resolver.js | — | — | Solo packs |
| angular (clone → angular-interceptor) | interceptor.ts, interceptor.js | — | — | Solo packs |
| puppet | pp | — | — | — |
| elixir | ex, exs, eex, leex, heex | — | — | — |
| livescript | ls | — | — | — |
| erlang | erl | — | — | — |
| twig | twig | — | — | — |
| julia | jl | — | — | — |
| elm | elm | — | — | — |
| purescript | pure, purs | — | — | — |
| smarty | tpl | — | — | — |
| stylus | styl | — | — | — |
| reason | re, rei | — | — | — |
| bucklescript | cmj | — | — | — |
| merlin | merlin | — | — | — |
| verilog | vhd, vhdx, sv, svh, vhdl | — | — | — |
| mathematica | nb | — | — | — |
| wolframlanguage | wl, wls | — | — | — |
| nunjucks | njk, nunjucks | — | — | — |
| robot | robot | — | — | — |
| solidity | sol | — | — | — |
| autoit | au3 | — | — | — |
| haml | haml | — | — | — |
| yang | yang | — | — | — |
| mjml | mjml | .mjmlconfig | — | — |
| vercel | — | vercel.json, vercel.ts, .vercelignore, now.json, .nowignore | light | — |
| liara | — | liara.json, .liaraignore | — | — |
| verdaccio | — | verdaccio.yml | — | — |
| payload | — | payload.config.js, payload.config.mjs, payload.config.ts, payload.config.mts | light | — |
| next | — | next.config.js, next.config.mjs, next.config.ts, next.config.mts | light | — |
| remark | — | .remarkrc, .remarkrc.cjs, .remarkrc.js, .remarkrc.json, .remarkrc.mjs, .remarkrc.yaml, .remarkrc.yml, .remarkignore | — | — |
| remix | — | remix.config.js, remix.config.ts | light | — |
| terraform | tf, tf.json, tfvars, tfstate, tfbackend, terraformignore | — | — | — |
| opentofu | tofu | — | light | — |
| laravel | blade.php, inky.php | artisan | — | — |
| applescript | applescript, ipa | — | — | — |
| cake | cake | — | — | — |
| cucumber | feature, features | — | — | — |
| nim | nim, nimble | — | — | — |
| apiblueprint | apib, apiblueprint | — | — | — |
| riot | riot, tag | — | — | — |
| vfl | vfl | .vfl | — | — |
| kl | kl | .kl | — | — |
| postcss | pcss, sss | — | — | — |
| posthtml | — | — | — | — |
| todo | todo | todo.md, todos.md | — | — |
| coldfusion | cfml, cfc, lucee, cfm | — | — | — |
| cabal | cabal | cabal.project, cabal.project.freeze, cabal.project.local | — | — |
| nix | nix | — | — | — |
| slim | slim | — | — | — |
| http | http, rest | CNAME | — | — |
| restql | rql, restql | — | — | — |
| kivy | kv | — | — | — |
| graphcool | graphcool | project.graphcool | — | — |
| sbt | sbt | — | — | — |
| webpack | — | webpack.config.coffee | — | — |
| rstack | — | rslint.json, rslint.jsonc | — | — |
| lynx | — | — | — | — |
| ionic | — | ionic.config.json, .io-config.json | — | — |
| gulp | — | gulpfile.js, gulpfile.mjs, gulpfile.ts, gulpfile.cts, gulpfile.mts, gulpfile.babel.js, gulpfile.cjs | — | — |
| nodejs | — | package.json, package-lock.json, .nvmrc, .esmrc, .node-version | — | — |
| npm | — | .npmignore, .npmrc | — | — |
| yarn | — | .yarnrc, yarn.lock, .yarnclean, .yarn-integrity, yarn-error.log, .yarnrc.yml, .yarnrc.yaml | — | — |
| android | apk, smali, dex | androidmanifest.xml | — | — |
| tune | env | .env.defaults, .env.example, .env.sample, .env.template, .env.schema, .env.local, .env.dev, .env.development, .env.alpha, .env.e2e, .env.qa, .env.dist, .env.prod, .env.production, .env.prod.example, .env.production.example, .env.stg, .env.stage, .env.staging, .env.preview, .env.test, .env.testing, .env.dev.local, .env.development.local, .env.qa.local, .env.prod.local, .env.production.local, .env.stg.local, .env.staging.local, .env.test.local, .env.uat, .vars, .dev.vars | — | — |
| turborepo | — | turbo.json, turbo.jsonc | light | — |
| babel | — | babel-transform.js | — | — |
| blitz | — | blitz.config.js, blitz.config.ts, .blitz.config.compiled.js | — | — |
| contributing | — | contributing.md, contributing.rst, contributing.txt, contributing | — | — |
| readme | — | readme.md, readme.rst, readme.txt, readme | — | — |
| changelog | — | changelog, changelog.md, changelog.rst, changelog.txt, changes, changes.md, changes.rst, changes.txt | — | — |
| architecture | — | architecture.md, architecture.rst, architecture.txt, architecture | — | — |
| credits | — | credits.md, credits.rst, credits.txt, credits | — | — |
| authors | — | authors.md, authors.rst, authors.txt, authors, contributors.md, contributors.rst, contributors.txt, contributors | — | — |
| flow | — | .flowconfig | — | — |
| favicon | — | favicon.ico | — | — |
| karma | — | karma.conf.js, karma.conf.ts, karma.conf.coffee, karma.config.js, karma.config.ts, karma-main.js, karma-main.ts | — | — |
| bithound | — | .bithoundrc | — | — |
| svgo | — | svgo.config.js, svgo.config.cjs, svgo.config.mjs | — | — |
| appveyor | — | .appveyor.yml, appveyor.yml | — | — |
| travis | — | .travis.yml | — | — |
| codecov | — | .codecov.yml, codecov.yml, .codecov.yaml, codecov.yaml | — | — |
| sonarcloud | — | sonar-project.properties, .sonarcloud.properties, sonarcloud.yaml, SonarQube.Analysis.xml | — | — |
| protractor | — | protractor.conf.js, protractor.conf.ts, protractor.conf.coffee, protractor.config.js, protractor.config.ts | — | — |
| fusebox | — | fuse.js | — | — |
| heroku | — | procfile, procfile.windows | — | — |
| editorconfig | — | .editorconfig, .editorconfig-checker.json, .ecrc | — | — |
| gitlab | gitlab-ci.yml | — | — | — |
| bower | — | .bowerrc, bower.json | — | — |
| eslint | — | .eslintrc-md.js, .eslintrc-jsdoc.js, .eslintrc.base.json, .eslintignore, .eslintcache, eslint-options.js | — | — |
| conduct | — | code_of_conduct.md, code_of_conduct.txt, code_of_conduct | — | — |
| watchman | — | .watchmanconfig | — | — |
| aurelia | — | aurelia.json | — | — |
| auto | — | .autorc, auto.config.js, auto.config.ts, auto-config.json, auto-config.yaml, auto-config.yml, auto-config.ts, auto-config.js | light | — |
| mocha | — | mocha.opts, .mocharc.yml, .mocharc.yaml, .mocharc.js, .mocharc.cjs, .mocharc.json, .mocharc.jsonc | — | — |
| jenkins | jenkinsfile, jenkins | jenkinsfile | — | — |
| firebase | — | firebase.config.js, firebase.json, .firebaserc, firestore.rules, firestore.indexes.json | — | — |
| figma | fig | — | — | — |
| rollup | — | rollup.config.js, rollup.config.mjs, rollup.config.ts, rollup-config.js, rollup-config.mjs, rollup-config.ts, rollup.config.common.js, rollup.config.common.mjs, rollup.config.common.ts, rollup.config.base.js, rollup.config.base.mjs, rollup.config.base.ts, rollup.config.prod.js, rollup.config.prod.mjs, rollup.config.prod.ts, rollup.config.dev.js, rollup.config.dev.mjs, rollup.config.dev.ts, rollup.config.prod.vendor.js, rollup.config.prod.vendor.mjs, rollup.config.prod.vendor.ts | — | — |
| hack | — | .hhconfig | — | — |
| huff | huff | — | light | — |
| hardhat | — | hardhat.config.js, hardhat.config.ts | — | — |
| stylelint | — | .stylelintignore, .stylelintcache | light | — |
| code-climate | — | .codeclimate.yml | light | — |
| prettier | — | .prettierignore | — | — |
| renovate | — | .renovaterc, .renovaterc.json, renovate-config.json, renovate.json, renovate.json5 | — | — |
| apollo | — | apollo.config.js | — | — |
| nodemon | — | nodemon.json, nodemon-debug.json | — | — |
| ngrx-reducer | reducer.ts, rootReducer.ts | — | — | Solo packs |
| ngrx-state | state.ts | — | — | Solo packs |
| ngrx-actions | actions.ts | — | — | Solo packs |
| ngrx-effects | effects.ts | — | — | Solo packs |
| ngrx-entity | — | .entity | — | Solo packs |
| ngrx-selectors | selectors.ts | — | — | Solo packs |
| webhint | — | .hintrc | — | — |
| browserlist | — | browserslist, .browserslistrc | light | — |
| crystal | cr, ecr | — | light | — |
| snyk | — | .snyk | — | — |
| drone | drone.yml | .drone.yml | light | — |
| cuda | cu, cuh | — | — | — |
| opencode | — | opencode.json, opencode.jsonc | light | — |
| log | log | — | — | — |
| dotjs | def, dot, jst | — | — | — |
| ejs | ejs | — | — | — |
| sequelize | — | .sequelizerc | — | — |
| gatsby | — | gatsby-config.js, gatsby-config.mjs, gatsby-config.ts, gatsby-node.js, gatsby-node.mjs, gatsby-node.ts, gatsby-browser.js, gatsby-browser.tsx, gatsby-ssr.js, gatsby-ssr.tsx | — | — |
| wakatime | .wakatime-project | .wakatime-project | light | — |
| circleci | — | circle.yml | light | — |
| cloudfoundry | — | .cfignore | — | — |
| grunt | — | gruntfile.js, gruntfile.ts, gruntfile.cjs, gruntfile.cts, gruntfile.coffee, gruntfile.babel.js, gruntfile.babel.ts, gruntfile.babel.coffee | — | — |
| jest | — | jest.config.js, jest.config.cjs, jest.config.mjs, jest.config.ts, jest.config.cts, jest.config.mts, jest.config.json, jest.e2e.config.js, jest.e2e.config.cjs, jest.e2e.config.mjs, jest.e2e.config.ts, jest.e2e.config.cts, jest.e2e.config.mts, jest.e2e.config.json, jest.e2e.json, jest-unit.config.js, jest-e2e.config.js, jest-e2e.config.cjs, jest-e2e.config.mjs, jest-e2e.config.ts, jest-e2e.config.cts, jest-e2e.config.mts, jest-e2e.config.json, jest-e2e.json, jest-github-actions-reporter.js, jest.setup.js, jest.setup.ts, jest.json, .jestrc, .jestrc.js, .jestrc.json, jest.teardown.js, jest-preset.json, jest-preset.js, jest-preset.cjs, jest-preset.mjs, jest.preset.js, jest.preset.mjs, jest.preset.cjs, jest.preset.json | — | — |
| processing | pde | — | — | — |
| storybook | stories.js, stories.jsx, stories.mdx, story.js, story.jsx, stories.ts, stories.tsx, story.ts, story.tsx, stories.svelte, story.mdx, stories.vue | — | — | — |
| wepy | wpy | — | — | — |
| fastlane | — | fastfile, appfile | — | — |
| hcl | hcl | — | light | — |
| helm | — | .helmignore | — | — |
| san | san | — | — | — |
| quokka | quokka.js, quokka.ts, quokka.jsx, quokka.tsx | — | — | — |
| wallaby | — | wallaby.js, wallaby.conf.js | — | — |
| django | djt | — | — | — |
| stencil | — | stencil.config.js, stencil.config.ts | — | — |
| red | red | — | — | — |
| makefile | mk | makefile, gnumakefile, kbuild | — | — |
| foxpro | fxp, prg | — | — | — |
| i18n | pot, po, mo, lang, xlf | — | — | — |
| webassembly | wat, wasm | — | — | — |
| semantic-release | — | — | light | — |
| bitbucket | — | bitbucket-pipelines.yaml, bitbucket-pipelines.yml | — | — |
| jupyter | ipynb | — | — | — |
| d | d | — | — | — |
| mdx | mdx | — | — | — |
| mdsvex | svx | — | — | — |
| ballerina | bal, balx | — | — | — |
| racket | rkt | — | — | — |
| bazel | bzl, bazel | .bazelignore, .bazelrc, .bazelversion | — | — |
| mint | mint | — | — | — |
| velocity | vm, fhtml, vtl | — | — | — |
| godot | gd | — | — | — |
| godot-assets | godot, tres, tscn, gdns, gdnlib, gdshader, gdshaderinc, gdextension | .gdignore, ._sc_, _sc_ | — | — |
| azure-pipelines | azure-pipelines.yml, azure-pipelines.yaml, azure-pipelines-main.yml, azure-pipelines-main.yaml | azure-pipelines.yml, azure-pipelines.yaml, azure-pipelines-main.yml, azure-pipelines-main.yaml | — | — |
| azure | azcli | — | — | — |
| vagrant | vagrantfile | vagrantfile | — | — |
| prisma | prisma | prisma.yml, prisma.config.ts | — | — |
| razor | cshtml, vbhtml, razor | — | — | — |
| abc | abc | — | — | — |
| asciidoc | ad, adoc, asciidoc | — | — | — |
| istanbul | — | .nycrc, .nycrc.json, .nycrc.yaml, .nycrc.yml, nyc.config.js, nyc.config.cjs, .istanbul.yml | — | — |
| edge | edge | — | — | — |
| scheme | ss, scm | — | — | — |
| lisp | lisp, lsp, cl, fast | — | — | — |
| tailwindcss | — | tailwind.js, tailwind.ts, tailwind.config.js, tailwind.config.cjs, tailwind.config.mjs, tailwind.config.ts, tailwind.config.cts, tailwind.config.mts | — | — |
| 3d | stl, stp, step, ste, obj, o, ac, dwg, dxf, fbx, mesh, 3dm, 3mf, catpart, catproduct, f3d, iam, ige, iges, igs, ipt, jt, mqo, pmd, pmx, prt, sab, sat, skp, sldasm, slddrw, sldprt, smb, smt, vac, vdp, vox, gltf, glb, 3ds, dae, ply, wrl, usd, usdz, wire, x_b, x_t, 123dx | — | — | — |
| buildkite | — | buildkite.yml, buildkite.yaml | — | — |
| netlify | — | netlify.json, netlify.yml, netlify.yaml, netlify.toml | light | — |
| svg | svg | — | — | — |
| adobe-illustrator | ai, ait | — | light | — |
| adobe-photoshop | psd, psb, psdt | — | light | — |
| svelte | svelte | — | — | — |
| svelte (clone → svelte_js) | svelte.js | — | — | — |
| svelte (clone → svelte_ts) | svelte.ts | — | — | — |
| vim | vimrc, gvimrc, exrc, vim, viminfo | — | — | — |
| nest | — | nest-cli.json, .nest-cli.json, nestconfig.json, .nestconfig.json | — | — |
| nest (clone → nest-controller) | controller.ts, controller.js | — | — | Solo packs |
| nest (clone → nest-middleware) | middleware.ts, middleware.js | — | — | Solo packs |
| nest (clone → nest-module) | module.ts, module.js | — | — | Solo packs |
| nest (clone → nest-service) | service.ts, service.js | — | — | Solo packs |
| nest (clone → nest-decorator) | decorator.ts, decorator.js | — | — | Solo packs |
| nest (clone → nest-pipe) | pipe.ts, pipe.js | — | — | Solo packs |
| nest (clone → nest-filter) | filter.ts, filter.js | — | — | Solo packs |
| nest (clone → nest-gateway) | gateway.ts, gateway.js | — | — | Solo packs |
| nest (clone → nest-guard) | guard.ts, guard.js | — | — | Solo packs |
| nest (clone → nest-resolver) | resolver.ts, resolver.js | — | — | Solo packs |
| nest (clone → nest-interceptor) | interceptor.ts, interceptor.js | — | — | Solo packs |
| moon | — | moon.yml | — | — |
| moonscript | moon | — | — | — |
| percy | — | .percy.yml | — | — |
| gitpod | — | .gitpod.yml | — | — |
| stackblitz | — | .stackblitzrc | — | — |
| advpl | prw, prx | — | — | — |
| advpl (clone → advpl-ptm) | ptm | — | — | — |
| advpl (clone → advpl-tlpp) | tlpp | — | — | — |
| advpl (clone → advpl-include) | ch | — | — | — |
| codeowners | — | codeowners, OWNERS | — | — |
| gcp | — | .gcloudignore | — | — |
| amplify | — | amplify.yml | — | — |
| disc | iso, vmdk, hdd, qcow, qcow2, qed, dmg | — | — | — |
| fortran | f, f77, f90, f95, f03, f08 | — | — | — |
| tcl | tcl, do | — | — | — |
| liquid | liquid | — | — | — |
| prolog | p, pro, pl | — | — | — |
| husky | — | — | — | — |
| coconut | coco | — | — | — |
| tilt | — | tiltfile | — | — |
| capacitor | — | capacitor.config.json, capacitor.config.ts | — | — |
| sketch | sketch | — | — | — |
| pawn | pwn, amx | — | — | — |
| adonis | — | .adonisrc.json, ace | — | — |
| forth | 4th, fth, frt | — | — | — |
| uml | iuml, pu, puml, plantuml, wsd | — | light | — |
| meson | wrap | meson.build, meson_options.txt, meson.options | — | — |
| commitizen | — | .czrc, .cz.json, .cz.toml, .cz.yaml, .cz.yml, cz.json, cz.toml, cz.yaml, cz.yml | — | — |
| commitlint | — | .commitlint.yaml, .commitlint.yml | — | — |
| buck | — | .buckconfig | — | — |
| dhall | dhall, dhallb | — | — | — |
| sml | sml, mlton, mlb, sig, fun, cm, lex, use, grm | — | — | — |
| nx | — | nx.json, .nxignore | — | — |
| opam | opam | — | — | — |
| dune | — | dune, dune-project, dune-workspace, dune-workspace.dev | — | — |
| imba | imba | — | — | — |
| drawio | drawio, dio | — | — | — |
| pascal | pas | — | — | — |
| unity | unity, unitypackage | — | — | — |
| roadmap | — | roadmap.md, roadmap.txt, timeline.md, timeline.txt, milestones.md, milestones.txt | — | — |
| sas | sas, sas7bdat, sashdat, astore, ast, sast | — | — | — |
| nuget | nupkg, nuspec | nuget.config, .nuspec, nuget.exe | — | — |
| command | command | — | — | — |
| stryker | — | stryker.conf.json, stryker.conf.js, stryker.conf.cjs, stryker.conf.mjs, .stryker.conf.json, .stryker.conf.js, .stryker.conf.cjs, .stryker.conf.mjs, stryker.config.json, stryker.config.js, stryker.config.mjs, stryker.config.cjs, .stryker.config.json, .stryker.config.js, .stryker.config.mjs, .stryker.config.cjs | — | — |
| denizenscript | dsc | — | — | — |
| modernizr | — | .modernizrrc, .modernizrrc.js, .modernizrrc.json | — | — |
| slug | — | .slugignore | — | — |
| search | code-search | — | — | — |
| stitches | — | stitches.config.js, stitches.config.ts | light | — |
| nginx | nginx, nginxconf, nginxconfig | nginx.conf | — | — |
| minecraft | mcfunction, mcmeta, mcr, mca, mcgame, mclevel, mcworld, mine, mus, mcstructure, mcpack, mcaddon, mctemplate, mcproject | .mcattributes, .mcdefinitions, .mcignore | — | — |
| replit | — | .replit | — | — |
| rescript | res | — | — | — |
| rescript-interface | resi | — | — | — |
| duc | duc | duc.fbs | — | — |
| snowpack | — | snowpack.config.js, snowpack.config.cjs, snowpack.config.mjs, snowpack.config.ts, snowpack.config.cts, snowpack.config.mts, snowpack.deps.json, snowpack.config.json | light | — |
| brainfuck | b, bf | — | — | — |
| bicep | bicep | — | — | — |
| cobol | cob, cbl | — | — | — |
| grain | gr | — | — | — |
| lolcode | lol | — | — | — |
| idris | idr, ibc | — | — | — |
| quasar | — | quasar.conf.js, quasar.config.js, quasar.conf.ts, quasar.config.ts, quasar.config.cjs | — | — |
| dependabot | — | dependabot.yml, dependabot.yaml | — | — |
| pipeline | pipeline | — | — | — |
| vite | — | — | — | — |
| vitest | — | — | — | — |
| velite | — | — | — | — |
| rolldown | — | — | — | — |
| opa | rego | — | — | — |
| lerna | — | lerna.json | — | — |
| windicss | windi | windi.config.js, windi.config.cjs, windi.config.ts, windi.config.cts, windi.config.json | — | — |
| textlint | — | .textlintrc, .textlintrc.js, .textlintrc.cjs, .textlintrc.json, .textlintrc.yml, .textlintrc.yaml, .textlintignore | — | — |
| scala | scala, sc | — | — | — |
| lilypond | ly | — | — | — |
| vlang | v | vpkg.json, v.mod | — | — |
| chess | pgn, fen | — | light | — |
| gemini | gmi, gemini | — | — | — |
| sentry | — | .sentryclirc, .env.sentry-build-plugin | — | — |
| contentlayer | — | — | — | — |
| php | php, php4, php5, phtml, ctp | — | — | — |
| phpunit | — | .phpunit.result.cache, .phpunit-watcher.yml, phpunit.xml, phpunit.xml.dist, phpunit-watcher.yml, phpunit-watcher.yml.dist | — | — |
| php-cs-fixer | — | .php_cs, .php_cs.dist, .php_cs.php, .php_cs.dist.php, .php-cs-fixer.php, .php-cs-fixer.dist.php | — | — |
| robots | — | robots.txt | — | — |
| tsconfig | tsconfig.json | tsconfig.json, tsconfig.app.json, tsconfig.editor.json, tsconfig.spec.json, tsconfig.base.json, tsconfig.build.json, tsconfig.eslint.json, tsconfig.lib.json, tsconfig.lib.prod.json, tsconfig.node.json, tsconfig.test.json, tsconfig.e2e.json, tsconfig.web.json, tsconfig.webworker.json, tsconfig.worker.json, tsconfig.config.json, tsconfig.vitest.json, tsconfig.cjs.json, tsconfig.esm.json, tsconfig.mjs.json, tsconfig.doc.json, tsconfig.paths.json, tsconfig.main.json, tsconfig.renderer.json, tsconfig.server.json, tsconfig.client.json, tsconfig.declaration.json | — | — |
| tauri | tauri | tauri.conf.json, tauri.config.json, tauri.linux.conf.json, tauri.windows.conf.json, tauri.macos.conf.json, .taurignore | — | — |
| jsconfig | jsconfig.json | jsconfig.json | — | — |
| maven | — | maven.config, jvm.config, pom.xml | — | — |
| ada | ada, adb, ads, ali | — | — | — |
| serverless | — | serverless.yml, serverless.yaml, serverless.json, serverless.js, serverless.ts | — | — |
| supabase | — | supabase.js, supabase.ts, supabase.py | — | — |
| ember | — | .ember-cli, .ember-cli.js, ember-cli-builds.js | — | — |
| horusec | horusec-config.json | horusec-config.json | — | — |
| poetry | — | poetry.lock | — | — |
| pdm | pdm.lock, pdm.toml | pdm.lock, pdm.toml, .pdm-python | — | — |
| coala | coarc, coafile | — | — | — |
| parcel | — | .parcelrc | — | — |
| dinophp | bubble, html.bubble, php.bubble | — | — | — |
| teal | tl | — | — | — |
| template | template | — | — | — |
| astyle | — | .astylerc | — | — |
| shader | glsl, vert, tesc, tese, geom, frag, comp, rgen, rint, rahit, rchit, rmiss, rcall, vert.glsl, tesc.glsl, tese.glsl, geom.glsl, frag.glsl, comp.glsl, rgen.glsl, rint.glsl, rahit.glsl, rchit.glsl, rmiss.glsl, rcall.glsl, vertex.glsl, geometry.glsl, fragment.glsl, compute.glsl, ts.glsl, gs.glsl, vs.glsl, fs.glsl, shader, vertexshader, fragmentshader, geometryshader, computeshader, hlsl, pixel.hlsl, geometry.hlsl, compute.hlsl, tessellation.hlsl, px.hlsl, geom.hlsl, comp.hlsl, tess.hlsl, wgsl, spv, slang, cginc, compute, fx, fxh, hlsli, psh, vsh | — | — | — |
| lighthouse | — | .lighthouserc.js, lighthouserc.js, .lighthouserc.cjs, lighthouserc.cjs, .lighthouserc.json, lighthouserc.json, .lighthouserc.yml, lighthouserc.yml, .lighthouserc.yaml, lighthouserc.yaml | — | — |
| svgr | — | — | — | — |
| rome | — | rome.json | — | — |
| cypress | — | cypress.json, cypress.env.json | — | — |
| siyuan | sy | — | — | — |
| ndst | ndst.yml, ndst.yaml, ndst.json | — | — | — |
| plop | — | plopfile.js, plopfile.cjs, plopfile.mjs, plopfile.ts | — | — |
| tobi | tobi | — | — | — |
| tobimake | — | .tobimake | — | — |
| gleam | gleam | gleam.toml | — | — |
| pnpm | — | pnpm-lock.yaml, pnpm-workspace.yaml, .pnpmfile.cjs | light | — |
| gridsome | — | gridsome.config.js, gridsome.server.js | — | — |
| steadybit | steadybit.yml, steadybit.yaml | .steadybit.yml, steadybit.yml, .steadybit.yaml, steadybit.yaml | — | — |
| capnp | capnp | — | — | — |
| tree | tree | — | — | — |
| cadence | cdc | — | — | — |
| caddy | — | Caddyfile | — | — |
| openapi | openapi.json, openapi.yml, openapi.yaml | openapi.json, openapi.yml, openapi.yaml | light | — |
| swagger | swagger.json, swagger.yml, swagger.yaml | swagger.json, swagger.yml, swagger.yaml | — | — |
| bun | — | bun.lockb, bunfig.toml, .bun-version, bun.lock | light | — |
| antlr | g4 | — | — | — |
| stylable | st.css | — | — | — |
| pinejs | pine | — | — | — |
| nano-staged | — | .nano-staged.js, nano-staged.js, .nano-staged.cjs, nano-staged.cjs, .nano-staged.mjs, nano-staged.mjs, .nano-staged.json, nano-staged.json, .nanostagedrc | light | — |
| knip | — | knip.json, knip.jsonc, .knip.json, .knip.jsonc, knip.ts, knip.js, knip.config.ts, knip.config.js | — | — |
| taskfile | taskfile.yml, taskfile.yaml | taskfile.yml, taskfile.yaml, taskfile.dist.yml, taskfile.dist.yaml, .taskrc.yml, .taskrc.yaml | — | — |
| craco | — | — | — | — |
| gamemaker | gml, yy, yyp, yyz | — | — | — |
| tldraw | tldr | — | light | — |
| mercurial | — | .hg, .hgignore, .hgflow, .hgtags, .hgrc, hgrc, mercurial.ini | — | — |
| deno | — | deno.json, deno.jsonc, deno.lock | light | — |
| plastic | — | plastic.branchexplorer, plastic.selector, plastic.wktree, plastic.workspace, plastic.workspaces | — | — |
| typst | typ | typst.toml | — | — |
| unocss | — | uno.config.js, uno.config.mjs, uno.config.ts, uno.config.mts, unocss.config.js, unocss.config.mjs, unocss.config.ts, unocss.config.mts | — | — |
| ifanr-cloud | — | .mincloudrc, .qa-mincloudrc | — | — |
| concourse | — | concourse.yml | — | — |
| qwik | tsx | — | — | Solo packs |
| mermaid | mmd, mermaid | — | — | — |
| syncpack | — | — | — | — |
| mojo | mojo, 🔥 | — | — | — |
| werf | — | werf.yaml, werf.yml, werf-giterminism.yaml, werf-giterminism.yml, werf-includes.lock, werf-includes.yaml, werf-includes.yml | — | — |
| roblox | rbxl, rbxlx, rbxm, rbxmx | — | — | — |
| luau | luau | .luaurc | — | — |
| rojo | project.json, model.json, meta.json | — | — | Solo packs |
| wally | — | wally.toml | — | — |
| rbxmk | rbxmk.lua, rbxmk.luau | — | — | — |
| panda | — | — | — | — |
| biome | — | biome.json, biome.jsonc, .biome.json, .biome.jsonc | — | — |
| esbuild | — | — | — | — |
| spwn | spwn | — | — | — |
| templ | templ | — | — | — |
| chrome | crx | — | — | — |
| stan | stan | — | — | — |
| abap | abap, acds, asddls | — | — | — |
| drizzle | — | drizzle.config.ts, drizzle.config.dev.ts, drizzle.config.prod.ts, drizzle.config.js, drizzle.config.dev.js, drizzle.config.prod.js, drizzle.config.json, drizzle.config.dev.json, drizzle.config.prod.json | — | — |
| lottie | lottie | — | — | — |
| puppeteer | — | — | — | — |
| apps-script | gs | — | — | — |
| garden | garden.yml, garden.yaml | garden.yml, garden.yaml, project.garden.yml, project.garden.yaml, .gardenignore | — | — |
| pkl | pkl | PklProject, PklProject.deps.json | — | — |
| kubernetes | — | k8s.yml, k8s.yaml, kubernetes.yml, kubernetes.yaml, .k8s.yml, .k8s.yaml | — | — |
| phpstan | — | phpstan.neon, phpstan.neon.dist, phpstan.dist.neon | — | — |
| screwdriver | — | screwdriver.yaml, screwdriver.yml | — | — |
| snapcraft | — | snapcraft.yaml, snapcraft.yml | — | — |
| 3d (clone → container) | — | .devcontainer/devcontainer.json, .devcontainer/devcontainer-lock.json | — | — |
| kcl | k | kcl.mod, kcl.yaml, kcl.yml | — | — |
| verified | sigstore.json | — | — | — |
| bruno | bru | — | — | — |
| cairo | cairo | — | — | — |
| grafana-alloy | alloy | — | — | — |
| clangd | — | .clangd | — | — |
| freemarker | ftl | — | — | — |
| markdownlint | — | .markdownlint.json, .markdownlint.jsonc, .markdownlint.yaml, .markdownlint.yml, .markdownlint-cli2.jsonc, .markdownlint-cli2.yaml, .markdownlint-cli2.cjs, .markdownlint-cli2.mjs, .markdownlintignore | — | — |
| tsil | ц | — | — | — |
| trigger | — | — | — | — |
| deepsource | — | .deepsource.toml | — | — |
| video (clone → tape) | tape | — | — | — |
| hurl | hurl | — | — | — |
| cds | cds | — | — | — |
| slint | slint, 60 | — | — | — |
| jsr | — | jsr.json, jsr.jsonc | light | — |
| coderabbit-ai | — | .coderabbit.yml, .coderabbit.yaml | — | — |
| gemini-ai | — | .aiexclude, GEMINI.md | — | — |
| taze | — | .tazerc, .tazerc.json | — | — |
| wxt | — | — | — | — |
| verse | verse | — | light | — |
| sway | sw | — | — | — |
| lefthook | — | .lefthook-local.json, .lefthook-local.toml, .lefthook-local.yaml, .lefthook-local.yml, .lefthook.json, .lefthook.toml, .lefthook.yaml, .lefthook.yml, .lefthookrc, lefthook-local.json, lefthook-local.toml, lefthook-local.yaml, lefthook-local.yml, lefthook.json, lefthook.toml, lefthook.yaml, lefthook.yml, lefthookrc | — | — |
| label | — | .github/labeler.yml, .github/labeler.yaml, tags | — | — |
| zeabur | zeabur | — | light | — |
| copilot | — | copilot-instructions.md, .copilotignore | light | — |
| bench-ts | bench.ts, bench.cts, bench.mts | — | — | — |
| bench-jsx | bench.jsx, bench.tsx | — | — | — |
| bench-js | bench.js, bench.cjs, bench.mjs | — | — | — |
| pre-commit | — | .pre-commit-config.yaml, .pre-commit-hooks.yaml | — | — |
| controller | controller.js, controller.ts | — | — | Solo packs |
| dependencies-update | .ncurc.json, .ncurc.yml, .ncurc.js | — | — | — |
| lintstaged | — | .lintstagedrc, .lintstagedrc.json, .lintstagedrc.yaml, .lintstagedrc.yml, .lintstagedrc.mjs, .lintstagedrc.cjs, lint-staged.config.ts, lint-staged.config.mjs, lint-staged.config.cjs, lint-staged.config.js, .lintstagedrc.js | — | — |
| histoire | — | — | — | — |
| installation | — | install, installation | — | — |
| github-sponsors | — | .github/FUNDING.yml | — | — |
| minecraft-fabric | — | fabric.mod.json | — | — |
| umi | — | — | — | — |
| pm2-ecosystem | — | — | — | — |
| hosts | — | hosts | light | — |
| citation | — | citation.cff | — | — |
| xmake | — | xmake.lua, xmake | — | — |
| subtitles | srt, ssa, ttml, sbv, dfxp, vtt, sub, ass | — | — | — |
| beancount | beancount, bean | — | — | — |
| wrangler | — | wrangler.toml, wrangler.json, wrangler.jsonc | — | — |
| epub | epub | — | — | — |
| regedit | reg | — | — | — |
| cline | — | .clinerules | — | — |
| gnuplot | gnu | — | — | — |
| packship | — | .packshiprc, .packshiprc.json, .packshiprc.js, .packshiprc.ts, packship.config.js, packship.config.ts, packship.config.mjs, packship.config.mts, packship.config.json | — | — |
| snakemake | smk, snakemake | Snakefile | — | — |
| hadolint | — | — | — | — |
| coloredpetrinets | cpn, pnml | — | — | — |
| pytorch | pt, pth, pwf | — | — | — |
| blender | blend, blend1, blend2 | — | — | — |
| tsdoc | — | tsdoc.json | — | — |
| oxc | — | .oxlintrc.json, .oxlintrc.jsonc, .oxfmtrc.json, .oxfmtrc.jsonc, oxlint.config.ts, oxfmt.config.ts | — | — |
| vanilla-extract | css.ts, css.js, css.cjs, css.mjs, css.tsx, css.jsx | — | — | — |
| claude | — | CLAUDE.md, CLAUDE.local.md | — | — |
| cursor | — | .cursorignore, .cursorindexingignore, .cursorrules, .cursor, .cursor.json, .cursorrc | light | — |
| metro | — | metro.config.js, metro.config.cjs, metro.config.mjs, metro.config.json, metro.config.ts, metro.config.cts, metro.config.mts | — | — |
| bashly | — | — | — | — |
| bashly (clone → bashly-settings) | — | — | light | — |
| bashly (clone → bashly-settings) | — | — | light | Solo packs |
| bashly-hook | — | src/initialize.sh, src/before.sh, src/after.sh | — | Solo packs |
| bashly-hook (clone → bashly-strings) | — | — | light | — |
| google | — | google-services.json, GoogleService-Info.plist | — | — |
| toc | toc | — | — | — |
| shellcheck | — | — | light | — |
| cue | cue | — | — | — |
| lean | lean | — | — | — |
| salt | sls | — | — | — |
| warp | — | warp.md | light | — |
| macaulay2 | m2 | — | — | — |
| uiua | ua | — | — | — |
| skill | skill.md, skills.md | skill.md | — | — |
| lib (clone → instructions) | instructions.md, instruction.md | instructions.md, instruction.md | — | — |
| tsdown | — | tsdown.config.ts, tsdown.config.mts, tsdown.config.cts, tsdown.config.js, tsdown.config.mjs, tsdown.config.cjs, tsdown.config.json, tsdown.config | — | — |
| appwrite | — | appwrite.json, appwrite.js, appwrite.ts | — | — |
| expo | — | eas.json, .easignore | light | — |
| agent | — | agents.md | — | — |
| mrpack | mrpack | — | — | — |

> `—` en Extensiones/Nombres = sin match por defecto (solo por patrón/scripts o config manual).
> Los iconos con nombres de archivo son los que matchean dotfiles y archivos de config (p.ej. `.gitignore`, `package.json`, `next.config.ts`).
