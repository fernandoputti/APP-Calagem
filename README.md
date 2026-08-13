# CalTEC-Calagem — Módulo IAC

Software para cálculo da necessidade de calagem (NC) em solos agrícolas
pelo método da Saturação por Bases (V%), conforme o Boletim Técnico 100
do Instituto Agronômico de Campinas (IAC).

**Titular:** Fernando Ferrari Putti — Universidade Estadual Paulista (UNESP)
**Coautoria:** Jéssica Pigatto de Queiroz Barcelos — Universidade do Oeste Paulista (UNOESTE)

Documentação completa (manual de instalação/uso e memorial descritivo)
em [`Documentacao/`](Documentacao/).

**Versão web ao vivo:** https://fernandoputti.github.io/APP-Calagem/

## Estrutura

```
index.html, app.js, style.css    versão web (PWA), servida a partir da raiz do repositório
manifest.json, service-worker.js  configuração do PWA (instalável, funciona offline)
assets/, icons/                    logos institucionais e ícones do PWA
desktop/calagem_calc.py            lógica de cálculo (Python) - sem dependência de interface
desktop/calagem_app.py             interface gráfica desktop (Tkinter)
desktop/assets/                    cópia dos logos, usada no empacotamento do .exe
Documentacao/                      Manual de Instalação e Uso + Memorial Descritivo (INPI)
```

A raiz do repositório é dedicada à versão web para que o GitHub Pages
sirva o aplicativo diretamente (Settings → Pages → Deploy from branch
→ main / root). O código desktop fica isolado em `desktop/` com sua
própria cópia dos logos.

## Rodar a versão desktop a partir do código-fonte

```bash
cd desktop
pip install pillow
python calagem_app.py
```

## Gerar o executável Windows (.exe)

```bash
cd desktop
pip install pillow pyinstaller
pyinstaller --onefile --windowed --name CalculadoraCalagem_IAC --add-data "assets;assets" calagem_app.py
```

O executável é gerado em `desktop/dist/CalculadoraCalagem_IAC.exe`.

## Versão web

A raiz do repositório já é o aplicativo web (PWA) — publicada via
GitHub Pages em https://fernandoputti.github.io/APP-Calagem/.
Funciona offline após o primeiro acesso.

## Fórmula implementada

```
NC (t/ha) = CTC(cmolc/dm³) × (V2 − V1) / PRNT
```

Conversão automática se a CTC for informada em mmolc/dm³ (padrão comum
em laudos de laboratório IAC/SP).

## Referência bibliográfica

RAIJ, B. van; CANTARELLA, H.; QUAGGIO, J. A.; FURLANI, A. M. C.
Recomendações de adubação e calagem para o estado de São Paulo. 2. ed.
Campinas: Instituto Agronômico (IAC), 1996. (Boletim Técnico, 100).
