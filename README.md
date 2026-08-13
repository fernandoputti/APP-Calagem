# CalTEC-Calagem — Módulo IAC

Software para cálculo da necessidade de calagem (NC) em solos agrícolas
pelo método da Saturação por Bases (V%), conforme o Boletim Técnico 100
do Instituto Agronômico de Campinas (IAC).

**Titular:** Fernando Ferrari Putti — Universidade Estadual Paulista (UNESP)
**Coautoria:** Jéssica Pigatto de Queiroz Barcelos — Universidade do Oeste Paulista (UNOESTE)

Documentação completa (manual de instalação/uso e memorial descritivo)
em [`Documentacao/`](Documentacao/).

## Estrutura

```
calagem_calc.py      lógica de cálculo (desktop, Python) - sem dependência de interface
calagem_app.py        interface gráfica desktop (Tkinter)
assets/                logos institucionais
webapp/                versão web (PWA): index.html, app.js, style.css, manifest.json
Documentacao/           Manual de Instalação e Uso + Memorial Descritivo (INPI)
```

## Rodar a partir do código-fonte

```bash
pip install pillow
python calagem_app.py
```

## Gerar o executável Windows (.exe)

```bash
pip install pillow pyinstaller
pyinstaller --onefile --windowed --name CalculadoraCalagem_IAC --add-data "assets;assets" calagem_app.py
```

O executável é gerado em `dist/CalculadoraCalagem_IAC.exe`.

## Versão web

Basta servir o conteúdo da pasta `webapp/` por qualquer servidor HTTP
estático (ex.: GitHub Pages) — é um aplicativo web progressivo (PWA),
funciona offline após o primeiro acesso.

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
