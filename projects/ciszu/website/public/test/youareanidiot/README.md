# public/test/youareanidiot — Assets de audio del "test funny"

Esta carpeta está lista para colocar **audio real** si se prefiere en vez del
audio sintético (Web Audio API) que la página genera por defecto.

## Archivos opcionales

| Archivo | Uso |
|---|---|
| `circus.mp3` | Música de circo (melodía "calliope") |
| `laugh.mp3`  | Risas |

La página actual (`/youareanidiot`) usa Web Audio API para sintetizar ambos sonidos
y no depende de estos archivos. Si en el futuro se quieren audios reales, colocarlos
aquí y ajustar `page.tsx` para reproducirlos con `<audio>`.

> Documentado en `projects/ciszu/docs/documentation/TEST_FUNNY.md`.